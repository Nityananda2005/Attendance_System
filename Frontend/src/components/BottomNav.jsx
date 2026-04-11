import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = ({ links }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.4)] rounded-2xl flex justify-around items-center py-3 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 group relative"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isActive(to) 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-400 dark:text-slate-500 active:scale-90 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}>
              <Icon className="w-5 h-5" strokeWidth={isActive(to) ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
              isActive(to) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'
            }`}>
              {label}
            </span>
            {isActive(to) && (
              <div className="absolute -top-1 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
