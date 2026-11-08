import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Coins,
  FileCheck,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  Settings,
  Scale,
  CreditCard,
  Flag,
  Plus,
  Trash2,
  Percent,
  Check,
} from 'lucide-react';
import {
  DeveloperApplication,
  Project,
  ProjectApplication,
  User,
  DisputeItem,
  TechDepartment,
  PaymentTransaction,
  UserReport,
} from '../types';
import { store } from '../services/store';
import { formatNgn } from '../utils/marketplaceRules';

interface AdminDashboardProps {
  currentUser: User;
  applications: DeveloperApplication[];
  projects: Project[];
  proposals: ProjectApplication[];
  users: User[];
  disputes?: DisputeItem[];
  departments?: TechDepartment[];
  payments?: PaymentTransaction[];
  userReports?: UserReport[];
  commissionRate?: number;
  onNavigateToFinancialCentre?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  applications,
  projects,
  proposals,
  users,
  disputes = [],
  departments = [],
  payments = [],
  userReports = [],
  commissionRate = 0.12,
  onNavigateToFinancialCentre,
}) => {

  const [activeTab, setActiveTab] = useState<
    'verifications' | 'departments' | 'commission' | 'payments' | 'reports' | 'disputes' | 'projects' | 'credits'
  >('departments');
  const [rejectModalApp, setRejectModalApp] = useState<DeveloperApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Department management state
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'web-dev');
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');

  // Commission management state
  const [commissionInput, setCommissionInput] = useState(Math.round(commissionRate * 100).toString());
  const [commissionSaveMsg, setCommissionSaveMsg] = useState<string | null>(null);

  const pendingApplications = applications.filter(a => a.status === 'Pending Review');
  const approvedApplications = applications.filter(a => a.status === 'Approved');
  const openReports = userReports.filter(r => r.status === 'Open');

  const handleApprove = (uid: string) => {
    store.reviewDeveloperApplication(uid, 'Approved');
  };

  const handleConfirmReject = () => {
    if (rejectModalApp) {
      store.reviewDeveloperApplication(
        rejectModalApp.uid,
        'Rejected',
        rejectionReason || 'Portfolio links did not meet our verification criteria.'
      );
      setRejectModalApp(null);
      setRejectionReason('');
    }
  };

  const handleResetCredits = (uid: string) => {
    store.resetCredits(uid, 15);
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCategoryInput.trim()) return;
    store.addSubcategoryToDepartment(selectedDeptId, newSubCategoryInput.trim());
    setNewSubCategoryInput('');
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(commissionInput);
    if (isNaN(pct) || pct < 1 || pct > 50) {
      alert('Commission rate must be between 1% and 50%');
      return;
    }
    const rateDecimal = pct / 100;
    store.updateCommissionRate(rateDecimal);

    try {
      await fetch('/api/commission-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRate: rateDecimal }),
      });
    } catch {
      // server sync
    }

    setCommissionSaveMsg(`Developer commission successfully set to ${pct}%.`);
    setTimeout(() => setCommissionSaveMsg(null), 3000);
  };

  const activeDepartment = departments.find(d => d.id === selectedDeptId) || departments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              TrustTech Operations Console
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Master administrator suite. Manage technology departments, set 12% commission economics, oversee escrow payments, resolve disputes, and audit developer credentials.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onNavigateToFinancialCentre && (
            <button
              onClick={onNavigateToFinancialCentre}
              className="px-3.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-teal-400" />
              Open Financial Centre
            </button>
          )}
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-800/60">
            Role: Master Admin
          </span>
        </div>
      </div>


      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Pending Developer Audits
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-400">
            {pendingApplications.length}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {approvedApplications.length} verified badges active
          </span>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Tech Departments
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-teal-400">
            {departments.length}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {departments.reduce((acc, d) => acc + d.subCategories.length, 0)} manageable job roles
          </span>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Escrow Transactions
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {payments.length}
          </div>
          <span className="text-[11px] text-emerald-400 block">
            100% In-Platform Payment Guard
          </span>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Marketplace Commission
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-300">
            {Math.round(commissionRate * 100)}%
          </div>
          <span className="text-[11px] text-slate-400 block">
            +2.5% client protection fee
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-6 text-xs sm:text-sm overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'departments'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          10 Tech Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'commission'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          Commission Settings ({Math.round(commissionRate * 100)}%)
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'payments'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payments & Escrow ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'reports'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="w-4 h-4" />
          Reports & Safety ({openReports.length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'verifications'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Verifications ({pendingApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'disputes'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Disputes ({disputes.length})
        </button>
      </div>

      {/* Tab: Departments & Categories */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span>Manage 10 Core Technology Departments and specific sub-roles</span>
            <span>All categories are dynamically linked to project postings and developer profiles</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department List */}
            <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Departments ({departments.length})
              </h3>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {departments.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      selectedDeptId === dept.id
                        ? 'bg-teal-500/10 border border-teal-500/40 text-teal-300'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{dept.name}</div>
                      <div className="text-[10px] text-slate-500">{dept.subCategories.length} sub-roles</div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        dept.isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {dept.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Department Details & Subcategories */}
            {activeDepartment && (
              <div className="lg:col-span-2 bg-[#121824] border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">{activeDepartment.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeDepartment.description}</p>
                    <p className="text-[11px] text-teal-400 mt-1 font-mono">
                      Target Budget Range: {activeDepartment.typicalBudgetRange}
                    </p>
                  </div>
                  <button
                    onClick={() => store.toggleDepartment(activeDepartment.id, !activeDepartment.isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      activeDepartment.isActive
                        ? 'bg-red-950/60 text-red-400 border border-red-800/60 hover:bg-red-900/40'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                    }`}
                  >
                    {activeDepartment.isActive ? 'Disable Department' : 'Activate Department'}
                  </button>
                </div>

                {/* Subcategories (Job Roles) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Specialized Job Titles ({activeDepartment.subCategories.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeDepartment.subCategories.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                      >
                        <span className="truncate">{sub}</span>
                        <button
                          onClick={() => store.removeSubcategoryFromDepartment(activeDepartment.id, sub)}
                          className="text-slate-500 hover:text-red-400 ml-2"
                          title="Remove Job Title"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subcategory Form */}
                  <form onSubmit={handleAddSubcategory} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder={`Add new role to ${activeDepartment.name} (e.g. Senior Rust Engineer)...`}
                      value={newSubCategoryInput}
                      onChange={e => setNewSubCategoryInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubCategoryInput.trim()}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Role
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Commission Settings */}
      {activeTab === 'commission' && (
        <div className="max-w-2xl bg-[#121824] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" /> Marketplace Developer Commission
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Section 3 mandates a <strong>12% developer commission</strong> deducted upon milestone completion. Client protection fee is fixed at 2.5%.
            </p>
          </div>

          {commissionSaveMsg && (
            <div className="p-3 bg-teal-950/60 border border-teal-500/40 rounded-xl text-xs text-teal-300 flex items-center gap-2">
              <Check className="w-4 h-4" /> {commissionSaveMsg}
            </div>
          )}

          <form onSubmit={handleSaveCommission} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Developer Commission Rate (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={commissionInput}
                  onChange={e => setCommissionInput(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-slate-400 font-semibold">% of gross project quote</span>
              </div>
            </div>

            {/* Live Calculation Preview based on input */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider block text-[10px]">
                Example Calculation for ₦250,000 Project:
              </span>
              <div className="flex justify-between text-slate-400">
                <span>Agreed Project Price:</span>
                <span className="text-white font-medium">₦250,000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>TrustTech Commission ({commissionInput}%):</span>
                <span className="text-amber-400 font-semibold">
                  -₦{Math.round(250000 * (parseFloat(commissionInput || '0') / 100)).toLocaleString('en-NG')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Developer Net Earnings:</span>
                <span className="text-emerald-400 font-bold">
                  ₦{Math.round(250000 * (1 - parseFloat(commissionInput || '0') / 100)).toLocaleString('en-NG')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Client 2.5% Escrow Protection Fee:</span>
                <span className="text-slate-300">+₦6,250</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold pt-1">
                <span>Total Client Charge:</span>
                <span className="text-teal-400">₦256,250</span>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg shadow-teal-500/10"
            >
              Update Commission Settings
            </button>
          </form>
        </div>
      )}

      {/* Tab: Payments & Escrow Ledger */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Escrow Transactions Ledger</span>
            <span>Total: {payments.length} Records</span>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center bg-[#121824] border border-slate-800 rounded-xl text-slate-400 text-xs">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(tx => (
                <div
                  key={tx.id}
                  className="p-4 bg-[#121824] border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-400 font-bold">{tx.gatewayReference}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          tx.status === 'Paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : tx.status === 'Released'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <div className="text-white font-medium">
                      {tx.milestoneTitle} ({tx.projectTitle})
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Client: {tx.clientName} &bull; Dev: {tx.developerName} &bull; Method: {tx.paymentMethod}
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div className="text-sm font-bold text-white">{formatNgn(tx.amountNgn)}</div>
                    <div className="text-[11px] text-amber-300">
                      Commission (12%): {formatNgn(tx.commissionNgn)}
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      Dev Net: {formatNgn(tx.developerEarningsNgn)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reports & Moderation */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>User Safety & Policy Violation Reports</span>
            <span>Policy: Strict action against off-platform payment attempts</span>
          </div>

          {userReports.length === 0 ? (
            <div className="p-8 text-center bg-[#121824] border border-slate-800 rounded-xl text-slate-400 text-xs">
              No pending reports in the moderation queue.
            </div>
          ) : (
            <div className="space-y-3">
              {userReports.map(rep => (
                <div
                  key={rep.id}
                  className="p-4 bg-[#121824] border border-slate-800 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-red-950 text-red-400 border border-red-800">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">Reported by: {rep.reportedByName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {rep.details}
                  </p>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500">Status: {rep.status}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => store.updateUserReportStatus(rep.id, 'Action Taken')}
                        className="px-3 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-300 text-xs font-semibold cursor-pointer"
                      >
                        Issue Warning / Suspend
                      </button>
                      <button
                        onClick={() => store.updateUserReportStatus(rep.id, 'Dismissed')}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending applications requiring identity & portfolio audit</span>
            <span>Policy: Check for verifiable GitHub repositories & live projects</span>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center bg-[#121824] border border-slate-800 rounded-xl text-slate-400 text-xs">
              No developer applications in the database.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div
                  key={app.uid}
                  className="p-5 bg-[#121824] border border-slate-800 rounded-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{app.fullName}</h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : app.status === 'Rejected'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {app.professionalTitle} &bull; {app.experience} Level
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {app.email} &bull; UID: {app.uid}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status !== 'Approved' && (
                        <button
                          onClick={() => handleApprove(app.uid)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Developer
                        </button>
                      )}

                      {app.status !== 'Rejected' && (
                        <button
                          onClick={() => setRejectModalApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {app.bio}
                  </div>

                  {/* Skills Array */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Submitted Skills Array ({app.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.skills.map(s => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300 text-[11px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <a
                      href={app.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-400 hover:underline flex items-center gap-1"
                    >
                      Portfolio Showcase
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {app.github && (
                      <a
                        href={app.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:underline flex items-center gap-1"
                      >
                        GitHub Repository
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Disputes Queue */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Milestone Escrow Disputes</span>
            <span>Total: {disputes.length} Disputes</span>
          </div>

          {disputes.length === 0 ? (
            <div className="p-8 text-center bg-[#121824] border border-slate-800 rounded-xl text-slate-400 text-xs">
              No active milestone disputes on record.
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map(disp => (
                <div
                  key={disp.id}
                  className="p-5 bg-[#121824] border border-slate-800 rounded-xl space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40 uppercase font-bold">
                          {disp.status}
                        </span>
                        <span className="text-slate-400">Reason: {disp.reason.replace('_', ' ')}</span>
                      </div>
                      <h4 className="text-base font-bold text-white font-heading">
                        {disp.projectTitle} &bull; {disp.milestoneTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Claimant: <strong className="text-slate-200">{disp.raisedByName}</strong> ({disp.raisedByRole}) &bull; Defendant: <strong className="text-slate-200">{disp.defendantName}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDispute(disp);
                        setResolutionText(disp.proposedResolution || '');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs self-start cursor-pointer"
                    >
                      Mediate & Resolve
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-300 block">Submitted Evidence:</span>
                    <p className="text-slate-400 leading-relaxed">{disp.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dispute Mediation Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-400" />
                Mediate Dispute #{selectedDispute.id}
              </h3>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-slate-400 block font-semibold">Milestone:</span>
                <span className="text-white font-medium">
                  {selectedDispute.milestoneTitle} ({selectedDispute.projectTitle})
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                <span className="text-slate-400 block font-semibold mb-1">Claimant Evidence:</span>
                {selectedDispute.evidence}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mediation Decision & Action:
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  placeholder="Detail the operational resolution (e.g. 24hr fix window granted, partial milestone release, or full refund)..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    store.resolveDispute(selectedDispute.id, 'Resolution Proposed', resolutionText);
                    setSelectedDispute(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Propose Resolution
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.resolveDispute(
                      selectedDispute.id,
                      'Resolved',
                      resolutionText || 'Resolved according to agreed technical specifications.'
                    );
                    setSelectedDispute(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Reject Verification for {rejectModalApp.fullName}
            </h3>
            <p className="text-xs text-slate-400">
              Provide actionable guidance so the developer knows what to improve before reapplying.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Please add at least 2 live production website URLs or verifiable GitHub repositories."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalApp(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
