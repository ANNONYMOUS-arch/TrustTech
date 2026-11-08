import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Palette, 
  FileText, 
  Coins, 
  Lock, 
  Scale, 
  Clock, 
  Sparkles,
  Building2,
  Users,
  Compass,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { formatNgn } from '../utils/marketplaceRules';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectCategory }) => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'business' | 'developer'>('business');

  const techDepartments = [
    {
      id: 'web-dev',
      title: 'Web Development',
      badge: 'Frontend, Backend & Fullstack',
      description: 'Production-ready web applications, high-converting landing pages, e-commerce stores, and custom APIs.',
      roles: ['Frontend Developers', 'Backend Developers', 'Full-Stack Developers', 'Webflow Specialists', 'Shopify Developers', 'API Engineers'],
      typicalRange: '₦150k – ₦1.2M',
    },
    {
      id: 'mobile-dev',
      title: 'Mobile Development',
      badge: 'iOS, Android & Cross-Platform',
      description: 'Native mobile architectures and cross-platform apps designed for African connectivity and global performance.',
      roles: ['Android Developers', 'iOS Developers', 'Flutter Developers', 'React Native Developers', 'Mobile UI Designers'],
      typicalRange: '₦300k – ₦2.5M',
    },
    {
      id: 'software-eng',
      title: 'Software Engineering',
      badge: 'Systems, Architecture & QA',
      description: 'Enterprise desktop software, game engineering, software architecture, automated testing, and performance engineering.',
      roles: ['Software Engineers', 'Software Architects', 'QA Engineers', 'Game Developers', 'Automation Engineers'],
      typicalRange: '₦400k – ₦3.0M',
    },
    {
      id: 'ui-ux-creative',
      title: 'UI/UX & Creative Technology',
      badge: 'Design Systems & 3D',
      description: 'High-conversion product design, tokenized Figma design systems, motion graphics, 3D assets, and accessible UI.',
      roles: ['UI/UX Designers', 'Product Designers', 'Graphic Designers', 'Brand Identity Designers', '3D Designers'],
      typicalRange: '₦180k – ₦1.5M',
    },
    {
      id: 'ai-data',
      title: 'AI and Data',
      badge: 'LLMs, ML & Data Pipelines',
      description: 'Applied machine learning, generative AI assistants, retrieval-augmented generation (RAG), and business intelligence.',
      roles: ['AI Developers', 'ML Engineers', 'AI Automation Specialists', 'Data Scientists', 'Chatbot Developers'],
      typicalRange: '₦350k – ₦3.5M',
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity',
      badge: 'Lawful & Authorized Audits',
      description: 'Authorized penetration testing, security posture reviews, cloud defense, and compliance audits for fintechs.',
      roles: ['Cybersecurity Analysts', 'Ethical Hackers', 'Penetration Testers', 'Security Auditors', 'Defensive Security'],
      typicalRange: '₦400k – ₦4.0M',
    },
    {
      id: 'it-networking',
      title: 'IT and Networking',
      badge: 'Infrastructure & Support',
      description: 'Robust server administration, secure corporate networking, hardware configuration, and technical operations support.',
      roles: ['Network Engineers', 'System Administrators', 'IT Support Specialists', 'Hardware Technicians', 'Electronics Engineers'],
      typicalRange: '₦120k – ₦1.0M',
    },
    {
      id: 'cloud-devops',
      title: 'Cloud and DevOps',
      badge: 'AWS, Azure, GCP & K8s',
      description: 'High-availability cloud architecture, zero-downtime CI/CD automation, Docker/Kubernetes container orchestration.',
      roles: ['Cloud Engineers', 'DevOps Engineers', 'Site Reliability Engineers', 'AWS / Azure Specialists', 'Kubernetes Engineers'],
      typicalRange: '₦350k – ₦3.0M',
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing & Business Tech',
      badge: 'SEO, CRM & Growth',
      description: 'Technical SEO architectures, marketing automation funnels, CRM systems, analytics instrumentation, and conversion growth.',
      roles: ['Technical SEO Specialists', 'Growth Marketers', 'Marketing Automation', 'CRM Specialists', 'E-commerce Specialists'],
      typicalRange: '₦100k – ₦900k',
    },
    {
      id: 'emerging-tech',
      title: 'Emerging Technology',
      badge: 'AR/VR, Robotics & IoT',
      description: 'Immersive spatial experiences, embedded hardware systems, computer vision, robotics, and smart contracts.',
      roles: ['AR/VR Developers', 'Robotics Engineers', 'IoT Specialists', 'Computer Vision Engineers', 'Smart Contract Developers'],
      typicalRange: '₦450k – ₦4.5M',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Trusted People. Better Technology.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight leading-[1.12]">
              Find the right talent. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                Build something great.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              TrustTech connects businesses, startups, and organizations with vetted, qualified technology professionals across 10 technology departments—with milestone-protected escrow payments and verified credentials.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all cursor-pointer"
              >
                Find a Professional
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('verification')}
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 hover:border-slate-600 transition-all cursor-pointer"
              >
                Become a Developer
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-xl">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-heading text-white">100%</div>
                <div className="text-xs text-slate-400">Reconciled Milestones</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-heading text-teal-400">12% Flat</div>
                <div className="text-xs text-slate-400">Developer Commission</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-heading text-white">15 Credits</div>
                <div className="text-xs text-slate-400">Monthly Anti-Spam Quota</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card - Realistic TrustTech Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300">
                    CO
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                      Chidinma Okafor
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-xs text-slate-400">Senior UI/UX & Webflow Specialist</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/40">
                  Verified
                </span>
              </div>

              {/* Sample Verified Project Card inside Hero */}
              <div className="mt-4 space-y-3">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold text-slate-200">Recent Completed Project</div>
                  <div className="text-xs text-teal-300 font-medium mt-0.5">PayFlow Checkout Experience Redesign</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Contract: ₦480,000</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 4/4 Milestones Released
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Verified Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Figma', 'Webflow', 'Design Systems', 'Fintech UX', 'Responsive Web'].map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>Trust & Safety Guarantee</span>
                    <span className="text-teal-400 font-mono">Protected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Client funds deposited into project milestones. Developer is paid only after milestone delivery and client review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Main Technology Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
            <span>Marketplace Directory</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-tight">
            10 Main Technology Departments
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            From modern web and mobile apps to cybersecurity, machine learning, and emerging robotics, explore verified African tech talent with transparent milestone protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techDepartments.map(dept => (
            <div
              key={dept.id}
              className="bg-[#121824] border border-slate-800 hover:border-teal-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all group hover:shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-400 border border-teal-800/60 font-semibold">
                    {dept.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{dept.typicalRange}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-heading text-white group-hover:text-teal-300 transition-colors">
                    {dept.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Roles & Specializations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.roles.map((r, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">View Active Contracts</span>
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(dept.id);
                    onNavigate('marketplace');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How TrustTech Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                How TrustTech Works
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                A structured, transparent process designed to protect both businesses and professionals.
              </p>
            </div>

            {/* Workflow Tabs */}
            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveWorkflowTab('business')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkflowTab === 'business'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                For Businesses
              </button>
              <button
                onClick={() => setActiveWorkflowTab('developer')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkflowTab === 'developer'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                For Developers
              </button>
            </div>
          </div>

          {activeWorkflowTab === 'business' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {[
                { step: '01', title: 'Post a Project Listing', desc: 'Define required skills, experience level, budget range in ₦ Naira, and balanced milestones totaling 100%.' },
                { step: '02', title: 'Review Proposals with AI Assistance', desc: 'Examine proposals from verified professionals. Use Gemini AI screening to evaluate skills match and portfolio relevance.' },
                { step: '03', title: 'Fund Milestones in Escrow', desc: 'Deposit funds per approved milestone. Developers begin work knowing payment is secured.' },
                { step: '04', title: 'Track Milestone Deliverables', desc: 'Review completed code, design links, and assets at each stage of the project timeline.' },
                { step: '05', title: '7-Day Review & Release', desc: 'Take up to 7 days to test deliverables before releasing funds. Transparent dispute resolution if needed.' },
                { step: '06', title: 'Build Long-Term Partnerships', desc: 'Maintain direct communication and contract developers for ongoing maintenance arrangements.' },
              ].map(item => (
                <div key={item.step} className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Step {item.step}
                  </span>
                  <h4 className="text-sm font-bold text-white pt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {[
                { step: '01', title: 'Submit Developer Verification', desc: 'Provide professional title, portfolio URL, GitHub, verified skills, and project experience for admin review.' },
                { step: '02', title: 'Earn Verified Developer Status', desc: 'Once approved by TrustTech operations, receive your Verified badge and access to proposal submission.' },
                { step: '03', title: '15 Monthly Proposal Credits', desc: 'Submit up to 15 high-intent proposals per month. No bidding fees, spam bids, or pay-to-win tricks.' },
                { step: '04', title: 'Direct Client Communication', desc: 'Discuss scope, timeline, and deliverables directly with hiring clients through project threads.' },
                { step: '05', title: 'Guaranteed Milestone Payments', desc: 'Work with peace of mind knowing the client funded your milestone before you write code.' },
                { step: '06', title: '12% Flat Transparent Commission', desc: 'Keep 88% of your agreed contract earnings. No hidden charges, withdrawal deductions, or surprise platform fees.' },
              ].map(item => (
                <div key={item.step} className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Step {item.step}
                  </span>
                  <h4 className="text-sm font-bold text-white pt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Trust & Safety by Design
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Built on realistic engineering discipline, verified records, and clear policies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Verified Developers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every professional submits verifiable portfolio links, GitHub profiles, and proof of experience reviewed by TrustTech operations.
            </p>
          </div>

          <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Milestone Fund Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clients fund specific project milestones in advance. Developers work with confidence, and clients inspect code before release.
            </p>
          </div>

          <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">15-Credit Anti-Spam Quota</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monthly limits eliminate automated bot applications, ensuring clients receive thoughtful, tailored proposals from dedicated professionals.
            </p>
          </div>

          <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dispute Mediation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clear scope agreements, written deliverable checkpoints, and a structured dispute review team if expectations diverge.
            </p>
          </div>
        </div>
      </section>

      {/* TrustTech Core Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            TrustTech Verified Standards
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Built for High-Trust Digital Engineering
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Every contract across all 10 technology departments operates under strict platform governance to eliminate fraud and delivery failures.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { title: '100% Escrow Funding', desc: 'Milestones must be deposited in escrow before developers begin work.' },
              { title: '12% Flat Commission', desc: 'Transparent fee deducted on release. Developers keep 88% of earnings.' },
              { title: 'Portfolio & Code Audit', desc: 'Every developer application undergoes manual verification and portfolio review.' },
              { title: 'In-Platform Protection', desc: 'Encrypted project chat, attachment logging, and structured dispute mediation.' },
            ].map(item => (
              <div key={item.title} className="p-4 rounded-xl bg-[#121824] border border-slate-800">
                <div className="text-xs font-bold text-slate-200">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</div>
                <span className="text-[10px] text-teal-400/80 font-mono mt-3 inline-block">Active Standard</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-950/60 via-[#121824] to-cyan-950/40 border border-teal-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Ready to hire verified technology talent?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Post your project in minutes or browse verified profiles. Pay only when agreed milestones are delivered to your satisfaction.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all cursor-pointer"
            >
              Explore Projects & Talent
            </button>
            <button
              onClick={() => onNavigate('verification')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              Apply as a Professional
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
