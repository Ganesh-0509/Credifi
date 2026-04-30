import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, Gavel, Lock, Info, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  const sections = [
    { id: 'definitions', title: '1. Definitions', icon: <Info size={14} /> },
    { id: 'acceptance', title: '2. Acceptance of Terms', icon: <Scale size={14} /> },
    { id: 'eligibility', title: '3. Eligibility and Authority', icon: <Lock size={14} /> },
    { id: 'nature', title: '4. Nature of Services', icon: <Shield size={14} /> },
    { id: 'registration', title: '5. Registration and Account Security', icon: <Lock size={14} /> },
    { id: 'security', title: '6. Security Responsibilities', icon: <Shield size={14} /> },
    { id: 'kyc', title: '7. KYC and Compliance', icon: <Gavel size={14} /> },
    { id: 'use', title: '8. Permitted Use', icon: <Scale size={14} /> },
    { id: 'privacy', title: '9. Data Usage and Privacy', icon: <Lock size={14} /> },
    { id: 'audit', title: '10. Audit Trails', icon: <Shield size={14} /> },
    { id: 'governing', title: '19. Governing Law', icon: <Gavel size={14} /> },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="p-2 h-auto border-white/5 hover:bg-white/5">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter">Terms <span className="text-amber-500 italic">&</span> Conditions</h1>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Effective: April 30, 2026</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Shield size={12} className="text-amber-500" />
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Verified Institutional Agreement</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sticky Sidebar TOC */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Table of Contents</p>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
              >
                <span className="opacity-40 group-hover:opacity-100 group-hover:text-amber-500 transition-all">{section.icon}</span>
                <span className="truncate">{section.title}</span>
                <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-amber-500" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Container */}
        <main className="lg:col-span-9 max-w-3xl mx-auto lg:mx-0 space-y-16">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert prose-slate max-w-none"
          >
            <div className="p-8 bg-amber-500 text-black rounded-[2.5rem] mb-16 shadow-2xl shadow-amber-500/10">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Institutional User Agreement</h2>
              <p className="text-sm font-bold leading-relaxed">
                By accessing, registering for, or using the CredFi platform, you agree to be bound by these Terms and Conditions governing our compliance, monitoring, and forensic verification services.
              </p>
            </div>

            <div className="space-y-20 text-slate-300">
              <section id="definitions" className="scroll-mt-32 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">01</span>
                  Definitions
                </h3>
                <div className="space-y-4 text-sm leading-loose">
                  <p><strong className="text-white uppercase tracking-widest text-[10px]">1.1 "Platform"</strong> means the CredFi web application, dashboard, backend services, APIs, audit systems, and any connected interfaces.</p>
                  <p><strong className="text-white uppercase tracking-widest text-[10px]">1.2 "User"</strong> means any person, institution, employee, regulator, compliance officer, or authorized representative.</p>
                  <p><strong className="text-white uppercase tracking-widest text-[10px]">1.3 "Services"</strong> means all functions including identity-linked workflows, compliance dashboards, audit verification, and forensic analytics.</p>
                </div>
              </section>

              <section id="acceptance" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">02</span>
                  Acceptance of Terms
                </h3>
                <p className="text-sm leading-loose">
                  2.1 By creating an Account or accessing the Platform, the User confirms that they have read, understood, and accepted these Terms and Conditions.
                  <br /><br />
                  2.2 If the User does not agree to these Terms, the User must not use the Platform.
                </p>
              </section>

              <section id="eligibility" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">03</span>
                  Eligibility and Authority
                </h3>
                <p className="text-sm leading-loose">
                  3.1 The User must be legally competent to enter into binding obligations. Where the User is accessing on behalf of an institution, the User represents that they are duly authorized to bind that entity.
                </p>
              </section>

              <section id="nature" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">04</span>
                  Nature of Services
                </h3>
                <p className="text-sm leading-loose">
                  4.1 CredFi provides a digital platform for compliance-oriented workflows, forensic audit review, and neural decision support. 
                  <br /><br />
                  4.3 The Platform does not itself constitute a bank account, deposit account, or lending agreement unless expressly stated.
                </p>
              </section>

              <section id="registration" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">05</span>
                  Registration and Account Security
                </h3>
                <p className="text-sm leading-loose">
                  5.1 Certain features are available only to authorized Users. The User is responsible for ensuring all information is accurate.
                  <br /><br />
                  5.3 Login credentials must remain confidential. Passwords, access tokens, or account privileges must not be shared.
                </p>
              </section>

              <section id="security" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">06</span>
                  Security Responsibilities
                </h3>
                <p className="text-sm leading-loose font-bold text-slate-100">
                  6.1 The Platform uses advanced safeguards, including HMAC-SHA256 hash chaining, role-based access, and neural fingerprinting.
                  <br /><br />
                  6.3 Attempting to bypass authentication or tampering with forensic audit trails is strictly prohibited and may result in immediate termination and legal action.
                </p>
              </section>

              <section id="audit" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">10</span>
                  Audit Trails and Record Integrity
                </h3>
                <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-4">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} /> Forensic Integrity Mandate
                  </p>
                  <p className="text-xs leading-loose text-slate-400">
                    10.1 The Platform maintains immutable audit trails of all user actions. Attempting to alter, suppress, or manipulate these trails is a violation of federal compliance standards. 
                  </p>
                </div>
              </section>

              <section id="governing" className="scroll-mt-32 space-y-6 border-t border-white/5 pt-16">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 text-xs">19</span>
                  Governing Law
                </h3>
                <p className="text-sm leading-loose">
                  19.1 These Terms shall be governed by the laws applicable to the jurisdiction in which the Platform owner operates. Disputes shall be addressed through internal resolution before referral to competent courts.
                </p>
              </section>

              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center space-y-6">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Final Acceptance</p>
                <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">
                  By using CredFi, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
                </p>
                <div className="pt-4 flex flex-col items-center gap-4">
                  <p className="text-[10px] font-black text-amber-500/60 uppercase">Compliance Contact: support@credifi.example</p>
                  <Button variant="primary" onClick={() => navigate(-1)} className="px-12 h-12 bg-amber-500 text-black border-none font-black uppercase tracking-widest text-xs">
                    Accept & Return
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
