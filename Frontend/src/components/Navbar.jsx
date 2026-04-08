import React, { useContext } from 'react';
import { Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="h-[70px] bg-white border-b border-gray-200/80 flex items-center justify-end px-8 shrink-0 z-10 w-full transition-all duration-300">
      
      <div className="flex items-center gap-6">
        
        {/* Notification indicator */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 border border-white rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200"></div>

        {/* User Info — clickable → /profile */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
              {user?.name || 'Student'}
            </span>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              {user?.role || 'student'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-blue-400 transition-all">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=eff6ff&color=1d4ed8&font-size=0.33`}
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

