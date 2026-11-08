import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  ExternalLink, 
  Send,
  Scale,
  CreditCard,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { Project, User, Milestone } from '../types';
import { store } from '../services/store';
import { formatNgn, calculateProjectFinancials } from '../utils/marketplaceRules';

interface ProjectMilestonesModalProps {
  project: Project;
  currentUser: User;
  onClose: () => void;
  onOpenDisputeModal: (projectId: string, milestoneId: string, milestoneTitle: string) => void;
  onOpenCheckout?: (project: Project, milestone: Milestone) => void;
}

export const ProjectMilestonesModal: React.FC<ProjectMilestonesModalProps> = ({
  project,
  currentUser,
  onClose,
  onOpenDisputeModal,
  onOpenCheckout,
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(project.milestones[0]?.id || '');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const isClient = (currentUser.accountType === 'client' && project.ownerUid === currentUser.uid) || currentUser.accountType === 'admin';
  const isDeveloper = (currentUser.accountType === 'developer' && (!project.hiredDeveloperUid || project.hiredDeveloperUid === currentUser.uid)) || currentUser.accountType === 'admin';
  const isAdmin = currentUser.accountType === 'admin';

  const selectedMilestone = project.milestones.find(m => m.id === selectedMilestoneId) || project.milestones[0];
  const financials = selectedMilestone ? calculateProjectFinancials(selectedMilestone.amountNgn) : null;

  const handleFund = (milestoneId: string) => {
    const targetM = project.milestones.find(m => m.id === milestoneId);
    if (onOpenCheckout && targetM) {
      onOpenCheckout(project, targetM);
    } else {
      store.fundMilestone(project.id, milestoneId);
    }
  };

  const handleDeliverableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim()) return;
    store.submitMilestoneDeliverable(project.id, selectedMilestoneId, deliverableUrl.trim(), deliverableNotes.trim());
    setShowSubmitModal(false);
    setDeliverableUrl('');
    setDeliverableNotes('');
  };

  const handleRelease = (milestoneId: string) => {
    store.releaseMilestone(project.id, milestoneId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 w-full max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/60 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                100% Reconciled Milestones
              </span>
              <span className="text-xs text-slate-400">
                Project Status: <strong className="text-white capitalize">{project.status.replace('_', ' ')}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white mt-1">
              {project.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Client: {project.ownerCompany || project.ownerName} &bull; Escrow Protected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning Banner */}
        <div className="px-6 py-2.5 bg-amber-950/40 border-b border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="text-amber-300">Payment Safety Warning: </strong>
            For your safety and protection, always keep communications and payments on TrustTech. Transactions completed outside TrustTech are not protected by our escrow system or customer support. Failure to comply may lead to account suspension.
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Milestones Column */}
          <div className="md:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Contract Milestones ({project.milestones.length})
            </span>

            <div className="space-y-2">
              {project.milestones.map((m, idx) => {
                const isSelected = m.id === selectedMilestoneId;
                const statusColor = 
                  m.status === 'released' ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30' :
                  m.status === 'in_review' ? 'text-cyan-400 border-cyan-800/40 bg-cyan-950/30' :
                  m.status === 'funded' ? 'text-amber-400 border-amber-800/40 bg-amber-950/30' :
                  'text-slate-400 border-slate-800 bg-slate-900/40';

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMilestoneId(m.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-slate-800/80 shadow-md'
                        : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        {m.title}
                      </span>
                      <span className="text-xs font-bold font-mono text-white">
                        {m.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {formatNgn(m.amountNgn)}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold border ${statusColor}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">7-Day Escrow Review Policy</span>
              <p className="leading-relaxed">
                When a developer submits milestone deliverables, the client has 7 days to test and review code before final release.
              </p>
            </div>
          </div>

          {/* Right Milestone Details & Actions */}
          <div className="md:col-span-7 space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            {selectedMilestone && financials && (
              <>
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-400">
                      Milestone Details &bull; {selectedMilestone.percentage}% of Project
                    </span>
                    <h3 className="text-lg font-bold font-heading text-white mt-1">
                      {selectedMilestone.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Milestone Capital</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {formatNgn(selectedMilestone.amountNgn)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-300">Deliverable Criteria:</span>
                  <p className="text-slate-400 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {selectedMilestone.description}
                  </p>
                </div>

                {/* Economics Breakdown */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Escrow & Financial Transparency
                  </span>
                  <div className="flex justify-between text-slate-300">
                    <span>Milestone Allocation:</span>
                    <span className="font-mono text-white font-semibold">{formatNgn(selectedMilestone.amountNgn)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Client Protection & Escrow Fee (2.5%):</span>
                    <span className="font-mono">{formatNgn(financials.clientProtectionFeeNgn)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Developer TrustTech Commission (12% on release):</span>
                    <span className="font-mono text-amber-400">-{formatNgn(financials.developerCommissionNgn)}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-slate-800">
                    <span className="text-teal-300">Developer Net Payout:</span>
                    <span className="font-mono text-teal-300">{formatNgn(financials.developerNetPayoutNgn)}</span>
                  </div>
                </div>

                {/* Deliverable Review Card (if in_review or released) */}
                {(selectedMilestone.status === 'in_review' || selectedMilestone.status === 'released') && (
                  <div className="p-4 bg-teal-950/20 border border-teal-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                        Submitted Deliverable
                      </span>
                      {selectedMilestone.submittedAt && (
                        <span className="text-[10px] text-slate-400">
                          Submitted: {new Date(selectedMilestone.submittedAt).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>
                    {selectedMilestone.deliverableUrl && (
                      <a
                        href={selectedMilestone.deliverableUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        {selectedMilestone.deliverableUrl}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedMilestone.deliverableNotes && (
                      <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                        {selectedMilestone.deliverableNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenDisputeModal(project.id, selectedMilestone.id, selectedMilestone.title)}
                    className="px-3.5 py-2 rounded-lg text-red-400 hover:bg-red-950/40 border border-red-900/40 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    Raise Dispute / Request Revision
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Client Funding Action */}
                    {(isClient || isAdmin) && selectedMilestone.status === 'pending' && (
                      <button
                        onClick={() => handleFund(selectedMilestone.id)}
                        className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        Fund in Escrow ({formatNgn(financials.clientTotalChargeNgn)})
                      </button>
                    )}

                    {/* Developer Submit Action */}
                    {(isDeveloper || isAdmin) && selectedMilestone.status === 'funded' && (
                      <button
                        onClick={() => setShowSubmitModal(true)}
                        className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        Submit Deliverable Proof
                      </button>
                    )}

                    {/* Client Release Action */}
                    {(isClient || isAdmin) && selectedMilestone.status === 'in_review' && (
                      <button
                        onClick={() => handleRelease(selectedMilestone.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Release Funds ({formatNgn(selectedMilestone.amountNgn)})
                      </button>
                    )}

                    {selectedMilestone.status === 'released' && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                        <CheckCircle2 className="w-4 h-4" /> Released to Developer
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Deliverable Sub-Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
            <form onSubmit={handleDeliverableSubmit} className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-400" />
                Submit Milestone Deliverables
              </h3>
              <p className="text-xs text-slate-400">
                Provide proof of delivery (staging link, GitHub PR, or Figma preview) to initiate the client's 7-day review window.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deliverable Staging URL / Repository Link *
                </label>
                <input
                  type="url"
                  placeholder="https://preview.staging.dev or github.com/pull/12"
                  value={deliverableUrl}
                  onChange={e => setDeliverableUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Implementation Notes & Handover Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize what was completed, test credentials if needed, and milestone scope verification..."
                  value={deliverableNotes}
                  onChange={e => setDeliverableNotes(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
