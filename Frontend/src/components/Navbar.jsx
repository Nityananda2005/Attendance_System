import React, { useContext } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

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
        <button className="relative text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 border border-white dark:border-slate-900 rounded-full"></span>
        </button>

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

