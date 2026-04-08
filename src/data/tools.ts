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
        q: 'What if I paste a 6-field expression with seconds?',
        a: 'This tool uses the standard 5-field POSIX format (minute hour day month weekday). If you paste a 6-field expression the validator will flag it and suggest removing the leading seconds field.',
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
  {
    slug: 'csv-json',
    name: 'CSV ↔ JSON Converter',
    description:
      'Convert between CSV and JSON instantly in the browser — paste either format and convert with one click.',
    metaDescription:
      'Free online CSV to JSON converter (and JSON to CSV) — paste either format and convert instantly. Auto-detects delimiter. Runs entirely in your browser, no data leaves your device.',
    tags: ['csv', 'json', 'convert', 'data'],
    implemented: true,
    faq: [
      {
        q: 'Can it auto-detect the delimiter?',
        a: 'Yes. When delimiter is set to "auto", PapaParse samples the file and picks the most likely delimiter (comma, tab, semicolon, or pipe). You can also override it manually.',
      },
      {
        q: 'What JSON structure does the converter expect?',
        a: 'JSON → CSV requires a top-level array of objects. Each object becomes a row; its keys become column headers. Nested objects are serialised as strings.',
      },
      {
        q: 'Is my data sent to a server?',
        a: 'No. All parsing and conversion runs in your browser using the PapaParse library. Nothing is transmitted.',
      },
    ],
  },
  {
    slug: 'interest-calculator',
    name: 'Interest / APR Calculator',
    description:
      'Calculate loan amortization, daily interest accrual, and total cost for credit cards, BNPL, mortgages, and more.',
    metaDescription:
      'Free online interest and APR calculator — compute amortization schedules, total interest, and effective APR for credit cards, BNPL, mortgages, and personal loans. Runs in your browser.',
    tags: ['finance', 'interest', 'apr', 'loan', 'mortgage', 'bnpl'],
    implemented: true,
    faq: [
      {
        q: 'What is APR vs interest rate?',
        a: 'The interest rate is the annual cost of borrowing the principal. APR (Annual Percentage Rate) includes interest plus fees, giving a more complete picture of the true cost of borrowing.',
      },
      {
        q: 'How is daily interest calculated?',
        a: 'Daily interest = (APR / 365) × outstanding balance. This is the method used by most credit cards and many BNPL providers. The tool accrues interest daily and applies it according to your payment frequency.',
      },
      {
        q: 'What is an amortization schedule?',
        a: 'An amortization schedule breaks each payment into its principal and interest components. Early payments are mostly interest; later payments are mostly principal. The table shows exactly how your balance shrinks over time.',
      },
      {
        q: 'What is a fixed fee vs origination fee?',
        a: 'A fixed fee (e.g. a monthly maintenance fee) recurs each period. An origination fee is a one-time charge applied at the start of the loan, often expressed as a percentage of the principal.',
      },
    ],
  },
  {
    slug: 'password-generator',
    name: 'Password / Secret Generator',
    description:
      'Generate cryptographically random passwords and secrets using the Web Crypto API — configurable length, character sets, and batch mode.',
    metaDescription:
      'Free online password generator — create cryptographically random passwords with configurable length, uppercase, lowercase, digits, symbols, and batch mode. Uses the Web Crypto API; nothing leaves your browser.',
    tags: ['password', 'security', 'crypto', 'generate', 'random'],
    implemented: true,
    faq: [
      {
        q: 'Is this truly random?',
        a: "Yes. The generator uses crypto.getRandomValues(), which is the Web Crypto API's cryptographically secure pseudo-random number generator (CSPRNG). It is suitable for generating passwords, API keys, and secrets.",
      },
      {
        q: 'What does "exclude ambiguous characters" do?',
        a: 'It removes characters that are visually similar: 0 and O, l and 1 and I. This prevents copy/transcription mistakes when reading passwords aloud or on low-resolution displays.',
      },
      {
        q: 'How is password strength measured?',
        a: 'Strength is estimated using Shannon entropy: log₂(charset_size ^ length) bits. More bits = harder to brute-force. A good password has at least 60–80 bits of entropy.',
      },
    ],
  },
  {
    slug: 'rsa-keygen',
    name: 'RSA Key Pair Generator',
    description:
      'Generate RSA public/private key pairs for encryption or signing in the browser — keys never touch a server.',
    metaDescription:
      'Free online RSA key pair generator — generate 2048 or 4096-bit RSA keys for encryption (RSA-OAEP) or signing (RSASSA-PKCS1-v1_5) and export as PEM. Runs entirely in your browser using the Web Crypto API.',
    tags: ['rsa', 'crypto', 'security', 'key', 'pem', 'encryption'],
    implemented: true,
    faq: [
      {
        q: 'Are the generated keys ever sent to a server?',
        a: "No. Key generation uses the browser's built-in Web Crypto API (crypto.subtle.generateKey). The keys exist only in memory and are exported as PEM strings in your browser. Nothing is transmitted.",
      },
      {
        q: 'What is the difference between RSA-OAEP and RSASSA-PKCS1-v1_5?',
        a: 'RSA-OAEP is used for encryption — you encrypt data with the public key and decrypt with the private key. RSASSA-PKCS1-v1_5 is used for digital signing — you sign with the private key and verify with the public key.',
      },
      {
        q: 'What key size should I use?',
        a: '2048-bit keys are the current minimum recommended size and generate quickly. 4096-bit keys provide a larger security margin but take longer to generate and are slower during use. For most development and testing purposes 2048-bit is sufficient.',
      },
      {
        q: 'What PEM formats are exported?',
        a: 'The public key is exported in SPKI format (SubjectPublicKeyInfo), the standard format for sharing public keys. The private key is exported in PKCS#8 format, the standard for storing private keys. Both are Base64-encoded with PEM headers.',
      },
    ],
  },
  {
    slug: 'text-counter',
    name: 'Character / Word Counter',
    description:
      'Live character, word, sentence, and byte counts with reading time, speaking time, and SMS segment detection.',
    metaDescription:
      'Free online character and word counter — live counts for characters, words, sentences, paragraphs, bytes, SMS segments, reading time, and speaking time. Runs entirely in your browser.',
    tags: ['text', 'counter', 'word count', 'sms', 'reading time'],
    implemented: true,
    faq: [
      {
        q: 'How is reading time calculated?',
        a: 'Reading time uses an average adult silent reading speed of 238 words per minute (WPM). Speaking time uses 150 WPM, a typical presentation or narration pace.',
      },
      {
        q: 'How are SMS segments counted?',
        a: 'A single SMS using GSM-7 encoding holds 160 characters. If the message contains characters outside the GSM-7 character set (e.g. emoji, accented letters outside the set), UCS-2 encoding is used and the limit drops to 70 characters per segment. Multi-part messages use 153 (GSM-7) or 67 (UCS-2) characters per segment to accommodate the concatenation header.',
      },
      {
        q: 'What does the byte count represent?',
        a: "Bytes are counted using UTF-8 encoding via the browser's TextEncoder API. ASCII characters are 1 byte, most European characters 2 bytes, emoji and many CJK characters 3–4 bytes.",
      },
    ],
  },
  {
    slug: 'http-status-codes',
    name: 'HTTP Status Code Reference',
    description:
      'A quick-search grid for HTTP status codes (1xx–5xx) with short descriptions — saves a trip to MDN when debugging a weird 422 or 409.',
    metaDescription:
      'Free HTTP status code reference — search all 1xx, 2xx, 3xx, 4xx, and 5xx codes with plain-English descriptions. Filter by category. Runs entirely in your browser.',
    tags: ['http', 'status', 'api', 'reference', 'web'],
    implemented: true,
    faq: [
      {
        q: 'What are HTTP status codes?',
        a: 'HTTP status codes are three-digit numbers returned by a server to indicate the outcome of a client request. The first digit defines the class: 1xx (informational), 2xx (success), 3xx (redirection), 4xx (client error), and 5xx (server error).',
      },
      {
        q: 'What is the difference between 4xx and 5xx errors?',
        a: '4xx errors indicate that the problem is on the client side — the request was bad, unauthorized, or targeted a resource that does not exist. 5xx errors mean the server encountered a problem while handling a valid request. If you see a 5xx error, the issue is with the server, not your request.',
      },
      {
        q: 'Are these all the HTTP status codes?',
        a: "This reference covers all codes registered with the IANA HTTP Status Code Registry (RFC 9110 and related RFCs), plus well-known informal codes like 418 (I'm a Teapot) and 451 (Unavailable For Legal Reasons). Some proprietary APIs use non-standard codes outside this list.",
      },
    ],
  },
  {
    slug: 'http-header-parser',
    name: 'HTTP Header Parser',
    description:
      'Paste a raw HTTP header block and get a clean table with explanations for common headers like Cache-Control, Content-Type, and X-Frame-Options.',
    metaDescription:
      'Free online HTTP header parser — paste raw HTTP request or response headers and get a clean table with plain-English explanations. Runs entirely in your browser.',
    tags: ['http', 'headers', 'parse', 'api', 'web'],
    implemented: true,
    faq: [
      {
        q: 'What input formats does the parser accept?',
        a: 'You can paste a raw HTTP response or request header block — either just the headers, or the full response including the status line (e.g. "HTTP/1.1 200 OK"). The parser automatically strips the status/request line and handles RFC 7230 header folding (continuation lines starting with whitespace).',
      },
      {
        q: 'Which headers get explanations?',
        a: 'The tool covers ~50 common request and response headers: caching headers (Cache-Control, ETag, Expires), security headers (Strict-Transport-Security, X-Frame-Options, Content-Security-Policy), CORS headers (Access-Control-Allow-Origin), content negotiation headers, authentication headers, and more. Unknown or custom headers are still shown — just without an explanation.',
      },
      {
        q: 'Is my data sent to a server?',
        a: 'No. All parsing happens locally in your browser using plain JavaScript. Nothing is transmitted.',
      },
    ],
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    description:
      'Generate styled QR codes for URLs or text with custom dot shapes, corner styles, colour gradients, and an optional centre logo.',
    metaDescription:
      'Free online QR code generator — customise dot shapes, corner styles, colours, gradients, and embed a logo. Download as PNG or SVG. Runs entirely in your browser.',
    tags: ['qr', 'qrcode', 'generate', 'image', 'url', 'mobile'],
    implemented: true,
    faq: [
      {
        q: 'What is error correction and which level should I choose?',
        a: 'Error correction adds redundant data so a QR code can still be scanned even if part of it is damaged or obscured. Level L (7%) gives the smallest code, M (15%) is a good general default, Q (25%) is recommended when you embed a logo, and H (30%) offers the highest resilience at the cost of a larger, denser code.',
      },
      {
        q: 'Why does the tool upgrade my error correction when I add a logo?',
        a: 'A centre logo physically covers QR modules. With low error correction (L or M) those hidden modules cannot be recovered, making the code unscannable. The tool automatically raises the level to at least Q (25%) so enough redundant data remains around the logo for scanners to reconstruct the full payload.',
      },
      {
        q: 'What image formats can I embed as a logo?',
        a: 'You can upload PNG, JPEG, or SVG files. For best results use a PNG or SVG with a transparent background so the logo sits cleanly on the QR code background colour.',
      },
      {
        q: 'What is the difference between PNG and SVG export?',
        a: 'PNG is a raster format — ideal for sharing on the web or printing at a fixed size. SVG is vector-based and scales to any size without losing sharpness, making it the better choice for print or when you need to resize the QR code frequently.',
      },
      {
        q: 'How much data can a QR code hold?',
        a: 'It depends on the content type and error correction level. A QR code can store up to ~7,000 numeric characters, ~4,300 alphanumeric characters, or ~2,900 bytes of binary data (like a URL) at the lowest error correction. Higher error correction and longer content produce a denser, higher-version QR code with more modules.',
      },
      {
        q: 'Will styled or rounded QR codes scan reliably?',
        a: 'Yes — modern smartphone cameras and QR scanner apps handle rounded dots, classy shapes, and colour-filled codes well. For maximum compatibility keep sufficient contrast between the dot colour and the background, and avoid extremely light dot colours on white backgrounds.',
      },
    ],
  },
  {
    slug: 'nacha-parser',
    name: 'NACHA / ACH File Parser',
    description:
      'Parse, highlight, validate, and generate NACHA ACH files entirely in your browser.',
    metaDescription:
      'Free browser-based NACHA ACH file parser and generator. View color-coded records, validate structure, inspect field details, and build new ACH files — no data leaves your device.',
    tags: ['finance', 'parser'],
    implemented: true,
    faq: [
      {
        q: 'What is a NACHA file?',
        a: 'A NACHA file (also called an ACH file) is a fixed-width text file used to process electronic payments through the U.S. Automated Clearing House network. Each line is exactly 94 characters and represents a record — including file headers, batch headers, individual payment entries, addenda, and control records.',
      },
      {
        q: 'Is my ACH data safe in this tool?',
        a: 'Yes. This tool runs entirely in your browser using client-side JavaScript. Your file contents, routing numbers, account numbers, and all other data never leave your device — nothing is sent to any server.',
      },
      {
        q: 'Which SEC codes does this tool support?',
        a: 'The parser handles all SEC codes since the fixed-width record layout is the same regardless of SEC code. The generator provides the most commonly used codes: PPD (Prearranged Payment/Deposit), CCD (Corporate Credit or Debit), WEB (Internet/Mobile), TEL (Telephone), and CTX (Corporate Trade Exchange).',
      },
      {
        q: 'What validation does the parser perform?',
        a: 'The parser checks record line lengths, structural ordering (header/control pairs), hash totals, entry counts, debit/credit amount totals at both the batch and file level, and service class code consistency between batch headers and control records.',
      },
    ],
  },
];
