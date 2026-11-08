import React from 'react';
import { X, ShieldCheck, FileText, Scale, Lock, Coins } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'developer-guidelines' | 'payment-policy' | 'disputes';

interface LegalModalProps {
  docType: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ docType, onClose }) => {
  const getDocContent = () => {
    switch (docType) {
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: FileText,
          updated: 'November 2026',
          sections: [
            {
              heading: '1. Platform Purpose & Scope',
              body: 'TrustTech is a technology services marketplace connecting registered business clients with verified digital professionals across Nigeria, Africa, and international markets. All users agree to conduct technical transactions, deliverable reviews, and communications respectfully and within platform agreements.',
            },
            {
              heading: '2. User Accounts & Identity Verification',
              body: 'Users maintain a unified TrustTech identity. Developer accounts require submission of verifiable portfolios and accurate professional background. Misrepresentation, plagiarized code repositories, or fake portfolios result in immediate permanent suspension.',
            },
            {
              heading: '3. Proposal Quota System',
              body: 'To protect clients from automated bot spam and ensure intentional hiring, developers receive a baseline allowance of 15 proposal credits per monthly billing cycle. Credits cannot be transferred or sold.',
            },
            {
              heading: '4. Non-Circumvention',
              body: 'Clients and developers introduced via TrustTech agree to maintain all milestone contracts, deliverable milestones, and payment processing on TrustTech to retain dispute protection and milestone mediation.',
            },
          ],
        };
      case 'privacy':
        return {
          title: 'Privacy Policy & NDPR Compliance',
          icon: Lock,
          updated: 'November 2026',
          sections: [
            {
              heading: '1. Data Collection & Processing',
              body: 'TrustTech processes personal data in compliance with the Nigeria Data Protection Act (NDPA) and international standards. We collect account names, verified emails, phone numbers, WhatsApp contacts (optional), and technical portfolio URLs strictly for marketplace authentication and communication.',
            },
            {
              heading: '2. Security & Credentials',
              body: 'Passwords are encrypted and never stored in plaintext. API keys and payment secrets are maintained in isolated backend environments. We never sell user data or share contact details with unverified third parties.',
            },
            {
              heading: '3. Retention & Deletion Rights',
              body: 'Users may request full export or permanent deletion of their account records upon resolution of active milestone contracts.',
            },
          ],
        };
      case 'developer-guidelines':
        return {
          title: 'Developer Verification Guidelines',
          icon: ShieldCheck,
          updated: 'November 2026',
          sections: [
            {
              heading: '1. Verifiable Proof of Production Work',
              body: 'Applicants must supply at least one live, functional website URL, active Figma link, or verifiable GitHub repository demonstrating real-world technical competency.',
            },
            {
              heading: '2. Technical Code & Design Standards',
              body: 'Deliverables must be accessible, responsive, and follow modern best practices (e.g. semantic HTML, Client-First or structured class naming, tokenized design systems, secure API authentication).',
            },
            {
              heading: '3. 12% Platform Commission',
              body: 'A flat 12% commission is deducted from gross contract payouts upon milestone release. For example, on a ₦250,000 project, the TrustTech commission is ₦30,000 and the developer earnings are ₦220,000. No surprise fees, withdrawal cuts, or hidden monthly charges.',
            },
          ],
        };
      case 'payment-policy':
        return {
          title: 'Payment & Milestone Escrow Policy',
          icon: Coins,
          updated: 'November 2026',
          sections: [
            {
              heading: '1. Strict Platform Payment Protection Warning',
              body: 'For your safety and protection, always keep communications and payments on TrustTech. Transactions completed outside TrustTech are not protected by our escrow system or customer support. Failure to comply may lead to account suspension.',
            },
            {
              heading: '2. Reconciled 100% Milestone Model',
              body: 'All project contracts require milestone stages that mathematically equal exactly 100% of the agreed contract price. Milestone funding ensures developers work with guaranteed capital secured in escrow.',
            },
            {
              heading: '3. 12% Transparent Developer Commission & 2.5% Escrow Fee',
              body: 'Commissions are calculated securely on the backend. A 12% developer commission is deducted upon milestone approval, and a 2.5% client protection fee is separately disclosed during escrow checkout.',
            },
            {
              heading: '4. Seven-Day Review Period',
              body: 'Clients have up to 7 business days to inspect delivered code, staging sites, and assets before funds are released. In the absence of an active dispute, milestones are finalized after the review window.',
            },
          ],
        };
      case 'disputes':
        return {
          title: 'Dispute Resolution & Mediation Workflow',
          icon: Scale,
          updated: 'November 2026',
          sections: [
            {
              heading: '1. Structured Resolution Stages',
              body: 'If deliverables fail to meet agreed technical specifications or communication stalls, either party may trigger a structured dispute. Stages include: Notice & Evidence Submission, Operational Review, Mediation Proposal, and Binding Resolution.',
            },
            {
              heading: '2. Evidence-Based Mediation',
              body: 'TrustTech staff review project threads, repository commit history, and milestone descriptions. No automated refunds are executed without human review.',
            },
          ],
        };
    }
  };

  const doc = getDocContent();
  const Icon = doc.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 w-full max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-[#121824] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">{doc.title}</h2>
              <span className="text-[11px] text-slate-400">Last Reviewed: {doc.updated}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {doc.sections.map((sec, i) => (
            <div key={i} className="space-y-1.5">
              <h3 className="font-bold text-white text-sm">{sec.heading}</h3>
              <p className="text-slate-400">{sec.body}</p>
            </div>
          ))}

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-500">
            Note: Draft policy for TrustTech platform operations. For legal or commercial inquiries, contact operations@trusttech.ng.
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
