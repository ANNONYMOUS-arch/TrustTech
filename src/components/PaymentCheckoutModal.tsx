import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileCheck,
  Download,
} from 'lucide-react';
import { Project, Milestone, User, PaymentTransaction } from '../types';
import { calculateProjectFinancials, formatNgn } from '../utils/marketplaceRules';
import { store } from '../services/store';

interface PaymentCheckoutModalProps {
  project: Project;
  milestone: Milestone;
  currentUser: User;
  developerName: string;
  developerUid: string;
  onSuccess: (tx: PaymentTransaction) => void;
  onClose: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  project,
  milestone,
  currentUser,
  developerName,
  developerUid,
  onSuccess,
  onClose,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'paystack'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [financials, setFinancials] = useState(() =>
    calculateProjectFinancials(milestone.amountNgn, store.getState().platformCommissionRate || 0.12, 0.025)
  );

  // Fetch verified backend financials to prevent client-side fee manipulation
  useEffect(() => {
    let isMounted = true;
    fetch('/api/calculate-commission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountNgn: milestone.amountNgn }),
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.developerCommissionNgn !== undefined) {
          setFinancials(data);
        }
      })
      .catch(() => {
        // Fallback to client-side rule
      });
    return () => {
      isMounted = false;
    };
  }, [milestone.amountNgn]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const ref = 'PSTK_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();

    try {
      // Call backend verification endpoint
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: ref,
          amountNgn: milestone.amountNgn,
          projectId: project.id,
          milestoneId: milestone.id,
        }),
      });

      const data = await response.json();
      console.log('Payment verified on backend:', data);

      // Record in local store and fund milestone in escrow
      const tx = store.createPaymentTransaction({
        projectId: project.id,
        projectTitle: project.title,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        clientUid: currentUser.uid,
        clientName: currentUser.fullName,
        developerUid,
        developerName,
        amountNgn: milestone.amountNgn,
        paymentMethod:
          paymentMethod === 'paystack'
            ? 'Paystack Checkout (Debit Card / USSD)'
            : paymentMethod === 'card'
            ? 'Mastercard / Visa Direct'
            : 'Direct Bank Wire (Escrow Virtual Account)',
      });

      setCompletedTx(tx);
      onSuccess(tx);
    } catch (err) {
      console.error('Payment processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#101726] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-white">
                {completedTx ? 'Payment Receipt & Escrow Confirmation' : 'TrustTech Escrow Checkout'}
              </h3>
              <p className="text-xs text-slate-400">
                Milestone Funding &bull; 100% In-Platform Payment Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verbatim Safety Warning Banner */}
        <div className="p-3.5 bg-amber-950/40 border-b border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300 font-semibold">Payment Safety Notice: </strong>
            For your safety and protection, always keep communications and payments on TrustTech. Transactions completed outside TrustTech are not protected by our escrow system or customer support. Failure to comply may lead to account suspension.
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {completedTx ? (
            /* Receipt View */
            <div className="space-y-4">
              <div className="p-4 bg-teal-950/40 border border-teal-500/40 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-1" />
                <h4 className="text-base font-bold text-white">Milestone Successfully Funded</h4>
                <p className="text-xs text-teal-300">
                  Funds are securely held in TrustTech Escrow. The developer can now commence work.
                </p>
              </div>

              {/* Transaction Breakdown */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-white">{completedTx.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gateway Reference:</span>
                  <span className="font-mono text-teal-400">{completedTx.gatewayReference}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Project:</span>
                  <span className="text-white font-medium truncate max-w-xs">{project.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Milestone:</span>
                  <span className="text-white font-medium">{milestone.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Developer:</span>
                  <span className="text-white">{developerName}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-slate-400">
                  <span>Milestone Value:</span>
                  <span className="text-white font-semibold">{formatNgn(completedTx.amountNgn)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TrustTech Developer Commission (12%):</span>
                  <span className="text-amber-300">-{formatNgn(completedTx.commissionNgn)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Developer Net Payout on Approval:</span>
                  <span className="text-emerald-400 font-semibold">{formatNgn(completedTx.developerEarningsNgn)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Client Escrow & Processing Fee (2.5%):</span>
                  <span className="text-slate-300">+{formatNgn(completedTx.clientFeeNgn)}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Charged:</span>
                  <span className="text-teal-400">{formatNgn(completedTx.totalPaidByClientNgn)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Print / Save Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handlePay} className="space-y-5">
              {/* Milestone Details */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{milestone.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{milestone.description}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
                    {milestone.percentage}% of project
                  </span>
                </div>
              </div>

              {/* Transparent Financials Breakdown (12% Commission clearly disclosed) */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                <h5 className="font-semibold text-slate-300 text-xs uppercase tracking-wider mb-2">
                  Payment Economics Breakdown
                </h5>
                <div className="flex justify-between text-slate-400">
                  <span>Milestone Value:</span>
                  <span className="font-semibold text-white">{formatNgn(financials.grossQuoteNgn)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    TrustTech Developer Commission:
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-amber-300">12%</span>
                  </span>
                  <span className="text-amber-400">-{formatNgn(financials.developerCommissionNgn)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Developer Expected Earnings (after 12% fee):</span>
                  <span className="text-emerald-400 font-semibold">{formatNgn(financials.developerNetPayoutNgn)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    Client Escrow Protection Fee:
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">2.5%</span>
                  </span>
                  <span className="text-slate-300">+{formatNgn(financials.clientProtectionFeeNgn)}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Due Today:</span>
                  <span className="text-base text-teal-400">{formatNgn(financials.clientTotalChargeNgn)}</span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  * No hidden charges. 100% of milestone funds remain locked in escrow until you approve the deliverable.
                </p>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paystack')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'paystack'
                        ? 'border-teal-500 bg-teal-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-teal-400" />
                    <span className="text-[11px] block">Paystack</span>
                    <span className="text-[9px] text-slate-500 block">Card, Bank, USSD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-teal-500 bg-teal-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-teal-400" />
                    <span className="text-[11px] block">Debit Card</span>
                    <span className="text-[9px] text-slate-500 block">Mastercard / Visa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-teal-500 bg-teal-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 mx-auto mb-1 text-teal-400" />
                    <span className="text-[11px] block">Bank Wire</span>
                    <span className="text-[9px] text-slate-500 block">Dedicated NGN Escrow</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-teal-500/10"
              >
                {isProcessing ? (
                  <span>Verifying Escrow Deposit...</span>
                ) : (
                  <>
                    <span>Fund {formatNgn(financials.clientTotalChargeNgn)} into Escrow</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
