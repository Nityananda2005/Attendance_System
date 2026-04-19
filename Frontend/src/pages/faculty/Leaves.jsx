import React, { useState, useEffect, useContext } from 'react';
import FacultyLayout from '../../components/FacultyLayout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  ArrowRight,
  Info,
  Trash2
} from 'lucide-react';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'Casual',
    reason: ''
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my');
      setLeaves(res.data);
    } catch (error) {
      toast.error("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        return toast.error("End date cannot be before start date");
      }

      await api.post('/leaves/apply', formData);
      toast.success("Leave application submitted!");
      setShowModal(false);
      setFormData({ startDate: '', endDate: '', type: 'Casual', reason: '' });
      fetchMyLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave application?")) return;
    
    try {
      await api.delete(`/leaves/${id}`);
      toast.success("Leave application deleted");
      fetchMyLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete leave");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-bold ring-1 ring-emerald-100 dark:ring-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-[11px] font-bold ring-1 ring-rose-100 dark:ring-rose-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-bold ring-1 ring-amber-100 dark:ring-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </div>
        );
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ This will cancel ALL your currently PENDING leave requests. Continue?")) return;
    
    try {
      const res = await api.delete('/leaves/my/all');
      toast.success(res.data.message);
      fetchMyLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk deletion failed");
    }
  };

  return (
    <FacultyLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Leave Management</h1>
            <p className="text-[14px] text-gray-500 dark:text-slate-400 mt-1 font-medium">Apply for leaves and track your status in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/30 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Apply New Leave
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card-3d p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Requests</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{leaves.length}</h3>
          </div>
          <div className="glass-card-3d p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Approved</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{leaves.filter(l => l.status === 'approved').length}</h3>
          </div>
          <div className="glass-card-3d p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pending Action</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{leaves.filter(l => l.status === 'pending').length}</h3>
          </div>
        </div>

        {/* List Section */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave History</h3>
            <button 
              onClick={fetchMyLeaves}
              className="text-xs font-bold text-blue-500 hover:text-blue-600"
            >
              Refresh List
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Type & Duration</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Admin Feedback</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="4" className="py-20 text-center text-gray-400 font-bold italic">Loading leave records...</td></tr>
                ) : leaves.length > 0 ? (
                  leaves.map(l => (
                    <tr key={l._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] font-bold text-gray-900 dark:text-white">{l.type} Leave</span>
                          <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                            {new Date(l.startDate).toLocaleDateString()} <ArrowRight className="w-2.5 h-2.5" /> {new Date(l.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] text-gray-600 dark:text-slate-300 font-medium max-w-xs">{l.reason}</p>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(l.status)}
                      </td>
                      <td className="px-6 py-5">
                        {l.adminComment ? (
                          <div className="p-2.5 bg-gray-50 dark:bg-slate-900 rounded-xl flex items-start gap-2.5 border border-gray-100 dark:border-slate-800">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium text-gray-600 dark:text-slate-400 italic">"{l.adminComment}"</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300 dark:text-slate-600 italic">No feedback yet</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {l.status === 'pending' && (
                          <button 
                            onClick={() => handleDelete(l._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors group"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="py-20 text-center text-gray-400 font-bold italic">No leave applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-blue-500" /> Apply For Leave
               </h3>
               <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">Submit your request to the administrator for approval.</p>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Leave Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal/Private</option>
                    <option value="Duty">On Duty (External)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                  <textarea 
                    required
                    rows="4"
                    placeholder="Short description of your request..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 leading-relaxed italic">
                    Administrative notification will be sent immediately upon submission. Approved leaves appear in your history once actioned.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                   <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                   >
                     Confirm Application
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
};

export default Leaves;
