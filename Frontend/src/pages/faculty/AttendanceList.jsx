import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import FacultyLayout from '../../components/FacultyLayout';
import { 
  ChevronRight, Eye, CalendarDays, BookOpen, Clock, Users, FileText,
  Search, Download, Filter
} from 'lucide-react';




const SessionRow = ({ sessionId, course, title, date, time, present, total }) => {
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return (
    <tr className="hover:bg-gray-50/50 transition-colors bg-white">
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="text-[13.5px] font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">{sessionId}</span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div>
           <p className="text-[13.5px] font-bold text-gray-800 mb-0.5 tracking-tight">{course}</p>
           <p className="text-[12px] font-medium text-gray-500">{title}</p>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[13px] font-bold text-gray-700">{date}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[13px] font-bold text-gray-700">{time}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-4">
           <div className="w-[100px] bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} 
                style={{width: `${percentage}%`}}
              ></div>
           </div>
           <span className="text-[13px] font-black text-gray-900">{present}/{total}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap text-right">
         <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[12px] rounded-lg transition-colors shadow-sm">
            <Eye className="w-3.5 h-3.5" strokeWidth={2.5}/>
            Review
         </button>
      </td>
    </tr>
  )
}

const AttendanceList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      // Use YYYY-MM-DD format for reliability in CSVs
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
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Faculty Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-gray-700">Session History</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Records</h1>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mb-8">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-inner">
                   <CalendarDays className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 tracking-tight">{totalSessions}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1.5">Total Sessions</p>
                 </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-green-50 flex items-center justify-center shrink-0 shadow-inner">
                   <Users className="w-6 h-6 text-green-500" strokeWidth={2.5}/>
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 tracking-tight">{studentsRecorded}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1.5">Students Recorded</p>
                 </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 shadow-inner">
                   <BookOpen className="w-6 h-6 text-orange-500" strokeWidth={2.5}/>
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 tracking-tight">{averageAttendance}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1.5">Average Attendance</p>
                 </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-inner">
                   <FileText className="w-6 h-6 text-indigo-500" strokeWidth={2.5}/>
                 </div>
                 <div className="w-full">
                    <button onClick={handleGenerateReport} className="w-full py-2 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 text-[13px] font-bold rounded-xl transition-colors">
                        Generate Report
                    </button>
                 </div>
              </div>
            </div>

            {/* List Table Area */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-7 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white">
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.5} />
                    <input 
                      type="text"
                      placeholder="Search sessions or topics..."
                      className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-[14px] text-[13.5px] font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      <select className="px-4 py-3 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm min-w-[140px]">
                          <option>All Courses</option>
                          <option>CS402</option>
                          <option>CS405</option>
                      </select>
                      <button className="flex items-center justify-center p-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-[14px] transition-all shadow-sm shrink-0">
                          <Filter className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      </button>
                  </div>
                </div>
                <button onClick={handleGenerateReport} className="flex items-center justify-center shrink-0 gap-2.5 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-[14px] text-[13.5px] font-bold transition-all shadow-sm">
                  <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  <span>Export All CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100">Session ID</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100">Course / Topic</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100">Date</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100">Time Window</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100">Attendance Rate</th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400 font-bold">Loading records...</td></tr>
                    ) : sessions.length > 0 ? (
                      sessions.map(session => (
                        <SessionRow 
                          key={session._id}
                          sessionId={session.sessionCode} 
                          course={session.courseName} 
                          title={session.topic} 
                          date={new Date(session.createdAt).toLocaleDateString()} 
                          time={new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          present={session.presentCount || 0} 
                          total={session.totalCount || 60} 
                        />
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400 font-bold">No sessions found. Create one from the dashboard.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 flex items-center justify-between bg-gray-50/30">
                <p className="text-[13px] font-bold text-gray-500">Showing {sessions.length} sessions</p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-white border border-gray-200 text-[13px] font-bold text-gray-400 hover:text-gray-600 rounded-xl transition-colors shadow-sm">Previous</button>
                  <button className="px-5 py-2 bg-white border border-gray-200 text-[13px] font-bold text-gray-900 hover:text-blue-600 rounded-xl transition-colors shadow-sm">Next</button>
                </div>
              </div>
            </div>

      </div>
    </FacultyLayout>
  );
};

export default AttendanceList;
