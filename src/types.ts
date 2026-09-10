export interface WordItem {
  id: string;
  word: string;
  phonetic?: string;
  translation: string;
  example?: string;
  exampleTrans?: string;
  masteryLevel?: number; // 0: new, 1: learning, 2: mastered
  lastReviewed?: number;
  reviewCount?: number;
}

export interface WordBook {
  id: string;
  title: string;
  description: string;
  isBuiltIn?: boolean;
  words: WordItem[];
  currentIndex: number;
}

export interface ThemeSettings {
  mode: 'preset' | 'custom';
  presetName: 'duo' | 'glass' | 'dark' | 'light' | 'stealth' | 'warm';
  customBg: string;
  customText: string;
  opacity: number; // 0 to 100
  backdropBlur: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  showTranslationAlways: boolean; // if false, hover or press space to reveal
  soundEffects: boolean;
  autoPronounce: boolean;
  barHeight: number;
  lockHeightResize: boolean;
}

export type StudyMode = 'browse' | 'quiz' | 'spell';

export interface StudyStats {
  todayCount: number;
  streakDays: number;
  lastDate: string;
  correctCount: number;
  totalAnswered: number;
}

declare global {
  interface Window {
    electronAPI?: {
      setWindowMode: (mode: 'bar' | 'quiz' | 'modal', customHeight?: number) => Promise<any>;
      toggleAlwaysOnTop: () => Promise<boolean>;
      minimizeWindow: () => Promise<void>;
      hideWindow: () => Promise<void>;
      closeApp: () => Promise<void>;
      resetPosition: () => Promise<any>;
      setBarHeight: (height: number) => Promise<any>;
      getAppConfig: () => Promise<any>;
      saveAppConfig: (config: any) => Promise<boolean>;
      initialConfig?: any;
    };
  }
}
