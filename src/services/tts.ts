// Text-to-speech pronunciation service
// Combines Web Speech API (instant & offline) with Youdao native audio fallback

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private audioEl: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(word: string, accent: 'us' | 'uk' = 'us') {
    if (!word) return;

    // Try Web Speech API first
    if (this.synth) {
      try {
        this.synth.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
        utterance.rate = 0.9; // Natural pace

        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith(accent === 'uk' ? 'en-GB' : 'en-US') && !v.name.includes('Google')
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onerror = () => {
          this.fallbackOnlineAudio(word, accent);
        };

        this.synth.speak(utterance);
        return;
      } catch (e) {
        console.warn('SpeechSynthesis error, falling back to online audio:', e);
      }
    }

    // Fallback to online voice stream
    this.fallbackOnlineAudio(word, accent);
  }

  private fallbackOnlineAudio(word: string, accent: 'us' | 'uk') {
    const type = accent === 'uk' ? 1 : 2;
    const url = `https://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(word)}`;

    if (!this.audioEl) {
      this.audioEl = new Audio();
    }

    this.audioEl.src = url;
    this.audioEl.play().catch((err) => {
      console.warn('Online TTS audio play blocked or failed:', err);
    });
  }
}

export const tts = new TTSService();
