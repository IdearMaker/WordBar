import React, { useState } from 'react';
import { WordBook, WordItem } from '../types';
import { parseWordsFromText } from '../services/parser';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImportModalProps {
  onSaveBook: (newBook: WordBook) => void;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onSaveBook, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsedWords, setParsedWords] = useState<WordItem[]>([]);
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [fileName, setFileName] = useState('');

  const handleTextChange = (text: string) => {
    setRawText(text);
    const words = parseWordsFromText(text);
    setParsedWords(words);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        const words = parseWordsFromText(content);
        setParsedWords(words);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleLoadSample = () => {
    const sample = `ubiquitous, /juːˈbɪkwɪtəs/, adj. 无所不在的，普遍存在的
resilient, /rɪˈzɪliənt/, adj. 有弹性的，适应力强的
ephemeral, /ɪˈfemərəl/, adj. 短暂的，瞬息即逝的
pragmatic, /præɡˈmætɪk/, adj. 务实的，实用主义的
prolific, /prəˈlɪfɪk/, adj. 多产的，富于创造力的`;
    setTitle('进阶高频生词本 (示例)');
    setDescription('示例导入生词表');
    handleTextChange(sample);
  };

  const handleSubmit = () => {
    if (parsedWords.length === 0) {
      alert('请先录入或上传有效的单词列表！');
      return;
    }

    const newBook: WordBook = {
      id: `custom-${Date.now()}`,
      title: title.trim() || `自定义词库 (${new Date().toLocaleDateString()})`,
      description: description.trim() || `共导入 ${parsedWords.length} 个单词`,
      isBuiltIn: false,
      words: parsedWords,
      currentIndex: 0,
    };

    onSaveBook(newBook);
    onClose();
  };

  return (
    <div className="w-full h-full flex flex-col justify-end p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl mx-auto bg-neutral-900/95 border border-white/20 rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-duo-green" />
            <h2 className="text-base font-bold">导入单词词典 / 单词卡片</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 flex-1 min-h-0">
          {/* Left Form: Meta & Input */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-white/60 block mb-1">词库名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 雅思写作高频词汇 / 考研阅读真题词"
                className="w-full bg-white/5 border border-white/15 px-3 py-1.5 rounded-lg text-xs text-white placeholder-white/30 outline-none focus:border-duo-green"
              />
            </div>

            {/* Tab switch: Paste vs File */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${
                  activeTab === 'paste'
                    ? 'bg-duo-green/20 border-duo-green text-duo-green font-bold'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}
              >
                直接粘贴文本
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${
                  activeTab === 'file'
                    ? 'bg-duo-green/20 border-duo-green text-duo-green font-bold'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}
              >
                上传本地文件
              </button>
            </div>

            {activeTab === 'paste' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/40">支持 CSV / 制表符 / 冒号分列</span>
                  <button
                    onClick={handleLoadSample}
                    className="text-[11px] text-duo-green hover:underline"
                  >
                    填入示例模板
                  </button>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="格式示例:&#10;abandon, /əˈbændən/, vt. 放弃&#10;ability	n. 能力&#10;paradox : n. 悖论"
                  className="flex-1 w-full bg-black/40 border border-white/15 p-2.5 rounded-lg text-xs font-mono text-white placeholder-white/30 outline-none focus:border-duo-green resize-none min-h-[140px]"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-4 text-center bg-white/5">
                <input
                  type="file"
                  id="word-file-upload"
                  accept=".csv,.tsv,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="word-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="w-8 h-8 text-duo-green" />
                  <span className="text-xs text-white/80 font-bold">
                    {fileName || '点击选择 .csv / .txt / .json 单词文件'}
                  </span>
                  <span className="text-[11px] text-white/40">支持 Anki 导出文件、CSV、字典 JSON</span>
                </label>
              </div>
            )}
          </div>

          {/* Right Preview */}
          <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5 min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 shrink-0">
              <span className="text-xs font-bold text-white/90">解析预览结果</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  parsedWords.length > 0
                    ? 'bg-duo-green/20 text-duo-green'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                已识别 {parsedWords.length} 词
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 divide-y divide-white/5 text-xs">
              {parsedWords.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40 text-xs text-center gap-1.5 p-4">
                  <AlertCircle className="w-6 h-6 text-white/20" />
                  <span>在左侧粘贴文本或上传文件后，此处将即时显示解析后的单词列表</span>
                </div>
              ) : (
                parsedWords.slice(0, 50).map((w, idx) => (
                  <div key={w.id} className="py-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white/30 font-mono text-[10px] w-5">{idx + 1}</span>
                      <span className="font-bold text-white truncate">{w.word}</span>
                      {w.phonetic && (
                        <span className="text-white/50 text-[11px]">{w.phonetic}</span>
                      )}
                    </div>
                    <span className="text-white/70 text-right truncate max-w-xs">
                      {w.translation}
                    </span>
                  </div>
                ))
              )}
            </div>

            {parsedWords.length > 50 && (
              <div className="text-[10px] text-white/40 text-center pt-2">
                ... 还有 {parsedWords.length - 50} 个词未展示
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={parsedWords.length === 0}
            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transition-all ${
              parsedWords.length > 0
                ? 'bg-duo-green hover:bg-duo-darkGreen active:scale-95 cursor-pointer'
                : 'bg-white/20 opacity-40 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>保存并开始背诵</span>
          </button>
        </div>
      </div>
    </div>
  );
};
