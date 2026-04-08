import React, { useContext } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  ClipboardCheck, 
  History, 
  User, 
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logoutAction } = useContext(AuthContext);

  const getLinkClasses = (path) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl mx-3 text-[14px] font-semibold transition-all ";
    if (path === currentPath || (currentPath === '/dashboard' && path === '/dashboard')) {
      return baseClasses + "bg-blue-50 text-blue-600";
    }
    return baseClasses + "text-gray-500 hover:bg-gray-50 hover:text-gray-700";
  };

  const handleLogout = () => {
    logoutAction();
    navigate('/');
  };

  return (
    <aside className="w-[260px] shrink-0 border-r border-gray-200 bg-white flex flex-col h-full relative z-20 transition-all duration-300">
      
      {/* Header / Logo */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-[10px] flex items-center justify-center shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-[19px] font-extrabold text-blue-500 tracking-tight">Attendify</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-6 flex flex-col gap-1.5">
        <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
          <LayoutDashboard className="w-[18px] h-[18px] shrink-0" strokeWidth={2.5} />
          Dashboard
        </Link>
        <Link to="/mark-attendance" className={getLinkClasses('/mark-attendance')}>
          <ClipboardCheck className="w-[18px] h-[18px] shrink-0" strokeWidth={2.5} />
          Mark Attendance
        </Link>
        <Link to="/history" className={getLinkClasses('/history')}>
          <History className="w-[18px] h-[18px] shrink-0" strokeWidth={2.5} />
          History
        </Link>
        <Link to="/profile" className={getLinkClasses('/profile')}>
          <User className="w-[18px] h-[18px] shrink-0" strokeWidth={2.5} />
          Profile
        </Link>
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 mb-2 space-y-2">
        {/* Mini user card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=eff6ff&color=1d4ed8&font-size=0.33`}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-800 truncate">{user?.name || 'Student'}</p>
            <p className="text-[11px] text-gray-400 font-medium capitalize">{user?.role || 'student'}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
          Logout
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;

