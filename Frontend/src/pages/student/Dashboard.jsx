import React, { useState, useEffect, useContext } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Target, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  BookOpen, Book, QrCode, History, User, MoreVertical, MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          api.get('/attendance/student/analytics'),
          api.get('/attendance/student/history')
        ]);
        setAnalytics(analyticsRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const overallRate = analytics?.overallAttendanceRate || 0;
  const presentLogs = analytics?.totalPresentDays || 0;
  const totalClasses = analytics?.totalSessions || 0;
  const lowAttendanceCourses = analytics?.courseAttendance?.filter(c => c.rate < 75) || [];
  const strokeOffset = 251.2 - (251.2 * (overallRate / 100));
  const recentTimeline = history.slice(0, 5);

  return (
    <StudentLayout title="Dashboard">
      {/* Loading spinner inside layout (no layout flash) */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center h-full min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] font-semibold text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">

          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-0.5">
                Student Dashboard
              </h1>
              <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium">
                Welcome back, <span className="text-gray-900 font-bold">{user?.name || 'Student'}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {user?.semester && (
                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold border border-blue-100">
                  {user.semester}
                </span>
              )}
              {user?.department && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">
                  {user.department}
                </span>
              )}
            </div>
          </div>

          {/* ── Overall Progress Card ── */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-sm mb-5 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Progress */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-gray-100" strokeWidth="12" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    className={`${overallRate >= 75 ? 'stroke-blue-500' : 'stroke-orange-500'} transition-all duration-1000`}
                    strokeWidth="12" fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[28px] sm:text-[32px] font-extrabold text-gray-900 leading-none">{overallRate}%</span>
                  <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Overall</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left z-10">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">
                  {overallRate >= 75 ? "You're on track! 🎉" : overallRate >= 50 ? "Needs Improvement" : "Critical Action Required!"}
                </h2>
                <p className="text-[13px] text-gray-500 font-medium mb-4">
                  You've attended <span className="text-gray-900 font-bold">{presentLogs}</span> out of{' '}
                  <span className="text-gray-900 font-bold">{totalClasses}</span> evaluated sessions.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[12px] font-semibold border border-blue-100/50">
                    <TrendingUp className="w-3.5 h-3.5" /> Dynamic
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[12px] font-semibold border border-orange-100/50">
                    <Target className="w-3.5 h-3.5" /> Target: 75%
                  </div>
                </div>
                <Link
                  to="/mark-attendance"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Mark Today's Attendance
                </Link>
              </div>
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Present', value: presentLogs, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
              { label: 'Total', value: totalClasses, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Absent', value: Math.max(0, totalClasses - presentLogs), color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl p-3 sm:p-4 text-center`}>
                <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

            {/* Left: Subjects + Actions */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Subject Wise Progress
                </h3>
                <Link to="/history" className="text-[12px] font-bold text-blue-500 hover:text-blue-600 transition-colors">
                  View Log →
                </Link>
              </div>

              {/* Subject Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analytics?.courseAttendance?.length > 0 ? (
                  analytics.courseAttendance.map((course, idx) => (
                    <div key={idx} className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${course.rate >= 75 ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                          <Book className="w-4 h-4" />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-[14px] font-bold text-gray-900 mb-0.5 truncate">{course.courseName}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                        {course.present ?? '--'}/{course.total ?? '--'} sessions
                      </p>
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-gray-500">Attendance</span>
                        <span className={`text-lg font-extrabold ${course.rate >= 75 ? 'text-blue-500' : 'text-red-500'}`}>
                          {course.rate}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full ${course.rate >= 75 ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: `${course.rate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-gray-400">
                        <span>0%</span><span>75% threshold</span><span>100%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center text-center">
                    <BookOpen className="w-8 h-8 text-gray-300 mb-3" />
                    <h4 className="text-[14px] font-bold text-gray-900 mb-1">No Subject Data Yet</h4>
                    <p className="text-[12px] text-gray-500">Mark attendance in classes to see subjects here.</p>
                    <Link to="/mark-attendance" className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-[12px] font-bold transition-colors">
                      Start Attending
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: QrCode, label: 'SCAN QR', path: '/mark-attendance', color: 'text-blue-500', bg: 'bg-blue-50', border: 'hover:border-blue-400 hover:bg-blue-50' },
                  { icon: History, label: 'HISTORY', path: '/history', color: 'text-gray-500', bg: 'bg-gray-50', border: 'hover:border-gray-300 hover:bg-gray-50' },
                  { icon: User, label: 'PROFILE', path: '/profile', color: 'text-purple-500', bg: 'bg-purple-50', border: 'hover:border-purple-300 hover:bg-purple-50' },
                ].map(({ icon: Icon, label, path, color, bg, border }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`border-2 border-dashed border-gray-200 ${border} rounded-2xl py-3 sm:py-4 flex flex-col items-center gap-2 transition-all`}
                  >
                    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 tracking-wider">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Widgets */}
            <div className="space-y-5">

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentTimeline.length > 0 ? recentTimeline.map((log, pidx) => (
                    <div key={pidx} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-green-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-400">
                          {new Date(log.markedAt).toLocaleDateString()} @ {new Date(log.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <h4 className="text-[13px] font-bold text-gray-800 leading-tight mt-0.5 truncate">
                          {log.sessionId?.courseName || 'Unknown Course'}
                        </h4>
                        {log.sessionId?.location?.lat != null && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                            {log.sessionId.location.lat.toFixed(4)}, {log.sessionId.location.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 font-bold text-[12px] py-4">No recent attendance logs.</p>
                  )}
                </div>
                {recentTimeline.length > 0 && (
                  <Link to="/history" className="mt-3 w-full flex justify-center py-2 text-[12px] font-bold text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                    View Complete History
                  </Link>
                )}
              </div>

              {/* Alerts */}
              {lowAttendanceCourses.length > 0 ? (
                <div className="bg-red-50/60 border border-red-100 rounded-2xl overflow-hidden">
                  <div className="bg-red-100/60 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">Low Attendance</span>
                  </div>
                  {lowAttendanceCourses.map((c, i) => (
                    <div key={i} className="p-4 border-b border-red-100/50 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[13px] font-bold text-gray-900 truncate flex-1 mr-2">{c.courseName || c.courseId}</h4>
                        <span className="text-[13px] font-extrabold text-red-500 shrink-0">{c.rate}%</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">Below 75% threshold — attend more classes.</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50/60 border border-green-100 rounded-2xl overflow-hidden">
                  <div className="bg-green-100/60 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-extrabold text-green-600 uppercase tracking-widest">All Clear</span>
                  </div>
                  <div className="p-4">
                    <p className="text-[12px] text-gray-700 font-bold">No critical low attendance alerts. Keep it up!</p>
                  </div>
                </div>
              )}

              {/* Support */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm">
                <h4 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2">Academic Support</h4>
                <p className="text-[12px] text-gray-500 font-medium mb-3 leading-relaxed">
                  Issues with attendance marking? Contact your department coordinator.
                </p>
                <button className="text-[12px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  Help Center <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 border-t border-gray-100 pt-5">
            <p className="text-[11px] font-medium text-gray-400 text-center">© 2026 Attendify College Solutions. All rights reserved.</p>
          </div>

        </div>
      )}
    </StudentLayout>
  );
};

export default Dashboard;
