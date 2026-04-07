import { describe, expect, it } from 'vitest';
import {
  convert,
  escapeHtml,
  formatAge,
  highlightUrl,
  HISTORY_MAX,
  mergeHistory,
  parseUrl,
  pruneHistory,
  truncate,
  type EncodeMode,
} from '../lib/url-encoder';

// ── convert — encode component ────────────────────────────────────────────────

describe('convert: encode component', () => {
  const mode: EncodeMode = 'component';

  it('encodes spaces as %20', () => {
    expect(convert('hello world', mode).output).toBe('hello%20world');
  });

  it('encodes special URL characters', () => {
    const { output, error } = convert('https://example.com/path?q=1&b=2', mode);
    expect(error).toBeNull();
    expect(output).toBe('https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1%26b%3D2');
  });

  it('encodes hash and equals signs', () => {
    expect(convert('#=', mode).output).toBe('%23%3D');
  });

  it("preserves unreserved characters (A-Z, a-z, 0-9, - _ . ! ~ * ' ( ))", () => {
    const unreserved = "ABCZabcz0129-_.!~*'()";
    expect(convert(unreserved, mode).output).toBe(unreserved);
  });

  it('encodes unicode characters', () => {
    const { output, error } = convert('héllo', mode);
    expect(error).toBeNull();
    expect(output).toBe('h%C3%A9llo');
  });

  it('returns empty output and no error for empty input', () => {
    expect(convert('', mode)).toEqual({ output: '', error: null });
  });

  it('encodes emoji', () => {
    const { output, error } = convert('🚀', mode);
    expect(error).toBeNull();
    expect(output).toMatch(/^%[0-9A-F]{2}/);
  });
});

// ── convert — encode uri ──────────────────────────────────────────────────────

describe('convert: encode uri', () => {
  const mode: EncodeMode = 'uri';

  it('preserves : / ? # & = + in a full URL', () => {
    const url = 'https://example.com/path?q=hello world&b=2#section';
    const { output, error } = convert(url, mode);
    expect(error).toBeNull();
    expect(output).toContain('https://example.com/path?q=hello%20world&b=2#section');
  });

  it('encodes spaces as %20', () => {
    expect(convert('hello world', mode).output).toBe('hello%20world');
  });

  it("preserves structural URI characters (: / ? # @ ! $ & ' ( ) * + , ; =)", () => {
    const structural = ":/?#@!$&'()*+,;=";
    expect(convert(structural, mode).output).toBe(structural);
  });

  it('returns empty output for empty input', () => {
    expect(convert('', mode)).toEqual({ output: '', error: null });
  });
});

// ── convert — decode ──────────────────────────────────────────────────────────

describe('convert: decode', () => {
  const mode: EncodeMode = 'decode';

  it('decodes a percent-encoded component', () => {
    expect(convert('hello%20world', mode).output).toBe('hello world');
  });

  it('decodes a full encoded URL', () => {
    const encoded = 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1%26b%3D2';
    expect(convert(encoded, mode).output).toBe('https://example.com/path?q=1&b=2');
  });

  it('decodes unicode escape sequences', () => {
    expect(convert('h%C3%A9llo', mode).output).toBe('héllo');
  });

  it('decodes + as + (not space)', () => {
    // decodeURIComponent does NOT treat + as space
    expect(convert('hello+world', mode).output).toBe('hello+world');
  });

  it('returns empty output for empty input', () => {
    expect(convert('', mode)).toEqual({ output: '', error: null });
  });

  it('returns an error for a malformed percent sequence', () => {
    const { output, error } = convert('%GG', mode);
    expect(output).toBe('');
    expect(error).toBeTruthy();
  });

  it('returns an error for a lone percent sign', () => {
    const { output, error } = convert('%', mode);
    expect(output).toBe('');
    expect(error).toBeTruthy();
  });

  it('returns an error for incomplete percent sequence', () => {
    const { output, error } = convert('%2', mode);
    expect(output).toBe('');
    expect(error).toBeTruthy();
  });
});

// ── truncate ──────────────────────────────────────────────────────────────────

describe('truncate', () => {
  it('returns the string unchanged when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('appends ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('uses 48 as default max', () => {
    const long = 'a'.repeat(49);
    const result = truncate(long);
    expect(result).toHaveLength(49); // 48 chars + ellipsis char
    expect(result.endsWith('…')).toBe(true);
  });

  it('does not truncate at exactly the limit', () => {
    const exact = 'a'.repeat(48);
    expect(truncate(exact)).toBe(exact);
  });
});

// ── formatAge ────────────────────────────────────────────────────────────────

describe('formatAge', () => {
  const now = 1_700_000_100_000;

  it('returns "just now" for under 60 seconds', () => {
    expect(formatAge(now - 59_999, now)).toBe('just now');
    expect(formatAge(now, now)).toBe('just now');
  });

  it('returns minutes for 1 minute to under 1 hour', () => {
    expect(formatAge(now - 60_000, now)).toBe('1m ago');
    expect(formatAge(now - 3_599_999, now)).toBe('59m ago');
  });

  it('returns hours for 1 hour to under 24 hours', () => {
    expect(formatAge(now - 3_600_000, now)).toBe('1h ago');
    expect(formatAge(now - 86_399_999, now)).toBe('23h ago');
  });

  it('returns days for 24+ hours', () => {
    expect(formatAge(now - 86_400_000, now)).toBe('1d ago');
    expect(formatAge(now - 172_800_000, now)).toBe('2d ago');
  });
});

// ── pruneHistory ─────────────────────────────────────────────────────────────

describe('pruneHistory', () => {
  it('returns entries unchanged when under the limit', () => {
    const entries = [{ input: 'a', output: 'b', mode: 'component' as const, timestamp: 1 }];
    expect(pruneHistory(entries)).toEqual(entries);
  });

  it(`caps at ${HISTORY_MAX} entries`, () => {
    const entries = Array.from({ length: HISTORY_MAX + 5 }, (_, i) => ({
      input: `in-${i}`,
      output: `out-${i}`,
      mode: 'component' as const,
      timestamp: i,
    }));
    expect(pruneHistory(entries)).toHaveLength(HISTORY_MAX);
  });

  it('keeps the first (newest) entries when trimming', () => {
    const entries = Array.from({ length: HISTORY_MAX + 3 }, (_, i) => ({
      input: `in-${i}`,
      output: `out-${i}`,
      mode: 'decode' as const,
      timestamp: i,
    }));
    const pruned = pruneHistory(entries);
    expect(pruned[0].input).toBe('in-0');
    expect(pruned[pruned.length - 1].input).toBe(`in-${HISTORY_MAX - 1}`);
  });
});

// ── mergeHistory ─────────────────────────────────────────────────────────────

describe('mergeHistory', () => {
  it('prepends incoming before existing', () => {
    const existing = [{ input: 'old', output: 'OLD', mode: 'component' as const, timestamp: 1 }];
    const incoming = [{ input: 'new', output: 'NEW', mode: 'decode' as const, timestamp: 2 }];
    const merged = mergeHistory(incoming, existing);
    expect(merged[0].input).toBe('new');
    expect(merged[1].input).toBe('old');
  });

  it('respects the max cap', () => {
    const existing = Array.from({ length: HISTORY_MAX }, (_, i) => ({
      input: `old-${i}`,
      output: `OUT-${i}`,
      mode: 'uri' as const,
      timestamp: i,
    }));
    const incoming = [
      { input: 'brand-new', output: 'BRAND-NEW', mode: 'decode' as const, timestamp: 999 },
    ];
    const merged = mergeHistory(incoming, existing);
    expect(merged).toHaveLength(HISTORY_MAX);
    expect(merged[0].input).toBe('brand-new');
  });

  it('handles empty existing', () => {
    const incoming = [{ input: 'x', output: 'X', mode: 'component' as const, timestamp: 1 }];
    expect(mergeHistory(incoming, [])).toEqual(incoming);
  });

  it('handles empty incoming', () => {
    const existing = [{ input: 'y', output: 'Y', mode: 'uri' as const, timestamp: 2 }];
    expect(mergeHistory([], existing)).toEqual(existing);
  });
});

// ── escapeHtml ────────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes & < > "', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('<b>')).toBe('&lt;b&gt;');
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('escapes multiple occurrences', () => {
    expect(escapeHtml('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });
});

// ── parseUrl ──────────────────────────────────────────────────────────────────

describe('parseUrl', () => {
  it('parses a full URL with all parts', () => {
    const p = parseUrl('https://user:pass@example.com:8080/path/to/page?q=hello&page=2#section');
    expect(p.isUrl).toBe(true);
    expect(p.scheme).toBe('https');
    expect(p.userinfo).toBe('user:pass');
    expect(p.host).toBe('example.com');
    expect(p.port).toBe('8080');
    expect(p.path).toBe('/path/to/page');
    expect(p.params).toEqual([
      { key: 'q', value: 'hello' },
      { key: 'page', value: '2' },
    ]);
    expect(p.fragment).toBe('section');
  });

  it('parses a minimal URL (scheme + host only)', () => {
    const p = parseUrl('https://example.com');
    expect(p.isUrl).toBe(true);
    expect(p.scheme).toBe('https');
    expect(p.host).toBe('example.com');
    expect(p.port).toBeNull();
    expect(p.path).toBeNull();
    expect(p.params).toEqual([]);
    expect(p.fragment).toBeNull();
  });

  it('returns path as null when it is just /', () => {
    const p = parseUrl('https://example.com/');
    expect(p.path).toBeNull();
  });

  it('parses multiple query params including duplicates', () => {
    const p = parseUrl('https://example.com/?tag=a&tag=b&tag=c');
    expect(p.params).toEqual([
      { key: 'tag', value: 'a' },
      { key: 'tag', value: 'b' },
      { key: 'tag', value: 'c' },
    ]);
  });

  it('parses params with empty value', () => {
    const p = parseUrl('https://example.com/?debug=');
    expect(p.params).toEqual([{ key: 'debug', value: '' }]);
  });

  it('handles a username without password', () => {
    const p = parseUrl('https://user@example.com/');
    expect(p.userinfo).toBe('user');
  });

  it('returns isUrl: false for a plain string', () => {
    const p = parseUrl('just a plain string');
    expect(p.isUrl).toBe(false);
    expect(p.host).toBeNull();
    expect(p.params).toEqual([]);
  });

  it('returns isUrl: false for an empty string', () => {
    expect(parseUrl('').isUrl).toBe(false);
  });

  it('parses http and ftp schemes', () => {
    expect(parseUrl('http://example.com').scheme).toBe('http');
    expect(parseUrl('ftp://files.example.com').scheme).toBe('ftp');
  });
});

// ── highlightUrl ──────────────────────────────────────────────────────────────

describe('highlightUrl', () => {
  it('returns empty string for non-URL input', () => {
    const parsed = parseUrl('not a url');
    expect(highlightUrl(parsed)).toBe('');
  });

  it('wraps scheme in url-scheme span', () => {
    const parsed = parseUrl('https://example.com');
    expect(highlightUrl(parsed)).toContain('<span class="url-scheme">https</span>');
  });

  it('wraps host in url-host span', () => {
    const parsed = parseUrl('https://example.com');
    expect(highlightUrl(parsed)).toContain('<span class="url-host">example.com</span>');
  });

  it('wraps port in url-port span', () => {
    const parsed = parseUrl('https://example.com:9000');
    const html = highlightUrl(parsed);
    expect(html).toContain('<span class="url-port">9000</span>');
  });

  it('wraps each path segment in url-path-seg span', () => {
    const parsed = parseUrl('https://example.com/api/v1');
    const html = highlightUrl(parsed);
    expect(html).toContain('<span class="url-path-seg">api</span>');
    expect(html).toContain('<span class="url-path-seg">v1</span>');
  });

  it('wraps query param key and value in correct spans', () => {
    const parsed = parseUrl('https://example.com/?q=hello');
    const html = highlightUrl(parsed);
    expect(html).toContain('<span class="url-param-key">q</span>');
    expect(html).toContain('<span class="url-param-val">hello</span>');
  });

  it('wraps fragment in url-fragment span', () => {
    const parsed = parseUrl('https://example.com/#section-1');
    expect(highlightUrl(parsed)).toContain('<span class="url-fragment">section-1</span>');
  });

  it('HTML-escapes special characters in values', () => {
    const parsed = parseUrl('https://example.com/?q=a%3Cb%3E');
    const html = highlightUrl(parsed);
    expect(html).toContain('a&lt;b&gt;');
    expect(html).not.toContain('<b>');
  });

  it('uses &amp; between multiple query params', () => {
    const parsed = parseUrl('https://example.com/?a=1&b=2');
    const html = highlightUrl(parsed);
    expect(html).toContain('&amp;');
  });
});
