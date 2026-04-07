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
    description: 'Generate UUIDs (v1, v3, v4, v5, v7) and ULIDs with history.',
    tags: ['generate', 'ids', 'ulid'],
    implemented: true,
  },
  {
    slug: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode and decode Base64 strings.',
    tags: ['encode', 'decode'],
    implemented: true,
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
    implemented: true,
  },
  {
    slug: 'crontab',
    name: 'Crontab Calculator',
    description: 'Parse cron expressions into human-readable schedules and see upcoming triggers.',
    tags: ['cron', 'schedule', 'time'],
    implemented: true,
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes.',
    tags: ['hash', 'crypto'],
    implemented: true,
  },
  {
    slug: 'timestamp',
    name: 'Unix Timestamp',
    description: 'Convert between Unix timestamps and human-readable dates.',
    tags: ['time', 'convert'],
    implemented: true,
  },
];
