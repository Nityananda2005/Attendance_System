import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import FacultyLayout from '../../components/FacultyLayout';
import { 
  ChevronRight, Eye, CalendarDays, BookOpen, Clock, Users, FileText,
  Search, Download, Filter, X, Trash2
} from 'lucide-react';

const SessionRow = ({ session, fetchSessions }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/attendance/session/${session._id}`);
        setStudents(res.data);
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) {
      fetchStudents();
    }
  }, [session]);

  const handleDeleteAttendance = async (recordId) => {
    if(!window.confirm("Delete this attendance record?")) return;
    try {
      await api.delete(`/attendance/${recordId}`);
      setStudents(prev => prev.filter(r => r._id !== recordId));
      if (fetchSessions) {
        fetchSessions(); // Refresh overall counts
      }
    } catch(err) {
      console.error(err);
      alert("Failed to delete attendance");
    }
  };

  const present = session.presentCount || 0;
  const total = session.totalCount || 60;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  const date = new Date(session.createdAt).toLocaleDateString();
  const time = new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors bg-white dark:bg-slate-800">
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="text-[13.5px] font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">{session.sessionCode}</span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div>
           <p className="text-[13.5px] font-bold text-gray-800 dark:text-slate-200 mb-0.5 tracking-tight">{session.courseName}</p>
           <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400">{session.topic}</p>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            <span className="text-[13px] font-bold text-gray-700 dark:text-slate-300">{date}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            <span className="text-[13px] font-bold text-gray-700 dark:text-slate-300">{time}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-4">
           <div className="w-[100px] bg-gray-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} 
                style={{width: `${percentage}%`}}
              ></div>
           </div>
           <span className="text-[13px] font-black text-gray-900 dark:text-white">{present}/{total}</span>
        </div>
      </td>
      <td className="px-6 py-3 max-w-[400px]">
         <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
            {loading ? (
               <span className="text-xs text-gray-400 dark:text-slate-500">Loading...</span>
            ) : students.length > 0 ? (
               students.map(r => (
                  <div key={r._id} className="flex flex-col gap-1.5 items-center justify-center bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-[14px] px-4 py-2.5 min-w-[140px] shrink-0 shadow-sm">
                     <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate w-full text-center tracking-tight">{r.studentId?.name || "Unknown"}</span>
                     <div className="flex items-center gap-2.5 mt-0.5">
                        <span className="text-[10px] font-extrabold text-green-600 bg-green-100/60 border border-green-200 px-2.5 py-1 rounded-md uppercase tracking-wider">Present</span>
                        <button onClick={() => handleDeleteAttendance(r._id)} className="text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:bg-red-500/10 transition-colors p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                           <X className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                     </div>
                  </div>
               ))
            ) : (
               <span className="text-[13px] text-gray-400 dark:text-slate-500 font-semibold px-2">No students marked</span>
            )}
         </div>
      </td>
    </tr>
  )
}

const AttendanceList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions/faculty');
      setSessions(res.data);
    } catch (error) {
      console.error("Error fetching faculty sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllHistory = async () => {
    if (!window.confirm("Are you SURE you want to delete ALL sessions and attendance history? This action cannot be undone.")) return;
    try {
      await api.delete('/sessions/faculty/all');
      alert("All history deleted successfully.");
      fetchSessions();
    } catch (error) {
      console.error(error);
      alert("Failed to delete all history.");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const totalSessions = sessions.length;
  const studentsRecorded = sessions.reduce((acc, curr) => acc + (curr.presentCount || 0), 0);
  const totalExpected = sessions.reduce((acc, curr) => acc + (curr.totalCount || 60), 0);
  const averageAttendance = totalExpected > 0 ? ((studentsRecorded / totalExpected) * 100).toFixed(1) + "%" : "0%";

  const handleGenerateReport = () => {
    if (!sessions || sessions.length === 0) {
      alert("No sessions available to generate a report.");
      return;
    }
    
    const headers = ["Session ID", "Course Name", "Topic", "Date", "Time", "Present Count", "Expected Total", "Attendance Rate"];
    
    const csvRows = sessions.map(session => {
      const dateObj = new Date(session.createdAt);
      const date = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : 'N/A';
      const time = !isNaN(dateObj) ? dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
      
      const present = session.presentCount || 0;
      const total = session.totalCount || 60;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
      
      return [
        session.sessionCode,
        escapeCsv(session.courseName),
        escapeCsv(session.topic),
        date,
        time,
        present,
        total,
        `${rate}%`
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    const safeDateString = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Faculty_Attendance_Report_${safeDateString}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FacultyLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Breadcrumbs & Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-[11px] font-black uppercase tracking-widest">
                <span className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400 cursor-pointer transition-colors">Faculty Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                <span className="text-gray-700 dark:text-slate-300">Session History</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Attendance Records</h1>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <CalendarDays className="w-6 h-6 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 dark:text-white tracking-tight">{totalSessions}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Total Sessions</p>
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <Users className="w-6 h-6 text-green-500" strokeWidth={2.5}/>
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 dark:text-white tracking-tight">{studentsRecorded}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Students Recorded</p>
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <BookOpen className="w-6 h-6 text-orange-500" strokeWidth={2.5}/>
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 dark:text-white tracking-tight">{averageAttendance}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Average Attendance</p>
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-inner">
                   <FileText className="w-6 h-6 text-indigo-500" strokeWidth={2.5}/>
                 </div>
                 <div className="w-full">
                    <button onClick={handleGenerateReport} className="w-full py-2 bg-white dark:bg-slate-800 border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 text-[13px] font-bold rounded-xl transition-colors">
                        Generate Report
                    </button>
                 </div>
              </div>
            </div>

            {/* List Table Area */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-7 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white dark:bg-slate-800">
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" strokeWidth={2.5} />
                    <input 
                      type="text"
                      placeholder="Search sessions or topics..."
                      className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 dark:border-slate-700 rounded-[14px] text-[13.5px] font-bold text-gray-700 dark:text-slate-300 placeholder-gray-400 focus:outline-none focus:bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      <select className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[14px] text-[13px] font-bold text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer hover:bg-gray-50 dark:bg-slate-800/50 transition-colors shadow-sm min-w-[140px]">
                          <option>All Courses</option>
                          <option>CS402</option>
                          <option>CS405</option>
                      </select>
                      <button className="flex items-center justify-center p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 rounded-[14px] transition-all shadow-sm shrink-0">
                          <Filter className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button onClick={handleDeleteAllHistory} disabled={sessions.length === 0} className="w-full sm:w-auto flex items-center justify-center shrink-0 gap-2.5 px-6 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 hover:bg-red-100 text-red-600 rounded-[14px] text-[13.5px] font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    <span>Delete All</span>
                  </button>
                  <button onClick={handleGenerateReport} className="w-full sm:w-auto flex items-center justify-center shrink-0 gap-2.5 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50 text-gray-800 dark:text-slate-200 rounded-[14px] text-[13.5px] font-bold transition-all shadow-sm">
                    <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    <span>Export All CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50">
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Session ID</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Course / Topic</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Date</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Time Window</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Attendance Rate</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-slate-500 tracking-widest uppercase border-b border-gray-100 dark:border-slate-700">Students Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400 dark:text-slate-500 font-bold">Loading records...</td></tr>
                    ) : sessions.length > 0 ? (
                      sessions.map(session => (
                        <SessionRow 
                          key={session._id}
                          session={session}
                          fetchSessions={fetchSessions}
                        />
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400 dark:text-slate-500 font-bold">No sessions found. Create one from the dashboard.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50">
                <p className="text-[13px] font-bold text-gray-500 dark:text-slate-400">Showing {sessions.length} sessions</p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[13px] font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400 rounded-xl transition-colors shadow-sm">Previous</button>
                  <button className="px-5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[13px] font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:text-blue-400 rounded-xl transition-colors shadow-sm">Next</button>
                </div>
              </div>
            </div>



      </div>
    </FacultyLayout>
  );
};

export default AttendanceList;

