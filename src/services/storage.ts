import { WordBook, ThemeSettings, StudyStats, StudyMode } from '../types';
import { defaultWordbooks } from '../data/defaultWordbooks';

const STORAGE_KEYS = {
  WORDBOOKS: 'wordbar_wordbooks',
  ACTIVE_WORDBOOK_ID: 'wordbar_active_wb_id',
  THEME: 'wordbar_theme_settings',
  STATS: 'wordbar_study_stats',
  STUDY_MODE: 'wordbar_study_mode',
};

export const defaultTheme: ThemeSettings = {
  mode: 'preset',
  presetName: 'duo',
  customBg: '#1e293b',
  customText: '#f8fafc',
  opacity: 85,
  backdropBlur: true,
  fontSize: 'md',
  showTranslationAlways: true,
  soundEffects: true,
  autoPronounce: false,
  barHeight: 58,
  lockHeightResize: false,
};

export const defaultStats: StudyStats = {
  todayCount: 0,
  streakDays: 1,
  lastDate: new Date().toISOString().split('T')[0],
  correctCount: 0,
  totalAnswered: 0,
};

export const storage = {
  loadWordbooks(): WordBook[] {
    let books: WordBook[] = defaultWordbooks;
    const diskBooks = (window as any)?.electronAPI?.initialConfig?.wordbooks;
    const rawLocal = localStorage.getItem(STORAGE_KEYS.WORDBOOKS);
    let candidate: WordBook[] | null = (Array.isArray(diskBooks) && diskBooks.length > 0) ? diskBooks : null;

    if (!candidate && rawLocal) {
      try {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          candidate = parsed;
        }
      } catch (e) {
        console.error('Failed to load wordbooks:', e);
      }
    }

    if (candidate) {
      const candidateBookMap = new Map<string, WordBook>();
      const customBooks: WordBook[] = [];

      for (const b of candidate) {
        if (b.isBuiltIn) {
          candidateBookMap.set(b.id, b);
        } else {
          customBooks.push(b);
        }
      }

      const mergedBuiltIns = defaultWordbooks.map((defBook) => {
        const existingBook = candidateBookMap.get(defBook.id);
        if (!existingBook) {
          return defBook;
        }
        const wordMasteryMap = new Map<string, any>();
        for (const w of existingBook.words) {
          const stats = {
            masteryLevel: w.masteryLevel,
            lastReviewed: w.lastReviewed,
            reviewCount: w.reviewCount,
          };
          wordMasteryMap.set(w.id, stats);
          if (w.word) {
            wordMasteryMap.set(w.word.toLowerCase().trim(), stats);
          }
        }

        const updatedWords = defBook.words.map((w) => {
          const stats = wordMasteryMap.get(w.id) || (w.word ? wordMasteryMap.get(w.word.toLowerCase().trim()) : undefined);
          return stats ? { ...w, ...stats } : w;
        });

        return {
          ...defBook,
          currentIndex: Math.min(existingBook.currentIndex || 0, Math.max(0, updatedWords.length - 1)),
          words: updatedWords,
        };
      });

      books = [...mergedBuiltIns, ...customBooks];
    }

    this.saveWordbooks(books);
    return books;
  },

  saveWordbooks(books: WordBook[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORDBOOKS, JSON.stringify(books));
      window.electronAPI?.saveAppConfig?.({ wordbooks: books });
    } catch (e) {
      console.error('Failed to save wordbooks:', e);
    }
  },

  loadActiveWordbookId(): string {
    const diskId = (window as any)?.electronAPI?.initialConfig?.activeWordbookId;
    if (diskId) return diskId;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORDBOOK_ID) || 'cet4-core';
  },

  saveActiveWordbookId(id: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORDBOOK_ID, id);
      window.electronAPI?.saveAppConfig?.({ activeWordbookId: id });
    } catch (e) {
      console.error('Failed to save active wordbook id:', e);
    }
  },

  loadTheme(): ThemeSettings {
    let localTheme: Partial<ThemeSettings> = {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      if (data) {
        localTheme = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse local theme:', e);
    }
    const diskTheme = (window as any)?.electronAPI?.initialConfig?.theme || {};
    return { ...defaultTheme, ...localTheme, ...diskTheme };
  },

  saveTheme(theme: ThemeSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
      window.electronAPI?.saveAppConfig?.({ theme });
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  loadStats(): StudyStats {
    let localStats: Partial<StudyStats> = {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        localStats = JSON.parse(data);
      }
    } catch {}
    const diskStats = (window as any)?.electronAPI?.initialConfig?.stats || {};
    let stats: StudyStats = { ...defaultStats, ...localStats, ...diskStats };

    // Check if day changed to reset todayCount or maintain streak
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastDate !== today) {
      const last = new Date(stats.lastDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        stats.streakDays += 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
      }
      stats.todayCount = 0;
      stats.lastDate = today;
      this.saveStats(stats);
    }
    return stats;
  },

  saveStats(stats: StudyStats) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      window.electronAPI?.saveAppConfig?.({ stats });
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  },

  loadStudyMode(): StudyMode {
    const diskMode = (window as any)?.electronAPI?.initialConfig?.studyMode;
    if (diskMode) return diskMode;
    return (localStorage.getItem(STORAGE_KEYS.STUDY_MODE) as StudyMode) || 'browse';
  },

  saveStudyMode(mode: StudyMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_MODE, mode);
      window.electronAPI?.saveAppConfig?.({ studyMode: mode });
    } catch (e) {
      console.error('Failed to save study mode:', e);
    }
  },
};
