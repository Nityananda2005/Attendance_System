import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Activity, LayoutDashboard, PlusCircle, History, LogOut,
  Bell, Sun, Moon, PlusSquare, List, User, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import BottomNav from './BottomNav';

/**
 * FacultyLayout – wraps every faculty page with a responsive sidebar + navbar.
 * Usage:
 *   <FacultyLayout>
 *     <main content here>
 *   </FacultyLayout>
 */
const FacultyLayout = ({ children }) => {
  const { user, logoutAction } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close sidebar on route change (mobile nav)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logoutAction();
    navigate('/');
  };

  const navLinks = [
    { to: '/faculty-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/create-session', icon: PlusCircle, label: 'Create Session' },
    { to: '/attendance-list', icon: History, label: 'History' },
    { to: '/faculty/leaves', icon: Calendar, label: 'Leaves' },
  ];


  const isActive = (path) => location.pathname === path;
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = React.useRef(null);

  // Fetch initial notifications for faculty
  useEffect(() => {
    if (user?.role === 'faculty') {
      const fetchInitialNotifications = async () => {
        try {
          const res = await api.get('/leaves/my');
          // Show leaves that were updated recently (e.g. not pending)
          const recentUpdates = res.data
            .filter(l => l.status !== 'pending')
            .slice(0, 5) // Last 5 updates
            .map(l => ({
              type: 'LEAVE_STATUS_UPDATED',
              status: l.status,
              message: `Your leave request for ${new Date(l.startDate).toLocaleDateString()} has been ${l.status}.`,
              adminComment: l.adminComment
            }));
          setNotifications(recentUpdates);
        } catch (err) {
          console.error("Failed to fetch faculty notifications");
        }
      };
      fetchInitialNotifications();
    }
  }, [user]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SSE Notifications logic
  useEffect(() => {
    if (!user) return;

    const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api';
    const sse = new EventSource(`${baseURL}/notifications/stream?userId=${user._id}&role=${user.role}`);

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'LEAVE_STATUS_UPDATED') {
          toast((t) => (
            <div className="flex items-start gap-3 p-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${data.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {data.status === 'approved' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Leave {data.status === 'approved' ? 'Approved' : 'Rejected'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{data.message}</p>
                {data.adminComment && (
                   <p className="text-[11px] font-medium text-blue-500 mt-1 italic">"{data.adminComment}"</p>
                )}
              </div>
            </div>
          ), { duration: 6000 });
          
          setNotifications(prev => [data, ...prev]);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    sse.onerror = () => {
      console.error("SSE connection lost. Reconnecting...");
    };

    return () => {
      sse.close();
    };
  }, [user]);

  // Right side
  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-300 mesh-bg">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className="hidden lg:block shrink-0"
      >
        <aside className="w-[260px] shrink-0 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen relative z-20">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center overflow-hidden shadow-md shadow-blue-500/20">
                <img src="/logo.png" alt="Attendify Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-[19px] font-extrabold text-blue-500 tracking-tight">Attendify</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 mt-2 flex flex-col gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-3 text-[14px] font-semibold transition-all ${
                  isActive(to)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2.5} />
                {label}
              </Link>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="p-4 mb-2 space-y-2">
            <Link to="/faculty-profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Faculty')}&background=${theme === 'dark' ? '334155' : 'eff6ff'}&color=${theme === 'dark' ? '94a3b8' : '1d4ed8'}&font-size=0.33`}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-600 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 dark:text-slate-200 truncate">{user?.name || 'Faculty'}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">Faculty</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Navbar */}
        <header className="h-[60px] lg:h-[70px] bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 transition-colors duration-300">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center overflow-hidden shadow-md shadow-blue-500/20">
               <img src="/logo.png" alt="Attendify Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[16px] font-black text-blue-500 tracking-tight">Attendify</span>
          </div>
          {/* Right side icons pushed to right on desktop */}
          <div className="flex items-center gap-3 sm:gap-5 ml-auto sm:ml-0 lg:ml-auto">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-[20px] h-[20px]" strokeWidth={2} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={2} />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <Bell className="w-[20px] h-[20px]" strokeWidth={2} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 border border-white dark:border-slate-900 rounded-full animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[300px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Recent Updates</h3>
                  </div>
                  
                  <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length > 0 ? notifications.map((n, i) => (
                      <div 
                        key={i} 
                        onClick={() => { navigate('/faculty/leaves'); setShowNotifications(false); }}
                        className="p-3 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 border border-transparent hover:border-blue-100 dark:hover:border-blue-500/10 rounded-2xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                            {n.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-gray-800 dark:text-slate-200 leading-tight">{n.message}</p>
                            {n.adminComment && (
                              <p className="text-[10px] text-blue-500 mt-1 italic font-medium truncate">"{n.adminComment}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-10 text-center flex flex-col items-center justify-center h-full opacity-50">
                         <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                            <Bell className="w-5 h-5 text-gray-300" />
                         </div>
                         <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">No new updates</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { navigate('/faculty/leaves'); setShowNotifications(false); }}
                    className="w-full mt-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl text-[11px] font-bold hover:bg-gray-100 transition-colors"
                  >
                    View Leave History
                  </button>
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-7 bg-gray-200 dark:bg-slate-700" />
            <Link to="/faculty-profile" className="flex items-center gap-2.5 cursor-pointer group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] font-bold text-gray-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-[140px] truncate">
                  {user?.name || 'Faculty Member'}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">Faculty</span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 overflow-hidden shadow-sm shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Faculty')}&background=${theme === 'dark' ? '334155' : 'eff6ff'}&color=${theme === 'dark' ? '94a3b8' : '1d4ed8'}&font-size=0.33`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-transparent dark:bg-slate-900 transition-colors duration-300 pb-36 lg:pb-0">
          {children}
        </main>

        <BottomNav 
          links={[
            { to: '/faculty-dashboard', icon: LayoutDashboard, label: 'Home' },
            { to: '/create-session', icon: PlusSquare, label: 'Create' },
            { to: '/attendance-list', icon: List, label: 'History' },
            { to: '/faculty/leaves', icon: Calendar, label: 'Leave' },
            { to: '/faculty-profile', icon: User, label: 'Profile' }
          ]} 
        />
      </div>
    </div>
  );
};

export default FacultyLayout;
