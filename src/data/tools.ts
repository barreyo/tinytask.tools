export interface Tool {
  slug: string;
  name: string;
  description: string;
  /** SEO-optimised meta description (150–160 chars). Falls back to description. */
  metaDescription?: string;
  tags?: string[];
  /** Set to true once src/pages/tools/{slug}.astro exists */
  implemented?: boolean;
  /** FAQ entries rendered below the tool and used for FAQPage JSON-LD */
  faq?: { q: string; a: string }[];
}

export const tools: Tool[] = [
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUIDs (v1, v3, v4, v5, v7) and ULIDs with history.',
    metaDescription:
      'Free online UUID generator — create v1, v4, v5, v7 UUIDs and ULIDs instantly. Runs entirely in your browser, nothing sent to a server.',
    tags: ['generate', 'ids', 'ulid'],
    implemented: true,
    faq: [
      {
        q: 'What is a UUID?',
        a: 'A UUID (Universally Unique Identifier) is a 128-bit label standardised by RFC 9562. It is written as 32 hexadecimal digits in five groups separated by hyphens, e.g. 550e8400-e29b-41d4-a716-446655440000.',
      },
      {
        q: 'Which UUID version should I use?',
        a: 'Use v4 for random IDs in most cases. Use v7 for time-sortable IDs suitable for database primary keys. Use v5 for deterministic IDs derived from a name and namespace. Avoid v1 in new code unless you specifically need MAC-address-based IDs.',
      },
      {
        q: 'What is a ULID?',
        a: 'A ULID (Universally Unique Lexicographically Sortable Identifier) encodes a millisecond-precision timestamp plus random bits as a 26-character Crockford Base32 string. ULIDs sort correctly as strings, making them great for ordered database keys.',
      },
    ],
  },
  {
    slug: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode and decode Base64 strings.',
    metaDescription:
      'Free online Base64 encoder and decoder — paste text or a URL, get the Base64 result instantly. Runs entirely in your browser, no data leaves your device.',
    tags: ['encode', 'decode'],
    implemented: true,
    faq: [
      {
        q: 'What is Base64 encoding?',
        a: 'Base64 is a binary-to-text encoding scheme that represents binary data using 64 printable ASCII characters (A–Z, a–z, 0–9, +, /). It is commonly used to embed binary data in JSON, HTML, or HTTP headers.',
      },
      {
        q: 'What is the difference between Base64 and Base64URL?',
        a: 'Base64URL replaces + with - and / with _, and omits padding = characters, making the output safe to use in URLs and filenames without percent-encoding.',
      },
      {
        q: 'Does encoding make data secure?',
        a: 'No. Base64 is encoding, not encryption. Anyone can decode it instantly. Do not use Base64 as a security measure.',
      },
    ],
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Prettify and validate JSON data.',
    metaDescription:
      'Free online JSON formatter and validator — prettify, minify, and fix JSON with syntax highlighting. 100% client-side, no data sent to any server.',
    tags: ['json', 'format'],
    implemented: true,
    faq: [
      {
        q: 'What does the JSON Formatter do?',
        a: 'It parses your JSON and re-serialises it with consistent indentation and syntax highlighting. It also validates the JSON and reports parse errors with line and column numbers.',
      },
      {
        q: 'Can it fix invalid JSON?',
        a: 'The formatter highlights parse errors but cannot automatically fix them, because there is often more than one valid correction. Use the error position to locate and fix the issue manually.',
      },
      {
        q: 'Is my data sent to a server?',
        a: 'No. All parsing and formatting happens in your browser using the native JSON API. Nothing is transmitted.',
      },
    ],
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Percent-encode and decode URL components.',
    metaDescription:
      'Free online URL encoder and decoder — percent-encode or decode query strings and URL components instantly. Runs entirely in your browser.',
    tags: ['url', 'encode', 'decode'],
    implemented: true,
    faq: [
      {
        q: 'What is URL encoding?',
        a: 'URL encoding (percent-encoding) replaces characters that are not allowed in a URL with a % followed by two hexadecimal digits. For example, a space becomes %20.',
      },
      {
        q: 'When should I encode a full URL vs a component?',
        a: 'Use encodeURIComponent (component mode) for individual query-string values. Use encodeURI (full URL mode) only when you need to preserve the structural characters (://, /, ?, &, =) of a complete URL.',
      },
    ],
  },
  {
    slug: 'crontab',
    name: 'Crontab Calculator',
    description: 'Parse cron expressions into human-readable schedules and see upcoming triggers.',
    metaDescription:
      'Free online crontab calculator — parse cron expressions into plain English and preview the next scheduled run times. Runs in your browser.',
    tags: ['cron', 'schedule', 'time'],
    implemented: true,
    faq: [
      {
        q: 'What is a cron expression?',
        a: 'A cron expression is a string of five (or six) space-separated fields that define a recurring schedule: minute, hour, day-of-month, month, day-of-week. For example, "0 9 * * 1" runs at 09:00 every Monday.',
      },
      {
        q: 'What do the special characters mean?',
        a: '* means every value; , separates multiple values; - defines a range; / specifies a step (e.g., */5 means every 5 units); ? means no specific value (day fields only in some dialects).',
      },
      {
        q: 'Does this support seconds?',
        a: 'Yes. A six-field expression with a leading seconds field (0–59) is supported alongside the standard five-field POSIX format.',
      },
    ],
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes.',
    metaDescription:
      'Free online hash generator — compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any text. Runs entirely in your browser using the Web Crypto API.',
    tags: ['hash', 'crypto'],
    implemented: true,
    faq: [
      {
        q: 'What is a cryptographic hash?',
        a: 'A cryptographic hash function maps input data of any size to a fixed-size digest. The same input always produces the same digest, but even a one-character change produces a completely different result.',
      },
      {
        q: 'Which hash algorithm should I use?',
        a: 'Use SHA-256 or SHA-512 for general integrity checks and modern applications. Avoid MD5 and SHA-1 for security-sensitive use cases — they are cryptographically broken and vulnerable to collision attacks.',
      },
      {
        q: 'Can hashes be reversed?',
        a: 'No. Cryptographic hashes are one-way functions. You cannot recover the original input from a hash digest alone.',
      },
    ],
  },
  {
    slug: 'timestamp',
    name: 'Unix Timestamp',
    description: 'Convert between Unix timestamps and human-readable dates.',
    metaDescription:
      'Free online Unix timestamp converter — convert epoch seconds or milliseconds to a human-readable date and back. Runs in your browser.',
    tags: ['time', 'convert'],
    implemented: true,
    faq: [
      {
        q: 'What is a Unix timestamp?',
        a: 'A Unix timestamp (epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, not counting leap seconds. It is widely used in programming to represent points in time.',
      },
      {
        q: 'Seconds vs milliseconds — how do I tell them apart?',
        a: "A 10-digit number is almost certainly seconds (covers years up to ~2286). A 13-digit number is almost certainly milliseconds. JavaScript's Date.now() returns milliseconds; most Unix utilities use seconds.",
      },
      {
        q: 'What is the year 2038 problem?',
        a: 'Systems that store Unix timestamps as a signed 32-bit integer will overflow on 19 January 2038. Modern systems use 64-bit integers, which will not overflow for billions of years.',
      },
    ],
  },
  {
    slug: 'list-cleaner',
    name: 'List Cleaner',
    description: 'Paste a messy list and deduplicate, sort, trim, or reformat it instantly.',
    metaDescription:
      'Free online list cleaner — paste any list to deduplicate, sort, trim whitespace, and reformat it instantly. Runs entirely in your browser.',
    tags: ['list', 'format', 'clean'],
    implemented: true,
    faq: [
      {
        q: 'What kinds of lists can I clean?',
        a: 'Any newline-separated list: email addresses, IDs, URLs, words, numbers. The tool trims leading and trailing whitespace, removes duplicates (case-sensitively or case-insensitively), sorts alphabetically or numerically, and lets you choose the output separator.',
      },
      {
        q: 'Is my data sent anywhere?',
        a: 'No. All processing happens locally in your browser. Your list never leaves your device.',
      },
    ],
  },
  {
    slug: 'luhn-checker',
    name: 'Luhn Checker',
    description:
      'Validate credit card numbers or generate a valid test number for a given IIN/BIN.',
    metaDescription:
      'Free online Luhn algorithm checker — validate credit card numbers or generate a test card number for a given IIN/BIN prefix. Runs in your browser.',
    tags: ['luhn', 'credit card', 'validate'],
    implemented: true,
    faq: [
      {
        q: 'What is the Luhn algorithm?',
        a: 'The Luhn algorithm is a simple checksum formula used to validate identification numbers such as credit card numbers, IMEI numbers, and Canadian Social Insurance Numbers. It detects common single-digit transcription errors.',
      },
      {
        q: 'Does a valid Luhn checksum mean the card is real?',
        a: 'No. The Luhn check only verifies the number is structurally valid. A number can pass Luhn validation without being an issued, active card.',
      },
      {
        q: 'What is an IIN/BIN?',
        a: 'The Issuer Identification Number (IIN), also called the Bank Identification Number (BIN), is the first 6–8 digits of a card number. It identifies the card network (Visa, Mastercard, etc.) and the issuing institution.',
      },
    ],
  },
  {
    slug: 'jwt-debugger',
    name: 'JWT Debugger',
    description:
      'Decode JSON Web Tokens in the browser — header, payload, and signature — without sending your token anywhere.',
    metaDescription:
      'Free online JWT debugger — decode JSON Web Token header, payload, and signature instantly. Runs entirely in your browser; your token is never transmitted.',
    tags: ['jwt', 'decode', 'auth'],
    implemented: true,
    faq: [
      {
        q: 'What is a JWT?',
        a: 'A JSON Web Token (JWT) is a compact, URL-safe token format defined by RFC 7519. It consists of three Base64URL-encoded parts separated by dots: a header (algorithm and type), a payload (claims), and a signature.',
      },
      {
        q: 'Can this tool verify a JWT signature?',
        a: 'Signature verification requires the secret key or public key used to sign the token. This tool decodes the header and payload without verification, which is useful for inspecting claims during development.',
      },
      {
        q: 'Is it safe to paste a production JWT here?',
        a: 'The token is processed entirely in your browser — nothing is sent to a server. However, treat JWTs like passwords: avoid pasting production tokens into any tool if they grant access to sensitive resources.',
      },
    ],
  },
  {
    slug: 'currency-lookup',
    name: 'ISO 4217 Currency Lookup',
    description:
      'Search all ISO 4217 currency codes with exponents, symbols, numeric codes, and country flags.',
    metaDescription:
      'Free online ISO 4217 currency lookup — search all currency codes, symbols, numeric codes, minor unit exponents, and country flags. Runs in your browser.',
    tags: ['currency', 'iso', 'finance'],
    implemented: true,
    faq: [
      {
        q: 'What is ISO 4217?',
        a: 'ISO 4217 is the international standard for currency codes. Each active currency has a three-letter alphabetic code (e.g. USD, EUR, JPY) and a three-digit numeric code. The standard also specifies the minor unit exponent (decimal places).',
      },
      {
        q: 'What does the exponent (minor unit) mean?',
        a: 'The exponent indicates the number of decimal places in the smallest currency unit. USD has exponent 2 (cents = 1/100 dollar). JPY has exponent 0 (no sub-unit). Some currencies use 3 decimal places.',
      },
    ],
  },
  {
    slug: 'yaml-json',
    name: 'YAML ↔ JSON Converter',
    description: 'Convert between YAML and JSON instantly in the browser.',
    metaDescription:
      'Free online YAML to JSON converter (and JSON to YAML) — paste either format and convert instantly. Runs entirely in your browser.',
    tags: ['yaml', 'json', 'convert'],
    implemented: true,
    faq: [
      {
        q: 'What is the difference between YAML and JSON?',
        a: 'Both formats represent structured data. JSON uses braces, brackets, and explicit quotes. YAML uses indentation and is more human-readable but whitespace-sensitive. YAML is a superset of JSON — all valid JSON is valid YAML 1.2.',
      },
      {
        q: 'Are there YAML features that cannot be represented in JSON?',
        a: 'Yes. YAML supports comments, anchors and aliases (references), multi-document files, and non-string keys. These features are lost when converting to JSON.',
      },
    ],
  },
  {
    slug: 'diff-checker',
    name: 'Diff Checker',
    description:
      'Compare two texts side-by-side or inline — great for config files and API responses.',
    metaDescription:
      'Free online diff checker — compare two texts side-by-side or inline and highlight changes. Perfect for config files, API responses, and code. Runs in your browser.',
    tags: ['diff', 'compare', 'text'],
    implemented: true,
    faq: [
      {
        q: 'What diffing algorithm is used?',
        a: 'The tool uses the Myers diff algorithm (via the `diff` library), the same algorithm used by Git. It produces the minimal edit sequence to transform one text into the other.',
      },
      {
        q: 'Can I compare files larger than a few kilobytes?',
        a: 'Yes. All processing is done in-browser and is limited only by available memory. Very large files (hundreds of thousands of lines) may cause a brief pause while the diff is computed.',
      },
    ],
  },
  {
    slug: 'svg-optimizer',
    name: 'SVG Optimizer',
    description:
      'Minify and clean SVG files in the browser using SVGO — strip metadata, collapse groups, and shrink path data.',
    metaDescription:
      'Free online SVG optimizer — minify and clean SVG files using SVGO. Strip metadata, collapse groups, and reduce file size. Runs entirely in your browser.',
    tags: ['svg', 'optimize', 'minify'],
    implemented: true,
    faq: [
      {
        q: 'What does SVG optimization do?',
        a: 'The optimizer removes redundant attributes, collapses unnecessary groups, strips editor metadata (Inkscape, Illustrator), simplifies path data, and applies other lossless transformations to reduce file size.',
      },
      {
        q: 'Will optimization change how the SVG looks?',
        a: 'The default preset applies only safe, lossless optimizations. Visually, the output should be identical to the input. You can inspect both in the preview before downloading.',
      },
      {
        q: 'What library powers the optimizer?',
        a: 'SVGO (SVG Optimizer) — the same library used by many build tools including webpack, Vite, and Create React App.',
      },
    ],
  },
  {
    slug: 'image-optimizer',
    name: 'Image → WebP',
    description:
      'Convert JPEG, PNG, and other images to WebP with adjustable quality and optional resizing — fully in the browser.',
    metaDescription:
      'Free online image to WebP converter — convert JPEG, PNG, or GIF to WebP with adjustable quality and optional resizing. Runs entirely in your browser, no upload required.',
    tags: ['image', 'webp', 'optimize', 'convert'],
    implemented: true,
    faq: [
      {
        q: 'Why convert images to WebP?',
        a: 'WebP typically produces files 25–35% smaller than JPEG and PNG at equivalent visual quality, which improves page load speed and Core Web Vitals scores. All modern browsers support WebP.',
      },
      {
        q: 'Is my image uploaded to a server?',
        a: "No. Conversion uses the browser's Canvas API. Your image is processed locally and never leaves your device.",
      },
      {
        q: 'What quality setting should I use?',
        a: 'A quality of 80–85 is a good default for photographs, balancing file size and visual fidelity. For graphics with flat colours or text, try 90+ to avoid compression artefacts.',
      },
    ],
  },
  {
    slug: 'dummy-text',
    name: 'Dummy Text Generator',
    description:
      'Generate themed placeholder text — Lorem Ipsum, Fintech, Startup, Corporate, Developer, Design, Legal, and Hipster flavors.',
    metaDescription:
      'Free online dummy text generator — generate Lorem Ipsum and themed placeholder text (Fintech, Startup, Developer, Legal, and more) for mockups and designs. Runs in your browser.',
    tags: ['text', 'placeholder', 'lorem', 'generate'],
    implemented: true,
    faq: [
      {
        q: 'What is Lorem Ipsum?',
        a: 'Lorem Ipsum is scrambled Latin placeholder text derived from Cicero\'s "de Finibus Bonorum et Malorum" (45 BC). It has been used as dummy text in typesetting and design since the 1960s.',
      },
      {
        q: 'Why use themed placeholder text?',
        a: 'Industry-specific dummy text (e.g. Fintech, Legal) helps stakeholders evaluate a design in context. It prevents readers from focusing on the placeholder copy and makes mockups feel more realistic.',
      },
      {
        q: 'Can I customise the output length?',
        a: 'Yes. You can specify the number of words, sentences, or paragraphs, and choose from several themes including Lorem Ipsum, Startup, Corporate, Developer, Design, and Hipster.',
      },
    ],
  },
];
