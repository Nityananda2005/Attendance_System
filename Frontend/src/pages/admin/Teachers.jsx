import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  Plus, 
  Download, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Mail,
  Users,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

import api from '../../api/axios';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Information Technology (IT)",
  "Electronics and Communication Engineering (ECE)",
  "Electrical Engineering (EE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Artificial Intelligence and Machine Learning (AI/ML)",
  "Data Science (DS)"
];

const Teachers = () => {

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: [] // Changed to array
  });


  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeptToggle = (dept) => {
    setFormData(prev => {
      const currentDepts = prev.department || [];
      if (currentDepts.includes(dept)) {
        return { ...prev, department: currentDepts.filter(d => d !== dept) };
      } else {
        return { ...prev, department: [...currentDepts, dept] };
      }
    });
  };



  useEffect(() => {
    fetchTeachers();
  }, [currentPage, deptFilter]); // Refetch on page or dept change

  // Special effect for search with debounce if needed, but for now simple refetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to page 1 for new search
      } else {
        fetchTeachers();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/teachers?page=${currentPage}&limit=${limit}&search=${searchQuery}&department=${deptFilter}`);
      setTeachers(res.data.teachers);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalTeachers);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher._id}`, formData);
        toast.success("Teacher profile updated");
      } else {
        await api.post('/admin/teachers', formData);
        toast.success("Teacher registered successfully");
      }
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({ name: '', email: '', password: '', department: [] });
      fetchTeachers();

    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };


  const handleDeleteTeacher = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher account? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        toast.success("Teacher deleted");
        fetchTeachers();
      } catch (err) {
        toast.error("Failed to delete teacher");
      }
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      // Fetch ALL teachers matching current filters (search and dept)
      const res = await api.get(`/admin/teachers?page=1&limit=0&search=${searchQuery}&department=${deptFilter}`);
      const allTeachers = res.data.teachers;

      if (!allTeachers || allTeachers.length === 0) {
        toast.error("No data to export");
        return;
      }

      // 1. Define CSV headers
      const headers = ["Name", "Email", "Department(s)", "Join Date", "Status", "Raw Password"];
      
      // 2. Format rows
      const rows = allTeachers.map(t => [
        `"${t.name}"`,
        `"${t.email}"`,
        `"${(Array.isArray(t.department) ? t.department.join('; ') : (t.department || 'N/A'))}"`,
        `"${new Date(t.createdAt).toLocaleDateString()}"`,
        '"Active"',
        `"${t.rawPassword || 'N/A'}"`
      ]);

      // 3. Combine into CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 4. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Teachers_Directory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully!");
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // Removed client-side filter logic as it's now handled by the server
  const filteredTeachers = teachers;



  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Teachers</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Directory of registered faculty members and their departmental assignments.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>

            <button 
              onClick={() => {
                setEditingTeacher(null);
                setFormData({ name: '', email: '', password: '', department: 'Computer Science' });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Teacher
            </button>

          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or faculty ID..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm text-gray-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[160px]"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option>All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button 
            onClick={() => { setSearchQuery(''); setDeptFilter('All Departments'); }}
            className="text-sm font-semibold text-blue-500 hover:text-blue-600 px-2"
          >
            Clear Filters
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Teacher Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Email Address</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Password</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Joined Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-medium">Loading faculty directory...</td></tr>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=3b82f6&color=fff`} 
                            alt="" 
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-slate-800 group-hover:ring-blue-100" 
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{teacher.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium tracking-tight uppercase">{teacher._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 dark:text-slate-400">{teacher.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {Array.isArray(teacher.department) && teacher.department.length > 0 ? (
                            teacher.department.map((dept, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-blue-800/50">
                                {dept.split('(')[1]?.replace(')', '') || dept}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-300 text-xs italic">Not Assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                             {visiblePasswords[teacher._id] ? (teacher.rawPassword || '••••••••') : '••••••••'}
                           </span>
                           <button 
                             onClick={() => togglePasswordVisibility(teacher._id)}
                             className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                           >
                             {visiblePasswords[teacher._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                           </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                        {new Date(teacher.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingTeacher(teacher);
                              setFormData({
                                name: teacher.name,
                                email: teacher.email,
                                department: Array.isArray(teacher.department) ? teacher.department : [teacher.department],
                                password: ''
                              });
                              setShowModal(true);
                            }}

                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-medium">No faculty members found matching your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="font-bold">{Math.min(totalCount, (currentPage - 1) * limit + 1)}</span> to <span className="font-bold">{Math.min(totalCount, currentPage * limit)}</span> of <span className="font-bold">{totalCount}</span> teachers
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Simple pagination numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, and pages around current
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button 
                      key={pageNum} 
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="text-gray-400">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InfoCard 
            icon={<ShieldCheck className="w-5 h-5 text-blue-500" />} 
            title="Bulk Actions" 
            desc="Select multiple rows to perform bulk management tasks."
            color="blue"
           />
           <InfoCard 
            icon={<UserPlus className="w-5 h-5 text-emerald-500" />} 
            title="Onboarding Invites" 
            desc="New teachers will receive a verification link via email."
            color="emerald"
           />
           <InfoCard 
            icon={<Clock className="w-5 h-5 text-amber-500" />} 
            title="Data Policy" 
            desc="Deleted teacher accounts are archived for 30 days."
            color="amber"
           />
        </div>

      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTeacher ? 'Update Teacher Profile' : 'Register New Teacher'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  {editingTeacher ? 'Modify the details of this faculty member.' : 'Enter the faculty details to create a new profile.'}
                </p>
              </div>

              <button 
                onClick={() => { setShowModal(false); setEditingTeacher(null); }}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>

              <div className="flex items-center gap-4">
                <label className="w-1/3 text-sm font-bold text-gray-700 dark:text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Dr. Jane Doe" 
                  className="w-2/3 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />

              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/3 text-sm font-bold text-gray-700 dark:text-slate-300">Email Address</label>
                <div className="w-2/3 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="jane.doe@university.edu" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-900 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />

                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Assign Departments</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                  {DEPARTMENTS.map((dept) => (
                    <label key={dept} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          className="peer sr-only"
                          checked={formData.department?.includes(dept)}
                          onChange={() => handleDeptToggle(dept)}
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-slate-700 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {dept}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-1/3 text-sm font-bold text-gray-700 dark:text-slate-300">
                  {editingTeacher ? 'New Password' : 'Temp Password'}
                </label>
                <div className="w-2/3 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    required={!editingTeacher}
                    placeholder={editingTeacher ? "Leave blank to keep current" : "Create a strong password"} 
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
                  {editingTeacher ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {editingTeacher ? 'Update Profile' : 'Create Profile'}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const InfoCard = ({ icon, title, desc, color }) => (
  <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
    <div className={`p-3 rounded-xl bg-gray-50 dark:bg-slate-800 ring-4 ring-transparent hover:ring-${color}-100 dark:hover:ring-${color}-900/10 transition-all`}>
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Teachers;
