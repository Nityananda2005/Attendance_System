import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  School, 
  LogOut, 
  ChevronRight,
  Settings,
  Bell,
  Lock,
  ExternalLink
} from 'lucide-react';

const AdminProfile = () => {
  const { user, logoutAction } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAction();
    navigate('/login');
  };

  const menuItems = [
    { icon: Settings, label: 'System Settings', desc: 'Configure geofencing and thresholds' },
    { icon: Bell, label: 'Notification Preferences', desc: 'Manage administrative alerts' },
    { icon: Lock, label: 'Security & Privacy', desc: 'Update passwords and permissions' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Profile Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:shadow-blue-500/10 transition-all duration-500 transform-gpu">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                 <img
                   src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=3b82f6&color=fff&size=200`}
                   alt="Admin Avatar"
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name || 'Principal'}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-widest border border-blue-500/20">
                  Super Admin
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 font-medium">
                  <School className="w-4 h-4" />
                  AttendTrack University
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-8 border-t border-gray-100 dark:border-slate-800/50">
             <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-gray-100/50 dark:border-slate-700/30">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold dark:text-white">{user?.email || 'admin@attendtrack.com'}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-gray-100/50 dark:border-slate-700/30">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-gray-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
                  <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                    Verified
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-2">Account Management</h3>
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-[2rem] overflow-hidden shadow-xl">
                 <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {menuItems.map((item, idx) => (
                      <button 
                        key={idx}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-all group text-left"
                      >
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                              <item.icon className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-[15px] font-bold text-gray-900 dark:text-white">{item.label}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                           </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-2">System Info</h3>
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-[2rem] p-6 shadow-xl space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-800 pb-2">
                       <span>Metric</span>
                       <span>Status</span>
                    </div>
                    {[
                      { l: 'Server', v: 'Optimal', c: 'text-emerald-500' },
                      { l: 'API Latency', v: '24ms', c: 'text-emerald-500' },
                      { l: 'Geo DB', v: 'Synced', c: 'text-blue-500' }
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <span className="text-sm font-medium dark:text-slate-300">{m.l}</span>
                         <span className={`text-sm font-bold ${m.c}`}>{m.v}</span>
                      </div>
                    ))}
                 </div>
                 
                 <button className="w-full py-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 group">
                    <ExternalLink className="w-4 h-4" />
                    System Status
                 </button>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full mt-6 py-5 bg-rose-500 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                Sign Out Account
              </button>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
