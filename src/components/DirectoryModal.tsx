import { useState } from 'react';
import { Search, Compass, Bookmark, Check, X, ArrowUpRight } from 'lucide-react';
import { Rule, UserProgress } from '../types';
import { RULES } from '../data';

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRuleId: number;
  onSelectRule: (id: number) => void;
  userProgress: UserProgress;
  toggleFavorite: (id: number) => void;
}

export default function DirectoryModal({
  isOpen,
  onClose,
  currentRuleId,
  onSelectRule,
  userProgress,
  toggleFavorite
}: DirectoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'completed'>('all');

  if (!isOpen) return null;

  // Group rules by chapter
  const filteredRules = RULES.filter(rule => {
    // Search query matching
    const matchesSearch = 
      rule.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `rule ${rule.id}`.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter type matching
    if (activeFilter === 'favorites') {
      return userProgress.favoriteRules.includes(rule.id);
    }
    if (activeFilter === 'completed') {
      return userProgress.completedRules.includes(rule.id);
    }
    return true;
  });

  // Group rules by chapter after filtering
  const chapters: { [key: string]: { num: number; rules: Rule[] } } = {};
  filteredRules.forEach(rule => {
    const key = rule.chapterTitle;
    if (!chapters[key]) {
      chapters[key] = { num: rule.chapterNumber, rules: [] };
    }
    chapters[key].rules.push(rule);
  });

  const sortedChapters = Object.entries(chapters).sort((a, b) => a[1].num - b[1].num);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0A0A0B] border border-[#1A1A1E] rounded-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#1A1A1E] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-xs uppercase tracking-[0.4em] text-[#8A8A8E] mb-1">Forty-One Rules</h2>
            <p className="font-serif italic text-2xl text-white">The Wisdom Register</p>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-full border border-transparent hover:border-[#1A1A1E] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 md:px-8 py-4 border-b border-[#1A1A1E] bg-[#0F0F11] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search unwritten wisdom..."
              className="w-full bg-[#161619] border border-[#2A2A2E] rounded pl-9 pr-4 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all font-mono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-transparent text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              All Rules (41)
            </button>
            <button
              onClick={() => setActiveFilter('favorites')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all flex items-center justify-center gap-1.5 ${
                activeFilter === 'favorites'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              <Bookmark size={10} fill={activeFilter === 'favorites' ? 'black' : 'none'} /> Favorites ({userProgress.favoriteRules.length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all flex items-center justify-center gap-1.5 ${
                activeFilter === 'completed'
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-transparent text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              <Check size={10} /> Completed ({userProgress.completedRules.length})
            </button>
          </div>
        </div>

        {/* Directory Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
          {sortedChapters.length === 0 ? (
            <div className="text-center py-16">
              <Compass size={40} className="mx-auto text-gray-700 mb-4 animate-pulse" />
              <p className="font-serif italic text-lg text-gray-400">No unwritten rules match your search parameters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="mt-4 text-xs text-[#D4AF37] underline tracking-widest uppercase hover:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            sortedChapters.map(([chapterTitle, details]) => (
              <div key={chapterTitle} className="space-y-4">
                <div className="border-b border-[#1A1A1E] pb-2">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#8A8A8E]">
                    Chapter {details.num}
                  </h3>
                  <h4 className="font-serif italic text-xl text-white mt-1">{chapterTitle}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.rules.map(rule => {
                    const isCurrent = rule.id === currentRuleId;
                    const isCompleted = userProgress.completedRules.includes(rule.id);
                    const isFavorite = userProgress.favoriteRules.includes(rule.id);

                    return (
                      <div
                        key={rule.id}
                        onClick={() => {
                          onSelectRule(rule.id);
                          onClose();
                        }}
                        className={`p-5 rounded border text-left cursor-pointer transition-all flex flex-col justify-between group relative ${
                          isCurrent
                            ? 'bg-[#121214] border-[#D4AF37]'
                            : 'bg-[#0E0E10]/50 border-[#1A1A1E] hover:border-[#2A2A2E] hover:bg-[#121214]/40'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-mono tracking-widest ${isCurrent ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                              DAY {rule.id} • RULE {rule.id} OF 41
                            </span>
                            <div className="flex items-center gap-2">
                              {isCompleted && (
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                  <Check size={8} /> Completed
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(rule.id);
                                }}
                                className={`text-gray-500 hover:text-[#D4AF37] p-0.5 transition-colors`}
                                title={isFavorite ? "Remove favorite" : "Add to favorites"}
                              >
                                <Bookmark size={11} fill={isFavorite ? "#D4AF37" : "none"} className={isFavorite ? "text-[#D4AF37]" : ""} />
                              </button>
                            </div>
                          </div>
                          <h5 className="font-serif text-sm italic text-gray-100 group-hover:text-white leading-snug">
                            "{rule.statement}"
                          </h5>
                          <p className="text-[11px] text-[#8A8A8E] mt-2 line-clamp-2">
                            {rule.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#55555A] font-bold group-hover:text-white transition-colors pt-3 border-t border-[#1A1A1E]/40">
                          <span>Read wisdom</span>
                          <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
