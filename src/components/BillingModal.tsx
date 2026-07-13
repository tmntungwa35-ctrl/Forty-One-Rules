import { useState, FormEvent } from 'react';
import { Check, ShieldCheck, Flame, Sparkles, Volume2, Landmark, HelpCircle, X, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { UserProgress } from '../types';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpgrade: (newTier: 'free' | 'standard' | 'elite') => void;
}

export default function BillingModal({ isOpen, onClose, progress, onUpgrade }: BillingModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'eft'>('card');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'elite'>('elite');
  
  // Card input states for mock validation
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = progress.tier || 'free';

  const handleSimulatePayment = (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgrade('elite');
      setSuccessMessage(`Payment received! Welcome to Lifetime Wisdom Mode. Your lifetime elite license is fully activated.`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
    }, 1800);
  };

  const handleManualEFTSignup = (tier: 'standard' | 'elite') => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgrade('elite');
      setSuccessMessage(`EFT Reference recorded! Your Lifetime Elite license is instantly activated.`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0A0A0B] border border-[#1A1A1E] rounded-md overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Plans comparison and limits */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-[#1A1A1E] space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-mono font-bold">Unwritten Wisdom Licensing</span>
              <h3 className="font-serif italic text-2xl text-white mt-1">Upgrade Your Mindset</h3>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-white p-1 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-[#8A8A8E] leading-relaxed">
            The Rules are written for those who build, not just those who read. Invest in lifetime access and build your invincible business today.
          </p>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            
            {/* Free Tier */}
            <div className={`p-4 rounded border text-left transition-all ${
              currentTier === 'free' ? 'border-[#D4AF37] bg-[#121214]/50' : 'border-[#1A1A1E] bg-[#0E0E10]/20'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-sm font-serif italic text-white">R0 Free Meditator</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Starter Access</p>
                </div>
                <span className="text-sm font-mono font-bold text-gray-400">R0 / Mo</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#8A8A8E]">
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-[#D4AF37]" /> First 5 rules only (Rule 1 - 5)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-[#D4AF37]" /> 1 AI Elaboration / day
                </li>
                <li className="flex items-center gap-2 text-zinc-700 line-through">
                  <span>No audio listening modes</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-700 line-through">
                  <span>Limited to 2 saved reflections</span>
                </li>
              </ul>
              {currentTier === 'free' && (
                <span className="inline-block mt-3 bg-zinc-800 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono text-zinc-400">Current Plan</span>
              )}
            </div>

            {/* Lifetime Wisdom License */}
            <div 
              onClick={() => setSelectedPlan('elite')}
              className={`p-4 rounded border text-left transition-all cursor-pointer ${
                selectedPlan === 'elite' ? 'border-[#D4AF37] bg-[#121214]/50 ring-1 ring-[#D4AF37]' : 'border-[#1A1A1E] hover:border-[#2A2A2E]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-sm font-serif italic text-white flex items-center gap-1.5">
                    Lifetime Wisdom License
                    <Sparkles size={12} className="text-[#D4AF37] animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Unrestricted Mastery</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-[#D4AF37]">R1 499</span>
                  <span className="text-[10px] text-gray-400 font-mono block">Once off</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#8A8A8E]">
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-emerald-500" /> Complete access to all 41 rules for life
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-emerald-500" /> <strong className="text-white">UNLIMITED</strong> AI Elaboration Queries
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-emerald-500" /> Unlock audio listening & speed controls
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-emerald-500" /> Unlimited journaling, reflections & backups
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-emerald-500" /> Lifetime upgrades & priority mentorship
                </li>
              </ul>
              {(currentTier === 'elite' || currentTier === 'standard') && (
                <span className="inline-block mt-3 bg-emerald-950/20 border border-emerald-500/20 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono text-emerald-400">Active Lifetime License</span>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: Interactive Payment / EFT confirmation details */}
        <div className="w-full md:w-96 p-6 md:p-8 bg-[#0F0F11]/90 flex flex-col justify-between overflow-y-auto relative">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-full border border-transparent hover:border-[#1A1A1E] transition-all hidden md:block"
          >
            <X size={18} />
          </button>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#8A8A8E] font-semibold">Checkout Summary</h4>
              <p className="font-serif italic text-lg text-white mt-1">
                Lifetime Wisdom License
              </p>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-2xl font-serif font-bold text-white">
                  R1 499
                </span>
                <span className="text-xs text-gray-500 font-mono">Once-off Payment</span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2 border-b border-[#1A1A1E] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`py-2 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'card' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <CreditCard size={12} /> Credit/Debit Card
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('eft')}
                className={`py-2 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'eft' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Landmark size={12} /> Bank Deposit / EFT
              </button>
            </div>

            {/* Error/Success messages */}
            {successMessage && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded text-left flex items-start gap-2">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <p>{successMessage}</p>
              </div>
            )}

            {/* TAB 1: Card Simulator Form */}
            {activeTab === 'card' && !successMessage && (
              <form onSubmit={handleSimulatePayment} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="S. Khumalo"
                    className="w-full bg-[#161619] border border-[#2A2A2E] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-[#D4AF37] font-sans"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      className="w-full bg-[#161619] border border-[#2A2A2E] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-[#D4AF37] font-mono pl-8"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <CreditCard size={12} className="absolute left-2.5 top-3 text-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-[#161619] border border-[#2A2A2E] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-[#D4AF37] font-mono"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      className="w-full bg-[#161619] border border-[#2A2A2E] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-[#D4AF37] font-mono"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-white text-black hover:bg-gray-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-xs uppercase tracking-widest font-bold rounded-sm transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing Securely...' : 'Upgrade Now (R1 499 Once-off)'}
                  <ArrowRight size={12} />
                </button>

                <p className="text-[9px] text-gray-600 text-center flex items-center justify-center gap-1.5 mt-2">
                  <Lock size={10} /> Fully integrated 3D Secure checkout.
                </p>
              </form>
            )}

            {/* TAB 2: Official Bank EFT Transfer Information */}
            {activeTab === 'eft' && !successMessage && (
              <div className="space-y-4 text-left">
                <div className="p-4 bg-[#121214] border border-[#2A2A2E] rounded space-y-3">
                  <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold">
                    Capitec Business Bank Details
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Account Name</p>
                      <p className="text-gray-200 font-bold">MINUS ONE FOUR TWO INDUSTRIAL CONCEPTS (PTY)LTD</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Account Number</p>
                        <p className="text-gray-200 font-mono font-semibold">1054931240</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Bank Name</p>
                        <p className="text-gray-200">Capitec Business</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Branch Code</p>
                        <p className="text-gray-200 font-mono">450105</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">SWIFT Code</p>
                        <p className="text-gray-200 font-mono">CABLZAJJ</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Reference Format</p>
                      <p className="text-[#D4AF37] font-mono font-bold">WISDOM-{progress.streak || '1'}-LIFETIME</p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 leading-relaxed bg-[#0A0A0B] p-3 rounded border border-[#1A1A1E]">
                  To activate your license via bank EFT, initiate the payment in your banking application using the details above. Then click below to notify Solomon's finance suite of your upcoming payment.
                </div>

                <button
                  type="button"
                  onClick={() => handleManualEFTSignup(selectedPlan)}
                  className="w-full py-3 bg-[#D4AF37] text-black hover:bg-[#bda030] text-xs uppercase tracking-widest font-bold rounded-sm transition-all"
                >
                  I Have Sent EFT Payment
                </button>
              </div>
            )}

          </div>

          <div className="mt-8 pt-4 border-t border-[#1A1A1E] text-center">
            <span className="text-[9px] text-gray-600 font-mono uppercase">
              BuildPrice Technology • Solomon Khumalo
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
