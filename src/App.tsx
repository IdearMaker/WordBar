import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordBook, WordItem, ThemeSettings, StudyStats, StudyMode } from './types';
import { storage, syncSpecialBooks } from './services/storage';
import { tts } from './services/tts';
import { sounds } from './data/audioEffects';
import { getThemeStyles } from './styles/themeHelper';
import { WordBar } from './components/WordBar';
import { QuizOptions } from './components/QuizOptions';
import { SettingsModal } from './components/SettingsModal';
import { WordBookModal } from './components/WordBookModal';
import { ImportModal } from './components/ImportModal';

export const App: React.FC = () => {
  const [wordbooks, setWordbooks] = useState<WordBook[]>(() => storage.loadWordbooks());
  const [activeBookId, setActiveBookId] = useState<string>(() => storage.loadActiveWordbookId());
  const [lastRegularBookId, setLastRegularBookId] = useState<string>(() => {
    const initId = storage.loadActiveWordbookId();
    return (initId === 'hard-words' || initId === 'mastered-words') ? 'oxford-3000' : initId;
  });
  const [theme, setTheme] = useState<ThemeSettings>(() => storage.loadTheme());
  const [stats, setStats] = useState<StudyStats>(() => storage.loadStats());
  const [studyMode, setStudyMode] = useState<StudyMode>(() => storage.loadStudyMode());
  const [activeModal, setActiveModal] = useState<'none' | 'settings' | 'wordbooks' | 'import'>('none');
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  // Active wordbook & current word
  const activeBook = wordbooks.find((b) => b.id === activeBookId) || wordbooks[0];
  const words = activeBook?.words || [];
  const currentIndex = Math.min(activeBook?.currentIndex || 0, Math.max(0, words.length - 1));
  const currentWord: WordItem | undefined = words[currentIndex];

  // Adjust Electron window height dynamically when modes or modals change
  useEffect(() => {
    if (!window.electronAPI) return;

    const barH = theme.barHeight || 58;
    if (activeModal !== 'none') {
      window.electronAPI.setWindowMode('modal', 500);
    } else if (studyMode === 'quiz') {
      window.electronAPI.setWindowMode('quiz', barH + 56);
    } else {
      window.electronAPI.setWindowMode('bar', barH);
    }
  }, [activeModal, studyMode, theme.barHeight]);

  // Pronounce word when switching if autoPronounce is enabled
  useEffect(() => {
    if (theme.autoPronounce && currentWord) {
      tts.speak(currentWord.word);
    }
  }, [currentWord?.id, theme.autoPronounce]);

  // Navigate to index
  const goToIndex = useCallback(
    (newIndex: number) => {
      if (words.length === 0) return;
      const boundedIndex = (newIndex + words.length) % words.length;

      setWordbooks((prev) => {
        const updated = prev.map((b) =>
          b.id === activeBook.id ? { ...b, currentIndex: boundedIndex } : b
        );
        storage.saveWordbooks(updated);
        return updated;
      });

      // Update today count
      setStats((prev) => {
        const updated = {
          ...prev,
          todayCount: prev.todayCount + 1,
        };
        storage.saveStats(updated);
        return updated;
      });
    },
    [words.length, activeBook?.id]
  );

  const handlePrev = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [goToIndex, currentIndex]);

  const handleNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [goToIndex, currentIndex]);

  // Auto-play ticker
  useEffect(() => {
    if (!autoPlay || activeModal !== 'none' || studyMode === 'quiz') return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [autoPlay, activeModal, studyMode, handleNext]);

  // Quiz result handler
  const handleQuizResult = useCallback(
    (correct: boolean) => {
      setStats((prev) => {
        const today = new Date().toISOString().split('T')[0];
        const newTotal = prev.totalAnswered + 1;
        const newCorrect = prev.correctCount + (correct ? 1 : 0);
        const newStreak = correct ? prev.streakDays + 1 : 0;

        if (correct && newStreak % 5 === 0) {
          sounds.playStreak();
        }

        const updated = {
          ...prev,
          todayCount: prev.todayCount + 1,
          streakDays: newStreak,
          correctCount: newCorrect,
          totalAnswered: newTotal,
          lastDate: today,
        };
        storage.saveStats(updated);
        return updated;
      });

      // Update word mastery
      if (currentWord) {
        const targetWord = currentWord.word.toLowerCase().trim();
        setWordbooks((prev) => {
          const updated = prev.map((b) => {
            const updatedWords = b.words.map((w) => {
              if (w.word.toLowerCase().trim() === targetWord) {
                return {
                  ...w,
                  isHard: correct ? (activeBook?.id === 'hard-words' ? false : w.isHard) : true,
                  masteryLevel: correct ? Math.min(3, (w.masteryLevel || 0) + 1) : 0,
                  lastReviewed: Date.now(),
                  reviewCount: (w.reviewCount || 0) + 1,
                };
              }
              return w;
            });
            return { ...b, words: updatedWords };
          });
          const synced = syncSpecialBooks(updated);
          storage.saveWordbooks(synced);
          return synced;
        });
      }

      // Auto proceed to next word on correct
      if (correct) {
        setTimeout(() => {
          if (activeBook?.id !== 'hard-words') {
            handleNext();
          }
        }, 700);
      }
    },
    [currentWord, activeBook?.id, handleNext]
  );

  // Mark Mastery manually
  const handleMarkMastered = () => {
    if (!currentWord) return;
    sounds.playCorrect();
    const targetWord = currentWord.word.toLowerCase().trim();
    setWordbooks((prev) => {
      const updated = prev.map((b) => {
        const updatedWords = b.words.map((w) => {
          if (w.word.toLowerCase().trim() === targetWord) {
            return {
              ...w,
              isHard: false,
              masteryLevel: 2,
              lastReviewed: Date.now(),
            };
          }
          return w;
        });
        return { ...b, words: updatedWords };
      });
      const synced = syncSpecialBooks(updated);
      storage.saveWordbooks(synced);
      return synced;
    });

    if (activeBook?.id !== 'hard-words') {
      handleNext();
    }
  };

  const handleMarkHard = () => {
    if (!currentWord) return;
    sounds.playWrong();
    const targetWord = currentWord.word.toLowerCase().trim();
    setWordbooks((prev) => {
      const updated = prev.map((b) => {
        const updatedWords = b.words.map((w) => {
          if (w.word.toLowerCase().trim() === targetWord) {
            return {
              ...w,
              isHard: true,
              masteryLevel: 0,
              lastReviewed: Date.now(),
              reviewCount: (w.reviewCount || 0) + 1,
            };
          }
          return w;
        });
        return { ...b, words: updatedWords };
      });
      const synced = syncSpecialBooks(updated);
      storage.saveWordbooks(synced);
      return synced;
    });
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'none') {
        if (e.key === 'Escape') {
          setActiveModal('none');
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMarkMastered();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMarkHard();
      } else if (e.key === ' ' && studyMode !== 'quiz') {
        // Spacebar toggles translation visibility
        e.preventDefault();
        setTheme((prev) => {
          const updated = { ...prev, showTranslationAlways: !prev.showTranslationAlways };
          storage.saveTheme(updated);
          return updated;
        });
      } else if (e.key.toLowerCase() === 'p') {
        if (currentWord) tts.speak(currentWord.word);
      } else if (e.key === 'Escape') {
        if (studyMode === 'quiz') {
          setStudyMode('browse');
          storage.saveStudyMode('browse');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, handlePrev, handleNext, handleMarkMastered, handleMarkHard, studyMode, currentWord]);

  // Sync initial configuration from disk
  useEffect(() => {
    const initDisk = async () => {
      if (window.electronAPI?.getAppConfig) {
        const diskConfig = await window.electronAPI.getAppConfig();
        if (diskConfig?.theme) {
          setTheme((prev) => ({ ...prev, ...diskConfig.theme }));
        }
      }
    };
    initDisk();
  }, []);

  const handleUpdateTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    storage.saveTheme(newTheme);
    if (window.electronAPI?.setBarHeight && newTheme.barHeight) {
      window.electronAPI.setBarHeight(newTheme.barHeight);
    }
  };

  // Compute theme CSS styles
  const { containerStyle, accentColor, textColor } = getThemeStyles(theme);

  const handleSelectBook = (id: string) => {
    if (id !== 'hard-words' && id !== 'mastered-words') {
      setLastRegularBookId(id);
    }
    setActiveBookId(id);
    storage.saveActiveWordbookId(id);
    setActiveModal('none');
  };

  const handleReturnToRegularBook = () => {
    const targetId = lastRegularBookId || 'oxford-3000';
    setActiveBookId(targetId);
    storage.saveActiveWordbookId(targetId);
  };

  if (!currentWord && activeBook?.id !== 'hard-words' && activeBook?.id !== 'mastered-words' && words.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 bg-black/80 text-white text-xs">
        <span>词库中暂无可用单词，请导入或选择内置词库。</span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-screen flex flex-col justify-end overflow-hidden transition-all duration-200"
      style={containerStyle}
    >
      {/* Modal Layers (Settings, Wordbooks, Import) */}
      {activeModal === 'settings' && (
        <SettingsModal
          theme={theme}
          onUpdateTheme={handleUpdateTheme}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'wordbooks' && (
        <WordBookModal
          wordbooks={wordbooks}
          activeBookId={activeBookId}
          onSelectBook={handleSelectBook}
          onDeleteBook={(id) => {
            const remaining = wordbooks.filter((b) => b.id !== id);
            setWordbooks(remaining);
            storage.saveWordbooks(remaining);
            if (activeBookId === id && remaining.length > 0) {
              handleSelectBook(remaining[0].id);
            }
          }}
          onResetProgress={(id) => {
            const updated = wordbooks.map((b) =>
              b.id === id
                ? {
                    ...b,
                    currentIndex: 0,
                    words: b.words.map((w) => ({
                      ...w,
                      masteryLevel: 0,
                      isHard: false,
                    })),
                  }
                : b
            );
            const synced = syncSpecialBooks(updated);
            setWordbooks(synced);
            storage.saveWordbooks(synced);
          }}
          onOpenImport={() => setActiveModal('import')}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'import' && (
        <ImportModal
          onSaveBook={(newBook) => {
            const updated = [newBook, ...wordbooks];
            const synced = syncSpecialBooks(updated);
            setWordbooks(synced);
            storage.saveWordbooks(synced);
            handleSelectBook(newBook.id);
            setActiveModal('none');
          }}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Quiz 4-choice interactive options */}
      {studyMode === 'quiz' && activeModal === 'none' && currentWord && (
        <QuizOptions
          currentWord={currentWord}
          allWords={words}
          onResult={handleQuizResult}
          accentColor={accentColor}
          textColor={textColor}
        />
      )}

      {/* Core WordBar Ribbon (Taskbar Docked) */}
      {activeModal === 'none' && (
        <WordBar
          currentWord={currentWord}
          totalWords={words.length}
          currentIndex={currentIndex}
          wordbookTitle={activeBook?.title || '单词本'}
          isSpecialBook={activeBook?.isSpecial}
          onReturnToRegularBook={handleReturnToRegularBook}
          theme={theme}
          stats={stats}
          studyMode={studyMode}
          onPrev={handlePrev}
          onNext={handleNext}
          onToggleQuiz={() => {
            const nextMode = studyMode === 'quiz' ? 'browse' : 'quiz';
            setStudyMode(nextMode);
            storage.saveStudyMode(nextMode);
          }}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenWordbooks={() => setActiveModal('wordbooks')}
          onOpenImport={() => setActiveModal('import')}
          onMarkMastered={handleMarkMastered}
          onMarkHard={handleMarkHard}
          autoPlay={autoPlay}
          onToggleAutoPlay={() => setAutoPlay((prev) => !prev)}
          accentColor={accentColor}
          onUpdateTheme={handleUpdateTheme}
        />
      )}
    </div>
  );
};

export default App;
