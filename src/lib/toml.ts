import { parse, stringify } from 'smol-toml';

export type Direction = 'toml-to-json' | 'json-to-toml';

export function detectDirection(input: string): Direction {
  const trimmed = input.trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json-to-toml';
  }
  return 'toml-to-json';
}

export function tomlToJson(src: string): string {
  const parsed = parse(src);
  return JSON.stringify(parsed, null, 2);
}

export function jsonToToml(src: string): string {
  const parsed = JSON.parse(src) as Record<string, unknown>;
  return stringify(parsed);
}

export function formatToml(src: string): string {
  const parsed = parse(src);
  return stringify(parsed);
}

export function convert(src: string, direction: Direction): string {
  if (direction === 'toml-to-json') return tomlToJson(src);
  return jsonToToml(src);
}

// ── Syntax highlighter ────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightValue(raw: string): string {
  const trimmed = raw.trim();

  // String (double or single quoted, including multiline openers)
  if (/^["']/.test(trimmed) || /^"""/.test(trimmed) || /^'''/.test(trimmed)) {
    return `<span class="toml-string">${escHtml(raw)}</span>`;
  }

  // Boolean
  if (/^(true|false)$/.test(trimmed)) {
    return `<span class="toml-bool">${escHtml(raw)}</span>`;
  }

  // Date / datetime (TOML bare date: 2006-01-02 or 2006-01-02T15:04:05)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return `<span class="toml-date">${escHtml(raw)}</span>`;
  }

  // Number (int, float, hex, octal, binary, inf, nan)
  if (
    /^[+-]?(0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|[0-9][0-9_]*(\.[0-9_]+)?([eE][+-]?[0-9_]+)?|inf|nan)$/.test(
      trimmed,
    )
  ) {
    return `<span class="toml-number">${escHtml(raw)}</span>`;
  }

  // Inline array or table — highlight as plain (content already mixed types)
  return escHtml(raw);
}

function highlightLine(line: string): string {
  // Blank line
  if (!line.trim()) return '';

  // Full-line comment
  if (/^\s*#/.test(line)) {
    return `<span class="toml-comment">${escHtml(line)}</span>`;
  }

  // Array-of-tables header: [[key]]
  if (/^\s*\[\[.+\]\]/.test(line)) {
    return `<span class="toml-header">${escHtml(line)}</span>`;
  }

  // Section header: [key]
  if (/^\s*\[.+\]/.test(line)) {
    return `<span class="toml-header">${escHtml(line)}</span>`;
  }

  // Key = value (including dotted keys and quoted keys)
  const kvMatch = line.match(
    /^(\s*)((?:"[^"]*"|'[^']*'|[A-Za-z0-9_\-\.]+)(?:\s*\.\s*(?:"[^"]*"|'[^']*'|[A-Za-z0-9_\-\.]+))*)\s*(=)\s*(.*)$/,
  );
  if (kvMatch) {
    const [, indent, key, eq, rawValue] = kvMatch;

    // Trailing comment on value
    const commentMatch = rawValue.match(/^(.*?)\s*(#.*)$/);
    let valueHtml: string;
    let commentHtml = '';

    if (commentMatch && !isInsideString(commentMatch[1])) {
      valueHtml = highlightValue(commentMatch[1]);
      commentHtml = ` <span class="toml-comment">${escHtml(commentMatch[2])}</span>`;
    } else {
      valueHtml = highlightValue(rawValue);
    }

    return (
      escHtml(indent) +
      `<span class="toml-key">${escHtml(key)}</span>` +
      escHtml(` ${eq} `) +
      valueHtml +
      commentHtml
    );
  }

  // Continuation lines (multiline strings, arrays), inline tables, etc.
  return escHtml(line);
}

/** Rough check: is a string fragment the content of an open string literal? */
function isInsideString(s: string): boolean {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '"' && !inSingle) inDouble = !inDouble;
    else if (s[i] === "'" && !inDouble) inSingle = !inSingle;
  }
  return inDouble || inSingle;
}

export function highlightToml(src: string): string {
  return src.split('\n').map(highlightLine).join('\n');
}
