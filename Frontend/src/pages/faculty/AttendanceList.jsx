import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import FacultyLayout from '../../components/FacultyLayout';
import { 
  ChevronRight, Eye, CalendarDays, BookOpen, Clock, Users, FileText,
  Search, Download, Filter, X, Trash2, FileSpreadsheet
} from 'lucide-react';
import ExcelJS from 'exceljs';

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

  const handleExportXLSX = async () => {
    if (!students || students.length === 0) {
      alert("No data available to export for this session.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Define Columns
    worksheet.columns = [
      { header: 'Registration Number', key: 'regNo', width: 22 },
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Course / Topic', key: 'courseTopic', width: 35 },
      { header: 'Branch', key: 'branch', width: 15 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Program', key: 'program', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 12 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Dark blue/gray background
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Data Rows
    students.forEach(record => {
      const student = record.studentId || {};
      const markedDate = record.markedAt ? new Date(record.markedAt).toLocaleDateString() : date;
      const markedTime = record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : time;

      const row = worksheet.addRow({
        regNo: student.enrollmentId || "N/A",
        name: student.name || "Unknown",
        courseTopic: `${session.courseName} - ${session.topic}`,
        branch: student.branch || (student.department && student.department[0]) || "N/A",
        semester: student.semester || "N/A",
        program: (student.program && student.program[0]) || "N/A",
        date: markedDate,
        time: markedTime,
        status: record.status || "Absent"
      });

      // Apply Conditional Styling to Status Cell (Column 9)
      const statusCell = row.getCell(9);
      const nameCell = row.getCell(2);
      
      statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      if (record.status === 'Present') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF22C55E' } // Green-500
        };
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEF4444' } // Red-500
        };
        // Also make the student's NAME red for absent students as requested
        nameCell.font = { color: { argb: 'FFEF4444' }, bold: true };
      }
      statusCell.alignment = { horizontal: 'center' };
    });

    // Generate and Download File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `Attendance_Report_${session.sessionCode}_${date.replace(/\//g, '-')}.xlsx`;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors bg-transparent border-b border-white/5 dark:border-white/5">
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
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? (
                   <span className="text-xs text-gray-400 dark:text-slate-500">Loading...</span>
                ) : students.length > 0 && students.some(r => r.status === "Present") ? (
                   students.filter(r => r.status === "Present").map(r => (
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

             {/* XLSX Export Button */}
             <button 
                onClick={handleExportXLSX}
                className="ml-auto flex flex-col items-center gap-1.5 p-3 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-2xl transition-all group shrink-0 border border-transparent hover:border-green-200 dark:hover:border-green-500/20"
                title="Download XLSX Report"
             >
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <FileText className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter group-hover:text-green-600">Export</span>
             </button>
          </div>
      </td>
    </tr>
  )
}

const AttendanceList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Subjects');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse]);

  const courses = ['All Subjects', ...new Set(sessions.map(s => s.courseName))];

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'All Subjects' || s.courseName === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalSessions = sessions.length;
  const studentsRecorded = sessions.reduce((acc, curr) => acc + (curr.presentCount || 0), 0);
  const totalExpected = sessions.reduce((acc, curr) => acc + (curr.totalCount || 60), 0);
  const averageAttendance = totalExpected > 0 ? ((studentsRecorded / totalExpected) * 100).toFixed(1) + "%" : "0%";

  const handleGenerateReport = async () => {
    if (!sessions || sessions.length === 0) {
      alert("No sessions available to generate a report.");
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('All Sessions Summary');

    // Define Columns
    worksheet.columns = [
      { header: 'Session ID', key: 'sessionCode', width: 15 },
      { header: 'Course Name', key: 'courseName', width: 25 },
      { header: 'Topic', key: 'topic', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 12 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Expected', key: 'total', width: 10 },
      { header: 'Attendance Rate', key: 'rate', width: 18 }
    ];

    // Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Data Rows
    sessions.forEach(session => {
      const dateObj = new Date(session.createdAt);
      const sessionDate = !isNaN(dateObj) ? dateObj.toLocaleDateString() : 'N/A';
      const sessionTime = !isNaN(dateObj) ? dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
      
      const present = session.presentCount || 0;
      const total = session.totalCount || 0;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      const row = worksheet.addRow({
        sessionCode: session.sessionCode,
        courseName: session.courseName,
        topic: session.topic,
        date: sessionDate,
        time: sessionTime,
        present: present,
        total: total,
        rate: `${rate}%`
      });

      // Apply Conditional Styling to Rate Cell (Column 8)
      const rateCell = row.getCell(8);
      rateCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      if (rate >= 80) {
        rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } }; // Green
      } else if (rate >= 50) {
        rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } }; // Orange
      } else {
        rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }; // Red
      }
      rateCell.alignment = { horizontal: 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `Faculty_Master_Attendance_Report_${today}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
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
              <div className="glass-card-3d p-6 flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <CalendarDays className="w-6 h-6 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 dark:text-white tracking-tight">{totalSessions}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Total Sessions</p>
                 </div>
              </div>
              <div className="glass-card-3d p-6 flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <Users className="w-6 h-6 text-green-500" strokeWidth={2.5}/>
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 dark:text-white tracking-tight">{studentsRecorded}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Students Recorded</p>
                 </div>
              </div>
              <div className="glass-card-3d p-6 flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <BookOpen className="w-6 h-6 text-orange-500" strokeWidth={2.5}/>
                 </div>
                 <div>
                   <h4 className="text-[26px] leading-none font-black text-gray-900 dark:text-white tracking-tight">{averageAttendance}</h4>
                   <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Average Attendance</p>
                 </div>
              </div>
              <div className="glass-card-3d p-6 flex items-center gap-5">
                 <div className="w-[52px] h-[52px] rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 shadow-inner">
                   <FileText className="w-6 h-6 text-indigo-500" strokeWidth={2.5}/>
                 </div>
                  <div className="w-full">
                     <button onClick={handleGenerateReport} className="w-full py-2 bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] border-none text-[13px] font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                         <FileSpreadsheet className="w-4 h-4" />
                         Master Report
                     </button>
                  </div>
              </div>
            </div>

            {/* List Table Area */}
            <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden hover:shadow-[0_32px_64px_rgba(0,0,0,0.2)] transition-all duration-700">
              <div className="p-7 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-transparent">
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" strokeWidth={2.5} />
                    <input 
                      type="text"
                      placeholder="Search by subject name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 dark:border-slate-700 rounded-[14px] text-[13.5px] font-bold text-gray-700 dark:text-slate-300 placeholder-gray-400 focus:outline-none focus:bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      <select 
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[14px] text-[13px] font-bold text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer hover:bg-gray-50 dark:bg-slate-800/50 transition-colors shadow-sm min-w-[140px]"
                      >
                          {courses.map(course => (
                              <option key={course} value={course}>{course}</option>
                          ))}
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
                  <button onClick={handleGenerateReport} className="w-full sm:w-auto flex items-center justify-center shrink-0 gap-2.5 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none rounded-[14px] text-[13.5px] font-bold transition-all shadow-lg hover:shadow-green-500/25 active:scale-95">
                    <FileSpreadsheet className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    <span>Export All XLSX</span>
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
                    ) : paginatedSessions.length > 0 ? (
                      paginatedSessions.map(session => (
                        <SessionRow 
                          key={session._id} 
                          session={session} 
                          fetchSessions={fetchSessions}
                        />
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-400 dark:text-slate-500 font-bold">No sessions found matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50">
                <p className="text-[13px] font-bold text-gray-500 dark:text-slate-400">
                  Showing {filteredSessions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSessions.length)} of {filteredSessions.length} sessions
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[13px] font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="px-5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[13px] font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>



      </div>
    </FacultyLayout>
  );
};

export default AttendanceList;

