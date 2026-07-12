import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Loader2, 
  HelpCircle, 
  AlertCircle,
  FileText,
  UserCheck,
  Lock
} from 'lucide-react';
import { Rule, UserProgress } from '../types';

interface Elaboration {
  coreMeaning: string;
  caseStudy: string;
  actions: string[];
  solomonsAdvice: string;
}

interface ElaborationPanelProps {
  rule: Rule;
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
  onOpenBilling: () => void;
  onIncrementQuery: () => void;
}

export default function ElaborationPanel({ 
  rule, 
  isOpen, 
  onClose, 
  userProgress, 
  onOpenBilling, 
  onIncrementQuery 
}: ElaborationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elaboration, setElaboration] = useState<Elaboration | null>(null);
  
  // Custom interactive prompt
  const [customQuestion, setCustomQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  
  // Checked-off action items today
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  const tier = userProgress.tier || 'free';
  const queriesUsed = userProgress.dailyQueriesUsed || 0;
  
  const queryLimit = tier === 'free' ? 1 : tier === 'standard' ? 15 : Infinity;
  const isLimitReached = queriesUsed >= queryLimit;

  // Reset states on rule change or open
  useEffect(() => {
    if (isOpen) {
      fetchElaboration();
      setCompletedActions([]);
      setCustomQuestion('');
    }
  }, [rule.id, isOpen]);

  const fetchElaboration = async (question?: string) => {
    if (question) {
      setSubmittingQuestion(true);
      onIncrementQuery();
    } else {
      setLoading(true);
      setElaboration(null);
    }
    setError(null);

    try {
      const response = await fetch('/api/elaborate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleId: rule.id,
          statement: rule.statement,
          description: rule.description,
          chapterTitle: rule.chapterTitle,
          chapterNumber: rule.chapterNumber,
          customQuestion: question || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating advice.');
      }

      const data = await response.json();
      setElaboration(data);
      if (question) {
        setCustomQuestion('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch Solomon\'s custom advice. Please make sure the dev server is fully running and GEMINI_API_KEY is configured.');
    } finally {
      setLoading(false);
      setSubmittingQuestion(false);
    }
  };

  const handleCustomQuestionSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || submittingQuestion) return;
    if (isLimitReached) {
      onOpenBilling();
      return;
    }
    fetchElaboration(customQuestion.trim());
  };

  const toggleAction = (idx: number) => {
    if (completedActions.includes(idx)) {
      setCompletedActions(completedActions.filter(i => i !== idx));
    } else {
      setCompletedActions([...completedActions, idx]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex justify-end">
      {/* Sidebar-style elaborate slide-out or page panel */}
      <div className="w-full max-w-2xl bg-[#0A0A0B] border-l border-[#1A1A1E] h-full flex flex-col justify-between overflow-hidden shadow-2xl relative">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Header section */}
        <div className="p-6 md:p-8 border-b border-[#1A1A1E] flex justify-between items-start z-10 bg-[#0C0C0E]/90 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.3em] font-semibold mb-1">
              <Sparkles size={11} className="animate-pulse" />
              Interactive Masterclass
            </div>
            <h3 className="font-serif italic text-2xl text-white">Day {rule.id} • Rule {rule.id} Deep Dive</h3>
            <p className="text-[11px] text-[#8A8A8E] mt-1 font-mono uppercase tracking-wider">
              Ch.{rule.chapterNumber}: {rule.chapterTitle}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white p-2 rounded-full border border-transparent hover:border-[#1A1A1E] transition-all bg-[#121214]/60"
            title="Close deep dive"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 z-10">
          
          {/* Main Rule quote */}
          <div className="border-l-2 border-[#D4AF37] pl-4 py-1">
            <h4 className="font-serif italic text-lg md:text-xl text-gray-100 leading-relaxed">
              "{rule.statement}"
            </h4>
            <p className="text-xs text-[#8A8A8E] mt-2 font-mono">
              Original manuscript context: {rule.description}
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-[#D4AF37]" size={36} />
              <div className="space-y-1.5">
                <p className="font-serif italic text-lg text-white">Consulting Solomon Khumalo...</p>
                <p className="text-xs text-[#8A8A8E] font-mono uppercase tracking-widest max-w-sm">
                  Formulating business breakdown, real-world case study, and concrete checkups
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-md text-left space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={16} />
                <h5 className="font-semibold text-sm">Advice Connection Offline</h5>
              </div>
              <p className="text-xs text-red-300/80 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => fetchElaboration()}
                className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800 text-red-200 rounded text-[10px] uppercase tracking-widest font-bold transition-all"
              >
                Retry Consultation
              </button>
            </div>
          )}

          {/* Elaboration Results */}
          {!loading && !error && elaboration && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 text-left"
            >
              
              {/* Core Meaning */}
              <div className="space-y-3">
                <h5 className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8E] font-bold flex items-center gap-2 font-mono">
                  <BookOpen size={12} className="text-[#D4AF37]" />
                  The Commercial Truth
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {elaboration.coreMeaning}
                </p>
              </div>

              {/* Case Study */}
              <div className="space-y-3 bg-[#121214]/40 border border-[#1A1A1E] p-5 rounded-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full pointer-events-none" />
                <h5 className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8E] font-bold flex items-center gap-2 font-mono">
                  <FileText size={12} className="text-[#D4AF37]" />
                  Real-World Scenario
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed italic whitespace-pre-wrap font-serif">
                  {elaboration.caseStudy}
                </p>
              </div>

              {/* Action Checklist */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#1A1A1E] pb-2">
                  <h5 className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8E] font-bold flex items-center gap-2 font-mono">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Today's Implementation Checklists
                  </h5>
                  <span className="text-[9px] text-[#55555A] font-mono">
                    {completedActions.length} / {elaboration.actions.length} EXECUTED
                  </span>
                </div>
                
                <div className="space-y-2">
                  {elaboration.actions.map((action, idx) => {
                    const isChecked = completedActions.includes(idx);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleAction(idx)}
                        className={`p-3.5 rounded border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isChecked 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-gray-400' 
                            : 'bg-[#0E0E10] border-[#1A1A1E] hover:border-[#2A2A2E] text-gray-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-black' 
                            : 'border-gray-600 group-hover:border-white'
                        }`}>
                          {isChecked && <CheckCircle2 size={10} className="stroke-[3]" />}
                        </div>
                        <p className={`leading-relaxed ${isChecked ? 'line-through decoration-emerald-800/40 text-gray-500' : ''}`}>
                          {action}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Solomon's direct personal advice signature */}
              <div className="border border-[#D4AF37]/20 bg-[#D4AF37]/2 p-6 rounded-md relative text-left font-serif text-sm">
                <div className="absolute top-3 right-4 opacity-[0.05]">
                  <UserCheck size={80} className="text-[#D4AF37]" />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono block mb-2 font-bold">
                  From Solomon Khumalo's Desk
                </span>
                <p className="text-gray-300 italic leading-relaxed whitespace-pre-wrap">
                  "{elaboration.solomonsAdvice}"
                </p>
                
                <div className="mt-4 pt-3 border-t border-[#1A1A1E]/80 flex justify-between items-center font-mono text-[9px] text-gray-500 uppercase tracking-wider">
                  <span>Author, The Invincible Business</span>
                  <span className="font-serif italic font-semibold text-[#D4AF37]">Solomon Khumalo</span>
                </div>
              </div>

            </motion.div>
          )}

        </div>

        {/* Custom interactive question box */}
        <div className="p-6 md:p-8 border-t border-[#1A1A1E] bg-[#0C0C0E]/95 z-10">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest text-[#8A8A8E] font-medium flex items-center gap-1.5 font-mono">
                <HelpCircle size={11} className="text-[#D4AF37]" />
                Have a specific business challenge today?
              </label>
              <span className="text-[9px] text-[#8A8A8E] font-mono uppercase tracking-wider">
                {tier === 'free' ? `Queries: ${queriesUsed} / 1 Today` : tier === 'standard' ? `Queries: ${queriesUsed} / 15 Today` : 'Queries: Unlimited'}
              </span>
            </div>

            {isLimitReached ? (
              <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#D4AF37] shrink-0" />
                  <p className="text-[11px] text-gray-300 leading-relaxed text-left">
                    You have used your daily interactive query. Unlock up to 15 daily queries or unlimited masterclass consultations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenBilling}
                  className="px-4 py-2 bg-[#D4AF37] text-black text-[10px] uppercase tracking-widest font-bold font-mono rounded hover:bg-[#bfa02e] transition-all whitespace-nowrap"
                >
                  Upgrade License
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomQuestionSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-[#161619] border border-[#2A2A2E] rounded pl-4 pr-12 py-3 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all font-sans"
                    placeholder="Ask Solomon: 'How do I pitch this to an aggressive commercial contractor?'"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    disabled={submittingQuestion || loading}
                  />
                  <button
                    type="submit"
                    disabled={!customQuestion.trim() || submittingQuestion || loading}
                    className="absolute right-2 top-1.5 w-8 h-8 rounded bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    title="Send to Solomon"
                  >
                    {submittingQuestion ? (
                      <Loader2 className="animate-spin text-zinc-600" size={12} />
                    ) : (
                      <Send size={12} />
                    )}
                  </button>
                </div>
                
                <p className="text-[9px] text-gray-600 italic">
                  Solomon will rewrite the core meaning, case studies, and checklists specifically around your custom business query.
                </p>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
