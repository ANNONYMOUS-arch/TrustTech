import React, { useState } from 'react';
import { X, Send, Coins, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Project, User } from '../types';
import { store } from '../services/store';
import { 
  formatNgn, 
  calculateProjectFinancials, 
  checkProposalEligibility 
} from '../utils/marketplaceRules';

interface ApplyModalProps {
  project: Project;
  currentUser: User;
  availableCredits: number;
  existingApplications: Array<{ projectId: string; developerUid: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  project,
  currentUser,
  availableCredits,
  existingApplications,
  onClose,
  onSuccess,
}) => {
  const [proposedPrice, setProposedPrice] = useState<number>(project.budgetMinNgn);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [proposalMessage, setProposalMessage] = useState<string>('');
  const [portfolioLink, setPortfolioLink] = useState<string>('https://portfolio-showcase.dev');
  const [githubLink, setGithubLink] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Financial calculations live
  const financials = calculateProjectFinancials(proposedPrice);

  // Check eligibility
  const eligibility = checkProposalEligibility(
    availableCredits,
    existingApplications,
    project.id,
    currentUser.uid,
    currentUser.isVerifiedDeveloper ?? true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!eligibility.canApply) {
      setErrorMessage(eligibility.reason || 'You are not eligible to apply.');
      return;
    }

    if (!proposalMessage.trim() || proposalMessage.trim().length < 50) {
      setErrorMessage('Please write a detailed proposal message (minimum 50 characters) explaining your approach and relevant experience.');
      return;
    }

    if (!proposedPrice || proposedPrice <= 0) {
      setErrorMessage('Please enter a valid proposed price.');
      return;
    }

    if (!deliveryDays || deliveryDays <= 0) {
      setErrorMessage('Please enter estimated delivery days.');
      return;
    }

    setIsSubmitting(true);

    const devApplication = store.getState().developerApplications.find(a => a.uid === currentUser.uid);
    const developerSkills = devApplication?.skills || ['Frontend', 'UI Design'];
    const developerTitle = devApplication?.professionalTitle || 'Software Professional';

    const result = store.submitProposal({
      projectId: project.id,
      projectTitle: project.title,
      developerUid: currentUser.uid,
      developerName: currentUser.fullName,
      developerTitle,
      developerSkills,
      developerPortfolio: portfolioLink || 'https://github.com',
      developerGithub: githubLink || undefined,
      proposalMessage: proposalMessage.trim(),
      proposedPriceNgn: Number(proposedPrice),
      estimatedDeliveryDays: Number(deliveryDays),
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to submit proposal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 w-full max-w-2xl rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/60 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Submit Proposal
              </span>
              <span className="text-xs text-slate-400">
                Allowance: <strong className="text-white font-mono">{availableCredits} / 15 Credits Remaining</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold font-heading text-white mt-1">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Eligibility Notice if restricted */}
          {!eligibility.canApply && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Application Restricted</strong>
                <p className="mt-0.5">{eligibility.reason}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pricing & Net Calculation Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Proposed Price (₦ NGN)
              </label>
              <input
                type="number"
                min={50000}
                step={5000}
                value={proposedPrice}
                onChange={e => setProposedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Client Target: {formatNgn(project.budgetMinNgn)} – {formatNgn(project.budgetMaxNgn)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estimated Delivery (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={deliveryDays}
                onChange={e => setDeliveryDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Target Timeline: {project.estimatedDuration}
              </span>
            </div>
          </div>

          {/* Fee Transparency Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Transparent Payout Breakdown
            </span>
            <div className="flex justify-between text-slate-300">
              <span>Gross Quote:</span>
              <span className="font-mono">{formatNgn(financials.grossQuoteNgn)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>TrustTech Developer Commission (12%):</span>
              <span className="font-mono text-amber-400">-{formatNgn(financials.developerCommissionNgn)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold pt-2 border-t border-slate-800">
              <span className="text-teal-300">Your Net Payout (Upon Milestone Release):</span>
              <span className="font-mono text-teal-300">{formatNgn(financials.developerNetPayoutNgn)}</span>
            </div>
          </div>

          {/* Payment Safety Notice */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 leading-snug">
            <strong className="text-amber-300">Safety Notice: </strong>
            For your safety and protection, always keep communications and payments on TrustTech. Transactions completed outside TrustTech are not protected by our escrow system or customer support. Failure to comply may lead to account suspension.
          </div>

          {/* Proposal Cover Letter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Proposal Message / Technical Approach
              </label>
              <span className="text-slate-500">
                {proposalMessage.length} characters (min 50)
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="Detail how you will deliver this project, your experience with the required tech stack, and milestone timeline..."
              value={proposalMessage}
              onChange={e => setProposalMessage(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs leading-relaxed focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Relevant Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Relevant Portfolio / Case Study URL
              </label>
              <input
                type="url"
                value={portfolioLink}
                onChange={e => setPortfolioLink(e.target.value)}
                placeholder="https://yourportfolio.dev/case-study"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GitHub Repository (Optional)
              </label>
              <input
                type="url"
                value={githubLink}
                onChange={e => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Proposal Cost Notice */}
          <div className="flex items-center gap-2 p-3 bg-teal-500/5 rounded-xl border border-teal-500/20 text-xs text-teal-300">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Submitting this proposal will consume <strong>1 credit</strong> from your monthly allowance ({availableCredits} remaining).
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!eligibility.canApply || isSubmitting}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                eligibility.canApply && !isSubmitting
                  ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Proposal (1 Credit)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
