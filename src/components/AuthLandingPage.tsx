import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Mail, User as UserIcon, ShieldAlert, Sparkles, Building2, Flame, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthLandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Registration form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Sign-in form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Error / Status feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load registered users from localStorage
  const getRegisteredUsers = (): any[] => {
    const stored = localStorage.getItem('forty_one_rules_registered_users');
    return stored ? JSON.parse(stored) : [];
  };

  // Save registered users to localStorage
  const saveRegisteredUsers = (users: any[]) => {
    localStorage.setItem('forty_one_rules_registered_users', JSON.stringify(users));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('All fields are required.');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const users = getRegisteredUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === registerEmail.toLowerCase());

    if (emailExists) {
      setError('An account with this email already exists.');
      return;
    }

    // Create new user record
    const newUser: User = {
      name: registerName.trim(),
      email: registerEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    };

    // Save with mock password storage (persistent local)
    const newUserRecord = {
      ...newUser,
      password: registerPassword
    };

    saveRegisteredUsers([...users, newUserRecord]);
    setSuccess('Registration successful! Please sign in to activate your 3-day wisdom trial.');
    
    // Reset inputs
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    
    // Switch to sign-in tab
    setTimeout(() => {
      setActiveTab('signin');
      setSuccess(null);
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Both email and password are required.');
      return;
    }

    const users = getRegisteredUsers();
    const userRecord = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!userRecord) {
      setError('No account found with this email. Please register first.');
      return;
    }

    if (userRecord.password !== loginPassword) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Success! Prepare user details
    const loggedInUser: User = {
      name: userRecord.name,
      email: userRecord.email,
      createdAt: userRecord.createdAt
    };

    onLoginSuccess(loggedInUser);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none select-none" />
      <div className="absolute -right-64 -bottom-64 w-[600px] h-[600px] bg-[#D4AF37]/3 blur-[180px] rounded-full pointer-events-none select-none" />

      {/* Top Header */}
      <header className="border-b border-[#1A1A1E] py-4 px-6 md:px-12 flex items-center justify-between relative z-10 bg-[#070708]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#D4AF37]/40 rounded-sm bg-[#111113]">
            <Building2 className="text-[#D4AF37] h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif tracking-widest text-sm text-white uppercase font-bold">FORTY-ONE RULES</h1>
            <p className="text-[9px] text-[#D4AF37] font-mono uppercase tracking-[0.2em] leading-none">Business Wisdom & Discipline</p>
          </div>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#8A8A8E] tracking-wider uppercase border border-[#1A1A1E] px-3 py-1.5 rounded-sm">
          3-Day Trial Activation
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-6 md:px-12 py-10 relative z-10">
        
        {/* Left Side: Pitch and Philosophy */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] block">
              Invincible Business Architecture
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight">
              The rules written for those who <span className="font-serif italic text-[#D4AF37]">build</span>, not just read.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[#8A8A8E] text-base leading-relaxed max-w-xl"
          >
            Enter the inner circle of tactical entrepreneurship. Forty-One concise, uncompromising business rules compiled to steel your mindset, maximize your daily discipline, and protect your investments.
          </motion.p>

          {/* Trial / Limits callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl"
          >
            <div className="p-4 bg-[#0B0B0C] border border-[#1A1A1E] rounded-sm space-y-1">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">Trial Access</span>
              <h4 className="text-sm font-medium text-white">3 Days of Complete Wisdom</h4>
              <p className="text-xs text-gray-400">Unlock the first 3 core rules immediately and study daily discipline free for 3 days.</p>
            </div>

            <div className="p-4 bg-[#0B0B0C] border border-[#1A1A1E] rounded-sm space-y-1">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">Lifetime Offer</span>
              <h4 className="text-sm font-medium text-white">Unlimited Mastery License</h4>
              <p className="text-xs text-gray-400">Upgrade to Lifetime Wisdom for R1 499 to unlock all 41 rules, audio playback, and custom AI inquiries.</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Tabbed Form */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0B0B0C] border border-[#1A1A1E] p-6 md:p-8 rounded-sm shadow-2xl space-y-6"
          >
            {/* Tabs */}
            <div className="flex border-b border-[#1A1A1E]">
              <button
                onClick={() => {
                  setActiveTab('signin');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-xs font-mono uppercase tracking-widest transition-all relative ${
                  activeTab === 'signin' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Sign In
                {activeTab === 'signin' && (
                  <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37]" />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-xs font-mono uppercase tracking-widest transition-all relative ${
                  activeTab === 'register' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Register
                {activeTab === 'register' && (
                  <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37]" />
                )}
              </button>
            </div>

            {/* Error & Success Feedback */}
            {error && (
              <div className="bg-red-950/20 border border-red-500/30 p-3 rounded text-xs text-red-400 flex items-start gap-2">
                <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded text-xs text-emerald-400 flex items-start gap-2">
                <Sparkles size={14} className="flex-shrink-0 mt-0.5 text-[#D4AF37]" />
                <span>{success}</span>
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. founder@company.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full bg-[#121214] border border-[#1A1A1E] focus:border-[#D4AF37] rounded-sm text-sm px-10 py-2.5 outline-none transition-all text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Access Key (Password)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="Enter secure passcode"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-[#121214] border border-[#1A1A1E] focus:border-[#D4AF37] rounded-sm text-sm px-10 py-2.5 outline-none transition-all text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#bfa02e] text-black font-mono font-bold text-[10px] uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg"
                >
                  Enter Wisdom Chamber <ArrowRight size={12} />
                </button>
                <p className="text-[10px] text-center text-gray-500 font-mono pt-1">
                  New builder? Switch to the Register tab above.
                </p>
              </form>
            ) : (
              /* Registration Form */
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="Your professional name"
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      className="w-full bg-[#121214] border border-[#1A1A1E] focus:border-[#D4AF37] rounded-sm text-sm px-10 py-2.5 outline-none transition-all text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. founder@company.com"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      className="w-full bg-[#121214] border border-[#1A1A1E] focus:border-[#D4AF37] rounded-sm text-sm px-10 py-2.5 outline-none transition-all text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Create Secure Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      className="w-full bg-[#121214] border border-[#1A1A1E] focus:border-[#D4AF37] rounded-sm text-sm px-10 py-2.5 outline-none transition-all text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white hover:bg-gray-200 text-black font-mono font-bold text-[10px] uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg"
                >
                  Activate Wisdom Trial <ArrowRight size={12} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1E] py-6 text-center text-[10px] font-mono text-gray-500 tracking-wider uppercase relative z-10 bg-[#070708]/90">
        © 2026 FORTY-ONE RULES • WISDOM • DISCIPLINE • ENTREPRENEURSHIP • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};
