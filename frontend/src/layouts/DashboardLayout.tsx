import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  BarChart, 
  LogOut, 
  User as UserIcon,
  Bell,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { role, user, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSidebarItems = (): SidebarItem[] => {
    if (role === 'applicant') return [{ label: 'Personal Node', to: '/dashboard/applicant', icon: LayoutDashboard }];
    if (role === 'compliance') return [{ label: 'Audit Forensic', to: '/dashboard/compliance', icon: ShieldCheck }];
    if (role === 'regulator') return [{ label: 'National Oversight', to: '/dashboard/regulator', icon: BarChart }];
    return [];
  };

  const items = getSidebarItems();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:z-50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/5 transition-transform duration-500 ease-[0.16, 1, 0.3, 1] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          {/* Brand */}
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-2xl shadow-amber-500/20">C</div>
            <span className="text-white font-black tracking-tighter text-2xl uppercase">Credifi</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 ml-2">Navigation</p>
            {items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${isActive ? 'bg-amber-500 text-black font-black shadow-2xl shadow-amber-500/10' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}
                >
                  <item.icon size={22} className={isActive ? 'text-black' : 'group-hover:text-amber-500 transition-colors'} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="pt-8 border-t border-white/5">
            <div className="bg-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-black text-sm uppercase">
                  {user?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-black truncate tracking-tight">{user}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{role}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-colors bg-white/5 rounded-xl"
              >
                <span>Disconnect</span>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full -z-10"></div>
        
        {/* Top Header */}
        <header className="h-24 w-full flex items-center justify-between px-8 lg:px-12 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0">
          {/* Left: Branding & Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all active:scale-95 border border-white/10">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/20 transition-transform">C</div>
              <span className="hidden sm:block text-white font-bold tracking-tighter text-2xl uppercase">Credifi</span>
            </div>
          </div>

          {/* Right: Profile */}
          <div className="flex items-center gap-6 md:gap-10 shrink-0">
            <div className="flex items-center gap-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 cursor-pointer transition-all">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
                <UserIcon size={18} />
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">Connected User</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight leading-none">{user}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-8 lg:px-12 pb-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
