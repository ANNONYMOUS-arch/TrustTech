import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Briefcase, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Layers,
  Clock,
  Building,
  X
} from 'lucide-react';
import { Project, ProjectCategory, User, ProjectApplication } from '../types';
import { formatNgn, checkProposalEligibility } from '../utils/marketplaceRules';

interface MarketplaceViewProps {
  projects: Project[];
  currentUser: User;
  applications: ProjectApplication[];
  availableCredits: number;
  initialCategory?: string;
  onOpenApplyModal: (project: Project) => void;
  onPostProjectClick: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  projects,
  currentUser,
  applications,
  availableCredits,
  initialCategory,
  onOpenApplyModal,
  onPostProjectClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('all');
  const [activeProjectDetail, setActiveProjectDetail] = useState<Project | null>(null);

  // Filter projects based on search criteria
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Category filter supporting 10 departments and aliases
      if (selectedCategory !== 'all') {
        const matchesCat =
          project.category === selectedCategory ||
          project.departmentId === selectedCategory ||
          (selectedCategory === 'web-dev' && (project.category === 'web-nocode' || project.category === 'fullstack')) ||
          (selectedCategory === 'ui-ux-creative' && project.category === 'ui-ux');
        if (!matchesCat) return false;
      }

      // Experience filter
      if (selectedExperience !== 'all' && project.experienceLevel !== selectedExperience) {
        return false;
      }

      // Budget tier filter in NGN
      if (selectedBudgetTier === 'under-250k' && project.budgetMaxNgn > 250000) return false;
      if (selectedBudgetTier === '250k-400k' && (project.budgetMinNgn > 400000 || project.budgetMaxNgn < 250000)) return false;
      if (selectedBudgetTier === '400k-plus' && project.budgetMaxNgn < 400000) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesDesc = project.description.toLowerCase().includes(query);
        const matchesSkills = project.requiredSkills.some(s => s.toLowerCase().includes(query));
        const matchesCompany = project.ownerCompany?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesSkills && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [projects, selectedCategory, selectedExperience, selectedBudgetTier, searchTerm]);

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All 10 Departments' },
    { id: 'web-dev', label: 'Web Development' },
    { id: 'mobile-dev', label: 'Mobile Development' },
    { id: 'software-eng', label: 'Software Engineering' },
    { id: 'ui-ux-creative', label: 'UI/UX & Creative Tech' },
    { id: 'ai-data', label: 'AI & Data' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'it-networking', label: 'IT & Networking' },
    { id: 'cloud-devops', label: 'Cloud & DevOps' },
    { id: 'digital-marketing', label: 'Digital Marketing & Business Tech' },
    { id: 'emerging-tech', label: 'Emerging Technology' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Marketplace Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Project Marketplace
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {filteredProjects.length} Open Listings
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse verified tech contracts across 10 technology disciplines. Escrow-funded milestones with 12% flat dev commission.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.accountType === 'client' ? (
            <button
              onClick={onPostProjectClick}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              Post a Project Listing
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Your Allowance:</span>
              <strong className="text-white font-mono">{availableCredits} / 15 Credits</strong>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by skill, title, or keyword (e.g. Webflow, Figma, API)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Budget Range Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedBudgetTier}
              onChange={e => setSelectedBudgetTier(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Any Budget</option>
              <option value="under-250k">Under ₦250,000</option>
              <option value="250k-400k">₦250k - ₦400k</option>
              <option value="400k-plus">₦400,000+</option>
            </select>
          </div>

          {/* Experience Level Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Any Experience</option>
              <option value="Entry">Entry Level</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>

        {/* Quick Skill Tags Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1 border-t border-slate-800">
          <span className="text-slate-500 text-[11px] font-semibold whitespace-nowrap">Popular Skills:</span>
          {['Webflow', 'Figma', 'Technical Writing', 'Shopify', 'Design Systems', 'API Documentation', 'WordPress'].map(skill => (
            <button
              key={skill}
              onClick={() => setSearchTerm(searchTerm === skill ? '' : skill)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                searchTerm.toLowerCase() === skill.toLowerCase()
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {skill}
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-white underline ml-auto"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Projects List Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No listings match your search</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Try adjusting your category, budget filter, or search query to discover other verified projects.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedBudgetTier('all');
              setSelectedExperience('all');
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map(project => {
            const hasApplied = applications.some(
              a => a.projectId === project.id && a.developerUid === currentUser.uid
            );

            return (
              <div
                key={project.id}
                className="bg-[#121824] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all group hover:shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-400 uppercase">
                        {project.category.replace('-', ' ')}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {project.experienceLevel} Level
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {project.estimatedDuration}
                      </span>
                      {hasApplied && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-400" />
                          You Applied
                        </span>
                      )}
                    </div>

                    <div>
                      <h3
                        onClick={() => setActiveProjectDetail(project)}
                        className="text-lg font-bold font-heading text-white group-hover:text-teal-300 transition-colors cursor-pointer"
                      >
                        {project.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.requiredSkills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {project.ownerCompany || project.ownerName}
                      </span>
                      <span>&bull;</span>
                      <span>{project.applicantCount || 0} Proposals Received</span>
                      <span>&bull;</span>
                      <span>Posted {new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* Right side: Budget & Action */}
                  <div className="lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800 flex lg:flex-col justify-between items-center lg:items-end gap-3 shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Budget</span>
                      <div className="text-base sm:text-lg font-bold font-mono text-white">
                        {formatNgn(project.budgetMinNgn)} – {formatNgn(project.budgetMaxNgn)}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        4 Escrow Milestones
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveProjectDetail(project)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Details
                      </button>

                      {currentUser.accountType === 'developer' && !hasApplied && (
                        <button
                          onClick={() => onOpenApplyModal(project)}
                          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Apply (1 Credit)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal / Drawer */}
      {activeProjectDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-[#121824] z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-400 uppercase">
                    {activeProjectDetail.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Client: {activeProjectDetail.ownerCompany || activeProjectDetail.ownerName}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-heading text-white">
                  {activeProjectDetail.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveProjectDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Target Budget Range</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {formatNgn(activeProjectDetail.budgetMinNgn)} – {formatNgn(activeProjectDetail.budgetMaxNgn)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Estimated Timeline</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    {activeProjectDetail.estimatedDuration}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Experience Requirement</span>
                  <span className="text-base font-bold text-teal-400 mt-0.5 block">
                    {activeProjectDetail.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Overview</h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeProjectDetail.description}
                </p>
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {activeProjectDetail.requiredSkills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4-Stage Reconciled Milestone Plan */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    Proposed 4-Stage Milestones (100% Reconciled)
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Total: 100%
                  </span>
                </div>

                <div className="space-y-2">
                  {activeProjectDetail.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono">
                            {idx + 1}
                          </span>
                          {m.title}
                        </div>
                        <p className="text-[11px] text-slate-400 pl-7">{m.description}</p>
                      </div>
                      <div className="text-right shrink-0 pl-4">
                        <span className="font-bold text-white font-mono block">{m.percentage}%</span>
                        <span className="text-[10px] text-slate-500">{formatNgn(m.amountNgn)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="text-xs text-slate-400">
                12% developer commission deducted upon payout release.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveProjectDetail(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Close
                </button>
                {currentUser.accountType === 'developer' && (
                  <button
                    onClick={() => {
                      const proj = activeProjectDetail;
                      setActiveProjectDetail(null);
                      onOpenApplyModal(proj);
                    }}
                    className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Submit Proposal (1 Credit)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
