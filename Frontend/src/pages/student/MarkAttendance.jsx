import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from '../../components/StudentLayout';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Info, MapPin, CheckCircle2, ShieldCheck, AlertCircle, Loader2, KeyRound, Signal
} from 'lucide-react';
import { getCurrentCoordinates, getGeolocationErrorMessage } from '../../utils/geolocation';

const MarkAttendance = () => {
  const { user } = useContext(AuthContext);
  const [sessionCode, setSessionCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [distance, setDistance] = useState(null);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

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

  const handleVerify = async () => {
    if (!sessionCode || sessionCode.length !== 6) return toast.error("Please enter a valid 6-digit session code");
    if (isVerifying || success) return;
    
    setIsVerifying(true);
    let locationPayload = null;
    let accuracyValue = null;

    try {
      toast.loading("Verifying your location...", { id: 'student-loc' });
      const loc = await getCurrentCoordinates({ enableHighAccuracy: true });
      
      if (loc.accuracy > 150) {
        toast.error(`Low GPS accuracy (${Math.round(loc.accuracy)}m). Please try again in an open area.`, { id: 'student-loc' });
        setIsVerifying(false);
        return;
      }

      locationPayload = { lat: loc.lat, lng: loc.lng };
      accuracyValue = loc.accuracy;
      toast.success("Location secured!", { id: 'student-loc' });
    } catch (err) {
      const errMsg = getGeolocationErrorMessage(err, "Location access is required to mark attendance.");
      toast.error(errMsg, { id: 'student-loc' });
      setIsVerifying(false);
      return;
    }

    try {
      const res = await api.post('/attendance/mark', {
        sessionCode: sessionCode.toUpperCase().trim(),
        location: locationPayload,
        accuracy: accuracyValue
      });
      setSuccess(true);
      const toastId = toast.success(res.data.message || "Attendance Marked Successfully!", { duration: 2000 });
      setTimeout(() => {
        toast.dismiss(toastId);
        navigate('/history');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.distance) {
        setDistance(err.response.data.distance);
      }
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Verification Failed";
      toast.error(errorMsg);
      setIsVerifying(false);
      setSessionCode('');
      inputRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (index, e) => {
    const val = e.target.value.toUpperCase();
    if (!/^[A-Z0-9]*$/.test(val)) return; // Only alphanumeric

    let newCode = sessionCode.split('');
    while(newCode.length < 6) newCode.push('');
    
    // Support pasting 6 chars directly
    if (val.length > 1) {
      const pasted = val.replace(/[^A-Z0-9]/g, '').slice(0, 6);
      setSessionCode(pasted);
      if (pasted.length === 6 && inputRefs.current[5]) {
         inputRefs.current[5].focus();
      } else if (pasted.length > 0) {
         inputRefs.current[pasted.length - 1]?.focus();
      }
      return;
    }

    newCode[index] = val;
    const combined = newCode.join('').slice(0, 6);
    setSessionCode(combined);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !sessionCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && sessionCode.length === 6) {
      handleVerify();
    }
  };

  return (
    <StudentLayout title="Mark Attendance">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Verify Presence</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-slate-400 font-medium">
              Enter the unique session code to log your attendance.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 w-fit text-[11px] font-bold">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Verification Active
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-start">

          {/* Left: Input Console */}
          <div className="glass-panel rounded-[2.5rem] p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center hover:shadow-[0_40px_80px_rgba(59,130,246,0.15)] transition-all duration-700">
            
            <div className="w-full max-w-[320px] rounded-[30px] overflow-hidden flex flex-col items-center justify-center relative mb-6 border-[6px] border-blue-50 dark:border-blue-500/10 shadow-inner bg-white dark:bg-slate-900 aspect-[4/3]">
              {success ? (
                <div className="flex flex-col items-center justify-center text-green-500 gap-4 h-full w-full">
                  <CheckCircle2 className="w-20 h-20 animate-bounce" />
                  <p className="font-bold text-lg text-gray-900 dark:text-white">Attendance Verified!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full px-5 py-6 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex gap-2 sm:gap-2.5 mb-7 relative z-10 w-full justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={6}
                        value={sessionCode[index] || ''}
                        onChange={(e) => handleOtpChange(index, e)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-9 h-11 sm:w-11 sm:h-14 bg-white dark:bg-slate-900 border-2 ${sessionCode[index] ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-gray-200 dark:border-slate-700/60'} rounded-xl text-center text-lg sm:text-xl font-black text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all`}
                      />
                    ))}
                  </div>

                  {distance && (
                    <div className="mb-4 px-4 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-full text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Distance: {distance} meters away
                    </div>
                  )}

                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying || sessionCode.length !== 6}
                    className="w-full sm:w-[90%] py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-200 dark:disabled:bg-slate-700 disabled:text-white/60 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Session"}
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-[19px] font-black text-gray-900 dark:text-white tracking-tight mb-2">Secure Passcode</h2>
            <p className="text-[13px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-6 px-4">
              Enter the unique 6-digit alphanumerical code provided by your faculty on the screen.
            </p>

          </div>

          {/* Right: Verification Checkpoints */}
          <div className="space-y-4">
            
            {/* Quick Status */}
            <div className="glass-card-3d p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <h3 className="text-[16px] font-black mb-1 relative z-10">Verification Ready</h3>
              <p className="text-[12px] text-blue-100 font-medium mb-4 relative z-10 leading-relaxed">
                Your device is connected securely. Standby for the session code from your instructor.
              </p>
              <div className="flex items-center gap-2 relative z-10 text-[11px] font-bold uppercase tracking-widest text-blue-100">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                System Online
              </div>
            </div>

            {/* Verification Steps */}
            <div className="glass-card-3d p-6">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Security Sequence</h3>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, title: 'Session Verified', desc: 'App handshake with academic server.' },
                  { icon: Signal, title: 'GPS Verification', desc: 'Strict location bound check enabled.' },
                  { icon: MapPin, title: 'Geofence Active', desc: 'Checking proximity to teacher location.' },
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
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default MarkAttendance;







