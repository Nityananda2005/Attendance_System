import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { Bell, Menu } from 'lucide-react';

/**
 * StudentLayout – wraps every student page with a responsive sidebar + navbar.
 * Usage:
 *   <StudentLayout>
 *     <main content here>
 *   </StudentLayout>
 */
const StudentLayout = ({ children, title, subtitle }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fbff] font-sans overflow-hidden relative">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile, static on desktop */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar />
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Navbar */}
        <header className="h-[60px] lg:h-[70px] bg-white border-b border-gray-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title on mobile */}
          {title && (
            <span className="lg:hidden text-[14px] font-extrabold text-gray-800 truncate mx-2">{title}</span>
          )}

          {/* Right: Bell + Avatar - Pushed to right on desktop */}
          <div className="flex items-center gap-3 sm:gap-5 ml-auto sm:ml-0 lg:ml-auto">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
              <Bell className="w-[20px] h-[20px]" strokeWidth={2} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 border border-white rounded-full" />
            </button>

            <div className="hidden sm:block w-px h-7 bg-gray-200" />

            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors max-w-[140px] truncate">
                  {user?.name || 'Student'}
                </span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  {user?.role || 'student'}
                </span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 border border-gray-300 overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-blue-400 transition-all shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=eff6ff&color=1d4ed8&font-size=0.33`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>

      </div>
    </div>
  );
};

export default StudentLayout;
