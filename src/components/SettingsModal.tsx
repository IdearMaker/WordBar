import React from 'react';
import { ThemeSettings } from '../types';
import { X, Volume2, Sparkles, Sliders, Eye, Palette, Keyboard, Pin, Lock, Unlock, MoveVertical } from 'lucide-react';
import { sounds } from '../data/audioEffects';

interface SettingsModalProps {
  theme: ThemeSettings;
  onUpdateTheme: (newTheme: ThemeSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  onUpdateTheme,
  onClose,
}) => {
  const presets = [
    { id: 'duo', name: '经典翠绿', bg: 'bg-[#1a2e1a] border-duo-green', color: '#58cc02' },
    { id: 'glass', name: '磨砂半透', bg: 'bg-white/10 border-white/30', color: '#38bdf8' },
    { id: 'dark', name: '极简深色', bg: 'bg-neutral-900 border-neutral-700', color: '#60a5fa' },
    { id: 'stealth', name: '摸鱼极隐', bg: 'bg-black/40 border-white/10', color: '#a1a1aa' },
    { id: 'warm', name: '柔和米纸', bg: 'bg-amber-100 border-amber-300 text-amber-900', color: '#d97706' },
    { id: 'light', name: '亮白明快', bg: 'bg-white border-neutral-300 text-neutral-900', color: '#2563eb' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-end p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl mx-auto bg-neutral-900/95 border border-white/20 rounded-2xl shadow-2xl p-5 overflow-y-auto max-h-[440px] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-duo-green" />
            <h2 className="text-base font-bold">WordBar 外观与学习偏好设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 text-sm">
          {/* Section 1: Background & Color */}
          <div className="flex flex-col gap-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 font-bold text-white/90">
              <Palette className="w-4 h-4 text-duo-blue" />
              <span>外观主题与尺寸比例</span>
            </div>

            {/* Height & Proportions Section */}
            <div className="pb-3 border-b border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white/90 text-xs">
                  <MoveVertical className="w-3.5 h-3.5 text-cyan-400" />
                  <span>底栏高度与拉伸锁定</span>
                </div>
                {/* Lock / Unlock Toggle Button */}
                <button
                  onClick={() =>
                    onUpdateTheme({
                      ...theme,
                      lockHeightResize: !theme.lockHeightResize,
                    })
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    theme.lockHeightResize
                      ? 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30'
                      : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30'
                  }`}
                  title={theme.lockHeightResize ? '点击解锁底栏顶部拖拽拉伸' : '点击锁定防止误触拉伸'}
                >
                  {theme.lockHeightResize ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>已锁定高度拉伸</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>已解锁高度拉伸</span>
                    </>
                  )}
                </button>
              </div>

              {/* Height Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">底栏高度 (UI与文字自适应缩放)</span>
                  <span className="font-mono text-cyan-400 font-bold">{theme.barHeight || 58} px</span>
                </div>
                <input
                  type="range"
                  min="44"
                  max="130"
                  step="2"
                  value={theme.barHeight || 58}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      barHeight: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Height Presets */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/40 shrink-0">快捷高度:</span>
                <div className="grid grid-cols-4 gap-1.5 flex-1">
                  {[
                    { label: '极简 46px', val: 46 },
                    { label: '默认 58px', val: 58 },
                    { label: '舒适 76px', val: 76 },
                    { label: '巨幕 96px', val: 96 },
                  ].map((h) => {
                    const isCur = (theme.barHeight || 58) === h.val;
                    return (
                      <button
                        key={h.val}
                        onClick={() =>
                          onUpdateTheme({
                            ...theme,
                            barHeight: h.val,
                          })
                        }
                        className={`px-1.5 py-1 rounded text-[11px] font-medium border text-center transition-all ${
                          isCur
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/50'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs text-white/50 block mb-1.5">预设主题风格</label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isActive = theme.mode === 'preset' && theme.presetName === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          mode: 'preset',
                          presetName: p.id as any,
                        })
                      }
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isActive
                          ? 'border-duo-green bg-white/15 ring-2 ring-duo-green/40 font-bold'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/50">自定义背景颜色 (HEX)</span>
                <button
                  onClick={() =>
                    onUpdateTheme({
                      ...theme,
                      mode: theme.mode === 'custom' ? 'preset' : 'custom',
                    })
                  }
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                    theme.mode === 'custom'
                      ? 'bg-duo-green/20 border-duo-green text-duo-green'
                      : 'border-white/20 text-white/50 hover:text-white'
                  }`}
                >
                  {theme.mode === 'custom' ? '已启用自定义' : '开启自定义'}
                </button>
              </div>

              {theme.mode === 'custom' && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.customBg}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        customBg: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.customBg}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        customBg: e.target.value,
                      })
                    }
                    className="bg-black/30 border border-white/20 px-2 py-1 rounded text-xs text-white font-mono w-24"
                  />
                  <span className="text-xs text-white/40">文字色:</span>
                  <input
                    type="color"
                    value={theme.customText || '#ffffff'}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        customText: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.customText || '#ffffff'}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        customText: e.target.value,
                      })
                    }
                    className="bg-black/30 border border-white/20 px-2 py-1 rounded text-xs text-white font-mono w-24"
                    placeholder="#ffffff"
                  />
                </div>
              )}
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">背景不透明度 (0%为全透明)</span>
                <span className="font-mono text-duo-green font-bold">{theme.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={theme.opacity}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    opacity: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-duo-green h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">背景磨砂毛玻璃效果 (Backdrop Blur)</span>
              <input
                type="checkbox"
                checked={theme.backdropBlur}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    backdropBlur: e.target.checked,
                  })
                }
                className="accent-duo-green w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Learning & Sound */}
          <div className="flex flex-col gap-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 font-bold text-white/90">
              <Sparkles className="w-4 h-4 text-duo-yellow" />
              <span>背单词与交互偏好</span>
            </div>

            {/* Show translation always vs hover */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white/90">常显中文释义</div>
                <div className="text-[11px] text-white/50">关闭后仅悬浮或按空格显示（摸鱼防窥推荐）</div>
              </div>
              <input
                type="checkbox"
                checked={theme.showTranslationAlways}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    showTranslationAlways: e.target.checked,
                  })
                }
                className="accent-duo-green w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Sound effects */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white/90">闯关反馈音效</div>
                <div className="text-[11px] text-white/50">答对、答错、连击时的清脆奖励反馈音</div>
              </div>
              <input
                type="checkbox"
                checked={theme.soundEffects}
                onChange={(e) => {
                  sounds.enabled = e.target.checked;
                  onUpdateTheme({
                    ...theme,
                    soundEffects: e.target.checked,
                  });
                }}
                className="accent-duo-green w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Auto pronounce */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white/90">切换单词自动朗读</div>
                <div className="text-[11px] text-white/50">切换到新词时自动进行标准英音/美音发音</div>
              </div>
              <input
                type="checkbox"
                checked={theme.autoPronounce}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    autoPronounce: e.target.checked,
                  })
                }
                className="accent-duo-green w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Position Reset */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/70">重新吸附在任务栏正上方</span>
              <button
                onClick={() => {
                  if (window.electronAPI) {
                    window.electronAPI.resetPosition();
                  }
                }}
                className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors text-white"
              >
                <Pin className="w-3.5 h-3.5 text-duo-green" />
                <span>吸附回原位</span>
              </button>
            </div>
          </div>
        </div>

        {/* Shortcuts Reference */}
        <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 mb-2">
            <Keyboard className="w-3.5 h-3.5 text-duo-green" />
            <span>全局与操作快捷键指南</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded font-mono text-[11px] text-duo-green font-bold">↑</kbd>
              <span className="text-white/70">标记已掌握</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded font-mono text-[11px] text-duo-red font-bold">↓</kbd>
              <span className="text-white/70">标记为生疏</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded font-mono text-[11px]">← / →</kbd>
              <span className="text-white/60">上/下一词</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded font-mono text-[11px]">Space</kbd>
              <span className="text-white/60">显隐释义</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded font-mono text-[11px]">1 ~ 4</kbd>
              <span className="text-white/60">四选一抢答</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded font-mono text-[11px]">Ctrl+Alt+H</kbd>
              <span className="text-white/60">老板键隐藏</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
