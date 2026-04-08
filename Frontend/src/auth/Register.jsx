import React, { useState, useContext } from 'react';
import { 
  Activity, 
  UserCircle2, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const { registerAction } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const userData = await registerAction({
        name,
        email,
        password,
        password,
        role: role,
        ...(role === 'student' && { 
          enrollmentId: Math.random().toString(36).substring(7).toUpperCase(),
          department,
          semester
        })
      });
      if (userData.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Handled by toast
    }
  };
  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all z-20"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        Back
      </button>
      
      {/* Background Watermark */}
      <div className="fixed top-20 -left-64 opacity-[0.02] text-blue-500 pointer-events-none z-0">
        <Activity className="w-[600px] h-[600px] text-blue-600" strokeWidth={1} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[500px] mx-auto z-10 py-10 pb-24">
        
        {/* Header section */}
        <div className="flex flex-col items-center mb-8 relative z-10 w-full">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2">
            Attendify
          </h1>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-2">Create your account</h2>
          <p className="text-[13px] font-medium text-gray-500 text-center">
            Join your college community and track your progress effortlessly.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white w-full rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-7 sm:p-9 relative z-10">
          
          <form className="space-y-6" onSubmit={handleRegister}>
            
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-[18px] h-[18px] text-blue-500" strokeWidth={2.5} />
                <h3 className="text-[14px] font-bold text-gray-700">Personal Information</h3>
              </div>
              <div className="h-px w-full bg-gray-100 mb-5"></div>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-600 mb-2">Full Name</label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Johnathan Doe" 
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* College Email */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-600 mb-2">College Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="john.doe@college.edu" 
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-600 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••" 
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-600 mb-2">Confirm Password</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••" 
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information (Student Only) */}
            {role === 'student' && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-[18px] h-[18px] text-blue-500" strokeWidth={2.5} />
                  <h3 className="text-[14px] font-bold text-gray-700">Academic Information</h3>
                </div>
                <div className="h-px w-full bg-gray-100 mb-5"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-600 mb-2">Department</label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      placeholder="e.g. CS" 
                      className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-600 mb-2">Semester</label>
                    <input 
                      type="text" 
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      required
                      placeholder="e.g. 4th" 
                      className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Role Configuration Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-[18px] h-[18px] text-blue-500" strokeWidth={2.5} />
                <h3 className="text-[14px] font-bold text-gray-700">Account Type</h3>
              </div>
              <div className="h-px w-full bg-gray-100 mb-5"></div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    role === 'student' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <UserCircle2 className={`w-6 h-6 mb-2 ${role === 'student' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-[13px] font-bold ${role === 'student' ? 'text-blue-600' : 'text-gray-500'}`}>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    role === 'faculty' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 mb-2 ${role === 'faculty' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-[13px] font-bold ${role === 'faculty' ? 'text-blue-600' : 'text-gray-500'}`}>Faculty</span>
                </button>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="pt-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-[15px] h-[15px] rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer accent-blue-500 transition-all"
                  />
                </div>
                <label htmlFor="terms" className="text-[12px] font-medium text-gray-500 select-none">
                  I agree to the <Link to="/terms" className="font-bold text-blue-500 hover:text-blue-600 transition-colors">Terms of Service</Link> and <Link to="/privacy" className="font-bold text-blue-500 hover:text-blue-600 transition-colors">Privacy Policy</Link>.
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm group"
              >
                Create Account
                <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-[12px] text-gray-500 font-medium">
                Already have an account? <Link to="/login" className="font-bold text-blue-500 hover:text-blue-600 transition-colors">Sign in here</Link>
              </p>
            </div>
          </form>
        </div>

        {/* Password Requirements Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-6 z-10 px-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200/80 bg-white/60 backdrop-blur-md shadow-sm text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold">Minimum 8 characters</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200/80 bg-white/60 backdrop-blur-md shadow-sm text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold">One uppercase letter</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200/80 bg-white/60 backdrop-blur-md shadow-sm text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold">One special character</span>
          </div>
        </div>

      </div>

      {/* Page Base Footer */}
      <div className="absolute bottom-0 left-0 w-full border-t border-gray-200/80 bg-white/50 backdrop-blur-sm py-5 px-4 z-0">
        <p className="text-[12px] font-medium text-gray-500 text-center">
          © 2026 Attendify College Solutions. All rights reserved.
        </p>
      </div>

    </div>
  );
};

export default Register;
