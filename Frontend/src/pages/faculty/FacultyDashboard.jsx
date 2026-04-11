import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FacultyLayout from '../../components/FacultyLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { 
  Activity, History,
  Plus, Users, TrendingUp, Clock, 
  QrCode as QrCodeIcon, Download, Search, ShieldCheck, MapPin, MoreHorizontal, BookOpen
} from 'lucide-react';


const StudentRow = ({ name, id, time, loc, verified, image }) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-800">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3.5">
          <div className="w-[34px] h-[34px] rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 shadow-sm">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
          <span className="text-[13.5px] font-bold text-gray-900 dark:text-white">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-gray-500 dark:text-slate-400">{id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-[13px] font-black text-gray-900 dark:text-white">{time}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {loc !== 'N/A' ? (
             <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 fill-blue-500/20" strokeWidth={2.5}/>
          ) : (
             <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" strokeWidth={2.5} />
          )}
          <span className={`text-[12px] font-bold ${loc !== 'N/A' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>{loc}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {verified ? (
          <div className="flex items-center gap-2 text-gray-800 dark:text-slate-200">
             <ShieldCheck className="w-[18px] h-[18px] text-gray-800 dark:text-slate-200" strokeWidth={2.5} />
             <span className="text-[12.5px] font-bold">Verified</span>
          </div>
        ) : (
          <span className="text-[12.5px] font-bold text-gray-500 dark:text-slate-400">Manual</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 dark:text-slate-500">
         <button className="p-1 hover:bg-gray-100 dark:bg-slate-700/50 rounded transition-colors text-right inline-flex justify-end w-full">
            <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-slate-500" />
         </button>
      </td>
    </tr>
  )
}

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [liveStudents, setLiveStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time ticker for active session
  const [timeElapsed, setTimeElapsed] = useState("00:00");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/sessions/faculty');
        const sessionList = res.data;
        setSessions(sessionList);
        
        // Find most recent active session
        const currentActive = sessionList.find(s => s.status === 'active');
        if (currentActive) {
          setActiveSession(currentActive);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Poll attendance if there is an active session
  useEffect(() => {
    let intervalId;
    
    const fetchLiveAttendance = async () => {
      if (!activeSession) return;
      try {
        const res = await api.get(`/attendance/session/${activeSession._id}`);
        setLiveStudents(res.data);
      } catch (error) {
         console.error("Error fetching live attendance:", error);
      }
    };

    if (activeSession) {
      // Fetch immediately
      fetchLiveAttendance();
      // Poll every 5 seconds
      intervalId = setInterval(fetchLiveAttendance, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeSession]);

  // Update time elapsed ticker for active session
  useEffect(() => {
    let timer;
    if (activeSession) {
      timer = setInterval(() => {
        const start = new Date(activeSession.createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - start) / 1000);
        
        const minutes = Math.floor(diffInSeconds / 60).toString().padStart(2, '0');
        const seconds = (diffInSeconds % 60).toString().padStart(2, '0');
        setTimeElapsed(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => {
       if (timer) clearInterval(timer);
    }
  }, [activeSession]);

  const handleEndSession = async () => {
     try {
        await api.put(`/sessions/${activeSession._id}/close`);
        toast.success("Session closed successfully");
        
        // Update local state without fetching again to prevent lag
        setActiveSession(null);
        setSessions(prev => prev.map(s => s._id === activeSession._id ? { ...s, status: 'completed' } : s));
     } catch (error) {
        toast.error("Failed to end session");
     }
  };

  // Derive top stats with defensive checks
  let totalLogs = 0;
  let totalTarget = 0;
  let activeCount = 0;

  if (Array.isArray(sessions)) {
    sessions.forEach(s => {
      if (!s) return;
      totalLogs += s.presentCount || 0;
      totalTarget += s.totalCount || 60; // Estimated 60 per class max
      if (s.status === 'active') activeCount++;
    });
  }

  const avgAttendance = totalTarget > 0 ? ((totalLogs / totalTarget) * 100).toFixed(1) : 0;
  const uniqueCourses = Array.isArray(sessions) 
    ? [...new Set(sessions.map(s => s?.courseId).filter(Boolean))].length 
    : 0;

  if (loading) {
    return (
      <FacultyLayout>
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Faculty Dashboard</h1>
                <p className="text-[14px] text-gray-500 dark:text-slate-400 mt-1 font-medium">Manage your sessions and monitor student attendance in real-time.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/attendance-list')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:bg-slate-800/50 transition-all shadow-sm">
                  <History className="w-[15px] h-[15px]" strokeWidth={2.5} />
                  Past Sessions
                </button>
                <button onClick={() => navigate('/create-session')} className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 border border-transparent rounded-xl text-[13px] font-bold text-white transition-all shadow-md shadow-blue-500/20 w-fit">
                  <Plus className="w-[16px] h-[16px]" strokeWidth={2.5} />
                  Create New Session
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card-3d p-5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-blue-50 dark:bg-blue-500/10/80 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 px-2 py-1 rounded-md">Dynamic</span>
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest mb-1.5 uppercase">Total Logs (Historical)</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{totalLogs}</h3>
                <p className="text-[12px] font-semibold text-gray-400 dark:text-slate-500">Across {uniqueCourses} unique courses</p>
              </div>

              <div className="glass-card-3d p-5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-blue-50 dark:bg-blue-500/10/80 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest mb-1.5 uppercase">Avg. Flow Rate</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{avgAttendance}%</h3>
                <p className="text-[12px] font-semibold text-gray-400 dark:text-slate-500">Computed via capacity</p>
              </div>

              <div className="glass-card-3d p-5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-blue-50 dark:bg-blue-500/10/80 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest mb-1.5 uppercase">Active Currently</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{activeCount}</h3>
                <p className="text-[12px] font-semibold text-gray-400 dark:text-slate-500">Sessions waiting for end</p>
              </div>

              <div className="glass-card-3d p-5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-blue-50 dark:bg-blue-500/10/80 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest mb-1.5 uppercase">Past Classes</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{sessions.length - activeCount}</h3>
                <p className="text-[12px] font-semibold text-gray-400 dark:text-slate-500">Lifetime instances</p>
              </div>
            </div>

            {/* Middle Section: Active Session & Quick Scan */}
            {activeSession ? (
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Active Session Left */}
                <div className="flex-1 glass-panel rounded-3xl p-7 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all duration-500">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3.5">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="text-[19px] font-extrabold text-gray-900 dark:text-white tracking-tight">Active Session: {activeSession.courseId}</h3>
                          <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">{activeSession.topic || activeSession.courseName}</p>
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] rounded-full uppercase tracking-widest shadow-sm">Live Focus</span>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mb-8">
                      <div className="bg-[#f8fafc] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-7 flex flex-col items-center justify-center text-center">
                        <h4 className="text-[40px] font-black text-[#1e40af] dark:text-blue-400 tracking-tighter mb-2 leading-none">{timeElapsed}</h4>
                        <p className="text-[11px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Time Elapsed</p>
                      </div>
                      <div className="bg-[#f8fafc] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-7 flex flex-col items-center justify-center text-center">
                        <h4 className="text-[40px] font-black text-gray-900 dark:text-white tracking-tighter mb-2 leading-none">{liveStudents.length}/{activeSession.totalCount || 60}</h4>
                        <p className="text-[11px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Students Present</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 rounded-xl font-bold transition-all shadow-sm cursor-default">
                      <QrCodeIcon className="w-5 h-5" strokeWidth={2.5}/>
                      Scan code from right panel
                    </button>
                    <button onClick={handleEndSession} className="flex-1 flex items-center justify-center py-3.5 bg-white dark:bg-slate-800 border-2 border-red-100 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:bg-red-500/10 hover:border-red-200 rounded-xl font-bold transition-all cursor-pointer">
                      End Live Session
                    </button>
                  </div>
                </div>

                {/* Quick Scan Right */}
                <div className="w-full lg:w-[360px] shrink-0 glass-panel rounded-3xl p-7 hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all duration-500">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white tracking-tight">Active Scan Point</h3>
                    <span className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 font-extrabold text-[10px] rounded-lg uppercase tracking-wider border border-green-200 shadow-sm">REAL QR</span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border-[2.5px] border-dashed dark:border-slate-700 border-gray-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center mb-5 min-h-[220px]">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
                         <QRCode value={activeSession.sessionCode} size={140} fgColor="#1e293b" />
                      </div>
                      <p className="text-[15px] font-black text-gray-900 dark:text-white tracking-wide bg-gray-100 dark:bg-slate-700/50 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">{activeSession.sessionCode}</p>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2.5 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 rounded-xl text-[13px] font-bold transition-all mb-4 shadow-sm cursor-not-allowed opacity-50">
                      <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      Download Image
                  </button>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center font-semibold px-4 leading-relaxed">
                    Have students scan this from the application to record GPS-backed presence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 border-2 border-dashed dark:border-slate-700 border-gray-200 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                 <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-5">
                    <BookOpen className="w-10 h-10 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
                 </div>
                 <h2 className="text-[20px] font-extrabold text-gray-900 dark:text-white mb-2">No Active Session</h2>
                 <p className="text-[14px] text-gray-500 dark:text-slate-400 font-medium max-w-sm mb-6">
                   You are currently not running any live attendance rounds. Open a new classroom instance to start accepting scans.
                 </p>
                 <Link to="/create-session" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-bold rounded-xl shadow-md transition-colors">
                    Instantiate Class Run
                 </Link>
              </div>
            )}

            {/* Live Attendance Table */}
            {activeSession && (
              <div className="glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">Live Real-time Log</h3>
                    <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span> 
                      Polling active attendees right now.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-slate-500" strokeWidth={2.5} />
                      <input 
                        type="text"
                        placeholder="Search roster..."
                        className="w-full sm:w-[260px] pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-gray-700 dark:text-slate-300 placeholder-gray-400 focus:outline-none focus:bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full border-b border-gray-100 dark:border-slate-700">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-white dark:bg-slate-800">
                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Student Identity</th>
                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Enrollment ID</th>
                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Check-In Time</th>
                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Geo-Status</th>
                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Verification</th>
                        <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700 text-right w-[100px]">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {liveStudents.length > 0 ? liveStudents.map(studentLog => (
                         <StudentRow 
                           key={studentLog._id}
                           name={studentLog.studentId?.name || "Unknown"} 
                           id={studentLog.studentId?.enrollmentId || "N/A"} 
                           time={new Date(studentLog.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                           loc={activeSession.location?.lat ? "Zone Bounds Verified" : "Radius N/A"} 
                           verified={true} 
                           image={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentLog.studentId?.name || "U")}&background=eff6ff&color=1d4ed8`} 
                         />
                      )) : (
                         <tr>
                           <td colSpan="6" className="py-8 text-center text-[13px] font-bold text-gray-400 dark:text-slate-500">
                             Awaiting first check-in...
                           </td>
                         </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
