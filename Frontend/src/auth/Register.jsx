import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { ACADEMIC_STRUCTURE, SEMESTERS, formatSemester } from '../constants/academicConstants';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [program, setProgram] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { registerAction } = useContext(AuthContext);
  const navigate = useNavigate();

  // Constant arrays moved to academicConstants.js


  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const userData = await registerAction({
        name,
        email,
        password,
        role,
        ...(role === 'student' && {
          enrollmentId: `STU-${Math.random().toString(36).substring(7).toUpperCase()}`,
          program,
          branch,
          semester: isNaN(semester) ? semester : Number(semester),
        }),
      });
      if (userData.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      // Handled by toast
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    borderRadius: 12, border: theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
    fontSize: 14, color: theme === 'dark' ? '#f8fafc' : '#0f172a', background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif", fontWeight: 500,
  };
  const inputFocus = (e) => { e.target.style.border = '1.5px solid #3b82f6'; e.target.style.background = (theme === 'dark' ? '#0f172a' : 'white'); e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)'; };
  const inputBlur = (e) => { e.target.style.border = (theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0'); e.target.style.background = (theme === 'dark' ? '#1e293b' : '#f8fafc'); e.target.style.boxShadow = 'none'; };

  const IconWrap = ({ children }) => (
    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex' }}>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: theme === 'dark' ? 'radial-gradient(ellipse 80% 60% at 60% 30%, #0f172a 0%, #1e293b 40%, #020617 80%)' : 'radial-gradient(ellipse 80% 60% at 60% 30%, #dbeafe 0%, #f0f9ff 40%, #ffffff 80%)',
      }} />
      <div style={{ position: 'absolute', zIndex: 0, pointerEvents: 'none', opacity: 0.35, width: 500, height: 220, borderRadius: '50%', background: '#bfdbfe', filter: 'blur(70px)', top: -60, right: -80 }} />
      <div style={{ position: 'absolute', zIndex: 0, pointerEvents: 'none', opacity: 0.2, width: 300, height: 160, borderRadius: '50%', background: '#93c5fd', filter: 'blur(55px)', bottom: 0, left: 0 }} />

      {/* Navbar */}
      <nav style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', zIndex: 10, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)', overflow: 'hidden' }}>
            <img src="/logo.png" alt="Attendify Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: theme === 'dark' ? '#f8fafc' : '#1e293b', letterSpacing: '-0.3px' }}>Attendify</span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 999, background: theme === 'dark' ? '#0f172a' : 'white', border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '10px 16px 40px', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '5px 14px', marginBottom: 16 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.3px' }}>College Attendance System</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: theme === 'dark' ? '#f8fafc' : '#0f172a', letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.2 }}>
              Student <span style={{ color: '#2563eb' }}>Registration</span>
            </h1>
            <p style={{ fontSize: 14, color: theme === 'dark' ? '#cbd5e1' : '#64748b', lineHeight: 1.6, fontWeight: 450 }}>
              Join your college community and track your attendance progress effortlessly.
            </p>
          </div>

          {/* Card */}
          <div style={{ background: theme === 'dark' ? '#0f172a' : 'white', borderRadius: 24, padding: '28px 28px', boxShadow: '0 8px 40px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04)', border: theme === 'dark' ? '1px solid rgba(51,65,85,0.8)' : '1px solid rgba(219,234,254,0.8)' }}>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Student Registration Notice */}
              <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#3b82f6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 14L2 9l10-5 10 5-10 5z"/><path d="M6 11.5V17c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5"/></svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8' }}>Registering as a Student</p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9' }} />

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <IconWrap>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </IconWrap>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Nityananda Dalei" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>College Email Address</label>
                <div style={{ position: 'relative' }}>
                  <IconWrap>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </IconWrap>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john.doe@college.edu" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>

              {/* Password Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </IconWrap>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inputStyle, paddingRight: 36 }} onFocus={inputFocus} onBlur={inputBlur} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {showPassword
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/></svg>
                    </IconWrap>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div style={{ height: 1, background: '#f1f5f9' }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Academic Info</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>Program</label>
                    <div style={{ position: 'relative' }}>
                      <IconWrap>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 14L2 9l10-5 10 5-10 5z"/><path d="M6 11.5V17c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5" stroke="currentColor" strokeWidth="2"/></svg>
                      </IconWrap>
                      <select 
                        value={program} 
                        onChange={e => {
                          const newProg = e.target.value;
                          setProgram(newProg);
                          // Auto-select if only one branch
                          const availableBranches = ACADEMIC_STRUCTURE[newProg] || [];
                          if (newProg === 'MCA' && availableBranches.length === 1) {
                            setBranch(availableBranches[0]);
                          } else {
                            setBranch('');
                          }
                        }} 
                        required 
                        style={inputStyle} 
                        onFocus={inputFocus} 
                        onBlur={inputBlur}
                      >
                        <option value="">Select Program...</option>
                        {Object.keys(ACADEMIC_STRUCTURE).filter(p => p !== 'Common').map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>Branch</label>
                    <div style={{ position: 'relative' }}>
                      <IconWrap>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M6 21V9M18 21V9M9 21v-6h6v6M3 9l9-6 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </IconWrap>
                      <select 
                        value={branch} 
                        onChange={e => setBranch(e.target.value)} 
                        required 
                        disabled={!program}
                        style={{ ...inputStyle, opacity: !program ? 0.6 : 1, cursor: !program ? 'not-allowed' : 'pointer' }} 
                        onFocus={inputFocus} 
                        onBlur={inputBlur}
                      >
                        <option value="">{program ? 'Select Branch...' : 'Select Program First'}</option>
                        {(ACADEMIC_STRUCTURE[program] || []).map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 7 }}>Semester</label>
                    <div style={{ position: 'relative' }}>
                      <IconWrap>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </IconWrap>
                      <select 
                        value={semester} 
                        onChange={e => setSemester(e.target.value)} 
                        required 
                        style={inputStyle} 
                        onFocus={inputFocus} 
                        onBlur={inputBlur}
                      >
                        <option value="">Select Semester...</option>
                        {SEMESTERS.filter(s => {
                          if (role === 'student') return typeof s === 'number';
                          return true;
                        }).map(s => <option key={s} value={s}>{formatSemester(s)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 999, background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(59,130,246,0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(59,130,246,0.5)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)'; }}
              >
                {loading ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Creating Account...</>
                ) : (
                  <>Create Account <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
              </p>
            </form>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 8 }}>
            {[{ icon: '🔒', label: 'Secure' }, { icon: '📍', label: 'GPS Verified' }, { icon: '⚡', label: 'Real-time' }].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid rgba(226,232,240,0.8)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>© 2026 Attendify College Solutions. All rights reserved.</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Register;
