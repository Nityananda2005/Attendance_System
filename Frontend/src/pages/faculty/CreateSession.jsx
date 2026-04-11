import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import { 
  BookOpen, MapPin, ChevronRight, Info, Users, Calendar, Clock, CheckCircle2, Loader2, PlusCircle
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';



const CreateSession = () => {
  const { user } = useContext(AuthContext);
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [topic, setTopic] = useState('');
  const [department, setDepartment] = useState(user?.department || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [enableGeofencing, setEnableGeofencing] = useState(true);
  const [radiusAllowed, setRadiusAllowed] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionCode, setSessionCode] = useState(null);

  const handleGenerate = async () => {
    if (!courseId || !courseName || !topic) {
      return toast.error("Please fill all necessary session details.");
    }

    setIsGenerating(true);

    const submitSession = async (lat = 0, lng = 0) => {
      try {
        const res = await api.post('/sessions', {
          courseId,
          courseName,
          topic,
          department,
          semester,
          location: { lat, lng },
          radiusAllowed: enableGeofencing ? radiusAllowed : 999999
        });
        setSessionCode(res.data.sessionCode || res.data.session?.sessionCode);
        toast.success("Session Created successfully!");
      } catch (err) {
        toast.error(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create session");
      } finally {
        setIsGenerating(false);
      }
    };

    if (enableGeofencing) {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported by browser.");
        setIsGenerating(false);
        return;
      }
      
      let locationResolved = false;
      const timeoutId = setTimeout(() => {
        if (!locationResolved) {
          locationResolved = true;
          setIsGenerating(false);
          toast.error("Location request tied out (Windows/Browser blocked). Trying without geofence...", { duration: 4000 });
          submitSession(); // Fallback so they aren't completely softlocked forever
        }
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(timeoutId);
          submitSession(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(timeoutId);
          toast.error("Location Blocked! Check the lock icon 🔒 next to your URL to allow location.");
          setIsGenerating(false);
        },
        { enableHighAccuracy: false, maximumAge: 10000 }
      );
    } else {
      submitSession();
    }
  };

  return (
    <FacultyLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Breadcrumbs & Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-[11px] font-black uppercase tracking-widest">
                <span className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400 cursor-pointer transition-colors">Faculty Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                <span className="text-gray-700 dark:text-slate-300">Create Session</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Initiate Attendance</h1>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
               
               {/* Left Column - Form Area */}
               <div className="flex-1 space-y-6">
                 
                 {/* Form Card */}
                 <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                   <div className="p-8 border-b border-gray-50 dark:border-slate-800">
                     <div className="flex items-center gap-3.5 mb-8">
                       <div className="w-[42px] h-[42px] rounded-full bg-blue-50 dark:bg-blue-500/10/80 flex flex-col items-center justify-center">
                           <PlusCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" strokeWidth={2.5}/>
                       </div>
                       <div>
                         <h3 className="text-[18px] font-extrabold text-gray-900 dark:text-white tracking-tight">New Session Details</h3>
                         <p className="text-[13.5px] font-medium text-gray-500 dark:text-slate-400 mt-0.5 tracking-wide">Configure the parameters for your attendance tracking window.</p>
                       </div>
                     </div>

                     <div className="space-y-6">
                       <div>
                         <label className="block text-[13px] font-extrabold text-gray-700 dark:text-slate-300 mb-2">Subject / Course Name</label>
                         <div className="relative">
                           <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-slate-500" strokeWidth={2.5} />
                           <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Advanced Machine Learning" className="w-full pl-[46px] pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13.5px] font-bold text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         <div>
                           <label className="block text-[13px] font-extrabold text-gray-700 dark:text-slate-300 mb-2">Course ID</label>
                           <input type="text" value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="e.g. CS402" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13.5px] font-bold text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                         </div>
                         <div>
                           <label className="block text-[13px] font-extrabold text-gray-700 dark:text-slate-300 mb-2">Today's Topic</label>
                           <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Neural Networks" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13.5px] font-bold text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         <div>
                           <label className="block text-[13px] font-extrabold text-gray-700 dark:text-slate-300 mb-2">Target Department</label>
                           <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13.5px] font-bold text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                         </div>
                         <div>
                           <label className="block text-[13px] font-extrabold text-gray-700 dark:text-slate-300 mb-2">Target Semester</label>
                           <input type="text" value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. 4th" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13.5px] font-bold text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                         </div>
                       </div>

                       <div className="pt-2">
                         <div className="flex items-center justify-between mb-4">
                           <label className="text-[13px] font-extrabold text-gray-700 dark:text-slate-300">Geofence Radius (Meters)</label>
                           <span className="text-[13.5px] font-black text-blue-600 dark:text-blue-400">{radiusAllowed}m</span>
                         </div>
                         <input 
                           type="range" 
                           min="10" 
                           max="200" 
                           value={radiusAllowed} 
                           onChange={(e) => setRadiusAllowed(parseInt(e.target.value))}
                           disabled={!enableGeofencing}
                           className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                         />
                         <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-3">
                            <span>10M</span>
                            <span>100M</span>
                            <span>200M</span>
                         </div>
                       </div>

                       <div className="flex items-center gap-3 pt-2">
                         <input type="checkbox" checked={enableGeofencing} onChange={(e) => setEnableGeofencing(e.target.checked)} className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500" />
                         <label className="text-[13.5px] font-bold text-gray-600 dark:text-slate-400">Enable Precise Geolocation Restrict</label>
                       </div>
                     </div>
                   </div>
                   
                   <div className="p-6 sm:px-8 bg-gray-50 dark:bg-slate-800/50/70 flex items-center justify-between">
                     <button className="text-[14px] font-extrabold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 transition-colors px-2">Cancel</button>
                     <button onClick={handleGenerate} disabled={isGenerating || sessionCode} className="flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-[14px] text-[13.5px] font-bold transition-all shadow-md shadow-blue-500/20">
                       {isGenerating ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Generating...</> : <>Generate Live QR <ChevronRight className="w-[18px] h-[18px]" strokeWidth={3} /></>}
                     </button>
                   </div>
                 </div>

                 {/* Security Protocol block */}
                 <div className="bg-[#f4f9ff] border border-blue-100 dark:border-blue-500/20/60 rounded-[28px] p-7 flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center shrink-0 mt-0.5">
                     <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" strokeWidth={2.5}/>
                   </div>
                   <div>
                     <h4 className="text-[14px] font-black text-[#1e3a8a] mb-1.5 tracking-tight">Security Protocol Enabled</h4>
                     <p className="text-[13px] font-semibold text-[#1e3a8a]/70 leading-relaxed pr-4">Students must enter the session code and be physically present within the configured geofence radius to successfully mark their attendance.</p>
                   </div>
                 </div>

                 {/* Stats Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                   <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center gap-4">
                     <div className="w-11 h-11 rounded-full bg-[#f8fafc] border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                       <Users className="w-[20px] h-[20px] text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p className="text-[9px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1">Target</p>
                       <h4 className="text-[16px] font-black text-gray-900 dark:text-white leading-none tracking-tight">64 Students</h4>
                     </div>
                   </div>
                   <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center gap-4">
                     <div className="w-11 h-11 rounded-full bg-[#f8fafc] border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                       <Calendar className="w-[18px] h-[18px] text-orange-400" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p className="text-[9px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1">Date</p>
                       <h4 className="text-[16px] font-black text-gray-900 dark:text-white leading-none tracking-tight">Today</h4>
                     </div>
                   </div>
                   <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center gap-4">
                     <div className="w-11 h-11 rounded-full bg-[#f8fafc] border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                       <Clock className="w-[20px] h-[20px] text-gray-700 dark:text-slate-300" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p className="text-[9px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1">Type</p>
                       <h4 className="text-[16px] font-black text-gray-900 dark:text-white leading-none tracking-tight">Standard</h4>
                     </div>
                   </div>
                 </div>

               </div>

               {/* Right Column - QR display area */}
               <div className="w-full xl:w-[420px] shrink-0">
                  <div className="bg-[#f8fafc] border border-gray-100 dark:border-slate-700 rounded-[40px] p-8 sm:p-14 flex flex-col items-center justify-center text-center h-full min-h-[600px] xl:min-h-0 xl:h-[calc(100%-80px)] transition-all">
                    
                    {sessionCode ? (
                      <>
                        <span className="px-5 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 text-green-600 font-extrabold text-[10px] rounded-full uppercase tracking-widest shadow-sm mb-7 animate-pulse">Session Active</span>
                        <h3 className="text-[20px] font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Share Session Code</h3>
                        <p className="text-[14px] font-semibold text-gray-500 dark:text-slate-400 mb-8">Students must enter this code to mark presence</p>
                        
                        <div className="w-full max-w-[280px] p-6 aspect-square bg-white dark:bg-slate-800 rounded-[30px] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 dark:border-slate-700/50 flex flex-col items-center justify-center relative mb-5">
                           <img src="https://illustrations.popsy.co/blue/team-work.svg" alt="Students" className="w-[80%] h-[80%] object-contain" />
                        </div>
                        <div className="px-6 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm w-full max-w-[280px]">
                           <span className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Session Code</span>
                           <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-[0.2em]">{sessionCode}</h2>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="px-5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 font-extrabold text-[10px] rounded-full uppercase tracking-widest shadow-sm mb-7">Waiting to Start</span>
                        
                        <h3 className="text-[20px] font-extrabold text-gray-600 dark:text-slate-400 mb-2 tracking-tight">Live Session Delivery</h3>
                        <p className="text-[14px] font-semibold text-gray-400 dark:text-slate-500 mb-10">Generate a session to begin tracking</p>
  
                        <div className="w-full max-w-[280px] aspect-square bg-white dark:bg-slate-800 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
                           <div className="absolute inset-0 m-auto w-[85%] h-[85%] border border-gray-100 dark:border-slate-700 rounded-full"></div>
                           <div className="absolute inset-0 m-auto w-[70%] h-[70%] border border-gray-100 dark:border-slate-700 rounded-full"></div>
                           <div className="absolute inset-0 m-auto w-[55%] h-[55%] border border-gray-100 dark:border-slate-700 rounded-full"></div>
                           <div className="absolute inset-0 m-auto w-[40%] h-[40%] border border-gray-100 dark:border-slate-700 rounded-full"></div>
                           <div className="absolute inset-0 m-auto w-[25%] h-[25%] bg-[#f8fafc]/80 rounded-full flex items-center justify-center backdrop-blur-sm z-10 border border-gray-100 dark:border-slate-700">
                             <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-slate-600" strokeWidth={1.5} />
                           </div>
                        </div>
                      </>
                    )}

                  </div>
               </div>

            </div>

      </div>
    </FacultyLayout>
  );
};

export default CreateSession;
