export interface Tool {
  slug: string;
  name: string;
  description: string;
  tags?: string[];
  /** Set to true once src/pages/tools/{slug}.astro exists */
  implemented?: boolean;
}

export const tools: Tool[] = [
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate RFC 4122 v4 UUIDs instantly.',
    tags: ['generate', 'ids'],
    implemented: true,
  },
  {
    slug: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode and decode Base64 strings.',
    tags: ['encode', 'decode'],
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Prettify and validate JSON data.',
    tags: ['json', 'format'],
    implemented: true,
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Percent-encode and decode URL components.',
    tags: ['url', 'encode', 'decode'],
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes.',
    tags: ['hash', 'crypto'],
  },
  {
    slug: 'timestamp',
    name: 'Unix Timestamp',
    description: 'Convert between Unix timestamps and human-readable dates.',
    tags: ['time', 'convert'],
  },
];
