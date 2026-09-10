import { ThemeSettings } from '../types';

export function getThemeStyles(theme: ThemeSettings) {
  const alpha = Math.max(0, Math.min(1, theme.opacity / 100));

  let backgroundColor = '';
  let textColor = '#ffffff';
  let borderColor = 'rgba(255, 255, 255, 0.12)';
  let accentColor = '#58cc02';

  if (theme.mode === 'custom') {
    // Hex to RGBA
    const hex = theme.customBg.replace('#', '');
    const r = parseInt(hex.substring(0, 2) || '0', 16);
    const g = parseInt(hex.substring(2, 4) || '0', 16);
    const b = parseInt(hex.substring(4, 6) || '0', 16);
    backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    textColor = theme.customText || '#ffffff';
  } else {
    switch (theme.presetName) {
      case 'duo':
        backgroundColor = `rgba(26, 46, 26, ${alpha})`;
        textColor = '#ffffff';
        accentColor = '#58cc02';
        borderColor = 'rgba(88, 204, 2, 0.35)';
        break;
      case 'glass':
        backgroundColor = `rgba(255, 255, 255, ${Math.min(alpha, 0.2)})`;
        textColor = '#f8fafc';
        borderColor = 'rgba(255, 255, 255, 0.25)';
        accentColor = '#38bdf8';
        break;
      case 'dark':
        backgroundColor = `rgba(18, 18, 22, ${alpha})`;
        textColor = '#f3f4f6';
        borderColor = 'rgba(255, 255, 255, 0.1)';
        accentColor = '#60a5fa';
        break;
      case 'stealth':
        // Pure minimal/nearly transparent stealth摸鱼
        backgroundColor = `rgba(0, 0, 0, ${Math.min(alpha, 0.4)})`;
        textColor = 'rgba(240, 240, 240, 0.85)';
        borderColor = 'rgba(255, 255, 255, 0.08)';
        accentColor = '#a1a1aa';
        break;
      case 'warm':
        backgroundColor = `rgba(254, 243, 199, ${alpha})`;
        textColor = '#451a03';
        borderColor = 'rgba(217, 119, 6, 0.3)';
        accentColor = '#d97706';
        break;
      case 'light':
        backgroundColor = `rgba(255, 255, 255, ${alpha})`;
        textColor = '#0f172a';
        borderColor = 'rgba(0, 0, 0, 0.12)';
        accentColor = '#2563eb';
        break;
    }
  }

  return {
    containerStyle: {
      backgroundColor,
      color: textColor,
      borderColor,
      backdropFilter: theme.backdropBlur ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: theme.backdropBlur ? 'blur(16px)' : 'none',
    },
    textColor,
    accentColor,
    borderColor,
  };
}
