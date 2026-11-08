import React, { useState, useEffect } from 'react';
import {
  Code,
  Play,
  RotateCcw,
  Download,
  Save,
  Sparkles,
  Lock,
  ExternalLink,
  Laptop,
  CheckCircle,
  Eye,
  FileCode,
  Layers,
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';

interface CodingStudioViewProps {
  currentUser: User;
}

const TEMPLATES = [
  {
    id: 'paystack-widget',
    name: 'Paystack Escrow Checkout Widget',
    description: 'Interactive payment modal and escrow breakdown demo.',
    html: `<div class="checkout-card">
  <div class="logo">TrustTech <span>Escrow</span></div>
  <h2>Milestone Deposit #1</h2>
  <div class="price-row">
    <span>Milestone Budget:</span>
    <strong>₦75,000</strong>
  </div>
  <div class="fee-badge">12% Developer Commission Applied</div>
  <p class="safety-text">Funds held in platform escrow until deliverable sign-off.</p>
  <button id="payBtn" class="btn">Confirm & Fund Escrow</button>
  <div id="status" class="status-msg"></div>
</div>`,
    css: `body {
  margin: 0;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0b0f19;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.checkout-card {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 24px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.logo {
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #14b8a6;
  margin-bottom: 12px;
}
.logo span { color: #94a3b8; font-weight: 400; }
h2 {
  font-size: 1.25rem;
  margin: 0 0 16px 0;
}
.price-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #1e293b;
  border-radius: 8px;
  margin-bottom: 12px;
}
.price-row strong { color: #2dd4bf; }
.fee-badge {
  display: inline-block;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.safety-text {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-bottom: 20px;
}
.btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #14b8a6;
  color: #042f2e;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
}
.btn:hover { opacity: 0.9; }
.btn:active { transform: scale(0.98); }
.status-msg {
  margin-top: 14px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}`,
    js: `document.getElementById('payBtn').addEventListener('click', () => {
  const status = document.getElementById('status');
  status.style.color = '#34d399';
  status.innerHTML = '✓ Payment verified! ₦75,000 locked in TrustTech Escrow.';
  document.getElementById('payBtn').disabled = true;
  document.getElementById('payBtn').style.opacity = '0.5';
});`,
  },
  {
    id: 'fintech-hero',
    name: 'African Fintech SaaS Hero',
    description: 'Modern high-converting hero component with stats.',
    html: `<section class="hero">
  <div class="badge">Trusted People. Better Technology.</div>
  <h1>Hire Verified African Tech Talent With Confidence</h1>
  <p>Escrow-protected milestones, 12% transparent developer commission, and vetted engineers across 10 technology disciplines.</p>
  <div class="metrics">
    <div class="stat">
      <h3>₦450M+</h3>
      <span>Secured in Escrow</span>
    </div>
    <div class="stat">
      <h3>1,200+</h3>
      <span>Vetted Engineers</span>
    </div>
    <div class="stat">
      <h3>99.4%</h3>
      <span>Milestone Success</span>
    </div>
  </div>
</section>`,
    css: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #090d16;
  color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
}
.hero {
  max-width: 650px;
  text-align: center;
  padding: 2rem;
}
.badge {
  display: inline-block;
  background: rgba(20, 184, 166, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(20, 184, 166, 0.3);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 20px;
}
h1 {
  font-size: 2.2rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #ffffff 40%, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
p {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 14px;
  padding: 16px;
}
.stat h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #2dd4bf;
}
.stat span {
  font-size: 0.75rem;
  color: #64748b;
}`,
    js: `console.log("TrustTech SaaS hero loaded successfully.");`,
  },
];

export const CodingStudioView: React.FC<CodingStudioViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState(TEMPLATES[0].html);
  const [cssCode, setCssCode] = useState(TEMPLATES[0].css);
  const [jsCode, setJsCode] = useState(TEMPLATES[0].js);
  const [srcDoc, setSrcDoc] = useState('');
  const [projectName, setProjectName] = useState('My TrustTech Prototype');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const isPro = Boolean(currentUser.hasPremiumAccess || currentUser.accountType === 'admin');

  const updatePreview = () => {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${jsCode}
            } catch (err) {
              console.error('Runtime error:', err);
            }
          </script>
        </body>
      </html>
    `;
    setSrcDoc(combined);
  };

  useEffect(() => {
    updatePreview();
  }, [htmlCode, cssCode, jsCode]);

  const loadTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setHtmlCode(tmpl.html);
    setCssCode(tmpl.css);
    setJsCode(tmpl.js);
    setProjectName(tmpl.name);
  };

  const handleSave = () => {
    store.saveCodingStudioProject({
      id: 'code-' + Date.now(),
      ownerUid: currentUser.uid,
      title: projectName,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
    });
    setSaveNotice('Project saved to your TrustTech workspace!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleExport = () => {
    const combined = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${projectName} - TrustTech Coding Studio</title>
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
<script>
${jsCode}
</script>
</body>
</html>`;
    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-white">TrustTech Coding Studio</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wide">
                Pro Feature
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live in-browser prototype editor for developers and clients to test widgets, API scripts, and frontend components.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={updatePreview}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-teal-400" /> Run Code
          </button>
          <button
            onClick={handleSave}
            disabled={!isPro}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-teal-400" /> Save Project
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export HTML
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-teal-950/60 border border-teal-500/40 rounded-xl text-xs text-teal-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {saveNotice}
        </div>
      )}

      {/* Premium Gate Banner if Free Tier */}
      {!isPro && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">TrustTech Coding Studio Pro Access</h4>
              <p className="text-xs text-slate-300">
                You are currently in Preview Mode. Upgrade to Pro to save unlimited projects, access cloud hosting, and integrate custom API keys.
              </p>
            </div>
          </div>
          <button
            onClick={() => store.upgradeCurrentUserToPro()}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> Activate Pro Free
          </button>
        </div>
      )}

      {/* Starter Templates Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-xs font-semibold shrink-0">Starter Templates:</span>
        {TEMPLATES.map(tmpl => (
          <button
            key={tmpl.id}
            onClick={() => loadTemplate(tmpl)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>{tmpl.name}</span>
          </button>
        ))}
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[650px]">
        {/* Code Editor Column */}
        <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-3">
            <div className="flex">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'html'
                    ? 'border-teal-400 text-teal-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" /> HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'css'
                    ? 'border-teal-400 text-teal-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> CSS
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'js'
                    ? 'border-teal-400 text-teal-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> JS
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Auto-Reload</span>
          </div>

          {/* Textarea Code Surface */}
          <div className="flex-1 p-2 bg-[#0d121c]">
            {activeTab === 'html' && (
              <textarea
                value={htmlCode}
                onChange={e => setHtmlCode(e.target.value)}
                className="w-full h-full bg-transparent text-slate-200 font-mono text-xs p-3 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            )}
            {activeTab === 'css' && (
              <textarea
                value={cssCode}
                onChange={e => setCssCode(e.target.value)}
                className="w-full h-full bg-transparent text-teal-300 font-mono text-xs p-3 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            )}
            {activeTab === 'js' && (
              <textarea
                value={jsCode}
                onChange={e => setJsCode(e.target.value)}
                className="w-full h-full bg-transparent text-amber-300 font-mono text-xs p-3 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            )}
          </div>
        </div>

        {/* Live Sandboxed Preview Column */}
        <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>Sandboxed Preview</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Sandbox</span>
            </div>
          </div>
          <div className="flex-1 bg-white relative">
            <iframe
              srcDoc={srcDoc}
              title="Live Sandbox"
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
