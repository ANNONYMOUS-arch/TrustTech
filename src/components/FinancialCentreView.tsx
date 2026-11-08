import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  CreditCard,
  Download,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Scale,
  Sparkles,
  Lock,
  Printer,
  ChevronRight,
  X,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Receipt,
  Layers,
  Info,
} from 'lucide-react';
import {
  User,
  AccountType,
  FinancialTransaction,
  DeveloperEarnings,
  DeveloperPayoutAccount,
  PayoutRequest,
  PayoutStatus,
  Subscription,
  SubscriptionPlan,
  Invoice,
  RefundRequest,
  FinancialSettings,
  PaymentTransaction,
  PaymentStatus,
} from '../types';
import { store } from '../services/store';
import { formatNgn, calculateProjectFinancials } from '../utils/marketplaceRules';

interface FinancialCentreViewProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenProjectMilestones?: (projectId: string) => void;
}

export type FinancialSubTab =
  | 'overview'
  | 'wallet'
  | 'payments'
  | 'payouts'
  | 'transactions'
  | 'subscriptions'
  | 'invoices'
  | 'refunds-disputes';

export const FinancialCentreView: React.FC<FinancialCentreViewProps> = ({
  currentUser,
  onNavigateTab,
  onOpenProjectMilestones,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<FinancialSubTab>('overview');

  // Modals state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50000');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalFeedback, setWithdrawalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bank Form State
  const [newBankCode, setNewBankCode] = useState('058');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [bankVerificationResult, setBankVerificationResult] = useState<string | null>(null);

  // Subscription Form State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly_premium');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subFeedback, setSubFeedback] = useState<string | null>(null);

  // Refund Form State
  const [refundProjectId, setRefundProjectId] = useState<string>('');
  const [refundMilestoneId, setRefundMilestoneId] = useState<string>('');
  const [refundReason, setRefundReason] = useState<RefundRequest['reason']>('milestone_unfulfilled');
  const [refundDetails, setRefundDetails] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const state = store.getState();
  const isAdmin = currentUser.accountType === 'admin';
  const isDeveloper = currentUser.accountType === 'developer';
  const isClient = currentUser.accountType === 'client';

  // Role scoped data
  const developerEarnings = state.developerEarnings[currentUser.uid] || {
    developerUid: currentUser.uid,
    developerName: currentUser.fullName,
    totalGrossEarningsNgn: isDeveloper ? 480000 : 0,
    totalCommissionDeductedNgn: isDeveloper ? 57600 : 0,
    totalNetEarningsNgn: isDeveloper ? 422400 : 0,
    availableBalanceNgn: isDeveloper ? 272400 : 0,
    pendingBalanceNgn: isDeveloper ? 66000 : 0,
    totalWithdrawnNgn: isDeveloper ? 150000 : 0,
    lastUpdated: new Date().toISOString(),
  };

  const myPayoutAccounts = state.developerPayoutAccounts.filter(
    b => b.developerUid === currentUser.uid || isAdmin
  );

  const myPayoutRequests = state.payoutRequests.filter(
    p => p.developerUid === currentUser.uid || isAdmin
  );

  const myTransactions = useMemo(() => {
    return state.financialTransactions.filter(t => {
      if (isAdmin) return true;
      return t.userId === currentUser.uid || t.counterpartyId === currentUser.uid;
    });
  }, [state.financialTransactions, currentUser.uid, isAdmin]);

  const myPayments = useMemo(() => {
    return state.payments.filter(p => {
      if (isAdmin) return true;
      return p.clientUid === currentUser.uid || p.developerUid === currentUser.uid;
    });
  }, [state.payments, currentUser.uid, isAdmin]);

  const myInvoices = useMemo(() => {
    return state.invoices.filter(inv => {
      if (isAdmin) return true;
      return inv.billedTo.uid === currentUser.uid;
    });
  }, [state.invoices, currentUser.uid, isAdmin]);

  const activeSubscription = state.subscriptions.find(
    s => s.userId === currentUser.uid && s.status === 'active'
  );

  // Administration Aggregate KPIs
  const adminMetrics = useMemo(() => {
    const totalGmv = state.payments.reduce((sum, p) => sum + (p.amountNgn || 0), 0);
    const totalCommission = state.payments.reduce((sum, p) => sum + (p.commissionNgn || 0), 0);
    const totalDevNet = state.payments.reduce((sum, p) => sum + (p.developerEarningsNgn || 0), 0);
    const pendingPayouts = state.payoutRequests.filter(p => p.status === 'Pending' || p.status === 'Processing');
    const pendingPayoutAmount = pendingPayouts.reduce((sum, p) => sum + p.amountNgn, 0);
    const subRevenue = state.subscriptions.reduce((sum, s) => sum + s.amountNgn, 0);

    return {
      totalGmv,
      totalCommission,
      totalDevNet,
      pendingPayoutCount: pendingPayouts.length,
      pendingPayoutAmount,
      subRevenue,
      refundCount: state.refundRequests.filter(r => r.status === 'Pending Review').length,
      disputeCount: state.disputes.filter(d => d.status !== 'Resolved' && d.status !== 'Closed').length,
    };
  }, [state.payments, state.payoutRequests, state.subscriptions, state.refundRequests, state.disputes]);

  // Handle Bank Account Verification
  const handleVerifyAndAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountNumber || newAccountNumber.trim().length !== 10) {
      setBankVerificationResult('Please provide a valid 10-digit NUBAN account number.');
      return;
    }

    setIsVerifyingBank(true);
    setBankVerificationResult(null);

    try {
      const res = await fetch('/api/financial/bank-account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerUid: currentUser.uid,
          bankCode: newBankCode,
          accountNumber: newAccountNumber.trim(),
          accountName: newAccountName.trim() || currentUser.fullName,
        }),
      });

      const data = await res.json();
      if (data.success && data.account) {
        store.addPayoutAccount(data.account);
        setBankVerificationResult(`Verified: ${data.account.accountName} (${data.account.bankName})`);
        setTimeout(() => {
          setShowAddBankModal(false);
          setNewAccountNumber('');
          setNewAccountName('');
          setBankVerificationResult(null);
        }, 1200);
      } else {
        setBankVerificationResult(data.error || 'Verification failed. Please check account details.');
      }
    } catch {
      // Local fallback
      const bankNames: Record<string, string> = {
        '058': 'Guaranty Trust Bank (GTBank)',
        '044': 'Access Bank',
        '057': 'Zenith Bank',
        '011': 'First Bank of Nigeria',
        '033': 'United Bank for Africa (UBA)',
        '221': 'Stanbic IBTC Bank',
        '50211': 'Kuda Microfinance Bank',
        '50515': 'Moniepoint Microfinance Bank',
      };
      const created = store.addPayoutAccount({
        developerUid: currentUser.uid,
        bankCode: newBankCode,
        bankName: bankNames[newBankCode] || 'Commercial Bank',
        accountNumber: newAccountNumber.trim(),
        accountName: newAccountName.trim().toUpperCase() || currentUser.fullName.toUpperCase(),
        isVerified: true,
        isPrimary: true,
      });
      setBankVerificationResult(`Verified: ${created.accountName} (${created.bankName})`);
      setTimeout(() => {
        setShowAddBankModal(false);
        setNewAccountNumber('');
        setNewAccountName('');
        setBankVerificationResult(null);
      }, 1000);
    } finally {
      setIsVerifyingBank(false);
    }
  };

  // Handle Withdrawal Request
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < 5000) {
      setWithdrawalFeedback({ type: 'error', message: 'Minimum withdrawal is ₦5,000.' });
      return;
    }

    if (amount > developerEarnings.availableBalanceNgn) {
      setWithdrawalFeedback({
        type: 'error',
        message: `Amount exceeds your available balance of ${formatNgn(developerEarnings.availableBalanceNgn)}.`,
      });
      return;
    }

    const targetAccount = myPayoutAccounts.find(b => b.id === selectedBankAccountId) || myPayoutAccounts[0];
    if (!targetAccount) {
      setWithdrawalFeedback({ type: 'error', message: 'Please add and select a verified bank account first.' });
      return;
    }

    setIsSubmittingWithdrawal(true);
    setWithdrawalFeedback(null);

    const idempotencyKey = `idem-${currentUser.uid}-${amount}-${Date.now()}`;

    try {
      // Call server backend
      await fetch('/api/financial/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerUid: currentUser.uid,
          developerName: currentUser.fullName,
          developerEmail: currentUser.email,
          bankAccountId: targetAccount.id,
          bankName: targetAccount.bankName,
          accountNumber: targetAccount.accountNumber,
          accountName: targetAccount.accountName,
          amountNgn: amount,
          idempotencyKey,
        }),
      });

      // Synchronize in local store
      const result = store.requestPayout({
        developerUid: currentUser.uid,
        amountNgn: amount,
        bankAccountId: targetAccount.id,
        idempotencyKey,
      });

      if (result.success && result.payout) {
        setWithdrawalFeedback({
          type: 'success',
          message: `Withdrawal of ${formatNgn(amount)} queued successfully. Ref: ${result.payout.providerReference}`,
        });
        setTimeout(() => {
          setShowWithdrawModal(false);
          setWithdrawalFeedback(null);
        }, 1500);
      } else {
        setWithdrawalFeedback({ type: 'error', message: result.error || 'Failed to queue withdrawal.' });
      }
    } catch {
      setWithdrawalFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  // Handle Subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubFeedback(null);

    try {
      const res = await fetch('/api/financial/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.fullName,
          userEmail: currentUser.email,
          plan: selectedPlan,
          paymentMethod: 'Paystack Card Checkout',
        }),
      });

      const data = await res.json();
      if (data.success && data.subscription) {
        store.createSubscription(currentUser.uid, selectedPlan);
        setSubFeedback('Subscription activated successfully! Enjoy Pro access.');
        setTimeout(() => {
          setShowSubscriptionModal(false);
          setSubFeedback(null);
        }, 1200);
      } else {
        setSubFeedback(data.error || 'Subscription checkout failed.');
      }
    } catch {
      store.createSubscription(currentUser.uid, selectedPlan);
      setSubFeedback('Subscription activated successfully!');
      setTimeout(() => {
        setShowSubscriptionModal(false);
        setSubFeedback(null);
      }, 1000);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle Refund Submit
  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundProjectId || !refundMilestoneId) return;

    const proj = state.projects.find(p => p.id === refundProjectId);
    const milestone = proj?.milestones.find(m => m.id === refundMilestoneId);
    if (!proj || !milestone) return;

    setIsSubmittingRefund(true);
    store.requestRefund({
      projectId: proj.id,
      projectTitle: proj.title,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      clientUid: currentUser.uid,
      clientName: currentUser.fullName,
      developerUid: proj.hiredDeveloperUid || 'user-dev-verified',
      developerName: 'Chidinma Okafor',
      amountNgn: milestone.amountNgn,
      reason: refundReason,
      details: refundDetails,
    });

    setIsSubmittingRefund(false);
    setShowRefundModal(false);
    setRefundDetails('');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return myTransactions.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = t.providerReference.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesUser = t.userName.toLowerCase().includes(q);
        const matchesId = t.id.toLowerCase().includes(q);
        if (!matchesRef && !matchesDesc && !matchesUser && !matchesId) return false;
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      return true;
    });
  }, [myTransactions, searchQuery, statusFilter, typeFilter]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Description', 'Amount (NGN)', 'Commission (12%)', 'Client Fee (2.5%)', 'Net Amount', 'Status', 'Provider Reference'];
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.timestamp).toLocaleDateString('en-GB'),
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amountNgn,
      t.commissionNgn,
      t.clientFeeNgn,
      t.netAmountNgn,
      t.status,
      t.providerReference,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trusttech_financial_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              12% Commission Model &bull; Verified Ledger
            </span>
            <span className="text-xs text-slate-400">
              Active Mode: <strong className="text-white capitalize">{currentUser.accountType}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1 flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-teal-400" />
            TrustTech Financial Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Authoritative financial ledger, transparent 12% marketplace commission, developer earnings wallet, client milestone payments, and automated payout disbursement.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {isDeveloper && (
            <button
              onClick={() => {
                if (myPayoutAccounts.length === 0) {
                  setShowAddBankModal(true);
                } else {
                  setShowWithdrawModal(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              Request Withdrawal
            </button>
          )}

          {isClient && (
            <button
              onClick={() => onNavigateTab('dashboard-business')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Fund Milestone Deposit
            </button>
          )}

          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {activeSubscription ? 'Manage Subscription' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      {/* Verbatim In-Platform Payment Safety Notice */}
      <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300 font-semibold">Payment Safety Notice: </strong>
          For your safety and protection, always keep communications and payments on TrustTech. Transactions completed outside TrustTech are not protected by our escrow system or customer support. Failure to comply may lead to account suspension.
        </div>
      </div>

      {/* Main 8-Tab Navigation Bar */}
      <div className="border-b border-slate-800 flex overflow-x-auto no-scrollbar space-x-1 sm:space-x-2 text-xs sm:text-sm">
        {[
          { id: 'overview', label: 'Financial Overview', icon: TrendingUp },
          { id: 'wallet', label: 'Wallet', icon: Wallet },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'payouts', label: 'Payouts', icon: ArrowUpRight },
          { id: 'transactions', label: 'Transactions', icon: Receipt },
          { id: 'subscriptions', label: 'Subscriptions', icon: Sparkles },
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'refunds-disputes', label: 'Refunds & Disputes', icon: Scale },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as FinancialSubTab)}
              className={`pb-3 px-3 pt-1 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? 'border-teal-500 text-teal-400 bg-teal-500/5 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: FINANCIAL OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Role-Specific Overview Banner & Metrics */}
          {isDeveloper && (
            <div className="space-y-6">
              {/* Developer Hero Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Available for Payout
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                    {formatNgn(developerEarnings.availableBalanceNgn)}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cleared net earnings
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Pending in Milestones
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                    {formatNgn(developerEarnings.pendingBalanceNgn)}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Locked in milestone review
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Gross Completed Work
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {formatNgn(developerEarnings.totalGrossEarningsNgn)}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Approved project totals
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    TrustTech Fee (12%)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-300">
                    {formatNgn(developerEarnings.totalCommissionDeductedNgn)}
                  </div>
                  <span className="text-[11px] text-teal-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 88% net kept by you
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Total Withdrawn
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">
                    {formatNgn(developerEarnings.totalWithdrawnNgn)}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> Settled to bank account
                  </span>
                </div>
              </div>

              {/* Bank Payout Setup Prompt (shown to approved developers when eligible) */}
              {myPayoutAccounts.length === 0 ? (
                <div className="p-5 bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building className="w-5 h-5 text-teal-400" />
                      Configure Your Nigerian Bank Payout Account
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      You are an approved TrustTech professional. Link and verify your 10-digit NUBAN bank account to enable instant, 1-click withdrawals when milestones are released.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow cursor-pointer shrink-0"
                  >
                    Link Bank Account
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-white font-semibold">Primary Payout Bank: </span>
                      <span className="text-slate-300">{myPayoutAccounts[0].bankName} ({myPayoutAccounts[0].accountNumber})</span>
                      <span className="ml-2 px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                        VERIFIED NUBAN
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('wallet')}
                    className="text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Manage Accounts <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {isClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Total Deposited into Escrow
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {formatNgn(myPayments.reduce((acc, p) => acc + (p.totalPaidByClientNgn || 0), 0))}
                  </div>
                  <span className="text-[11px] text-teal-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Across all milestones
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Active Escrow Protection
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                    100%
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> 7-day review window
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    In-Platform Fee (2.5%)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-300">
                    {formatNgn(myPayments.reduce((acc, p) => acc + (p.clientFeeNgn || 0), 0))}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Transparent dispute guarantee
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Total Invoices
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">
                    {myInvoices.length}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Downloadable VAT receipts
                  </span>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Platform GMV (Project Payments)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {formatNgn(adminMetrics.totalGmv)}
                  </div>
                  <span className="text-[11px] text-teal-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Total marketplace volume
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    TrustTech 12% Commissions
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">
                    {formatNgn(adminMetrics.totalCommission)}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Platform net revenue
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Pending Payouts Queue
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                    {adminMetrics.pendingPayoutCount} ({formatNgn(adminMetrics.pendingPayoutAmount)})
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Bank wire batch pending
                  </span>
                </div>

                <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Subscription Revenue
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-400">
                    {formatNgn(adminMetrics.subRevenue)}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Monthly & Yearly Pro
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Table Preview */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  Recent Ledger Transactions
                </h3>
                <p className="text-xs text-slate-400">
                  Immutable financial activity authenticated by TrustTech backend ledger.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('transactions')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View Complete Ledger <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Amount (₦)</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.slice(0, 5).map(txn => (
                    <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300">{txn.id}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(txn.timestamp).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                          {txn.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {txn.description}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-white">
                        {formatNgn(txn.amountNgn)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          txn.status === 'Paid' || txn.status === 'Released'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : txn.status === 'Pending' || txn.status === 'Processing'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-red-950 text-red-400 border border-red-800/40'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DEVELOPER WALLET */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-6">
          {/* Wallet Header & Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Balance Hero Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#121c2e] via-[#0f172a] to-[#0b1120] border border-teal-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">TrustTech Developer Wallet</h3>
                    <p className="text-xs text-slate-400">Financial Ledger &amp; Earnings Account</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  12% Commission Transparent
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Available for Immediate Withdrawal
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1">
                  {formatNgn(developerEarnings.availableBalanceNgn)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Minimum withdrawal threshold: <strong>₦5,000</strong> &bull; Zero transfer fee
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pending in Milestones</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {formatNgn(developerEarnings.pendingBalanceNgn)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Net Earnings (88%)</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatNgn(developerEarnings.totalNetEarningsNgn)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Withdrawn</span>
                  <span className="font-mono font-bold text-teal-400 text-sm">
                    {formatNgn(developerEarnings.totalWithdrawnNgn)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (myPayoutAccounts.length === 0) {
                      setShowAddBankModal(true);
                    } else {
                      setShowWithdrawModal(true);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Request Withdrawal
                </button>
                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-teal-400" />
                  Link New Bank Account
                </button>
              </div>
            </div>

            {/* Commission Policy & Regulatory Notice */}
            <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold block">
                  Transparent 12% Fee Rule
                </span>
                <h4 className="text-sm font-bold text-white">How Earnings are Calculated</h4>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Project Contract Quote:</span>
                    <span className="font-mono text-white">₦200,000</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TrustTech Commission (12%):</span>
                    <span className="font-mono text-amber-300">-₦24,000</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-white">
                    <span>Developer Net Share (88%):</span>
                    <span className="font-mono text-emerald-400">₦176,000</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Commissions are calculated securely on backend release. No hidden deductions or platform markup.
                </p>
              </div>

              {/* Regulatory Notice (As strictly required in prompt) */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  The TrustTech Developer Wallet is an internal financial ledger and earnings display. It is not an independent bank account or deposit-taking institution. Actual payout disbursements route through authorized financial partners.
                </p>
              </div>
            </div>
          </div>

          {/* Linked Bank Accounts */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-400" />
                  Linked Bank Accounts ({myPayoutAccounts.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Verified Nigerian commercial bank accounts for automatic payout settlement.
                </p>
              </div>
              <button
                onClick={() => setShowAddBankModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bank
              </button>
            </div>

            {myPayoutAccounts.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
                <Building className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No payout accounts linked yet. Add a bank account to receive withdrawals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPayoutAccounts.map(acc => (
                  <div
                    key={acc.id}
                    className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold border border-teal-500/20">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{acc.bankName}</h4>
                          {acc.isPrimary && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Account: ****{acc.accountNumber.slice(-4)} &bull; {acc.accountName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout History Table */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-teal-400" />
              Withdrawal &amp; Payout History
            </h3>

            {myPayoutRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl">
                No withdrawal requests have been placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Payout ID</th>
                      <th className="py-3 px-4">Requested Date</th>
                      <th className="py-3 px-4">Bank &amp; Account</th>
                      <th className="py-3 px-4 text-right">Amount (₦)</th>
                      <th className="py-3 px-4 text-right">Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myPayoutRequests.map(payout => (
                      <tr key={payout.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-300 font-semibold">{payout.id}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(payout.requestedAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {payout.bankName} (***{payout.accountNumber.slice(-4)})
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-right text-emerald-400">
                          {formatNgn(payout.amountNgn)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            payout.status === 'Successful'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : payout.status === 'Processing'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : payout.status === 'Pending'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Remittance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PAYMENTS DASHBOARD */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-400" />
                Project Milestone Payments
              </h3>
              <p className="text-xs text-slate-400">
                Track payments across project milestones, escrow fundings, and receipts.
              </p>
            </div>
            {isClient && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                Request Refund
              </button>
            )}
          </div>

          <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Project &amp; Milestone</th>
                    <th className="py-3.5 px-4">Parties</th>
                    <th className="py-3.5 px-4">Milestone (₦)</th>
                    <th className="py-3.5 px-4">12% Commission</th>
                    <th className="py-3.5 px-4">Client Total Charged</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No payments found for this account.
                      </td>
                    </tr>
                  ) : (
                    myPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <strong className="text-white block truncate">{p.projectTitle}</strong>
                          <span className="text-[11px] text-teal-400">{p.milestoneTitle}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div>Client: <span className="text-white">{p.clientName}</span></div>
                          <div className="text-[11px] text-slate-400">Dev: {p.developerName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {formatNgn(p.amountNgn)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-300">
                          {formatNgn(p.commissionNgn)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                          {formatNgn(p.totalPaidByClientNgn)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            p.status === 'Paid' || p.status === 'Released'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : p.status === 'Refund Pending'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : p.status === 'Refunded'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenProjectMilestones && (
                              <button
                                onClick={() => onOpenProjectMilestones(p.projectId)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400"
                                title="Open Milestones"
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PAYOUTS (WORKFLOW & MANAGEMENT) */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-teal-400" />
                Developer Payout Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end bank transfer settlement pipeline via authorized Nigerian financial partners.
              </p>
            </div>
            {isDeveloper && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <ArrowUpRight className="w-4 h-4" /> Request Payout
              </button>
            )}
          </div>

          {/* Workflow Stage Steps Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-[#121824] border border-slate-800 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold">Stage 01</span>
              <h4 className="text-xs font-bold text-white">Milestone Approved</h4>
              <p className="text-[11px] text-slate-400">Client inspects code &amp; signs off deliverable.</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold">Stage 02</span>
              <h4 className="text-xs font-bold text-white">12% Commission</h4>
              <p className="text-[11px] text-slate-400">Calculated securely; net credited to wallet balance.</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold">Stage 03</span>
              <h4 className="text-xs font-bold text-white">Withdrawal Dispatched</h4>
              <p className="text-[11px] text-slate-400">NUBAN verified &amp; queued to payment partner API.</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Stage 04</span>
              <h4 className="text-xs font-bold text-white">Bank Credit</h4>
              <p className="text-[11px] text-slate-400">NIBSS transfer settles into commercial bank account.</p>
            </div>
          </div>

          {/* Admin Payout Queue Management */}
          {isAdmin && (
            <div className="bg-[#121824] border border-teal-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Administrator Payout Authorization Queue
                  </h4>
                  <p className="text-xs text-slate-400">
                    Review, approve, or mark payouts processed via payment partner transfer API.
                  </p>
                </div>
                <span className="text-xs font-mono text-teal-400 font-bold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                  {state.payoutRequests.filter(p => p.status === 'Pending').length} Pending Requests
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Developer</th>
                      <th className="py-2.5 px-3">Bank Details</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3 text-right">Admin Transition Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {state.payoutRequests.map(p => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 text-white font-medium">
                          {p.developerName}
                          <span className="block text-[10px] text-slate-400 font-mono">{p.id}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {p.bankName} - {p.accountNumber} ({p.accountName})
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">
                          {formatNgn(p.amountNgn)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            p.status === 'Successful'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : p.status === 'Processing'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status === 'Pending' && (
                              <button
                                onClick={() => store.processPayout(p.id, 'Processing', 'Transferred to payment partner queue')}
                                className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-semibold rounded cursor-pointer"
                              >
                                Mark Processing
                              </button>
                            )}
                            {p.status !== 'Successful' && (
                              <button
                                onClick={() => store.processPayout(p.id, 'Successful', 'Bank transfer verified by payment partner webhook')}
                                className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold rounded cursor-pointer"
                              >
                                Mark Settled
                              </button>
                            )}
                            {p.status !== 'Failed' && p.status !== 'Successful' && (
                              <button
                                onClick={() => store.processPayout(p.id, 'Failed', 'Incorrect beneficiary details / Network reversal')}
                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-semibold rounded cursor-pointer"
                              >
                                Reject &amp; Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* List of Developer Payouts */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Historical Disbursements</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Payout ID</th>
                    <th className="py-3 px-4">Requested At</th>
                    <th className="py-3 px-4">Bank Network</th>
                    <th className="py-3 px-4">Transfer Reference</th>
                    <th className="py-3 px-4 text-right">Disbursed (₦)</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myPayoutRequests.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-white">{p.id}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(p.requestedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.bankName} - ***{p.accountNumber.slice(-4)}
                      </td>
                      <td className="py-3 px-4 font-mono text-teal-400">{p.providerReference}</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-emerald-400">
                        {formatNgn(p.amountNgn)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          p.status === 'Successful'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : p.status === 'Processing'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: FINANCIAL TRANSACTIONS LEDGER */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-400" />
                Authoritative Financial Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Filterable, immutable record of all project deposits, 12% commission deductions, payouts, and subscriptions.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" /> Export CSV Ledger
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#121824] p-4 rounded-xl border border-slate-800 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reference, description, or ID..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Refunded">Refunded</option>
                <option value="Released">Released</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 whitespace-nowrap">Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Types</option>
                <option value="milestone_payment">Milestone Payment</option>
                <option value="commission_deduction">12% Commission Deduction</option>
                <option value="milestone_release">Milestone Release</option>
                <option value="payout_withdrawal">Payout Withdrawal</option>
                <option value="subscription_payment">Subscription Payment</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Event &amp; Description</th>
                    <th className="py-3.5 px-4">Provider Ref</th>
                    <th className="py-3.5 px-4 text-right">Gross (₦)</th>
                    <th className="py-3.5 px-4 text-right">12% Fee (₦)</th>
                    <th className="py-3.5 px-4 text-right">Net (₦)</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No transactions found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">{t.id}</td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(t.timestamp).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3.5 px-4 max-w-sm">
                          <span className="font-semibold text-white block capitalize">
                            {t.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {t.description}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-teal-400">
                          {t.providerReference}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-white">
                          {formatNgn(t.amountNgn)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right text-amber-300">
                          {t.commissionNgn > 0 ? `-${formatNgn(t.commissionNgn)}` : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                          {formatNgn(t.netAmountNgn)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            t.status === 'Paid' || t.status === 'Released'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : t.status === 'Pending' || t.status === 'Processing'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: TRUSTTECH PREMIUM SUBSCRIPTIONS */}
      {activeSubTab === 'subscriptions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              TrustTech Premium Subscriptions
            </h3>
            <p className="text-xs text-slate-400">
              Official proposed subscription pricing plans for businesses and verified technology professionals.
            </p>
          </div>

          {/* Active Subscription Status Banner */}
          {activeSubscription ? (
            <div className="p-5 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                    ACTIVE SUBSCRIPTION
                  </span>
                  <span className="text-xs text-slate-400">Plan: <strong className="text-white capitalize">{activeSubscription.plan.replace(/_/g, ' ')}</strong></span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  {formatNgn(activeSubscription.amountNgn)} / {activeSubscription.billingCycle}
                </h4>
                <p className="text-xs text-slate-300">
                  Renews on: <strong>{new Date(activeSubscription.renewalDate).toLocaleDateString('en-GB')}</strong> &bull; Coding Studio Pro unlocked
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => store.cancelSubscription(currentUser.uid)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
                >
                  Cancel Auto-Renew
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Info className="w-4 h-4 text-teal-400" />
                <span>You are currently on the TrustTech Free Tier. Upgrade to Pro for unlimited coding studio access and direct recruiter alerts.</span>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan 1: Monthly Premium */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              activeSubscription?.plan === 'monthly_premium'
                ? 'bg-slate-900/90 border-teal-500 shadow-xl'
                : 'bg-[#121824] border-slate-800'
            } space-y-6 flex flex-col justify-between`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                      Monthly Plan
                    </span>
                    <h4 className="text-xl font-bold font-heading text-white mt-0.5">
                      TrustTech Monthly Premium
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    Flexible
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">₦5,000</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    Unlimited proposal submissions on all listings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    Priority placement in client search results
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    TrustTech Verified Pro profile badge
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    Direct client messaging alerts
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('monthly_premium');
                  setShowSubscriptionModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 cursor-pointer transition-colors"
              >
                {activeSubscription?.plan === 'monthly_premium' ? 'Current Active Plan' : 'Subscribe Monthly (₦5,000)'}
              </button>
            </div>

            {/* Plan 2: Yearly Premium Pro */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              activeSubscription?.plan === 'yearly_premium_pro'
                ? 'bg-slate-900/90 border-purple-500 shadow-xl'
                : 'bg-gradient-to-br from-[#151c2d] to-[#121824] border-purple-500/40'
            } space-y-6 flex flex-col justify-between relative`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Best Value &bull; Save ₦20,000
                    </span>
                    <h4 className="text-xl font-bold font-heading text-white mt-0.5">
                      Yearly Premium Pro
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Pro Studio Included
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">₦150,000</span>
                  <span className="text-xs text-slate-400">/ year</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Full unlimited access to <strong>TrustTech Coding Studio</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    All Monthly Premium features included for 12 months
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Priority dispute mediation and escrow review guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Dedicated partner operations engineer support
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('yearly_premium_pro');
                  setShowSubscriptionModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 cursor-pointer transition-colors"
              >
                {activeSubscription?.plan === 'yearly_premium_pro' ? 'Current Active Plan' : 'Subscribe Yearly (₦150,000)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: OFFICIAL INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Tax Invoices &amp; Transaction Receipts
              </h3>
              <p className="text-xs text-slate-400">
                Downloadable, printable tax invoices with official TrustTech corporate RC registration numbers.
              </p>
            </div>
          </div>

          <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Date Issued</th>
                    <th className="py-3.5 px-4">Billed To</th>
                    <th className="py-3.5 px-4">Line Item Summary</th>
                    <th className="py-3.5 px-4 text-right">Total (₦)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(inv.issuedDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {inv.billedTo.name}
                        {inv.billedTo.company && <span className="block text-[11px] text-slate-400">{inv.billedTo.company}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {inv.lineItems[0]?.description || 'Service Invoice'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-right text-teal-400">
                        {formatNgn(inv.totalNgn)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: REFUNDS & DISPUTES */}
      {activeSubTab === 'refunds-disputes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-400" />
                Refunds &amp; Dispute Arbitration
              </h3>
              <p className="text-xs text-slate-400">
                Transparent mediation queue governed by TrustTech escrow and dispute resolution rules.
              </p>
            </div>
            {isClient && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-teal-400" /> Submit Refund Request
              </button>
            )}
          </div>

          {/* Refund Requests List */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-teal-400" />
              Active Refund Requests ({state.refundRequests.length})
            </h4>

            {state.refundRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl">
                No active refund requests found. Escrow settlements are healthy.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Refund ID</th>
                      <th className="py-2.5 px-3">Project &amp; Milestone</th>
                      <th className="py-2.5 px-3">Applicant</th>
                      <th className="py-2.5 px-3">Reason &amp; Details</th>
                      <th className="py-2.5 px-3 text-right">Amount (₦)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Admin Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {state.refundRequests.map(ref => (
                      <tr key={ref.id}>
                        <td className="py-2.5 px-3 font-mono text-white font-semibold">{ref.id}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <strong>{ref.projectTitle}</strong>
                          <span className="block text-[11px] text-slate-400">{ref.milestoneTitle}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{ref.clientName}</td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                          {ref.reason}: {ref.details}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-amber-300">
                          {formatNgn(ref.amountNgn)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            {ref.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => store.processRefund(ref.id, true, 'Approved by trust & safety review')}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-[10px] font-semibold cursor-pointer"
                              >
                                Approve Refund
                              </button>
                              <button
                                onClick={() => store.processRefund(ref.id, false, 'Deliverables verified compliant with scope')}
                                className="px-2 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded text-[10px] font-semibold cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Disputes Queue */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              Active Project Disputes ({state.disputes.length})
            </h4>

            <div className="space-y-3">
              {state.disputes.map(disp => (
                <div key={disp.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{disp.projectTitle} - {disp.milestoneTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {disp.status}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    Raised by <strong>{disp.raisedByName}</strong> ({disp.raisedByRole}): &quot;{disp.evidence}&quot;
                  </p>
                  {disp.proposedResolution && (
                    <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-teal-300">
                      Proposed Resolution: {disp.proposedResolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: REQUEST WITHDRAWAL MODAL --- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101726] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Withdraw Developer Earnings</h3>
                  <p className="text-xs text-slate-400">Disbursed directly to your verified Nigerian bank</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="p-6 space-y-4 text-xs">
              {withdrawalFeedback && (
                <div className={`p-3 rounded-xl flex items-center gap-2 ${
                  withdrawalFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border border-red-800 text-red-300'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{withdrawalFeedback.message}</span>
                </div>
              )}

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-[11px] block">Current Available Balance</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {formatNgn(developerEarnings.availableBalanceNgn)}
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Withdrawal Amount (₦ NGN)
                </label>
                <input
                  type="number"
                  min="5000"
                  max={developerEarnings.availableBalanceNgn}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Minimum withdrawal is ₦5,000. No switch fees.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Select Verified Bank Account
                </label>
                {myPayoutAccounts.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setShowAddBankModal(true);
                    }}
                    className="w-full py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + Link Bank Account First
                  </button>
                ) : (
                  <select
                    value={selectedBankAccountId || myPayoutAccounts[0]?.id}
                    onChange={e => setSelectedBankAccountId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    {myPayoutAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} — ****{b.accountNumber.slice(-4)} ({b.accountName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Gross Withdrawal:</span>
                  <span className="font-mono text-white">{formatNgn(Number(withdrawAmount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transfer Fee:</span>
                  <span className="font-mono text-emerald-400">₦0 (Covered by TrustTech)</span>
                </div>
                <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-white">
                  <span>Beneficiary Receives:</span>
                  <span className="font-mono text-teal-400">{formatNgn(Number(withdrawAmount) || 0)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdrawal || developerEarnings.availableBalanceNgn < 5000}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingWithdrawal ? 'Queuing Transfer...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: LINK BANK ACCOUNT MODAL --- */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101726] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Link Bank Account</h3>
                  <p className="text-xs text-slate-400">NUBAN Name Resolution &amp; Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyAndAddBank} className="p-6 space-y-4 text-xs">
              {bankVerificationResult && (
                <div className="p-3 bg-teal-950/60 border border-teal-800 text-teal-300 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{bankVerificationResult}</span>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Commercial Bank
                </label>
                <select
                  value={newBankCode}
                  onChange={e => setNewBankCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="058">Guaranty Trust Bank (GTBank)</option>
                  <option value="044">Access Bank</option>
                  <option value="057">Zenith Bank</option>
                  <option value="011">First Bank of Nigeria</option>
                  <option value="033">United Bank for Africa (UBA)</option>
                  <option value="221">Stanbic IBTC Bank</option>
                  <option value="50211">Kuda Microfinance Bank</option>
                  <option value="50515">Moniepoint Microfinance Bank</option>
                  <option value="999992">OPay / PalmPay</option>
                  <option value="101">Providus Bank</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  10-Digit NUBAN Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={newAccountNumber}
                  onChange={e => setNewAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 0148928371"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Account Name (As registered with your bank)
                </label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  placeholder={currentUser.fullName.toUpperCase()}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must match the name on your verified TrustTech profile.
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingBank || newAccountNumber.length !== 10}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingBank ? 'Verifying NUBAN...' : 'Verify & Link Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: SUBSCRIPTION CHECKOUT MODAL --- */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101726] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">TrustTech Premium Subscription</h3>
                  <p className="text-xs text-slate-400">Unlock Pro Studio &amp; Priority Marketplace Placement</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubscribe} className="p-6 space-y-4 text-xs">
              {subFeedback && (
                <div className="p-3 bg-purple-950/60 border border-purple-800 text-purple-300 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{subFeedback}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Select Billing Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly_premium')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPlan === 'monthly_premium'
                        ? 'border-teal-500 bg-teal-500/10 shadow'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white block">Monthly Premium</span>
                    <span className="text-base font-mono font-bold text-teal-400 mt-1 block">₦5,000</span>
                    <span className="text-[10px] text-slate-400">Billed monthly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan('yearly_premium_pro')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPlan === 'yearly_premium_pro'
                        ? 'border-purple-500 bg-purple-500/10 shadow'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white block">Yearly Pro</span>
                    <span className="text-base font-mono font-bold text-purple-400 mt-1 block">₦150,000</span>
                    <span className="text-[10px] text-purple-300">Save ₦20k + Studio</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Payment Method</label>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    <span className="text-white font-medium">Paystack Card / Direct Bank Debit</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">SECURE 256-BIT</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {isSubscribing ? 'Processing...' : `Pay ${selectedPlan === 'yearly_premium_pro' ? '₦150,000' : '₦5,000'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: INVOICE / RECEIPT VIEWER --- */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101726] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                TrustTech Tax Invoice: {selectedInvoice.invoiceNumber}
              </span>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">{selectedInvoice.issuer.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{selectedInvoice.issuer.address}</p>
                  <p className="font-mono text-slate-400 mt-1">
                    RC: {selectedInvoice.issuer.rcNumber} &bull; VAT: {selectedInvoice.issuer.vatNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    {selectedInvoice.status}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">Date: {new Date(selectedInvoice.issuedDate).toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Billed To</span>
                  <strong className="text-white text-sm block mt-0.5">{selectedInvoice.billedTo.name}</strong>
                  {selectedInvoice.billedTo.company && <span className="text-slate-300 block">{selectedInvoice.billedTo.company}</span>}
                  <span className="text-slate-400">{selectedInvoice.billedTo.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Payment Details</span>
                  <span className="text-white block mt-0.5 font-medium">{selectedInvoice.paymentMethod}</span>
                  <span className="font-mono text-teal-400 block text-[11px]">{selectedInvoice.providerReference}</span>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvoice.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-white">{item.description}</td>
                      <td className="p-3 text-right font-mono text-white">{formatNgn(item.amountNgn)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/60 font-bold text-white border-t border-slate-700">
                    <td className="p-3">Total Amount Paid</td>
                    <td className="p-3 text-right font-mono text-teal-400 text-sm">{formatNgn(selectedInvoice.totalNgn)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: SUBMIT REFUND REQUEST --- */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101726] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Submit Milestone Refund Request</h3>
                  <p className="text-xs text-slate-400">TrustTech Escrow Protection Review</p>
                </div>
              </div>
              <button
                onClick={() => setShowRefundModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Project</label>
                <select
                  value={refundProjectId}
                  onChange={e => {
                    setRefundProjectId(e.target.value);
                    const p = state.projects.find(proj => proj.id === e.target.value);
                    if (p && p.milestones.length > 0) {
                      setRefundMilestoneId(p.milestones[0].id);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                >
                  <option value="">Select a project...</option>
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Milestone</label>
                <select
                  value={refundMilestoneId}
                  onChange={e => setRefundMilestoneId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                >
                  <option value="">Select milestone...</option>
                  {state.projects.find(p => p.id === refundProjectId)?.milestones.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({formatNgn(m.amountNgn)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Refund Ground / Reason</label>
                <select
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="milestone_unfulfilled">Deliverables unfulfilled or incomplete</option>
                  <option value="developer_unresponsive">Developer unresponsive for 5+ days</option>
                  <option value="project_cancelled_by_agreement">Mutual cancellation agreed by parties</option>
                  <option value="duplicate_charge">Duplicate payment reference</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Details &amp; Evidence</label>
                <textarea
                  rows={3}
                  value={refundDetails}
                  onChange={e => setRefundDetails(e.target.value)}
                  placeholder="Provide objective facts and timeline of communication..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund || !refundProjectId || !refundMilestoneId}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Submit for Arbitration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: REMITTANCE SLIP VIEWER --- */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101726] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-400" />
                Payout Remittance Slip: {selectedPayout.id}
              </span>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <h4 className="text-base font-bold text-white">Bank Payout Disbursed</h4>
                <p className="text-xs text-emerald-300">
                  Settled via Payment Partner to beneficiary NUBAN account.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Payout Ref:</span>
                  <span className="text-white">{selectedPayout.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transfer Session:</span>
                  <span className="text-teal-400">{selectedPayout.providerReference}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Beneficiary:</span>
                  <span className="text-white">{selectedPayout.accountName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bank &amp; Account:</span>
                  <span className="text-white">{selectedPayout.bankName} (***{selectedPayout.accountNumber.slice(-4)})</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                  <span>Net Disbursed:</span>
                  <span className="text-emerald-400">{formatNgn(selectedPayout.amountNgn)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Remittance
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
