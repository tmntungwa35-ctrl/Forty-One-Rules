import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Check, Sparkles, Image, Layout, Palette, Smartphone, RefreshCw, Lock } from 'lucide-react';
import { Rule, User, UserProgress } from '../types';

interface ShareImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: Rule;
  currentUser: User | null;
  progress: UserProgress;
  onDownloadComplete: (ruleId: number) => void;
}

type AspectRatio = 'square' | 'story';

interface ThemePreset {
  id: string;
  name: string;
  bgGradient: [string, string];
  borderColor: string;
  accentColor: string;
  textColor: string;
  descColor: string;
  watermarkColor: string;
}

const THEMES: ThemePreset[] = [
  {
    id: 'imperial-charcoal',
    name: 'Imperial Charcoal',
    bgGradient: ['#0A0A0B', '#161619'],
    borderColor: '#D4AF37',
    accentColor: '#D4AF37',
    textColor: '#FFFFFF',
    descColor: '#A1A1AA',
    watermarkColor: 'rgba(212, 175, 55, 0.04)',
  },
  {
    id: 'alchemist-gold',
    name: 'Alchemist Gold',
    bgGradient: ['#F3E1A3', '#C5A034'],
    borderColor: '#1C1917',
    accentColor: '#2E2A20',
    textColor: '#1C1917',
    descColor: '#2E2A20',
    watermarkColor: 'rgba(28, 25, 23, 0.05)',
  },
  {
    id: 'ethereal-ivory',
    name: 'Ethereal Ivory',
    bgGradient: ['#FAF9F6', '#EFECE6'],
    borderColor: '#C5A034',
    accentColor: '#C5A034',
    textColor: '#1C1917',
    descColor: '#4A4740',
    watermarkColor: 'rgba(197, 160, 52, 0.05)',
  },
  {
    id: 'royal-crimson',
    name: 'Royal Crimson',
    bgGradient: ['#2E0A0F', '#1A0407'],
    borderColor: '#D4AF37',
    accentColor: '#D4AF37',
    textColor: '#FAFAF9',
    descColor: '#D6D3D1',
    watermarkColor: 'rgba(212, 175, 55, 0.03)',
  },
];

export const ShareImageModal: React.FC<ShareImageModalProps> = ({
  isOpen,
  onClose,
  rule,
  currentUser,
  progress,
  onDownloadComplete,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square');
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(THEMES[0]);
  const [includeChapter, setIncludeChapter] = useState(true);
  const [includeDesc, setIncludeDesc] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-generate canvas when inputs change
  useEffect(() => {
    if (isOpen) {
      generateImage();
    }
  }, [isOpen, rule, aspectRatio, selectedTheme, includeChapter, includeDesc]);

  const generateImage = () => {
    setIsRendering(true);
    // Give browser a short tick to load font/render states
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsRendering(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsRendering(false);
        return;
      }

      // 1. Establish high-res target dimensions (2x scale for premium sharpness)
      const scale = 2;
      const width = aspectRatio === 'square' ? 1080 : 1080;
      const height = aspectRatio === 'square' ? 1080 : 1920;

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // --- DRAW BACKGROUND ---
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, selectedTheme.bgGradient[0]);
      grad.addColorStop(1, selectedTheme.bgGradient[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // --- DRAW WATERMARK (Massive behind text) ---
      ctx.save();
      ctx.font = 'bold 360px "Playfair Display", Georgia, serif';
      ctx.fillStyle = selectedTheme.watermarkColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rule.id.toString(), width / 2, height / 2 - (aspectRatio === 'story' ? 50 : 20));
      ctx.restore();

      // --- DRAW DOUBLE BORDER LINES ---
      const outerPadding = 30;
      const innerPadding = 38;

      ctx.strokeStyle = selectedTheme.borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(outerPadding, outerPadding, width - outerPadding * 2, height - outerPadding * 2);

      ctx.strokeStyle = selectedTheme.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(innerPadding, innerPadding, width - innerPadding * 2, height - innerPadding * 2);

      // --- DECORATIVE CORNER BRACKETS / STARS ---
      // Star size
      const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = selectedTheme.borderColor;
        ctx.fill();
      };

      // Draw elegant diamond details in corners or top-center
      drawStar(width / 2, innerPadding + 24, 4, 12, 5);
      drawStar(width / 2, height - innerPadding - 24, 4, 12, 5);

      // --- TEXT WRAPPING ALGORITHM & SPACING CALCULATIONS ---
      const contentWidth = width - 160; // Margins left/right
      let currentY = aspectRatio === 'story' ? height * 0.28 : height * 0.24;

      // 1. Label: DAY X • RULE X OF 41
      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '5px';
      ctx.fillText(`DAY ${rule.id} • RULE ${rule.id} OF 41`, width / 2, currentY);
      ctx.letterSpacing = 'normal'; // Reset
      currentY += 50;

      // 2. Chapter Title
      if (includeChapter) {
        ctx.font = '400 16px "JetBrains Mono", monospace';
        ctx.fillStyle = selectedTheme.descColor;
        ctx.letterSpacing = '2px';
        ctx.fillText(`CH.${rule.chapterNumber}: ${rule.chapterTitle.toUpperCase()}`, width / 2, currentY);
        ctx.letterSpacing = 'normal'; // Reset
        currentY += 70;
      } else {
        currentY += 30;
      }

      // 3. Horizontal separator line
      ctx.strokeStyle = `${selectedTheme.borderColor}33`; // 20% opacity
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 40, currentY);
      ctx.lineTo(width / 2 + 40, currentY);
      ctx.stroke();
      currentY += 60;

      // 4. Quote Statement (Dynamic font sizing based on length)
      const statementText = `"${rule.statement}"`;
      let quoteFontSize = 44;
      if (statementText.length > 80) quoteFontSize = 38;
      if (statementText.length > 140) quoteFontSize = 31;
      if (aspectRatio === 'story') quoteFontSize += 6; // larger on portrait

      ctx.font = `italic ${quoteFontSize}px "Playfair Display", Georgia, serif`;
      ctx.fillStyle = selectedTheme.textColor;
      ctx.textAlign = 'center';

      const wrapCanvasText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let y = startY;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), x, y);
        return y + lineHeight;
      };

      currentY = wrapCanvasText(
        statementText,
        width / 2,
        currentY,
        contentWidth,
        quoteFontSize * 1.35
      );

      // 5. Description Block
      if (includeDesc) {
        currentY += 40;
        
        // Horizontal divider dots
        ctx.fillStyle = `${selectedTheme.borderColor}66`;
        ctx.beginPath();
        ctx.arc(width / 2 - 12, currentY, 2.5, 0, Math.PI * 2);
        ctx.arc(width / 2, currentY, 2.5, 0, Math.PI * 2);
        ctx.arc(width / 2 + 12, currentY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        currentY += 45;

        let descFontSize = 19;
        if (rule.description.length > 160) descFontSize = 16;
        ctx.font = `normal ${descFontSize}px "Inter", sans-serif`;
        ctx.fillStyle = selectedTheme.descColor;
        
        currentY = wrapCanvasText(
          rule.description,
          width / 2,
          currentY,
          contentWidth - 40,
          descFontSize * 1.6
        );
      }

      // 6. Bottom Brand Watermark & Copyright Statement
      const watermarkY = height - innerPadding - (currentUser ? 115 : 95);
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.letterSpacing = '3.5px';
      ctx.fillText('FORTY-ONE RULES OF BUSINESS WISDOM', width / 2, watermarkY);
      
      ctx.font = '400 13px "JetBrains Mono", monospace';
      ctx.fillStyle = `${selectedTheme.descColor}99`;
      ctx.letterSpacing = '1px';
      ctx.fillText('WISDOM • DISCIPLINE • ENTREPRENEURSHIP', width / 2, watermarkY + 24);

      ctx.font = '400 12px "JetBrains Mono", monospace';
      ctx.fillStyle = `${selectedTheme.descColor}66`;
      ctx.letterSpacing = '1.5px';
      ctx.fillText('© 2026 FORTY-ONE RULES • ALL RIGHTS RESERVED', width / 2, watermarkY + 46);

      if (currentUser) {
        ctx.font = '700 11.5px "JetBrains Mono", monospace';
        ctx.fillStyle = selectedTheme.accentColor;
        ctx.letterSpacing = '1.8px';
        ctx.fillText(`LICENSED EXCLUSIVELY TO: ${currentUser.email.toUpperCase()} • NON-TRANSFERABLE`, width / 2, watermarkY + 68);
      }

      // Convert to image url
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
      setIsRendering(false);
    }, 150);
  };

  const isPremium = (progress.tier || 'free') === 'elite' || (progress.tier || 'free') === 'standard';
  const hasDownloadedOnce = (progress.downloadedRules || []).includes(rule.id);

  const handleDownload = () => {
    if (!previewUrl) return;
    if (!isPremium) {
      alert("Downloading High-Res PNG is restricted to Lifetime Wisdom License holders. Please upgrade to download.");
      return;
    }
    if (hasDownloadedOnce) {
      alert("This rule card has already been downloaded once under your license. Rule cards are licensed as a single, non-transferable copy per elite account.");
      return;
    }

    const link = document.createElement('a');
    link.download = `FortyOneRules_Day${rule.id}_Share.png`;
    link.href = previewUrl;
    link.click();

    // Fire download completion
    onDownloadComplete(rule.id);
  };

  const handleCopyLink = () => {
    // Write data url or image blob directly to clipboard if supported, or just alert/copy normal share text
    if (!previewUrl) return;

    try {
      // Direct copy of actual image blob (modern browser support)
      fetch(previewUrl)
        .then(res => res.blob())
        .then(blob => {
          navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
          }).catch(err => {
            console.warn("Blob clipboard copy failed, falling back to copy status message", err);
            // Fallback - copy shareable text URL or statement
            copyTextFallback();
          });
        });
    } catch (e) {
      copyTextFallback();
    }
  };

  const copyTextFallback = () => {
    const text = `Day ${rule.id} • Rule ${rule.id}: "${rule.statement}" — Forty-One Rules of Business Wisdom.`;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />

          {/* Modal content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-[#0B0B0C] border border-[#1A1A1E] w-full max-w-4xl rounded-md overflow-hidden flex flex-col md:flex-row relative z-10 max-h-[92vh] shadow-2xl"
          >
            {/* Left Column: Config Panel */}
            <div className="w-full md:w-[420px] p-6 border-b md:border-b-0 md:border-r border-[#1A1A1E] flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-sm">
                      <Image size={16} />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg text-white">Share Studio</h2>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Premium PNG Generator</p>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio Picker */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Layout size={10} className="text-[#D4AF37]" /> Select Format
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAspectRatio('square')}
                      className={`p-3 rounded-sm border flex items-center gap-2.5 transition-all text-left ${
                        aspectRatio === 'square'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-white'
                          : 'border-[#1A1A1E] hover:border-[#2A2A2E] text-gray-400 hover:text-white bg-[#0F0F10]'
                      }`}
                    >
                      <Layout size={14} className={aspectRatio === 'square' ? 'text-[#D4AF37]' : ''} />
                      <div>
                        <div className="text-xs font-bold leading-none">Square (1:1)</div>
                        <span className="text-[9px] text-gray-500 font-mono">LinkedIn, Feed, Posts</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setAspectRatio('story')}
                      className={`p-3 rounded-sm border flex items-center gap-2.5 transition-all text-left ${
                        aspectRatio === 'story'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-white'
                          : 'border-[#1A1A1E] hover:border-[#2A2A2E] text-gray-400 hover:text-white bg-[#0F0F10]'
                      }`}
                    >
                      <Smartphone size={14} className={aspectRatio === 'story' ? 'text-[#D4AF37]' : ''} />
                      <div>
                        <div className="text-xs font-bold leading-none">Story (9:16)</div>
                        <span className="text-[9px] text-gray-500 font-mono">Instagram, TikTok, Stories</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Preset Themes Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette size={10} className="text-[#D4AF37]" /> Premium Backdrops
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map(theme => {
                      const isActive = selectedTheme.id === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme)}
                          className={`p-2.5 rounded-sm border transition-all text-left flex items-center gap-2 ${
                            isActive
                              ? 'border-[#D4AF37] bg-[#121214]'
                              : 'border-[#1A1A1E] hover:border-[#2A2A2E] bg-[#0F0F10]/50'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]})`,
                            }}
                          />
                          <span className={`text-[11px] truncate font-sans ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
                            {theme.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Customization Switches */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                    Adjust Layout Detail
                  </span>
                  
                  <label className="flex items-center justify-between p-2 rounded-sm bg-[#0E0E10] border border-[#1A1A1E] cursor-pointer hover:border-[#222226] transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-300 font-medium">Display Chapter Title</span>
                      <span className="text-[9px] text-gray-500 font-mono">Include chapter index and context</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeChapter}
                      onChange={() => setIncludeChapter(!includeChapter)}
                      className="rounded border-[#1A1A1E] text-[#D4AF37] focus:ring-[#D4AF37] bg-[#000] h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-sm bg-[#0E0E10] border border-[#1A1A1E] cursor-pointer hover:border-[#222226] transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-300 font-medium">Render Detailed Description</span>
                      <span className="text-[9px] text-gray-500 font-mono">Include detailed tactical elaboration</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeDesc}
                      onChange={() => setIncludeDesc(!includeDesc)}
                      className="rounded border-[#1A1A1E] text-[#D4AF37] focus:ring-[#D4AF37] bg-[#000] h-4 w-4"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-6 mt-6 border-t border-[#1A1A1E]">
                <button
                  onClick={handleDownload}
                  disabled={isRendering || hasDownloadedOnce}
                  className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold font-mono rounded-sm transition-all flex items-center justify-center gap-2 ${
                    hasDownloadedOnce
                      ? 'bg-[#121214] border border-[#222226] text-[#8A8A8E] cursor-not-allowed'
                      : !isPremium
                      ? 'bg-[#1A1A1E] border border-red-500/20 text-red-400 hover:bg-red-950/20'
                      : 'bg-[#D4AF37] hover:bg-[#bfa02e] text-black'
                  }`}
                >
                  {hasDownloadedOnce ? (
                    <>
                      <Lock size={12} className="text-gray-500" />
                      Downloaded Once (License Limit)
                    </>
                  ) : !isPremium ? (
                    <>
                      <Lock size={12} />
                      Premium Upgrade Required
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Download High-Res PNG
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyLink}
                  disabled={isRendering}
                  className="w-full py-2.5 bg-transparent hover:bg-white/5 border border-[#2A2A2E] hover:border-gray-600 text-gray-300 text-[10px] uppercase tracking-widest font-bold font-mono rounded-sm transition-all flex items-center justify-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      Copy Image to Clipboard
                    </>
                  )}
                </button>
                
                <p className="text-[9px] text-center text-gray-500 font-mono pt-1 leading-relaxed">
                  {hasDownloadedOnce 
                    ? "Each rule is restricted to a single non-transferable high-res download per license holder."
                    : isPremium 
                    ? `Licensed to ${currentUser?.email || 'your email'}. Watermarked & non-transferable.` 
                    : "Upgrade to the Lifetime Wisdom License to unlock high-res watermarked downloads."
                  }
                </p>
              </div>
            </div>

            {/* Right Column: Visual Canvas Preview Area */}
            <div className="flex-1 bg-[#050506] p-6 md:p-10 flex flex-col items-center justify-center relative min-h-[400px]">
              {/* Close Button top-right */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded transition-all"
              >
                <X size={16} />
              </button>

              <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={10} className="text-[#D4AF37] animate-pulse" /> HD Render Preview
                </span>

                {/* Render Canvas (Hidden, used to generate high-res png) */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Interactive Responsive Preview Image Container */}
                <div className="relative group w-full flex justify-center">
                  {isRendering ? (
                    <div 
                      className={`bg-[#0F0F11]/60 border border-[#1A1A1E] rounded-md flex flex-col items-center justify-center text-gray-400 gap-2.5 shadow-2xl animate-pulse ${
                        aspectRatio === 'square' ? 'aspect-square w-full max-w-[320px]' : 'aspect-[9/16] w-full max-w-[280px]'
                      }`}
                    >
                      <RefreshCw className="animate-spin text-[#D4AF37]" size={20} />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Drafting Canvas...</span>
                    </div>
                  ) : (
                    previewUrl && (
                      <div className="relative shadow-2xl rounded-sm overflow-hidden border border-[#222226] group transition-all duration-300 hover:border-gray-700">
                        <img
                          src={previewUrl}
                          alt={`Wisdom shareable Day ${rule.id}`}
                          className={`object-contain max-h-[50vh] transition-all duration-500 ${
                            aspectRatio === 'square' ? 'w-auto max-w-[320px] aspect-square' : 'w-auto max-w-[280px] aspect-[9/16]'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <button
                            onClick={handleDownload}
                            className="bg-black/80 hover:bg-[#D4AF37] hover:text-black text-white px-4 py-2 text-[10px] font-bold font-mono tracking-wider uppercase rounded-sm border border-white/10 transition-all flex items-center gap-1.5"
                          >
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <p className="text-[10px] text-gray-400 italic text-center leading-relaxed px-4">
                  "Let your visual statements reflect the absolute quality of your inner operations."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
