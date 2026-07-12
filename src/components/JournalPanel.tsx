import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Trash2, Check, X } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalPanelProps {
  ruleId: number;
  ruleTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JournalPanel({ ruleId, ruleTitle, isOpen, onClose }: JournalPanelProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load entries from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('forty_one_rules_journal');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as JournalEntry[];
        setEntries(parsed.filter(e => e.ruleId === ruleId));
      } catch (err) {
        console.error("Error parsing journal entries", err);
      }
    } else {
      setEntries([]);
    }
    setNewNote('');
    setIsSaved(false);
  }, [ruleId, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: JournalEntry = {
      ruleId,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      notes: newNote.trim()
    };

    const stored = localStorage.getItem('forty_one_rules_journal');
    let allEntries: JournalEntry[] = [];
    if (stored) {
      try {
        allEntries = JSON.parse(stored);
      } catch (e) {
        allEntries = [];
      }
    }

    allEntries.unshift(newEntry); // Newest first
    localStorage.setItem('forty_one_rules_journal', JSON.stringify(allEntries));
    setEntries(allEntries.filter(e => e.ruleId === ruleId));
    setNewNote('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDelete = (entryToDelete: JournalEntry) => {
    const stored = localStorage.getItem('forty_one_rules_journal');
    if (!stored) return;
    try {
      const allEntries = JSON.parse(stored) as JournalEntry[];
      const updated = allEntries.filter(
        e => !(e.ruleId === entryToDelete.ruleId && e.date === entryToDelete.date && e.notes === entryToDelete.notes)
      );
      localStorage.setItem('forty_one_rules_journal', JSON.stringify(updated));
      setEntries(updated.filter(e => e.ruleId === ruleId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0F0F11] border border-[#2A2A2E] rounded-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#1A1A1E] flex justify-between items-start">
          <div>
            <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-mono">Day {ruleId} • Rule {ruleId} Reflections</span>
            <h3 className="font-serif italic text-lg text-white mt-1">"{ruleTitle}"</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* New Reflection Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block text-xs uppercase tracking-widest text-[#8A8A8E] font-medium">
              Morning Action Plan / Personal Takeaway
            </label>
            <textarea
              className="w-full bg-[#161619] border border-[#2A2A2E] rounded p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-sans min-h-[100px] resize-none"
              placeholder="How will you apply or build on this wisdom in your business today? Jot down a quick reflection..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-mono">
                {isSaved && <span className="text-emerald-500 flex items-center gap-1"><Check size={12} /> Entry added successfully</span>}
              </span>
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 text-xs uppercase tracking-widest font-bold rounded-sm transition-all"
              >
                Save Wisdom
              </button>
            </div>
          </form>

          {/* Past Reflections */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-2">
              <PenSquare size={12} className="text-[#D4AF37]" /> Past Reflections ({entries.length})
            </h4>
            {entries.length === 0 ? (
              <p className="text-xs italic text-gray-600">No reflections captured yet. Make this your first journal entry for this rule.</p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, idx) => (
                  <div key={idx} className="bg-[#121214] border border-[#1A1A1E] p-4 rounded text-left relative group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#8A8A8E] font-mono flex items-center gap-1">
                        <Calendar size={10} /> {entry.date}
                      </span>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete reflection"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
