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
  const filtered = historyList.filter(r =>
    r.sessionId?.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    r.sessionId?.topic?.toLowerCase().includes(search.toLowerCase())
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
      const tableRows = historyList.map((r, idx) => [
        `${idx + 1}`,
        r.sessionId?.courseName || '-',
        r.sessionId?.topic || '-',
        r.sessionId?.facultyId?.name || 'Unknown',
        new Date(r.markedAt).toLocaleDateString(),
        new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'Present',
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
          6: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' },
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
    const rows = historyList.map((r, i) => [
      i + 1,
      `"${r.sessionId?.courseName || ''}"`,
      `"${r.sessionId?.topic || ''}"`,
      `"${r.sessionId?.facultyId?.name || 'Unknown'}"`,
      new Date(r.markedAt).toLocaleDateString(),
      new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      'Present',
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
            <h1 className="text-xl sm:text-[24px] font-extrabold text-gray-900 tracking-tight">Attendance History</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 mt-0.5 font-medium">Review your academic attendance records.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              disabled={historyList.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-300 rounded-xl text-[12px] font-semibold text-white cursor-not-allowed opacity-50 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">PDF Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Attendance Rate', value: `${analytics.overallAttendanceRate}%`, sub: 'Overall Average', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Total Sessions', value: analytics.totalSessions, sub: '', icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Present Days', value: analytics.totalPresentDays, sub: '', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Absent Days', value: absentDays, sub: analytics.overallAttendanceRate < 75 ? 'Low Attendance!' : '', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[11px] sm:text-[12px] font-bold text-gray-500">{label}</p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">{value}</p>
                  {sub && <p className={`text-[10px] font-semibold mt-1 ${sub.includes('Low') ? 'text-red-500' : 'text-gray-400'}`}>{sub}</p>}
                </div>
                <div className={`${bg} w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Records Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.5} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by subject..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 focus:outline-none cursor-pointer transition-all">
                  <option>All Subjects</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2.5} />
              </div>
              <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
                <Filter className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Course / Topic', 'Faculty', 'Date & Time', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-bold text-gray-900">{record.sessionId?.courseName}</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">{record.sessionId?.topic}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-semibold text-gray-700">{record.sessionId?.facultyId?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[12px] font-bold text-gray-900">{new Date(record.markedAt).toLocaleDateString()}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[11px] font-bold border border-green-100">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {filtered.map((record) => (
                  <div key={record._id} className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{record.sessionId?.courseName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{record.sessionId?.topic}</p>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(record.markedAt).toLocaleDateString()} @ {new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100 shrink-0">
                      Present
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 text-center flex flex-col items-center">
              <CalendarDays className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-[14px] font-bold text-gray-800">No attendance records found.</h3>
              <p className="text-[12px] text-gray-500 mt-1">You haven't attended any sessions yet.</p>
            </div>
          )}
        </div>

        {/* Bottom Alert */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-blue-600">Need to dispute a record?</h4>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Contact your course faculty to request a correction.</p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-2 bg-white border border-blue-200 text-blue-600 text-[12px] font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Contact Support
          </button>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-2 flex items-center justify-center">
          <p className="text-[11px] font-medium text-gray-400">© 2026 Attendify College Solutions. All rights reserved.</p>
        </footer>
      </div>
    </StudentLayout>
  );
};

export default History;
