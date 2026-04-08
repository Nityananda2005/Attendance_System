import React, { useState, useContext } from 'react';
import { 
  Activity, 
  UserCircle2, 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAction, logoutAction } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await loginAction(email, password);
      
      if (userData.role !== role) {
        logoutAction();
        toast.error(`Please select the right role. You are registered as a ${userData.role}.`);
        return;
      }

      if (userData.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // toast handles the error notification
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-4 relative font-sans">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all z-20"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        Back
      </button>
      
      {/* Main Wrapper to push footer to bottom if needed, but flex-col centers it perfectly */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto z-10 pb-20">
        
        {/* Header section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Attendify</h1>
          <p className="text-[15px] font-medium text-gray-500 text-center max-w-xs">
            The modern standard for academic<br />attendance and tracking.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white w-full rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-gray-100/50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">I Am A...</p>
          
          {/* Role Toggle */}
          <div className="bg-slate-50 p-1.5 rounded-full flex gap-1 mb-8 border border-gray-100">
            <button
              onClick={(e) => { e.preventDefault(); setRole('student'); }}
              type="button"
              className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                role === 'student' 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-slate-100/50'
              }`}
            >
              <UserCircle2 className="w-[18px] h-[18px]" />
              Student
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setRole('faculty'); }}
              type="button"
              className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                role === 'faculty' 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-slate-100/50'
              }`}
            >
              <Briefcase className="w-[18px] h-[18px]" />
              Faculty
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2 mt-2">Campus Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. john.doe@college.edu" 
                  className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] text-gray-900 placeholder:text-gray-400/80 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-bold text-gray-800">Password</label>
                <Link to="/forgot-password" className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none shrink-0" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] text-gray-900 placeholder:text-gray-400/80 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1 pb-3">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded-[4px] border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer accent-blue-500 transition-all duration-200"
                />
              </div>
              <label htmlFor="remember" className="text-[14px] font-semibold text-gray-700 cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm group"
            >
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Below Card */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-[14px] text-gray-500 font-medium mb-6">
            Don't have an account yet? <Link to="/register" className="font-bold text-blue-500 hover:text-blue-600 transition-colors ml-1">Create an account</Link>
          </p>

          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
              Secure Login
            </div>
            <div className="w-px h-3 bg-gray-300 rounded-full"></div>
            <div className="flex items-center">
              College Certified
            </div>
          </div>
        </div>

      </div>

      {/* Page Base Footer */}
      <div className="absolute bottom-0 left-0 w-full border-t border-gray-200/80 bg-white/50 backdrop-blur-sm py-5 px-4 z-0">
        <p className="text-[13px] font-medium text-gray-500 text-center">
          © 2026 Attendify College Solutions. All rights reserved.
        </p>
      </div>

    </div>
  );
};

export default Login;
