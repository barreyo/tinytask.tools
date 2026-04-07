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
  {
    slug: 'list-cleaner',
    name: 'List Cleaner',
    description: 'Paste a messy list and deduplicate, sort, trim, or reformat it instantly.',
    tags: ['list', 'format', 'clean'],
    implemented: true,
  },
  {
    slug: 'luhn-checker',
    name: 'Luhn Checker',
    description:
      'Validate credit card numbers or generate a valid test number for a given IIN/BIN.',
    tags: ['luhn', 'credit card', 'validate'],
    implemented: true,
  },
  {
    slug: 'jwt-debugger',
    name: 'JWT Debugger',
    description:
      'Decode JSON Web Tokens in the browser — header, payload, and signature — without sending your token anywhere.',
    tags: ['jwt', 'decode', 'auth'],
    implemented: true,
  },
  {
    slug: 'currency-lookup',
    name: 'ISO 4217 Currency Lookup',
    description:
      'Search all ISO 4217 currency codes with exponents, symbols, numeric codes, and country flags.',
    tags: ['currency', 'iso', 'finance'],
    implemented: true,
  },
  {
    slug: 'yaml-json',
    name: 'YAML ↔ JSON Converter',
    description: 'Convert between YAML and JSON instantly in the browser.',
    tags: ['yaml', 'json', 'convert'],
    implemented: true,
  },
  {
    slug: 'diff-checker',
    name: 'Diff Checker',
    description:
      'Compare two texts side-by-side or inline — great for config files and API responses.',
    tags: ['diff', 'compare', 'text'],
    implemented: true,
  },
  {
    slug: 'svg-optimizer',
    name: 'SVG Optimizer',
    description:
      'Minify and clean SVG files in the browser using SVGO — strip metadata, collapse groups, and shrink path data.',
    tags: ['svg', 'optimize', 'minify'],
    implemented: true,
  },
  {
    slug: 'image-optimizer',
    name: 'Image → WebP',
    description:
      'Convert JPEG, PNG, and other images to WebP with adjustable quality and optional resizing — fully in the browser.',
    tags: ['image', 'webp', 'optimize', 'convert'],
    implemented: true,
  },
  {
    slug: 'dummy-text',
    name: 'Dummy Text Generator',
    description:
      'Generate themed placeholder text — Lorem Ipsum, Fintech, Startup, Corporate, Developer, Design, Legal, and Hipster flavors.',
    tags: ['text', 'placeholder', 'lorem', 'generate'],
    implemented: true,
  },
];
