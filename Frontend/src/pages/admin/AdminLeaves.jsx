import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Search,
  Filter,
  User as UserIcon,
  Check,
  X,
  Send,
  Trash2
} from 'lucide-react';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/manage');
      setLeaves(res.data);
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status, adminComment: comment });
      toast.success(`Leave request ${status}`);
      setSelectedLeave(null);
      setComment('');
      fetchLeaves();
    } catch (error) {
      toast.error("Failed to update leave status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this leave record?")) return;
    
    try {
      await api.delete(`/leaves/${id}`);
      toast.success("Leave record deleted");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete record");
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const matchesSearch = l.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ CRITICAL ACTION ⚠️\nYou are about to permanently delete ALL leave records in the system. This cannot be undone.\n\nContinue?")) {
      if (!window.confirm("FINAL WARNING: Are you absolutely sure?")) return;
    }
    
    try {
      const res = await api.delete('/leaves/manage/all');
      toast.success(res.data.message);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk deletion failed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Leave Requests</h1>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">Manage and approve faculty leave applications.</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/30 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all shadow-sm group"
             >
               <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
               Delete All
             </button>

             <div className="p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 flex gap-1">
               {['pending', 'approved', 'rejected', 'all'].map(f => (
                 <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                    filter === f 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-200'
                  }`}
                 >
                   {f}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by faculty name or leave type..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[14px] font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 min-w-max">
            <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
               <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Incoming</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{leaves.filter(l => l.status === 'pending').length}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="glass-panel rounded-[32px] overflow-hidden border border-white dark:border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Applicant</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Type & Duration</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Reason</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="5" className="py-24 text-center text-gray-400 font-bold italic">Gathering leave requests...</td></tr>
                ) : filteredLeaves.length > 0 ? (
                  filteredLeaves.map(l => (
                    <tr key={l._id} className="hover:bg-gray-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                             l.userId?.role === 'student' 
                             ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400' 
                             : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                           }`}>
                              <UserIcon className="w-5 h-5" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[14px] font-black text-gray-900 dark:text-white leading-tight">{l.userId?.name}</p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                  l.userId?.role === 'student' ? 'bg-purple-100 text-purple-600 shadow-sm' : 'bg-blue-100 text-blue-600 shadow-sm'
                                }`}>
                                  {l.userId?.role === 'student' ? 'Student' : 'Teacher'}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase mt-0.5 tracking-tight">
                                {l.userId?.role === 'student' 
                                  ? `${l.userId?.branch || (Array.isArray(l.userId?.department) ? l.userId?.department[0] : l.userId?.department)} - Sem ${l.userId?.semester}`
                                  : (Array.isArray(l.userId?.department) ? l.userId?.department[0] : l.userId?.department) || 'N/A'
                                }
                              </p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-bold text-gray-700 dark:text-slate-200">{l.type} Leave</span>
                            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                               {new Date(l.startDate).toLocaleDateString()} <ChevronRight className="w-2.5 h-2.5" /> {new Date(l.endDate).toLocaleDateString()}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-[13px] font-medium text-gray-600 dark:text-slate-400 max-w-xs truncate" title={l.reason}>
                           {l.reason}
                         </p>
                      </td>
                      <td className="px-8 py-6">
                         {l.status === 'pending' ? (
                           <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs ring-1 ring-amber-100 dark:ring-amber-900/30 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/10 w-fit">
                             <Clock className="w-3 h-3" /> Pending
                           </div>
                         ) : l.status === 'approved' ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs ring-1 ring-emerald-100 dark:ring-emerald-900/30 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/10 w-fit">
                               <CheckCircle className="w-3 h-3" /> Approved
                            </div>
                         ) : (
                            <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs ring-1 ring-rose-100 dark:ring-rose-900/30 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/10 w-fit">
                               <XCircle className="w-3 h-3" /> Rejected
                            </div>
                         )}
                      </td>
                      <td className="px-8 py-6 text-right">
                         {l.status === 'pending' ? (
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setSelectedLeave(l)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                              >
                                Review & Action
                              </button>
                              <button 
                                onClick={() => handleDelete(l._id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors group"
                                title="Delete Request"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                           </div>
                         ) : (
                           <div className="flex items-center justify-end gap-2">
                               <button 
                                disabled
                                className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg opacity-50"
                               >
                                 Case Closed
                               </button>
                               <button 
                                 onClick={() => handleDelete(l._id)}
                                 className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors group"
                                 title="Delete Record"
                               >
                                 <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                               </button>
                            </div>
                         )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-24 text-center text-gray-400 font-bold italic">No requests matching your filters found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedLeave(null)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-[32px] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="p-8 border-b border-gray-50 dark:border-slate-900 bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Calendar className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">Review Request</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1.5">{selectedLeave.userId?.role === 'student' ? 'Roll No' : 'Employee ID'}: {selectedLeave.userId?._id?.slice(-6)}</p>
                     </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-3 shadow-inner">
                     <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400">{selectedLeave.userId?.role === 'student' ? 'Student' : 'Faculty'}</span>
                        <span className="text-blue-600 dark:text-blue-400">{selectedLeave.userId?.name}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400">Type</span>
                        <span className="text-gray-700 dark:text-slate-200">{selectedLeave.type}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px] font-bold">
                        <span className="text-gray-400">Duration</span>
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-200">
                           {new Date(selectedLeave.startDate).toLocaleDateString()} 
                           <ChevronRight className="w-3 h-3" />
                           {new Date(selectedLeave.endDate).toLocaleDateString()}
                        </div>
                     </div>
                     <div className="pt-2 border-t border-gray-50 dark:border-slate-700">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1">Reason Statement</label>
                        <p className="text-[13px] font-medium text-gray-600 dark:text-slate-400 italic">"{selectedLeave.reason}"</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Admin Comment (Optional)
                     </label>
                     <textarea 
                       className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl text-[14px] font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none shadow-inner"
                       rows="3"
                       placeholder="Provide your feedback for the employee..."
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => handleStatusUpdate(selectedLeave._id, 'rejected')}
                       className="flex items-center justify-center gap-2 py-4 border-2 border-rose-100 dark:border-rose-900/30 text-rose-500 dark:text-rose-400 rounded-2xl text-sm font-black hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all active:scale-95 group"
                     >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={3} /> Reject
                     </button>
                     <button 
                       onClick={() => handleStatusUpdate(selectedLeave._id, 'approved')}
                       className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group"
                     >
                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={3} /> Approve
                     </button>
                  </div>
                  
                  <button 
                   onClick={() => setSelectedLeave(null)}
                   className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-slate-500 transition-colors uppercase tracking-widest pb-2"
                  >
                     Dismiss Review Panel
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeaves;
