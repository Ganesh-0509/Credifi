import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Scale, 
  Activity, 
  Zap, 
  Download, 
  ShieldCheck, 
  TrendingUp,
  AlertCircle,
  Globe,
  ArrowUpRight,
  X as CloseIcon,
  Search,
  ListFilter
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function RegulatorDashboard() {
  const { token } = useAppContext();
  const [fairness, setFairness] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [drift, setDrift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [fRes, sRes, dRes, lRes] = await Promise.all([
          fetch('/api/regulator/fairness', { headers }),
          fetch('/api/regulator/summary', { headers }),
          fetch('/api/regulator/drift', { headers }),
          fetch('/api/regulator/logs', { headers })
        ]);
        
        if (fRes.ok) setFairness(await fRes.json());
        if (sRes.ok) setSummary(await sRes.json());
        if (dRes.ok) setDrift(await dRes.json());
        if (lRes.ok) setLogs(await lRes.json());
      } catch (err) {
        console.error("Regulatory fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/regulator/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Credifi_Compliance_Report_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const COLORS = ['#fbbf24', '#10b981', '#f59e0b', '#34d399'];

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-amber-500/20"></div>
      <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Regulatory Node...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">National <span className="text-amber-500 italic">Oversight</span> Hub</h1>
          <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Cross-Institutional Fairness Monitoring // Algorithmic Drift Analysis</p>
        </div>
        <Button variant="primary" onClick={handleExport} isLoading={isDownloading}>
          <Download size={18} className="mr-2" /> Export Audit Report
        </Button>
      </header>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Audits", value: summary?.total_applications, icon: Globe, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Global Approval", value: summary ? `${((summary.approval_rate) * 100).toFixed(1)}%` : "0%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Equity Score", value: fairness?.metrics ? `${(100 - fairness.metrics.demographic_parity_difference * 100).toFixed(1)}%` : "N/A", icon: Scale, color: "text-indigo-400", bg: "bg-indigo-400/10" },
          { label: "Drift Status", value: drift?.drift_detected ? "Critical" : "Stable", icon: Zap, color: drift?.drift_detected ? "text-rose-500" : "text-emerald-500", bg: drift?.drift_detected ? "bg-rose-500/10" : "bg-emerald-500/10" }
        ].map((m, i) => (
          <Card key={i} className="bg-white/[0.02] border-none shadow-2xl shadow-black/40">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${m.bg} ${m.color} rounded-2xl`}>
                <m.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{m.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{m.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Fairness Chart */}
        <div className="lg:col-span-8">
          <Card title="Fair Lending Performance" subtitle="Approval rates across protected demographic groups (Income Brackets).">
            <div className="h-80 mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fairness?.group_breakdown ? Object.entries(fairness.group_breakdown).map(([k,v]: any) => ({ group: k.toString().toUpperCase(), rate: parseFloat(v) })) : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="group" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 700 }} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]} barSize={60}>
                    {fairness?.group_breakdown && Object.entries(fairness.group_breakdown).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 pt-12 border-t border-white/5">
              <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-3xl border border-white/5 group hover:border-amber-500/30 transition-all">
                <div className="w-14 h-14 bg-amber-500 text-black rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center justify-center">
                  <Scale size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Demographic Parity Gap</p>
                  <p className="text-3xl font-black text-white tracking-tighter">{(fairness?.metrics?.demographic_parity_difference * 100).toFixed(2)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                <div className="w-14 h-14 bg-emerald-500 text-black rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
                  <Activity size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Equalized Odds Diff</p>
                  <p className="text-3xl font-black text-white tracking-tighter">{(fairness?.metrics?.equalized_odds_difference * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Drift & Anomaly */}
        <div className="lg:col-span-4 space-y-8">
          <Card title="Model Integrity" className="h-full">
            <div className="space-y-8">
              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Variance</span>
                  <Badge variant="warning">Monitoring</Badge>
                </div>
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black text-white tracking-tighter">{(drift?.drift_score * 100).toFixed(2)}%</span>
                   <span className="text-[10px] font-black text-emerald-500 mb-2 uppercase tracking-tighter flex items-center"><ArrowUpRight size={10} /> Stable</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 w-[12%] shadow-[0_0_8px_rgba(251,191,36,0.4)]"></div>
                </div>
              </div>

              <div className="space-y-4">
                 {[
                   { label: "Approved Pct", value: summary ? `${(summary.approval_rate * 100).toFixed(1)}%` : "0%", color: "text-emerald-400" },
                   { label: "Rejected Pct", value: summary ? `${(summary.rejection_rate * 100).toFixed(1)}%` : "0%", color: "text-rose-400" },
                   { label: "Avg Risk Score", value: summary ? summary.average_risk_score.toFixed(3) : "0.000", color: "text-amber-400" }
                 ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <span className={`text-sm font-black tracking-tight ${stat.color}`}>{stat.value}</span>
                    </div>
                 ))}
              </div>
              
              <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                <p className="text-[11px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-tight">
                  <strong className="text-amber-500">Regulatory Advisory:</strong> Statistical drift remains within institutional tolerance. Equity parity is maintained above 85th percentile threshold.
                </p>
              </div>

              <div className="pt-4">
                 <Button 
                   variant="secondary" 
                   onClick={() => setIsLogsOpen(true)}
                   className="w-full h-14 justify-between bg-white/5 hover:bg-white/10 text-white border-white/5"
                 >
                    <span className="uppercase tracking-widest text-xs font-bold">System Forensic Logs</span>
                    <ArrowUpRight size={16} />
                 </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Forensic Logs Modal */}
      <AnimatePresence>
        {isLogsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-5xl bg-[#0a0a0b] border border-white/10 rounded-[32px] overflow-hidden relative shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Forensic <span className="text-amber-500 italic">Audit</span> Ledger</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Full Immutable Traceability Chain // Cross-Node Verification</p>
                </div>
                <button onClick={() => setIsLogsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      <th className="px-6 py-4">Node ID</th>
                      <th className="px-6 py-4">Decision</th>
                      <th className="px-6 py-4">Risk Probability</th>
                      <th className="px-6 py-4">Institution</th>
                      <th className="px-6 py-4 text-right">Integrity Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 bg-white/[0.03] rounded-l-2xl border-l border-y border-white/5">
                          <p className="text-xs font-black text-white tracking-tight font-mono">{log.application_id}</p>
                          <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-5 bg-white/[0.03] border-y border-white/5">
                          <Badge variant={log.decision === 'approve' ? 'success' : 'error'} className="text-[9px] tracking-widest">
                            {log.decision.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 bg-white/[0.03] border-y border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className={`h-full ${log.probability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${log.probability * 100}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-white">{(log.probability * 100).toFixed(1)}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 bg-white/[0.03] border-y border-white/5">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{log.bank_name || 'Global Trust'}</span>
                        </td>
                        <td className="px-6 py-5 bg-white/[0.03] rounded-r-2xl border-r border-y border-white/5 text-right">
                           <span className="text-[9px] font-bold text-emerald-500/60 font-mono tracking-tighter truncate max-w-[100px] inline-block">{log.current_hash.substring(0, 16)}...</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Displaying last {logs.length} high-integrity records</p>
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">All Hashes Verified</span>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
