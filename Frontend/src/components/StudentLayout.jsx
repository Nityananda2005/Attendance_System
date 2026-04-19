import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Bell, Sun, Moon, MapPin, LayoutDashboard, QrCode, Clock, User, Trophy, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { getCurrentCoordinates, getGeolocationErrorMessage } from '../utils/geolocation';

/**
 * StudentLayout – wraps every student page with a responsive sidebar + navbar.
 * Usage:
 *   <StudentLayout>
 *     <main content here>
 *   </StudentLayout>
 */
const StudentLayout = ({ children, title }) => {
  const { user, updateUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMarkAttendanceFromNotification = async (code) => {
    if (!code) return;
    
    const loadingToast = toast.loading("Verifying your location...");

    const submit = async (lat, lng, accuracy) => {
      try {
        const res = await api.post('/attendance/mark', {
          sessionCode: code.toUpperCase(),
          location: { lat, lng },
          accuracy
        });
        toast.success(res.data.message || "Attendance Marked Successfully!", { id: loadingToast, duration: 2000 });
        
        setNotifications(prev => prev.filter(n => n.sessionCode !== code));
        
        setTimeout(() => {
          toast.dismiss(loadingToast);
          navigate('/history');
        }, 2000);
      } catch (err) {
        toast.error(err.response?.data?.error || err.response?.data?.message || "Verification Failed", { id: loadingToast });
      }
    };

    try {
      const loc = await getCurrentCoordinates({ enableHighAccuracy: true });
      if (loc.accuracy > 100) {
        toast.error("Location accuracy too low. Please move to an open area.", { id: loadingToast });
        return;
      }
      await submit(loc.lat, loc.lng, loc.accuracy);
    } catch (err) {
      toast.error("Location access is required for attendance.", { id: loadingToast });
    }
  };

  const showActiveSessionToast = (message, sessionCode) => {
    // Prevent duplicate popups for the same session in the current browser session
    const notified = JSON.parse(sessionStorage.getItem('notified_sessions') || '[]');
    if (notified.includes(sessionCode)) return;
    
    toast.custom((t) => (
       <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-slate-800 shadow-[0_20px_50px_rgba(59,130,246,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-auto flex flex-col overflow-hidden border-2 border-blue-500 p-5 mt-2`}>
         <div className="flex items-start">
           <div className="flex-shrink-0 pt-1">
              <div className="w-[42px] h-[42px] rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                 <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              </div>
           </div>
           <div className="ml-3.5 flex-1">
             <p className="text-[17px] font-black text-gray-900 dark:text-white tracking-tight leading-tight">Session Live!</p>
             <p className="mt-1 text-[13px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{message}</p>
           </div>
         </div>
         <div className="mt-5 flex gap-2">
           <button 
             onClick={() => {
               toast.dismiss(t.id);
               handleMarkAttendanceFromNotification(sessionCode);
             }}
             className="flex-[2] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-3 px-4 rounded-xl text-[13px] transition-all shadow-md shadow-blue-500/30">
             Mark Attendance Now
           </button>
           <button 
             onClick={() => toast.dismiss(t.id)}
             className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-[13px] font-bold transition-all">
             Dismiss
           </button>
         </div>
       </div>
    ), { duration: Infinity, position: 'top-center' });

    // Mark as notified
    sessionStorage.setItem('notified_sessions', JSON.stringify([...notified, sessionCode]));
  };

  // Fetch already active sessions on mount/refresh
  useEffect(() => {
    if (user?.role !== 'student') return;

    const fetchActiveSessions = async () => {
      try {
        const res = await api.get('/sessions/active');
        if (res.data && res.data.length > 0) {
          const freshNotifs = res.data.map(s => ({
            type: 'NEW_SESSION',
            message: `Active session for ${s.courseName}`,
            sessionCode: s.sessionCode
          }));
          setNotifications(freshNotifs);
          
          res.data.forEach(s => {
             showActiveSessionToast(`Active session for ${s.courseName}`, s.sessionCode);
          });
        }
      } catch (err) {
        console.error("Error fetching active sessions:", err);
      }
    };
    fetchActiveSessions();
  }, [user]);

  // SSE Notifications logic for real-time creation
  useEffect(() => {
    if (user?.role !== 'student') return;

    const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api';
    const deptParam = Array.isArray(user?.department) ? user.department.join(',') : user?.department || '';
    const semParam = user?.semester || '';
    const sse = new EventSource(`${baseURL}/notifications/stream?department=${encodeURIComponent(deptParam)}&semester=${encodeURIComponent(semParam)}&userId=${user?._id}&role=${user?.role}`);


    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'NEW_SESSION') {
          showActiveSessionToast(data.message, data.sessionCode);
          setNotifications(prev => {
             if (prev.some(n => n.sessionCode === data.sessionCode)) return prev;
             return [data, ...prev];
          });
        } else if (data.type === 'SESSION_ENDED') {
          // Remove the session from notifications
          setNotifications(prev => prev.filter(n => n.sessionCode !== data.sessionCode));
        } else if (data.type === 'PROFILE_REJECTED') {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden border-2 border-rose-500 p-5 mt-2`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <div className="w-[42px] h-[42px] rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
                    <X className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={3} />
                  </div>
                </div>
                <div className="ml-3.5 flex-1">
                  <p className="text-[17px] font-black text-gray-900 dark:text-white tracking-tight leading-tight">Profile Rejected</p>
                  <p className="mt-1 text-[13px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{data.message}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/profile');
                  }}
                  className="flex-[2] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold py-3 px-4 rounded-xl text-[13px] transition-all shadow-md shadow-rose-500/30">
                  Review & Fix Profile
                </button>
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-[13px] font-bold transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          ), { duration: 10000, position: 'top-center' });
        } else if (data.type === 'PROFILE_APPROVED') {
            toast.success("Profile Approved! Refreshing access...", { duration: 3000 });
            
            // Sync local state immediately
            const syncProfile = async () => {
                try {
                    const res = await api.get('/auth/profile');
                    updateUser(res.data);
                    toast.success("Access Granted. Redirecting to Dashboard...", { icon: '🚀' });
                    setTimeout(() => navigate('/dashboard'), 1500);
                } catch (err) {
                    console.error("Failed to sync approved profile", err);
                    window.location.reload(); // Fallback
                }
            };
            syncProfile();
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

  return (
    <div className="flex h-screen bg-[#f8fbff] dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-300 mesh-bg">

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
        <Sidebar />
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {user?.role === 'student' && user?.approvalStatus === 'rejected' && (
          <div className="w-full bg-red-600 px-4 py-1.5 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-500 z-50 shrink-0">
            <X className="w-3.5 h-3.5 text-white ring-1 ring-white/30 rounded-full bg-red-500" strokeWidth={3} />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Application Rejected - Profile Access Only</span>
          </div>
        )}

        {/* Navbar */}
        <header className="h-[60px] lg:h-[70px] bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 transition-colors duration-300">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center overflow-hidden shadow-md shadow-blue-500/20">
               <img src="/logo.png" alt="Attendify Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[16px] font-black text-blue-500 tracking-tight">Attendify</span>
          </div>

          {/* Page title on mobile */}
          {title && (
            <span className="lg:hidden text-[14px] font-extrabold text-gray-800 dark:text-slate-200 truncate mx-2">{title}</span>
          )}

          {/* Right: Bell + Avatar - Pushed to right on desktop */}
          <div className="flex items-center gap-3 sm:gap-5 ml-auto sm:ml-0 lg:ml-auto">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-[20px] h-[20px]" strokeWidth={2} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={2} />}
            </button>

            {/* Notification indicator */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  if (notifications.length > 0) setShowNotifications(!showNotifications);
                }}
                className="relative text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <Bell className="w-[20px] h-[20px]" strokeWidth={2} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 border border-white dark:border-slate-900 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && notifications.length > 0 && (
                <div className="absolute -right-12 sm:right-0 mt-3 w-[280px] sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Notifications</h3>
                    <button 
                      onClick={() => { setNotifications([]); setShowNotifications(false); }}
                      className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif, index) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                        <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2">{notif.message}</p>
                        {notif.sessionCode && (
                          <span className="mt-1 inline-block text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                            Code: {notif.sessionCode}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-7 bg-gray-200 dark:bg-slate-700" />

            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] font-bold text-gray-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-[140px] truncate">
                  {user?.name || 'Student'}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {user?.role || 'student'}
                </span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-blue-400 transition-all shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=${theme === 'dark' ? '334155' : 'eff6ff'}&color=${theme === 'dark' ? '94a3b8' : '1d4ed8'}&font-size=0.33`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 transition-colors duration-300 pb-36 lg:pb-0">
          {children}
        </main>

        <BottomNav 
          links={[
            { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
            { to: '/leaderboard', icon: Trophy, label: 'Rank' },
            { to: '/mark-attendance', icon: QrCode, label: 'Attend' },
            { to: '/history', icon: Clock, label: 'Log' },
            { to: '/profile', icon: User, label: 'Profile' }
          ]} 
        />
      </div>
    </div>
  );
};

export default StudentLayout;






