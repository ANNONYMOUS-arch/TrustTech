import React, { useState } from 'react';
import { X, Scale, AlertCircle, FileText, Send } from 'lucide-react';
import { Project, User, DisputeItem } from '../types';
import { store } from '../services/store';

interface DisputeModalProps {
  projectId: string;
  milestoneId: string;
  milestoneTitle: string;
  currentUser: User;
  project?: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  projectId,
  milestoneId,
  milestoneTitle,
  currentUser,
  project,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState<DisputeItem['reason']>('quality_concern');
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState<string | null>(null);

  const defendantUid = currentUser.accountType === 'client' 
    ? (project?.hiredDeveloperUid || 'user-dev-verified')
    : (project?.ownerUid || 'user-client-1');

  const defendantName = currentUser.accountType === 'client' 
    ? 'Assigned Developer'
    : (project?.ownerCompany || project?.ownerName || 'Project Client');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidence.trim() || evidence.trim().length < 30) {
      setError('Please provide detailed evidence or context (minimum 30 characters).');
      return;
    }

    store.raiseDispute({
      projectId,
      projectTitle: project?.title || 'Contract Project',
      milestoneId,
      milestoneTitle,
      raisedByUid: currentUser.uid,
      raisedByName: currentUser.fullName,
      raisedByRole: currentUser.accountType,
      defendantUid,
      defendantName,
      reason,
      evidence: evidence.trim(),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-white">
                Initiate Milestone Dispute
              </h3>
              <p className="text-xs text-slate-400">
                Milestone: {milestoneTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Dispute Category *
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="quality_concern">Quality Concern / Does Not Match Figma or Spec</option>
              <option value="incomplete_work">Incomplete Work / Missing Deliverables</option>
              <option value="missed_deadline">Uncommunicated Missed Deadlines</option>
              <option value="communication_stalled">Communication Stalled or Unresponsive</option>
              <option value="payment_disagreement">Payment or Milestone Scope Disagreement</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Detailed Context & Evidence *
              </label>
              <span className="text-slate-500">{evidence.length} chars (min 30)</span>
            </div>
            <textarea
              rows={4}
              placeholder="State specifically what part of the milestone deliverable is deficient, discrepancies with agreed project scope, or previous communication attempts..."
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white leading-relaxed focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">TrustTech Mediation Commitment</span>
            <p className="leading-relaxed">
              Disputes freeze milestone escrow release. A TrustTech dispute officer will review the project thread and deliverable evidence to propose a neutral, binding resolution.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Scale className="w-3.5 h-3.5" />
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
