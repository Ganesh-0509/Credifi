import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, User, ArrowRight, Key, ChevronLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('applicant');
  const [adminKey, setAdminKey] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAdminMode && adminKey) {
        headers['X-Admin-Key'] = adminKey;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, email, password, role }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed.');
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/5 blur-[120px] rounded-full"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass p-10 md:p-12 relative z-10 border-white/5"
      >
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="mb-8 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </Link>
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/20">
            <Shield className="text-black w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase font-display italic">Register <span className="text-amber-500">Node</span></h1>
          <p className="text-slate-600 mt-2 text-[9px] font-black uppercase tracking-[0.3em] mono">Initialize Identity Instance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Identity Handle"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border-white/5 text-white text-xs placeholder:text-slate-700"
              required
            />

            <Input
              label="Encrypted Email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/5 text-white text-xs placeholder:text-slate-700"
              required
            />

            <Input
              label="Access Key"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/5 text-white text-xs placeholder:text-slate-700"
              required
            />

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isAdminMode} 
                  onChange={(e) => {
                    setIsAdminMode(e.target.checked);
                    if (!e.target.checked) setRole('applicant');
                  }}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500/20"
                />
                <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest transition-colors">
                  Administrative Provisioning
                </span>
              </label>
            </div>

            <AnimatePresence>
              {isAdminMode && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Network Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['compliance', 'regulator'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                            role === r 
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                              : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Input
                    label="System Master Key"
                    type="password"
                    placeholder="Enter Admin Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="bg-amber-500/5 border-amber-500/10 text-amber-500 text-xs placeholder:text-amber-500/20"
                    required={isAdminMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-[10px] text-center font-black border uppercase tracking-tight ${
                  success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {success ? 'Identity Node Initialized. Redirecting...' : error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || success}
            className="btn-gold w-full h-14 justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="font-display font-black uppercase tracking-widest text-[10px]">
                  Initialize Identity
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-slate-600 hover:text-amber-500 text-[9px] font-black uppercase tracking-widest transition-all mono"
            >
              Already Indexed? Authenticate Node
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
