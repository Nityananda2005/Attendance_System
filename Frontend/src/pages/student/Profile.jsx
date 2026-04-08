import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  Pencil, ShieldCheck, Clock, AlertCircle, BookOpen, GraduationCap, 
  Users, CalendarDays, Hash, Mail, Phone, CheckCircle2, Award, Book, Save, X
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          department: res.data.department || '',
          batchSection: res.data.batchSection || '',
          semester: res.data.semester || '',
          residence: res.data.residence || '',
          phone: res.data.phone || '',
          emergencyContact: res.data.emergencyContact || ''
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await api.put('/auth/profile', formData);
      setProfile(res.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const renderField = (name, value, label) => {
    if (isEditing) {
      return (
        <input
          type="text"
          name={name}
          value={formData[name] !== undefined ? formData[name] : ''}
          onChange={handleChange}
          placeholder={`Enter ${label}...`}
          className="w-full bg-white border border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-1.5 text-[13px] font-bold text-gray-800 outline-none transition-all"
        />
      );
    }
    return <p className="text-[13px] font-bold text-gray-800">{value || 'Not specified'}</p>;
  };

  if (loading) {
    return (
      <StudentLayout title="Profile">
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Profile">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Student Profile</h1>
            <p className="text-[13px] text-gray-500 mt-0.5 font-medium">Manage your academic identity and personal information.</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-full text-[13px] font-bold text-white transition-all shadow-md shadow-blue-500/20 w-fit"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[13px] font-bold text-gray-600 transition-all"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-full text-[13px] font-bold text-white transition-all shadow-md shadow-green-500/20"
              >
                <Save className="w-3.5 h-3.5" strokeWidth={2.5} /> Save
              </button>
            </div>
          )}
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Profile Card */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-20 bg-linear-to-r from-blue-400 to-blue-600" />
              <div className="px-5 pb-5 flex flex-col items-center -mt-10">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Student')}&background=cbd5e1&color=334155&font-size=0.33`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="text-center w-full">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="w-full text-center bg-white border border-blue-200 focus:border-blue-500 rounded-lg px-2 py-1 text-[15px] font-extrabold text-gray-900 outline-none mb-1"
                    />
                  ) : (
                    <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight">{profile.name}</h2>
                  )}
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5 truncate">{profile.email}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wide">Active Student</span>
                </div>
                <div className="w-full h-px bg-gray-100 my-4" />
                <div className="w-full space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-gray-500 font-semibold">Student ID</span>
                    <span className="text-[12px] text-gray-900 font-bold">{profile.enrollmentId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-gray-500 font-semibold">Joined</span>
                    <span className="text-[12px] text-gray-900 font-bold">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[10px] font-extrabold text-gray-400 tracking-widest mb-3">SECURITY & ACCESS</h3>
              <div className="space-y-1">
                {[
                  { icon: ShieldCheck, label: 'Two-Factor Auth' },
                  { icon: Clock, label: 'Login Sessions' },
                  { icon: AlertCircle, label: 'Reset Password', danger: true },
                ].map(({ icon: Icon, label, danger }) => (
                  <button
                    key={label}
                    className={`w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors ${danger ? 'hover:bg-red-50' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-blue-500'}`} strokeWidth={2.5} />
                    <span className={`text-[13px] font-bold ${danger ? 'text-red-500' : 'text-gray-700'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 space-y-4 min-w-0">

            {/* Academic Info */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <BookOpen className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
                  <h3 className="text-[16px] font-extrabold text-gray-900">Academic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    { icon: GraduationCap, label: 'BRANCH / DEPARTMENT', name: 'department', value: profile.department },
                    { icon: Users, label: 'BATCH & SECTION', name: 'batchSection', value: profile.batchSection },
                    { icon: CalendarDays, label: 'CURRENT SEMESTER', name: 'semester', value: profile.semester },
                    { icon: Hash, label: 'ENROLLMENT NUMBER', value: profile.enrollmentId, fixed: true },
                  ].map(({ icon: Icon, label, name, value, fixed }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-blue-500" strokeWidth={2} />
                      </div>
                      <div className="w-full min-w-0">
                        <p className="text-[9px] font-extrabold text-gray-400 tracking-widest mb-1 uppercase">{label}</p>
                        {fixed
                          ? <p className="text-[13px] font-bold text-gray-800">{value || 'N/A'}</p>
                          : renderField(name, value, label)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <Mail className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
                <h3 className="text-[16px] font-extrabold text-gray-900">Personal & Contact Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 tracking-widest mb-2 uppercase">University Email</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-bold text-gray-700 truncate">
                    {profile.email}
                  </div>
                </div>
                {[
                  { name: 'residence', value: profile.residence, label: 'CURRENT RESIDENCE' },
                  { name: 'phone', value: profile.phone, label: 'PHONE NUMBER' },
                  { name: 'emergencyContact', value: profile.emergencyContact, label: 'EMERGENCY CONTACT' },
                ].map(({ name, value, label }) => (
                  <div key={name}>
                    <p className="text-[9px] font-extrabold text-gray-400 tracking-widest mb-2 uppercase">{label}</p>
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2.5">
                      {renderField(name, value, label)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, value: '--', label: 'Avg Attendance', bg: 'bg-green-50', color: 'text-green-500' },
                { icon: Award, value: '--', label: 'Academic Rank', bg: 'bg-orange-50', color: 'text-orange-500' },
                { icon: Book, value: '--', label: 'Course Credits', bg: 'bg-blue-50', color: 'text-blue-500' },
              ].map(({ icon: Icon, value, label, bg, color }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[16px] sm:text-[18px] font-black text-gray-900 leading-none">{value}</h4>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-2 border-t border-gray-100 mt-8 flex items-center justify-center">
          <p className="text-[11px] font-semibold text-gray-400">© 2026 Attendify College Solutions. All rights reserved.</p>
        </footer>
      </div>
    </StudentLayout>
  );
};

export default Profile;
