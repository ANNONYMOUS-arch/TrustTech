import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMilestonesTotal,
  calculateProjectFinancials,
  generateBalancedMilestones,
  checkProposalEligibility,
  validateDeveloperApplication,
  formatNgn,
} from './marketplaceRules';

test('validateMilestonesTotal detects exact 100% total', () => {
  const validMilestones = [
    { percentage: 25 },
    { percentage: 25 },
    { percentage: 30 },
    { percentage: 20 },
  ];
  const result = validateMilestonesTotal(validMilestones);
  assert.equal(result.isValid, true);
  assert.equal(result.totalPercentage, 100);
  assert.equal(result.difference, 0);
});

test('validateMilestonesTotal catches over-100% milestone configurations', () => {
  const invalidMilestones = [
    { percentage: 40 },
    { percentage: 40 },
    { percentage: 30 }, // 110%
  ];
  const result = validateMilestonesTotal(invalidMilestones);
  assert.equal(result.isValid, false);
  assert.equal(result.totalPercentage, 110);
  assert.equal(result.difference, -10);
});

test('calculateProjectFinancials computes 12% developer fee and 2.5% client fee correctly', () => {
  // Test prompt example: ₦250,000 project
  const project250k = calculateProjectFinancials(250000);
  assert.equal(project250k.developerCommissionNgn, 30000); // ₦30,000 (12%)
  assert.equal(project250k.developerNetPayoutNgn, 220000); // ₦220,000
  assert.equal(project250k.clientProtectionFeeNgn, 6250); // 2.5%
  assert.equal(project250k.clientTotalChargeNgn, 256250);

  // Test ₦200,000 project
  const project200k = calculateProjectFinancials(200000);
  assert.equal(project200k.developerCommissionNgn, 24000); // 12% of ₦200,000
  assert.equal(project200k.developerNetPayoutNgn, 176000);
  assert.equal(project200k.clientProtectionFeeNgn, 5000);
  assert.equal(project200k.clientTotalChargeNgn, 205000);
});

test('generateBalancedMilestones produces 4 milestones totaling exactly 100%', () => {
  const milestones = generateBalancedMilestones(300000);
  assert.equal(milestones.length, 4);
  const totalPct = milestones.reduce((sum, m) => sum + m.percentage, 0);
  assert.equal(totalPct, 100);

  const totalAmount = milestones.reduce((sum, m) => sum + m.amountNgn, 0);
  assert.equal(totalAmount, 300000);
});

test('checkProposalEligibility enforces verification, credits, and duplicate checks', () => {
  const existing = [
    { projectId: 'p1', developerUid: 'dev-1' }
  ];

  // Case 1: unverified developer cannot apply
  const unverified = checkProposalEligibility(15, existing, 'p2', 'dev-1', false);
  assert.equal(unverified.canApply, false);
  assert.match(unverified.reason || '', /approved/i);

  // Case 2: duplicate application to same project
  const duplicate = checkProposalEligibility(15, existing, 'p1', 'dev-1', true);
  assert.equal(duplicate.canApply, false);
  assert.match(duplicate.reason || '', /already submitted/i);

  // Case 3: 0 credits remaining
  const noCredits = checkProposalEligibility(0, existing, 'p2', 'dev-1', true);
  assert.equal(noCredits.canApply, false);
  assert.match(noCredits.reason || '', /exhausted your 15 proposal credits/i);

  // Case 4: eligible developer can apply
  const valid = checkProposalEligibility(5, existing, 'p2', 'dev-1', true);
  assert.equal(valid.canApply, true);
});

test('validateDeveloperApplication rejects incomplete bio and missing skills', () => {
  const invalid = validateDeveloperApplication({
    professionalTitle: 'Dev',
    bio: 'Too short',
    skills: [],
    portfolio: 'not-a-url',
    accuracyAgreed: false,
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.length >= 4);

  const valid = validateDeveloperApplication({
    professionalTitle: 'Senior Webflow Developer',
    bio: 'Experienced frontend and no-code developer with 5+ years building e-commerce and SaaS sites.',
    skills: ['Webflow', 'Tailwind CSS', 'JavaScript'],
    portfolio: 'https://johndoe.dev',
    accuracyAgreed: true,
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);
});

test('formatNgn outputs Nigerian Naira symbol and commas', () => {
  assert.equal(formatNgn(250000), '₦250,000');
  assert.equal(formatNgn(0), '₦0');
});
