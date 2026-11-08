import React, { useState } from 'react';
import { 
  UserCheck, 
  Coins, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Layers,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import { User, ProjectApplication, Project, DeveloperApplication } from '../types';
import { formatNgn, calculateProjectFinancials } from '../utils/marketplaceRules';

interface DeveloperDashboardProps {
  currentUser: User;
  applications: ProjectApplication[];
  projects: Project[];
  availableCredits: number;
  developerProfile?: DeveloperApplication;
  onNavigateToMarketplace: () => void;
  onNavigateToVerification: () => void;
  onOpenMessages: (projectId: string) => void;
  onOpenMilestones: (project: Project) => void;
  onNavigateToFinancialCentre?: () => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  currentUser,
  applications,
  projects,
  availableCredits,
  developerProfile,
  onNavigateToMarketplace,
  onNavigateToVerification,
  onOpenMessages,
  onOpenMilestones,
  onNavigateToFinancialCentre,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'profile' | 'opportunities'>('applications');


  const myApplications = applications.filter(a => a.developerUid === currentUser.uid);
  const acceptedApplications = myApplications.filter(a => a.status === 'Accepted');
  const shortlistedApplications = myApplications.filter(a => a.status === 'Shortlisted');

  // Open projects matching developer category
  const matchingProjects = projects.filter(p => {
    if (p.status !== 'open') return false;
    const hasApplied = myApplications.some(a => a.projectId === p.id);
    return !hasApplied;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white flex items-center gap-2">
              Developer Workspace
              {currentUser.isVerifiedDeveloper && (
                <span title="Verified Developer">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </span>
              )}
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track your proposals, manage remaining monthly credits, and deliver on funded client milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {onNavigateToFinancialCentre && (
            <button
              onClick={onNavigateToFinancialCentre}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-teal-400" />
              Financial Centre &amp; Wallet
            </button>
          )}
          <button
            onClick={onNavigateToMarketplace}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            Find New Projects
          </button>
        </div>
      </div>


      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Proposal Credits Quota Card */}
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Proposal Credits Quota
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {availableCredits} <span className="text-sm font-normal text-slate-500">/ 15</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all"
              style={{ width: `${(availableCredits / 15) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 block pt-0.5">
            15 Credits allocated monthly. Anti-spam protection.
          </span>
        </div>

        {/* Verification Status Card */}
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Verification Status
          </span>
          <div className="flex items-center gap-2 pt-1">
            {currentUser.isVerifiedDeveloper ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Verified
              </div>
            ) : developerProfile?.status === 'Pending Review' ? (
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-base">
                <Clock className="w-5 h-5 text-amber-400" />
                Pending Review
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-base">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                Unverified
              </div>
            )}
          </div>
          <button
            onClick={onNavigateToVerification}
            className="text-[11px] text-teal-400 hover:underline block pt-1"
          >
            Manage Credentials &rarr;
          </button>
        </div>

        {/* Proposals Submitted Card */}
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Submitted Proposals
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {myApplications.length}
          </div>
          <span className="text-[11px] text-teal-400 block">
            {shortlistedApplications.length} Shortlisted &bull; {acceptedApplications.length} Accepted
          </span>
        </div>

        {/* Active Contracts Card */}
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Active Contracts
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {acceptedApplications.length}
          </div>
          <span className="text-[11px] text-emerald-400 block">
            Milestone payments secured
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'applications'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Proposals & Contracts ({myApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'opportunities'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Recommended Open Projects ({matchingProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Professional Profile
        </button>
      </div>

      {/* Tab 1: Proposals & Contracts */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="p-12 text-center bg-[#121824] border border-slate-800 rounded-2xl space-y-3">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No active proposals yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Browse our curated listings and submit tailored proposals using your monthly 15-credit quota.
              </p>
              <button
                onClick={onNavigateToMarketplace}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Browse Projects
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => {
                const fin = calculateProjectFinancials(app.proposedPriceNgn);

                return (
                  <div
                    key={app.id}
                    className="p-5 bg-[#121824] border border-slate-800 rounded-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            app.status === 'Accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : app.status === 'Shortlisted'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800/40'
                              : app.status === 'Rejected'
                              ? 'bg-red-950 text-red-400 border border-red-800/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Submitted {new Date(app.submissionTimestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <h3 className="text-base font-bold font-heading text-white">{app.projectTitle}</h3>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Your Proposed Price</span>
                        <div className="text-base font-bold font-mono text-white">
                          {formatNgn(app.proposedPriceNgn)}
                        </div>
                        <span className="text-[10px] text-emerald-400">
                          Net Payout: {formatNgn(fin.developerNetPayoutNgn)} (12% fee)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <p className="line-clamp-2 leading-relaxed">{app.proposalMessage}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">
                        Delivery Timeline: <strong className="text-white">{app.estimatedDeliveryDays} days</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {(() => {
                          const matchingProj = projects.find(p => p.id === app.projectId);
                          if (!matchingProj) return null;
                          return (
                            <button
                              onClick={() => onOpenMilestones(matchingProj)}
                              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5 text-teal-400" />
                              Milestones & Escrow
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => onOpenMessages(app.projectId)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                          Client Discussion
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
            <span>Open contracts ready for proposals</span>
            <span>Credits: <strong>{availableCredits} / 15</strong></span>
          </div>

          <div className="space-y-3">
            {matchingProjects.map(proj => (
              <div
                key={proj.id}
                className="p-4 bg-[#121824] border border-slate-800 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-teal-400">
                    {proj.category.replace('-', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{proj.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Target: {formatNgn(proj.budgetMinNgn)} – {formatNgn(proj.budgetMaxNgn)}</span>
                    <span>&bull;</span>
                    <span>{proj.estimatedDuration}</span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToMarketplace}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 cursor-pointer"
                >
                  View & Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Developer Profile */}
      {activeTab === 'profile' && (
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold font-heading text-white">
                Public Developer Profile
              </h3>
              <p className="text-xs text-slate-400">
                Visible to businesses when they review your project proposals.
              </p>
            </div>
            <button
              onClick={onNavigateToVerification}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold"
            >
              Edit in Verification
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <span className="text-white font-semibold text-sm mt-0.5 block">{currentUser.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="text-white font-mono mt-0.5 block">{currentUser.email}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">Professional Title</span>
              <span className="text-white font-medium text-sm mt-0.5 block">
                {developerProfile?.professionalTitle || 'Software Professional'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Professional Biography</span>
              <p className="text-slate-300 leading-relaxed mt-1 p-3 bg-slate-900 rounded-xl border border-slate-800">
                {developerProfile?.bio || 'Experienced digital professional focused on delivering measurable outcomes.'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1.5">Verified Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(developerProfile?.skills || ['Webflow', 'Tailwind CSS']).map(s => (
                  <span key={s} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-teal-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 block">Portfolio Showcase</span>
                <a
                  href={developerProfile?.portfolio || 'https://github.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  {developerProfile?.portfolio || 'https://github.com'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <span className="text-slate-400 block">GitHub Profile</span>
                <span className="text-slate-300 mt-0.5 block font-mono">
                  {developerProfile?.github || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
