import { Milestone } from '../types';

/**
 * Validates that milestones sum up to exactly 100%.
 * Prevents over-billing or under-funding discrepancies.
 */
export function validateMilestonesTotal(milestones: Array<{ percentage: number }>): {
  isValid: boolean;
  totalPercentage: number;
  difference: number;
} {
  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const diff = 100 - totalPercentage;
  return {
    isValid: Math.abs(diff) < 0.001,
    totalPercentage,
    difference: diff,
  };
}

/**
 * Calculates marketplace fee economics.
 * - Developer commission: 12% (deducted from gross developer quote, e.g. ₦250k quote -> ₦30k commission, ₦220k payout)
 * - Client transaction & escrow fee: 2.5% (separately disclosed)
 */
export function calculateProjectFinancials(
  grossDeveloperQuoteNgn: number,
  developerCommissionRate: number = 0.12,
  clientProtectionFeeRate: number = 0.025
) {
  const quote = Math.max(0, grossDeveloperQuoteNgn);
  const commissionRate = Math.max(0, Math.min(1, developerCommissionRate));
  const clientFeeRate = Math.max(0, Math.min(1, clientProtectionFeeRate));

  const developerCommissionNgn = Math.round(quote * commissionRate);
  const developerNetPayoutNgn = quote - developerCommissionNgn;

  const clientProtectionFeeNgn = Math.round(quote * clientFeeRate);
  const clientTotalChargeNgn = quote + clientProtectionFeeNgn;

  return {
    grossQuoteNgn: quote,
    commissionRate,
    clientFeeRate,
    developerCommissionNgn,
    developerNetPayoutNgn,
    clientProtectionFeeNgn,
    clientTotalChargeNgn,
  };
}

/**
 * Generates default balanced 4-stage milestones totaling exactly 100%.
 */
export function generateBalancedMilestones(totalBudgetNgn: number): Milestone[] {
  return [
    {
      id: 'm1',
      title: 'Initial Deposit & Discovery Kickoff',
      description: 'Requirements sign-off, architecture setup, and preliminary prototypes.',
      percentage: 25,
      amountNgn: Math.round(totalBudgetNgn * 0.25),
      status: 'pending',
      dueDays: 5,
    },
    {
      id: 'm2',
      title: 'Working Prototype / Milestone 1',
      description: 'Core functional screens, navigation, and key workflows implemented.',
      percentage: 30,
      amountNgn: Math.round(totalBudgetNgn * 0.30),
      status: 'pending',
      dueDays: 14,
    },
    {
      id: 'm3',
      title: 'Full Feature Build & Integration',
      description: 'Complete functionality, integrations, responsiveness, and end-to-end testing.',
      percentage: 30,
      amountNgn: Math.round(totalBudgetNgn * 0.30),
      status: 'pending',
      dueDays: 25,
    },
    {
      id: 'm4',
      title: 'Final Acceptance & 7-Day Escrow Review',
      description: 'Client review, bug fixes, deployment handover, and code repository transfer.',
      percentage: 15,
      amountNgn: Math.round(totalBudgetNgn * 0.15),
      status: 'pending',
      dueDays: 32,
    },
  ];
}

/**
 * Checks if a developer is eligible to apply for a project.
 */
export function checkProposalEligibility(
  availableCredits: number,
  existingApplications: Array<{ projectId: string; developerUid: string }>,
  targetProjectId: string,
  developerUid: string,
  isVerifiedDeveloper: boolean = true
): { canApply: boolean; reason?: string } {
  if (!isVerifiedDeveloper) {
    return {
      canApply: false,
      reason: 'Your developer application must be approved before you can submit proposals.',
    };
  }

  const alreadyApplied = existingApplications.some(
    app => app.projectId === targetProjectId && app.developerUid === developerUid
  );

  if (alreadyApplied) {
    return {
      canApply: false,
      reason: 'You have already submitted an application to this project.',
    };
  }

  if (availableCredits <= 0) {
    return {
      canApply: false,
      reason: 'You have exhausted your 15 proposal credits for this billing period.',
    };
  }

  return { canApply: true };
}

/**
 * Validates developer verification form inputs.
 */
export function validateDeveloperApplication(input: {
  professionalTitle: string;
  bio: string;
  skills: string[];
  portfolio: string;
  accuracyAgreed: boolean;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.professionalTitle || input.professionalTitle.trim().length < 3) {
    errors.push('Professional title must be at least 3 characters.');
  }

  if (!input.bio || input.bio.trim().length < 40) {
    errors.push('Professional biography must be at least 40 characters detailing your experience.');
  }

  if (!input.skills || input.skills.length === 0) {
    errors.push('Please specify at least one verified skill.');
  }

  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  if (!input.portfolio || !urlPattern.test(input.portfolio.trim())) {
    errors.push('Please provide a valid portfolio or personal website URL.');
  }

  if (!input.accuracyAgreed) {
    errors.push('You must confirm that all submitted credentials and portfolio links are accurate.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats Nigerian Naira currency neatly.
 */
export function formatNgn(amount: number): string {
  return '₦' + (amount || 0).toLocaleString('en-NG');
}
