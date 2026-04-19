import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Activity, LayoutDashboard, Users, UserRound, LogOut,
  Bell, Sun, Moon, Search, Menu, X, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import BottomNav from './BottomNav';

const AdminLayout = ({ children }) => {
  const { user, logoutAction } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const onResize = () => { /* Sidebar logic removed */ };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logoutAction();
    navigate('/');
  };

  const navLinks = [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/teachers', icon: Users, label: 'Teachers' },
    { to: '/admin/students', icon: UserRound, label: 'Students' },
    { to: '/admin/leaves', icon: Calendar, label: 'Leave Requests' },
    { to: '/admin/profile', icon: UserRound, label: 'Profile' },
  ];


  const isActive = (path) => location.pathname === path;
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = React.useRef(null);

  // Fetch pending leaves on load
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchInitialNotifications = async () => {
        try {
          const res = await api.get('/leaves/manage');
          const pending = res.data
            .filter(l => l.status === 'pending')
            .map(l => ({
              type: 'NEW_LEAVE_REQUEST',
              message: `${l.facultyId?.name} has submitted a new leave request.`,
              leaveId: l._id,
              facultyName: l.facultyId?.name,
              createdAt: l.createdAt
            }));
          setNotifications(pending);
        } catch (err) {
          console.error("Failed to fetch initial notifications");
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
        if (data.type === 'NEW_LEAVE_REQUEST') {
          toast((t) => (
            <div className="flex items-start gap-4 p-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-900 dark:text-white">New Leave Request</p>
                <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">{data.message}</p>
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/admin/leaves');
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black shadow-md shadow-blue-500/20 transition-all uppercase tracking-wider"
                >
                  Review Request
                </button>
              </div>
            </div>
          ), { duration: 8000, position: 'top-center' });
          
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

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-300">
      
      {/* Sidebar - REMOVED for clean layout */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 lg:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/admin-dashboard')}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt="Attendify Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter hidden sm:block">Attendify</span>

            </div>
            
            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 p-1 bg-gray-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
               {navLinks.map(({ to, icon: Icon, label }) => (
                 <Link
                   key={to}
                   to={to}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                     isActive(to)
                       ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                       : 'text-gray-500 hover:text-gray-900 dark:hover:text-slate-200'
                   }`}
                 >
                   <Icon className="w-4 h-4" />
                   {label}
                 </Link>
               ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 transition-transform active:rotate-12" />
                {notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-[32px] shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Active Alerts</h3>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">{notifications.length} New</span>
                  </div>
                  
                  <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length > 0 ? notifications.map((n, i) => (
                      <div 
                        key={i} 
                        onClick={() => { navigate('/admin/leaves'); setShowNotifications(false); }}
                        className="p-4 bg-gray-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20 rounded-3xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-semibold italic">Review application now</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 text-center flex flex-col items-center justify-center h-full opacity-50">
                         <div className="w-12 h-12 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-6 h-6 text-gray-300" />
                         </div>
                         <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest">Everything Caught Up</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => { navigate('/admin/leaves'); setShowNotifications(false); }}
                      className="w-full mt-5 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                      Manage All Requests
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-slate-800/50 p-1.5 rounded-2xl transition-all" onClick={() => navigate('/admin/profile')}>
              <div className="hidden sm:flex flex-col items-end px-1">
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{user?.name || 'Admin User'}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Super Admin</span>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-100 dark:border-blue-900/30 group-hover:border-blue-500 group-hover:scale-105 transition-all">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=3b82f6&color=fff`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-36 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav 
        links={[
          { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dash' },
          { to: '/admin/teachers', icon: Users, label: 'Teachers' },
          { to: '/admin/students', icon: UserRound, label: 'Students' },
          { to: '/admin/profile', icon: UserRound, label: 'Profile' }
        ]} 
      />
    </div>
  );
};

export default AdminLayout;
