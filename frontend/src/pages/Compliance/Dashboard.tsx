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
  X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function ComplianceDashboard() {
  const { token } = useAppContext();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

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

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/audit/chain/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVerifyStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Audit <span className="text-amber-500 italic">Forensic</span></h1>
          <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Real-time Decision Ledger // Integrity Chain Node</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchRecent} isLoading={loading}>
            <RefreshCw size={18} className="mr-2" /> System Log
          </Button>
          <Button variant="primary" onClick={handleVerify} isLoading={isVerifying}>
            <Lock size={18} className="mr-2" /> System Check
          </Button>
        </div>
      </header>

      {/* Verification Banner */}
      <AnimatePresence>
        {verifyStatus && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-6 rounded-3xl border-2 flex items-center justify-between ${verifyStatus.valid ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-3 rounded-2xl ${verifyStatus.valid ? 'bg-emerald-500' : 'bg-rose-500'} text-black shadow-2xl`}>
                {verifyStatus.valid ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <h4 className="font-black text-xl uppercase tracking-tighter">{verifyStatus.valid ? 'Chain Integrity Verified' : 'Ledger Anomaly Detected!'}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{verifyStatus.message}</p>
              </div>
            </div>
            <button onClick={() => setVerifyStatus(null)} className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ledger List */}
        <div className="lg:col-span-8">
          <Card className="p-0 border-none bg-white/[0.02]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight text-xl">Decision Ledger</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Verified Transactions</p>
                </div>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
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
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5">
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
                      onClick={() => setSelectedApp(d)}
                      className={`group cursor-pointer transition-all hover:bg-white/5 ${selectedApp?.id === d.id ? 'bg-white/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${d.decision === 'approve' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor] opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                          <span className="font-black text-xs text-slate-500 group-hover:text-white transition-colors tracking-tight">{d.application_id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant={d.decision === 'approve' ? 'success' : 'error'}>
                          {d.decision}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-white tracking-tighter">{(d.probability * 100).toFixed(1)}%</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black tracking-widest uppercase">
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
        <div className="lg:col-span-4">
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
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4 leading-loose">Select a ledger entry for neural contribution analysis and hash verification.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="details" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 sticky top-8"
              >
                <Card title="Neural Inspector" subtitle={`ID: ${selectedApp.application_id}`}>
                  <div className="space-y-10">
                    {/* Input Data Summary */}
                    <div>
                      <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Activity size={12} className="text-amber-500" /> System Inputs
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedApp.input_data).map(([k, v]: any) => (
                          <div key={k} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{k.replace(/_/g, ' ')}</p>
                            <p className="text-sm font-black text-white tracking-tighter">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SHAP Values */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                           <Zap size={12} className="text-amber-500" /> Contribution Logic
                        </h5>
                        <Badge variant="info">SHAP</Badge>
                      </div>
                      <div className="space-y-4">
                        {Object.entries(selectedApp.shap_values).sort((a: any, b: any) => Math.abs(b[1]) - Math.abs(a[1])).map(([k, v]: any) => (
                          <div key={k} className="space-y-2 group">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                              <span className="text-slate-400 group-hover:text-white transition-colors">{k.replace(/_/g, ' ')}</span>
                              <span className={v > 0 ? 'text-rose-400' : 'text-emerald-400'}>{v > 0 ? '+' : ''}{v.toFixed(4)}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                              <div className="h-full bg-white/5 w-1/2"></div>
                              <div 
                                className={`h-full ${v > 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} 
                                style={{ 
                                  width: `${Math.min(Math.abs(v) * 200, 50)}%`,
                                  marginLeft: v > 0 ? '0' : `-${Math.min(Math.abs(v) * 200, 50)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
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
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
