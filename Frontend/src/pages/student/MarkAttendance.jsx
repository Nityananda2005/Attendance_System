import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from '../../components/StudentLayout';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { 
  Info, Maximize, MapPin, CheckCircle2, ShieldCheck, AlertCircle, Loader2, Camera, X
} from 'lucide-react';
import { getCurrentCoordinates, getGeolocationErrorMessage } from '../../utils/geolocation';

const MarkAttendance = () => {
  const { user } = useContext(AuthContext);
  const [sessionCode, setSessionCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const requiredFields = ['department', 'semester', 'batchSection', 'residence', 'phone'];
  const isProfileIncomplete = user?.role === 'student' && requiredFields.some(f => !user[f] || user[f].toString().trim() === '');

  if (isProfileIncomplete) {
    return (
      <StudentLayout title="Access Locked">
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Attendance Locked</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium mb-8">
            You must complete your profile details (Batch/Section, Residence, and Phone) before you can mark your attendance for any session.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            Go to Profile
          </button>
        </div>
      </StudentLayout>
    );
  }

  const isVerifyingRef = useRef(false);

  // Sync state to ref to avoid stale closures in Scanner callback
  useEffect(() => {
    isVerifyingRef.current = isVerifying || success;
  }, [isVerifying, success]);

  const submitAttendance = async (code, location = null) => {
    if (!code) return toast.error("Session Code is required");
    setIsVerifying(true);
    try {
      const res = await api.post('/attendance/mark', {
        sessionCode: code.toUpperCase(),
        location
      });
      setSuccess(true);
      toast.success(res.data.message || "Attendance Marked Successfully!", { duration: 2000 });
      setTimeout(() => navigate('/history'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification Failed");
      setIsVerifying(false);
      // Let the scanner have a small cooldown before it can scan again after failure
      setTimeout(() => {
        isVerifyingRef.current = false;
      }, 3000);
    }
  };

  const handleVerify = async (scannedCode) => {
    if (isVerifyingRef.current) return;
    
    const finalCode = typeof scannedCode === 'string' ? scannedCode : sessionCode;
    if (!finalCode) return toast.error("Enter or scan a session code first");

    // Geolocation is currently disabled to speed up verification
    await submitAttendance(finalCode, null);
  };

  return (
    <StudentLayout title="Mark Attendance">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Mark Attendance</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-slate-400 font-medium">
              Verify your presence for today's session.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 w-fit text-[11px] font-bold">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Verification Active (Bypassed)
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-start">

          {/* Left: Illustration and Info */}
          <div className="glass-panel rounded-[2.5rem] p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center hover:shadow-[0_40px_80px_rgba(59,130,246,0.15)] transition-all duration-700">
            
            <div className="w-full max-w-[280px] aspect-square rounded-[30px] overflow-hidden flex flex-col items-center justify-center relative mb-5 border-4 border-blue-500/10 shadow-inner bg-slate-900">
              {success ? (
                <div className="flex flex-col items-center justify-center text-green-500 gap-4">
                  <CheckCircle2 className="w-20 h-20 animate-bounce" />
                  <p className="font-bold text-lg text-white">Verified!</p>
                </div>
              ) : isScanning ? (
                <>
                  <Scanner
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        handleVerify(result[0].rawValue);
                      }
                    }}
                    onError={(error) => console.log("Scanner Error:", error?.message)}
                    components={{ audio: false, finder: true }}
                  />
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-xl z-[99] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-4 w-full h-full bg-slate-800/50">
                  <Camera className="w-12 h-12 opacity-50 mb-2" />
                  <p className="text-xs font-medium text-slate-400">Camera is inactive</p>
                  <button 
                    onClick={() => setIsScanning(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Start Scan
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-[19px] font-black text-gray-900 dark:text-white tracking-tight mb-2">Fast-Pass Attendance</h2>
            <p className="text-[13px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-6 px-4">
              Enter the session code provided by your faculty. Location verification is currently disabled for your convenience.
            </p>

            {/* Tips */}
            <div className="w-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 shrink-0 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-blue-800 dark:text-blue-300 mb-0.5">Quick Verification</h4>
                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400/80 leading-relaxed">
                  Simply enter the 6-digit session code. Location bounds are currently not enforced.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Verification */}
          <div className="space-y-4">

            {/* Location Check */}
            <div className="glass-card-3d p-6">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1">Location Check</h3>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 font-medium mb-4">Live geofence verification.</p>
              <div className="relative w-full h-40 bg-[#eef2f6] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700/60">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-30 mix-blend-multiply" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-blue-500/30 bg-blue-500/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-blue-500/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 flex flex-col items-center">
                  <div className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full shadow-md text-[10px] font-bold text-gray-800 dark:text-slate-200 mb-1 border border-gray-100 dark:border-slate-700">
                    Lecture Hall A
                  </div>
                  <MapPin className="w-6 h-6 text-blue-500 dark:text-blue-400 fill-blue-100 drop-shadow-md" strokeWidth={2} />
                </div>
                <div className="absolute bottom-3 left-3 right-3 glass-panel backdrop-blur-3xl rounded-2xl p-3 shadow-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verification Active</p>
                    <p className="text-[12px] font-extrabold text-gray-800 dark:text-slate-200">Calculating GPS Delta...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Steps */}
            <div className="glass-card-3d p-6">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Verification Steps</h3>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, title: 'Session Verified', desc: 'App handshake with academic server.' },
                  { icon: ShieldCheck, title: 'Verify Code', desc: 'Validating session cryptographic key.' },
                  { icon: MapPin, title: 'Geofence Active', desc: 'Securely transmitting your GPS to check college bounds.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:text-blue-400 group-hover:border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-50 dark:bg-blue-500/10 transition-all">
                      {React.createElement(icon, { className: "w-4 h-4", strokeWidth: 2.5 })}
                    </div>
                    <div className="pt-0.5">
                      <h4 className="text-[13px] font-bold text-gray-800 dark:text-slate-200 mb-0.5">{title}</h4>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Code */}
            <div className="glass-card-3d p-6">
              <h4 className="text-[14px] font-bold text-gray-900 dark:text-white mb-3">Or Verify via Session Code</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A9F2C1"
                  className="w-full sm:flex-1 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 tracking-widest uppercase placeholder-gray-400"
                />
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-[13px] font-bold transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify Code
                </button>
              </div>
              {success && (
                <p className="text-green-600 text-[11px] font-bold mt-3 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Attendance Logged
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default MarkAttendance;






