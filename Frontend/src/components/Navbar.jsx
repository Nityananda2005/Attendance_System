import React, { useContext, useEffect, useState, useRef } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Only connect if user is a student
    if (user?.role !== 'student') return;

    const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api';
    const deptParam = Array.isArray(user?.department) ? user.department.join(',') : user?.department || '';
    const semParam = user?.semester || '';
    const sse = new EventSource(`${baseURL}/notifications/stream?department=${encodeURIComponent(deptParam)}&semester=${encodeURIComponent(semParam)}`);

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'NEW_SESSION') {
          toast.success(data.message, { duration: 5000, icon: '📅' });
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
    <header className="h-[70px] bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 flex items-center justify-end px-8 shrink-0 z-10 w-full transition-all duration-300">
      
      <div className="flex items-center gap-6">
        
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
            <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 border border-white dark:border-slate-900 text-[8px] font-bold text-white shadow-sm">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && notifications.length > 0 && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-4">
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

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>

        {/* User Info — clickable → /profile */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-bold text-gray-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {user?.name || 'Student'}
            </span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              {user?.role || 'student'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-blue-400 transition-all">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=${theme === 'dark' ? '334155' : 'eff6ff'}&color=${theme === 'dark' ? '94a3b8' : '1d4ed8'}&font-size=0.33`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>

    </header>
  );
};

export default Navbar;

