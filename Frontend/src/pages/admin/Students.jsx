import React, { useState, useEffect } from 'react';

import AdminLayout from '../../components/AdminLayout';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  ChevronDown, 
  ArrowRight,
  Download,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  UserCheck,
  MoreVertical,
  FileText,
  MapPin,
  TrendingUp,
  X,
  Lock
} from 'lucide-react';



import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ACADEMIC_STRUCTURE, formatSemester } from '../../constants/academicConstants';


const PROGRAMS = ["All Programs", ...Object.keys(ACADEMIC_STRUCTURE)];
const ALL_BRANCHES = ["All Branches", ...new Set(Object.values(ACADEMIC_STRUCTURE).flat())];


const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProgram, setActiveProgram] = useState('All Programs');
  const [activeBranch, setActiveBranch] = useState('All Branches');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [formData, setFormData] = useState({
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent._id}`, formData);
        toast.success("Student password updated");
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ password: '' });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, activeBranch, activeProgram]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchStudents();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/students?page=${currentPage}&limit=${limit}&search=${searchQuery}&department=${activeBranch}&program=${activeProgram}`);
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalStudents);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student profile?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success("Student deleted successfully");
        fetchStudents();
      } catch (err) {
        toast.error("Failed to delete student");
      }
    }
  };

  const handleDeleteAllStudents = async () => {
    if (window.confirm("⚠️ CRITICAL ACTION ⚠️\nYou are about to delete ALL student accounts and their attendance records. This cannot be undone.\n\nContinue?")) {
      if (window.confirm("FINAL WARNING: Are you absolutely sure you want to wipe the entire student database?")) {
        try {
          setLoading(true);
          await api.delete('/admin/students/bulk/all');
          toast.success("All student data purged successfully");
          setCurrentPage(1);
          fetchStudents();
        } catch (err) {
          toast.error("Bulk deletion failed");
        } finally {
          setLoading(false);
        }
      }
    }
  };


  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/admin/students?page=1&limit=0&search=${searchQuery}&department=${activeBranch}&program=${activeProgram}`);
      const allData = res.data.students;

      if (!allData || allData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const headers = ["Name", "Enrollment ID", "Email", "Program", "Branch", "Mobile", "Semester", "Account Created"];
      const rows = allData.map(s => [
        `"${s.name}"`,
        `"${s.enrollmentId || 'N/A'}"`,
        `"${s.email}"`,
        `"${s.program || 'N/A'}"`,
        `"${s.branch || s.department || 'N/A'}"`,
        `"${s.phone || 'N/A'}"`,
        `"${s.semester || 'N/A'}"`,
        `"${new Date(s.createdAt).toLocaleDateString()}"`
      ]);


      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Student_Directory.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Exported");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };


  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Students</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">View and manage student geofenced attendance records and profiles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDeleteAllStudents}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/30 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all shadow-sm group"
            >
              <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Delete All
            </button>

            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-all">
              <Upload className="w-4 h-4" />
              Import CSV
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>

        {/* Filters & Chips */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[300px] relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by Name, Email or Roll Number..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

            </div>
            
            <div className="flex items-center gap-2">
               <button className="p-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                  <Filter className="w-5 h-5" />
               </button>
               <button 
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition-all disabled:opacity-50"
               >
                  {exporting ? 'Exporting...' : 'Export CSV'} <Download className="w-4 h-4 ml-1" />
               </button>

            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Program:</span>
              {PROGRAMS.map((prog) => (
                <button
                  key={prog}
                  onClick={() => { setActiveProgram(prog); setActiveBranch('All Branches'); }}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeProgram === prog
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'
                  }`}
                >
                  {prog}
                </button>
              ))}
            </div>
            
            <div className="w-[1px] h-6 bg-gray-200 dark:bg-slate-800 mx-2 flex-shrink-0" />

            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Branch:</span>
              {(activeProgram === 'All Programs' ? ALL_BRANCHES : ["All Branches", ...ACADEMIC_STRUCTURE[activeProgram]]).map((branch) => (
                <button
                  key={branch}
                  onClick={() => setActiveBranch(branch)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeBranch === branch
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Avatar</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Roll Number</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Program</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Branch</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Semester</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Password</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-20 text-gray-400 font-medium italic">Searching faculty database...</td></tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="relative w-10 h-10">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`} 
                            alt="" 
                            className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-slate-800 ring-2 ring-gray-100 dark:ring-slate-700" 
                          />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500`} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{student.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium truncate max-w-[150px]">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600 dark:text-slate-300 font-bold">{student.enrollmentId || 'NOT_SET'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold ring-1 ring-blue-100 dark:ring-blue-800">
                          {student.program || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-bold ring-1 ring-gray-200 dark:ring-slate-700">
                          {student.branch || (Array.isArray(student.department) ? student.department[0] : student.department) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-200">
                          {student.phone || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{formatSemester(student.semester)}</span>
                           <span className="text-[10px] text-gray-400 font-medium italic">Batch: {student.batchSection || 'A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded ring-1 ring-red-100 dark:ring-red-900/50 min-w-[70px] text-center">
                            {visiblePasswords[student._id] ? (student.rawPassword || 'N/A') : '••••••••'}
                          </span>
                          <button 
                            onClick={() => togglePasswordVisibility(student._id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-blue-500"
                          >
                            {visiblePasswords[student._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingStudent(student);
                              setFormData({ password: '' });
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(student._id)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-medium">No students found matching your criteria.</td></tr>
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-5 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="font-bold">{Math.min(totalCount, (currentPage - 1) * limit + 1)}</span> to <span className="font-bold">{Math.min(totalCount, currentPage * limit)}</span> of <span className="font-bold">{totalCount}</span> students
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all mr-2 disabled:opacity-30"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      currentPage === pageNum 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
              {totalPages > 5 && (
                <button 
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    currentPage === totalPages 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {totalPages}
                </button>
              )}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all ml-2 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Student Password
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  Change the password for {editingStudent?.name}.
                </p>
              </div>

              <button 
                onClick={() => { setShowModal(false); setEditingStudent(null); }}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              <div className="flex items-center gap-4">
                <label className="w-1/3 text-sm font-bold text-gray-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="w-2/3 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter new password" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-900 dark:text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Students;

