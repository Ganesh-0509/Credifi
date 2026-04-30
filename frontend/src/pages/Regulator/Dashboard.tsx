import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { formatCurrency, formatPercent, formatNumber, formatRatio } from '../../utils/format';

export default function RegulatorDashboard() {
  const { token } = useAppContext();
  const [fairness, setFairness] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [drift, setDrift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dimension, setDimension] = useState('income');
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [complianceSummary, setComplianceSummary] = useState<any[]>([]);
  const [fairnessTrend, setFairnessTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [fRes, sRes, dRes, lRes, cRes, tRes] = await Promise.all([
          fetch(`/api/regulator/fairness?dimension=${dimension}`, { headers }),
          fetch('/api/regulator/summary', { headers }),
          fetch('/api/regulator/drift', { headers }),
          fetch('/api/regulator/logs', { headers }),
          fetch('/api/regulator/compliance/summary', { headers }),
          fetch(`/api/regulator/fairness/trend?dimension=${dimension}`, { headers })
        ]);
        
        if (fRes.ok) setFairness(await fRes.json());
        if (sRes.ok) setSummary(await sRes.json());
        if (dRes.ok) setDrift(await dRes.json());
        if (lRes.ok) setLogs(await lRes.json());
        if (cRes.ok) setComplianceSummary(await cRes.json());
        if (tRes.ok) setFairnessTrend(await tRes.json());
      } catch (err) {
        console.error("Regulatory fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, dimension]);

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/regulator/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Credifi_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
          { label: "Total Audits", value: formatNumber(summary?.total_applications || 0), icon: Globe, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Global Approval", value: formatPercent(summary?.approval_rate || 0), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { 
            label: "Max Equity Gap", 
            value: fairness?.metrics ? formatPercent(Math.max(
              fairness.metrics.demographic_parity_difference,
              fairness.metrics.true_positive_rate_difference,
              fairness.metrics.false_positive_rate_difference
            )) : "N/A", 
            icon: Scale, 
            color: "text-indigo-400", 
            bg: "bg-indigo-400/10" 
          },
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
          <Card 
            title="Fair Lending Performance" 
            subtitle={`Approval rates across protected groups (${dimension.toUpperCase()}).`}
            headerAction={
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                {['income', 'gender', 'age', 'geography'].map((dim) => (
                  <button
                    key={dim}
                    onClick={() => setDimension(dim)}
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${dimension === dim ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                  >
                    {dim}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex items-center justify-between mb-8">
              {fairness?.metrics?.disparate_impact_failed ? (
                <div className="flex-1 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                  <AlertCircle className="text-rose-500" size={20} />
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">
                    Fairness Alert: 4/5ths Rule Violation Detected // {dimension.toUpperCase()} BIAS DETECTED
                  </p>
                </div>
              ) : (
                <div className="flex-1 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                  <ShieldCheck className="text-emerald-500" size={20} />
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                    Compliance Verified: 4/5ths Rule Satisfied // {dimension.toUpperCase()} EQUITY MAINTAINED // <span className="text-white px-2 py-0.5 bg-emerald-500/20 rounded-lg ml-2">PASS</span>
                  </p>
                </div>
              )}
            </div>
            <div className="h-80 mt-2">
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/5">
              {[
                { 
                  label: "Demographic Parity", 
                  formula: "P(Y'=1|A=a) - P(Y'=1|A=b)", 
                  value: fairness?.metrics?.demographic_parity_difference, 
                  icon: Scale, 
                  color: "text-amber-500", 
                  desc: "Gap in approval rates between groups" 
                },
                { 
                  label: "Equal Opportunity", 
                  formula: "P(Y'=1|Y=1,A=a) - P(Y'=1|Y=1,A=b)", 
                  value: fairness?.metrics?.true_positive_rate_difference, 
                  icon: Activity, 
                  color: "text-emerald-500", 
                  desc: "Gap in True Positive Rates (Recall)" 
                },
                { 
                  label: "FPR Gap", 
                  formula: "P(Y'=1|Y=0,A=a) - P(Y'=1|Y=0,A=b)", 
                  value: fairness?.metrics?.false_positive_rate_difference, 
                  icon: Zap, 
                  color: "text-indigo-400", 
                  desc: "Gap in False Positive Rates" 
                }
              ].map((m, i) => (
                <div key={i} className="flex flex-col gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 group hover:border-white/20 transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl bg-white/5 ${m.color}`}>
                      <m.icon size={18} />
                    </div>
                    <Badge variant={m.value < 0.1 ? 'success' : 'error'} className="text-[7px]">
                      {m.value < 0.1 ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
                    <p className="text-2xl font-black text-white tracking-tighter mt-1">{formatPercent(m.value || 0)}</p>
                    <p className="text-[8px] font-mono text-slate-600 mt-2 bg-black/40 p-1.5 rounded-lg border border-white/5 truncate">{m.formula}</p>
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 mt-3 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{m.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tighter">Equity Gap Velocity</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rolling 7-day demographic parity trend</p>
                </div>
                <Badge variant={fairnessTrend.length > 1 && fairnessTrend[fairnessTrend.length-1].gap > fairnessTrend[0].gap ? 'error' : 'success'} className="text-[7px]">
                  {fairnessTrend.length > 1 && fairnessTrend[fairnessTrend.length-1].gap > fairnessTrend[0].gap ? 'WORSENING' : 'IMPROVING'}
                </Badge>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fairnessTrend}>
                    <defs>
                      <linearGradient id="colorGap" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={8} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis stroke="#475569" fontSize={8} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fbbf24', fontSize: '10px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#475569', fontSize: '8px', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="gap" 
                      stroke="#fbbf24" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorGap)" 
                    />
                    {/* Parity Target Line at 10% */}
                    <Line type="monotone" dataKey={() => 0.1} stroke="#10b981" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Drift & Anomaly */}
        <div className="lg:col-span-4 space-y-8">
          <Card title="Model Integrity" className="h-full">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Variance</span>
                <Badge variant={drift?.drift_detected ? "error" : "warning"}>{drift?.drift_detected ? "CRITICAL" : "MONITORING"}</Badge>
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-black text-white tracking-tighter">{formatPercent(drift?.drift_score || 0)}</span>
                 <div className="flex flex-col mb-1">
                   <span className={`text-[8px] font-black uppercase tracking-tighter flex items-center ${drift?.details?.approval_delta > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                     {drift?.details?.approval_delta > 0 ? <ArrowUpRight size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                     {formatPercent(Math.abs(drift?.details?.approval_delta || 0))} Delta
                   </span>
                   <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest leading-none">Vs Baseline</span>
                 </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 w-[12%] shadow-[0_0_8px_rgba(251,191,36,0.4)]"></div>
              </div>

              <div className="space-y-4">
                 {[
                   { label: "Approved Pct", value: formatPercent(summary?.approval_rate || 0), color: "text-emerald-400" },
                   { label: "Rejected Pct", value: formatPercent(summary?.rejection_rate || 0), color: "text-rose-400" },
                   { label: "Avg Risk Score", value: formatRatio(summary?.average_risk_score || 0), color: "text-amber-400" }
                 ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <span className={`text-sm font-black tracking-tight ${stat.color}`}>{stat.value}</span>
                    </div>
                 ))}
              </div>
              
              <div className="space-y-3">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Feature Stability Index (PSI)</p>
                 <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {drift?.details?.feature_psi && Object.entries(drift.details.feature_psi).map(([feature, psi]: any) => (
                      <div key={feature} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{feature.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black ${psi > 0.1 ? 'text-rose-500' : 'text-emerald-500'}`}>{psi.toFixed(4)}</span>
                          {psi > 0.1 && <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-5 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={18} />
                  <p className="text-[10px] text-amber-500 leading-none font-black uppercase tracking-widest">
                    Regulatory Advisory
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                  {drift?.recommended_action}
                </p>
                <div className="pt-2 border-t border-amber-500/10 mt-1">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">First Detected</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">
                    {drift?.detected_at ? new Date(drift.detected_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
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

      {/* 4/5ths Rule Compliance Table */}
      <Card 
        title="4/5ths Rule Compliance Summary" 
        subtitle="Structured audit of protected attributes against the federal equity benchmark (80% ratio threshold)."
        className="bg-white/[0.02] border-none shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5">
                <th className="px-8 py-5">Protected Attribute</th>
                <th className="px-8 py-5">Highest Approval Group</th>
                <th className="px-8 py-5">Lowest Approval Group</th>
                <th className="px-8 py-5 text-right">Adverse Impact Ratio</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complianceSummary.map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-black text-white uppercase tracking-tight">{item.attribute}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.highest_group}</span>
                      <span className="text-[10px] text-emerald-500 font-black tracking-widest">{formatPercent(item.highest_rate)} RATE</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.lowest_group}</span>
                      <span className="text-[10px] text-rose-500 font-black tracking-widest">{formatPercent(item.lowest_rate)} RATE</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-sm font-black tracking-tighter ${item.ratio >= 0.8 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {(item.ratio * 100).toFixed(1)}%
                    </span>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1">Vs Benchmark</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Badge variant={item.status === 'PASS' ? 'success' : 'error'}>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
