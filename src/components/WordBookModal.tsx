import React, { useState } from 'react';
import { WordBook } from '../types';
import { BookOpen, Check, Plus, Trash2, RotateCcw, Search, X } from 'lucide-react';

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

  const currentInspectBook = wordbooks.find((b) => b.id === inspectBookId) || wordbooks[0];

  const filteredWords = currentInspectBook
    ? currentInspectBook.words.filter(
        (w) =>
          w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.translation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-full h-full flex flex-col justify-end p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl mx-auto bg-neutral-900/95 border border-white/20 rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[460px]">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 flex-1 min-h-0">
          {/* Left: Wordbooks */}
          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            <div className="text-xs text-white/50 font-bold px-1">我的词库列表</div>
            {wordbooks.map((book) => {
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
            {/* Search Input */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 mb-3 shrink-0">
              <Search className="w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="搜索当前词库单词或中文释义..."
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
                <div className="h-full flex items-center justify-center text-white/40 text-xs">
                  暂无匹配单词
                </div>
              ) : (
                filteredWords.map((w, idx) => (
                  <div key={w.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-white/30 text-[10px] w-6">{idx + 1}</span>
                      <span className="font-bold text-white text-sm">{w.word}</span>
                      {w.phonetic && (
                        <span className="text-white/50 text-xs font-serif">{w.phonetic}</span>
                      )}
                    </div>

                    <div className="text-right truncate max-w-xs text-white/80">
                      <span>{w.translation}</span>
                    </div>
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
