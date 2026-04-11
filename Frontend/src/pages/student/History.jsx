import React, { useState, useEffect, useContext } from 'react';
import StudentLayout from '../../components/StudentLayout';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Download, FileText, CheckCircle2, CalendarDays,
  XCircle, Search, ChevronDown, Filter, Clock
} from 'lucide-react';

const History = () => {
  const [historyList, setHistoryList] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    totalPresentDays: 0,
    overallAttendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const [historyRes, analyticsRes] = await Promise.all([
          api.get('/attendance/student/history'),
          api.get('/attendance/student/analytics')
        ]);
        setHistoryList(historyRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, []);

  const absentDays = Math.max(0, (analytics.totalSessions || 0) - (analytics.totalPresentDays || 0));
  
  // Get unique subjects for dropdown (Case-insensitive)
  const rawSubjects = historyList.map(r => r.sessionId?.courseName?.trim()).filter(Boolean);
  const uniqueSubjects = ['All Subjects', ...Array.from(new Set(rawSubjects.map(s => s.toLowerCase()))).map(lower => {
    return rawSubjects.find(s => s.toLowerCase() === lower);
  })];

  const filtered = historyList.filter(r => {
    const course = r.sessionId?.courseName || '';
    const matchesSearch = course.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || course.toLowerCase() === selectedSubject.toLowerCase();
    
    return matchesSearch && matchesSubject;
  });

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSubject]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ─── PDF Download ────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const now = new Date();

      // ── Blue header ──
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Attendify', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Official Attendance Report', 14, 22);
      doc.text(
        `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        pageWidth - 14, 22, { align: 'right' }
      );

      // ── Student info ──
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${user?.name || 'Student'}`, 14, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Email: ${user?.email || 'N/A'}`, 14, 47);
      doc.text(
        `Department: ${user?.department || 'N/A'}   Semester: ${user?.semester || 'N/A'}`,
        14, 53
      );

      // ── Horizontal line ──
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 58, pageWidth - 14, 58);

      // ── Stats row (plain rects — no roundedRect) ──
      const stats = [
        { label: 'Attendance Rate', value: `${analytics.overallAttendanceRate}%` },
        { label: 'Total Sessions',  value: `${analytics.totalSessions}` },
        { label: 'Present Days',    value: `${analytics.totalPresentDays}` },
        { label: 'Absent Days',     value: `${absentDays}` },
      ];
      const boxW = (pageWidth - 28 - 9) / 4;
      const boxY = 62;
      stats.forEach((s, i) => {
        const x = 14 + i * (boxW + 3);
        // background
        doc.setFillColor(239, 246, 255);
        doc.rect(x, boxY, boxW, 18, 'F');
        // border
        doc.setDrawColor(191, 219, 254);
        doc.setLineWidth(0.3);
        doc.rect(x, boxY, boxW, 18);
        // value
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(s.value, x + boxW / 2, boxY + 10, { align: 'center' });
        // label
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(s.label, x + boxW / 2, boxY + 16, { align: 'center' });
      });

      // ── Attendance table ──
      const tableRows = filtered.map((r, idx) => [
        `${idx + 1}`,
        r.sessionId?.courseName || '-',
        r.sessionId?.topic || '-',
        r.sessionId?.facultyId?.name || 'Unknown',
        r.markedAt ? new Date(r.markedAt).toLocaleDateString() : new Date(r.sessionId?.createdAt).toLocaleDateString(),
        r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Missed',
        r.status,
      ]);

      autoTable(doc, {
        startY: 86,
        head: [['#', 'Course', 'Topic', 'Faculty', 'Date', 'Time', 'Status']],
        body: tableRows,
        styles: {
          fontSize: 8.5,
          cellPadding: 3.5,
          font: 'helvetica',
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8.5,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center', fontStyle: 'bold' },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14, bottom: 18 },
      });

      // ── Page footers (loop after all pages rendered) ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${p} of ${totalPages}  \u2022  \u00a9 2026 Attendify College Solutions`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      // ── Save ──
      const safeName = (user?.name || 'Student').replace(/\s+/g, '_');
      const dateStr = now.toISOString().slice(0, 10);
      doc.save(`Attendance_Report_${safeName}_${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      import('react-hot-toast').then(({ toast }) => toast.error('PDF generation failed. Please try again.'));
    }
  };

  // ─── CSV Download ────────────────────────────────────────────────
  const handleDownloadCSV = () => {
    const header = ['#', 'Course', 'Topic', 'Faculty', 'Date', 'Time', 'Status'];
    const rows = filtered.map((r, i) => [
      i + 1,
      `"${r.sessionId?.courseName || ''}"`,
      `"${r.sessionId?.topic || ''}"`,
      `"${r.sessionId?.facultyId?.name || 'Unknown'}"`,
      r.markedAt ? new Date(r.markedAt).toLocaleDateString() : new Date(r.sessionId?.createdAt).toLocaleDateString(),
      r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Missed',
      r.status,
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${user?.name?.replace(/\s+/g, '_') || 'Student'}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudentLayout title="Attendance History">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight">Attendance History</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-slate-400 mt-0.5 font-medium">Review your academic attendance records.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              disabled={historyList.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[12px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:bg-slate-800/50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={historyList.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-[12px] font-semibold text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">PDF Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Attendance Rate', value: `${analytics.overallAttendanceRate}%`, sub: 'Overall Average', icon: CheckCircle2, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Total Sessions', value: analytics.totalSessions, sub: '', icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            { label: 'Present Days', value: analytics.totalPresentDays, sub: '', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
            { label: 'Absent Days', value: absentDays, sub: analytics.overallAttendanceRate < 75 ? 'Low Attendance!' : '', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card-3d p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[11px] sm:text-[12px] font-bold text-gray-500 dark:text-slate-400">{label}</p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">{value}</p>
                  {sub && <p className={`text-[10px] font-semibold mt-1 ${sub.includes('Low') ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`}>{sub}</p>}
                </div>
                <div className={`${bg} w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Records Table */}
        <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden hover:shadow-[0_32px_64px_rgba(0,0,0,0.2)] transition-all duration-700">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-50 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" strokeWidth={2.5} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by subject..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-medium text-gray-700 dark:text-slate-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:bg-slate-800 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[12px] font-semibold text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer transition-all"
                >
                  {uniqueSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" strokeWidth={2.5} />
              </div>
              <button className="p-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:bg-slate-800/50 transition-colors shrink-0">
                <Filter className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                    <tr>
                      {['Course / Topic', 'Faculty', 'Date & Time', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-gray-500 dark:text-slate-400 tracking-wider uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors bg-transparent">
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white">{record.sessionId?.courseName}</p>
                          <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">{record.sessionId?.topic}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-semibold text-gray-700 dark:text-slate-300">{record.sessionId?.facultyId?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[12px] font-bold text-gray-900 dark:text-white">{record.markedAt ? new Date(record.markedAt).toLocaleDateString() : new Date(record.sessionId.createdAt).toLocaleDateString()}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Missed class'}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {record.status === 'Absent' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-[11px] font-bold border border-red-100 dark:border-red-500/20">
                              <XCircle className="w-3 h-3" /> Absent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-lg text-[11px] font-bold border border-green-100 dark:border-green-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Present
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {paginated.map((record) => (
                  <div key={record._id} className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{record.sessionId?.courseName}</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{record.sessionId?.topic}</p>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.markedAt ? `${new Date(record.markedAt).toLocaleDateString()} @ ${new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Missed Class'}
                      </p>
                    </div>
                    {record.status === 'Absent' ? (
                       <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg border border-red-100 dark:border-red-500/20 shrink-0">
                         Absent
                       </span>
                    ) : (
                       <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-lg border border-green-100 dark:border-green-500/20 shrink-0">
                         Present
                       </span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination Footer */}
              <div className="p-4 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400">
                  Showing {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} sessions
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[11px] font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[11px] font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-10 text-center flex flex-col items-center">
              <CalendarDays className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
              <h3 className="text-[14px] font-bold text-gray-800 dark:text-slate-200">No attendance records found.</h3>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">You haven't attended any sessions yet.</p>
            </div>
          )}
        </div>

        {/* Bottom Alert */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-blue-600 dark:text-blue-400">Need to dispute a record?</h4>
              <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">Contact your course faculty to request a correction.</p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 text-blue-600 dark:text-blue-400 text-[12px] font-bold rounded-xl hover:bg-blue-50 dark:bg-blue-500/10 transition-colors">
            Contact Support
          </button>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-2 flex items-center justify-center">
          <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500">© 2026 Attendify College Solutions. All rights reserved.</p>
        </footer>
      </div>
    </StudentLayout>
  );
};

export default History;
