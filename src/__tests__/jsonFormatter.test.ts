import { describe, expect, it } from 'vitest';
import {
  autoFix,
  cleanErrorMessage,
  escapeHtml,
  extractErrorOffset,
  highlightJson,
  offsetToLineCol,
  renderWithLineNumbers,
} from '../utils/jsonFormatter';

// ── escapeHtml ────────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than and greater-than', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes all special characters in one string', () => {
    expect(escapeHtml('<a href="x&y">')).toBe('&lt;a href=&quot;x&amp;y&quot;&gt;');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });
});

// ── autoFix ───────────────────────────────────────────────────────────────────

describe('autoFix', () => {
  it('removes a trailing comma before }', () => {
    expect(autoFix('{"a":1,}')).toBe('{"a":1}');
  });

  it('removes a trailing comma before ]', () => {
    expect(autoFix('[1,2,3,]')).toBe('[1,2,3]');
  });

  it('removes trailing comma with whitespace', () => {
    expect(autoFix('{"a":1,  \n}')).toBe('{"a":1  \n}');
  });

  it('converts single-quoted strings to double-quoted', () => {
    expect(autoFix("{'key':'value'}")).toBe('{"key":"value"}');
  });

  it('escapes bare double quotes inside single-quoted strings', () => {
    expect(autoFix(`{'say':'he said "hi"'}`)).toBe(`{"say":"he said \\"hi\\""}`);
  });

  it('preserves already-escaped quotes inside single-quoted strings', () => {
    expect(autoFix(`{'a':'it\\'s'}`)).toBe(`{"a":"it\\'s"}`);
  });

  it('handles valid JSON without modification', () => {
    const valid = '{"a":1,"b":[2,3]}';
    expect(autoFix(valid)).toBe(valid);
  });

  it('fixes both trailing commas and single quotes in one pass', () => {
    expect(autoFix("{'a':1,}")).toBe('{"a":1}');
  });
});

// ── cleanErrorMessage ─────────────────────────────────────────────────────────

describe('cleanErrorMessage', () => {
  it('strips "JSON.parse: " prefix', () => {
    expect(cleanErrorMessage('JSON.parse: unexpected end of data')).toBe('unexpected end of data');
  });

  it('strips "JSON Parse error: " prefix (Safari style)', () => {
    expect(cleanErrorMessage('JSON Parse error: Unexpected identifier "foo"')).toBe(
      'Unexpected identifier "foo"',
    );
  });

  it('is case-insensitive for the prefix', () => {
    expect(cleanErrorMessage('json.parse: something')).toBe('something');
  });

  it('leaves messages without those prefixes unchanged', () => {
    expect(cleanErrorMessage('Unexpected token } at position 5')).toBe(
      'Unexpected token } at position 5',
    );
  });

  it('returns empty string unchanged', () => {
    expect(cleanErrorMessage('')).toBe('');
  });
});

// ── offsetToLineCol ───────────────────────────────────────────────────────────

describe('offsetToLineCol', () => {
  it('returns line 0 col 0 for offset 0', () => {
    expect(offsetToLineCol('hello', 0)).toEqual({ line: 0, col: 0 });
  });

  it('returns correct column on the first line', () => {
    expect(offsetToLineCol('hello', 3)).toEqual({ line: 0, col: 3 });
  });

  it('returns correct line and column after a newline', () => {
    // "abc\ndef" — offset 4 is the 'd'
    expect(offsetToLineCol('abc\ndef', 4)).toEqual({ line: 1, col: 0 });
  });

  it('returns correct column mid-second line', () => {
    expect(offsetToLineCol('abc\ndef', 6)).toEqual({ line: 1, col: 2 });
  });

  it('handles multiple newlines', () => {
    // "a\nb\nc" — offset 4 is 'c'
    expect(offsetToLineCol('a\nb\nc', 4)).toEqual({ line: 2, col: 0 });
  });
});

// ── extractErrorOffset ────────────────────────────────────────────────────────

describe('extractErrorOffset', () => {
  function makeError(message: string): SyntaxError {
    const e = new SyntaxError(message);
    return e;
  }

  it('parses V8-style "at position N" messages', () => {
    const result = extractErrorOffset('{}', makeError("Unexpected token '}' at position 7"));
    expect(result.offset).toBe(7);
  });

  it('parses Firefox-style "at line N column N" messages', () => {
    const src = 'abc\ndef\nghi';
    const result = extractErrorOffset(
      src,
      makeError('JSON.parse: bad at line 2 column 3 of the JSON data'),
    );
    // line 2, col 3 → 1-indexed → line index 1, col index 2
    // "abc\n" = 4 chars, then col 2 → offset = 4 + 2 = 6
    expect(result.offset).toBe(6);
  });

  it('parses Safari-style "at character N" messages', () => {
    const result = extractErrorOffset(
      '{}',
      makeError('JSON Parse error: Unexpected identifier at character 12'),
    );
    expect(result.offset).toBe(12);
  });

  it('returns null offset when no position info is present', () => {
    const result = extractErrorOffset('{}', makeError('Unexpected end of JSON input'));
    expect(result.offset).toBeNull();
  });

  it('always returns the original message', () => {
    const msg = 'Some error at position 3';
    const result = extractErrorOffset('{}', makeError(msg));
    expect(result.message).toBe(msg);
  });
});

// ── highlightJson ─────────────────────────────────────────────────────────────

describe('highlightJson', () => {
  it('wraps object keys in jf-key spans', () => {
    const result = highlightJson('{"name": "Alice"}');
    expect(result).toContain('<span class="jf-key">');
    expect(result).toContain('name');
  });

  it('wraps string values in jf-string spans', () => {
    const result = highlightJson('{"name": "Alice"}');
    expect(result).toContain('<span class="jf-string">');
    expect(result).toContain('Alice');
  });

  it('wraps numbers in jf-number spans', () => {
    const result = highlightJson('{"age": 42}');
    expect(result).toContain('<span class="jf-number">42</span>');
  });

  it('wraps negative numbers in jf-number spans', () => {
    const result = highlightJson('{"temp": -5}');
    expect(result).toContain('<span class="jf-number">-5</span>');
  });

  it('wraps float numbers in jf-number spans', () => {
    const result = highlightJson('{"pi": 3.14}');
    expect(result).toContain('<span class="jf-number">3.14</span>');
  });

  it('wraps true/false in jf-bool spans', () => {
    const result = highlightJson('{"ok": true, "fail": false}');
    expect(result).toContain('<span class="jf-bool">true</span>');
    expect(result).toContain('<span class="jf-bool">false</span>');
  });

  it('wraps null in jf-null spans', () => {
    const result = highlightJson('{"x": null}');
    expect(result).toContain('<span class="jf-null">null</span>');
  });

  it('HTML-escapes special characters in string values', () => {
    const result = highlightJson('{"html": "<b>bold</b>"}');
    expect(result).toContain('&lt;b&gt;bold&lt;/b&gt;');
    expect(result).not.toContain('<b>');
  });

  it('handles an empty object', () => {
    expect(() => highlightJson('{}')).not.toThrow();
  });

  it('handles an empty array', () => {
    expect(() => highlightJson('[]')).not.toThrow();
  });
});

// ── renderWithLineNumbers ─────────────────────────────────────────────────────

describe('renderWithLineNumbers', () => {
  it('wraps each line in a div with a line number span', () => {
    const result = renderWithLineNumbers('line1\nline2', null);
    expect(result).toContain('<div>');
    expect(result).toContain('class="jf-ln"');
    expect(result).toContain('class="jf-lc"');
  });

  it('produces the correct number of div rows', () => {
    const result = renderWithLineNumbers('a\nb\nc', null);
    const matches = result.match(/<div/g);
    expect(matches).toHaveLength(3);
  });

  it('marks the error line with jf-line--error class', () => {
    const result = renderWithLineNumbers('a\nb\nc', 1);
    expect(result).toContain('class="jf-line--error"');
  });

  it('only marks one line as error', () => {
    const result = renderWithLineNumbers('a\nb\nc', 0);
    const matches = result.match(/class="jf-line--error"/g);
    expect(matches).toHaveLength(1);
  });

  it('renders a non-breaking space for empty lines', () => {
    const result = renderWithLineNumbers('a\n\nb', null);
    expect(result).toContain('\u00a0');
  });

  it('uses 1-based line numbers', () => {
    const result = renderWithLineNumbers('only', null);
    // The first (and only) line number should be "1" (padded with &nbsp;)
    expect(result).toContain('1');
  });

  it('does not mark any line as error when errorLineIndex is null', () => {
    const result = renderWithLineNumbers('a\nb', null);
    expect(result).not.toContain('jf-line--error');
  });
});
