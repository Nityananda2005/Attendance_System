import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  Activity, LayoutDashboard, Users, UserRound, LogOut,
  Bell, Sun, Moon, Search, Menu, X
} from 'lucide-react';
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
    { to: '/admin/profile', icon: UserRound, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-300">
      
      {/* Sidebar - REMOVED for clean layout */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 lg:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/admin-dashboard')}>
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-white" />
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
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
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
