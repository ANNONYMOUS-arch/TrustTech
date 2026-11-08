import {
  User,
  DeveloperApplication,
  Project,
  ProjectApplication,
  ProposalCredits,
  NotificationItem,
  MessageItem,
  AccountType,
  Milestone,
  DisputeItem,
  TechDepartment,
  PaymentTransaction,
  UserReport,
  CodingStudioProject,
  ChatAttachment,
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
} from '../types';
import { generateBalancedMilestones, calculateProjectFinancials } from '../utils/marketplaceRules';

const STORAGE_KEY = 'trusttech_marketplace_data_v2';

export interface MarketplaceState {
  currentUser: User;
  users: User[];
  developerApplications: DeveloperApplication[];
  projects: Project[];
  projectApplications: ProjectApplication[];
  proposalCredits: Record<string, ProposalCredits>;
  notifications: NotificationItem[];
  messages: MessageItem[];
  disputes: DisputeItem[];
  departments: TechDepartment[];
  platformCommissionRate: number; // 0.12 = 12%
  payments: PaymentTransaction[];
  userReports: UserReport[];
  codingStudioProjects: CodingStudioProject[];
  financialTransactions: FinancialTransaction[];
  developerEarnings: Record<string, DeveloperEarnings>;
  developerPayoutAccounts: DeveloperPayoutAccount[];
  payoutRequests: PayoutRequest[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  refundRequests: RefundRequest[];
  financialSettings: FinancialSettings;
}


export const INITIAL_TECH_DEPARTMENTS: TechDepartment[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    iconName: 'Globe',
    description: 'Frontend, backend, full-stack, Webflow, Shopify, WordPress, and API engineers.',
    subCategories: [
      'Frontend Developers',
      'Backend Developers',
      'Full-Stack Developers',
      'Web Designers',
      'WordPress Developers',
      'Shopify Developers',
      'Webflow Developers',
      'API Developers',
      'Website Maintenance Specialists',
    ],
    typicalBudgetRange: '₦150k - ₦1.2M',
    isActive: true,
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    iconName: 'Smartphone',
    description: 'Native iOS & Android, Flutter, React Native, and mobile UI/UX engineering.',
    subCategories: [
      'Android Developers',
      'iOS Developers',
      'Flutter Developers',
      'React Native Developers',
      'Mobile UI Designers',
      'Mobile Application Testers',
    ],
    typicalBudgetRange: '₦300k - ₦2.5M',
    isActive: true,
  },
  {
    id: 'software-eng',
    name: 'Software Engineering',
    iconName: 'Code',
    description: 'Enterprise desktop apps, game development, software architects, and QA automation.',
    subCategories: [
      'Software Engineers',
      'Desktop Application Developers',
      'Game Developers',
      'Software Architects',
      'QA Engineers',
      'Software Testers',
      'Automation Engineers',
    ],
    typicalBudgetRange: '₦400k - ₦3.0M',
    isActive: true,
  },
  {
    id: 'ui-ux-creative',
    name: 'UI/UX and Creative Technology',
    iconName: 'Layout',
    description: 'Product designers, design systems, 3D artists, motion graphics, and brand identity.',
    subCategories: [
      'UI/UX Designers',
      'Product Designers',
      'Graphic Designers',
      'Logo Designers',
      'Brand Identity Designers',
      'Motion Graphics Designers',
      '3D Designers',
      'Animation Designers',
      'Presentation Designers',
    ],
    typicalBudgetRange: '₦180k - ₦1.5M',
    isActive: true,
  },
  {
    id: 'ai-data',
    name: 'AI and Data',
    iconName: 'Cpu',
    description: 'Machine learning, AI automation, chatbots, data engineering, and business intelligence.',
    subCategories: [
      'AI Developers',
      'Machine Learning Engineers',
      'AI Automation Specialists',
      'Data Analysts',
      'Data Scientists',
      'Data Engineers',
      'Business Intelligence Developers',
      'Chatbot Developers',
      'AI Integration Specialists',
      'Data Visualization Specialists',
    ],
    typicalBudgetRange: '₦350k - ₦3.5M',
    isActive: true,
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    iconName: 'Shield',
    description: 'Lawful, ethical, and authorized security audits, penetration testing, and cloud defense.',
    subCategories: [
      'Cybersecurity Analysts',
      'Ethical Hackers',
      'Penetration Testers',
      'Security Consultants',
      'Network Security Engineers',
      'Cloud Security Specialists',
      'Security Auditors',
      'Defensive Security Specialists',
    ],
    typicalBudgetRange: '₦400k - ₦4.0M',
    isActive: true,
  },
  {
    id: 'it-networking',
    name: 'IT and Networking',
    iconName: 'Server',
    description: 'Network engineers, sysadmins, technical support, electronics, and hardware specialists.',
    subCategories: [
      'IT Support Specialists',
      'Network Engineers',
      'System Administrators',
      'Technical Support Engineers',
      'Computer Hardware Technicians',
      'Computer Repair Specialists',
      'Electronics Engineers',
    ],
    typicalBudgetRange: '₦120k - ₦1.0M',
    isActive: true,
  },
  {
    id: 'cloud-devops',
    name: 'Cloud and DevOps',
    iconName: 'Cloud',
    description: 'AWS, Azure, Google Cloud, Docker, Kubernetes, CI/CD, and site reliability.',
    subCategories: [
      'Cloud Engineers',
      'DevOps Engineers',
      'Site Reliability Engineers',
      'AWS Specialists',
      'Microsoft Azure Specialists',
      'Google Cloud Specialists',
      'Docker Specialists',
      'Kubernetes Engineers',
      'CI/CD Engineers',
      'Cloud Architects',
    ],
    typicalBudgetRange: '₦350k - ₦3.0M',
    isActive: true,
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing and Business Tech',
    iconName: 'TrendingUp',
    description: 'Technical SEO, growth marketing, marketing automation, CRM, and analytics specialists.',
    subCategories: [
      'SEO Specialists',
      'Digital Marketing Specialists',
      'Social Media Managers',
      'Marketing Automation Specialists',
      'Email Marketing Specialists',
      'CRM Specialists',
      'Google Ads Specialists',
      'Analytics Specialists',
      'E-commerce Specialists',
      'Growth Marketing Specialists',
    ],
    typicalBudgetRange: '₦100k - ₦900k',
    isActive: true,
  },
  {
    id: 'emerging-tech',
    name: 'Emerging Technology',
    iconName: 'Sparkles',
    description: 'AR/VR, robotics, IoT, smart contracts, computer vision, and embedded systems.',
    subCategories: [
      'AR/VR Developers',
      'Robotics Engineers',
      'IoT Developers',
      'Digital Twin Specialists',
      'Computer Vision Engineers',
      'Embedded Systems Developers',
      'Embedded Software Developers',
      'Smart Contract Developers',
    ],
    typicalBudgetRange: '₦450k - ₦4.5M',
    isActive: true,
  },
];

const SEED_USERS: User[] = [
  {
    uid: 'user-client-1',
    fullName: 'Kolawole Adeleke',
    email: 'kola@payflow.ng',
    accountType: 'client',
    companyName: 'PayFlow Africa Ltd',
    phone: '+234 803 294 1182',
    whatsapp: '+234 803 294 1182',
    createdAt: '2026-10-15T10:00:00Z',
    hasPremiumAccess: true,
    subscriptionTier: 'pro',
  },
  {
    uid: 'user-dev-verified',
    fullName: 'Chidinma Okafor',
    email: 'chidinma@techcraft.ng',
    accountType: 'developer',
    phone: '+234 814 550 9012',
    whatsapp: '+234 814 550 9012',
    createdAt: '2026-10-18T14:30:00Z',
    isVerifiedDeveloper: true,
    hasPremiumAccess: true,
    subscriptionTier: 'pro',
  },
  {
    uid: 'user-dev-pending',
    fullName: 'Tunde Bakare',
    email: 'tunde.b@codecraft.ng',
    accountType: 'developer',
    phone: '+234 705 119 4432',
    createdAt: '2026-11-01T09:15:00Z',
    isVerifiedDeveloper: false,
    hasPremiumAccess: false,
    subscriptionTier: 'free',
  },
  {
    uid: 'user-admin-1',
    fullName: 'TrustTech Operations',
    email: 'admin@trusttech.ng',
    accountType: 'admin',
    phone: '+234 800 TRUSTTECH',
    createdAt: '2026-09-01T08:00:00Z',
    hasPremiumAccess: true,
    subscriptionTier: 'enterprise',
  },
];

const SEED_APPLICATIONS: DeveloperApplication[] = [
  {
    uid: 'user-dev-verified',
    email: 'chidinma@techcraft.ng',
    fullName: 'Chidinma Okafor',
    professionalTitle: 'Senior UI/UX & Webflow Specialist',
    experience: 'Senior',
    category: 'web-dev',
    specialization: 'Webflow Developers',
    bio: 'Product designer and Webflow expert with 6+ years designing accessible fintech applications and high-conversion landing pages for African and global startups.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Webflow', 'Prototyping', 'Tailwind CSS'],
    portfolio: 'https://chidinma.design',
    github: 'https://github.com/chidinma-okafor',
    projectLinks: 'https://fintech-demo.webflow.io, https://payflow-case-study.com',
    projectDescription: 'Led end-to-end UX architecture for Payflow checkout resulting in 34% drop-off reduction.',
    status: 'Approved',
    accuracyAgreed: true,
    createdAt: '2026-10-18T14:40:00Z',
    reviewedAt: '2026-10-19T11:00:00Z',
  },
  {
    uid: 'user-dev-pending',
    email: 'tunde.b@codecraft.ng',
    fullName: 'Tunde Bakare',
    professionalTitle: 'Full-Stack & Cloud Engineer',
    experience: 'Intermediate',
    category: 'cloud-devops',
    specialization: 'Cloud Engineers',
    bio: 'Software engineer and DevOps enthusiast with 3 years experience deploying scalable containerized microservices on AWS and Google Cloud Platform.',
    skills: ['AWS', 'Docker', 'Node.js', 'PostgreSQL', 'Terraform', 'React'],
    portfolio: 'https://tundebakare.dev',
    github: 'https://github.com/tundebakare',
    projectLinks: 'https://dev.to/tundebakare',
    projectDescription: 'Architected automated CI/CD pipelines reducing deployment downtime to zero.',
    status: 'Pending Review',
    accuracyAgreed: true,
    createdAt: '2026-11-01T09:20:00Z',
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    ownerUid: 'user-client-1',
    ownerName: 'Kolawole Adeleke',
    ownerCompany: 'PayFlow Africa',
    title: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    description: 'We need a senior Webflow developer to rebuild our B2B payments landing page with modern responsiveness, clean typography, fast page load, and HubSpot form integration. Designs are ready in Figma.',
    category: 'web-dev',
    departmentId: 'web-dev',
    targetRole: 'Webflow Developers',
    requiredSkills: ['Webflow', 'Figma to Webflow', 'Responsive Design', 'JavaScript'],
    budgetMinNgn: 250000,
    budgetMaxNgn: 350000,
    estimatedDuration: '2 - 3 weeks',
    experienceLevel: 'Senior',
    status: 'open',
    milestones: generateBalancedMilestones(300000),
    createdAt: '2026-11-02T10:00:00Z',
    applicantCount: 1,
  },
  {
    id: 'proj-2',
    ownerUid: 'user-client-1',
    ownerName: 'Kolawole Adeleke',
    ownerCompany: 'PayFlow Africa',
    title: 'Fintech Mobile App Design System & UX Usability Review',
    description: 'Looking for a product designer with proven fintech experience to audit our existing mobile remittance app, identify friction points, and deliver a comprehensive Figma component library and tokenized design system.',
    category: 'ui-ux-creative',
    departmentId: 'ui-ux-creative',
    targetRole: 'UI/UX Designers',
    requiredSkills: ['Figma', 'UI/UX Design', 'Design Systems', 'Fintech UX', 'Usability Testing'],
    budgetMinNgn: 400000,
    budgetMaxNgn: 550000,
    estimatedDuration: '4 weeks',
    experienceLevel: 'Senior',
    status: 'open',
    milestones: generateBalancedMilestones(480000),
    createdAt: '2026-11-03T14:20:00Z',
    applicantCount: 0,
  },
  {
    id: 'proj-3',
    ownerUid: 'user-client-1',
    ownerName: 'Kolawole Adeleke',
    ownerCompany: 'PayFlow Africa',
    title: 'AI Chatbot & Knowledge Retrieval Engine for Merchant Support',
    description: 'We are launching an intelligent customer assistant for merchant queries. Need an AI integration engineer to build a conversational agent powered by Gemini API, with RAG on our technical FAQ docs.',
    category: 'ai-data',
    departmentId: 'ai-data',
    targetRole: 'Chatbot Developers',
    requiredSkills: ['Gemini API', 'TypeScript', 'Vector Search', 'Python', 'FastAPI'],
    budgetMinNgn: 300000,
    budgetMaxNgn: 450000,
    estimatedDuration: '3 weeks',
    experienceLevel: 'Senior',
    status: 'open',
    milestones: generateBalancedMilestones(350000),
    createdAt: '2026-11-04T08:30:00Z',
    applicantCount: 0,
  },
  {
    id: 'proj-4',
    ownerUid: 'user-client-1',
    ownerName: 'Kolawole Adeleke',
    ownerCompany: 'PayFlow Africa',
    title: 'Authorized Cloud Infrastructure & Webhook Security Audit',
    description: 'Need a certified cybersecurity analyst to conduct an authorized penetration test and vulnerability review on our staging webhook endpoints and cloud VPC configuration before production launch.',
    category: 'cybersecurity',
    departmentId: 'cybersecurity',
    targetRole: 'Security Auditors',
    requiredSkills: ['Cloud Security', 'Penetration Testing', 'OWASP Top 10', 'API Security'],
    budgetMinNgn: 350000,
    budgetMaxNgn: 500000,
    estimatedDuration: '2 weeks',
    experienceLevel: 'Senior',
    status: 'open',
    milestones: generateBalancedMilestones(400000),
    createdAt: '2026-11-04T12:00:00Z',
    applicantCount: 0,
  },
];

const SEED_PROPOSALS: ProjectApplication[] = [
  {
    id: 'prop-1',
    projectId: 'proj-1',
    projectTitle: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    developerUid: 'user-dev-verified',
    developerName: 'Chidinma Okafor',
    developerTitle: 'Senior UI/UX & Webflow Specialist',
    developerSkills: ['Webflow', 'Figma to Webflow', 'Responsive Design', 'JavaScript'],
    developerPortfolio: 'https://chidinma.design',
    developerGithub: 'https://github.com/chidinma-okafor',
    proposalMessage: 'Hello Kolawole, I have reviewed your Figma files and Payflow branding requirements. I have built over 15 high-converting SaaS landing pages on Webflow with clean semantic class structures (Client-First style), fast lighthouse scores (95+), and custom animations. I can deliver the staging link within 12 days and ensure seamless webhook integration with your CRM.',
    proposedPriceNgn: 300000,
    estimatedDeliveryDays: 14,
    status: 'Shortlisted',
    submissionTimestamp: '2026-11-02T16:00:00Z',
    aiScreening: {
      overallScore: 94,
      skillsMatchRating: 'High',
      strengths: [
        'Direct 100% skill match on Webflow, responsive build, and Figma translations.',
        'Extensive portfolio demonstrating production SaaS websites in Nigeria and internationally.',
        'Realistic 14-day timeline with milestone accountability.',
      ],
      riskFactors: [
        'Quote is ₦300,000 (well within budget range of ₦250k - ₦350k).',
      ],
      summary: 'Exceptional candidate with verified credentials and relevant SaaS landing page history.',
      screenedAt: '2026-11-02T16:05:00Z',
    },
  },
];

const SEED_CREDITS: Record<string, ProposalCredits> = {
  'user-dev-verified': {
    uid: 'user-dev-verified',
    availableCredits: 14, // 1 used for prop-1
    monthlyAllowance: 15,
    lastResetDate: '2026-11-01T00:00:00Z',
  },
  'user-dev-pending': {
    uid: 'user-dev-pending',
    availableCredits: 15,
    monthlyAllowance: 15,
    lastResetDate: '2026-11-01T00:00:00Z',
  },
};

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    recipientUid: 'user-dev-verified',
    title: 'Proposal Shortlisted!',
    message: 'PayFlow Africa shortlisted your proposal for "High-Converting Webflow Landing Page".',
    type: 'application',
    read: false,
    createdAt: '2026-11-02T17:00:00Z',
    linkTab: 'dashboard-developer',
  },
  {
    id: 'notif-2',
    recipientUid: 'user-dev-verified',
    title: 'Developer Verification Approved',
    message: 'Your TrustTech developer profile has been approved! You now hold a Verified Developer badge and full access to project proposals.',
    type: 'verification',
    read: true,
    createdAt: '2026-10-19T11:00:00Z',
    linkTab: 'verification',
  },
  {
    id: 'notif-3',
    recipientUid: 'user-client-1',
    title: 'Payment Escrow Verified',
    message: 'Milestone 1 deposit of ₦75,000 has been verified and securely held in escrow.',
    type: 'payment',
    read: true,
    createdAt: '2026-11-03T09:00:00Z',
    linkTab: 'dashboard-business',
  },
];

const SEED_MESSAGES: MessageItem[] = [
  {
    id: 'msg-1',
    projectId: 'proj-1',
    senderUid: 'user-client-1',
    senderName: 'Kolawole Adeleke',
    senderRole: 'client',
    text: 'Hi Chidinma! Thanks for submitting your proposal. We love your previous work on fintech landing pages.',
    timestamp: '2026-11-02T17:15:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    projectId: 'proj-1',
    senderUid: 'user-dev-verified',
    senderName: 'Chidinma Okafor',
    senderRole: 'developer',
    text: 'Thank you Kolawole! I can start as early as Monday. I reviewed the 4 milestone stages and the breakdown looks great.',
    timestamp: '2026-11-02T17:30:00Z',
    read: true,
    attachments: [
      {
        name: 'payflow_landing_rough_architecture.pdf',
        sizeBytes: 1048576, // 1MB
        type: 'application/pdf',
        url: '#attachment-demo',
        isImage: false,
      },
    ],
  },
];

const SEED_DISPUTES: DisputeItem[] = [
  {
    id: 'disp-1',
    projectId: 'proj-1',
    projectTitle: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    milestoneId: 'm2',
    milestoneTitle: 'Working Prototype / Milestone 1',
    raisedByUid: 'user-client-1',
    raisedByName: 'Kolawole Adeleke',
    raisedByRole: 'client',
    defendantUid: 'user-dev-verified',
    defendantName: 'Chidinma Okafor',
    reason: 'quality_concern',
    evidence: 'Mobile viewport reflow issues on smaller screens. Responsive breakpoint at 390px requires token alignment.',
    status: 'Under Review',
    proposedResolution: 'Developer agreed to patch the responsive CSS breakpoints within 24 hours before milestone sign-off.',
    createdAt: '2026-11-04T11:00:00Z',
  },
];

// Seed 12% commission payments
const fin1 = calculateProjectFinancials(75000, 0.12, 0.025);
const SEED_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-tx-1',
    projectId: 'proj-1',
    projectTitle: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    milestoneId: 'm1',
    milestoneTitle: 'Initial Deposit & Discovery Kickoff',
    clientUid: 'user-client-1',
    clientName: 'Kolawole Adeleke',
    developerUid: 'user-dev-verified',
    developerName: 'Chidinma Okafor',
    amountNgn: 75000,
    commissionRate: 0.12,
    commissionNgn: fin1.developerCommissionNgn, // ₦9,000 (12%)
    developerEarningsNgn: fin1.developerNetPayoutNgn, // ₦66,000 (88%)
    clientFeeNgn: fin1.clientProtectionFeeNgn, // ₦1,875 (2.5%)
    totalPaidByClientNgn: fin1.clientTotalChargeNgn, // ₦76,875
    status: 'Paid',
    paymentMethod: 'Paystack Card Checkout',
    gatewayReference: 'PSTK_TRX_9921048382',
    createdAt: '2026-11-02T18:00:00Z',
    verifiedAt: '2026-11-02T18:02:15Z',
  },
];

const SEED_USER_REPORTS: UserReport[] = [
  {
    id: 'rep-1',
    reportedByUid: 'user-client-1',
    reportedByName: 'Kolawole Adeleke',
    reportedTargetType: 'developer',
    targetId: 'user-dev-pending',
    projectId: 'proj-1',
    reason: 'off_platform_payment',
    details: 'Received an inquiry asking to bypass TrustTech escrow via private bank transfer. We rely on TrustTech escrow protection.',
    status: 'Reviewed',
    createdAt: '2026-11-03T11:20:00Z',
  },
];

const SEED_CODING_PROJECTS: CodingStudioProject[] = [
  {
    id: 'code-proj-1',
    ownerUid: 'user-client-1',
    title: 'Paystack Checkout Widget Prototype',
    html: `<div class="card">
  <h2>TrustTech Payment Demo</h2>
  <p>Escrow funded milestone for <strong>₦75,000</strong>.</p>
  <div class="badge">12% Developer Commission Applied</div>
  <button id="payBtn">Simulate Release</button>
</div>`,
    css: `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}
.card {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #334155;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  text-align: center;
}
.badge {
  display: inline-block;
  background: #059669;
  color: white;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  margin: 1rem 0;
}
button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
button:hover { opacity: 0.9; }`,
    js: `document.getElementById('payBtn').addEventListener('click', () => {
  alert('Milestone deliverable approved! Payout sent to developer balance.');
});`,
    createdAt: '2026-11-04T10:00:00Z',
    updatedAt: '2026-11-04T10:30:00Z',
  },
];

// --- Financial Centre Seed Data ---

const SEED_FINANCIAL_SETTINGS: FinancialSettings = {
  developerCommissionRate: 0.12, // 12%
  clientProtectionFeeRate: 0.025, // 2.5%
  minWithdrawalNgn: 5000,
  maxWithdrawalPerDayNgn: 2000000,
  payoutTransferFeeNgn: 0,
  sandboxMode: true,
  activeProvider: 'Paystack',
  monthlyPremiumPriceNgn: 5000,
  yearlyPremiumProPriceNgn: 150000,
  supportedCurrencies: ['NGN'],
  lastUpdated: '2026-11-08T00:00:00Z',
  updatedBy: 'user-admin',
};

const SEED_DEVELOPER_EARNINGS: Record<string, DeveloperEarnings> = {
  'user-dev-verified': {
    developerUid: 'user-dev-verified',
    developerName: 'Chidinma Okafor',
    totalGrossEarningsNgn: 480000,
    totalCommissionDeductedNgn: 57600, // 12% of 480,000
    totalNetEarningsNgn: 422400, // 88% of 480,000
    availableBalanceNgn: 272400, // 422,400 - 150,000 already withdrawn
    pendingBalanceNgn: 66000, // Milestone 1 (₦75k net 88% = ₦66k) in funded escrow
    totalWithdrawnNgn: 150000,
    lastUpdated: '2026-11-06T14:00:00Z',
  },
  'user-dev-pending': {
    developerUid: 'user-dev-pending',
    developerName: 'Tunde Bakare',
    totalGrossEarningsNgn: 0,
    totalCommissionDeductedNgn: 0,
    totalNetEarningsNgn: 0,
    availableBalanceNgn: 0,
    pendingBalanceNgn: 0,
    totalWithdrawnNgn: 0,
    lastUpdated: '2026-11-01T09:20:00Z',
  },
};

const SEED_PAYOUT_ACCOUNTS: DeveloperPayoutAccount[] = [
  {
    id: 'bank-acc-1',
    developerUid: 'user-dev-verified',
    bankCode: '058',
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0148928371',
    accountName: 'CHIDINMA MARY OKAFOR',
    isVerified: true,
    verifiedAt: '2026-10-20T10:00:00Z',
    isPrimary: true,
    createdAt: '2026-10-20T09:30:00Z',
  },
];

const SEED_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'PAYOUT-882910',
    developerUid: 'user-dev-verified',
    developerName: 'Chidinma Okafor',
    developerEmail: 'chidinma@trusttech.dev',
    bankAccountId: 'bank-acc-1',
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0148928371',
    accountName: 'CHIDINMA MARY OKAFOR',
    amountNgn: 150000,
    feeNgn: 0,
    netPayoutNgn: 150000,
    status: 'Successful',
    idempotencyKey: 'idem-chidinma-150k-completed',
    providerReference: 'TRF_PSTK_991823719',
    requestedAt: '2026-11-05T10:15:00Z',
    processedAt: '2026-11-05T10:16:30Z',
    completedAt: '2026-11-05T10:18:00Z',
    reviewedByAdminUid: 'user-admin',
    auditTrail: [
      {
        timestamp: '2026-11-05T10:15:00Z',
        action: 'Withdrawal Requested',
        actor: 'Chidinma Okafor',
        note: 'Requested bank withdrawal of ₦150,000 to GTBank (***8371)',
      },
      {
        timestamp: '2026-11-05T10:16:30Z',
        action: 'Sent to Bank Network',
        actor: 'Payment Partner (Paystack Transfer API)',
        note: 'Session reference TRF_PSTK_991823719 dispatched to NIBSS',
      },
      {
        timestamp: '2026-11-05T10:18:00Z',
        action: 'Payout Successful',
        actor: 'Payment Partner (Webhook Confirmation)',
        note: 'Funds credited to beneficiary account. Status finalized as Successful.',
      },
    ],
  },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB-772190',
    userId: 'user-client-1',
    userName: 'Kolawole Adeleke',
    userEmail: 'kolawole@payflow.ng',
    plan: 'monthly_premium',
    amountNgn: 5000,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2026-10-15T00:00:00Z',
    renewalDate: '2026-11-15T00:00:00Z',
    expiresAt: '2026-11-15T00:00:00Z',
    autoRenew: true,
    paymentProvider: 'Paystack Card Checkout',
    lastTransactionReference: 'PSTK_SUB_88192039',
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
  },
  {
    id: 'SUB-772191',
    userId: 'user-dev-verified',
    userName: 'Chidinma Okafor',
    userEmail: 'chidinma@trusttech.dev',
    plan: 'yearly_premium_pro',
    amountNgn: 150000,
    billingCycle: 'yearly',
    status: 'active',
    startDate: '2026-09-01T00:00:00Z',
    renewalDate: '2027-09-01T00:00:00Z',
    expiresAt: '2027-09-01T00:00:00Z',
    autoRenew: true,
    paymentProvider: 'Paystack Direct Bank Wire',
    lastTransactionReference: 'PSTK_SUB_YEARLY_11029',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

const SEED_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TXN-9001',
    userId: 'user-client-1',
    userName: 'Kolawole Adeleke',
    userRole: 'client',
    counterpartyId: 'user-dev-verified',
    counterpartyName: 'Chidinma Okafor',
    projectId: 'proj-1',
    projectTitle: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    milestoneId: 'm1',
    milestoneTitle: 'Initial Deposit & Discovery Kickoff',
    type: 'milestone_payment',
    amountNgn: 75000,
    commissionRate: 0.12,
    commissionNgn: 9000,
    clientFeeNgn: 1875,
    netAmountNgn: 66000,
    currency: 'NGN',
    paymentProvider: 'Paystack',
    providerReference: 'PSTK_TRX_9921048382',
    status: 'Paid',
    timestamp: '2026-11-02T18:00:00Z',
    description: 'Milestone 1 funded into platform payment protection for Webflow Landing Page rebuild.',
  },
  {
    id: 'TXN-9002',
    userId: 'user-dev-verified',
    userName: 'Chidinma Okafor',
    userRole: 'developer',
    counterpartyId: 'user-client-1',
    counterpartyName: 'Kolawole Adeleke',
    projectId: 'proj-1',
    projectTitle: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    milestoneId: 'm1',
    milestoneTitle: 'Initial Deposit & Discovery Kickoff',
    type: 'commission_deduction',
    amountNgn: 75000,
    commissionRate: 0.12,
    commissionNgn: 9000,
    clientFeeNgn: 0,
    netAmountNgn: 66000,
    currency: 'NGN',
    paymentProvider: 'TrustTech Ledger',
    providerReference: 'COMM_PSTK_9921048382',
    status: 'Paid',
    timestamp: '2026-11-02T18:00:00Z',
    description: 'TrustTech 12% transparent developer platform commission applied (₦9,000).',
  },
  {
    id: 'TXN-9003',
    userId: 'user-dev-verified',
    userName: 'Chidinma Okafor',
    userRole: 'developer',
    type: 'payout_withdrawal',
    amountNgn: 150000,
    commissionRate: 0,
    commissionNgn: 0,
    clientFeeNgn: 0,
    netAmountNgn: 150000,
    currency: 'NGN',
    paymentProvider: 'Bank Wire',
    providerReference: 'TRF_PSTK_991823719',
    status: 'Paid',
    timestamp: '2026-11-05T10:18:00Z',
    description: 'Developer payout withdrawal to GTBank account ***8371.',
  },
  {
    id: 'TXN-9004',
    userId: 'user-client-1',
    userName: 'Kolawole Adeleke',
    userRole: 'client',
    type: 'subscription_payment',
    amountNgn: 5000,
    commissionRate: 0,
    commissionNgn: 0,
    clientFeeNgn: 0,
    netAmountNgn: 5000,
    currency: 'NGN',
    paymentProvider: 'Paystack',
    providerReference: 'PSTK_SUB_88192039',
    status: 'Paid',
    timestamp: '2026-10-15T00:00:00Z',
    description: 'TrustTech Monthly Premium Subscription (October 2026 - November 2026).',
  },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-1001',
    invoiceNumber: 'TT-INV-001001',
    transactionId: 'TXN-9001',
    projectId: 'proj-1',
    projectTitle: 'High-Converting Webflow Landing Page & Responsive Rebuild',
    milestoneTitle: 'Initial Deposit & Discovery Kickoff',
    issuer: {
      name: 'TrustTech Africa Ltd',
      rcNumber: 'RC-1928472',
      address: 'Plot 12A, Victoria Island Financial District, Lagos, Nigeria',
      vatNumber: 'VAT-NG-8829104',
      supportEmail: 'billing@trusttech.ng',
    },
    billedTo: {
      uid: 'user-client-1',
      name: 'Kolawole Adeleke',
      email: 'kolawole@payflow.ng',
      company: 'PayFlow Africa Ltd',
      role: 'client',
    },
    lineItems: [
      {
        description: 'Milestone 1 Allocation: Initial Deposit & Discovery Kickoff',
        amountNgn: 75000,
        type: 'milestone',
      },
      {
        description: 'Client In-Platform Payment Protection & Escrow Fee (2.5%)',
        amountNgn: 1875,
        type: 'client_fee',
      },
    ],
    subtotalNgn: 75000,
    taxNgn: 0,
    commissionNgn: 9000,
    clientFeeNgn: 1875,
    totalNgn: 76875,
    currency: 'NGN',
    status: 'Paid',
    issuedDate: '2026-11-02T18:00:00Z',
    paidDate: '2026-11-02T18:02:15Z',
    paymentMethod: 'Paystack Card Checkout',
    providerReference: 'PSTK_TRX_9921048382',
  },
  {
    id: 'INV-2026-1002',
    invoiceNumber: 'TT-INV-001002',
    transactionId: 'TXN-9004',
    issuer: {
      name: 'TrustTech Africa Ltd',
      rcNumber: 'RC-1928472',
      address: 'Plot 12A, Victoria Island Financial District, Lagos, Nigeria',
      vatNumber: 'VAT-NG-8829104',
      supportEmail: 'billing@trusttech.ng',
    },
    billedTo: {
      uid: 'user-client-1',
      name: 'Kolawole Adeleke',
      email: 'kolawole@payflow.ng',
      company: 'PayFlow Africa Ltd',
      role: 'client',
    },
    lineItems: [
      {
        description: 'TrustTech Monthly Premium Subscription (Unlimited Inquiries & Pro Dashboard)',
        amountNgn: 5000,
        type: 'subscription',
      },
    ],
    subtotalNgn: 5000,
    taxNgn: 0,
    commissionNgn: 0,
    clientFeeNgn: 0,
    totalNgn: 5000,
    currency: 'NGN',
    status: 'Paid',
    issuedDate: '2026-10-15T00:00:00Z',
    paidDate: '2026-10-15T00:01:00Z',
    paymentMethod: 'Paystack Card Checkout',
    providerReference: 'PSTK_SUB_88192039',
  },
];

const SEED_REFUND_REQUESTS: RefundRequest[] = [];

class MarketplaceStore {
  private state: MarketplaceState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MarketplaceState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.disputes) parsed.disputes = SEED_DISPUTES;
        if (!parsed.departments) parsed.departments = INITIAL_TECH_DEPARTMENTS;
        if (!parsed.platformCommissionRate) parsed.platformCommissionRate = 0.12; // 12%
        if (!parsed.payments) parsed.payments = SEED_PAYMENTS;
        if (!parsed.userReports) parsed.userReports = SEED_USER_REPORTS;
        if (!parsed.codingStudioProjects) parsed.codingStudioProjects = SEED_CODING_PROJECTS;
        if (!parsed.financialTransactions) parsed.financialTransactions = SEED_FINANCIAL_TRANSACTIONS;
        if (!parsed.developerEarnings) parsed.developerEarnings = SEED_DEVELOPER_EARNINGS;
        if (!parsed.developerPayoutAccounts) parsed.developerPayoutAccounts = SEED_PAYOUT_ACCOUNTS;
        if (!parsed.payoutRequests) parsed.payoutRequests = SEED_PAYOUT_REQUESTS;
        if (!parsed.subscriptions) parsed.subscriptions = SEED_SUBSCRIPTIONS;
        if (!parsed.invoices) parsed.invoices = SEED_INVOICES;
        if (!parsed.refundRequests) parsed.refundRequests = SEED_REFUND_REQUESTS;
        if (!parsed.financialSettings) parsed.financialSettings = SEED_FINANCIAL_SETTINGS;
        return parsed;
      }
    } catch {
      // Fallback
    }

    return {
      currentUser: SEED_USERS[0], // Kolawole (Client)
      users: SEED_USERS,
      developerApplications: SEED_APPLICATIONS,
      projects: SEED_PROJECTS,
      projectApplications: SEED_PROPOSALS,
      proposalCredits: SEED_CREDITS,
      notifications: SEED_NOTIFICATIONS,
      messages: SEED_MESSAGES,
      disputes: SEED_DISPUTES,
      departments: INITIAL_TECH_DEPARTMENTS,
      platformCommissionRate: 0.12, // 12% default
      payments: SEED_PAYMENTS,
      userReports: SEED_USER_REPORTS,
      codingStudioProjects: SEED_CODING_PROJECTS,
      financialTransactions: SEED_FINANCIAL_TRANSACTIONS,
      developerEarnings: SEED_DEVELOPER_EARNINGS,
      developerPayoutAccounts: SEED_PAYOUT_ACCOUNTS,
      payoutRequests: SEED_PAYOUT_REQUESTS,
      subscriptions: SEED_SUBSCRIPTIONS,
      invoices: SEED_INVOICES,
      refundRequests: SEED_REFUND_REQUESTS,
      financialSettings: SEED_FINANCIAL_SETTINGS,
    };
  }


  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not persist to localStorage:', e);
    }
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public getState(): MarketplaceState {
    return this.state;
  }

  // --- User & Role Switching ---
  public switchUser(uid: string) {
    const target = this.state.users.find(u => u.uid === uid);
    if (target) {
      this.state.currentUser = target;
      this.persist();
    }
  }

  public updateUserRole(accountType: AccountType) {
    this.state.currentUser.accountType = accountType;
    const idx = this.state.users.findIndex(u => u.uid === this.state.currentUser.uid);
    if (idx !== -1) {
      this.state.users[idx].accountType = accountType;
    }
    this.persist();
  }

  public upgradeCurrentUserToPro() {
    this.state.currentUser.hasPremiumAccess = true;
    this.state.currentUser.subscriptionTier = 'pro';
    const idx = this.state.users.findIndex(u => u.uid === this.state.currentUser.uid);
    if (idx !== -1) {
      this.state.users[idx].hasPremiumAccess = true;
      this.state.users[idx].subscriptionTier = 'pro';
    }
    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipientUid: this.state.currentUser.uid,
      title: 'TrustTech Coding Studio Pro Activated! 🚀',
      message: 'You have full access to the live browser coding environment, templates, and export tools.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'coding-studio',
    });
    this.persist();
  }

  // --- Department & Category Management (Admin) ---
  public toggleDepartment(deptId: string, isActive: boolean) {
    const dept = this.state.departments.find(d => d.id === deptId);
    if (dept) {
      dept.isActive = isActive;
      this.persist();
    }
  }

  public addSubcategoryToDepartment(deptId: string, subCategoryName: string) {
    const dept = this.state.departments.find(d => d.id === deptId);
    if (dept && subCategoryName.trim()) {
      const clean = subCategoryName.trim();
      if (!dept.subCategories.includes(clean)) {
        dept.subCategories.push(clean);
        this.persist();
      }
    }
  }

  public removeSubcategoryFromDepartment(deptId: string, subCategoryName: string) {
    const dept = this.state.departments.find(d => d.id === deptId);
    if (dept) {
      dept.subCategories = dept.subCategories.filter(s => s !== subCategoryName);
      this.persist();
    }
  }

  // --- Platform Commission Settings (Admin) ---
  public updateCommissionRate(newRate: number) {
    // Valid range between 0.01 (1%) and 0.50 (50%)
    const clamped = Math.max(0.01, Math.min(0.50, newRate));
    this.state.platformCommissionRate = clamped;
    this.persist();
  }

  // --- Developer Applications ---
  public submitDeveloperApplication(application: Omit<DeveloperApplication, 'status' | 'createdAt'>) {
    const existingIndex = this.state.developerApplications.findIndex(a => a.uid === application.uid);
    const newDoc: DeveloperApplication = {
      ...application,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.state.developerApplications[existingIndex] = newDoc;
    } else {
      this.state.developerApplications.push(newDoc);
    }

    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipientUid: application.uid,
      title: 'Verification Submitted',
      message: 'Your developer application has been received and is queued for verification review.',
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'verification',
    });

    this.persist();
  }

  public reviewDeveloperApplication(uid: string, newStatus: 'Approved' | 'Rejected', reason?: string) {
    const app = this.state.developerApplications.find(a => a.uid === uid);
    if (app) {
      app.status = newStatus;
      app.rejectionReason = reason;
      app.reviewedAt = new Date().toISOString();

      const user = this.state.users.find(u => u.uid === uid);
      if (user) {
        user.isVerifiedDeveloper = newStatus === 'Approved';
      }

      if (newStatus === 'Approved' && !this.state.proposalCredits[uid]) {
        this.state.proposalCredits[uid] = {
          uid,
          availableCredits: 15,
          monthlyAllowance: 15,
          lastResetDate: new Date().toISOString(),
        };
      }

      this.state.notifications.unshift({
        id: 'notif-' + Date.now(),
        recipientUid: uid,
        title: newStatus === 'Approved' ? 'Application Approved! 🎉' : 'Application Update',
        message: newStatus === 'Approved'
          ? 'Congratulations! Your developer application has been approved. You now hold a Verified Developer badge and can submit project proposals.'
          : `Your application could not be approved at this time: ${reason || 'Please review portfolio guidelines and reapply.'}`,
        type: 'verification',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'verification',
      });

      this.persist();
    }
  }

  // --- Proposal Credits Management ---
  public getCreditsForUser(uid: string): ProposalCredits {
    if (!this.state.proposalCredits[uid]) {
      this.state.proposalCredits[uid] = {
        uid,
        availableCredits: 15,
        monthlyAllowance: 15,
        lastResetDate: new Date().toISOString(),
      };
      this.persist();
    }
    return this.state.proposalCredits[uid];
  }

  public deductProposalCredit(uid: string): boolean {
    const creds = this.getCreditsForUser(uid);
    if (creds.availableCredits <= 0) {
      return false;
    }
    creds.availableCredits -= 1;
    this.persist();
    return true;
  }

  public resetCredits(uid: string, amount: number = 15) {
    const creds = this.getCreditsForUser(uid);
    creds.availableCredits = amount;
    creds.lastResetDate = new Date().toISOString();
    this.persist();
  }

  // --- Projects & Proposals ---
  public createProject(project: Omit<Project, 'id' | 'createdAt' | 'applicantCount'>) {
    const newProject: Project = {
      ...project,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      applicantCount: 0,
    };
    this.state.projects.unshift(newProject);
    this.persist();
    return newProject;
  }

  public submitProposal(proposal: Omit<ProjectApplication, 'id' | 'status' | 'submissionTimestamp'>): {
    success: boolean;
    error?: string;
  } {
    const creds = this.getCreditsForUser(proposal.developerUid);
    if (creds.availableCredits <= 0) {
      return { success: false, error: 'You have exhausted your 15 monthly proposal credits.' };
    }

    const exists = this.state.projectApplications.some(
      p => p.projectId === proposal.projectId && p.developerUid === proposal.developerUid
    );
    if (exists) {
      return { success: false, error: 'You have already applied to this project.' };
    }

    this.deductProposalCredit(proposal.developerUid);

    const newProposal: ProjectApplication = {
      ...proposal,
      id: 'prop-' + Date.now(),
      status: 'Submitted',
      submissionTimestamp: new Date().toISOString(),
    };

    this.state.projectApplications.unshift(newProposal);

    const project = this.state.projects.find(p => p.id === proposal.projectId);
    if (project) {
      project.applicantCount = (project.applicantCount || 0) + 1;

      this.state.notifications.unshift({
        id: 'notif-' + Date.now(),
        recipientUid: project.ownerUid,
        title: 'New Proposal Received',
        message: `${proposal.developerName} submitted a proposal for "${project.title}".`,
        type: 'application',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'dashboard-business',
      });
    }

    this.persist();
    return { success: true };
  }

  public updateProposalStatus(proposalId: string, newStatus: ProjectApplication['status']) {
    const prop = this.state.projectApplications.find(p => p.id === proposalId);
    if (prop) {
      prop.status = newStatus;

      this.state.notifications.unshift({
        id: 'notif-' + Date.now(),
        recipientUid: prop.developerUid,
        title: `Proposal Status: ${newStatus}`,
        message: `Your proposal for "${prop.projectTitle}" has been updated to ${newStatus}.`,
        type: 'application',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'dashboard-developer',
      });

      if (newStatus === 'Accepted') {
        const proj = this.state.projects.find(p => p.id === prop.projectId);
        if (proj) {
          proj.status = 'in_progress';
          proj.hiredDeveloperUid = prop.developerUid;
        }
      }

      this.persist();
    }
  }

  public attachAiScreening(proposalId: string, screening: NonNullable<ProjectApplication['aiScreening']>) {
    const prop = this.state.projectApplications.find(p => p.id === proposalId);
    if (prop) {
      prop.aiScreening = screening;
      this.persist();
    }
  }

  // --- Payment Transactions & Escrow ---
  public createPaymentTransaction(params: {
    projectId: string;
    projectTitle: string;
    milestoneId: string;
    milestoneTitle: string;
    clientUid: string;
    clientName: string;
    developerUid: string;
    developerName: string;
    amountNgn: number;
    paymentMethod: string;
  }): PaymentTransaction {
    const rate = this.state.platformCommissionRate || 0.12;
    const fin = calculateProjectFinancials(params.amountNgn, rate, 0.025);
    const now = new Date().toISOString();
    
    const tx: PaymentTransaction = {
      id: 'tx-' + Date.now(),
      projectId: params.projectId,
      projectTitle: params.projectTitle,
      milestoneId: params.milestoneId,
      milestoneTitle: params.milestoneTitle,
      clientUid: params.clientUid,
      clientName: params.clientName,
      developerUid: params.developerUid,
      developerName: params.developerName,
      amountNgn: params.amountNgn,
      commissionRate: rate,
      commissionNgn: fin.developerCommissionNgn,
      developerEarningsNgn: fin.developerNetPayoutNgn,
      clientFeeNgn: fin.clientProtectionFeeNgn,
      totalPaidByClientNgn: fin.clientTotalChargeNgn,
      status: 'Paid',
      paymentMethod: params.paymentMethod,
      gatewayReference: 'TT_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      createdAt: now,
      verifiedAt: now,
    };

    this.state.payments.unshift(tx);

    // Record in immutable financial ledger
    const ledgerTxn: FinancialTransaction = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      userId: params.clientUid,
      userName: params.clientName,
      userRole: 'client',
      counterpartyId: params.developerUid,
      counterpartyName: params.developerName,
      projectId: params.projectId,
      projectTitle: params.projectTitle,
      milestoneId: params.milestoneId,
      milestoneTitle: params.milestoneTitle,
      type: 'milestone_payment',
      amountNgn: params.amountNgn,
      commissionRate: rate,
      commissionNgn: fin.developerCommissionNgn,
      clientFeeNgn: fin.clientProtectionFeeNgn,
      netAmountNgn: fin.developerNetPayoutNgn,
      currency: 'NGN',
      paymentProvider: params.paymentMethod.includes('Paystack') ? 'Paystack' : 'Bank Wire',
      providerReference: tx.gatewayReference,
      status: 'Paid',
      timestamp: now,
      description: `Milestone "${params.milestoneTitle}" funded by ${params.clientName}. Total charged: ₦${fin.clientTotalChargeNgn.toLocaleString()}.`,
    };
    this.state.financialTransactions.unshift(ledgerTxn);

    // Create Official Tax Invoice
    const inv: Invoice = {
      id: 'INV-' + Date.now(),
      invoiceNumber: 'TT-INV-' + Math.floor(100000 + Math.random() * 900000),
      transactionId: ledgerTxn.id,
      projectId: params.projectId,
      projectTitle: params.projectTitle,
      milestoneTitle: params.milestoneTitle,
      issuer: {
        name: 'TrustTech Africa Ltd',
        rcNumber: 'RC-1928472',
        address: 'Plot 12A, Victoria Island Financial District, Lagos, Nigeria',
        vatNumber: 'VAT-NG-8829104',
        supportEmail: 'billing@trusttech.ng',
      },
      billedTo: {
        uid: params.clientUid,
        name: params.clientName,
        email: 'billing@client.com',
        role: 'client',
      },
      lineItems: [
        {
          description: `Milestone Deposit: ${params.milestoneTitle}`,
          amountNgn: params.amountNgn,
          type: 'milestone',
        },
        {
          description: 'Client Protection & Escrow Fee (2.5%)',
          amountNgn: fin.clientProtectionFeeNgn,
          type: 'client_fee',
        },
      ],
      subtotalNgn: params.amountNgn,
      taxNgn: 0,
      commissionNgn: fin.developerCommissionNgn,
      clientFeeNgn: fin.clientProtectionFeeNgn,
      totalNgn: fin.clientTotalChargeNgn,
      currency: 'NGN',
      status: 'Paid',
      issuedDate: now,
      paidDate: now,
      paymentMethod: params.paymentMethod,
      providerReference: tx.gatewayReference,
    };
    this.state.invoices.unshift(inv);

    this.fundMilestone(params.projectId, params.milestoneId);
    this.persist();
    return tx;
  }

  public verifyPayment(transactionId: string) {
    const tx = this.state.payments.find(p => p.id === transactionId);
    if (tx) {
      tx.status = 'Paid';
      tx.verifiedAt = new Date().toISOString();
      this.persist();
    }
  }

  public refundPayment(transactionId: string, reason: string) {
    const tx = this.state.payments.find(p => p.id === transactionId);
    if (tx) {
      tx.status = 'Refunded';
      tx.refundReason = reason;
      this.persist();
    }
  }

  // --- Project Milestones Lifecycle & Escrow ---
  public updateMilestoneStatus(projectId: string, milestoneId: string, status: Milestone['status']) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (proj) {
      const m = proj.milestones.find(item => item.id === milestoneId);
      if (m) {
        m.status = status;
        this.persist();
      }
    }
  }

  public fundMilestone(projectId: string, milestoneId: string) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (proj) {
      const m = proj.milestones.find(item => item.id === milestoneId);
      if (m) {
        m.status = 'funded';
        m.fundedAt = new Date().toISOString();

        if (proj.hiredDeveloperUid) {
          const devUid = proj.hiredDeveloperUid;
          const rate = this.state.platformCommissionRate || 0.12;
          const fin = calculateProjectFinancials(m.amountNgn, rate, 0.025);

          if (!this.state.developerEarnings[devUid]) {
            this.state.developerEarnings[devUid] = {
              developerUid: devUid,
              developerName: 'Developer',
              totalGrossEarningsNgn: 0,
              totalCommissionDeductedNgn: 0,
              totalNetEarningsNgn: 0,
              availableBalanceNgn: 0,
              pendingBalanceNgn: 0,
              totalWithdrawnNgn: 0,
              lastUpdated: new Date().toISOString(),
            };
          }
          this.state.developerEarnings[devUid].pendingBalanceNgn += fin.developerNetPayoutNgn;
          this.state.developerEarnings[devUid].lastUpdated = new Date().toISOString();

          this.state.notifications.unshift({
            id: 'notif-' + Date.now(),
            recipientUid: devUid,
            title: 'Milestone Funded in Escrow! 💰',
            message: `Milestone "${m.title}" for ${proj.title} is now funded in TrustTech escrow. You may begin development safely.`,
            type: 'milestone',
            read: false,
            createdAt: new Date().toISOString(),
            linkTab: 'dashboard-developer',
          });
        }

        this.persist();
      }
    }
  }

  public submitMilestoneDeliverable(projectId: string, milestoneId: string, url: string, notes: string) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (proj) {
      const m = proj.milestones.find(item => item.id === milestoneId);
      if (m) {
        m.status = 'in_review';
        m.deliverableUrl = url;
        m.deliverableNotes = notes;
        m.submittedAt = new Date().toISOString();

        this.state.notifications.unshift({
          id: 'notif-' + Date.now(),
          recipientUid: proj.ownerUid,
          title: 'Deliverable Submitted for Review',
          message: `Developer submitted deliverable for "${m.title}". Your 7-day review period has commenced.`,
          type: 'milestone',
          read: false,
          createdAt: new Date().toISOString(),
          linkTab: 'dashboard-business',
        });

        this.persist();
      }
    }
  }

  public releaseMilestone(projectId: string, milestoneId: string) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (proj) {
      const m = proj.milestones.find(item => item.id === milestoneId);
      if (m) {
        const now = new Date().toISOString();
        m.status = 'released';
        m.releasedAt = now;

        // Update corresponding payment status if exists
        const tx = this.state.payments.find(p => p.projectId === projectId && p.milestoneId === milestoneId);
        if (tx) {
          tx.status = 'Released';
          tx.releasedAt = now;
        }

        const allReleased = proj.milestones.every(item => item.status === 'released');
        if (allReleased) {
          proj.status = 'completed';
        }

        if (proj.hiredDeveloperUid) {
          const devUid = proj.hiredDeveloperUid;
          const rate = this.state.platformCommissionRate || 0.12;
          const fin = calculateProjectFinancials(m.amountNgn, rate, 0.025);

          if (!this.state.developerEarnings[devUid]) {
            this.state.developerEarnings[devUid] = {
              developerUid: devUid,
              developerName: 'Developer',
              totalGrossEarningsNgn: 0,
              totalCommissionDeductedNgn: 0,
              totalNetEarningsNgn: 0,
              availableBalanceNgn: 0,
              pendingBalanceNgn: 0,
              totalWithdrawnNgn: 0,
              lastUpdated: now,
            };
          }
          const earn = this.state.developerEarnings[devUid];
          earn.totalGrossEarningsNgn += m.amountNgn;
          earn.totalCommissionDeductedNgn += fin.developerCommissionNgn;
          earn.totalNetEarningsNgn += fin.developerNetPayoutNgn;
          earn.availableBalanceNgn += fin.developerNetPayoutNgn;
          earn.pendingBalanceNgn = Math.max(0, earn.pendingBalanceNgn - fin.developerNetPayoutNgn);
          earn.lastUpdated = now;

          // Record in financial ledger
          this.state.financialTransactions.unshift({
            id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
            userId: devUid,
            userName: earn.developerName,
            userRole: 'developer',
            counterpartyId: proj.ownerUid,
            counterpartyName: proj.ownerName,
            projectId: proj.id,
            projectTitle: proj.title,
            milestoneId: m.id,
            milestoneTitle: m.title,
            type: 'milestone_release',
            amountNgn: m.amountNgn,
            commissionRate: rate,
            commissionNgn: fin.developerCommissionNgn,
            clientFeeNgn: 0,
            netAmountNgn: fin.developerNetPayoutNgn,
            currency: 'NGN',
            paymentProvider: 'TrustTech Ledger',
            providerReference: 'REL_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            status: 'Released',
            timestamp: now,
            description: `Milestone "${m.title}" approved and net earnings (₦${fin.developerNetPayoutNgn.toLocaleString()}) credited to developer wallet after 12% commission (₦${fin.developerCommissionNgn.toLocaleString()}).`,
          });

          const ratePct = Math.round(rate * 100);
          this.state.notifications.unshift({
            id: 'notif-' + Date.now(),
            recipientUid: devUid,
            title: 'Milestone Funds Released! 🎉',
            message: `Client approved deliverable for "${m.title}". Payout released to your available balance (12% TrustTech commission deducted).`,
            type: 'milestone',
            read: false,
            createdAt: now,
            linkTab: 'financial-centre',
          });
        }

        this.persist();
      }
    }
  }

  // --- Financial Centre Operations (Wallet, Payouts, Subscriptions, Refunds) ---
  public requestPayout(params: {
    developerUid: string;
    amountNgn: number;
    bankAccountId: string;
    idempotencyKey?: string;
  }): { success: boolean; error?: string; payout?: PayoutRequest } {
    const { developerUid, amountNgn, bankAccountId, idempotencyKey } = params;
    const earn = this.state.developerEarnings[developerUid];
    if (!earn || earn.availableBalanceNgn < amountNgn) {
      return { success: false, error: 'Insufficient available balance in your wallet.' };
    }

    if (amountNgn < (this.state.financialSettings?.minWithdrawalNgn || 5000)) {
      return { success: false, error: 'Minimum withdrawal amount is ₦5,000.' };
    }

    const bankAccount = this.state.developerPayoutAccounts.find(
      b => b.id === bankAccountId && b.developerUid === developerUid
    );
    if (!bankAccount) {
      return { success: false, error: 'Please select a verified bank account.' };
    }

    const idemKey = idempotencyKey || `idem-${developerUid}-${amountNgn}-${Date.now()}`;
    const existing = this.state.payoutRequests.find(
      p => p.idempotencyKey === idemKey && p.status !== 'Failed'
    );
    if (existing) {
      return { success: false, error: 'A withdrawal request with this reference is already in progress.' };
    }

    const now = new Date().toISOString();
    const payoutId = 'PAYOUT-' + Math.floor(100000 + Math.random() * 900000);
    const payout: PayoutRequest = {
      id: payoutId,
      developerUid,
      developerName: earn.developerName,
      developerEmail: 'developer@trusttech.dev',
      bankAccountId: bankAccount.id,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountName: bankAccount.accountName,
      amountNgn,
      feeNgn: 0,
      netPayoutNgn: amountNgn,
      status: 'Pending',
      idempotencyKey: idemKey,
      providerReference: 'TRF_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      requestedAt: now,
      auditTrail: [
        {
          timestamp: now,
          action: 'Requested Withdrawal',
          actor: earn.developerName,
          note: `Requested ₦${amountNgn.toLocaleString()} to ${bankAccount.bankName} (***${bankAccount.accountNumber.slice(-4)})`,
        },
      ],
    };

    // Atomic debit of available balance
    earn.availableBalanceNgn -= amountNgn;
    earn.lastUpdated = now;

    this.state.payoutRequests.unshift(payout);

    // Ledger record
    this.state.financialTransactions.unshift({
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      userId: developerUid,
      userName: earn.developerName,
      userRole: 'developer',
      type: 'payout_withdrawal',
      amountNgn,
      commissionRate: 0,
      commissionNgn: 0,
      clientFeeNgn: 0,
      netAmountNgn: amountNgn,
      currency: 'NGN',
      paymentProvider: 'TrustTech Ledger',
      providerReference: payout.providerReference || ('TRF_' + Math.random().toString(36).substring(2, 10).toUpperCase()),
      status: 'Pending',
      timestamp: now,
      description: `Developer bank withdrawal of ₦${amountNgn.toLocaleString()} to ${bankAccount.bankName}.`,
    });

    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipientUid: developerUid,
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal of ₦${amountNgn.toLocaleString()} has been queued for bank transfer processing.`,
      type: 'payment',
      read: false,
      createdAt: now,
      linkTab: 'financial-centre',
    });

    this.persist();
    return { success: true, payout };
  }

  public processPayout(payoutId: string, targetStatus: PayoutStatus, adminNotes?: string) {
    const payout = this.state.payoutRequests.find(p => p.id === payoutId);
    if (!payout) return;

    const now = new Date().toISOString();
    const previousStatus = payout.status;
    payout.status = targetStatus;

    if (targetStatus === 'Processing') payout.processedAt = now;
    if (targetStatus === 'Successful') {
      payout.completedAt = now;
      const earn = this.state.developerEarnings[payout.developerUid];
      if (earn && previousStatus !== 'Successful') {
        earn.totalWithdrawnNgn += payout.amountNgn;
        earn.lastUpdated = now;
      }
    }

    if (targetStatus === 'Failed' || targetStatus === 'Reversed') {
      payout.failureReason = adminNotes || 'Bank network rejected transfer';
      // Refund back to available balance
      const earn = this.state.developerEarnings[payout.developerUid];
      if (earn) {
        earn.availableBalanceNgn += payout.amountNgn;
        earn.lastUpdated = now;
      }
    }

    payout.auditTrail.push({
      timestamp: now,
      action: `Status transitioned to ${targetStatus}`,
      actor: 'Admin / Payment Partner',
      note: adminNotes || `Payout transitioned to ${targetStatus}`,
    });

    // Update status in financial ledger
    const ledgerTx = this.state.financialTransactions.find(t => t.providerReference === payout.providerReference);
    if (ledgerTx) {
      ledgerTx.status = targetStatus === 'Successful' ? 'Paid' : targetStatus === 'Processing' ? 'Processing' : 'Failed';
    }

    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipientUid: payout.developerUid,
      title: `Payout ${targetStatus}`,
      message: `Your withdrawal of ₦${payout.amountNgn.toLocaleString()} is now ${targetStatus}.`,
      type: 'payment',
      read: false,
      createdAt: now,
      linkTab: 'financial-centre',
    });

    this.persist();
  }

  public addPayoutAccount(account: Omit<DeveloperPayoutAccount, 'id' | 'createdAt'>) {
    if (account.isPrimary) {
      this.state.developerPayoutAccounts.forEach(acc => {
        if (acc.developerUid === account.developerUid) {
          acc.isPrimary = false;
        }
      });
    }

    const newAcc: DeveloperPayoutAccount = {
      ...account,
      id: 'bank-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    this.state.developerPayoutAccounts.unshift(newAcc);
    this.persist();
    return newAcc;
  }

  public createSubscription(userId: string, plan: SubscriptionPlan, paymentMethod: string = 'Paystack Card Checkout') {
    const isYearly = plan === 'yearly_premium_pro';
    const amountNgn = isYearly ? 150000 : 5000;
    const now = new Date();
    const expires = new Date();
    if (isYearly) expires.setFullYear(expires.getFullYear() + 1);
    else expires.setMonth(expires.getMonth() + 1);

    const user = this.state.users.find(u => u.uid === userId);
    const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const ref = 'PSTK_SUB_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Cancel existing active subscription
    const existing = this.state.subscriptions.find(s => s.userId === userId && s.status === 'active');
    if (existing) {
      existing.status = 'cancelled';
      existing.updatedAt = now.toISOString();
    }

    const newSub: Subscription = {
      id: subId,
      userId,
      userName: user ? user.fullName : 'Subscriber',
      userEmail: user ? user.email : '',
      plan,
      amountNgn,
      billingCycle: isYearly ? 'yearly' : 'monthly',
      status: 'active',
      startDate: now.toISOString(),
      renewalDate: expires.toISOString(),
      expiresAt: expires.toISOString(),
      autoRenew: true,
      paymentProvider: paymentMethod,
      lastTransactionReference: ref,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.state.subscriptions.unshift(newSub);

    // Update user access flags
    if (user) {
      user.hasPremiumAccess = true;
      user.subscriptionTier = 'pro';
    }
    if (this.state.currentUser.uid === userId) {
      this.state.currentUser.hasPremiumAccess = true;
      this.state.currentUser.subscriptionTier = 'pro';
    }

    // Ledger record
    const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    this.state.financialTransactions.unshift({
      id: txnId,
      userId,
      userName: user ? user.fullName : 'Subscriber',
      userRole: user ? user.accountType : 'client',
      type: 'subscription_payment',
      amountNgn,
      commissionRate: 0,
      commissionNgn: 0,
      clientFeeNgn: 0,
      netAmountNgn: amountNgn,
      currency: 'NGN',
      paymentProvider: 'Paystack',
      providerReference: ref,
      status: 'Paid',
      timestamp: now.toISOString(),
      description: `TrustTech ${isYearly ? 'Yearly Premium Pro' : 'Monthly Premium'} plan activated.`,
    });

    // Invoice
    this.state.invoices.unshift({
      id: 'INV-' + Date.now(),
      invoiceNumber: 'TT-SUB-' + Math.floor(100000 + Math.random() * 900000),
      transactionId: txnId,
      issuer: {
        name: 'TrustTech Africa Ltd',
        rcNumber: 'RC-1928472',
        address: 'Plot 12A, Victoria Island Financial District, Lagos, Nigeria',
        vatNumber: 'VAT-NG-8829104',
        supportEmail: 'billing@trusttech.ng',
      },
      billedTo: {
        uid: userId,
        name: user ? user.fullName : 'Subscriber',
        email: user ? user.email : '',
        role: user ? user.accountType : 'client',
      },
      lineItems: [
        {
          description: `TrustTech ${isYearly ? 'Yearly Pro' : 'Monthly Premium'} Subscription`,
          amountNgn,
          type: 'subscription',
        },
      ],
      subtotalNgn: amountNgn,
      taxNgn: 0,
      commissionNgn: 0,
      clientFeeNgn: 0,
      totalNgn: amountNgn,
      currency: 'NGN',
      status: 'Paid',
      issuedDate: now.toISOString(),
      paidDate: now.toISOString(),
      paymentMethod,
      providerReference: ref,
    });

    this.persist();
    return newSub;
  }

  public cancelSubscription(userId: string) {
    const sub = this.state.subscriptions.find(s => s.userId === userId && s.status === 'active');
    if (sub) {
      sub.autoRenew = false;
      sub.status = 'cancelled';
      sub.updatedAt = new Date().toISOString();
      this.persist();
    }
  }

  public requestRefund(params: {
    projectId: string;
    projectTitle: string;
    milestoneId: string;
    milestoneTitle: string;
    clientUid: string;
    clientName: string;
    developerUid: string;
    developerName: string;
    amountNgn: number;
    reason: RefundRequest['reason'];
    details: string;
  }) {
    const refId = 'REF-' + Math.floor(100000 + Math.random() * 900000);
    const refund: RefundRequest = {
      ...params,
      id: refId,
      status: 'Pending Review',
      requestedAt: new Date().toISOString(),
    };

    this.state.refundRequests.unshift(refund);

    // Update payment status to Refund Pending
    const p = this.state.payments.find(pay => pay.projectId === params.projectId && pay.milestoneId === params.milestoneId);
    if (p) {
      p.status = 'Refund Pending';
    }

    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipientUid: 'user-admin',
      title: 'New Refund Request',
      message: `${params.clientName} requested refund for ₦${params.amountNgn.toLocaleString()} on "${params.milestoneTitle}".`,
      type: 'payment',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'financial-centre',
    });

    this.persist();
    return refund;
  }

  public processRefund(refundId: string, approved: boolean, adminNotes?: string) {
    const ref = this.state.refundRequests.find(r => r.id === refundId);
    if (!ref) return;

    const now = new Date().toISOString();
    ref.status = approved ? 'Refunded' : 'Rejected';
    ref.adminNotes = adminNotes;
    ref.resolvedAt = now;

    if (approved) {
      ref.refundReference = 'RFD_' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const p = this.state.payments.find(pay => pay.projectId === ref.projectId && pay.milestoneId === ref.milestoneId);
      if (p) p.status = 'Refunded';

      // Deduct from developer pending balance
      const earn = this.state.developerEarnings[ref.developerUid];
      if (earn) {
        const rate = this.state.platformCommissionRate || 0.12;
        const fin = calculateProjectFinancials(ref.amountNgn, rate, 0.025);
        earn.pendingBalanceNgn = Math.max(0, earn.pendingBalanceNgn - fin.developerNetPayoutNgn);
        earn.lastUpdated = now;
      }

      // Ledger event
      this.state.financialTransactions.unshift({
        id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        userId: ref.clientUid,
        userName: ref.clientName,
        userRole: 'client',
        counterpartyId: ref.developerUid,
        counterpartyName: ref.developerName,
        projectId: ref.projectId,
        projectTitle: ref.projectTitle,
        milestoneId: ref.milestoneId,
        milestoneTitle: ref.milestoneTitle,
        type: 'refund',
        amountNgn: ref.amountNgn,
        commissionRate: 0,
        commissionNgn: 0,
        clientFeeNgn: 0,
        netAmountNgn: ref.amountNgn,
        currency: 'NGN',
        paymentProvider: 'TrustTech Ledger',
        providerReference: ref.refundReference,
        status: 'Refunded',
        timestamp: now,
        description: `Refund of ₦${ref.amountNgn.toLocaleString()} issued to client ${ref.clientName}.`,
      });
    }

    this.persist();
  }

  public updateFinancialSettings(settings: Partial<FinancialSettings>) {
    this.state.financialSettings = {
      ...this.state.financialSettings,
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    if (settings.developerCommissionRate !== undefined) {
      this.state.platformCommissionRate = settings.developerCommissionRate;
    }
    this.persist();
  }


  // --- Dispute Resolution ---
  public raiseDispute(dispute: Omit<DisputeItem, 'id' | 'status' | 'createdAt'>) {
    const newDispute: DisputeItem = {
      ...dispute,
      id: 'disp-' + Date.now(),
      status: 'Dispute Submitted',
      createdAt: new Date().toISOString(),
    };

    this.state.disputes.unshift(newDispute);

    // Update payment status to Disputed if exists
    const tx = this.state.payments.find(p => p.projectId === dispute.projectId && p.milestoneId === dispute.milestoneId);
    if (tx) {
      tx.status = 'Disputed';
    }

    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipientUid: dispute.defendantUid,
      title: 'Milestone Dispute Raised',
      message: `${dispute.raisedByName} opened a dispute for "${dispute.milestoneTitle}". TrustTech operations will review the submitted evidence.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'dashboard-business',
    });

    this.persist();
    return newDispute;
  }

  public resolveDispute(disputeId: string, status: DisputeItem['status'], resolutionDecision?: string) {
    const disp = this.state.disputes.find(d => d.id === disputeId);
    if (disp) {
      disp.status = status;
      if (resolutionDecision) disp.resolutionDecision = resolutionDecision;
      disp.updatedAt = new Date().toISOString();

      const notifyMessage = `Dispute for "${disp.milestoneTitle}" status updated to "${status}": ${resolutionDecision || 'See details in console'}`;
      this.state.notifications.unshift({
        id: 'notif-' + Date.now(),
        recipientUid: disp.raisedByUid,
        title: `Dispute ${status}`,
        message: notifyMessage,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      });
      this.state.notifications.unshift({
        id: 'notif-' + (Date.now() + 1),
        recipientUid: disp.defendantUid,
        title: `Dispute ${status}`,
        message: notifyMessage,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      });

      this.persist();
    }
  }

  // --- User Reports Queue ---
  public reportMessage(report: Omit<UserReport, 'id' | 'createdAt' | 'status'>) {
    const newReport: UserReport = {
      ...report,
      id: 'rep-' + Date.now(),
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    this.state.userReports.unshift(newReport);

    // Mark message as reported if target is a message
    if (report.reportedTargetType === 'message') {
      const msg = this.state.messages.find(m => m.id === report.targetId);
      if (msg) {
        msg.reported = true;
        msg.reportReason = report.reason;
      }
    }

    this.persist();
    return newReport;
  }

  public updateUserReportStatus(reportId: string, status: UserReport['status']) {
    const rep = this.state.userReports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      this.persist();
    }
  }

  // --- Messages & Chat ---
  public sendMessage(
    projectId: string,
    senderUid: string,
    senderName: string,
    senderRole: AccountType,
    text: string,
    attachments?: ChatAttachment[]
  ) {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;
    const newMsg: MessageItem = {
      id: 'msg-' + Date.now(),
      projectId,
      senderUid,
      senderName,
      senderRole,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments || [],
      read: false,
    };
    this.state.messages.push(newMsg);

    // Create notification for other party in project
    const proj = this.state.projects.find(p => p.id === projectId);
    if (proj) {
      const otherUid = senderUid === proj.ownerUid ? proj.hiredDeveloperUid : proj.ownerUid;
      if (otherUid) {
        this.state.notifications.unshift({
          id: 'notif-' + Date.now(),
          recipientUid: otherUid,
          title: `New message from ${senderName}`,
          message: text.length > 60 ? text.substring(0, 57) + '...' : text || 'Sent an attachment',
          type: 'message',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    this.persist();
    return newMsg;
  }

  public markMessageRead(messageId: string) {
    const msg = this.state.messages.find(m => m.id === messageId);
    if (msg) {
      msg.read = true;
      this.persist();
    }
  }

  // --- Coding Studio Projects ---
  public saveCodingStudioProject(proj: Omit<CodingStudioProject, 'createdAt' | 'updatedAt'>) {
    const existingIndex = this.state.codingStudioProjects.findIndex(p => p.id === proj.id);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.state.codingStudioProjects[existingIndex] = {
        ...this.state.codingStudioProjects[existingIndex],
        ...proj,
        updatedAt: now,
      };
    } else {
      this.state.codingStudioProjects.unshift({
        ...proj,
        createdAt: now,
        updatedAt: now,
      });
    }
    this.persist();
  }

  // --- Notifications ---
  public markNotificationAsRead(id: string) {
    const n = this.state.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead(recipientUid: string) {
    this.state.notifications.forEach(n => {
      if (n.recipientUid === recipientUid) {
        n.read = true;
      }
    });
    this.persist();
  }

  // --- Reset to Factory Seeds ---
  public resetToFactorySeeds() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.persist();
  }
}

export const store = new MarketplaceStore();
