// ── Modes ─────────────────────────────────────────────────────────────────────

export type EncodeMode = 'component' | 'uri' | 'decode';

export const ENCODE_MODES: { value: EncodeMode; label: string }[] = [
  { value: 'component', label: 'encode component' },
  { value: 'uri', label: 'encode uri' },
  { value: 'decode', label: 'decode' },
];

// ── Conversion ────────────────────────────────────────────────────────────────

export interface ConversionResult {
  output: string;
  error: string | null;
}

export function convert(input: string, mode: EncodeMode): ConversionResult {
  if (!input) return { output: '', error: null };
  try {
    switch (mode) {
      case 'component':
        return { output: encodeURIComponent(input), error: null };
      case 'uri':
        return { output: encodeURI(input), error: null };
      case 'decode':
        return { output: decodeURIComponent(input), error: null };
    }
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

/** Characters preserved by encodeURIComponent (RFC 3986 unreserved + sub-delims) */
export function isEncodedByComponent(char: string): boolean {
  return !/[A-Za-z0-9\-_.!~*'()]/.test(char);
}

// ── URL parsing & highlighting ────────────────────────────────────────────────

export interface UrlParam {
  key: string;
  value: string;
}

export interface ParsedUrl {
  scheme: string | null;
  userinfo: string | null;
  host: string | null;
  port: string | null;
  path: string | null;
  params: UrlParam[];
  fragment: string | null;
  /** True when the URL constructor accepted the string */
  isUrl: boolean;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function parseUrl(url: string): ParsedUrl {
  try {
    const u = new URL(url);
    return {
      scheme: u.protocol.replace(/:$/, ''),
      userinfo: u.username ? (u.password ? `${u.username}:${u.password}` : u.username) : null,
      host: u.hostname || null,
      port: u.port || null,
      path: u.pathname !== '/' ? u.pathname : null,
      params: [...u.searchParams.entries()].map(([key, value]) => ({ key, value })),
      fragment: u.hash ? u.hash.slice(1) : null,
      isUrl: true,
    };
  } catch {
    return {
      scheme: null,
      userinfo: null,
      host: null,
      port: null,
      path: url || null,
      params: [],
      fragment: null,
      isUrl: false,
    };
  }
}

/**
 * Returns an HTML string where each URL part is wrapped in a colored span.
 * Uses :global CSS classes defined in UrlEncoder.astro.
 */
export function highlightUrl(parsed: ParsedUrl): string {
  if (!parsed.isUrl) return '';

  const e = escapeHtml;
  let html = '';

  if (parsed.scheme) {
    html += `<span class="url-scheme">${e(parsed.scheme)}</span>`;
    html += `<span class="url-punct">://</span>`;
  }

  if (parsed.userinfo) {
    html += `<span class="url-userinfo">${e(parsed.userinfo)}</span>`;
    html += `<span class="url-punct">@</span>`;
  }

  if (parsed.host) {
    html += `<span class="url-host">${e(parsed.host)}</span>`;
  }

  if (parsed.port) {
    html += `<span class="url-punct">:</span>`;
    html += `<span class="url-port">${e(parsed.port)}</span>`;
  }

  if (parsed.path) {
    // Colour each path segment individually, keep / separators dim
    const parts = parsed.path.split('/');
    for (let i = 0; i < parts.length; i++) {
      if (i === 0 && parts[i] === '') {
        html += `<span class="url-punct">/</span>`;
      } else if (parts[i] === '') {
        html += `<span class="url-punct">/</span>`;
      } else {
        if (i > 0) html += `<span class="url-punct">/</span>`;
        html += `<span class="url-path-seg">${e(parts[i])}</span>`;
      }
    }
  }

  if (parsed.params.length > 0) {
    html += `<span class="url-punct">?</span>`;
    parsed.params.forEach((p, i) => {
      if (i > 0) html += `<span class="url-punct">&amp;</span>`;
      html += `<span class="url-param-key">${e(p.key)}</span>`;
      html += `<span class="url-punct">=</span>`;
      html += `<span class="url-param-val">${e(p.value)}</span>`;
    });
  }

  if (parsed.fragment !== null) {
    html += `<span class="url-punct">#</span>`;
    html += `<span class="url-fragment">${e(parsed.fragment)}</span>`;
  }

  return html;
}

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  input: string;
  output: string;
  mode: EncodeMode;
  timestamp: number;
}

export const HISTORY_MAX = 30;

export function pruneHistory(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, HISTORY_MAX);
}

export function mergeHistory(incoming: HistoryEntry[], existing: HistoryEntry[]): HistoryEntry[] {
  return pruneHistory([...incoming, ...existing]);
}

export function truncate(s: string, max = 48): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

// ── Relative time ─────────────────────────────────────────────────────────────

export function formatAge(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
