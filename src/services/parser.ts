import { WordItem } from '../types';

export function parseWordsFromText(content: string): WordItem[] {
  const words: WordItem[] = [];
  const trimmed = content.trim();

  // Try JSON first
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : (parsed.words || [parsed]);
      for (const item of list) {
        if (item.word || item.name) {
          words.push({
            id: `import-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            word: String(item.word || item.name).trim(),
            phonetic: item.phonetic ? String(item.phonetic).trim() : undefined,
            translation: String(item.translation || item.trans || item.meaning || item.definition || '').trim(),
            example: item.example ? String(item.example).trim() : undefined,
            exampleTrans: item.exampleTrans ? String(item.exampleTrans).trim() : undefined,
            masteryLevel: 0,
          });
        }
      }
      if (words.length > 0) return words;
    } catch {
      // Fall back to line-by-line parsing
    }
  }

  // Parse lines (CSV, TSV, or custom delimited)
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    let parts: string[] = [];

    if (line.includes('\t')) {
      // Tab delimited (TSV/Anki export)
      parts = line.split('\t').map((s) => s.trim());
    } else if (line.includes(',') && !line.startsWith('"')) {
      // Simple CSV
      parts = line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
    } else if (line.includes('——') || line.includes('--')) {
      // word -- trans
      parts = line.split(/——|--/).map((s) => s.trim());
    } else if (line.includes(':') || line.includes('：')) {
      // word: trans
      parts = line.split(/[:：]/).map((s) => s.trim());
    } else {
      // Space separated e.g. "abandon vt. 放弃"
      const match = line.match(/^([a-zA-Z\s\-']+?)\s+([/\\[].*?[/\\]])?\s*(.*)$/);
      if (match) {
        parts = [match[1], match[2] || '', match[3] || ''];
      } else {
        // Just split first space
        const firstSpace = line.indexOf(' ');
        if (firstSpace > 0) {
          parts = [line.slice(0, firstSpace).trim(), line.slice(firstSpace + 1).trim()];
        } else {
          parts = [line];
        }
      }
    }

    if (parts.length > 0 && parts[0]) {
      const word = parts[0].trim();
      let phonetic = '';
      let translation = '';
      let example = '';

      if (parts.length === 2) {
        translation = parts[1];
      } else if (parts.length === 3) {
        if (parts[1].startsWith('/') || parts[1].startsWith('[')) {
          phonetic = parts[1];
          translation = parts[2];
        } else {
          translation = parts[1];
          example = parts[2];
        }
      } else if (parts.length >= 4) {
        phonetic = parts[1];
        translation = parts[2];
        example = parts[3];
      }

      words.push({
        id: `import-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        word,
        phonetic: phonetic || undefined,
        translation: translation || '暂无释义',
        example: example || undefined,
        masteryLevel: 0,
      });
    }
  }

  return words;
}
