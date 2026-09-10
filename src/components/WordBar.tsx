import React, { useState, useEffect } from 'react';
import { WordItem, ThemeSettings, StudyStats, StudyMode } from '../types';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  Settings,
  BookOpen,
  Flame,
  Gamepad2,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  GripHorizontal,
  Minus,
  X,
  Pin,
  Play,
  Pause,
} from 'lucide-react';
import { tts } from '../services/tts';

interface WordBarProps {
  currentWord: WordItem;
  totalWords: number;
  currentIndex: number;
  wordbookTitle: string;
  theme: ThemeSettings;
  stats: StudyStats;
  studyMode: StudyMode;
  onPrev: () => void;
  onNext: () => void;
  onToggleQuiz: () => void;
  onOpenSettings: () => void;
  onOpenWordbooks: () => void;
  onOpenImport: () => void;
  onMarkMastered: () => void;
  onMarkHard: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  accentColor: string;
  onUpdateTheme?: (theme: ThemeSettings) => void;
}

export const WordBar: React.FC<WordBarProps> = ({
  currentWord,
  totalWords,
  currentIndex,
  wordbookTitle,
  theme,
  stats,
  studyMode,
  onPrev,
  onNext,
  onToggleQuiz,
  onOpenSettings,
  onOpenWordbooks,
  onMarkMastered,
  onMarkHard,
  autoPlay,
  onToggleAutoPlay,
  accentColor,
  onUpdateTheme,
}) => {
  const [isHoverRevealed, setIsHoverRevealed] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setShowExample(false);
  }, [currentWord?.id]);

  const barHeight = theme.barHeight || 58;
  const isCompact = barHeight <= 48;
  const isSpacious = barHeight >= 74;
  const isGiant = barHeight >= 92;

  // Adaptive font and element sizing
  const wordFontClass = isCompact
    ? 'text-base font-bold'
    : isGiant
    ? 'text-3xl sm:text-4xl font-black'
    : isSpacious
    ? 'text-2xl font-extrabold'
    : 'text-lg sm:text-xl font-bold';

  const phoneticFontClass = isCompact ? 'text-[10px]' : isSpacious ? 'text-sm' : 'text-xs';
  const transFontClass = isCompact
    ? 'text-xs max-w-[280px]'
    : isGiant
    ? 'text-base sm:text-lg max-w-[650px]'
    : isSpacious
    ? 'text-sm sm:text-base max-w-[500px]'
    : 'text-sm max-w-[420px]';

  const actionBtnClass = isCompact ? 'p-0.5' : isSpacious ? 'p-1.5' : 'p-1';
  const iconClass = isCompact ? 'w-3.5 h-3.5' : isSpacious ? 'w-4.5 h-4.5' : 'w-4 h-4';
  const smallIconClass = isCompact ? 'w-3 h-3' : isSpacious ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const logoSizeClass = isCompact ? 'w-5 h-5' : isSpacious ? 'w-7 h-7' : 'w-6 h-6';
  const brandTitleClass = isCompact ? 'text-[11px]' : isSpacious ? 'text-sm' : 'text-xs';
  const brandSubClass = isCompact ? 'text-[8px]' : isSpacious ? 'text-[10px]' : 'text-[9px]';

  // Handle top edge height drag resize
  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (theme.lockHeightResize) return;

    setIsResizing(true);
    const startY = e.screenY;
    const startHeight = barHeight;
    let latestHeight = startHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Moving up (smaller screenY) increases the bar height
      const deltaY = startY - moveEvent.screenY;
      const newHeight = Math.max(44, Math.min(140, Math.round(startHeight + deltaY)));
      latestHeight = newHeight;
      if (window.electronAPI?.setBarHeight) {
        window.electronAPI.setBarHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (onUpdateTheme) {
        onUpdateTheme({
          ...theme,
          barHeight: latestHeight,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    tts.speak(currentWord.word);
  };

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeApp();
    }
  };

  const handleResetPosition = () => {
    if (window.electronAPI) {
      window.electronAPI.resetPosition();
    }
  };

  const isTranslationVisible = theme.showTranslationAlways || isHoverRevealed;

  return (
    <div
      className="relative w-full flex items-center justify-between px-3 select-none border-t border-white/10 shadow-lg"
      style={{ height: `${barHeight}px` }}
    >
      {/* Top Edge Height Resize Grip Handle (Active when unlocked in settings) */}
      {!theme.lockHeightResize && (
        <div
          onMouseDown={handleStartResize}
          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize group z-50 flex items-center justify-center -translate-y-1/2"
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title={`按住上下拖拽调整底栏高度 (当前: ${barHeight}px，可在设置中锁定)`}
        >
          <div
            className={`h-1 rounded-full transition-all shadow ${
              isResizing
                ? 'w-36 bg-cyan-400 h-1.5 ring-2 ring-cyan-400/50'
                : 'w-20 bg-white/25 group-hover:bg-cyan-400 group-hover:w-28 group-hover:h-1.5'
            }`}
          />
        </div>
      )}

      {/* Left side: Logo, Drag Handle, Book info & Progress */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Logo & Made by YuDan badge */}
        <div
          className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-black/40 border border-cyan-500/30 shadow cursor-move"
          style={{ WebkitAppRegion: 'drag' } as any}
          title="WordBar - Made by YuDan (可拖拽移动，点击图钉复位)"
        >
          <img
            src="./logo.png"
            alt="Logo"
            className={`${logoSizeClass} object-contain rounded-full drop-shadow`}
            onError={(e) => {
              // fallback if not found
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col leading-tight justify-center">
            <span className={`${brandTitleClass} font-bold text-white tracking-wide`}>WordBar</span>
            <span className={`${brandSubClass} text-cyan-300/80 tracking-tight font-medium -mt-0.5`}>
              -Made by YuDan
            </span>
          </div>
        </div>

        {/* Pin to taskbar button */}
        <button
          onClick={handleResetPosition}
          className={`${actionBtnClass} text-white/40 hover:text-white/90 hover:bg-white/10 rounded transition-colors`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title="重置并吸附到任务栏正上方"
        >
          <Pin className={smallIconClass} />
        </button>

        {/* Wordbook icon only */}
        <button
          onClick={onOpenWordbooks}
          className={`${actionBtnClass} rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title={`词库选择与单词管理 (${wordbookTitle})`}
        >
          <BookOpen className={`${iconClass} text-duo-green`} />
        </button>

        {/* Progress index */}
        <span className="text-[11px] font-mono text-white/50">
          {currentIndex + 1}/{totalWords}
        </span>
      </div>

      {/* Center Area: Word, Phonetic, Pronunciation & Translation */}
      {isSpacious && studyMode !== 'quiz' ? (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-0.5 px-4 min-w-0"
          style={{ WebkitAppRegion: 'drag' } as any}
        >
          {/* Top Row: Word + Phonetic + Pronounce */}
          <div className="flex items-center gap-2.5">
            <span className={`${wordFontClass} tracking-wide font-sans text-white drop-shadow-sm`}>
              {currentWord.word}
            </span>

            {currentWord.phonetic && (
              <span className={`${phoneticFontClass} font-serif text-white/60`}>
                {currentWord.phonetic}
              </span>
            )}

            <button
              onClick={handleSpeak}
              className="p-1 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all transform active:scale-95"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="发音 (快捷键 P)"
            >
              <Volume2 className={`${smallIconClass} text-duo-blue`} />
            </button>
          </div>

          {/* Bottom Row: Translation & Example */}
          <div
            onMouseEnter={() => setIsHoverRevealed(true)}
            onMouseLeave={() => setIsHoverRevealed(false)}
            className="flex items-center gap-2 cursor-pointer max-w-2xl"
            style={{ WebkitAppRegion: 'no-drag' } as any}
            title={theme.showTranslationAlways ? currentWord.translation : '悬浮或按空格键查看释义'}
          >
            {isTranslationVisible ? (
              <span className={`${transFontClass} font-medium text-white/90 truncate animate-fade-in`}>
                {currentWord.translation}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-white/40 italic bg-white/5 px-2 py-0.5 rounded">
                <EyeOff className="w-3 h-3" />
                <span>悬浮或按空格显释义</span>
              </span>
            )}

            {currentWord.example && (
              <span className="text-xs text-white/50 italic truncate border-l border-white/20 pl-2">
                {currentWord.example}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex-1 flex items-center justify-center gap-3 px-4 min-w-0"
          style={{ WebkitAppRegion: 'drag' } as any}
        >
          {/* Word */}
          <div className="flex items-center gap-2">
            <span className={`${wordFontClass} tracking-wide font-sans text-white drop-shadow-sm`}>
              {currentWord.word}
            </span>

            {/* Phonetic */}
            {currentWord.phonetic && (
              <span className={`${phoneticFontClass} font-serif text-white/60`}>
                {currentWord.phonetic}
              </span>
            )}

            {/* Pronounce Button */}
            <button
              onClick={handleSpeak}
              className="p-1 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all transform active:scale-95"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="发音 (快捷键 P)"
            >
              <Volume2 className={`${smallIconClass} text-duo-blue`} />
            </button>
          </div>

          {/* Divider & Translation / Example Display (Hidden in quiz mode so the answer isn't spoiled!) */}
          {studyMode !== 'quiz' && (
            <>
              <div className="h-4 w-px bg-white/20 shrink-0" />

              {showExample && currentWord.example ? (
                /* Inline bilingual example sentence card (Never clipped by window borders) */
                <div
                  className="flex items-center gap-2 max-w-[620px] bg-black/60 border border-amber-400/50 rounded-xl px-2.5 py-1 text-xs animate-fade-in shadow-xl backdrop-blur-md"
                  style={{ WebkitAppRegion: 'no-drag' } as any}
                >
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/25 text-amber-300 font-extrabold text-[10px] tracking-wide shrink-0 ring-1 ring-amber-400/40">
                    例句
                  </span>

                  <div className="flex flex-col min-w-0 max-w-[460px]">
                    <span className="text-white font-medium text-xs truncate select-text leading-tight" title={currentWord.example}>
                      {currentWord.example}
                    </span>
                    {currentWord.exampleTrans && (
                      <span className="text-white/70 text-[11px] truncate select-text leading-tight mt-0.5" title={currentWord.exampleTrans}>
                        {currentWord.exampleTrans}
                      </span>
                    )}
                  </div>

                  {/* Read example sentence aloud via TTS */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      tts.speak(currentWord.example!);
                    }}
                    className="p-1 rounded-full text-amber-300/80 hover:text-amber-300 hover:bg-white/10 shrink-0 transition-all active:scale-95"
                    title="朗读例句"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Close example banner to return to translation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExample(false);
                    }}
                    className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
                    title="返回单词释义"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Standard Translation display */
                <div
                  onMouseEnter={() => setIsHoverRevealed(true)}
                  onMouseLeave={() => setIsHoverRevealed(false)}
                  className="flex items-center gap-2 max-w-[420px] cursor-pointer"
                  style={{ WebkitAppRegion: 'no-drag' } as any}
                  title={theme.showTranslationAlways ? currentWord.translation : '悬浮或按空格键查看释义'}
                >
                  {isTranslationVisible ? (
                    <span className={`${transFontClass} font-medium text-white/90 truncate animate-fade-in`}>
                      {currentWord.translation}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-white/40 italic bg-white/5 px-2 py-0.5 rounded">
                      <EyeOff className="w-3 h-3" />
                      <span>悬浮或按空格显释义</span>
                    </span>
                  )}

                  {/* Example icon / popup toggle */}
                  {currentWord.example && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExample(true);
                      }}
                      className="p-0.5 rounded text-[10px] px-1.5 font-bold border transition-all bg-white/10 border-white/20 text-white/70 hover:text-amber-300 hover:border-amber-400/60 hover:bg-amber-400/20 shadow-sm"
                      title="点击展开双语例句"
                    >
                      例
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Right side: Learning Controls, Streak, Quiz Toggle, Settings */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Streak & Today count badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold"
          title={`连续学习 ${stats.streakDays} 天，今日已背 ${stats.todayCount} 词`}
        >
          <Flame className={`${smallIconClass} fill-orange-400 text-orange-400`} />
          <span>{stats.streakDays}</span>
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center bg-white/10 rounded-lg p-0.5">
          <button
            onClick={onPrev}
            className={`${actionBtnClass} hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors`}
            style={{ WebkitAppRegion: 'no-drag' } as any}
            title="上一个单词 (←)"
          >
            <ChevronLeft className={iconClass} />
          </button>
          <button
            onClick={onNext}
            className={`${actionBtnClass} hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors`}
            style={{ WebkitAppRegion: 'no-drag' } as any}
            title="下一个单词 (→)"
          >
            <ChevronRight className={iconClass} />
          </button>
        </div>

        {/* Mastery rating: Hard vs Mastered */}
        <button
          onClick={onMarkHard}
          className={`${actionBtnClass} text-white/40 hover:text-duo-red hover:bg-duo-red/10 rounded transition-colors`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title="标记为生疏 (快捷键 ↓)"
        >
          <HelpCircle className={iconClass} />
        </button>

        <button
          onClick={onMarkMastered}
          className={`${actionBtnClass} text-white/40 hover:text-duo-green hover:bg-duo-green/10 rounded transition-colors`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title="标记为已掌握 (快捷键 ↑)"
        >
          <CheckCircle2 className={iconClass} />
        </button>

        {/* Auto Play toggle */}
        <button
          onClick={onToggleAutoPlay}
          className={`${actionBtnClass} rounded transition-colors ${
            autoPlay
              ? 'text-duo-green bg-duo-green/20'
              : 'text-white/40 hover:text-white/80 hover:bg-white/10'
          }`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title={autoPlay ? '暂停自动轮播' : '开启摸鱼自动轮播 (每6秒切换)'}
        >
          {autoPlay ? <Pause className={iconClass} /> : <Play className={iconClass} />}
        </button>

        {/* Quiz Mode Button - Icon only */}
        <button
          onClick={onToggleQuiz}
          className={`p-1.5 rounded-lg transition-all ${
            studyMode === 'quiz'
              ? 'bg-duo-green text-white shadow-md scale-105 ring-2 ring-duo-green/40'
              : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
          }`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title={studyMode === 'quiz' ? '收起抢答模式 (Esc)' : '开启四选一抢答模式 (快捷键 1~4)'}
        >
          <Gamepad2 className={iconClass} />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className={`${actionBtnClass} text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors`}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title="外观与系统设置"
        >
          <Settings className={iconClass} />
        </button>

        {/* Window controls */}
        <div className="flex items-center gap-1 border-l border-white/20 pl-1.5">
          <button
            onClick={handleMinimize}
            className={`${actionBtnClass} text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors`}
            style={{ WebkitAppRegion: 'no-drag' } as any}
            title="最小化"
          >
            <Minus className={smallIconClass} />
          </button>
          <button
            onClick={handleClose}
            className={`${actionBtnClass} text-white/40 hover:text-duo-red hover:bg-duo-red/10 rounded transition-colors`}
            style={{ WebkitAppRegion: 'no-drag' } as any}
            title="关闭应用"
          >
            <X className={smallIconClass} />
          </button>
        </div>
      </div>
    </div>
  );
};
