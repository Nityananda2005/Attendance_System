import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import api from '../../api/axios';
import { Trophy, Flame, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/attendance/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getMedalColor = (index) => {
    if (index === 0) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (index === 1) return 'text-gray-400 bg-gray-500/10 border-gray-400/30';
    if (index === 2) return 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border-amber-500/30';
    return '';
  };

  return (
    <StudentLayout title="Leaderboard">
      {loading ? (
        <div className="flex-1 flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 mb-4 shadow-inner">
              <Trophy className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Global Leaderboard</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Rankings based on overall attendance percentage and unbroken active streaks. Consistency is the key to mastering your department.
            </p>
          </div>

          {/* Top 3 Podium (Only visible if 3 or more students) */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-end">
              {/* Position 2 */}
              {top3[1] && (
                <div className="glass-panel p-5 text-center flex flex-col items-center order-2 sm:order-1 sm:h-[90%] transform transition-transform hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 ${getMedalColor(1)}`}>
                    <Medal className="w-5 h-5" />
                  </div>
                  <img src={top3[1].avatar} alt={top3[1].name} className="w-16 h-16 rounded-full mb-3 shadow-md" />
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">{top3[1].name}</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{top3[1].department}</span>
                  <div className="mt-4 w-full bg-gray-50 dark:bg-slate-800/80 rounded-xl p-2 border border-gray-100 dark:border-slate-700">
                    <p className="font-black text-gray-800 dark:text-slate-200 text-lg">{top3[1].attendanceRate}%</p>
                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-orange-500"/> {top3[1].currentStreak} Streak</p>
                  </div>
                </div>
              )}
              
              {/* Position 1 */}
              <div className="glass-panel p-6 text-center flex flex-col items-center relative order-1 sm:order-2 border-yellow-400/30 dark:border-yellow-400/20 shadow-yellow-500/10 transform sm:-translate-y-4 hover:-translate-y-6 transition-transform">
                <div className="absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-yellow-400 text-white">
                  <Award className="w-6 h-6" />
                </div>
                <img src={top3[0].avatar} alt={top3[0].name} className="w-20 h-20 rounded-full mb-3 mt-4 border-4 border-yellow-400/20 shadow-xl" />
                <h3 className="font-black text-gray-900 dark:text-white text-base mb-1">{top3[0].name}</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{top3[0].department}</span>
                <div className="mt-4 w-full bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-xl p-3 border border-yellow-200/50 dark:border-yellow-500/20">
                  <p className="font-black text-yellow-600 dark:text-yellow-400 text-2xl">{top3[0].attendanceRate}%</p>
                  <p className="text-[11px] font-bold text-yellow-600/70 dark:text-yellow-400/70 flex items-center justify-center gap-1 uppercase tracking-widest mt-1">
                    <Flame className="w-3.5 h-3.5" strokeWidth={3}/> {top3[0].currentStreak} Streak
                  </p>
                </div>
              </div>

              {/* Position 3 */}
              {top3[2] && (
                <div className="glass-panel p-5 text-center flex flex-col items-center order-3 sm:order-3 sm:h-[80%] transform transition-transform hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 ${getMedalColor(2)}`}>
                    <Medal className="w-5 h-5" />
                  </div>
                  <img src={top3[2].avatar} alt={top3[2].name} className="w-14 h-14 rounded-full mb-3 shadow-md" />
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">{top3[2].name}</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{top3[2].department}</span>
                  <div className="mt-3 w-full bg-gray-50 dark:bg-slate-800/80 rounded-xl p-2 border border-gray-100 dark:border-slate-700">
                    <p className="font-black text-gray-800 dark:text-slate-200 text-base">{top3[2].attendanceRate}%</p>
                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-orange-500"/> {top3[2].currentStreak} Streak</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rest of the list */}
          {rest.length > 0 && (
            <div className="glass-panel rounded-2xl overflow-hidden p-1">
              {rest.map((student, idx) => (
                <div key={student._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0 group">
                  <div className="w-6 text-center text-[13px] font-black text-gray-400 group-hover:text-blue-500 transition-colors">
                    #{idx + 4}
                  </div>
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{student.name}</h4>
                    <span className="text-[10px] font-medium text-gray-500 truncate">{student.department}</span>
                  </div>
                  <div className="flex items-center gap-6 text-right shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Logs</p>
                      <p className="text-[13px] font-black text-gray-700 dark:text-slate-300">{student.totalPresentDays}</p>
                    </div>
                    <div className="flex flex-col items-end w-16">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5"><Flame className="inline w-3 h-3 text-orange-400"/> Streak</p>
                      <p className="text-[14px] font-black text-gray-800 dark:text-slate-200">{student.currentStreak}</p>
                    </div>
                    <div className="flex flex-col items-end w-16">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rate</p>
                      <p className="text-[15px] font-black text-blue-500 dark:text-blue-400">{student.attendanceRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </StudentLayout>
  );
};

export default Leaderboard;
