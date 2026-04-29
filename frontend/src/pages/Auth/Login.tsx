import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ArrowRight, ChevronLeft, User, Eye, Search, Briefcase } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Input } from '../../components/ui/Input';

const ROLE_METADATA = [
  { id: 'applicant', label: 'Applicant', icon: User, desc: 'Personal Credit Node' },
  { id: 'compliance', label: 'Compliance', icon: Search, desc: 'Audit & Forensic Access' },
  { id: 'regulator', label: 'Regulator', icon: Shield, desc: 'Institutional Oversight' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('applicant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.');
      
      // Verification check: ensure the user is logging in with the intended role
      if (data.role !== selectedRole) {
        throw new Error(`The account ${username} is registered as ${data.role}, not ${selectedRole}.`);
      }

      login(data.access_token, data.role, username);
      
      if (data.role === 'applicant') navigate('/dashboard/applicant');
      else if (data.role === 'compliance') navigate('/dashboard/compliance');
      else if (data.role === 'regulator') navigate('/dashboard/regulator');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-900/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass p-10 md:p-14 relative z-10 border-white/5"
      >
        <div className="flex flex-col items-center mb-12">
          <Link to="/" className="absolute left-10 top-14 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </Link>
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/30 group hover:rotate-12 transition-transform cursor-pointer">
            <Shield className="text-black w-7 h-7" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-display italic">Authenticate <span className="text-amber-500">Node</span></h1>
          <p className="text-slate-600 mt-2 text-[10px] font-black uppercase tracking-[0.4em] mono">Identity Verification Protocol 2.0</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {ROLE_METADATA.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                selectedRole === r.id 
                  ? 'bg-white/10 border-amber-500/50 shadow-lg shadow-amber-500/5' 
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <r.icon size={20} className={`${selectedRole === r.id ? 'text-amber-500' : 'text-slate-600'} group-hover:scale-110 transition-transform`} />
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === r.id ? 'text-white' : 'text-slate-500'}`}>{r.label}</span>
              </div>
              {selectedRole === r.id && <motion.div layoutId="active-tab" className="absolute bottom-0 left-0 w-full h-1 bg-amber-500" />}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <Input
              label="Identity Handle"
              placeholder="Unique Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border-white/5 text-white text-base py-6 placeholder:text-slate-800"
              required
            />

            <Input
              label="Access Key"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/5 text-white text-base py-6 placeholder:text-slate-800"
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl text-[10px] text-center font-black border uppercase tracking-tight bg-rose-500/10 text-rose-400 border-rose-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full h-16 justify-center disabled:opacity-50 text-base shadow-2xl shadow-amber-500/10"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="font-display font-black uppercase tracking-[0.2em]">
                  Initialize Session
                </span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-slate-500 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest transition-all mono group"
            >
              New Network Entity? <span className="text-slate-400 group-hover:text-amber-500 underline underline-offset-4">Register Applicant Node</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
