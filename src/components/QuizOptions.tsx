import React, { useEffect, useState, useRef } from 'react';
import { WordItem } from '../types';
import { sounds } from '../data/audioEffects';
import { Check, X } from 'lucide-react';

interface QuizOptionsProps {
  currentWord: WordItem;
  allWords: WordItem[];
  onResult: (correct: boolean) => void;
  accentColor: string;
}

interface OptionItem {
  id: string;
  translation: string;
  isCorrect: boolean;
}

export const QuizOptions: React.FC<QuizOptionsProps> = ({
  currentWord,
  allWords,
  onResult,
}) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const allWordsRef = useRef(allWords);
  allWordsRef.current = allWords;

  // Generate 4 options ONLY once per word ID to prevent re-shuffling on answer click!
  useEffect(() => {
    const pool = allWordsRef.current.filter(
      (w) => w.id !== currentWord.id && w.translation !== currentWord.translation
    );

    // Shuffle distractor pool
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const distractors: string[] = [];
    for (let i = 0; i < Math.min(3, shuffledPool.length); i++) {
      distractors.push(shuffledPool[i].translation);
    }

    // Fallback if pool is too small
    while (distractors.length < 3) {
      distractors.push(`选项 ${distractors.length + 1}`);
    }

    const items: OptionItem[] = [
      { id: 'correct', translation: currentWord.translation, isCorrect: true },
      ...distractors.map((d, i) => ({ id: `distractor-${i}`, translation: d, isCorrect: false })),
    ];

    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }

    setOptions(items);
    setSelectedIdx(null);
    setIsAnswered(false);
  }, [currentWord.id, currentWord.translation]);

  const handleSelect = (idx: number) => {
    if (isAnswered || idx < 0 || idx >= options.length) return;
    setSelectedIdx(idx);
    setIsAnswered(true);

    const chosen = options[idx];
    if (chosen.isCorrect) {
      sounds.playCorrect();
      onResult(true);
    } else {
      sounds.playWrong();
      onResult(false);
    }
  };

  // Keyboard shortcuts 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key) && !isAnswered) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < options.length) {
          handleSelect(idx);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isAnswered]);

  return (
    <div className="w-full flex items-center justify-between gap-2 px-4 py-1.5 animate-fade-in border-t border-white/5 bg-black/20">
      <div className="flex items-center gap-1 text-xs font-semibold text-white/50 px-2 py-0.5 rounded bg-black/30 shrink-0">
        <span>抢答选项:</span>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-2">
        {options.map((opt, idx) => {
          let btnStyle = 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10 active:scale-95';

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle = 'bg-duo-green text-white border-duo-green font-bold shadow-lg scale-[1.02] ring-2 ring-duo-green/50';
            } else if (selectedIdx === idx && !opt.isCorrect) {
              btnStyle = 'bg-duo-red text-white border-duo-red font-bold animate-bounce-short ring-2 ring-duo-red/50';
            } else {
              btnStyle = 'bg-white/5 text-white/40 border-transparent opacity-40';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-all duration-150 truncate cursor-pointer ${btnStyle}`}
              title={opt.translation}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-mono shrink-0 text-white/80">
                  {idx + 1}
                </span>
                <span className="truncate">{opt.translation}</span>
              </span>

              {isAnswered && opt.isCorrect && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
              {isAnswered && selectedIdx === idx && !opt.isCorrect && (
                <X className="w-3.5 h-3.5 shrink-0 text-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
