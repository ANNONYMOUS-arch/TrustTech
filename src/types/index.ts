export type AccountType = 'client' | 'developer' | 'admin';

export interface User {
  uid: string;
  fullName: string;
  email: string;
  accountType: AccountType;
  phone: string;
  whatsapp?: string;
  avatarUrl?: string;
  companyName?: string;
  createdAt: string;
  isVerifiedDeveloper?: boolean;
  hasPremiumAccess?: boolean; // For TrustTech Coding Studio Pro access
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}

export type ApplicationStatus = 'Pending Review' | 'Approved' | 'Rejected';

export interface TechDepartment {
  id: string;
  name: string;
  iconName: string;
  description: string;
  subCategories: string[];
  typicalBudgetRange: string;
  isActive: boolean;
}

export interface DeveloperApplication {
  uid: string;
  email: string;
  fullName: string;
  professionalTitle: string;
  experience: 'Entry' | 'Intermediate' | 'Senior' | 'Lead / Architect';
  category: string; // Tech department id
  specialization?: string; // Subcategory job title
  bio: string;
  skills: string[];
  portfolio: string;
  github: string;
  projectLinks: string;
  projectDescription: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  accuracyAgreed: boolean;
  createdAt: string;
  reviewedAt?: string;
}

export type ProjectCategory = 
  | 'web-dev'
  | 'mobile-dev'
  | 'software-eng'
  | 'ui-ux-creative'
  | 'ai-data'
  | 'cybersecurity'
  | 'it-networking'
  | 'cloud-devops'
  | 'digital-marketing'
  | 'emerging-tech'
  // Backwards compatibility aliases:
  | 'web-nocode'
  | 'ui-ux'
  | 'technical-writing'
  | 'fullstack'
  | 'fintech';

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'paused' | 'closed';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number; // e.g. 25 for 25%
  amountNgn: number;
  status: 'pending' | 'funded' | 'in_review' | 'approved' | 'released';
  dueDays: number;
  deliverableUrl?: string;
  deliverableNotes?: string;
  submittedAt?: string;
  fundedAt?: string;
  releasedAt?: string;
}

export type DisputeStatus = 
  | 'Dispute Submitted' 
  | 'Evidence Collected' 
  | 'Under Review' 
  | 'Resolution Proposed' 
  | 'Resolved' 
  | 'Closed';

export interface DisputeItem {
  id: string;
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  raisedByUid: string;
  raisedByName: string;
  raisedByRole: AccountType;
  defendantUid: string;
  defendantName: string;
  reason: 'incomplete_work' | 'missed_deadline' | 'payment_disagreement' | 'quality_concern' | 'communication_stalled';
  evidence: string;
  status: DisputeStatus;
  proposedResolution?: string;
  resolutionDecision?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  ownerUid: string;
  ownerName: string;
  ownerCompany?: string;
  title: string;
  description: string;
  category: ProjectCategory;
  departmentId?: string;
  targetRole?: string;
  requiredSkills: string[];
  budgetMinNgn: number;
  budgetMaxNgn: number;
  estimatedDuration: string;
  experienceLevel: 'Entry' | 'Intermediate' | 'Senior';
  status: ProjectStatus;
  milestones: Milestone[];
  createdAt: string;
  applicantCount: number;
  hiredDeveloperUid?: string;
}

export type ProposalStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'Shortlisted' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Withdrawn';

export interface ProjectApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  developerUid: string;
  developerName: string;
  developerTitle: string;
  developerSkills: string[];
  developerPortfolio: string;
  developerGithub?: string;
  proposalMessage: string;
  proposedPriceNgn: number;
  estimatedDeliveryDays: number;
  status: ProposalStatus;
  submissionTimestamp: string;
  aiScreening?: {
    overallScore: number; // 0-100
    skillsMatchRating: 'High' | 'Medium' | 'Low';
    strengths: string[];
    riskFactors: string[];
    summary: string;
    screenedAt: string;
  };
}

export interface ProposalCredits {
  uid: string;
  availableCredits: number;
  monthlyAllowance: number;
  lastResetDate: string;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: 'application' | 'verification' | 'milestone' | 'payment' | 'system' | 'message';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface ChatAttachment {
  name: string;
  sizeBytes: number;
  type: string; // e.g. 'application/pdf', 'image/png'
  url: string;
  isImage?: boolean;
}

export interface MessageItem {
  id: string;
  projectId: string;
  senderUid: string;
  senderName: string;
  senderRole: AccountType;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  read?: boolean;
  reported?: boolean;
  reportReason?: string;
}

export type PaymentStatus = 
  | 'Pending' 
  | 'Processing' 
  | 'Paid' 
  | 'Failed' 
  | 'Refund Pending' 
  | 'Refunded' 
  | 'Disputed' 
  | 'Released';

export interface PaymentTransaction {
  id: string;
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  clientUid: string;
  clientName: string;
  developerUid: string;
  developerName: string;
  amountNgn: number;
  commissionRate: number; // e.g. 0.12 (12%)
  commissionNgn: number;
  developerEarningsNgn: number;
  clientFeeNgn: number; // 2.5%
  totalPaidByClientNgn: number;
  status: PaymentStatus;
  paymentMethod: string;
  gatewayReference: string;
  createdAt: string;
  verifiedAt?: string;
  releasedAt?: string;
  refundReason?: string;
}

export interface UserReport {
  id: string;
  reportedByUid: string;
  reportedByName: string;
  reportedTargetType: 'message' | 'developer' | 'client';
  targetId: string; // messageId, userUid, etc.
  projectId?: string;
  reason: 'off_platform_payment' | 'inappropriate_content' | 'harassment' | 'spam' | 'other';
  details: string;
  status: 'Open' | 'Reviewed' | 'Dismissed' | 'Action Taken';
  createdAt: string;
}

export interface CodingStudioProject {
  id: string;
  ownerUid: string;
  title: string;
  html: string;
  css: string;
  js: string;
  createdAt: string;
  updatedAt: string;
}

export type PayoutStatus =
  | 'Pending'
  | 'Processing'
  | 'Successful'
  | 'Failed'
  | 'Reversed'
  | 'On Hold';

export type FinancialTransactionType =
  | 'milestone_payment'
  | 'milestone_release'
  | 'commission_deduction'
  | 'client_protection_fee'
  | 'payout_withdrawal'
  | 'subscription_payment'
  | 'refund'
  | 'dispute_settlement';

export interface FinancialTransaction {
  id: string; // Unique transaction ID, e.g. TXN-10928
  userId: string;
  userName: string;
  userRole: AccountType;
  counterpartyId?: string;
  counterpartyName?: string;
  projectId?: string;
  projectTitle?: string;
  milestoneId?: string;
  milestoneTitle?: string;
  type: FinancialTransactionType;
  amountNgn: number; // Gross amount
  commissionRate: number; // 0.12 (12%)
  commissionNgn: number;
  clientFeeNgn: number; // 2.5%
  netAmountNgn: number; // Amount to recipient
  currency: 'NGN';
  paymentProvider: 'Paystack' | 'Flutterwave' | 'Bank Wire' | 'TrustTech Ledger';
  providerReference: string;
  status: PaymentStatus;
  timestamp: string;
  description: string;
  idempotencyKey?: string;
  auditTrail?: Array<{
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }>;
}

export interface DeveloperEarnings {
  developerUid: string;
  developerName: string;
  totalGrossEarningsNgn: number;
  totalCommissionDeductedNgn: number; // 12%
  totalNetEarningsNgn: number; // 88%
  availableBalanceNgn: number; // Eligible for withdrawal
  pendingBalanceNgn: number; // In active funded milestones
  totalWithdrawnNgn: number; // Successfully paid out
  lastUpdated: string;
}

export interface DeveloperPayoutAccount {
  id: string;
  developerUid: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  verifiedAt?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface PayoutRequest {
  id: string; // e.g. PAYOUT-2026-001
  developerUid: string;
  developerName: string;
  developerEmail: string;
  bankAccountId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amountNgn: number;
  feeNgn: number; // ₦0
  netPayoutNgn: number;
  status: PayoutStatus;
  idempotencyKey: string;
  providerReference?: string;
  failureReason?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  reviewedByAdminUid?: string;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }>;
}

export type SubscriptionPlan = 'monthly_premium' | 'yearly_premium_pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionPlan;
  amountNgn: number; // 5000 or 150000
  billingCycle: 'monthly' | 'yearly';
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;
  expiresAt: string;
  autoRenew: boolean;
  paymentProvider: string;
  lastTransactionReference: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  amountNgn: number;
  type: 'milestone' | 'commission' | 'client_fee' | 'subscription' | 'refund';
}

export interface Invoice {
  id: string; // e.g. INV-2026-001
  invoiceNumber: string;
  transactionId: string;
  projectId?: string;
  projectTitle?: string;
  milestoneTitle?: string;
  issuer: {
    name: string;
    rcNumber: string;
    address: string;
    vatNumber: string;
    supportEmail: string;
  };
  billedTo: {
    uid: string;
    name: string;
    email: string;
    company?: string;
    role: AccountType;
  };
  lineItems: InvoiceLineItem[];
  subtotalNgn: number;
  taxNgn: number;
  commissionNgn: number;
  clientFeeNgn: number;
  totalNgn: number;
  currency: 'NGN';
  status: 'Paid' | 'Refunded' | 'Pending' | 'Void';
  issuedDate: string;
  paidDate?: string;
  paymentMethod: string;
  providerReference: string;
}

export type RefundStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Refunded';

export interface RefundRequest {
  id: string; // e.g. REF-2026-001
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  clientUid: string;
  clientName: string;
  developerUid: string;
  developerName: string;
  amountNgn: number;
  reason: 'developer_unresponsive' | 'milestone_unfulfilled' | 'project_cancelled_by_agreement' | 'duplicate_charge' | 'other';
  details: string;
  status: RefundStatus;
  adminNotes?: string;
  requestedAt: string;
  resolvedAt?: string;
  refundReference?: string;
}

export interface FinancialSettings {
  developerCommissionRate: number; // 0.12 (12%)
  clientProtectionFeeRate: number; // 0.025 (2.5%)
  minWithdrawalNgn: number; // 5000
  maxWithdrawalPerDayNgn: number; // 2000000
  payoutTransferFeeNgn: number; // 0
  sandboxMode: boolean;
  activeProvider: 'Paystack' | 'Flutterwave' | 'Pending Onboarding';
  monthlyPremiumPriceNgn: number; // 5000
  yearlyPremiumProPriceNgn: number; // 150000
  supportedCurrencies: string[];
  lastUpdated: string;
  updatedBy: string;
}

