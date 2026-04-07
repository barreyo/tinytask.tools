export interface ParseError {
  message: string;
  offset: number | null;
}

export function extractErrorOffset(src: string, err: SyntaxError): ParseError {
  const msg = err.message;

  // V8: "Unexpected token '}', ..."at position 42"
  let m = msg.match(/at position (\d+)/);
  if (m) return { message: msg, offset: parseInt(m[1], 10) };

  // Firefox: "JSON.parse: ... at line N column N of the JSON data"
  m = msg.match(/at line (\d+) column (\d+)/);
  if (m) {
    const line = parseInt(m[1], 10) - 1;
    const col = parseInt(m[2], 10) - 1;
    const lines = src.split('\n');
    let off = 0;
    for (let i = 0; i < line && i < lines.length; i++) off += lines[i].length + 1;
    off += col;
    return { message: msg, offset: off };
  }

  // Safari: "JSON Parse error: ... at character N"
  m = msg.match(/at character (\d+)/);
  if (m) return { message: msg, offset: parseInt(m[1], 10) };

  return { message: msg, offset: null };
}

export function offsetToLineCol(src: string, offset: number): { line: number; col: number } {
  const before = src.slice(0, offset);
  const lines = before.split('\n');
  return { line: lines.length - 1, col: lines[lines.length - 1].length };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightJson(json: string): string {
  const escaped = escapeHtml(json);
  const quot = '&quot;';

  const strPat = `(${quot}(?:\\\\.|(?!${quot})[^\\\\])*${quot})`;
  const re = new RegExp(
    `${strPat}(\\s*:)?|(-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)|\\b(true|false)\\b|\\b(null)\\b`,
    'g',
  );

  return escaped.replace(re, (match, str, colon, num, bool, nul) => {
    if (str !== undefined) {
      if (colon !== undefined) return `<span class="jf-key">${str}</span>${colon}`;
      return `<span class="jf-string">${str}</span>`;
    }
    if (num !== undefined) return `<span class="jf-number">${num}</span>`;
    if (bool !== undefined) return `<span class="jf-bool">${bool}</span>`;
    if (nul !== undefined) return `<span class="jf-null">${nul}</span>`;
    return match;
  });
}

export function renderWithLineNumbers(html: string, errorLineIndex: number | null): string {
  const lines = html.split('\n');
  const rows = lines.map((line, i) => {
    const isError = i === errorLineIndex;
    const rowClass = isError ? ' class="jf-line--error"' : '';
    const lineNum = `<span class="jf-ln" aria-hidden="true">${String(i + 1).padStart(4, '\u00a0')}</span>`;
    return `<div${rowClass}>${lineNum}<span class="jf-lc">${line || '\u00a0'}</span></div>`;
  });
  return rows.join('');
}

export function autoFix(src: string): string {
  let s = src;

  // Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // Convert single-quoted strings to double-quoted
  s = s.replace(/'((?:[^'\\]|\\.)*)'/g, (_match, inner: string) => {
    const escaped = inner.replace(/(?<!\\)"/g, '\\"');
    return `"${escaped}"`;
  });

  return s;
}

export function cleanErrorMessage(msg: string): string {
  return msg.replace(/^JSON\.parse:\s*/i, '').replace(/^JSON Parse error:\s*/i, '');
}
