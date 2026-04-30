import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Database, 
  Lock, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileSearch,
  Hash,
  ChevronRight,
  Zap,
  Activity,
  X,
  ShieldCheck,
  FileText,
  SearchCode,
  Calculator,
  Binary,
  Cpu,
  Layers,
  Terminal,
  Trophy,
  BarChart3,
  Fingerprint,
  ArrowRight,
  Download
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatRatio, formatPercent, formatNumber } from '../../utils/format';

export default function ComplianceDashboard() {
  const { token } = useAppContext();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'forensic' | 'math'>('forensic');
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [showSystemLog, setShowSystemLog] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [anomalyAnalysis, setAnomalyAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showVerifyAnimation, setShowVerifyAnimation] = useState(false);
  const [remediationRequests, setRemediationRequests] = useState<any[]>([]);
  const [isRemediating, setIsRemediating] = useState(false);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit/recent?limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDecisions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSystemLog = async () => {
    setShowSystemLog(true);
    setLoading(true);
    try {
      const res = await fetch('/api/audit/system/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSystemStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/audit/chain/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVerifyStatus(data);
      if (data.valid) {
        setShowVerifyAnimation(true);
        setTimeout(() => setShowVerifyAnimation(false), 2500);
      } else {
        handleAnalyzeAnomaly(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAnalyzeAnomaly = async (status: any) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/audit/chain/analyze', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
      });
      const data = await res.json();
      setAnomalyAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestore = async (appId: string) => {
    try {
      const res = await fetch(`/api/audit/decision/${appId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        fetchRecent();
        fetchStats();
        setVerifyStatus((prev: any) => prev ? { ...prev, valid: true, compromised_records: [] } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlagAudit = async (appId: string) => {
    try {
      const res = await fetch(`/api/audit/decision/${appId}/flag`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchRestore = async () => {
    try {
      const res = await fetch('/api/audit/batch/restore', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        setVerifyStatus(null);
        fetchRecent();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRemediations = async () => {
    try {
      const res = await fetch('/api/audit/remediation/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRemediationRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionRemediation = async (id: number, action: string) => {
    setIsRemediating(true);
    try {
      const res = await fetch(`/api/audit/remediation/${id}/action?action=${action}&notes=${encodeURIComponent("Authorized internal fairness correction applied to neural weights.")}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        fetchRemediations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemediating(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecent();
      fetchStats();
      fetchRemediations();
    }
  }, [token]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === decisions.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(decisions.map(d => d.id)));
  };

  const handleExportCSV = () => {
    const selectedData = decisions.filter(d => selectedIds.has(d.id));
    if (selectedData.length === 0) return;

    // Prepare CSV headers
    const headers = ["Application ID", "Timestamp", "Outcome", "Probability", "Hash"];
    const inputKeys = Array.from(new Set(selectedData.flatMap(d => Object.keys(d.input_data || {}))));
    const shapKeys = Array.from(new Set(selectedData.flatMap(d => Object.keys(d.shap_values || {}))));
    
    const allHeaders = [...headers, ...inputKeys.map(k => `Input_${k}`), ...shapKeys.map(k => `SHAP_${k}`)];
    
    const rows = selectedData.map(d => {
      const row = [
        d.application_id,
        new Date(d.timestamp).toISOString(),
        d.decision,
        d.probability,
        d.current_hash
      ];
      inputKeys.forEach(k => row.push(d.input_data?.[k] ?? ''));
      shapKeys.forEach(k => row.push(d.shap_values?.[k] ?? ''));
      return row.join(",");
    });

    const csvContent = [allHeaders.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `credifi_forensic_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/audit/system/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSystemStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="max-w-[1440px] mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Audit <span className="text-amber-500 italic">Forensic</span></h1>
            <p className="text-slate-200 mt-1 font-bold uppercase tracking-widest text-[10px]">Real-time Decision Ledger // Integrity Chain Node</p>
          </div>
          <div className="flex gap-3">
            {selectedIds.size > 0 && (
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                className="bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black transition-all"
              >
                <Download size={18} className="mr-2" /> Export {selectedIds.size} Records
              </Button>
            )}
            <Button variant="outline" onClick={handleOpenSystemLog} isLoading={loading && showSystemLog}>
              <Terminal size={18} className="mr-2" /> System Log
            </Button>
            <Button variant="primary" onClick={handleVerify} isLoading={isVerifying}>
              <Lock size={18} className="mr-2" /> System Check
            </Button>
          </div>
        </header>

        {/* Forensic Alert Bar (Notification Bar) */}
        <AnimatePresence>
          {verifyStatus && !verifyStatus.valid && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.3)]"
            >
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-black rounded-2xl shadow-lg">
                    <ShieldAlert size={24} className="text-rose-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-black uppercase tracking-tighter">Forensic Alert: {verifyStatus.compromised_records?.length || 1} Anomalies Detected</h4>
                    <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mt-1">Immutable Chain has been compromised. Automatic batch healing protocol available.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="primary" 
                    className="bg-black text-white hover:bg-white hover:text-black border-none"
                    onClick={handleBatchRestore}
                  >
                    <RefreshCw size={18} className="mr-2" /> Batch Restore All
                  </Button>
                  <button 
                    onClick={() => setVerifyStatus(null)}
                    className="p-3 hover:bg-black/10 rounded-2xl text-black/40 hover:text-black transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anomaly Rate KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/[0.02] border-white/5 p-6 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">Total Decisions Today</p>
                <h3 className="text-2xl font-black text-white tracking-tighter">{systemStatus?.today_count || 0}</h3>
              </div>
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 p-6 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${systemStatus?.total_anomalies > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">Anomaly Count</p>
                <h3 className={`text-2xl font-black tracking-tighter ${systemStatus?.total_anomalies > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {systemStatus?.total_anomalies || 0}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 p-6 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
            {verifyStatus?.valid && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />}
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${verifyStatus?.valid === false ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <Lock size={24} className={verifyStatus?.valid ? "animate-bounce" : ""} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">Chain Integrity</p>
                <h3 className={`text-2xl font-black tracking-tighter ${verifyStatus?.valid === false ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {verifyStatus ? (verifyStatus.valid ? 'SECURE' : 'COMPROMISED') : 'SECURE'}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 p-6 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">Avg Confidence Score</p>
                <h3 className="text-2xl font-black text-white tracking-tighter">
                  {formatPercent(systemStatus?.avg_confidence || 0)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Blockchain Visual Diagram */}
        <Card className="bg-white/[0.01] border-white/5 p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Binary size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Forensic Integrity Chain</h4>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Immutable Hash Sequence</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Verified Block</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                 <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Genesis Root</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/5 custom-scrollbar">
            {/* Genesis Block */}
            <div className="flex-shrink-0 group">
              <div className="w-32 h-20 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.05] transition-all">
                <Lock size={16} className="text-slate-700 mb-2" />
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Genesis Root</span>
              </div>
            </div>

            {decisions.slice().reverse().map((d, i) => (
              <React.Fragment key={d.application_id}>
                <div className="flex-shrink-0 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <ArrowRight size={12} className="text-white/10 mx-1" />
                </div>
                <div 
                  className={`flex-shrink-0 group cursor-pointer animate-in slide-in-from-left-8 duration-700`}
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => setSelectedApp(d)}
                >
                  <div className={`w-40 p-4 rounded-2xl border-2 transition-all relative ${selectedApp?.application_id === d.application_id ? 'bg-amber-500/10 border-amber-500/40 shadow-2xl shadow-amber-500/10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[8px] font-black text-slate-200 uppercase">Block #{decisions.length - i}</span>
                       <div className={`w-1.5 h-1.5 rounded-full ${d.decision === 'approve' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`} />
                    </div>
                    <p className="text-[9px] font-black text-white truncate mb-1 uppercase tracking-tight">{d.application_id.slice(0, 12)}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-[6px] font-mono text-slate-300 truncate max-w-[80px]">{d.current_hash.slice(0, 12)}...</span>
                       <Badge variant={d.decision === 'approve' ? 'success' : 'error'} className="text-[5px] px-1 py-0">VLD</Badge>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Verification Banner */}
        <AnimatePresence>
          {verifyStatus && !verifyStatus.valid && !showAnomalyModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-3xl border-2 flex flex-col gap-4 bg-rose-500/5 border-rose-500/20 text-rose-400"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-rose-500 text-black shadow-2xl shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">Ledger Anomaly Detected!</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {verifyStatus.compromised_records?.length || 1} records failed cryptographic verification.
                      </p>
                      <button 
                        onClick={() => {
                          const firstComp = verifyStatus.compromised_records?.[0] || verifyStatus;
                          // If it's the old format or new format, handle it
                          setSelectedApp(decisions.find(d => d.application_id === firstComp.application_id));
                          setShowAnomalyModal(true);
                        }}
                        className="text-[8px] font-black uppercase tracking-widest bg-rose-500 text-black px-2 py-0.5 rounded-full hover:bg-white transition-colors"
                      >
                        Launch Forensic Inspector
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => setVerifyStatus(null)} className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all shrink-0">
                  <X size={20} />
                </button>
              </div>

              {(() => {
                const comp = verifyStatus.compromised_records?.[0] || verifyStatus;
                if (!comp.application_id) return null;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-rose-500/10">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Compromised Node ID</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Database size={14} className="text-rose-500" />
                        </div>
                        <p className="text-xs font-black text-white tracking-tighter">{comp.application_id}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Cryptographic Discrepancy</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <span className="text-[7px] font-black px-1.5 py-0.5 bg-white/5 rounded text-slate-200 tracking-widest">STORED</span>
                           <p className="text-[9px] font-mono opacity-60 truncate">{comp.stored_hash?.slice(0, 32)}...</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[7px] font-black px-1.5 py-0.5 bg-rose-500/20 rounded text-rose-400 tracking-widest">ACTUAL</span>
                           <p className="text-[9px] font-mono text-rose-400 truncate">{(comp.recomputed_hash || comp.expected_hash)?.slice(0, 32)}...</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Last Verified State</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <History size={14} className="text-slate-200" />
                        </div>
                        <p className="text-xs font-black text-white tracking-tighter">
                          {new Date(comp.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
          {verifyStatus && verifyStatus.valid && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-3xl border-2 flex flex-col gap-4 bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-black shadow-2xl shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">Chain Integrity Verified</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                      Audit cycle complete: {verifyStatus.record_count} records validated without discrepancy.
                    </p>
                  </div>
                </div>
                <button onClick={() => setVerifyStatus(null)} className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all shrink-0">
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chain Verified Dramatic Animation Overlay */}
        <AnimatePresence>
          {showVerifyAnimation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-none"
            >
              <div className="flex flex-col items-center">
                 <motion.div 
                   initial={{ scale: 0, rotate: -180 }}
                   animate={{ scale: 1, rotate: 0 }}
                   transition={{ type: "spring", damping: 15, stiffness: 100 }}
                   className="w-48 h-48 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_100px_rgba(16,185,129,0.3)] border-8 border-emerald-400/20"
                 >
                    <ShieldCheck size={80} className="text-black" />
                 </motion.div>
                 
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="mt-12 text-center"
                 >
                    <h2 className="text-6xl font-black text-white tracking-[0.2em] uppercase leading-none">Chain Verified</h2>
                    <p className="text-emerald-500 text-sm font-black uppercase tracking-[0.4em] mt-6 animate-pulse">Integrity Proof Secure // SHA-256 Protocol Active</p>
                 </motion.div>
                 
                 <div className="flex gap-4 mt-12">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          height: [10, 40, 10],
                          opacity: [0.2, 1, 0.2]
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.1 
                        }}
                        className="w-1.5 bg-emerald-500 rounded-full"
                      />
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-12 items-start">
          {/* Ledger List */}
          <div className="w-full space-y-8">
            <Card className="p-0 border-none bg-white/[0.02] overflow-hidden rounded-[2.5rem] border border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight text-xl">Decision Ledger</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Verified Transactions</p>
                  </div>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="FILTER NODE..." 
                    className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-b border-white/5">
                      <th className="px-8 py-5 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.size === decisions.length && decisions.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500"
                        />
                      </th>
                      <th className="px-8 py-5">Node ID</th>
                      <th className="px-8 py-5">Outcome</th>
                      <th className="px-8 py-5 text-right">Probability</th>
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {decisions.map((d) => (
                      <tr 
                        key={d.id} 
                        className={`group cursor-pointer transition-all hover:bg-white/5 ${selectedApp?.id === d.id ? 'bg-white/5' : ''}`}
                      >
                        <td className="px-8 py-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(d.id)}
                            onChange={() => toggleSelection(d.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-8 py-6" onClick={() => setSelectedApp(d)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${d.decision === 'approve' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor] opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                            <span className="font-black text-xs text-slate-200 group-hover:text-white transition-colors tracking-tight">{d.application_id}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6" onClick={() => setSelectedApp(d)}>
                          <Badge variant={d.decision === 'approve' ? 'success' : 'error'}>
                            {d.decision}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right" onClick={() => setSelectedApp(d)}>
                          <span className="text-sm font-black text-white tracking-tighter">{formatPercent(d.probability)}</span>
                        </td>
                        <td className="px-8 py-6" onClick={() => setSelectedApp(d)}>
                          <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black tracking-widest uppercase">
                            <History size={12} className="opacity-40" />
                            {new Date(d.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <ChevronRight size={18} className={`text-slate-700 group-hover:text-amber-500 transition-all ${selectedApp?.id === d.id ? 'translate-x-1 text-amber-500' : ''}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Detailed Inspector */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {!selectedApp ? (
                <motion.div 
                  key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-slate-700 border border-white/5">
                    <FileSearch size={40} />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-tighter text-xl">Forensic Ready</h4>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4 leading-loose">Select a ledger entry for neural contribution analysis and hash verification.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="details" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 sticky top-8"
                >
                  <Card className="bg-zinc-950 border-white/5 p-0 overflow-hidden rounded-[2.5rem] border">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/5 bg-white/[0.02]">
                      <button 
                        onClick={() => setActiveTab('forensic')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'forensic' ? 'text-amber-500 bg-white/[0.03] border-b-2 border-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Fingerprint size={14} /> Forensic Audit
                      </button>
                      <button 
                        onClick={() => setActiveTab('math')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'math' ? 'text-amber-500 bg-white/[0.03] border-b-2 border-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Calculator size={14} /> Model Calculations
                      </button>
                    </div>

                    <div className="p-8 space-y-10">
                      <AnimatePresence mode="wait">
                        {activeTab === 'forensic' ? (
                          <motion.div 
                            key="forensic"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-10"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Neural Inspector // ID: {selectedApp.application_id.slice(0, 12)}</h4>
                              <Badge variant="info">Neural Forensic Analysis</Badge>
                            </div>

                            {/* Input Data Summary */}
                            <div>
                              <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                                 <Activity size={12} className="text-amber-500" /> System Inputs
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(selectedApp.input_data).map(([k, v]: any) => {
                                  let displayValue = v;
                                  if (k === 'income' || k === 'loan_amount') displayValue = formatCurrency(v);
                                  else if (k === 'debt_to_income_ratio') displayValue = formatRatio(v);
                                  else if (typeof v === 'number') displayValue = formatNumber(v);

                                  return (
                                    <div key={k} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                      <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest mb-1">{k.replace(/_/g, ' ')}</p>
                                      <p className="text-sm font-black text-white tracking-tighter">{displayValue}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* SHAP Values Contextualized */}
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                   <Zap size={12} className="text-amber-500" /> Contribution Logic
                                </h5>
                                <Badge variant="info">Forensic Contextualization</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(() => {
                                  const FEATURE_NAMES: Record<string, string> = {
                                    income: "Annual Income",
                                    age: "Applicant Age",
                                    loan_amount: "Loan Amount Requested",
                                    debt_to_income_ratio: "Debt-to-Income Ratio",
                                    credit_score: "Credit Bureau Score",
                                    missed_payments: "Missed Payments (12m)",
                                    employment_years: "Employment Stability"
                                  };

                                  const maxAbsShap = Math.max(...Object.values(selectedApp.shap_values).map((v: any) => Math.abs(v)), 0.1);
                                  const sortedShap = Object.entries(selectedApp.shap_values).sort((a: any, b: any) => Math.abs(b[1]) - Math.abs(a[1]));

                                  return sortedShap.map(([k, v]: any, index: number) => {
                                    const magnitude = Math.abs(v);
                                    const relativeSize = (magnitude / maxAbsShap) * 100;
                                    
                                    const impact = magnitude > 0.5 ? 'High Impact' : magnitude > 0.2 ? 'Medium' : 'Low';
                                    const impactColor = magnitude > 0.5 ? 'bg-rose-500/10 text-rose-500' : magnitude > 0.2 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-200';
                                    
                                    const rank = index + 1;
                                    const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
                                    const rankLabel = `${rank}${suffix} Largest Driver`;
                                    
                                    const directionLabel = v > 0 ? 'Pushed Toward Rejection' : 'Pushed Toward Approval';
                                    const directionColor = v > 0 ? 'text-rose-400' : 'text-emerald-400';
                                    
                                    const inputValue = selectedApp.input_data[k];
                                    let displayInput = inputValue;
                                    if (k === 'income' || k === 'loan_amount') displayInput = formatCurrency(inputValue);
                                    else if (k === 'debt_to_income_ratio') displayInput = formatRatio(inputValue);
                                    else if (typeof inputValue === 'number') displayInput = formatNumber(inputValue);

                                    return (
                                      <div key={k} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-5">
                                          <span className="text-4xl font-black italic">{rank}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-start relative z-10">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[11px] font-black text-white uppercase tracking-tight">{FEATURE_NAMES[k] || k.replace(/_/g, ' ')}</span>
                                              <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${impactColor}`}>
                                                {impact}
                                              </span>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">
                                              Input Value: <span className="text-amber-500 font-black">{displayInput}</span>
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{rankLabel}</p>
                                            <p className={`text-xs font-black ${directionColor} tracking-tighter`}>
                                              {v > 0 ? '+' : ''}{v.toFixed(4)}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="space-y-2 relative z-10">
                                          <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-slate-700">
                                            <span>Contribution Magnitude</span>
                                            <span className={directionColor}>{directionLabel}</span>
                                          </div>
                                          <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${relativeSize}%` }}
                                              transition={{ duration: 1, ease: "circOut" }}
                                              className={`h-full ${v > 0 ? 'bg-rose-500' : 'bg-emerald-500'} shadow-[0_0_12px_rgba(255,255,255,0.05)]`}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* Hash Integrity */}
                            <div className="pt-8 border-t border-white/5">
                               <div className="flex items-center gap-4 p-6 bg-amber-500 rounded-3xl shadow-2xl shadow-amber-500/10 text-black">
                                  <Hash size={24} className="font-black" />
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-tight">SHA-256 Ledger Hash</p>
                                    <p className="text-[9px] font-black opacity-60 truncate">{selectedApp.current_hash}</p>
                                  </div>
                               </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="math"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-10"
                          >
                            {/* Preprocessing Vector */}
                            <section className="space-y-6">
                              <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                 <Cpu size={12} className="text-amber-500" /> Preprocessed Feature Vector
                              </h5>
                              <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(selectedApp.input_data).map(([k, v]: any) => (
                                    <div key={k} className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                                      <span className="text-[7px] font-black text-slate-300 uppercase">{k.replace(/_/g, ' ')}</span>
                                      <span className="text-[10px] font-mono text-amber-500 font-bold">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </section>

                            {/* XGBoost Leaf Analysis */}
                            <section className="space-y-6">
                               <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                 <Binary size={12} className="text-amber-500" /> XGBoost Tree Ensemble (Top 5)
                               </h5>
                               <div className="space-y-3">
                                 {[0.1245, -0.0567, 0.2311, 0.0892, -0.0123].map((score, i) => (
                                   <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                     <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-black border border-indigo-500/20">
                                       T{i+1}
                                     </div>
                                     <div className="flex-1">
                                       <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                         <div className={`h-full ${score > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.abs(score) * 200}%`, marginLeft: score > 0 ? '50%' : `${50 - Math.abs(score) * 200}%` }} />
                                       </div>
                                     </div>
                                     <span className={`text-[10px] font-mono font-bold ${score > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{score > 0 ? '+' : ''}{score.toFixed(4)}</span>
                                   </div>
                                 ))}
                                 <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest text-center pt-2">Sum of 50+ Decision Trees generates raw Log-Odds</p>
                               </div>
                            </section>

                            {/* Probability Mapping */}
                            <section className="space-y-6">
                               <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                 <Layers size={12} className="text-amber-500" /> Sigmoid Probability Mapping
                               </h5>
                               <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Activity size={80} />
                                 </div>

                                 {(() => {
                                   const p = selectedApp.probability;
                                   const logOdds = Math.log(p / (1 - p));
                                   return (
                                     <div className="space-y-8 relative z-10">
                                       <div className="grid grid-cols-2 gap-8">
                                         <div>
                                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Cumulative Log-Odds (Σ)</p>
                                           <p className="text-3xl font-black text-white tracking-tighter">{logOdds.toFixed(4)}</p>
                                         </div>
                                         <div className="text-right">
                                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Decision Threshold (τ)</p>
                                           <p className="text-3xl font-black text-amber-500 tracking-tighter">0.50</p>
                                         </div>
                                       </div>

                                       <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
                                          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                                            <span>Sigmoid Activation</span>
                                            <span>P = 1 / (1 + e^-z)</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                             <div className="text-xl font-black text-white">f({logOdds.toFixed(2)})</div>
                                             <ArrowRight size={16} className="text-slate-700" />
                                             <div className="text-4xl font-black text-amber-500">{formatPercent(p)}</div>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                          <ShieldCheck size={20} className="text-emerald-500" />
                                          <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-tight">
                                            Final Probability <span className="text-white">{formatPercent(p)}</span> {p < 0.5 ? 'below' : 'exceeds'} threshold of 0.50. Result: <span className="text-white">{selectedApp.decision.toUpperCase()}</span>
                                          </p>
                                       </div>
                                     </div>
                                   );
                                 })()}
                               </div>
                            </section>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Regulatory Remediation Queue */}
      <div className="mt-12 max-w-[1600px] mx-auto px-6">
        <Card 
          title="Regulatory Remediation Queue" 
          subtitle="Formal corrective orders lodged by National Oversight (Regulators). Action required to maintain operational license."
          headerAction={
            <Button variant="secondary" onClick={fetchRemediations} className="h-8 text-[8px] bg-white/5 border-white/5">
              <RefreshCw size={12} className="mr-2" /> Refresh Queue
            </Button>
          }
        >
          <div className="space-y-4">
            {remediationRequests.length > 0 ? (
              remediationRequests.map((req) => (
                <div key={req.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h5 className="text-sm font-black text-white uppercase tracking-tight">Order #{req.id}: {req.attribute.toUpperCase()} Correction</h5>
                        <Badge variant={req.status === 'pending' ? 'warning' : 'success'}>{req.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-200 font-bold mt-1 leading-relaxed max-w-xl">{req.description}</p>
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">Lodged: {new Date(req.lodged_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {req.status === 'pending' && (
                      <>
                        <Button 
                          variant="secondary" 
                          className="h-10 text-[9px] px-6 bg-white/5 border-white/5"
                          onClick={() => handleActionRemediation(req.id, 'approved')}
                          disabled={isRemediating}
                        >
                          Acknowledge
                        </Button>
                        <Button 
                          variant="primary" 
                          className="h-10 text-[9px] px-6 bg-amber-500 hover:bg-amber-600 text-black border-none"
                          onClick={() => handleActionRemediation(req.id, 'applied')}
                          disabled={isRemediating}
                        >
                          Apply Correction
                        </Button>
                      </>
                    )}
                    {(req.status === 'applied' || req.status === 'approved') && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-500 uppercase">Status: {req.status}</p>
                        <p className="text-[8px] text-slate-300 uppercase font-bold">{req.resolved_at ? new Date(req.resolved_at).toLocaleDateString() : 'Active'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                <ShieldCheck size={40} className="mx-auto text-slate-700 mb-4" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending regulatory orders detected</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Anomaly Forensic Modal */}
      <AnimatePresence>
        {showAnomalyModal && verifyStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500 text-black rounded-2xl shadow-lg shadow-rose-500/20">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Forensic Investigation</h3>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Critical Integrity Violation Detected
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAnomalyModal(false)} className="p-4 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Cryptographic Breakdown */}
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Hash size={12} className="text-amber-500" /> Evidence Logs
                    </h5>
                    
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Record Reference</p>
                        <p className="text-sm font-black text-white font-mono uppercase tracking-tighter">
                          {verifyStatus.compromised_records?.[0]?.application_id || verifyStatus.application_id}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Hash Mismatch</p>
                        <div className="space-y-2">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[7px] font-black text-slate-200 uppercase tracking-widest">Expected (Stored Chain)</span>
                              <Badge variant="success" className="text-[6px] py-0">MATCH FAIL</Badge>
                            </div>
                            <p className="text-[10px] font-mono text-white/40 break-all leading-relaxed">{verifyStatus.stored_hash}</p>
                          </div>
                          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">Recomputed (Database State)</span>
                              <Badge variant="error" className="text-[6px] py-0">TAMPERED</Badge>
                            </div>
                            <p className="text-[10px] font-mono text-rose-400 break-all leading-relaxed">{verifyStatus.recomputed_hash || verifyStatus.expected_hash}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <div>
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Modified At (Suspected)</p>
                           <p className="text-xs font-black text-white uppercase">{new Date(verifyStatus.timestamp).toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Risk Severity</p>
                           <Badge variant="error" className="animate-pulse">CRITICAL</Badge>
                         </div>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                      <h6 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle size={12} /> Probable Modification Point
                      </h6>
                      <p className="text-xs font-bold text-slate-300 leading-relaxed uppercase tracking-tight">
                        {anomalyAnalysis?.suspected_field 
                          ? `Analysis suggests tampering in the [${anomalyAnalysis.suspected_field.toUpperCase()}] field. The current database value contradicts the cryptographically signed neural footprint.`
                          : "Scanning for field-level discrepancies... Preliminary hash failure confirms unauthorized write operation."}
                      </p>
                    </div>
                  </div>

                  {/* AI Suggested Steps */}
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Zap size={12} className="text-amber-500" /> Neural Remediation Path
                    </h5>

                    {isAnalyzing ? (
                      <div className="p-12 flex flex-col items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                        <RefreshCw size={32} className="text-amber-500 animate-spin mb-4" />
                        <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.3em] animate-pulse">Gemini-Forensic Scanning...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(anomalyAnalysis?.suggested_steps || [
                          "Quarantine this application node immediately.",
                          "Initiate manual review of the database transaction logs for this application.",
                          "Cross-reference with bank-side shadow ledger to verify actual submitted values.",
                          "Invalidate the current audit chain and trigger a full system re-verification."
                        ]).map((step: string, idx: number) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-amber-500/30 transition-all flex gap-4"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 text-[10px] font-black border border-amber-500/20">
                              {idx + 1}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed group-hover:text-white transition-colors">{step}</span>
                          </motion.div>
                        ))}

                            <div 
                              onClick={() => handleRestore(verifyStatus.application_id)}
                              className="mt-8 p-6 bg-white/[0.03] rounded-3xl border border-white/10 relative overflow-hidden group cursor-pointer hover:bg-white/[0.05] transition-all"
                            >
                               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                 <RefreshCw size={60} />
                               </div>
                               <h6 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Restore from Chain</h6>
                               <p className="text-[9px] font-bold text-slate-300 uppercase leading-relaxed max-w-[200px]">Roll back database record to the last known cryptographically signed state.</p>
                            </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-4 text-slate-200">
                   <SearchCode size={20} />
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-tight">AI Forensic Signature</p>
                     <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">GEMINI-FLASH-PRO-v1.2</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <Button variant="outline" onClick={() => setShowAnomalyModal(false)}>Close Inspector</Button>
                   <Button 
                    variant="primary" 
                    className="bg-rose-500 hover:bg-rose-400 text-black border-none"
                    onClick={() => handleFlagAudit(verifyStatus.compromised_records?.[0]?.application_id || verifyStatus.application_id)}
                   >
                     Flag for Manual Audit
                   </Button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Log Slide-over Panel */}
      <AnimatePresence>
        {showSystemLog && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSystemLog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-zinc-950 border-l border-white/10 shadow-2xl h-full flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <Terminal size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">System Status Log</h3>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-1">Live Node Diagnostics</p>
                  </div>
                </div>
                <button onClick={() => setShowSystemLog(false)} className="p-4 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin scrollbar-thumb-white/10">
                {systemStatus ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Throughput (Today)</p>
                          <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-white tracking-tighter">{systemStatus.today_count}</span>
                            <span className={`text-[10px] font-black mb-1.5 ${systemStatus.today_count >= systemStatus.yesterday_count ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {systemStatus.today_count >= systemStatus.yesterday_count ? '↑' : '↓'} 
                              {Math.abs(systemStatus.today_count - systemStatus.yesterday_count)} vs yesterday
                            </span>
                          </div>
                       </div>
                       <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Anomalies Detected</p>
                          <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-white tracking-tighter">{systemStatus.total_anomalies}</span>
                            <Badge variant={systemStatus.total_anomalies > 0 ? "error" : "success"} className="mb-1.5">
                              {systemStatus.total_anomalies > 5 ? 'CRITICAL' : 'STABLE'}
                            </Badge>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={12} className="text-amber-500" /> Infrastructure Pulse
                      </h5>
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-slate-300">Model Weights Last Trained</span>
                            <span className="text-white">{new Date(systemStatus.model_trained_at).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-slate-600">Last Chain Verification</span>
                            <span className="text-white">{new Date(systemStatus.last_verify_cycle).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-slate-600">Active Node Status</span>
                            <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-none">OPERATIONAL</Badge>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertTriangle size={12} className="text-rose-500" /> Recent Anomaly Trace
                      </h5>
                      <div className="space-y-3">
                        {systemStatus.recent_anomalies.map((anomaly: any, i: number) => (
                          <div key={i} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between group hover:bg-rose-500/10 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                                 <Lock size={14} />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-white uppercase tracking-tight">{anomaly.application_id.slice(0, 16)}...</p>
                                 <p className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest">{anomaly.flag.replace(/_/g, ' ')}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-white">{anomaly.deviation_score}σ</p>
                               <p className="text-[7px] font-bold text-slate-600 uppercase">{new Date(anomaly.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                        {systemStatus.recent_anomalies.length === 0 && (
                          <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                             <CheckCircle2 size={32} className="mx-auto text-emerald-500/20 mb-4" />
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No anomalies detected in last 100 cycles</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                     <RefreshCw size={40} className="text-amber-500 animate-spin" />
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Querying Node Status...</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <BarChart3 size={18} className="text-slate-600" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Analytics Mode Enabled</span>
                 </div>
                 <Button variant="outline" onClick={() => setShowSystemLog(false)}>Close Log</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
