import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: 'Smart College',
    titleSpan: 'Attendance',
    subtitle: 'Track your attendance securely with location and QR code verification',
  },
  {
    title: 'Real-Time',
    titleSpan: 'QR Scanning',
    subtitle: 'Faculty creates live sessions, students scan and mark presence instantly',
  },
  {
    title: 'GPS-Verified',
    titleSpan: 'Presence',
    subtitle: 'Location-based geofencing ensures students are physically in class',
  },
  {
    title: 'Your Attendance',
    titleSpan: 'Dashboard',
    subtitle: 'View subject-wise analytics, history and low attendance alerts in one place',
  },
];

const SplashPage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const handleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
      setAnimating(false);
    }, 300);
  };

  const handleDot = (idx) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveSlide(idx);
      setAnimating(false);
    }, 300);
  };

  const slide = slides[activeSlide];

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen w-full flex flex-col overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% 30%, #dbeafe 0%, #f0f9ff 40%, #ffffff 80%)',
        }}
      />
      {/* Soft cloud blobs in BG */}
      <div
        className="absolute -z-10 opacity-30 pointer-events-none"
        style={{
          width: 520,
          height: 220,
          borderRadius: '50%',
          background: '#bfdbfe',
          filter: 'blur(70px)',
          top: -60,
          right: -80,
        }}
      />
      <div
        className="absolute -z-10 opacity-20 pointer-events-none"
        style={{
          width: 300,
          height: 160,
          borderRadius: '50%',
          background: '#93c5fd',
          filter: 'blur(55px)',
          bottom: 0,
          left: 0,
        }}
      />

      {/* ---- NAVBAR ---- */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-12 py-5 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
            }}
          >
            {/* Simple F icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="3" width="10" height="2" rx="1" fill="white" />
              <rect x="3" y="7.5" width="7" height="2" rx="1" fill="white" />
              <rect x="3" y="12" width="2" height="3" rx="1" fill="white" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1e293b',
              letterSpacing: '-0.3px',
            }}
          >
            Attendify
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-8">
          {['Features', 'How It Works', 'Policy'].map((link) => (
            <button
              key={link}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#475569',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#2563eb')}
              onMouseLeave={(e) => (e.target.style.color = '#475569')}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Sign In */}
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 24px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 18px rgba(59,130,246,0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(59,130,246,0.4)';
          }}
        >
          Sign In
        </button>
      </nav>

      {/* ---- HERO SECTION ---- */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-16 pt-4 pb-10 gap-8 lg:gap-0">
        {/* Left column – Text */}
        <div
          className="flex flex-col items-start max-w-[480px] z-10"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 999,
              padding: '5px 14px',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'inline-block',
              }}
            />
            <span
              style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.3px' }}
            >
              College Attendance System
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 5vw, 52px)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: 18,
            }}
          >
            {slide.title}{' '}
            <span style={{ color: '#2563eb' }}>{slide.titleSpan}</span>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#64748b',
              lineHeight: 1.7,
              fontWeight: 450,
              maxWidth: 380,
              marginBottom: 36,
            }}
          >
            {slide.subtitle}
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {[
              { icon: '📍', label: 'GPS Verified' },
              { icon: '⚡', label: 'Real-time' },
              { icon: '🔒', label: 'Secure' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#475569',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column – Illustration */}
        <div
          className="relative flex-1 flex items-center justify-center lg:justify-end"
          style={{ minHeight: 340, maxWidth: 560 }}
        >
          {/* Glowing circle behind image */}
          <div
            style={{
              position: 'absolute',
              width: 380,
              height: 380,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(147,197,253,0.45) 0%, rgba(219,234,254,0.2) 60%, transparent 80%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
            }}
          />

          {/* Floating QR Badge */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              right: 30,
              background: 'white',
              borderRadius: 16,
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 10,
              border: '1px solid #f1f5f9',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
                <rect x="3" y="3" width="5" height="5" rx="0.5" fill="white" opacity="0.5" />
                <rect x="11" y="2" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
                <rect x="12" y="3" width="5" height="5" rx="0.5" fill="white" opacity="0.5" />
                <rect x="2" y="11" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
                <rect x="3" y="12" width="5" height="5" rx="0.5" fill="white" opacity="0.5" />
                <rect x="11" y="11" width="3" height="3" rx="0.5" fill="white" />
                <rect x="15" y="11" width="3" height="3" rx="0.5" fill="white" />
                <rect x="11" y="15" width="3" height="3" rx="0.5" fill="white" />
                <rect x="15" y="15" width="3" height="3" rx="0.5" fill="white" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                Scan &amp; Attend
              </p>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>QR Active Now</p>
            </div>
          </div>

          {/* Floating Verified Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 10,
              background: 'white',
              borderRadius: 14,
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 10,
              border: '1px solid #f1f5f9',
              animation: 'float 3.5s ease-in-out infinite 0.5s',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7.5L5.5 10.5L11.5 4"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#15803d', lineHeight: 1.2 }}>
                Location Verified
              </p>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Within 50m radius</p>
            </div>
          </div>

          {/* Main illustration */}
          <img
            src="/hero-illustration.png"
            alt="Students using attendance system"
            onError={(e) => {
              // Fallback inline SVG scene
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
            style={{
              width: '100%',
              maxWidth: 500,
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 20px 40px rgba(59,130,246,0.12))',
            }}
          />
          {/* Inline SVG fallback */}
          <svg
            display="none"
            viewBox="0 0 500 360"
            style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 2 }}
          >
            {/* College building */}
            <rect x="30" y="160" width="120" height="130" rx="4" fill="#cbd5e1" opacity="0.5" />
            <rect x="50" y="130" width="80" height="30" rx="2" fill="#94a3b8" opacity="0.4" />
            {[55, 75, 95, 115].map((x, i) => (
              <rect key={i} x={x} y="130" width="8" height="30" rx="1" fill="#64748b" opacity="0.4" />
            ))}
            {/* Trees */}
            <circle cx="170" cy="230" r="30" fill="#86efac" opacity="0.7" />
            <circle cx="155" cy="245" r="22" fill="#4ade80" opacity="0.6" />
            <circle cx="340" cy="235" r="28" fill="#86efac" opacity="0.7" />
            {/* Big screen/board */}
            <rect x="160" y="70" width="180" height="200" rx="16" fill="white" stroke="#bfdbfe" strokeWidth="3" />
            <rect x="170" y="80" width="160" height="180" rx="10" fill="#f0f9ff" />
            {/* QR code approximation */}
            <rect x="195" y="110" width="50" height="50" rx="4" fill="#1e40af" opacity="0.15" />
            <rect x="205" y="120" width="30" height="30" rx="2" fill="#1e40af" opacity="0.25" />
            <rect x="210" y="125" width="20" height="20" rx="1" fill="#2563eb" opacity="0.4" />
            {/* Clock at top */}
            <circle cx="250" cy="75" r="22" fill="white" stroke="#3b82f6" strokeWidth="3" />
            <line x1="250" y1="63" x2="250" y2="75" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="250" y1="75" x2="258" y2="80" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Left student */}
            <ellipse cx="130" cy="290" rx="28" ry="10" fill="#bfdbfe" opacity="0.5" />
            <rect x="118" y="200" width="24" height="70" rx="4" fill="#3b82f6" />
            <circle cx="130" cy="185" r="18" fill="#fbbf24" />
            <rect x="105" y="210" width="18" height="30" rx="8" fill="#2563eb" opacity="0.6" />
            <rect x="140" y="215" width="18" height="25" rx="4" fill="#60a5fa" />
            {/* Right student */}
            <ellipse cx="370" cy="290" rx="28" ry="10" fill="#bfdbfe" opacity="0.5" />
            <rect x="358" y="200" width="24" height="70" rx="4" fill="#fbbf24" />
            <circle cx="370" cy="185" r="18" fill="#854d0e" opacity="0.7"/>
            <circle cx="370" cy="185" r="18" fill="#d97706" />
            <rect x="380" y="215" width="18" height="25" rx="4" fill="#60a5fa" />
          </svg>
        </div>
      </div>

      {/* ---- GET STARTED BUTTON + DOTS ---- */}
      <div className="flex flex-col items-center justify-center pb-10 gap-6 z-10">
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '16px 52px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(59,130,246,0.45)',
            letterSpacing: '-0.2px',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.45)';
          }}
        >
          Get Started
        </button>

        {/* Pagination Dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDot(idx)}
              style={{
                width: idx === activeSlide ? 24 : 8,
                height: 8,
                borderRadius: 999,
                background: idx === activeSlide ? '#2563eb' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default SplashPage;
