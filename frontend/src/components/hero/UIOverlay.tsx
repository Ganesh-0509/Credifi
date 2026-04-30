import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, BarChart3, Fingerprint, Lock, ChevronRight, ArrowRight,
  Zap, Eye, FileCheck, TrendingUp, AlertTriangle, CheckCircle2,
  Database, Globe, Cpu, Activity, UserPlus, LogIn
} from 'lucide-react';

/* ── Section Wrapper ── */
const PlatformSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`min-h-[75vh] flex items-center px-6 lg:px-24 py-6 md:py-8 ${className}`}>{children}</section>
);

/* ── Metrics Counter ── */
const Counter = ({ to, suffix = '' }: { to: string; suffix?: string }) => (
  <div className="text-2xl md:text-4xl font-black text-amber-500 glow-gold mb-1 font-display">
    {to}{suffix}
  </div>
);

/* ── Hash Chain Visual Component ── */
const HashChainVisual = () => {
  const hashes = [
    { id: '#001', hash: '0x8f3a…c2d1', decision: 'APPROVE', score: '0.87' },
    { id: '#002', hash: '0x1e9b…77fa', decision: 'REJECT', score: '0.23' },
    { id: '#003', hash: '0xc4f2…98e0', decision: 'APPROVE', score: '0.91' },
  ];
  return (
    <div className="flex flex-col gap-0 w-full max-w-sm pointer-events-auto">
      {hashes.map((b, i) => (
        <React.Fragment key={b.id}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 hover:border-amber-500/30 transition-all group cursor-default"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">BLOCK {b.id}</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                b.decision === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>{b.decision}</span>
            </div>
            <div className="text-amber-500 font-mono text-xs mb-2 glow-gold group-hover:scale-105 transition-transform origin-left">{b.hash}</div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
              SHAP: <span className="text-slate-300">{b.score}</span> · SHA-256
            </div>
          </motion.div>
          {i < hashes.length - 1 && (
            <div className="flex items-center justify-center py-2">
              <div className="w-0.5 h-6 bg-emerald-500/20" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface UIOverlayProps {
  navigate: (path: string) => void;
}

export default function UIOverlay({ navigate }: UIOverlayProps) {
  return (
    <div className="credifi-root pointer-events-none selection:bg-amber-500/30 font-sans">
      
      {/* ── Fixed Navigation (Premium Style) ── */}
      <nav className="fixed top-0 left-0 w-full px-10 py-10 flex justify-between items-center z-[100] pointer-events-auto bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent">
        <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 p-0.5 shadow-xl shadow-amber-500/10 bg-white/5 overflow-hidden">
            <img src="/brand-logo.jpeg" alt="Credifi Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 group">
            <LogIn size={16} className="group-hover:translate-x-1 transition-transform" /> Sign In
          </button>
          <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all flex items-center gap-3 group shadow-lg shadow-amber-500/5">
            <UserPlus size={16} /> Register Node
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <PlatformSection className="justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl pointer-events-auto pt-20"
        >
          <div className="flex justify-center mb-12">
            <span className="badge-premium">
              <div className="w-5 h-5 rounded-full border border-amber-500/30 overflow-hidden mr-2">
                <img src="/brand-logo.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              Autonomous Credit Integrity
            </span>
          </div>

          <h1 className="display-lg text-white mb-12">
            DECISIONS WITHOUT <br />
            <span className="text-amber-500 italic glow-gold">DOUBT.</span>
          </h1>
          
          <p className="text-mix max-w-2xl mx-auto mb-16 text-lg md:text-xl leading-relaxed">
            The world's first AI credit engine with deterministic fairness and cryptographic audit trails — built for regulated institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
            <button onClick={() => navigate('/login')} className="btn-gold px-12 py-5 text-base group">
              Get Started <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/login')} className="btn-outline px-12 py-5 text-base">
              Institutional Access
            </button>
          </div>

          <div className="max-w-4xl mx-auto opacity-20 flex gap-16 justify-center flex-wrap grayscale hover:opacity-100 transition-opacity">
            {['CITIBANK', 'HSBC', 'AXIS BANK', 'DBS GROUP', 'BARCLAYS'].map((t, i) => (
              <span key={i} className="text-xs font-black tracking-[0.4em] text-white">{t}</span>
            ))}
          </div>
        </motion.div>
      </PlatformSection>

      {/* ══════════════════════════════════════════
          SECTION 2 — KEY METRICS
      ══════════════════════════════════════════ */}
      <PlatformSection className="justify-center">
        <div className="w-full max-w-6xl pointer-events-auto">
          <div className="text-center mb-20">
            <span className="badge-premium mb-8"><Activity size={12} /> Live Intelligence</span>
            <h2 className="display-md text-white">Numbers That <span className="text-amber-500 glow-gold italic">Matter.</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "5000", suffix: "+", label: "Credit Applications", icon: Database },
              { value: "99.9", suffix: "%", label: "Chain Integrity", icon: Shield },
              { value: "3", suffix: "ms", label: "SHAP Latency", icon: Zap },
              { value: "0", suffix: "", label: "Bias Signals", icon: Eye },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-10 text-center hover:bg-white/10 hover:border-amber-500/30 hover:-translate-y-2 transition-all border-white/5 cursor-default group"
              >
                <m.icon size={24} className="mx-auto mb-8 text-slate-700 group-hover:text-amber-500 transition-colors" />
                <Counter to={m.value} suffix={m.suffix} />
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                   {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </PlatformSection>

      {/* ══════════════════════════════════════════
          SECTION 3 — THE PROBLEM
      ══════════════════════════════════════════ */}
      <PlatformSection className="flex-wrap gap-12 lg:gap-24 items-center justify-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="flex-1 min-w-[320px] max-w-xl pointer-events-auto">
          <span className="badge-premium mb-10 border-rose-500/20 text-rose-400 bg-rose-500/5">The Problem</span>
          <h2 className="display-md text-white mb-10 uppercase tracking-tighter leading-none">
            THE BIAS <br /><span className="text-amber-500 italic glow-gold">ARCHIVE.</span>
          </h2>
          <p className="text-mix mb-10 text-lg md:text-xl leading-relaxed">
            Standard models learn from historical echoes. ZIP codes and purchase behavior silently encode discrimination — invisible to auditors.
          </p>
          <div className="flex flex-wrap gap-4">
            {['ZIP Proxies', 'Income Parity', 'Equalized Odds', 'Drift Detection'].map((tag, i) => (
              <span key={i} className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-amber-500/30 transition-all">{tag}</span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="flex-1 min-w-[320px] max-w-md pointer-events-auto">
          <div className="glass-emerald p-10 border-emerald-500/20 glow-emerald transition-all cursor-default">
             <div className="flex items-center justify-between mb-12 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mono">
                Fairlearn Monitor — Live
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
             </div>
             
             {[
               { label: 'Demographic Parity', value: 0.2 },
               { label: 'Equalized Odds', value: 0.3 },
               { label: 'Bias Index', value: 0.1 },
             ].map((m, i) => (
               <div key={i} className="mb-8 last:mb-0">
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{m.label}</span>
                   <span className="font-mono text-xs text-emerald-400 font-bold">0.0{m.value}</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.value * 100}%` }} transition={{ duration: 1.5, delay: i * 0.2 }} className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 </div>
               </div>
             ))}
          </div>
        </motion.div>
      </PlatformSection>

      {/* ══════════════════════════════════════════
          SECTION 4 — DATA FLOW
      ══════════════════════════════════════════ */}
      <PlatformSection className="flex-col items-center">
        <div className="text-center mb-20 pointer-events-auto">
          <span className="badge-premium mb-8"><Cpu size={12} /> Execution Layer</span>
          <h2 className="display-md text-white">How It <span className="text-amber-500 glow-gold italic">Works.</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl pointer-events-auto">
          {[
            { num: '01', icon: FileCheck, title: 'Submission', desc: 'Applicant submits CreditApplication JSON data for validation.' },
            { num: '02', icon: Cpu, title: 'Inference', desc: 'XGBClassifier produces a default probability score in <3ms.' },
            { num: '03', icon: Eye, title: 'Explainability', desc: 'TreeExplainer generates SHAP values for plain-language transparency.' },
            { num: '04', icon: Lock, title: 'Audit', desc: 'Every decision is SHA-256 hashed and chained to the previous record.' },
            { num: '05', icon: BarChart3, title: 'Governance', desc: 'Fairness metrics and drift signals are surfaced to Regulators.' },
            { num: '06', icon: Activity, title: 'Feedback', desc: 'Actual outcomes feed the dynamic re-training pipeline for fairness.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-10 group hover:border-amber-500/30 hover:bg-white/10 transition-all border-white/5 cursor-default"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <step.icon size={20} />
                </div>
                <span className="font-mono text-slate-800 text-4xl font-black opacity-30 group-hover:opacity-100 transition-opacity">{step.num}</span>
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter group-hover:text-amber-500 transition-colors">{step.title}</h3>
              <p className="text-[10px] text-mix uppercase font-black leading-relaxed opacity-60 group-hover:opacity-100">
                 {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </PlatformSection>

      {/* ══════════════════════════════════════════
          SECTION 5 — CHAIN OF CUSTODY
      ══════════════════════════════════════════ */}
      <PlatformSection className="flex-wrap-reverse gap-12 lg:gap-24 items-center justify-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="flex-1 min-w-[320px] max-w-sm pointer-events-auto">
           <HashChainVisual />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} className="flex-1 min-w-[320px] max-w-xl pointer-events-auto text-right flex flex-col items-end">
          <span className="badge-premium mb-10">Tamper-Evident</span>
          <h2 className="display-md text-white mb-10 uppercase tracking-tighter leading-none">
            CHAIN OF <span className="text-amber-500 italic glow-gold">CUSTODY.</span>
          </h2>
          <p className="text-mix mb-10 text-lg md:text-xl leading-relaxed">
            Every decision is cryptographically chained to the last, creating a forensically intact pipeline.
          </p>
          <div className="flex gap-6 flex-wrap justify-end">
            {['SHA-256', 'Blockchain-Ready', 'SEC-Grade'].map((f, i) => (
              <span key={i} className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl">{f}</span>
            ))}
          </div>
        </motion.div>
      </PlatformSection>

      {/* ══════════════════════════════════════════
          SECTION 6 — ROLES
      ══════════════════════════════════════════ */}
      <PlatformSection className="flex-col items-center">
        <div className="text-center mb-20 pointer-events-auto">
          <span className="badge-premium mb-8"><Fingerprint size={12} /> Access Tiers</span>
          <h2 className="display-md text-white">Built for <span className="text-amber-500 glow-gold italic">Everyone.</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pointer-events-auto">
          {[
            { role: 'Applicant', icon: '👤', accent: 'text-amber-500', bg: 'glass-gold', caps: ['Submit apps', 'SHAP explanations', 'View factors'] },
            { role: 'Compliance', icon: '🔍', accent: 'text-indigo-400', bg: 'glass', caps: ['Inspect decisions', 'Verify chain', 'Access scores'] },
            { role: 'Regulator', icon: '🏛', accent: 'text-emerald-500', bg: 'glass-emerald', caps: ['Monitor fairness', 'Detect drift', 'SEC reports'] },
          ].map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className={`${r.bg} p-12 flex flex-col group hover:scale-[1.02] transition-all border-white/5 h-full cursor-default`}>
              <div className="text-5xl mb-10 group-hover:scale-110 transition-transform origin-left">{r.icon}</div>
              <h3 className={`text-2xl font-black mb-8 uppercase tracking-tighter ${r.accent}`}>{r.role}</h3>
              <ul className="space-y-6 flex-1">
                {r.caps.map((c, j) => (
                  <li key={j} className="flex gap-4 items-start text-slate-500 group-hover:text-slate-300 transition-colors">
                    <CheckCircle2 size={16} className={`${r.accent} shrink-0 mt-0.5 opacity-40 group-hover:opacity-100`} />
                    <span className="text-[10px] font-black uppercase tracking-tight leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </PlatformSection>

      {/* ══════════════════════════════════════════
          SECTION 7 — FINAL CTA
      ══════════════════════════════════════════ */}
      <PlatformSection className="justify-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="max-w-4xl pointer-events-auto">
          <div className="mono text-amber-500 text-[10px] font-black tracking-[0.4em] mb-12 uppercase">[ READY TO DEPLOY ]</div>
          <h2 className="display-lg text-white mb-16 uppercase leading-none">
            THE FUTURE OF <br />
            <span className="text-amber-500 underline decoration-white/10 underline-offset-[30px] decoration-4 glow-gold italic">CREDIT</span> IS HERE.
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
            <button onClick={() => navigate('/login')} className="btn-gold px-12 py-5 text-lg group shadow-2xl shadow-amber-500/10">
              Enter Platform <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/login')} className="btn-outline px-12 py-5 text-lg">
              Schedule Demo
            </button>
          </div>

          <div className="flex gap-12 justify-center flex-wrap opacity-40">
            {['SOC 2 COMPLIANT', 'GDPR READY', 'ISO 27001'].map((t, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </PlatformSection>

    </div>
  );
}

const Retweet = (props: any) => <Activity {...props} />; // Placeholder
