import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Activity, LayoutDashboard, PlusCircle, History, LogOut,
  Bell, Menu, X, Sun, Moon
} from 'lucide-react';

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
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-900 font-sans overflow-hidden relative transition-colors duration-300">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <aside className="w-[260px] shrink-0 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen relative z-20">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500 rounded-[10px] flex items-center justify-center shadow-md shadow-blue-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-[19px] font-extrabold text-blue-500 tracking-tight">Attendify</span>
            </div>
            {/* Close button (mobile) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Faculty')}&background=${theme === 'dark' ? '334155' : 'eff6ff'}&color=${theme === 'dark' ? '94a3b8' : '1d4ed8'}&font-size=0.33`}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-600 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 dark:text-slate-200 truncate">{user?.name || 'Faculty'}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">Faculty</p>
              </div>
            </div>
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
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Right side icons pushed to right on desktop */}
          <div className="flex items-center gap-3 sm:gap-5 ml-auto sm:ml-0 lg:ml-auto">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-[20px] h-[20px]" strokeWidth={2} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={2} />}
            </button>

            <button className="relative text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hidden sm:block">
              <Bell className="w-[20px] h-[20px]" strokeWidth={2} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 border border-white dark:border-slate-900 rounded-full" />
            </button>
            <div className="hidden sm:block w-px h-7 bg-gray-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] font-bold text-gray-800 dark:text-slate-200 leading-tight max-w-[140px] truncate">
                  {user?.name || 'Faculty Member'}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">Faculty</span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 overflow-hidden shadow-sm shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Faculty')}&background=${theme === 'dark' ? '334155' : 'eff6ff'}&color=${theme === 'dark' ? '94a3b8' : '1d4ed8'}&font-size=0.33`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-transparent dark:bg-slate-900 transition-colors duration-300">
          {children}
        </main>

      </div>
    </div>
  );
};

export default FacultyLayout;
