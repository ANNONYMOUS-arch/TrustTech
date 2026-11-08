import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  X, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import { User, DeveloperApplication } from '../types';
import { store } from '../services/store';
import { validateDeveloperApplication } from '../utils/marketplaceRules';

interface DeveloperVerificationViewProps {
  currentUser: User;
  application?: DeveloperApplication;
  onNavigateToDashboard: () => void;
}

export const DeveloperVerificationView: React.FC<DeveloperVerificationViewProps> = ({
  currentUser,
  application,
  onNavigateToDashboard,
}) => {
  const [professionalTitle, setProfessionalTitle] = useState(application?.professionalTitle || '');
  const [experience, setExperience] = useState<'Entry' | 'Intermediate' | 'Senior' | 'Lead / Architect'>(
    application?.experience || 'Intermediate'
  );
  const [category, setCategory] = useState<DeveloperApplication['category']>(
    application?.category || 'web-nocode'
  );
  const [bio, setBio] = useState(application?.bio || '');
  const [skills, setSkills] = useState<string[]>(application?.skills || ['Webflow', 'Tailwind CSS']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [portfolio, setPortfolio] = useState(application?.portfolio || 'https://');
  const [github, setGithub] = useState(application?.github || '');
  const [projectLinks, setProjectLinks] = useState(application?.projectLinks || '');
  const [projectDescription, setProjectDescription] = useState(application?.projectDescription || '');
  const [accuracyAgreed, setAccuracyAgreed] = useState(application?.accuracyAgreed || false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const validation = validateDeveloperApplication({
      professionalTitle,
      bio,
      skills,
      portfolio,
      accuracyAgreed,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    store.submitDeveloperApplication({
      uid: currentUser.uid,
      email: currentUser.email,
      fullName: currentUser.fullName,
      professionalTitle,
      experience,
      category,
      bio,
      skills,
      portfolio,
      github,
      projectLinks,
      projectDescription,
      accuracyAgreed,
    });

    setSuccessSubmitted(true);
  };

  // Status Badge Component
  const renderStatusCard = () => {
    if (!application) return null;

    if (application.status === 'Approved') {
      return (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Verification Confirmed
              </span>
              <h3 className="text-xl font-bold font-heading text-white">
                Verified TrustTech Professional
              </h3>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Your credentials, portfolio, and skills have been audited and approved by TrustTech Operations. You now have full access to submit proposals to open projects with your monthly 15-credit quota.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onNavigateToDashboard}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Open Developer Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-xs text-slate-400">
              Approved on: {new Date(application.reviewedAt || application.createdAt).toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>
      );
    }

    if (application.status === 'Pending Review') {
      return (
        <div className="bg-amber-950/30 border border-amber-600/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Application Submitted
              </span>
              <h3 className="text-xl font-bold font-heading text-white">
                Under Operational Review
              </h3>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Your verification application is currently queued for evaluation by our trust and verification team. We check code repositories, live portfolio URLs, and technical track records within 24 to 48 hours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Submitted Title:</span>
              <span className="text-white font-medium">{application.professionalTitle}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Experience Level:</span>
              <span className="text-teal-400 font-medium">{application.experience}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Skills Array:</span>
              <span className="text-white font-medium">{application.skills.length} verified tags</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            Tip: Switch to the <strong>Admin Console</strong> from the top-right account menu to simulate operational review and approval.
          </div>
        </div>
      );
    }

    if (application.status === 'Rejected') {
      return (
        <div className="bg-red-950/30 border border-red-600/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                Status: Application Rejected
              </span>
              <h3 className="text-xl font-bold font-heading text-white">
                Needs Improvement Before Approval
              </h3>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {application.rejectionReason || 'Your application did not satisfy our minimum portfolio or proof of production work requirements.'}
          </p>

          <div className="text-xs text-slate-400">
            You may revise your portfolio links, add verifiable GitHub repositories, and re-submit the verification form below.
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Developer Registration & Verification
          </h1>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
          TrustTech maintains high standards for technical delivery. Complete this application to earn your verified badge and access our high-value project listings.
        </p>
      </div>

      {/* Live Status Card */}
      {renderStatusCard()}

      {/* Application Form (Visible if not approved, or to edit) */}
      {(!application || application.status !== 'Approved') && (
        <form onSubmit={handleSubmit} className="bg-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-400" />
              {application ? 'Update Verification Submission' : 'Verification Credentials Form'}
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">UID: {currentUser.uid}</span>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Please address the following validation issues:
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {successSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Application successfully saved and queued for review!</span>
            </div>
          )}

          {/* Title & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Professional Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Webflow & Frontend Developer"
                value={professionalTitle}
                onChange={e => setProfessionalTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Experience Level *
              </label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Entry">Entry Level (1 - 2 years)</option>
                <option value="Intermediate">Intermediate (3 - 5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
                <option value="Lead / Architect">Lead / Architect (8+ years)</option>
              </select>
            </div>
          </div>

          {/* Primary Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Primary Marketplace Discipline *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="web-dev">Web Development (Frontend, Backend, Full-Stack, Webflow, Shopify, WordPress)</option>
              <option value="mobile-dev">Mobile Development (iOS, Android, Flutter, React Native, Mobile UI)</option>
              <option value="software-eng">Software Engineering (Software Architecture, QA, Game, Desktop, Automation)</option>
              <option value="ui-ux-creative">UI/UX & Creative Technology (Product Design, 3D, Motion, Brand Identity)</option>
              <option value="ai-data">AI and Data (Machine Learning, Chatbots, Data Science, AI Automation)</option>
              <option value="cybersecurity">Cybersecurity (Ethical Hacking, Penetration Testing, Cloud Defense)</option>
              <option value="it-networking">IT and Networking (Network Engineering, Sysadmin, Tech Support, Hardware)</option>
              <option value="cloud-devops">Cloud and DevOps (AWS, Azure, GCP, Kubernetes, Docker, CI/CD)</option>
              <option value="digital-marketing">Digital Marketing & Business Tech (SEO, Growth Marketing, CRM, Automation)</option>
              <option value="emerging-tech">Emerging Technology (AR/VR, Robotics, IoT, Computer Vision, Smart Contracts)</option>
            </select>
          </div>

          {/* Skills Array Management */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Verified Technical Skills (Stored as Array) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill (e.g. Webflow, Figma, Tailwind CSS) and press Add..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-teal-300 rounded-lg text-xs flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Professional Biography */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Professional Biography *
              </label>
              <span className="text-slate-500">
                {bio.length} characters (min 40)
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Describe your background, years in tech, industries served, and why clients trust you..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs leading-relaxed focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* URLs & Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Live Portfolio / Website URL *
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={e => setPortfolio(e.target.value)}
                placeholder="https://yourname.dev"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GitHub or Design Profile URL
              </label>
              <input
                type="url"
                value={github}
                onChange={e => setGithub(e.target.value)}
                placeholder="https://github.com/username or figma.com/@profile"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Additional Links & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Project Links (comma-separated live sites)
              </label>
              <input
                type="text"
                value={projectLinks}
                onChange={e => setProjectLinks(e.target.value)}
                placeholder="https://client-one.com, https://app-staging.ng"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Key Project Description & Outcome
              </label>
              <textarea
                rows={3}
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                placeholder="Highlight 1 or 2 specific projects: the technical stack used, challenges solved, and tangible business impact..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs leading-relaxed focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Accuracy Confirmation Agreement */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="accuracy-agreement"
              checked={accuracyAgreed}
              onChange={e => setAccuracyAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-500 rounded bg-slate-800 border-slate-700 focus:ring-teal-500"
              required
            />
            <label htmlFor="accuracy-agreement" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
              I certify under penalty of account suspension that all submitted portfolio links, code repositories, work histories, and technical skills are genuine, verifiable, and represent my own original work.
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Applications are reviewed securely by TrustTech administrators.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {application ? 'Update Application' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
