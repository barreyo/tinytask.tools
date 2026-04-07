export interface ParsedHeader {
  name: string;
  value: string;
  explanation?: string;
}

export const HEADER_EXPLANATIONS: Record<string, string> = {
  // ── Request headers ────────────────────────────────────────────────────────
  accept:
    'Media types the client is willing to receive (e.g. text/html, application/json).',
  'accept-encoding':
    'Compression encodings the client supports (e.g. gzip, br, deflate).',
  'accept-language':
    'Natural languages the client prefers, in priority order (e.g. en-US, fr).',
  authorization:
    'Credentials for authenticating the client with the server (e.g. Bearer <token>, Basic <base64>).',
  cookie:
    'HTTP cookies previously set by the server, sent back on every request to that origin.',
  host: 'Domain name (and optional port) of the server being addressed. Required in HTTP/1.1.',
  origin:
    'Origin (scheme + host + port) of the cross-origin request. Used in CORS preflight checks.',
  referer:
    'URL of the page that linked to the requested resource. Note: the header name is a historical misspelling of "referrer".',
  'user-agent':
    'String identifying the client software (browser, version, OS, rendering engine).',
  'if-none-match':
    'Conditional request: only return the resource if its ETag does not match this value (used for cache validation).',
  'if-modified-since':
    'Conditional request: only return the resource if it was modified after this date (used for cache validation).',
  'if-match':
    'Conditional request: only proceed if the resource ETag matches (used for safe PUT/PATCH).',
  'if-unmodified-since':
    'Conditional request: only proceed if the resource has not changed since this date.',
  'cache-control':
    'Directives controlling caching behaviour for both requests and responses (e.g. no-cache, max-age=3600, private).',
  connection:
    'Whether the network connection should be kept alive after the request (keep-alive or close).',
  'content-type':
    'Media type and optional character set of the request body (e.g. application/json; charset=utf-8).',
  'content-length': 'Size of the request or response body in bytes.',
  range: 'Requests a specific byte range of the resource (used for resumable downloads).',
  te: 'Transfer encodings the client is willing to accept (e.g. trailers, gzip).',
  upgrade: 'Asks the server to switch to a different protocol (e.g. websocket).',
  'x-requested-with':
    'Non-standard header used by many JavaScript frameworks to flag XHR/fetch requests (value is typically XMLHttpRequest).',
  'x-forwarded-for':
    'IP address(es) of the client and any intermediate proxies that forwarded the request.',
  'x-forwarded-host': 'Original Host header value as received by a reverse proxy.',
  'x-forwarded-proto':
    'Protocol (http or https) used by the client to reach the proxy.',

  // ── Response headers ───────────────────────────────────────────────────────
  'access-control-allow-origin':
    'CORS header specifying which origins may read the response (* or a specific origin).',
  'access-control-allow-methods':
    'CORS header listing the HTTP methods allowed for cross-origin requests.',
  'access-control-allow-headers':
    'CORS header listing the request headers that may be used in a cross-origin request.',
  'access-control-allow-credentials':
    'CORS header indicating whether the response can be shared when the request includes credentials (true or false).',
  'access-control-expose-headers':
    'CORS header listing response headers the browser is allowed to access from JavaScript.',
  'access-control-max-age':
    'CORS header specifying how long (seconds) the preflight response may be cached.',
  age: 'Time in seconds the response has been in a shared cache.',
  allow: 'HTTP methods supported by the target resource (sent with 405 Method Not Allowed).',
  'content-disposition':
    'Whether the response body should be displayed inline or treated as a download, and an optional filename.',
  'content-encoding':
    'Compression encoding applied to the response body (e.g. gzip, br, identity).',
  'content-language': 'Natural language(s) of the intended audience for the response body.',
  'content-range':
    'Byte range of the partial content being returned (used with 206 Partial Content).',
  'content-security-policy':
    'Security policy restricting the sources from which the browser may load resources. A key defence against XSS.',
  date: 'Date and time at which the response message was generated.',
  etag: 'Opaque identifier for a specific version of the resource, used for cache validation and conditional requests.',
  expires:
    'Date/time after which the response is considered stale. Superseded by Cache-Control max-age when both are present.',
  'last-modified': 'Date and time the resource was last changed on the server.',
  link: 'Metadata about the resource — typed relationships to other resources (e.g. rel=preload, rel=canonical).',
  location:
    'URL to redirect the client to (3xx responses) or the URL of a newly created resource (201 responses).',
  pragma:
    'Legacy HTTP/1.0 cache directive. "Pragma: no-cache" is equivalent to "Cache-Control: no-cache".',
  'referrer-policy':
    'Controls how much referrer information the browser includes in the Referer header on outgoing requests.',
  'retry-after':
    'How long the client should wait before retrying (used with 429 Too Many Requests or 503 Service Unavailable).',
  server: 'Software and version running on the origin server.',
  'set-cookie':
    'Instructs the browser to store a cookie. May include attributes like Expires, Path, Domain, Secure, HttpOnly, SameSite.',
  'strict-transport-security':
    'HSTS: tells browsers to only connect over HTTPS for the specified max-age period, optionally including subdomains.',
  trailer:
    'Lists the headers that will be present in the trailers of a chunked transfer-encoded response.',
  'transfer-encoding':
    'Encoding applied for transfer (chunked, identity). Differs from Content-Encoding which is for storage.',
  vary: 'Lists request headers the server used to select the response variant. Important for correct cache keying.',
  'www-authenticate':
    'Authentication challenge sent with 401 Unauthorized, specifying the authentication scheme (e.g. Bearer, Basic).',
  'x-content-type-options':
    '"nosniff" tells browsers not to MIME-sniff the content type — prevents certain injection attacks.',
  'x-frame-options':
    'Controls whether the page may be embedded in a frame. Values: DENY, SAMEORIGIN. Superseded by CSP frame-ancestors.',
  'x-powered-by': 'Identifies the server-side technology (e.g. PHP/8.1). Often suppressed for security.',
  'x-request-id':
    'Unique identifier for the request, useful for correlating logs across services. Non-standard but widely used.',
  'x-xss-protection':
    'Legacy IE/Chrome XSS filter directive. Largely obsolete — use Content-Security-Policy instead.',
  'permissions-policy':
    'Controls which browser features (camera, geolocation, etc.) may be used by the document and its iframes.',
  'cross-origin-opener-policy':
    'COOP: controls whether the document may share a browsing context group with cross-origin documents.',
  'cross-origin-embedder-policy':
    'COEP: requires all sub-resources to opt in to being embedded, enabling SharedArrayBuffer.',
  'cross-origin-resource-policy':
    'CORP: restricts which origins may load this resource (same-site, same-origin, cross-origin).',
};

const HTTP_REQUEST_LINE = /^[A-Z]+\s+\S+\s+HTTP\/\d+(\.\d+)?$/i;
const HTTP_STATUS_LINE = /^HTTP\/\d+(\.\d+)?\s+\d{3}/i;

/**
 * Parses a raw HTTP header block into structured name/value pairs.
 *
 * Handles:
 * - Optional leading request or status line (stripped automatically)
 * - RFC 7230 header folding (continuation lines starting with whitespace)
 * - Headers with colons in the value (only the first colon is used as separator)
 * - Blank lines (ignored)
 */
export function parseHeaders(raw: string): ParsedHeader[] {
  if (!raw.trim()) return [];

  const lines = raw.split(/\r?\n/);
  const unfolded: string[] = [];

  for (const line of lines) {
    if (/^[ \t]/.test(line)) {
      // Continuation line — fold into previous header value
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += ' ' + line.trim();
      }
    } else {
      unfolded.push(line);
    }
  }

  const results: ParsedHeader[] = [];

  for (const line of unfolded) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip request/status lines
    if (HTTP_REQUEST_LINE.test(trimmed) || HTTP_STATUS_LINE.test(trimmed)) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx < 1) continue;

    const name = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (!name) continue;

    const explanation = HEADER_EXPLANATIONS[name.toLowerCase()];
    results.push({ name, value, explanation });
  }

  return results;
}
