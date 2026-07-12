import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Check, Copy, Link, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { Rule } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: Rule;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, rule }) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Construct sharing links
  const shareUrl = `${window.location.origin}${window.location.pathname}?rule=${rule.id}`;
  const shareText = `Rule ${rule.id}: "${rule.statement}"\n\nChapter ${rule.chapterNumber}: ${rule.chapterTitle}\n\nRead more on Forty-One Rules of Business Wisdom.`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  // Social media direct links
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Rule ${rule.id} of Business Wisdom: "${rule.statement}"`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Business Wisdom: Rule ${rule.id}`)}&body=${encodeURIComponent(`${shareText}\n\nRead it here: ${shareUrl}`)}`;

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    });
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
      setIsTextCopied(true);
      setTimeout(() => setIsTextCopied(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Forty-One Rules of Business Wisdom`,
          text: `Rule ${rule.id}: "${rule.statement}"`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing natively:', err);
      }
    }
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
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-[#0B0B0C] border border-[#1A1A1E] w-full max-w-lg rounded-md overflow-hidden relative z-10 shadow-2xl p-6 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-white/5 p-1.5 rounded transition-all"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] block mb-1">
                Share Wisdom
              </span>
              <h2 className="font-serif italic text-2xl text-white">Rule {rule.id}</h2>
            </div>

            {/* Card Preview */}
            <div className="border border-[#1A1A1E] bg-[#0E0E10] p-4 rounded-sm mb-6 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 font-serif text-[100px] font-bold text-white/[0.02] pointer-events-none select-none">
                {rule.id}
              </div>
              <span className="text-[9px] font-mono text-[#D4AF37] tracking-[0.2em] block mb-1.5 uppercase">
                CH.{rule.chapterNumber}: {rule.chapterTitle}
              </span>
              <p className="font-serif italic text-sm text-gray-200 mb-2 leading-relaxed">
                "{rule.statement}"
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {rule.description}
              </p>
            </div>

            {/* Platforms Grid */}
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">
                Select Sharing Channel
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* LinkedIn */}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-sm border border-[#1A1A1E] hover:border-[#D4AF37] bg-[#0F0F10] text-gray-400 hover:text-white transition-all group"
                >
                  <svg
                    className="h-4 w-4 text-[#D4AF37] group-hover:text-[#0077b5] transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="text-xs font-medium">LinkedIn</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-sm border border-[#1A1A1E] hover:border-[#D4AF37] bg-[#0F0F10] text-gray-400 hover:text-white transition-all group"
                >
                  <svg
                    className="h-4 w-4 text-[#D4AF37] group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-xs font-medium">Twitter / X</span>
                </a>

                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-sm border border-[#1A1A1E] hover:border-[#D4AF37] bg-[#0F0F10] text-gray-400 hover:text-white transition-all group"
                >
                  <svg
                    className="h-4 w-4 text-[#D4AF37] group-hover:text-[#1877f2] transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.38-1 1-1h2V2h-3C10.22 2 9 3.53 9 5.5V8z" />
                  </svg>
                  <span className="text-xs font-medium">Facebook</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-sm border border-[#1A1A1E] hover:border-[#D4AF37] bg-[#0F0F10] text-gray-400 hover:text-white transition-all group"
                >
                  <MessageSquare className="h-4 w-4 text-[#D4AF37] group-hover:text-[#25D366] transition-colors" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </a>

                {/* Email */}
                <a
                  href={emailUrl}
                  className="flex items-center gap-2.5 p-3 rounded-sm border border-[#1A1A1E] hover:border-[#D4AF37] bg-[#0F0F10] text-gray-400 hover:text-white transition-all group"
                >
                  <Mail className="h-4 w-4 text-[#D4AF37] group-hover:text-gray-200 transition-colors" />
                  <span className="text-xs font-medium">Email</span>
                </a>

                {/* Native Device Share */}
                {canNativeShare ? (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-2.5 p-3 rounded-sm border border-[#1A1A1E] hover:border-[#D4AF37] bg-[#0F0F10] text-gray-400 hover:text-white transition-all group text-left"
                  >
                    <Share2 className="h-4 w-4 text-[#D4AF37] group-hover:text-[#D4AF37]/80" />
                    <span className="text-xs font-medium">System Share</span>
                  </button>
                ) : (
                  <div className="hidden sm:block p-3 rounded-sm border border-dashed border-[#1A1A1E] bg-[#0B0B0C]" />
                )}
              </div>
            </div>

            {/* Direct Link Input */}
            <div className="mt-6 pt-5 border-t border-[#1A1A1E] space-y-4">
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
                  Direct Reference Link
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-[#121214] border border-[#1A1A1E] text-gray-400 text-xs px-3 py-2 rounded-sm focus:outline-none select-all font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-[#1A1A1E] hover:bg-[#2A2A2E] text-gray-300 hover:text-white transition-all rounded-sm flex items-center justify-center gap-1.5"
                    title="Copy rule link"
                  >
                    {isLinkCopied ? <Check size={14} className="text-emerald-400" /> : <Link size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
                  Copy Complete Text Statement
                </span>
                <button
                  onClick={handleCopyText}
                  className="w-full py-2.5 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37] text-[#D4AF37] text-xs font-mono rounded-sm transition-all flex items-center justify-center gap-2"
                >
                  {isTextCopied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied Rule Details!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Wisdom to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
