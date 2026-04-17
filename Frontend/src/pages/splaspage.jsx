import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { 
  GraduationCap, 
  MapPin, 
  BarChart3, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Users,
  Smartphone
} from 'lucide-react';

const SplashPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className={`p-8 rounded-3xl transition-all duration-300 border ${
      theme === 'dark' 
        ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60' 
        : 'bg-white/40 border-blue-100 hover:border-blue-300 hover:bg-white/60'
    } backdrop-blur-xl group`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
        theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
      }`}>
        <Icon size={28} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        {title}
      </h3>
      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
        {description}
      </p>
    </div>
  );

  const Step = ({ number, title, description, isLast }) => (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
          theme === 'dark' 
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
            : 'bg-blue-50 border-blue-200 text-blue-600'
        }`}>
          {number}
        </div>
        {!isLast && <div className={`w-0.5 h-32 ${theme === 'dark' ? 'bg-slate-800' : 'bg-blue-100'}`} />}
      </div>
      <div className="pt-2">
        <h4 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          {title}
        </h4>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} max-w-md leading-relaxed`}>
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-800'
    }`} style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] transition-colors duration-700 ${
          theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/10'
        }`} />
        <div className={`absolute top-1/2 -left-24 w-80 h-80 rounded-full blur-[100px] transition-colors duration-700 ${
          theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-400/10'
        }`} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? (theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 py-3' : 'bg-white/80 backdrop-blur-lg border-b border-slate-200 py-3')
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span className={`text-xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Attendify
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'How It Works', 'Policy'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                className={`text-sm font-semibold transition-colors hover:text-blue-500 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              Sign In
            </button>

            <button 
              className="md:hidden p-2 text-slate-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`absolute top-full left-0 right-0 border-b p-6 md:hidden animate-in fade-in slide-in-from-top-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex flex-col gap-4">
              {['Features', 'How It Works', 'Policy'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                  className={`text-left text-lg font-medium py-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  {item}
                </button>
              ))}
              <hr className={theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} />
              <button
                onClick={() => navigate('/register')}
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border backdrop-blur-md ${
              theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Secure Campus Hub</span>
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Smart <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Attendance</span> for Next-Gen Colleges
            </h1>
            
            <p className={`text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Eliminate proxy attendance with secure location-based verification. Real-time tracking, deep analytics, and seamless academic integration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-lg shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Start for Free <ChevronRight size={20} />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className={`w-full sm:w-auto px-10 py-5 rounded-2xl border font-bold text-lg transition-all ${
                  theme === 'dark' 
                    ? 'border-slate-700 text-white hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-700 hover:bg-white hover:shadow-xl'
                }`}
              >
                Watch Demo
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span className="text-sm font-semibold">10k+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">99.9% Accuracy</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Visual element representing the system */}
            <div className="relative z-10 w-full aspect-square md:aspect-[4/3] lg:aspect-square xl:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
              <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-700 ${
                theme === 'dark' ? 'from-blue-600/20 to-indigo-900/40' : 'from-blue-50 to-indigo-100'
              }`} />
              
              {/* Floating UI Mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[80%] rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <div className="h-12 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
                      <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-500">85%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                          <BarChart3 className="text-indigo-500" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
                          <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating Status Card */}
                <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-blue-50 dark:border-slate-800 flex items-center gap-3 animate-bounce">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold dark:text-white">Attendance Marked</p>
                    <p className="text-[10px] text-slate-500">Verified by GPS</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Background elements for image */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Everything you need for <br/> <span className="text-blue-500">Seamless Management</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Built with cutting-edge technology to ensure security, speed, and reliability for students and teachers alike.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={GraduationCap}
              title="Smart Automation"
              description="Automatic attendance tracking and instant verification, reducing manual effort and minimizing errors."
            />
            <FeatureCard 
              icon={MapPin}
              title="GPS Geofencing"
              description="Verification logic that ensures students are physically within the classroom boundaries before marking."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Deep Analytics"
              description="Comprehensive dashboards for students and faculty to track attendance trends and subject-wise logs."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure Records"
              description="End-to-end encrypted storage ensures all attendance records are tamper-proof and cloud-synced."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-24 px-6 relative overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900/50' : 'bg-blue-50/50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid gap-12">
                <Step 
                  number="01"
                  title="Create Session"
                  description="Faculty members choose their subject and start a live attendance session from their dashboard."
                />
                <Step 
                  number="02"
                  title="Mark Attendance"
                  description="Students open their Attendify app, securely authenticate, and mark their presence in the classroom."
                />
                <Step 
                  number="03"
                  title="Verify Presence"
                  description="The system automatically checks the student's GPS location to confirm they are inside the classroom."
                />
                <Step 
                  number="04"
                  title="Instant Insight"
                  description="Attendance is logged instantly, updating student records and faculty reports in real-time."
                  isLast={true}
                />
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                <h2 className={`text-4xl md:text-5xl font-black mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Simple Workflow. <br/> <span className="text-blue-500">Robust Results.</span>
                </h2>
                <div className={`p-8 rounded-[2rem] border overflow-hidden relative ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-blue-100 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                        <Smartphone size={24} />
                      </div>
                      <h4 className="font-bold">Student App</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                      theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-blue-100 bg-blue-50/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-500 border border-slate-100 dark:border-slate-700">
                            <BarChart3 size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">Overall Attendance</p>
                            <p className="text-xs text-slate-500">Current Semester</p>
                          </div>
                        </div>
                        <span className="text-lg font-black text-blue-500">78%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[78%] rounded-full" />
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl flex items-center justify-between ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-blue-500" />
                        <span className="text-sm font-bold">Classroom GPS</span>
                      </div>
                      <span className="text-xs font-bold text-green-500">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Section */}
      <section id="policy" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`w-20 h-20 rounded-3xl mx-auto mb-10 flex items-center justify-center ${
            theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <ShieldCheck size={40} />
          </div>
          <h2 className={`text-3xl md:text-5xl font-black mb-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Security & Compliance <span className="text-blue-500">Policy</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className={`p-8 rounded-3xl border ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" size={20} /> Data Privacy
              </h4>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                We respect your privacy. Location data is only accessed during the scan process to confirm classroom presence. We never track your movement outside the campus or store background coordinates.
              </p>
            </div>
            <div className={`p-8 rounded-3xl border ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-blue-500" size={20} /> System Integrity
              </h4>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Proxy attendance is strictly prohibited. Our secure verification system is designed to maintain academic honesty and provide fair records for all students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t px-6 ${
        theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <GraduationCap size={16} />
            </div>
            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Attendify</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-500 transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-500 transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('policy')} className="hover:text-blue-500 transition-colors">Privacy</button>
            <a href="mailto:support@attendify.com" className="hover:text-blue-500 transition-colors">Support</a>
          </div>

          <p className="text-sm text-slate-500">
            &copy; 2026 Attendify Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default SplashPage;
