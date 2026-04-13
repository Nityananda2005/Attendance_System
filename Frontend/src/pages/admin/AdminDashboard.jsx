import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  ChevronRight,
  Clock,
  ExternalLink,
  Download,
  FileBarChart
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import api from '../../api/axios';

// Mock Data for Distribution

const distributionData = []; // Removed for layout optimization

const AdminDashboard = () => {
  const [stats, setStats] = React.useState({
    students: 0,
    teachers: 0,
    activeSessions: 0,
    overallAttendanceRate: 0,
  });
  const [attendanceTrend, setAttendanceTrend] = React.useState([]);
  const [ongoingSessions, setOngoingSessions] = React.useState([]);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [lowAttendanceAlerts, setLowAttendanceAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [statsRes, ongoingRes, activityRes, alertsRes, trendRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/ongoing-sessions'),
          api.get('/admin/recent-activity'),
          api.get('/admin/low-attendance'),
          api.get('/admin/attendance-trend')
        ]);
        
        setStats(statsRes.data);
        setOngoingSessions(ongoingRes.data);
        setRecentActivity(activityRes.data);
        setLowAttendanceAlerts(alertsRes.data);
        setAttendanceTrend(trendRes.data);
      } catch (err) {
        console.error("Failed to fetch admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview Dashboard</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Welcome back, Admin! Here's what's happening in your geofenced system today.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="TOTAL STUDENTS" 
            value={loading ? "..." : stats.students.toLocaleString()} 
            change="+3.8%" 
            isUp={true} 
            icon={<Users className="w-5 h-5" />} 
            color="blue"
            progress={75}
          />
          <StatCard 
            title="TOTAL TEACHERS" 
            value={loading ? "..." : stats.teachers.toLocaleString()} 
            change="+1.4%" 
            isUp={true} 
            icon={<UserPlus className="w-5 h-5" />} 
            color="cyan"
            progress={65}
          />
          <StatCard 
            title="ACTIVE SESSIONS" 
            value={loading ? "..." : stats.activeSessions.toLocaleString()} 
            change="-8" 
            isUp={false} 
            icon={<BookOpen className="w-5 h-5" />} 
            color="indigo"
            progress={45}
          />
          <StatCard 
            title="ATTENDANCE %" 
            value={loading ? "..." : `${stats.overallAttendanceRate}%`} 
            change="+14.3%" 
            isUp={true} 
            icon={<Percent className="w-5 h-5" />} 
            color="blue"
            progress={stats.overallAttendanceRate}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart - Expanded to full width */}
          <div className="lg:col-span-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-3xl p-8 shadow-2xl overflow-hidden hover:shadow-blue-500/5 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Overview</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Daily Attendance rates over the last 7 days</p>
              </div>
              <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-6">
                <div>
                   <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Overall Avg</p>
                   <p className="text-xl font-bold dark:text-white">{stats.overallAttendanceRate}%</p>
                </div>
                <div>
                   <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total Records</p>
                   <p className="text-xl font-bold dark:text-white">{loading ? '...' : (stats.students * stats.activeSessions).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Ongoing Sessions */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[400px] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 transform-gpu">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold dark:text-white flex items-center gap-2">
                Ongoing Sessions
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] rounded-full">{ongoingSessions.length}</span>
              </h3>
            </div>
            <div className="flex-1 divide-y divide-gray-100 dark:divide-slate-800 overflow-y-auto max-h-[400px] custom-scrollbar">
              {ongoingSessions.length > 0 ? (
                ongoingSessions.map((session) => (
                  <SessionItem 
                    key={session._id}
                    title={session.courseName} 
                    teacher={session.facultyId?.name || "Faculty"} 
                    location={session.department || "Lab"} 
                    startTime={new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    img={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.facultyId?.name || 'F')}&background=random`}
                  />
                ))
              ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400">No active sessions at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[400px] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 transform-gpu">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold dark:text-white">Recent Activity</h3>
            </div>
            <div className="p-6 relative flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
               {recentActivity.length > 0 ? (
                 <>
                  <div className="absolute left-[33px] top-6 bottom-6 w-px bg-gray-100 dark:bg-slate-800" />
                  <div className="space-y-6 relative">
                    {recentActivity.map((session) => {
                      const facultyName = session.facultyId?.name || "Faculty";
                      const facultyColor = getFacultyColor(facultyName);
                      
                      return (
                        <ActivityItem 
                          key={session._id}
                          time={new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                          text={
                            <span>
                              <span className={`font-bold ${facultyColor}`}>{facultyName}</span>
                              {" "}{session.status === 'active' ? 'created' : 'completed'} session for{" "}
                              <span className="font-semibold text-gray-900 dark:text-white">{session.courseName}</span>
                            </span>
                          } 
                          type={session.status === 'active' ? 'session' : 'attendance'}
                        />
                      );
                    })}
                  </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <Clock className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No activity recorded for today yet.</p>
                 </div>
               )}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 rounded-3xl shadow-xl overflow-hidden flex flex-col lg:col-span-2 xl:col-span-1 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 transform-gpu">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold dark:text-white">Low Attendance Alerts</h3>
            </div>
            <div className="flex-1 divide-y divide-gray-100 dark:divide-slate-800 overflow-y-auto max-h-[300px] custom-scrollbar">
              {lowAttendanceAlerts.length > 0 ? (
                lowAttendanceAlerts.map((student) => (
                  <AlertItem 
                    key={student._id}
                    name={student.name} 
                    roll={student.enrollmentId || "N/A"} 
                    subject={student.department} 
                    percentage={student.percentage}
                  />
                ))
              ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-gray-400">All students are above the 40% threshold.</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/30 m-4 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
               <p className="text-[10px] text-gray-500 dark:text-slate-400 text-center uppercase font-bold tracking-widest">
                  System Last Scanned: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100 dark:border-slate-800">
           <p className="text-xs text-gray-400">© 2026 AttendTrack Admin. Secure Geo-Verified Attendance System.</p>
           <div className="flex items-center gap-6">
             <a href="#" className="text-xs text-gray-400 hover:text-blue-500">System Status</a>
             <a href="#" className="text-xs text-gray-400 hover:text-blue-500">API Documentation</a>
             <a href="#" className="text-xs text-gray-400 hover:text-blue-500">Privacy Policy</a>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
};

// Helper to get consistent color for faculty names
const getFacultyColor = (name) => {
  const colors = [
    'text-emerald-500', 'text-blue-500', 'text-indigo-500', 
    'text-rose-500', 'text-purple-500', 'text-sky-500', 
    'text-fuchsia-500', 'text-amber-500', 'text-orange-500'
  ];
  let hash = 0;
  if (!name) return colors[0];
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Sub-components for cleaner code
const StatCard = ({ title, value, change, isUp, icon, color, progress }) => {
  const colors = {
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-500"
  };
  
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/5 p-6 rounded-3xl shadow-xl hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group transform-gpu">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} bg-opacity-10 text-opacity-100 ${color === 'blue' ? 'text-blue-600' : color === 'cyan' ? 'text-cyan-600' : 'text-indigo-600'} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-opacity-10 ${isUp ? 'bg-emerald-500 text-emerald-500' : 'bg-rose-500 text-rose-500'} text-[10px] font-bold`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{title}</p>
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1 group-hover:tracking-tight transition-all">{value}</h2>
      <div className="mt-5 w-full h-1.5 bg-gray-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

const SessionItem = ({ title, teacher, location, startTime, img }) => (
  <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <img src={img} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-slate-800 group-hover:ring-blue-100" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{title}</h4>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-gray-400 font-medium">By {teacher}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-[11px] text-gray-400 font-medium">{location}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-bold text-blue-500">{startTime}</p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-gray-300" />
          <span className="text-[10px] text-gray-300 font-medium tracking-tight">Active</span>
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ time, text, type }) => (
  <div className="flex gap-4 relative">
    <div className={`w-3.5 h-3.5 rounded-full z-10 mt-1.5 border-2 border-white dark:border-slate-900 ${
      type === 'attendance' ? 'bg-blue-500' : type === 'session' ? 'bg-cyan-500' : 'bg-amber-500'
    }`} />
    <div className="flex-1 pb-1">
      <p className="text-sm text-gray-700 dark:text-slate-300 font-medium leading-relaxed">{text}</p>
      <span className="text-[11px] text-gray-400 mt-1 block">{time}</span>
    </div>
  </div>
);

const AlertItem = ({ name, roll, subject, percentage }) => (
  <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{name}</h4>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{roll} • {subject}</p>
      </div>
    </div>
    <div className="flex flex-col items-end">
       <span className={`text-xs font-bold ${percentage < 50 ? 'text-red-500' : 'text-orange-500'}`}>
         {percentage}%
       </span>
       <div className="w-16 h-1 bg-gray-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
          <div className={`h-full ${percentage < 50 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  </div>
);

export default AdminDashboard;
