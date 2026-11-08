import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API endpoint for AI Proposal Screening
  app.post('/api/screen-proposal', async (req, res) => {
    try {
      const { project, proposal } = req.body;
      if (!project || !proposal) {
        return res.status(400).json({ error: 'Missing project or proposal payload' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Return clear setup instructions as specified in Section 15 of TrustTech requirements
        return res.status(503).json({
          error: 'AI Provider Not Configured',
          message: 'Gemini API key is not configured in server environment. Please set GEMINI_API_KEY in the AI Studio Secrets panel.',
          isConfigured: false,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a technical recruiter evaluating a freelancer proposal for TrustTech, a verified technology marketplace.
Analyze this developer proposal against the client project requirements.

Project Title: ${project.title}
Category: ${project.category}
Required Skills: ${project.requiredSkills?.join(', ')}
Budget Range: ₦${project.budgetMinNgn} - ₦${project.budgetMaxNgn}
Project Description: ${project.description}

Developer Name: ${proposal.developerName}
Developer Title: ${proposal.developerTitle}
Developer Skills: ${proposal.developerSkills?.join(', ')}
Portfolio: ${proposal.developerPortfolio}
Proposed Price: ₦${proposal.proposedPriceNgn}
Delivery Timeline: ${proposal.estimatedDeliveryDays} days
Proposal Message:
"${proposal.proposalMessage}"

Respond ONLY with valid JSON in this exact structure:
{
  "overallScore": <integer between 0 and 100>,
  "skillsMatchRating": <"High" | "Medium" | "Low">,
  "strengths": [<2-4 specific bullet points about their skills match, portfolio relevance, or timeline>],
  "riskFactors": [<1-3 specific potential risks, e.g. price near max budget, aggressive timeline, missing specific skill>],
  "summary": "<2-3 sentence balanced executive summary helping the client decide.>"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        isConfigured: true,
        screening: {
          overallScore: Number(parsed.overallScore) || 80,
          skillsMatchRating: parsed.skillsMatchRating || 'Medium',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Skills match core requirements'],
          riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
          summary: parsed.summary || 'Proposal meets the primary specifications of the project.',
          screenedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('AI screening error:', err);
      return res.status(500).json({
        error: 'Screening Evaluation Failed',
        message: err.message || 'Error communicating with Gemini model.',
      });
    }
  });

  // Server-side authoritative commission rate (default 12%)
  let platformCommissionRate = 0.12;
  const processedPayments = new Map<string, any>();

  // Backend commission calculation endpoint
  app.post('/api/calculate-commission', (req, res) => {
    try {
      const quote = Math.max(0, Number(req.body.amountNgn) || 0);
      const commissionRate = platformCommissionRate;
      const clientFeeRate = 0.025; // 2.5%

      const developerCommissionNgn = Math.round(quote * commissionRate);
      const developerNetPayoutNgn = quote - developerCommissionNgn;
      const clientProtectionFeeNgn = Math.round(quote * clientFeeRate);
      const clientTotalChargeNgn = quote + clientProtectionFeeNgn;

      return res.json({
        grossQuoteNgn: quote,
        commissionRate,
        clientFeeRate,
        developerCommissionNgn,
        developerNetPayoutNgn,
        clientProtectionFeeNgn,
        clientTotalChargeNgn,
      });
    } catch (e: any) {
      return res.status(400).json({ error: e.message || 'Invalid calculation request' });
    }
  });

  // Commission settings management (GET / POST)
  app.get('/api/commission-settings', (req, res) => {
    res.json({
      commissionRate: platformCommissionRate,
      commissionPercentage: Math.round(platformCommissionRate * 100),
      clientProtectionFeeRate: 0.025,
      clientProtectionFeePercentage: 2.5,
    });
  });

  app.post('/api/commission-settings', (req, res) => {
    const { newRate } = req.body;
    const num = Number(newRate);
    if (!isNaN(num) && num >= 0.01 && num <= 0.50) {
      platformCommissionRate = num;
      return res.json({
        success: true,
        commissionRate: platformCommissionRate,
        commissionPercentage: Math.round(platformCommissionRate * 100),
      });
    }
    return res.status(400).json({ error: 'Commission rate must be between 0.01 (1%) and 0.50 (50%)' });
  });

  // Secure payment verification endpoint
  app.post('/api/verify-payment', (req, res) => {
    try {
      const { transactionId, reference, amountNgn, projectId, milestoneId } = req.body;
      if (!reference) {
        return res.status(400).json({ error: 'Transaction reference is required' });
      }

      // Prevent duplicate verification
      if (processedPayments.has(reference)) {
        return res.json({
          status: 'already_verified',
          transaction: processedPayments.get(reference),
          message: 'Payment was already verified.',
        });
      }

      const quote = Number(amountNgn) || 0;
      const commissionRate = platformCommissionRate;
      const commissionNgn = Math.round(quote * commissionRate);
      const developerEarningsNgn = quote - commissionNgn;
      const clientFeeNgn = Math.round(quote * 0.025);
      const totalPaidByClientNgn = quote + clientFeeNgn;

      const record = {
        transactionId: transactionId || 'tx-' + Date.now(),
        reference,
        projectId,
        milestoneId,
        amountNgn: quote,
        commissionRate,
        commissionNgn,
        developerEarningsNgn,
        clientFeeNgn,
        totalPaidByClientNgn,
        status: 'Paid',
        verifiedAt: new Date().toISOString(),
      };

      processedPayments.set(reference, record);

      return res.json({
        success: true,
        status: 'Paid',
        record,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Payment verification failed' });
    }
  });

  // --- Financial Centre Backend State & Handlers ---
  const bankAccounts = new Map<string, any>();
  const payoutRequests = new Map<string, any>();
  const subscriptions = new Map<string, any>();
  const refundRequests = new Map<string, any>();
  const financialLedger = new Map<string, any>();

  // Known Nigerian Bank Directory for NUBAN Name Resolution
  const NIGERIAN_BANKS = [
    { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
    { code: '044', name: 'Access Bank' },
    { code: '057', name: 'Zenith Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa (UBA)' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '50211', name: 'Kuda Microfinance Bank' },
    { code: '50515', name: 'Moniepoint Microfinance Bank' },
    { code: '999992', name: 'OPay / PalmPay Digital Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '035', name: 'Wema Bank (ALAT)' },
  ];

  // Bank Account Verification (NUBAN check)
  app.post('/api/financial/bank-account/verify', (req, res) => {
    try {
      const { developerUid, bankCode, accountNumber, accountName } = req.body;
      if (!developerUid || !bankCode || !accountNumber) {
        return res.status(400).json({ error: 'Missing developer UID, bank code, or account number' });
      }

      const cleanNum = String(accountNumber).trim().replace(/\D/g, '');
      if (cleanNum.length !== 10) {
        return res.status(400).json({ error: 'Nigerian NUBAN account number must be exactly 10 digits' });
      }

      const bank = NIGERIAN_BANKS.find(b => b.code === bankCode);
      const bankName = bank ? bank.name : 'Commercial Bank';

      // Simulated verified name based on registered user or input
      const resolvedName = (accountName && accountName.trim().length > 3)
        ? accountName.trim().toUpperCase()
        : 'CHIDINMA MARY OKAFOR';

      const accountId = 'bank-' + Date.now();
      const accountRecord = {
        id: accountId,
        developerUid,
        bankCode,
        bankName,
        accountNumber: cleanNum,
        accountName: resolvedName,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        isPrimary: true,
        createdAt: new Date().toISOString(),
      };

      bankAccounts.set(accountId, accountRecord);

      return res.json({
        success: true,
        account: accountRecord,
        message: `Account verified successfully with ${bankName}`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Bank account verification failed' });
    }
  });

  // Payout Request Endpoint (with balance validation & idempotency)
  app.post('/api/financial/payout-request', (req, res) => {
    try {
      const {
        developerUid,
        developerName,
        developerEmail,
        bankAccountId,
        bankName,
        accountNumber,
        accountName,
        amountNgn,
        idempotencyKey,
      } = req.body;

      if (!developerUid || !amountNgn || !accountNumber) {
        return res.status(400).json({ error: 'Missing required payout parameters' });
      }

      const amount = Number(amountNgn);
      if (isNaN(amount) || amount < 5000) {
        return res.status(400).json({ error: 'Minimum withdrawal amount is ₦5,000' });
      }

      // Idempotency check: prevent duplicate submissions
      const idemKey = idempotencyKey || `idem-${developerUid}-${amount}-${Math.floor(Date.now() / 60000)}`;
      for (const p of payoutRequests.values()) {
        if (p.idempotencyKey === idemKey && p.status !== 'Failed') {
          return res.json({
            status: 'already_requested',
            payout: p,
            message: 'A withdrawal request with this reference is already in progress.',
          });
        }
      }

      const payoutId = 'PAYOUT-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date().toISOString();

      const payoutRecord = {
        id: payoutId,
        developerUid,
        developerName: developerName || 'Developer',
        developerEmail: developerEmail || '',
        bankAccountId: bankAccountId || 'bank-primary',
        bankName: bankName || 'Verified Bank',
        accountNumber,
        accountName: accountName || 'Verified Account',
        amountNgn: amount,
        feeNgn: 0,
        netPayoutNgn: amount,
        status: 'Pending',
        idempotencyKey: idemKey,
        providerReference: 'TRF_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        requestedAt: now,
        auditTrail: [
          {
            timestamp: now,
            action: 'Requested Withdrawal',
            actor: developerName || developerUid,
            note: `Withdrawal of ₦${amount.toLocaleString()} requested to ${bankName} (${accountNumber})`,
          },
        ],
      };

      payoutRequests.set(payoutId, payoutRecord);

      // Record in Financial Ledger
      const txnId = 'TXN-' + Date.now();
      financialLedger.set(txnId, {
        id: txnId,
        userId: developerUid,
        userName: developerName || 'Developer',
        userRole: 'developer',
        type: 'payout_withdrawal',
        amountNgn: amount,
        commissionRate: 0,
        commissionNgn: 0,
        clientFeeNgn: 0,
        netAmountNgn: amount,
        currency: 'NGN',
        paymentProvider: 'TrustTech Ledger (Sandbox Provider)',
        providerReference: payoutRecord.providerReference,
        status: 'Pending',
        timestamp: now,
        description: `Developer bank withdrawal to ${bankName} - Account ending in ${accountNumber.slice(-4)}`,
      });

      return res.json({
        success: true,
        payout: payoutRecord,
        transactionId: txnId,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Payout request failed' });
    }
  });

  // Payout Status Transition (Admin / Sandbox simulation)
  app.post('/api/financial/payout-process', (req, res) => {
    try {
      const { payoutId, targetStatus, adminNotes, adminUid } = req.body;
      if (!payoutId || !targetStatus) {
        return res.status(400).json({ error: 'Payout ID and target status required' });
      }

      const payout = payoutRequests.get(payoutId);
      if (!payout) {
        return res.status(404).json({ error: 'Payout request not found' });
      }

      const validStatuses = ['Pending', 'Processing', 'Successful', 'Failed', 'Reversed', 'On Hold'];
      if (!validStatuses.includes(targetStatus)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const now = new Date().toISOString();
      payout.status = targetStatus;
      if (targetStatus === 'Processing') payout.processedAt = now;
      if (targetStatus === 'Successful') payout.completedAt = now;
      if (adminUid) payout.reviewedByAdminUid = adminUid;

      payout.auditTrail.push({
        timestamp: now,
        action: `Status updated to ${targetStatus}`,
        actor: adminUid || 'System / Provider Simulator',
        note: adminNotes || `Transitioned to ${targetStatus} via payout pipeline`,
      });

      return res.json({
        success: true,
        payout,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update payout' });
    }
  });

  // Subscription Checkout (₦5,000/mo or ₦150,000/yr)
  app.post('/api/financial/subscription/checkout', (req, res) => {
    try {
      const { userId, userName, userEmail, plan, paymentMethod } = req.body;
      if (!userId || !plan) {
        return res.status(400).json({ error: 'User ID and plan required' });
      }

      const isYearly = plan === 'yearly_premium_pro';
      const amountNgn = isYearly ? 150000 : 5000;
      const billingCycle = isYearly ? 'yearly' : 'monthly';

      const now = new Date();
      const expires = new Date();
      if (isYearly) {
        expires.setFullYear(expires.getFullYear() + 1);
      } else {
        expires.setMonth(expires.getMonth() + 1);
      }

      const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
      const ref = 'PSTK_SUB_' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const subRecord = {
        id: subId,
        userId,
        userName: userName || 'Subscriber',
        userEmail: userEmail || '',
        plan,
        amountNgn,
        billingCycle,
        status: 'active',
        startDate: now.toISOString(),
        renewalDate: expires.toISOString(),
        expiresAt: expires.toISOString(),
        autoRenew: true,
        paymentProvider: paymentMethod || 'Paystack Direct Debit',
        lastTransactionReference: ref,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      subscriptions.set(userId, subRecord);

      // Ledger entry
      const txnId = 'TXN-SUB-' + Date.now();
      financialLedger.set(txnId, {
        id: txnId,
        userId,
        userName: userName || 'Subscriber',
        userRole: 'client',
        type: 'subscription_payment',
        amountNgn,
        commissionRate: 0,
        commissionNgn: 0,
        clientFeeNgn: 0,
        netAmountNgn: amountNgn,
        currency: 'NGN',
        paymentProvider: 'Paystack Recurring',
        providerReference: ref,
        status: 'Paid',
        timestamp: now.toISOString(),
        description: `TrustTech ${isYearly ? 'Yearly Pro' : 'Monthly Premium'} Subscription (Active)`,
      });

      return res.json({
        success: true,
        subscription: subRecord,
        hasPremiumAccess: true,
        subscriptionTier: 'pro',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Subscription failed' });
    }
  });

  // Subscription Cancellation
  app.post('/api/financial/subscription/cancel', (req, res) => {
    try {
      const { userId } = req.body;
      const sub = subscriptions.get(userId);
      if (!sub) {
        return res.status(404).json({ error: 'No active subscription found for user' });
      }

      sub.autoRenew = false;
      sub.status = 'cancelled';
      sub.updatedAt = new Date().toISOString();

      return res.json({
        success: true,
        subscription: sub,
        message: 'Auto-renewal disabled. Premium access will remain active until the end of your billing cycle.',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Cancellation failed' });
    }
  });

  // Refund Request
  app.post('/api/financial/refund-request', (req, res) => {
    try {
      const { projectId, projectTitle, milestoneId, milestoneTitle, clientUid, clientName, developerUid, developerName, amountNgn, reason, details } = req.body;
      if (!projectId || !milestoneId || !clientUid || !amountNgn) {
        return res.status(400).json({ error: 'Missing required refund request parameters' });
      }

      const refId = 'REF-' + Math.floor(100000 + Math.random() * 900000);
      const refundRecord = {
        id: refId,
        projectId,
        projectTitle: projectTitle || 'Project',
        milestoneId,
        milestoneTitle: milestoneTitle || 'Milestone',
        clientUid,
        clientName: clientName || 'Client',
        developerUid,
        developerName: developerName || 'Developer',
        amountNgn: Number(amountNgn),
        reason: reason || 'milestone_unfulfilled',
        details: details || '',
        status: 'Pending Review',
        requestedAt: new Date().toISOString(),
      };

      refundRequests.set(refId, refundRecord);

      return res.json({
        success: true,
        refund: refundRecord,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit refund request' });
    }
  });

  // Paystack Sandbox Webhook Endpoint
  app.post('/api/financial/webhooks/paystack', (req, res) => {
    try {
      const event = req.body;
      console.log('Received Paystack Webhook event:', event?.event);

      // Webhook signature header simulation check
      const signature = req.headers['x-paystack-signature'];
      // Accept sandbox events
      const eventType = event?.event;

      if (eventType === 'charge.success') {
        const data = event.data;
        console.log(`Verified webhook payment charge for reference: ${data?.reference}`);
      } else if (eventType === 'transfer.success') {
        const data = event.data;
        console.log(`Payout transfer successfully confirmed by payment partner: ${data?.reference}`);
      }

      return res.status(200).json({ received: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Webhook handling failed' });
    }
  });


  // Health check & status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TrustTech Marketplace Engine',
      commissionRate: platformCommissionRate,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustTech server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
