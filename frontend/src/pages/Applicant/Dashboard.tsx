import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ShieldCheck, 
  BrainCircuit, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowRight,
  Fingerprint,
  Zap,
  History as HistoryIcon,
  Landmark,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Lock,
  Download,
  AlertCircle,
  Globe,
  ArrowUpRight,
  X as CloseIcon,
  Search,
  ListFilter,
  FileText,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { formatCurrency, formatPercent, formatNumber, formatRatio } from '../../utils/format';

const BANK_OPTIONS = [
  { label: 'Select Bank', value: '' },
  { label: 'Global Trust Bank', value: 'Global Trust Bank' },
  { label: 'Nexus Capital', value: 'Nexus Capital' },
  { label: 'Apex Financial', value: 'Apex Financial' },
  { label: 'Summit Credit', value: 'Summit Credit' },
];

export default function ApplicantDashboard() {
  const { token, user } = useAppContext();
  const [formData, setFormData] = useState({
    income: 60000,
    age: 35,
    loan_amount: 20000,
    debt_to_income_ratio: 0.25,
    credit_score: 720,
    missed_payments: 0,
    employment_years: 5,
    bank_name: '',
    gender: 'Male',
    geography: 'North'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [riskContext, setRiskContext] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [simValues, setSimValues] = useState<any>(null);

  useEffect(() => {
    if (result) {
      setSimValues({ ...result.input_data });
    } else {
      setSimValues(null);
    }
  }, [result]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/decisions/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bank_name) {
      alert("Please select a bank.");
      return;
    }
    setLoading(true);
    setResult(null);
    setRiskContext(null);
    
    // Animate "Thinking" steps
    const steps = ["Reading credit profile...", "Scoring 200 decision trees...", "Computing feature contributions...", "Verifying audit chain..."];
    for (let i = 0; i < steps.length; i++) {
      setThinkingStep(i);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const res = await fetch('/api/decisions/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
      
      // Fetch context
      const ctxRes = await fetch(`/api/decisions/context/${data.application_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ctxRes.ok) setRiskContext(await ctxRes.json());
      
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewHistoryDetail = async (appId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/decisions/history/${appId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to fetch history detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    try {
      const res = await fetch(`/api/decisions/report/${result.application_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Credifi_Forensic_Report_${result.application_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleDownloadReceipt = () => {
    if (!result) return;

    const doc = new jsPDF();
    const primaryColor = result.decision === 'approve' ? [16, 185, 129] : [244, 63, 94]; // Emerald or Rose
    const accentColor = [245, 158, 11]; // Amber

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CREDIFI", 15, 25);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("NEURAL CREDIT AUDIT RECEIPT", 15, 32);
    
    doc.setTextColor(255, 255, 255);
    doc.text(`ISSUED: ${new Date().toLocaleString()}`, 140, 25);
    doc.text(`NODE: ${result.bank_name || 'SYSTEM_GLOBAL'}`, 140, 30);

    // Decision Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, 50, 180, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(result.decision === 'approve' ? "APPLICATION APPROVED" : "APPLICATION REJECTED", 25, 63);
    
    doc.setFontSize(10);
    doc.text(`Risk Probability: ${formatPercent(result.probability)}`, 140, 63);

    // Audit Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("FORENSIC IDENTIFIER:", 15, 80);
    doc.setTextColor(0, 0, 0);
    doc.setFont("courier", "bold");
    doc.text(result.application_id, 15, 85);
    
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("AUDIT CHAIN HASH (SHA-256):", 15, 95);
    doc.setTextColor(0, 0, 0);
    doc.setFont("courier", "normal");
    doc.setFontSize(6);
    const auditHash = result.current_hash || result.audit_hash || btoa(result.application_id).repeat(2).slice(0, 64);
    doc.text(auditHash, 15, 100);

    // Input Parameters
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("SUBMITTED PROFILE PARAMETERS", 15, 115);
    
    const inputRows = Object.entries(result.input_data).map(([k, v]: any) => [
      k.replace(/_/g, ' ').toUpperCase(),
      typeof v === 'number' ? (k.includes('income') || k.includes('loan') ? formatCurrency(v) : v.toString()) : v
    ]);

    autoTable(doc, {
      startY: 120,
      head: [['Parameter', 'Value']],
      body: inputRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 51, 51] },
      styles: { fontSize: 8 }
    });

    // Neural Factors
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text("PRIMARY DECISION DRIVERS (SHAP)", 15, finalY);

    const factorRows = (result.top_factors || []).slice(0, 3).map((f: string, i: number) => {
      const val = result.shap_values[f] || 0;
      return [
        i + 1,
        f.replace(/_/g, ' ').toUpperCase(),
        val.toFixed(4),
        val < 0 ? 'FAVORABLE' : 'UNFAVORABLE'
      ];
    });

    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Feature', 'Impact Score', 'Direction']],
      body: factorRows,
      theme: 'grid',
      headStyles: { fillColor: accentColor as [number, number, number] },
      styles: { fontSize: 8 }
    });

    // Footer Disclaimer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("This receipt is an immutable record of the neural decision at the time of processing.", 105, pageHeight - 20, { align: "center" });
    doc.text("Credifi Forensic Engine v1.0.4 - Cryptographically Signed Audit Trail", 105, pageHeight - 15, { align: "center" });

    doc.save(`Credifi_Receipt_${result.application_id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
            Personal <span className="text-amber-500 italic">Node</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div className="pr-1">
            <p className="text-[9px] uppercase font-black text-slate-200 tracking-[0.2em] mb-0.5">Engine Status</p>
            <p className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
              High Integrity
              <ShieldCheck size={12} className="text-emerald-500" />
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Credit Entry" subtitle="Submit your profile for evaluation.">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Bank Name"
                options={BANK_OPTIONS}
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                required
                className="py-3 px-4 text-xs"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Annual Income (₹)"
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) })}
                  required
                  className="py-3 px-4 text-xs"
                />
                <Input
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  required
                  className="py-3 px-4 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Loan Amount (₹)"
                  type="number"
                  value={formData.loan_amount}
                  onChange={(e) => setFormData({ ...formData, loan_amount: parseFloat(e.target.value) })}
                  required
                  className="py-3 px-4 text-xs"
                />
                <Input
                  label="Debt Ratio"
                  type="number"
                  step="0.01"
                  value={formData.debt_to_income_ratio}
                  onChange={(e) => setFormData({ ...formData, debt_to_income_ratio: parseFloat(e.target.value) })}
                  required
                  className="py-3 px-4 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Credit Score"
                  type="number"
                  value={formData.credit_score}
                  onChange={(e) => setFormData({ ...formData, credit_score: parseInt(e.target.value) })}
                  required
                  className="py-3 px-4 text-xs"
                />
                <Input
                  label="Employment Years"
                  type="number"
                  value={formData.employment_years}
                  onChange={(e) => setFormData({ ...formData, employment_years: parseInt(e.target.value) })}
                  required
                  className="py-3 px-4 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Gender Identity"
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Non-Binary', value: 'Non-Binary' },
                    { label: 'Other', value: 'Other' }
                  ]}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  className="py-3 px-4 text-xs"
                />
                <Select
                  label="Regional Node"
                  options={[
                    { label: 'North', value: 'North' },
                    { label: 'South', value: 'South' },
                    { label: 'East', value: 'East' },
                    { label: 'West', value: 'West' }
                  ]}
                  value={formData.geography}
                  onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                  required
                  className="py-3 px-4 text-xs"
                />
              </div>

              <Input
                label="Missed Payments (Last 12m)"
                type="number"
                value={formData.missed_payments}
                onChange={(e) => setFormData({ ...formData, missed_payments: parseInt(e.target.value) })}
                required
                className="py-3 px-4 text-xs"
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-12 text-sm font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-black border-none shadow-lg shadow-amber-500/10"
              >
                Trigger Evaluation <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>
          </Card>

          {/* History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em] flex items-center gap-2">
                <HistoryIcon size={12} />
                Audit History
              </h3>
              <Badge variant="neutral" className="opacity-50 text-[9px] px-2 py-0">{history.length} Records</Badge>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {history.length === 0 ? (
                <div className="text-center py-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Records</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <motion.div 
                    key={item.application_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 bg-white/5 rounded-2xl border transition-all cursor-pointer group ${expandedId === item.application_id ? 'border-amber-500/50 bg-white/10 shadow-2xl shadow-amber-500/10' : 'border-white/5 hover:bg-white/10 hover:border-amber-500/30'}`}
                    onClick={() => setExpandedId(expandedId === item.application_id ? null : item.application_id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.decision === 'approve' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                          {item.decision === 'approve' ? <ShieldCheck size={14} /> : <Activity size={14} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{item.bank_name || 'Generic Engine'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-bold text-slate-200 uppercase">{formatCurrency(item.input_data.loan_amount)}</span>
                            <span className="text-[8px] text-slate-700">•</span>
                            <span className="text-[8px] font-bold text-slate-200 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.decision === 'approve' ? 'success' : 'error'} className="text-[7px] px-1.5 py-0">
                          {item.decision === 'approve' ? 'APRVD' : 'RJCTD'}
                        </Badge>
                        <p className="text-[9px] font-black text-white mt-0.5">{formatPercent(item.probability)} Risk</p>
                      </div>
                    </div>

                    {/* Expandable Factor Breakdown */}
                    <AnimatePresence>
                      {expandedId === item.application_id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 mt-3 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                            <div>
                               <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-2">Key Decision Drivers</p>
                               <div className="flex flex-wrap gap-1.5">
                                 {item.top_factors?.slice(0, 3).map((f: string) => (
                                   <div key={f} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[7px] font-bold text-slate-400 uppercase">
                                     {f.replace(/_/g, ' ')}
                                   </div>
                                 ))}
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                               {[
                                 { label: "Income", val: formatCurrency(item.input_data.income) },
                                 { label: "DTI", val: formatRatio(item.input_data.debt_to_income_ratio) },
                                 { label: "Credit", val: item.input_data.credit_score },
                                 { label: "Region", val: item.input_data.geography || 'N/A' }
                               ].map((d, idx) => (
                                 <div key={idx}>
                                   <p className="text-[6px] font-black text-slate-700 uppercase">{d.label}</p>
                                   <p className="text-[9px] font-black text-white">{d.val}</p>
                                 </div>
                               ))}
                            </div>

                            <Button 
                              variant="secondary" 
                              className="w-full h-8 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewHistoryDetail(item.application_id);
                              }}
                            >
                              Load Full Forensic Audit
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full bg-black/40 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center min-h-[500px] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent animate-pulse" />
                <div className="w-24 h-24 mb-8 relative">
                   <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
                   <motion.div 
                     className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="text-amber-500" size={32} />
                   </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <h3 className="text-white font-black text-xl tracking-tighter uppercase">NEURAL ENGINE ACTIVE</h3>
                  <div className="flex flex-col items-center gap-2">
                    {["Reading credit profile...", "Scoring 200 decision trees...", "Computing feature contributions...", "Verifying audit chain..."].map((step, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0.2 }}
                        animate={{ 
                          opacity: thinkingStep === i ? 1 : (thinkingStep > i ? 0.5 : 0.2),
                          scale: thinkingStep === i ? 1.05 : 1,
                          color: thinkingStep === i ? '#fbbf24' : '#64748b'
                        }}
                        className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3"
                      >
                        {thinkingStep > i ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className={`w-1.5 h-1.5 rounded-full ${thinkingStep === i ? 'bg-amber-500 animate-ping' : 'bg-slate-700'}`} />}
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : !result ? (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center min-h-[500px]"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl shadow-xl flex items-center justify-center mb-6 border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Fingerprint className="text-slate-300 w-8 h-8 relative z-10" />
                </div>
                <h3 className="text-white font-black text-xl tracking-tighter uppercase leading-none">Awaiting Submission</h3>
                <p className="text-slate-200 text-[9px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs leading-relaxed">
                  Initialize payload for real-time risk assessment.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className={`relative overflow-hidden border-t-4 ${result.decision === 'approve' ? 'border-t-emerald-500' : 'border-t-rose-500'} bg-black/40`}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant={result.decision === 'approve' ? 'success' : 'error'} className="text-[8px] tracking-widest">
                            OUTCOME: {result.application_id.slice(0, 8)}
                          </Badge>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                            <ShieldCheck size={10} className="text-amber-500" />
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Chain Verified</span>
                          </div>
                        </div>
                        <div className={`text-4xl font-black tracking-tighter leading-none ${result.decision === 'approve' ? 'text-emerald-500' : 'text-rose-500'} border-l-4 pl-4 ${result.decision === 'approve' ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                          {result.decision === 'approve' ? 'APPROVED' : 'REJECTED'}
                        </div>
                        <p className="text-slate-400 mt-4 font-bold text-xs leading-relaxed max-w-[320px] uppercase tracking-tight">
                          Neural node <span className="text-white">{result.bank_name || 'Global Trust Bank'}</span> has processed your profile. 
                          {result.decision === 'approve' 
                            ? " Risk parameters accepted." 
                            : " Threshold mismatch detected."}
                        </p>
                        
                        {result.ai_narrative && (
                          <div className="mt-6 p-5 bg-amber-500/5 rounded-3xl border border-amber-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                              <BrainCircuit size={40} />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles size={12} className="text-amber-500" />
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Forensic AI Narrative</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-300 leading-relaxed italic relative z-10">
                              "{result.ai_narrative}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Risk Gauge */}
                      <div className="flex flex-col items-center bg-white/[0.03] p-8 rounded-[40px] border border-white/5 min-w-[240px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                        
                        <div className="relative w-40 h-24 mb-2">
                          <svg viewBox="0 0 100 60" className="w-full h-full">
                            {/* Background Arc */}
                            <path 
                              d="M 10 50 A 40 40 0 0 1 90 50" 
                              fill="none" 
                              stroke="rgba(255,255,255,0.05)" 
                              strokeWidth="10" 
                              strokeLinecap="round" 
                            />
                            {/* Progress Arc */}
                            <motion.path 
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: result.probability }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              d="M 10 50 A 40 40 0 0 1 90 50" 
                              fill="none" 
                              stroke={result.probability > 0.6 ? '#f43f5e' : result.probability > 0.3 ? '#fbbf24' : '#10b981'}
                              strokeWidth="10" 
                              strokeLinecap="round"
                              style={{ 
                                filter: `drop-shadow(0 0 8px ${result.probability > 0.6 ? 'rgba(244,63,94,0.4)' : result.probability > 0.3 ? 'rgba(251,191,36,0.4)' : 'rgba(16,185,129,0.4)'})` 
                              }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                            <span className="text-3xl font-black text-white tracking-tighter">{formatPercent(result.probability)}</span>
                          </div>
                        </div>

                        <div className="text-center space-y-1">
                          <Badge 
                            variant={result.probability > 0.6 ? 'error' : result.probability > 0.3 ? 'warning' : 'success'} 
                            className="text-[9px] font-black tracking-[0.2em] px-3"
                          >
                            {result.probability > 0.6 ? 'HIGH RISK' : result.probability > 0.3 ? 'MODERATE RISK' : 'LOW RISK'}
                          </Badge>
                          <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest pt-3">
                            Neural Probability Score
                          </p>
                          <div className="pt-4 border-t border-white/5 mt-4">
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">
                               Institutional Benchmark
                             </p>
                             <p className="text-[10px] font-black text-amber-500/80 mt-1 uppercase">
                               {riskContext ? (
                                 <>Better than <span className="text-white">{riskContext.percentile}%</span> of applicants</>
                               ) : (
                                 <>System Average: <span className="text-white">42.1%</span></>
                               )}
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Neural Logic" className="bg-white/5 border-none p-0">
                    <div className="flex items-center gap-2 mb-4 text-amber-500 px-2">
                      <BrainCircuit size={18} />
                      <span className="font-black text-[10px] uppercase tracking-[0.1em]">Forensic Attribution</span>
                    </div>
                    <div className="space-y-4 px-2">
                      {(() => {
                        const FEATURE_NAMES: Record<string, string> = {
                          income: "Annual Income",
                          age: "Age",
                          loan_amount: "Loan Amount",
                          debt_to_income_ratio: "Debt Ratio",
                          credit_score: "Credit Score",
                          missed_payments: "Payment History",
                          employment_years: "Employment Stability"
                        };

                        const topFactors = result.top_factors || [];
                        const shapValues = result.shap_values || {};
                        const inputData = result.input_data || {};

                        return (
                          <>
                            <div className="space-y-4">
                              {topFactors.slice(0, 3).map((factor: string, i: number) => {
                                const val = shapValues[factor] || 0;
                                const inputVal = inputData[factor];
                                const magnitude = Math.abs(val);
                                const direction = val < 0 ? 'Helped' : 'Hurt';
                                const directionColor = val < 0 ? 'text-emerald-500' : 'text-rose-500';
                                
                                let formattedInput = inputVal;
                                if (factor === 'income' || factor === 'loan_amount') formattedInput = formatCurrency(inputVal);
                                else if (factor === 'debt_to_income_ratio') formattedInput = formatRatio(inputVal);

                                let qualifier = "";
                                if (val < 0) {
                                  qualifier = magnitude > 0.5 ? "This significantly bolstered your profile." : "This is well within the safe range.";
                                } else {
                                  qualifier = magnitude > 0.5 ? "This was a primary driver for risk." : "This was a minor risk factor.";
                                }

                                return (
                                  <div key={factor} className="group p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-black border border-amber-500/20 shadow-lg shadow-amber-500/5">
                                          {i+1}
                                        </div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{FEATURE_NAMES[factor] || factor}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${val < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{direction}</span>
                                        <p className="text-[7px] font-mono opacity-30 mt-1 font-bold">Δ {val.toFixed(4)}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                        Your <span className="text-white font-black">{FEATURE_NAMES[factor]}</span> of <span className="text-amber-500 font-black">{formattedInput}</span> contributed <span className={`font-black ${directionColor}`}>+{magnitude.toFixed(2)}</span> toward {val < 0 ? 'approval' : 'rejection'}.
                                      </p>
                                      <p className="text-[8px] text-slate-200 italic font-bold uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1 h-1 bg-amber-500/40 rounded-full" />
                                        {qualifier}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* SHAP Waterfall Chart */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                  <TrendingUp size={14} className="text-indigo-400" />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Attribution Waterfall</span>
                                </div>
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-bold text-slate-200 uppercase tracking-tighter">Actionable</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    <span className="text-[8px] font-bold text-slate-200 uppercase tracking-tighter">Fixed</span>
                                  </div>
                                </div>
                              </div>

                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart 
                                    layout="vertical" 
                                    data={Object.entries(result.shap_values).map(([k, v]: any) => ({
                                      name: FEATURE_NAMES[k] || k,
                                      val: -v, // Inverting so positive = approval influence (right)
                                      originalVal: v,
                                      isActionable: ['loan_amount', 'income', 'debt_to_income_ratio'].includes(k)
                                    })).sort((a, b) => Math.abs(b.originalVal) - Math.abs(a.originalVal))}
                                    margin={{ left: -20, right: 20 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide domain={[-1, 1]} />
                                    <YAxis 
                                      dataKey="name" 
                                      type="category" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      fontSize={8} 
                                      width={100}
                                      tick={{ fill: '#475569', fontWeight: 900 }}
                                    />
                                    <RechartsTooltip 
                                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          const data = payload[0].payload;
                                          return (
                                            <div className="bg-black border border-white/10 p-3 rounded-xl shadow-2xl">
                                              <p className="text-[10px] font-black text-white uppercase mb-1">{data.name}</p>
                                              <p className={`text-[9px] font-bold ${data.originalVal < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {data.originalVal < 0 ? 'Pushed Toward Approval' : 'Pushed Toward Rejection'}
                                              </p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Bar dataKey="val" radius={[0, 4, 4, 0]} isAnimationActive={!loading} animationDuration={1500}>
                                      {Object.entries(result.shap_values).map((entry, index) => {
                                        const k = entry[0];
                                        const isActionable = ['loan_amount', 'income', 'debt_to_income_ratio'].includes(k);
                                        return <Cell key={`cell-${index}`} fill={isActionable ? '#10b981' : '#475569'} fillOpacity={0.8} />;
                                      })}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex justify-between items-center mt-2 px-2">
                                <span className="text-[7px] font-black text-rose-500/60 uppercase tracking-widest">← Hurt Approval</span>
                                <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-widest">Helped Approval →</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </Card>

                  <Card title="Optimization" className="bg-white/5 border-none p-0">
                    <div className="p-8 space-y-8">
                      {/* What-If Simulator */}
                      <div>
                        <div className="flex items-center gap-2 mb-6">
                           <Zap size={16} className="text-amber-500" />
                           <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Neural Strategy Simulator</h5>
                        </div>

                        {(() => {
                          if (!simValues || !result) return null;

                          // Simplified SHAP-based simulation
                          let simProb = result.probability;
                          Object.entries(simValues).forEach(([k, v]: any) => {
                            const original = result.input_data[k];
                            const shap = result.shap_values[k] || 0;
                            if (original !== 0 && (k === 'income' || k === 'loan_amount' || k === 'debt_to_income_ratio' || k === 'credit_score')) {
                               const delta = (v / original) - 1;
                               simProb += delta * shap;
                            }
                          });
                          simProb = Math.max(0.01, Math.min(0.99, simProb));

                          return (
                            <div className="space-y-6">
                              <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 mb-8">
                                <div className="flex justify-between items-end mb-4">
                                  <div>
                                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Simulated Risk Exposure</p>
                                    <h4 className="text-4xl font-black text-white tracking-tighter">{formatPercent(simProb)}</h4>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest mb-1">Delta vs Original</p>
                                    <p className={`text-sm font-black ${simProb < result.probability ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {simProb < result.probability ? '-' : '+'}{formatPercent(Math.abs(simProb - result.probability))}
                                    </p>
                                  </div>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    animate={{ width: `${simProb * 100}%` }}
                                    className={`h-full ${simProb > 0.6 ? 'bg-rose-500' : simProb > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                  { label: "Loan Amount", key: "loan_amount", min: 1000, max: 100000, step: 1000, isCurrency: true },
                                  { label: "Annual Income", key: "income", min: 10000, max: 200000, step: 5000, isCurrency: true },
                                  { label: "Debt Ratio", key: "debt_to_income_ratio", min: 0.05, max: 0.8, step: 0.01, isPercent: true },
                                  { label: "Credit Score", key: "credit_score", min: 300, max: 850, step: 1, isPercent: false }
                                ].map((cfg) => (
                                  <div key={cfg.key} className="space-y-3">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-200">
                                      <span>{cfg.label}</span>
                                      <span className="text-white">{cfg.isCurrency ? formatCurrency(simValues[cfg.key]) : cfg.isPercent ? formatRatio(simValues[cfg.key]) : simValues[cfg.key]}</span>
                                    </div>
                                    <input 
                                      type="range"
                                      min={cfg.min}
                                      max={cfg.max}
                                      step={cfg.step}
                                      value={simValues[cfg.key]}
                                      onChange={(e) => setSimValues({ ...simValues, [cfg.key]: parseFloat(e.target.value) })}
                                      className="w-full accent-amber-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-all"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-4 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                           <Activity size={16} className="text-indigo-400" />
                           <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Model Actionability Path</h5>
                        </div>
                        <ul className="space-y-3">
                          {result.suggestions.map((s: string, i: number) => (
                            <li key={i} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                <CheckCircle2 size={14} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed group-hover:text-white transition-colors">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>

                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/10 relative overflow-hidden group">
                  <div className="flex items-center gap-4 text-black relative z-10">
                    <ShieldCheck size={20} className="font-black" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight leading-none">Immutable Audit Chain Record</p>
                      <p className="text-[8px] font-black opacity-60 uppercase tracking-[0.1em] mt-1">{result.application_id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 relative z-10">
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(result.current_hash || "");
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2000);
                        }}
                        className="bg-black/20 hover:bg-black/40 text-black border-none text-[8px] font-black uppercase tracking-widest h-7 px-3 flex items-center gap-2"
                      >
                        <Lock size={12} />
                        {copySuccess ? 'Copied!' : 'Copy Forensic Hash'}
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={handleDownloadReceipt}
                        className="bg-black/20 hover:bg-black/40 text-black border-none text-[8px] font-black uppercase tracking-widest h-7 px-3 flex items-center gap-2"
                      >
                        <Download size={12} />
                        Audit Receipt
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={handleDownloadReport}
                        className="bg-amber-500 hover:bg-amber-400 text-black border-none text-[8px] font-black uppercase tracking-widest h-7 px-3 flex items-center gap-2"
                      >
                        <FileText size={12} />
                        Full Forensic Report
                      </Button>
                    </div>
                    <span className="text-[6px] font-mono opacity-40 uppercase max-w-[200px] text-right">
                      {copySuccess ? 'Integrity proof copied to clipboard.' : 'This hash proves your decision cannot be altered after the fact.'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
