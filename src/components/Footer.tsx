import React from 'react';
import { ShieldCheck, Mail, MapPin, Globe } from 'lucide-react';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenLegal: (type: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0f17] border-t border-slate-800 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-heading text-white">TrustTech</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Trusted People. Better Technology. Connecting businesses with qualified, verified technology professionals across Nigeria and Africa with milestone-backed security.
            </p>
            <div className="pt-1 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>Lagos, Nigeria &bull; Expanding pan-Africa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>support@trusttech.ng</span>
              </div>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              Marketplace
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Browse Tech Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('verification')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Become a Verified Developer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Website & No-Code Specialists
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-teal-400 transition-colors"
                >
                  UI/UX Product Designers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Technical Copywriters
                </button>
              </li>
            </ul>
          </div>

          {/* Trust, Safety & Policies */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              Trust & Legal Policies
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Privacy Policy (NDPR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('developer-guidelines')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Developer Verification Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('payment-policy')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Payment & Escrow Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('disputes')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Dispute Resolution Process
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Platform Architecture Notice */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              Standards
            </h4>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-[11px]">
              <span className="font-semibold text-white block">15 Monthly Credits</span>
              <p className="text-slate-400">Guaranteed anti-spam quota for verified professionals.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-[11px]">
              <span className="font-semibold text-teal-400 block">12% Commission</span>
              <p className="text-slate-400">Transparent developer fee with no hidden deductions.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; {currentYear} TrustTech Africa Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Built for High-Trust Digital Engineering</span>
            <span>&bull;</span>
            <span className="text-teal-400">Nigeria Launch</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
