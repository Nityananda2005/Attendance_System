import React, { useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Info, Maximize, Camera, MapPin, CheckCircle2, QrCode, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';

const MarkAttendance = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const submitAttendance = async (code, lat = 0, lng = 0) => {
    if (!code) return toast.error("Session Code is required");
    setIsVerifying(true);
    try {
      const res = await api.post('/attendance/mark', {
        sessionCode: code.toUpperCase(),
        location: { lat, lng }
      });
      setSuccess(true);
      toast.success(res.data.message || "Attendance Marked Successfully!");
      setTimeout(() => navigate('/history'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification Failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = (scannedCode) => {
    const finalCode = typeof scannedCode === 'string' ? scannedCode : sessionCode;
    if (!finalCode) return toast.error("Enter or scan a session code first");
    if (!navigator.geolocation) return submitAttendance(finalCode, 0, 0);

    setIsVerifying(true);
    let locationResolved = false;
    const timeoutId = setTimeout(() => {
      if (!locationResolved) {
        locationResolved = true;
        setIsVerifying(false);
        submitAttendance(finalCode, 0, 0);
      }
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (locationResolved) return;
        locationResolved = true;
        clearTimeout(timeoutId);
        submitAttendance(finalCode, pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        if (locationResolved) return;
        locationResolved = true;
        clearTimeout(timeoutId);
        setIsVerifying(false);
        toast.error("Location blocked! Check the lock icon 🔒 next to your URL.");
      },
      { enableHighAccuracy: false, maximumAge: 10000 }
    );
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
            GPS + QR Verified
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-start">

          {/* Left: Scanner */}
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-0.5">QR Scanner</h2>
                <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400">Position the QR code in the frame.</p>
              </div>
              <span className="bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-100 dark:border-green-500/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Ready
              </span>
            </div>

            {/* Camera Viewfinder */}
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-slate-700/50 rounded-xl overflow-hidden mb-5 border-2 border-gray-100 dark:border-slate-700 group flex items-center justify-center">
              {isScanning ? (
                <Scanner
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      setIsScanning(false);
                      setSessionCode(result[0].rawValue);
                      handleVerify(result[0].rawValue);
                    }
                  }}
                  formats={['qr_code']}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full opacity-60">
                  <Camera className="w-10 h-10 text-gray-400 dark:text-slate-500 mb-2" />
                  <span className="text-[12px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Camera Offline</span>
                </div>
              )}
              {/* Corner brackets */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-40 h-40 sm:w-56 sm:h-56 relative opacity-80">
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                </div>
              </div>
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-scan pointer-events-none z-10" />
              )}
            </div>

            {/* Scan Toggle */}
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`w-full font-bold py-3.5 rounded-full flex items-center justify-center gap-2 mb-4 transition-all ${
                isScanning
                  ? 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 border border-red-200'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20'
              }`}
            >
              {isScanning ? 'Stop Scanning' : <><Maximize className="w-4 h-4" /> Start Scanning</>}
            </button>

            <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium text-center px-2 leading-relaxed mb-5">
              By marking attendance, you confirm your physical presence. Misuse may result in disciplinary action.
            </p>

            {/* Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-3.5 flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-blue-800 mb-0.5">Camera Tips</h4>
                  <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400/80 leading-relaxed">Keep lens clean and room well-lit.</p>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-3.5 flex gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-100 shrink-0 flex items-center justify-center text-orange-500">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-orange-800 mb-0.5">Location Sync</h4>
                  <p className="text-[10px] font-medium text-orange-600/80 leading-relaxed">Keep GPS on. Must be within 50m.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Verification */}
          <div className="space-y-4">

            {/* Location Check */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
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
                <div className="absolute bottom-2 left-2 right-2 bg-white dark:bg-slate-800/95 backdrop-blur rounded-xl p-2.5 shadow-lg border border-gray-100 dark:border-slate-700/50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 dark:text-slate-500 animate-spin shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Location Verification</p>
                    <p className="text-[11px] font-extrabold text-gray-800 dark:text-slate-200">Calculating Distance...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Steps */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Verification Steps</h3>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, title: 'Initialize Session', desc: 'App handshake with academic server.' },
                  { icon: QrCode, title: 'Scan Session QR', desc: 'Validating session cryptographic key.' },
                  { icon: ShieldCheck, title: 'Security Audit', desc: 'Checking GPS spoofing and multi-device logins.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:text-blue-400 group-hover:border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-50 dark:bg-blue-500/10 transition-all">
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
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
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
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

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan { animation: scan 2.5s ease-in-out infinite; }
      `}</style>
    </StudentLayout>
  );
};

export default MarkAttendance;
