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
  History,
  Landmark,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

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
    bank_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

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
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] mb-0.5">Engine Status</p>
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
                  label="Annual Income ($)"
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
                  label="Loan Amount ($)"
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
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <History size={12} />
                Audit History
              </h3>
              <Badge variant="neutral" className="opacity-50 text-[9px] px-2 py-0">{history.length} Records</Badge>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {history.length === 0 ? (
                <div className="text-center py-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No Records</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    key={item.application_id} 
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-3 transition-all cursor-pointer"
                    onClick={() => viewHistoryDetail(item.application_id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.decision === 'approve' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                          {item.decision === 'approve' ? <ShieldCheck size={14} /> : <Activity size={14} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{item.bank_name || 'Generic Engine'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">${item.input_data.loan_amount?.toLocaleString()}</span>
                            <span className="text-[8px] text-slate-700">•</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.decision === 'approve' ? 'success' : 'error'} className="text-[7px] px-1.5 py-0">
                          {item.decision === 'approve' ? 'APRVD' : 'RJCTD'}
                        </Badge>
                        <p className="text-[9px] font-black text-white mt-0.5">{(item.probability * 100).toFixed(0)}% Risk</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center min-h-[500px]"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl shadow-xl flex items-center justify-center mb-6 border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Fingerprint className="text-slate-600 w-8 h-8 relative z-10" />
                </div>
                <h3 className="text-white font-black text-xl tracking-tighter uppercase leading-none">Awaiting Submission</h3>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs leading-relaxed">
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
                      </div>
                      
                      <div className="flex flex-col items-center bg-white/5 p-4 rounded-3xl border border-white/5 min-w-[160px] shadow-xl">
                        <div className="text-slate-500 text-[8px] uppercase font-black tracking-[0.2em] mb-2">Default Risk</div>
                        <div className="text-3xl font-black text-white">{(result.probability * 100).toFixed(1)}%</div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.probability * 100}%` }}
                            transition={{ duration: 1.2, ease: "circOut" }}
                            className={`h-full rounded-full ${result.probability > 0.5 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                          />
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
                    <ul className="space-y-3 px-2">
                      {result.explanation.map((exp: string, i: number) => (
                        <li key={i} className="flex gap-3 items-start group">
                          <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5 border border-white/5 group-hover:border-amber-500/50 transition-colors">
                            <span className="text-[8px] font-black text-amber-500">{i+1}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 leading-tight font-bold uppercase tracking-tight group-hover:text-white transition-colors">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card title="Optimization" className="bg-white/5 border-none p-0">
                    <div className="flex items-center gap-2 mb-4 text-emerald-500 px-2">
                      <TrendingUp size={18} />
                      <span className="font-black text-[10px] uppercase tracking-[0.1em]">Strategic Fixes</span>
                    </div>
                    <div className="space-y-3 px-2">
                      {result.suggestions.map((s: string, i: number) => (
                        <div key={i} className="bg-emerald-500/5 p-3 rounded-xl text-[9px] text-emerald-300 border border-emerald-500/10 flex items-start gap-3 hover:bg-emerald-500/10 transition-colors font-bold uppercase tracking-tight">
                          <Zap size={12} className="shrink-0 mt-0.5 text-emerald-500" />
                          {s}
                        </div>
                      ))}
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
                  <div className="flex flex-col items-end gap-1 relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] bg-black/10 px-3 py-1 rounded-full text-black">Verified</span>
                    <span className="text-[6px] font-mono opacity-40 uppercase">SHA-256 Protocol</span>
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
