import React, { useState } from 'react';
import { WordBook } from '../types';
import { BookOpen, Check, Plus, Trash2, RotateCcw, Search, X, Flame, CheckCircle2, Zap } from 'lucide-react';

interface WordBookModalProps {
  wordbooks: WordBook[];
  activeBookId: string;
  onSelectBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  onResetProgress: (id: string) => void;
  onOpenImport: () => void;
  onClose: () => void;
}

export const WordBookModal: React.FC<WordBookModalProps> = ({
  wordbooks,
  activeBookId,
  onSelectBook,
  onDeleteBook,
  onResetProgress,
  onOpenImport,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectBookId, setInspectBookId] = useState<string | null>(activeBookId);

  const hardBook = wordbooks.find((b) => b.id === 'hard-words' || b.isSpecial === 'hard');
  const masteredBook = wordbooks.find((b) => b.id === 'mastered-words' || b.isSpecial === 'mastered');
  const regularBooks = wordbooks.filter(
    (b) => b.id !== 'hard-words' && b.id !== 'mastered-words' && !b.isSpecial
  );

  const currentInspectBook = wordbooks.find((b) => b.id === inspectBookId) || hardBook || regularBooks[0];

  const filteredWords = currentInspectBook
    ? currentInspectBook.words.filter(
        (w) =>
          w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.translation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-full h-full flex flex-col justify-end p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl mx-auto bg-neutral-900/95 border border-white/20 rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[480px]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-duo-green" />
            <h2 className="text-base font-bold">词库选择与单词管理</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-duo-green hover:bg-duo-darkGreen text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>导入词库 / 卡片</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout: Left list of Books, Right words list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 flex-1 min-h-0">
          {/* Left: Wordbooks (Special collections on top, followed by regular wordbooks) */}
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
            {/* Special Section: Hard Words & Mastered Words */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] text-amber-300/80 font-bold px-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>专项攻坚与掌握清单</span>
              </div>

              {/* Hard Words Card */}
              {hardBook && (
                <div
                  onClick={() => setInspectBookId(hardBook.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    inspectBookId === hardBook.id
                      ? 'border-duo-red bg-duo-red/15 ring-1 ring-duo-red/30'
                      : 'border-duo-red/40 bg-duo-red/5 hover:bg-duo-red/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white/95 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-duo-red" />
                      <span>{hardBook.title}</span>
                    </span>
                    {activeBookId === hardBook.id && (
                      <span className="px-1.5 py-0.2 bg-duo-red text-[10px] rounded text-white font-bold shrink-0">
                        强化训练中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/70 mb-2">
                    <span>当前共 {hardBook.words.length} 个待攻克生词</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBook(hardBook.id);
                        onClose();
                      }}
                      disabled={hardBook.words.length === 0}
                      className={`flex items-center gap-1 font-bold ${
                        hardBook.words.length > 0
                          ? 'text-duo-red hover:underline'
                          : 'text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>⚡ 立即强化训练</span>
                    </button>
                    <span className="text-[10px] text-white/40">点击右侧预览</span>
                  </div>
                </div>
              )}

              {/* Mastered Words Card */}
              {masteredBook && (
                <div
                  onClick={() => setInspectBookId(masteredBook.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    inspectBookId === masteredBook.id
                      ? 'border-duo-green bg-duo-green/15 ring-1 ring-duo-green/30'
                      : 'border-duo-green/30 bg-duo-green/5 hover:bg-duo-green/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white/95 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-duo-green" />
                      <span>{masteredBook.title}</span>
                    </span>
                    {activeBookId === masteredBook.id && (
                      <span className="px-1.5 py-0.2 bg-duo-green text-[10px] rounded text-white font-bold shrink-0">
                        温故中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/70 mb-2">
                    <span>已牢固掌握 {masteredBook.words.length} 词</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBook(masteredBook.id);
                        onClose();
                      }}
                      disabled={masteredBook.words.length === 0}
                      className={`font-bold ${
                        masteredBook.words.length > 0
                          ? 'text-duo-green hover:underline'
                          : 'text-white/30 cursor-not-allowed'
                      }`}
                    >
                      温故复习
                    </button>
                    <span className="text-[10px] text-white/40">点击右侧预览</span>
                  </div>
                </div>
              )}
            </div>

            {/* Regular Wordbooks */}
            <div className="text-[11px] text-white/50 font-bold px-1 mt-1">系统与导入词库</div>
            {regularBooks.map((book) => {
              const isActive = book.id === activeBookId;
              const isInspecting = book.id === inspectBookId;

              const masteredCount = book.words.filter((w) => (w.masteryLevel || 0) >= 2).length;
              const percent = Math.round((masteredCount / Math.max(1, book.words.length)) * 100);

              return (
                <div
                  key={book.id}
                  onClick={() => setInspectBookId(book.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isInspecting
                      ? 'border-duo-green bg-white/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white/95 truncate">{book.title}</span>
                    {isActive && (
                      <span className="px-1.5 py-0.2 bg-duo-green text-[10px] rounded text-white font-bold shrink-0">
                        正在背诵
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-white/60 line-clamp-1 mb-2">
                    {book.description || `${book.words.length} 词`}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                    <span>
                      已掌握: {masteredCount}/{book.words.length}
                    </span>
                    <span>{percent}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-duo-green h-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    {!isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBook(book.id);
                        }}
                        className="text-duo-green hover:underline font-bold"
                      >
                        切换为此词库
                      </button>
                    ) : (
                      <span className="text-duo-green font-bold">当前使用中</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定重置《${book.title}》的背诵进度吗？`)) {
                            onResetProgress(book.id);
                          }
                        }}
                        className="text-white/40 hover:text-white"
                        title="重置背诵进度"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>

                      {!book.isBuiltIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定删除自定义词库《${book.title}》吗？`)) {
                              onDeleteBook(book.id);
                            }
                          }}
                          className="text-white/40 hover:text-duo-red"
                          title="删除词库"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Words List Preview */}
          <div className="md:col-span-2 flex flex-col bg-white/5 p-3 rounded-xl border border-white/5 min-h-0">
            {/* Search Input and Header Info */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 mb-3 shrink-0">
              <Search className="w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder={`在《${currentInspectBook?.title || '词库'}》中搜索单词或中文释义...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-white/40 flex-1"
              />
              <span className="text-[10px] text-white/40 font-mono">
                {filteredWords.length} 词
              </span>
            </div>

            {/* Word rows */}
            <div className="flex-1 overflow-y-auto pr-1 divide-y divide-white/5 text-xs">
              {filteredWords.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40 text-xs p-6 text-center gap-1.5">
                  {currentInspectBook?.id === 'hard-words' ? (
                    <>
                      <Flame className="w-6 h-6 text-duo-red/50 mb-1" />
                      <span className="font-medium text-white/60">当前生词本暂无单词</span>
                      <span className="text-[11px] text-white/40">背单词时遇到不熟悉的词，按下键盘 ↓ 或点击生疏按钮即可加入生词本！</span>
                    </>
                  ) : currentInspectBook?.id === 'mastered-words' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-duo-green/50 mb-1" />
                      <span className="font-medium text-white/60">当前熟词本暂无单词</span>
                      <span className="text-[11px] text-white/40">牢记单词后，按下键盘 ↑ 或点击已掌握按钮即可移入熟词本！</span>
                    </>
                  ) : (
                    <span>暂无匹配单词</span>
                  )}
                </div>
              ) : (
                filteredWords.map((w, idx) => (
                  <div key={w.id} className="py-2.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-white/30 text-[10px] w-6 shrink-0">{idx + 1}</span>
                        <span className="font-bold text-white text-sm">{w.word}</span>
                        {w.phonetic && (
                          <span className="text-white/50 text-xs font-serif">{w.phonetic}</span>
                        )}
                        {w.isHard && (
                          <span className="px-1.5 py-0.2 rounded bg-duo-red/20 text-duo-red font-bold text-[9px] shrink-0 ring-1 ring-duo-red/30">
                            生词
                          </span>
                        )}
                        {(w.masteryLevel || 0) >= 2 && (
                          <span className="px-1.5 py-0.2 rounded bg-duo-green/20 text-duo-green font-bold text-[9px] shrink-0 ring-1 ring-duo-green/30">
                            已掌握
                          </span>
                        )}
                      </div>

                      <div className="text-right truncate max-w-sm text-white/85 font-medium">
                        <span>{w.translation}</span>
                      </div>
                    </div>

                    {w.example && (
                      <div className="pl-8 text-[11px] text-white/55 flex items-center gap-1.5 truncate">
                        <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[9px] shrink-0">例</span>
                        <span className="truncate text-white/70">{w.example}</span>
                        {w.exampleTrans && (
                          <span className="text-white/40 truncate hidden sm:inline">({w.exampleTrans})</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
