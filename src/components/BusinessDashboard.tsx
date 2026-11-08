import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Briefcase, 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Layers, 
  Send,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Check,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { Project, ProjectApplication, User, Milestone } from '../types';
import { store } from '../services/store';
import { formatNgn, generateBalancedMilestones, calculateProjectFinancials } from '../utils/marketplaceRules';
import { requestAiProposalScreening } from '../services/aiScreeningClient';

interface BusinessDashboardProps {
  currentUser: User;
  projects: Project[];
  applications: ProjectApplication[];
  onOpenMessages: (projectId: string) => void;
  onOpenMilestones: (project: Project) => void;
  onNavigateToFinancialCentre?: () => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  currentUser,
  projects,
  applications,
  onOpenMessages,
  onOpenMilestones,
  onNavigateToFinancialCentre,
}) => {

  const [activeTab, setActiveTab] = useState<'projects' | 'proposals' | 'new-project'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [screeningLoadingId, setScreeningLoadingId] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Project['category']>('web-nocode');
  const [newBudgetMin, setNewBudgetMin] = useState<number>(200000);
  const [newBudgetMax, setNewBudgetMax] = useState<number>(300000);
  const [newDuration, setNewDuration] = useState('2 - 3 weeks');
  const [newExperience, setNewExperience] = useState<'Entry' | 'Intermediate' | 'Senior'>('Intermediate');
  const [newSkills, setNewSkills] = useState<string>('Webflow, Tailwind CSS, Responsive Design');
  const [newDescription, setNewDescription] = useState('');

  // Business specific metrics
  const myProjects = projects.filter(p => p.ownerUid === currentUser.uid);
  const myProjectIds = myProjects.map(p => p.id);
  const receivedApplications = applications.filter(a => myProjectIds.includes(a.projectId));
  const activeHires = myProjects.filter(p => p.status === 'in_progress');

  const filteredProposals = receivedApplications.filter(a => {
    if (selectedProjectId !== 'all' && a.projectId !== selectedProjectId) return false;
    return true;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const skillsArray = newSkills.split(',').map(s => s.trim()).filter(Boolean);
    const avgBudget = Math.round((newBudgetMin + newBudgetMax) / 2);
    const milestones = generateBalancedMilestones(avgBudget);

    store.createProject({
      ownerUid: currentUser.uid,
      ownerName: currentUser.fullName,
      ownerCompany: currentUser.companyName || 'Business Client',
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      requiredSkills: skillsArray.length > 0 ? skillsArray : ['Webflow', 'Tailwind CSS'],
      budgetMinNgn: Number(newBudgetMin),
      budgetMaxNgn: Number(newBudgetMax),
      estimatedDuration: newDuration,
      experienceLevel: newExperience,
      status: 'open',
      milestones,
    });

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setActiveTab('projects');
  };

  const handleAiScreenProposal = async (proposal: ProjectApplication) => {
    const project = myProjects.find(p => p.id === proposal.projectId);
    if (!project) return;

    setScreeningLoadingId(proposal.id);
    setAiNotice(null);

    const result = await requestAiProposalScreening(project, proposal);
    setScreeningLoadingId(null);

    if (result.success && result.screening) {
      store.attachAiScreening(proposal.id, result.screening);
      setAiNotice({
        type: 'success',
        message: `Proposal screened successfully by Gemini. Match score: ${result.screening.overallScore}/100.`,
      });
    } else {
      setAiNotice({
        type: result.isConfigured ? 'error' : 'warning',
        message: result.error || 'AI screening requires GEMINI_API_KEY to be configured in server environment.',
      });
    }
  };

  const handleUpdateStatus = (proposalId: string, status: ProjectApplication['status']) => {
    store.updateProposalStatus(proposalId, status);
    if (status === 'Accepted') {
      const prop = applications.find(a => a.id === proposalId);
      if (prop) {
        const proj = projects.find(p => p.id === prop.projectId);
        if (proj) {
          onOpenMilestones(proj);
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Client & Business Dashboard
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage your project listings, review incoming developer proposals, and conduct AI-assisted candidate screening.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {onNavigateToFinancialCentre && (
            <button
              onClick={onNavigateToFinancialCentre}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-teal-400" />
              Financial Centre
            </button>
          )}
          <button
            onClick={() => setActiveTab('new-project')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Project
          </button>
        </div>
      </div>


      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Projects Posted
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {myProjects.length}
          </div>
          <span className="text-[11px] text-teal-400 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> {myProjects.filter(p => p.status === 'open').length} actively accepting bids
          </span>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Proposals Received
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {receivedApplications.length}
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-teal-400" /> Across all listings
          </span>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Active Contracts
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {activeHires.length}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Milestone tracking enabled
          </span>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Escrow Protection
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            100%
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> 7-day deliverable review
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Projects ({myProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'proposals'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Received Proposals ({receivedApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('new-project')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'new-project'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          Post New Project
        </button>
      </div>

      {/* Tab 1: My Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {myProjects.length === 0 ? (
            <div className="p-12 text-center bg-[#121824] border border-slate-800 rounded-2xl space-y-3">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">You have not posted any projects yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Post your project scope and budget in ₦ Naira to start receiving proposals from verified professionals.
              </p>
              <button
                onClick={() => setActiveTab('new-project')}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Post Your First Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myProjects.map(proj => {
                const projApplications = receivedApplications.filter(a => a.projectId === proj.id);

                return (
                  <div
                    key={proj.id}
                    className="p-5 bg-[#121824] border border-slate-800 rounded-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            proj.status === 'open'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-teal-950 text-teal-400 border border-teal-800/40'
                          }`}>
                            {proj.status === 'open' ? 'Active / Open' : 'In Progress'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {proj.category.replace('-', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold font-heading text-white">{proj.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Budget</span>
                        <span className="text-base font-bold font-mono text-white">
                          {formatNgn(proj.budgetMinNgn)} – {formatNgn(proj.budgetMaxNgn)}
                        </span>
                      </div>
                    </div>

                    {/* Milestones Snapshot */}
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-teal-400" />
                        <span className="text-slate-300 font-medium">4 Balanced Milestones</span>
                        <span className="text-[11px] text-slate-500">(100% Reconciled)</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        Timeline: {proj.estimatedDuration} &bull; {proj.experienceLevel} Level
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <button
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setActiveTab('proposals');
                        }}
                        className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        View {projApplications.length} Received Proposals
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenMilestones(proj)}
                          className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 font-medium cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-teal-400" />
                          Milestones & Escrow
                        </button>

                        <button
                          onClick={() => onOpenMessages(proj.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 font-medium cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                          Project Thread
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

      {/* Tab 2: Received Proposals with AI Screening */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          {aiNotice && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              aiNotice.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                : aiNotice.type === 'warning'
                ? 'bg-amber-950/40 border border-amber-800/60 text-amber-300'
                : 'bg-red-950/40 border border-red-800/60 text-red-300'
            }`}>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{aiNotice.message}</span>
            </div>
          )}

          {/* Project Filter for Proposals */}
          <div className="flex items-center justify-between bg-[#121824] p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Filter by Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="py-1 px-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
            >
              <option value="all">All Projects ({receivedApplications.length} Proposals)</option>
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="p-12 text-center bg-[#121824] border border-slate-800 rounded-2xl text-slate-400 text-xs">
              No proposals found for the selected project filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map(prop => {
                const fin = calculateProjectFinancials(prop.proposedPriceNgn);
                const isScreening = screeningLoadingId === prop.id;

                return (
                  <div
                    key={prop.id}
                    className="p-6 bg-[#121824] border border-slate-800 rounded-2xl space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                            {prop.developerName}
                            <span title="Verified Developer">
                              <ShieldCheck className="w-4 h-4 text-teal-400" />
                            </span>
                          </h3>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            prop.status === 'Accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : prop.status === 'Shortlisted'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800'
                              : prop.status === 'Rejected'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{prop.developerTitle}</p>
                        <p className="text-[11px] text-teal-400 mt-1">Project: {prop.projectTitle}</p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quote & Payout</span>
                        <div className="text-base font-bold font-mono text-white">
                          {formatNgn(prop.proposedPriceNgn)}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Dev receives net {formatNgn(fin.developerNetPayoutNgn)} (12% fee)
                        </span>
                      </div>
                    </div>

                    {/* Proposal Letter */}
                    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {prop.proposalMessage}
                    </div>

                    {/* Timeline & Portfolio */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>Timeline: <strong className="text-white">{prop.estimatedDeliveryDays} days</strong></span>
                      <span>&bull;</span>
                      <a
                        href={prop.developerPortfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:underline flex items-center gap-1"
                      >
                        Portfolio Showcase
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {prop.developerGithub && (
                        <>
                          <span>&bull;</span>
                          <a
                            href={prop.developerGithub}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-400 hover:underline flex items-center gap-1"
                          >
                            GitHub
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>

                    {/* AI Proposal Screening Report Card (Section 15) */}
                    {prop.aiScreening ? (
                      <div className="p-4 bg-teal-950/20 border border-teal-500/30 rounded-xl space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-teal-400" />
                            <span className="font-bold font-heading text-white">
                              Gemini AI Screening Assessment
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              Skills Match: {prop.aiScreening.skillsMatchRating}
                            </span>
                            <span className="text-xs font-bold font-mono text-white bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                              Score: {prop.aiScreening.overallScore} / 100
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed">
                          {prop.aiScreening.summary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                              Observed Strengths
                            </span>
                            <ul className="space-y-1 text-[11px] text-slate-300">
                              {prop.aiScreening.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {prop.aiScreening.riskFactors.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                                Considerations & Risks
                              </span>
                              <ul className="space-y-1 text-[11px] text-slate-300">
                                {prop.aiScreening.riskFactors.map((rf, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <span>{rf}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 border-t border-teal-900/40 pt-2 flex justify-between">
                          <span>AI provides candidate analysis; the hiring decision remains exclusively with you.</span>
                          <span>Screened: {new Date(prop.aiScreening.screenedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Sparkles className="w-4 h-4 text-teal-400" />
                          <span>AI Candidate Screening available for this proposal.</span>
                        </div>
                        <button
                          onClick={() => handleAiScreenProposal(prop)}
                          disabled={isScreening}
                          className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                          {isScreening ? 'Evaluating with Gemini...' : 'Run AI Screening'}
                        </button>
                      </div>
                    )}

                    {/* Decision Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <button
                        onClick={() => onOpenMessages(prop.projectId)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                        Chat with Developer
                      </button>

                      <div className="flex items-center gap-2">
                        {prop.status !== 'Shortlisted' && prop.status !== 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(prop.id, 'Shortlisted')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            Shortlist
                          </button>
                        )}

                        {prop.status !== 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(prop.id, 'Accepted')}
                            className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept & Fund Escrow
                          </button>
                        )}

                        {prop.status !== 'Rejected' && prop.status !== 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(prop.id, 'Rejected')}
                            className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-950/40 text-xs"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Post New Project Form */}
      {activeTab === 'new-project' && (
        <form onSubmit={handleCreateProject} className="bg-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold font-heading text-white">
              Create a Project Listing
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Specify your project scope and budget range. We automatically balance milestones to equal 100%.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="e.g. E-Commerce Storefront on Shopify with Paystack Integration"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="web-dev">Web Development (Frontend, Backend, Fullstack, CMS)</option>
                  <option value="mobile-dev">Mobile Development (iOS, Android, Flutter, React Native)</option>
                  <option value="software-eng">Software Engineering (Architecture, QA, Game, Desktop)</option>
                  <option value="ui-ux-creative">UI/UX & Creative Technology (Product Design, 3D)</option>
                  <option value="ai-data">AI & Data (ML, Chatbots, Data Science, Automation)</option>
                  <option value="cybersecurity">Cybersecurity (Audits, Penetration Testing, Cloud Defense)</option>
                  <option value="it-networking">IT & Networking (Sysadmin, Hardware, Technical Support)</option>
                  <option value="cloud-devops">Cloud & DevOps (AWS, Azure, GCP, Kubernetes, CI/CD)</option>
                  <option value="digital-marketing">Digital Marketing & Business Tech (SEO, Growth, CRM)</option>
                  <option value="emerging-tech">Emerging Technology (AR/VR, Robotics, IoT, Smart Contracts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Experience Level *
                </label>
                <select
                  value={newExperience}
                  onChange={e => setNewExperience(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>

            {/* Budget Range in Naira */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Minimum Budget (₦ NGN) *
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={newBudgetMin}
                  onChange={e => setNewBudgetMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Maximum Budget (₦ NGN) *
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={newBudgetMax}
                  onChange={e => setNewBudgetMax(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Estimated Timeline *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 - 4 weeks"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Required Technical Skills (comma-separated) *
              </label>
              <input
                type="text"
                placeholder="e.g. Webflow, Figma, Shopify, API Reference"
                value={newSkills}
                onChange={e => setNewSkills(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Detailed Project Description *
              </label>
              <textarea
                rows={5}
                placeholder="Explain the background, key deliverables, required integrations, and criteria for success..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs leading-relaxed focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-500">
              Listing will be published instantly to open marketplace.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" />
                Publish Listing
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
