export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  readingTimeSec: number;
  speakingTimeSec: number;
  smsSegments: number;
  smsEncoding: 'GSM-7' | 'UCS-2' | 'empty';
}

export interface KeywordEntry {
  word: string;
  count: number;
}

// GSM-7 basic character set (excluding extended table for simplicity)
const GSM7_CHARS = new Set(
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'ÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyz äöñüà' +
    '0123456789',
);

const GSM7_EXTENDED = new Set('[\\]^{|}~€');

function isGsm7(text: string): boolean {
  for (const char of text) {
    if (!GSM7_CHARS.has(char) && !GSM7_EXTENDED.has(char)) return false;
  }
  return true;
}

function gsm7Length(text: string): number {
  let len = 0;
  for (const char of text) {
    len += GSM7_EXTENDED.has(char) ? 2 : 1;
  }
  return len;
}

function countSmsSegments(text: string): {
  segments: number;
  encoding: 'GSM-7' | 'UCS-2' | 'empty';
} {
  if (!text) return { segments: 0, encoding: 'empty' };

  if (isGsm7(text)) {
    const len = gsm7Length(text);
    if (len <= 160) return { segments: 1, encoding: 'GSM-7' };
    return { segments: Math.ceil(len / 153), encoding: 'GSM-7' };
  } else {
    // UCS-2: count Unicode code points (each is 2 bytes)
    const len = [...text].length;
    if (len <= 70) return { segments: 1, encoding: 'UCS-2' };
    return { segments: Math.ceil(len / 67), encoding: 'UCS-2' };
  }
}

const READING_WPM = 238;
const SPEAKING_WPM = 150;

// Common English stop words to exclude from keyword counting
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'it',
  'its',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'our',
  'their',
  'not',
  'no',
  'as',
  'if',
  'so',
  'than',
  'then',
  'when',
  'where',
  'how',
  'what',
  'which',
  'who',
]);

export function countStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  // Sentences: split on . ! ? followed by space or end
  const sentences =
    text.trim() === '' ? 0 : (text.match(/[.!?]+(\s|$)/g) ?? []).length || (text.trim() ? 1 : 0);

  // Paragraphs: non-empty blocks separated by blank lines
  const paragraphs =
    text.trim() === ''
      ? 0
      : text
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean).length || (text.trim() ? 1 : 0);

  const lines = text === '' ? 0 : text.split('\n').length;

  const bytes = new TextEncoder().encode(text).byteLength;

  const readingTimeSec = (words / READING_WPM) * 60;
  const speakingTimeSec = (words / SPEAKING_WPM) * 60;

  const { segments: smsSegments, encoding: smsEncoding } = countSmsSegments(text);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    bytes,
    readingTimeSec,
    speakingTimeSec,
    smsSegments,
    smsEncoding,
  };
}

export function topKeywords(text: string, limit = 10): KeywordEntry[] {
  if (!text.trim()) return [];

  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function formatTime(seconds: number): string {
  if (seconds < 1) return '< 1s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
