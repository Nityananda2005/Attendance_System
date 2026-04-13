import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { loginAction, logoutAction } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await loginAction(email, password);
      if (userData.role !== role) {
        logoutAction();
        toast.error(`Please select the right role. You are registered as a ${userData.role}.`);
        return;
      }
      if (userData.role === 'admin') {
        toast.success('Logged in successfully!');
        navigate('/admin-dashboard');
      } else if (userData.role === 'faculty') {
        toast.success('Logged in successfully!');
        navigate('/faculty-dashboard');
      } else {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      // toast handles the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: theme === 'dark' ? 'radial-gradient(ellipse 80% 60% at 60% 30%, #0f172a 0%, #1e293b 40%, #020617 80%)' : 'radial-gradient(ellipse 80% 60% at 60% 30%, #dbeafe 0%, #f0f9ff 40%, #ffffff 80%)',
      }} />

      {/* Blob top-right */}
      <div style={{
        position: 'absolute', zIndex: 0, pointerEvents: 'none', opacity: 0.35,
        width: 500, height: 220, borderRadius: '50%',
        background: '#bfdbfe', filter: 'blur(70px)',
        top: -60, right: -80,
      }} />
      {/* Blob bottom-left */}
      <div style={{
        position: 'absolute', zIndex: 0, pointerEvents: 'none', opacity: 0.2,
        width: 300, height: 160, borderRadius: '50%',
        background: '#93c5fd', filter: 'blur(55px)',
        bottom: 0, left: 0,
      }} />

      {/* Navbar */}
      <nav style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', zIndex: 10, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="3" width="10" height="2" rx="1" fill="white" />
              <rect x="3" y="7.5" width="7" height="2" rx="1" fill="white" />
              <rect x="3" y="12" width="2" height="3" rx="1" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: theme === 'dark' ? '#f8fafc' : '#1e293b', letterSpacing: '-0.3px' }}>Attendify</span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 999,
            background: theme === 'dark' ? '#0f172a' : 'white', border: '1px solid #e2e8f0',
            fontSize: 13, fontWeight: 600, color: '#475569',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px 40px', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 999, padding: '5px 14px', marginBottom: 20,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.3px' }}>Secure Student Portal</span>
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 800, color: theme === 'dark' ? '#f8fafc' : '#0f172a', letterSpacing: '-0.8px', marginBottom: 8, lineHeight: 1.2 }}>
              Welcome <span style={{ color: '#2563eb' }}>Back</span>
            </h1>
            <p style={{ fontSize: 14, color: theme === 'dark' ? '#cbd5e1' : '#64748b', lineHeight: 1.6, fontWeight: 450 }}>
              Sign in to access your attendance dashboard
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: theme === 'dark' ? '#0f172a' : 'white', borderRadius: 24,
            padding: '32px 32px',
            boxShadow: '0 8px 40px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            border: theme === 'dark' ? '1px solid rgba(51,65,85,0.8)' : '1px solid rgba(219,234,254,0.8)',
          }}>

            {/* Role Selector */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>I am a...</p>
              <div className="role-selector-container" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'student', label: 'Student', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 14L2 9l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M6 11.5V17c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )},
                  { id: 'faculty', label: 'Faculty', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 21h8M12 16v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )},
                  { id: 'admin', label: 'Admin', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )},
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    className="role-button"
                    style={{
                      flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                      border: role === id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      background: role === id ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : (theme === 'dark' ? '#0f172a' : 'white'),
                      color: role === id ? '#ffffff' : (theme === 'dark' ? '#cbd5e1' : '#64748b'),
                      fontWeight: 700, fontSize: 13,
                      transition: 'all 0.2s',
                      boxShadow: role === id ? '0 2px 12px rgba(59,130,246,0.15)' : 'none',
                      minWidth: '80px'
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151', marginBottom: 8 }}>
                  Campus Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="john.doe@college.edu"
                    style={{
                      width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                      borderRadius: 14, border: theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                      fontSize: 14, color: theme === 'dark' ? '#f8fafc' : '#0f172a', background: theme === 'dark' ? '#1e293b' : '#f8fafc',
                      outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                      fontFamily: "'Inter', sans-serif", fontWeight: 500,
                    }}
                    onFocus={e => { e.target.style.border = '1.5px solid #3b82f6'; e.target.style.background = (theme === 'dark' ? '#0f172a' : 'white'); e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)'; }}
                    onBlur={e => { e.target.style.border = (theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0'); e.target.style.background = (theme === 'dark' ? '#1e293b' : '#f8fafc'); e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%', paddingLeft: 42, paddingRight: 44, paddingTop: 13, paddingBottom: 13,
                      borderRadius: 14, border: theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                      fontSize: 14, color: theme === 'dark' ? '#f8fafc' : '#0f172a', background: theme === 'dark' ? '#1e293b' : '#f8fafc',
                      outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                      fontFamily: "'Inter', sans-serif", fontWeight: 500,
                    }}
                    onFocus={e => { e.target.style.border = '1.5px solid #3b82f6'; e.target.style.background = (theme === 'dark' ? '#0f172a' : 'white'); e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)'; }}
                    onBlur={e => { e.target.style.border = (theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0'); e.target.style.background = (theme === 'dark' ? '#1e293b' : '#f8fafc'); e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 999,
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white', fontSize: 15, fontWeight: 700,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 6,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(59,130,246,0.5)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)'; }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>New to Attendify?</span>
              <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            </div>

            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 999, background: theme === 'dark' ? '#0f172a' : 'white',
                  border: theme === 'dark' ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                  fontSize: 14, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#374151',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#f8faff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = (theme === 'dark' ? '#0f172a' : 'white'); }}
              >
                Create an Account
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 24 }}>
            {[
              { icon: '🔒', label: 'Secure Login' },
              { icon: '📍', label: 'GPS Verified' },
              { icon: '⚡', label: 'Real-time' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                <span>{icon}</span>
                <span>{label}</span>
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
        
        @media (max-width: 420px) {
           .role-selector-container {
             gap: 6px !important;
           }
           .role-button {
             padding: 8px 6px !important;
             font-size: 11px !important;
             border-radius: 10px !important;
             gap: 4px !important;
           }
           .role-button svg {
             width: 14px !important;
             height: 14px !important;
           }
        }
      `}</style>
    </div>
  );
};

export default Login;
