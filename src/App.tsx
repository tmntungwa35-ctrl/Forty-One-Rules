import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  BookOpen, 
  Bookmark, 
  PenSquare, 
  Volume2, 
  VolumeX, 
  Flame, 
  Check, 
  Sparkles, 
  Search, 
  Calendar,
  Compass,
  CheckCircle2,
  Clock,
  Heart,
  Lock,
  Image,
  User as UserIcon
} from 'lucide-react';

import { RULES } from './data';
import { UserProgress, User } from './types';
import JournalPanel from './components/JournalPanel';
import DirectoryModal from './components/DirectoryModal';
import ElaborationPanel from './components/ElaborationPanel';
import BillingModal from './components/BillingModal';
import { ShareImageModal } from './components/ShareImageModal';
import { ShareModal } from './components/ShareModal';
import { AuthLandingPage } from './components/AuthLandingPage';

export default function App() {
  // User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Local time & Date calculation
  const [formattedDate, setFormattedDate] = useState('');
  const [todayRuleId, setTodayRuleId] = useState(1);

  // App active states
  const [currentRuleId, setCurrentRuleId] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isElaborateOpen, setIsElaborateOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isShareImageOpen, setIsShareImageOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Mindfulness focus session state
  const [isFocusSession, setIsFocusSession] = useState(false);
  const [focusTimer, setFocusTimer] = useState(60); // 60 seconds mindfulness timer
  const [breathState, setBreathState] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // User persistent progress
  const [progress, setProgress] = useState<UserProgress>({
    completedRules: [],
    streak: 0,
    lastReadDate: null,
    favoriteRules: [],
    tier: 'free',
    dailyQueriesUsed: 0,
    lastQueryResetDate: null,
    lastViewedRuleId: 1
  });

  // Calculate day-of-year and deterministic daily rule
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    setFormattedDate(dateStr);

    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const calculatedId = (dayOfYear % 41) + 1;
    setTodayRuleId(calculatedId);
    // Fix: Do not force currentRuleId to calculatedId here so we remain on Day 1/sequence
  }, []);

  // Load progress from localStorage and check query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ruleParam = params.get('rule');
    const targetRuleId = ruleParam ? parseInt(ruleParam, 10) : null;
    const isValidRule = targetRuleId && targetRuleId >= 1 && targetRuleId <= 41;

    const stored = localStorage.getItem('forty_one_rules_progress');
    const todayStr = new Date().toDateString();
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserProgress;
        
        // Reset daily queries if day changed
        const lastReset = parsed.lastQueryResetDate || null;
        const queriesUsed = lastReset === todayStr ? (parsed.dailyQueriesUsed || 0) : 0;

        const restoredRuleId = parsed.lastViewedRuleId || 1;
        const finalRuleId = isValidRule && targetRuleId ? targetRuleId : restoredRuleId;
        setCurrentRuleId(finalRuleId);

        setProgress({
          completedRules: parsed.completedRules || [],
          streak: parsed.streak || 0,
          lastReadDate: parsed.lastReadDate || null,
          favoriteRules: parsed.favoriteRules || [],
          tier: parsed.tier || 'free',
          dailyQueriesUsed: queriesUsed,
          lastQueryResetDate: todayStr,
          lastViewedRuleId: finalRuleId
        });
      } catch (err) {
        console.error("Error parsing progress", err);
      }
    } else {
      const finalRuleId = isValidRule && targetRuleId ? targetRuleId : 1;
      setCurrentRuleId(finalRuleId);
      setProgress({
        completedRules: [],
        streak: 0,
        lastReadDate: null,
        favoriteRules: [],
        tier: 'free',
        dailyQueriesUsed: 0,
        lastQueryResetDate: todayStr,
        lastViewedRuleId: finalRuleId
      });
    }
  }, []);

  // Load user session on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('forty_one_rules_current_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error loading user session", err);
      }
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('forty_one_rules_current_user');
    setIsJournalOpen(false);
    setIsDirectoryOpen(false);
    setIsElaborateOpen(false);
    setIsBillingOpen(false);
    setIsShareImageOpen(false);
    setIsShareOpen(false);
    stopSpeech();
  };

  const handleDownloadComplete = (ruleId: number) => {
    const downloadedRules = progress.downloadedRules || [];
    if (!downloadedRules.includes(ruleId)) {
      const updated = [...downloadedRules, ruleId];
      saveProgress({
        ...progress,
        downloadedRules: updated
      });
    }
  };

  // Sync state helper to save to localstorage
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('forty_one_rules_progress', JSON.stringify(newProgress));
  };

  const incrementQueryCount = () => {
    const todayStr = new Date().toDateString();
    const newCount = (progress.dailyQueriesUsed || 0) + 1;
    saveProgress({
      ...progress,
      dailyQueriesUsed: newCount,
      lastQueryResetDate: todayStr
    });
  };

  const handleUpgradeTier = (newTier: 'free' | 'standard' | 'elite') => {
    saveProgress({
      ...progress,
      tier: newTier
    });
  };

  // Mark current rule as read/completed & calculate streaks
  const handleMarkComplete = () => {
    if ((progress.tier || 'free') === 'free' && currentRuleId > 3) {
      setIsBillingOpen(true);
      return;
    }

    const alreadyCompleted = progress.completedRules.includes(currentRuleId);
    let updatedCompleted = [...progress.completedRules];
    if (!alreadyCompleted) {
      updatedCompleted.push(currentRuleId);
    }

    // Streak calculation
    const todayStr = new Date().toDateString();
    let newStreak = progress.streak;

    if (progress.lastReadDate !== todayStr) {
      if (progress.lastReadDate) {
        const lastDate = new Date(progress.lastReadDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last read was yesterday or today, increment streak. Otherwise reset
        if (lastDate.toDateString() === yesterday.toDateString() || lastDate.toDateString() === todayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1; // First time
      }
    }

    saveProgress({
      ...progress,
      completedRules: updatedCompleted,
      streak: newStreak,
      lastReadDate: todayStr
    });
  };

  // Toggle favorite/bookmark status
  const toggleFavorite = (id: number) => {
    if ((progress.tier || 'free') === 'free' && id > 3) {
      setIsBillingOpen(true);
      return;
    }

    const isFav = progress.favoriteRules.includes(id);
    let updatedFavorites = [...progress.favoriteRules];
    if (isFav) {
      updatedFavorites = updatedFavorites.filter(ruleId => ruleId !== id);
    } else {
      updatedFavorites.push(id);
    }
    saveProgress({
      ...progress,
      favoriteRules: updatedFavorites
    });
  };

  // Navigating between rules with sliding animations
  const handleNext = () => {
    stopSpeech();
    setSlideDirection('right');
    const nextRuleId = currentRuleId === 41 ? 1 : currentRuleId + 1;
    setCurrentRuleId(nextRuleId);
    saveProgress({
      ...progress,
      lastViewedRuleId: nextRuleId
    });
  };

  const handlePrev = () => {
    stopSpeech();
    setSlideDirection('left');
    const prevRuleId = currentRuleId === 1 ? 41 : currentRuleId - 1;
    setCurrentRuleId(prevRuleId);
    saveProgress({
      ...progress,
      lastViewedRuleId: prevRuleId
    });
  };

  const selectSpecificRule = (id: number) => {
    stopSpeech();
    setSlideDirection(id > currentRuleId ? 'right' : 'left');
    setCurrentRuleId(id);
    saveProgress({
      ...progress,
      lastViewedRuleId: id
    });
  };

  // Share Wisdom (Copy text block to clipboard)
  const handleShare = () => {
    const activeRule = RULES.find(r => r.id === currentRuleId);
    if (!activeRule) return;

    const shareText = `--- Forty-One Rules of Business Wisdom ---
Rule ${activeRule.id}: "${activeRule.statement}"
Chapter ${activeRule.chapterNumber}: ${activeRule.chapterTitle}
${activeRule.description}
----------------------------------------
Meditation and inspiration for tomorrow's entrepreneurs.`;

    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error("Failed to copy text", err);
    });
  };

  // Speak Wisdom using browser SpeechSynthesis
  const startSpeech = () => {
    const isLocked = (progress.tier || 'free') === 'free' && currentRuleId > 3;
    if (isLocked) {
      setIsBillingOpen(true);
      return;
    }

    const activeRule = RULES.find(r => r.id === currentRuleId);
    if (!activeRule) return;

    // Stop current
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const textToRead = `Rule number ${activeRule.id}. ${activeRule.statement}. ${activeRule.description}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95; // Slightly slower, calm cadence
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setSpeechUtterance(utterance);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Mindfulness Breath cycle focus timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isFocusSession && focusTimer > 0) {
      timerId = setTimeout(() => {
        setFocusTimer(prev => prev - 1);
        
        // Simulated breath instruction every 5 seconds
        const breathCycle = focusTimer % 15;
        if (breathCycle > 10) {
          setBreathState('Inhale');
        } else if (breathCycle > 5) {
          setBreathState('Hold');
        } else {
          setBreathState('Exhale');
        }
      }, 1000);
    } else if (focusTimer === 0) {
      setIsFocusSession(false);
      handleMarkComplete(); // Automatically mark complete upon focusing!
    }
    return () => clearTimeout(timerId);
  }, [isFocusSession, focusTimer]);

  const startFocusSession = () => {
    setFocusTimer(60);
    setBreathState('Inhale');
    setIsFocusSession(true);
  };

  const stopFocusSession = () => {
    setIsFocusSession(false);
  };

  const currentRule = RULES.find(r => r.id === currentRuleId) || RULES[0];
  const isCurrentRuleCompleted = progress.completedRules.includes(currentRuleId);
  const isCurrentRuleFavorite = progress.favoriteRules.includes(currentRuleId);

  // Compute stats
  const completionPercentage = Math.round((progress.completedRules.length / 41) * 100);

  // Find upcoming 3 rules
  const upcomingRules = [];
  for (let i = 1; i <= 3; i++) {
    const upcomingId = ((currentRuleId + i - 1) % 41) + 1;
    const r = RULES.find(rule => rule.id === upcomingId);
    if (r) upcomingRules.push(r);
  }

  // Animation configuration
  const cardVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 120 : -120,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -120 : 120,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.15 },
        scale: { duration: 0.15 }
      }
    })
  };

  // Account age & limitation calculations
  const getDaysSinceSignUp = () => {
    if (!currentUser) return 1;
    const signUpDate = new Date(currentUser.createdAt);
    const today = new Date();
    // Calculate difference in calendar days
    const diffTime = today.getTime() - signUpDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const daysSinceSignUp = getDaysSinceSignUp();
  const isTrialExpired = daysSinceSignUp > 3 && (progress.tier || 'free') !== 'elite';

  if (!currentUser) {
    return (
      <AuthLandingPage 
        onLoginSuccess={(u) => { 
          setCurrentUser(u); 
          localStorage.setItem('forty_one_rules_current_user', JSON.stringify(u)); 
        }} 
      />
    );
  }

  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Ambient top light */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none select-none" />
        <div className="absolute w-[400px] h-[400px] bg-red-950/5 blur-[120px] rounded-full pointer-events-none select-none" />

        <div className="max-w-md w-full bg-[#0B0B0C] border border-red-500/20 p-8 rounded-sm text-center space-y-6 shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Lock size={28} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-[0.25em] block font-bold">
              Trial Blockade Active
            </span>
            <h2 className="font-serif text-2xl text-white">Your 3-Day Free Trial has Expired</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              The Rules of Business Wisdom are reserved for active builders. You have reached the limit of your 3-day trial session since registering on <strong className="text-white">{new Date(currentUser.createdAt).toLocaleDateString()}</strong>.
            </p>
          </div>

          {/* Offer highlight */}
          <div className="p-4 bg-[#121214] border border-red-500/10 rounded text-left space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
              <Sparkles size={12} className="animate-spin text-[#D4AF37]" /> Lifetime Wisdom License
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Invest once-off to gain full unrestricted lifetime access. No renewals, no monthly subscription fatigue.
            </p>
            <ul className="space-y-1.5 text-[10px] text-[#8A8A8E]">
              <li className="flex items-center gap-2">✔ Complete access to all 41 rules for life</li>
              <li className="flex items-center gap-2">✔ Unlimited high-resolution non-transferable PNG downloads</li>
              <li className="flex items-center gap-2">✔ Unlimited queries with the customized Elaboration AI</li>
              <li className="flex items-center gap-2">✔ Dynamic Speed & Kadence Audio Speech Engine</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsBillingOpen(true)}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#bfa02e] text-black font-mono font-bold text-[10px] uppercase tracking-widest rounded-sm transition-all shadow-lg"
            >
              Purchase Lifetime License (R1 499)
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-transparent border border-[#222226] text-gray-400 hover:text-white hover:bg-white/5 font-mono text-[9px] uppercase tracking-widest rounded-sm transition-all"
            >
              Sign Out of Session
            </button>
          </div>
        </div>

        {/* Embedded Premium Billing License & Subscriptions Modal inside the blockade */}
        <BillingModal 
          isOpen={isBillingOpen}
          onClose={() => setIsBillingOpen(false)}
          progress={progress}
          onUpgrade={handleUpgradeTier}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-white relative overflow-x-hidden">
      
      {/* Decorative Gold Radial Background Ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-800/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Application Outer Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col p-6 md:p-12 relative z-10 justify-between gap-10">
        
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#1A1A1E]">
          <div className="flex flex-col">
            <h1 className="text-[10px] uppercase tracking-[0.42em] text-[#8A8A8E] mb-1 font-semibold flex items-center gap-1.5">
              <Sparkles size={10} className="text-[#D4AF37] animate-pulse" /> Forty-One Rules
            </h1>
            <button 
              onClick={() => setIsDirectoryOpen(true)}
              className="text-left font-serif italic text-2xl hover:text-[#D4AF37] transition-colors group flex items-center gap-2"
              title="Open the Wisdom Register"
            >
              Unwritten Wisdom
              <Search size={14} className="text-gray-600 group-hover:text-[#D4AF37] transition-colors mt-1" />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
            {/* User Profile & Trial Badge */}
            <div className="flex items-center gap-2.5 bg-[#121214] border border-[#1A1A1E] px-3 py-1.5 rounded text-left">
              <div className="p-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full">
                <UserIcon size={12} />
              </div>
              <div className="hidden xs:block">
                <p className="text-[10px] text-white font-bold leading-none truncate max-w-[90px]">{currentUser?.name}</p>
                <p className="text-[9px] text-gray-500 font-mono leading-none mt-0.5 truncate max-w-[90px]">{currentUser?.email}</p>
              </div>
              <div className="h-4 w-[1px] bg-[#1A1A1E] hidden xs:block" />
              <div>
                {(progress.tier || 'free') === 'elite' ? (
                  <span className="text-[8px] uppercase tracking-wider font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-1 py-0.5 rounded bg-[#D4AF37]/5 font-bold">Lifetime</span>
                ) : (
                  <span className="text-[8px] uppercase tracking-wider font-mono text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded bg-emerald-950/10">Trial Day {daysSinceSignUp}/3</span>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="text-[9px] uppercase tracking-wider text-red-400 hover:text-red-300 font-mono underline ml-0.5"
                title="Sign out of Wisdom Session"
              >
                Logout
              </button>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-2 bg-[#121214] border border-[#1A1A1E] px-3.5 py-1.5 rounded">
              <Flame size={14} className={progress.streak > 0 ? "text-[#D4AF37] fill-[#D4AF37] animate-bounce" : "text-gray-600"} />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest text-[#55555A]">Morning Streak</p>
                <p className="text-xs font-mono font-bold text-white">{progress.streak} {progress.streak === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="text-right hidden xs:block">
                <p className="text-[9px] uppercase tracking-widest text-[#55555A]">Morning Routine</p>
                <p className="text-xs text-[#A0A0A5]">{formattedDate || "A Fresh Start"}</p>
              </div>
              <button 
                onClick={() => setIsDirectoryOpen(true)}
                className="w-10 h-10 border border-[#2A2A2E] hover:border-[#D4AF37] flex items-center justify-center rounded-full transition-all bg-[#0F0F11]/40"
                title="Browse Full Register"
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${isCurrentRuleCompleted ? 'bg-[#D4AF37] scale-150 animate-pulse' : 'bg-zinc-600'}`}></div>
              </button>
            </div>
          </div>
        </header>

        {/* Interactive Mindfulness Focus Banner if Active */}
        {isFocusSession && (
          <div className="bg-[#121214] border border-[#D4AF37]/30 p-6 rounded-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-[#D4AF37]" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[#D4AF37] flex items-center justify-center relative">
                <div className="absolute inset-1.5 bg-[#D4AF37]/10 rounded-full animate-ping" />
                <Clock size={16} className="text-[#D4AF37]" />
              </div>
              <div className="text-left">
                <h4 className="font-serif italic text-base text-white">Wisdom Reflection Meditation</h4>
                <p className="text-xs text-[#8A8A8E] mt-0.5">Let your eyes rest on the unwritten rule. Breath instruction: <strong className="text-white uppercase font-mono tracking-wider">{breathState}</strong></p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Focusing Timer</p>
                <p className="text-3xl font-serif text-white">{focusTimer}s</p>
              </div>
              <button 
                onClick={stopFocusSession}
                className="px-4 py-2 border border-[#2A2A2E] text-white hover:text-red-400 hover:border-red-500/20 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all"
              >
                Exit Session
              </button>
            </div>
          </div>
        )}

        {/* Main Section */}
        <main className="flex-1 flex flex-col lg:flex-row gap-12 items-stretch my-2">
          
          {/* Wisdom Card Stage (Sliding) */}
          <div className="flex-1 relative flex flex-col justify-between min-h-[440px] select-none z-10 pt-4">
            
            {/* Massive Background Numeral */}
            <div className="absolute -top-14 -left-12 opacity-[0.03] select-none pointer-events-none">
              <span className="text-[280px] font-serif font-bold leading-none text-white">{currentRuleId}</span>
            </div>

            {/* Slide Container */}
            <div className="relative z-10 flex-1 flex flex-col justify-between">
              
              {/* Card Animation Stage */}
              <div className="overflow-hidden relative flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={currentRuleId}
                    custom={slideDirection}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6 py-6 text-left"
                  >
                    {/* Chapter & Recommendation Tags */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-semibold font-mono">
                        Day {currentRuleId} • Rule {currentRuleId} of 41
                      </span>
                      <span className="text-gray-600 font-mono text-[10px]">•</span>
                      <span className="text-gray-400 text-[10px] uppercase tracking-widest font-mono">
                        Ch.{currentRule.chapterNumber}: {currentRule.chapterTitle}
                      </span>
                      {currentRuleId === todayRuleId && (progress.tier || 'free') !== 'free' && (
                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-[#D4AF37]/20 font-bold flex items-center gap-1 animate-pulse">
                          <Sparkles size={8} /> Recommended Today
                        </span>
                      )}
                    </div>

                    {((progress.tier || 'free') === 'free' && currentRuleId > 3) ? (
                      <div className="p-6 md:p-8 border border-[#D4AF37]/20 bg-[#121214]/60 rounded-md space-y-5 text-left relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center gap-2.5 text-[#D4AF37]">
                          <Lock size={18} className="animate-pulse" />
                          <h3 className="font-serif italic text-lg md:text-xl">Manuscript Segment Locked</h3>
                        </div>

                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl font-sans">
                          To maintain exclusive licensing, access to <strong className="text-white">Rule 4 through Rule 41</strong> is exclusive to Lifetime Wisdom License holders. Your 3-day free trial lets you study the first 3 core rules.
                        </p>

                        <div className="space-y-2 text-[11px] text-[#8A8A8E] bg-[#0E0E10] p-4 rounded border border-[#1A1A1E]">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold">Unlocking Option:</p>
                          <ul className="space-y-1.5 mt-1">
                            <li className="flex items-center gap-1.5">★ <strong>Lifetime Wisdom License (R1 499 Once-off)</strong>: Complete 41 rules for life, unlimited AI inquiries, non-transferable watermarked downloads, speed and tempo controls</li>
                          </ul>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <button
                            onClick={() => setIsBillingOpen(true)}
                            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#bfa02e] text-black text-[10px] uppercase tracking-widest font-bold font-mono rounded-sm transition-all"
                          >
                            Unlock All 41 Rules & Wisdom License
                          </button>
                          <p className="text-[10px] text-gray-500 font-mono">
                            EFT Reference and Card secure checkout supported
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Bold Quotation Statement */}
                        <h2 className="text-3xl md:text-5xl font-serif leading-tight text-white italic tracking-tight font-medium">
                          "{currentRule.statement}"
                        </h2>

                        {/* Elaborate wisdom text */}
                        <p className="text-[#8A8A8E] text-base md:text-lg leading-relaxed max-w-2xl font-sans font-normal pt-2">
                          {currentRule.description}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons Box */}
              <div className="mt-8 pt-6 border-t border-[#1A1A1E] flex flex-wrap gap-3 items-center justify-between">
                
                {/* Left Side: Interaction Trigger buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleMarkComplete}
                    className={`px-5 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 border ${
                      isCurrentRuleCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-white text-black hover:bg-gray-200 border-white'
                    }`}
                    title="Mark this rule as meditated and read today"
                  >
                    <BookOpen size={12} />
                    {isCurrentRuleCompleted ? 'Wisdom Absorbed' : 'Meditate & Absorb'}
                  </button>

                  <button 
                    onClick={() => {
                      if ((progress.tier || 'free') === 'free' && currentRuleId > 3) {
                        setIsBillingOpen(true);
                      } else {
                        setIsJournalOpen(true);
                      }
                    }}
                    className="px-5 py-2.5 border border-[#2A2A2E] hover:border-[#D4AF37] text-white text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 bg-[#0F0F11]/20"
                  >
                    <PenSquare size={12} className="text-[#D4AF37]" />
                    Journal Entry
                  </button>

                  <button 
                    onClick={() => {
                      if ((progress.tier || 'free') === 'free' && currentRuleId > 3) {
                        setIsBillingOpen(true);
                      } else {
                        setIsElaborateOpen(true);
                      }
                    }}
                    className="px-5 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:text-white text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2"
                    title="Interactive AI Elaboration & Mentorship Study Mode"
                  >
                    <Sparkles size={12} className="animate-pulse" />
                    Interactive Elaboration
                  </button>

                  <button 
                    onClick={startSpeech}
                    className={`px-3 py-2.5 border rounded-sm transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${
                      isSpeaking 
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' 
                        : 'border-[#2A2A2E] text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                    title={isSpeaking ? "Stop Speaking" : "Listen to wisdom"}
                  >
                    {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    <span className="hidden sm:inline">{isSpeaking ? 'Mute' : 'Listen'}</span>
                  </button>
                </div>

                {/* Right Side: Share/Favorite toggles */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(currentRuleId)}
                    className={`p-2.5 border rounded-sm transition-all flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold ${
                      isCurrentRuleFavorite
                        ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37]'
                        : 'border-[#2A2A2E] text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                    title={isCurrentRuleFavorite ? "Remove Bookmark" : "Save Bookmark"}
                  >
                    <Bookmark size={14} fill={isCurrentRuleFavorite ? "#D4AF37" : "none"} />
                  </button>

                  <button 
                    onClick={() => setIsShareOpen(true)}
                    className="p-2.5 border border-[#2A2A2E] hover:border-gray-600 text-gray-400 hover:text-white rounded-sm transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold"
                    title="Share this business rule on social media"
                  >
                    <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
                  </button>

                  <button 
                    onClick={() => setIsShareImageOpen(true)}
                    className="p-2.5 border border-[#2A2A2E] hover:border-[#D4AF37] text-[#D4AF37] hover:text-white rounded-sm transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold bg-[#D4AF37]/5"
                    title="Generate shareable HD image for LinkedIn/Stories"
                  >
                    <Image size={14} />
                    <span className="hidden sm:inline">Share Image</span>
                  </button>

                  {!isFocusSession && (
                    <button
                      onClick={() => {
                        if ((progress.tier || 'free') === 'free' && currentRuleId > 5) {
                          setIsBillingOpen(true);
                        } else {
                          startFocusSession();
                        }
                      }}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-1.5"
                    >
                      <Clock size={12} /> Focus Session
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#1A1A1E] pt-8 lg:pt-0 lg:pl-12 flex flex-col justify-between gap-10">
            
            {/* Section: Upcoming rules to build on */}
            <div className="text-left">
              <h3 className="text-[10px] uppercase tracking-widest text-[#55555A] font-bold mb-5 flex items-center justify-between">
                <span>Upcoming Wisdom</span>
                <span className="text-[9px] font-mono font-normal">UP NEXT</span>
              </h3>
              
              <div className="space-y-6">
                {upcomingRules.map((rule, idx) => (
                  <div 
                    key={rule.id}
                    onClick={() => selectSpecificRule(rule.id)}
                    className="opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer group p-3 rounded hover:bg-[#121214]/30 border border-transparent hover:border-[#1A1A1E]"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-mono text-[#D4AF37] group-hover:underline">Day {rule.id} • Rule {rule.id}</span>
                      <span className="text-[9px] text-[#55555A] uppercase tracking-widest font-mono">Ch.{rule.chapterNumber}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-serif italic line-clamp-2">
                      "{rule.statement}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Series Progress Tracker Card */}
            <div className="mt-auto space-y-4">
              <div className="p-6 bg-[#121214] border border-[#1A1A1E] rounded-md text-left">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-mono mb-2">Series Progress</p>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-serif text-white">{completionPercentage}%</span>
                  <span className="text-[10px] text-[#55555A] font-mono mb-1">{progress.completedRules.length} / 41 Days</span>
                </div>
                <div className="w-full bg-[#1A1A1E] h-[2px] mt-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#D4AF37] h-full transition-all duration-1000" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                
                {/* Micro-stats detail */}
                <div className="mt-4 pt-3 border-t border-[#1A1A1E]/80 flex justify-between items-center text-[9px] text-gray-500 uppercase tracking-wider font-mono">
                  <span>Favorites: {progress.favoriteRules.length}</span>
                  <button 
                    onClick={() => setIsDirectoryOpen(true)}
                    className="text-[#D4AF37] hover:underline"
                  >
                    View Register
                  </button>
                </div>
              </div>

              {/* Small tip banner */}
              <div className="p-4 bg-[#0E0E10] border border-[#1A1A1E] rounded-md text-left flex items-start gap-3">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#8A8A8E] leading-relaxed">
                  <strong className="text-gray-300">Entrepreneurs' Habit:</strong> Check in every morning before tasks. Build your streak and store reflections in the local journal to track your progress.
                </div>
              </div>
            </div>

          </aside>

        </main>

        {/* Footer Area */}
        <footer className="mt-12 flex flex-col gap-6 pt-6 border-t border-[#1A1A1E]">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
            {/* Circular Indicator Dots (Visual Representation of 41 rules grouped in chunks of 5) */}
            <div className="flex gap-2 items-center flex-wrap max-w-xs sm:max-w-md justify-center sm:justify-start">
              {Array.from({ length: 41 }).map((_, i) => {
                const ruleNum = i + 1;
                const isCurrent = ruleNum === currentRuleId;
                const isCompleted = progress.completedRules.includes(ruleNum);
                const isFavorite = progress.favoriteRules.includes(ruleNum);

                return (
                  <button
                    key={ruleNum}
                    onClick={() => selectSpecificRule(ruleNum)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 relative ${
                      isCurrent 
                        ? 'bg-[#D4AF37] scale-150' 
                        : isFavorite
                          ? 'bg-rose-500'
                          : isCompleted 
                            ? 'bg-emerald-500' 
                            : 'bg-[#2A2A2E] hover:bg-gray-600'
                    }`}
                    title={`Go to Day ${ruleNum} / Rule ${ruleNum}${isCompleted ? ' (Absorbed)' : ''}${isFavorite ? ' (Favorite)' : ''}`}
                  />
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 border border-[#2A2A2E] hover:border-white flex items-center justify-center rounded-sm transition-all bg-[#0F0F11]/30 text-gray-400 hover:text-white"
                  title="Previous unwritten rule"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 border border-[#2A2A2E] hover:border-white flex items-center justify-center rounded-sm transition-all bg-[#0F0F11]/30 text-gray-400 hover:text-white"
                  title="Next unwritten rule"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#55555A] font-semibold hidden md:block">
                Use Arrow Keys or Swipe to Navigate
              </p>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#55555A] border-t border-[#1A1A1E]/35 pt-4 gap-2">
            <p>© {new Date().getFullYear()} BuildPrice Technology Enterprise. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Owner: Solomon Khumalo</span>
              <span className="text-zinc-800">•</span>
              <span>41 Unwritten Business Wisdom Rules</span>
            </p>
          </div>
        </footer>

      </div>

      {/* Embedded Journaling Reflection Panel */}
      <JournalPanel 
        ruleId={currentRuleId}
        ruleTitle={currentRule.statement}
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
      />

      {/* Embedded Directory Register Modal */}
      <DirectoryModal 
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        currentRuleId={currentRuleId}
        onSelectRule={selectSpecificRule}
        userProgress={progress}
        toggleFavorite={toggleFavorite}
      />

      {/* Interactive Rule Elaboration Panel */}
      <ElaborationPanel 
        rule={currentRule}
        isOpen={isElaborateOpen}
        onClose={() => setIsElaborateOpen(false)}
        userProgress={progress}
        onOpenBilling={() => setIsBillingOpen(true)}
        onIncrementQuery={incrementQueryCount}
      />

      {/* Embedded Premium Billing License & Subscriptions Modal */}
      <BillingModal 
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        progress={progress}
        onUpgrade={handleUpgradeTier}
      />

      {/* Shareable HD Image Canvas Generator Modal */}
      <ShareImageModal
        isOpen={isShareImageOpen}
        onClose={() => setIsShareImageOpen(false)}
        rule={currentRule}
        currentUser={currentUser}
        progress={progress}
        onDownloadComplete={handleDownloadComplete}
      />

      {/* Social & Messaging Platforms Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        rule={currentRule}
      />
    </div>
  );
}
