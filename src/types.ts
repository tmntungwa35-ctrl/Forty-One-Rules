export interface Rule {
  id: number;
  chapterNumber: number;
  chapterTitle: string;
  statement: string;
  description: string;
}

export interface JournalEntry {
  ruleId: number;
  date: string;
  notes: string;
}

export interface UserProgress {
  completedRules: number[]; // Array of rule IDs read/completed today/overall
  streak: number;
  lastReadDate: string | null;
  favoriteRules: number[]; // Bookmarked rule IDs
  tier?: 'free' | 'standard' | 'elite';
  dailyQueriesUsed?: number;
  lastQueryResetDate?: string | null;
  lastViewedRuleId?: number;
}
