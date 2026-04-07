# tinytask.tools

Free, browser-only developer utilities. No sign-ups, no tracking, no server processing — everything runs locally in your browser.

**Live at [tinytask.tools](https://tinytask.tools)**

## Goals

- **Privacy first** — all tools run entirely client-side. No data ever leaves the browser.
- **Zero friction** — no accounts, no cookies banners, no ads. Open the page and use the tool.
- **Fast and small** — each tool is a single static page with minimal dependencies, deployed on the edge via Cloudflare Workers.
- **Useful defaults** — tools should work the moment the page loads, with sensible settings that cover the most common use case.

## Tools

| Tool                                                                          | Description                                                |
| :---------------------------------------------------------------------------- | :--------------------------------------------------------- |
| [UUID Generator](https://tinytask.tools/tools/uuid-generator)                 | Generate v1, v4, v5, v7 UUIDs and ULIDs                    |
| [Base64 Encoder / Decoder](https://tinytask.tools/tools/base64)               | Encode and decode Base64 and Base64URL strings             |
| [JSON Formatter](https://tinytask.tools/tools/json-formatter)                 | Prettify, minify, and validate JSON                        |
| [URL Encoder / Decoder](https://tinytask.tools/tools/url-encoder)             | Percent-encode and decode URL components                   |
| [Crontab Calculator](https://tinytask.tools/tools/crontab)                    | Parse cron expressions and preview upcoming triggers       |
| [Hash Generator](https://tinytask.tools/tools/hash-generator)                 | Compute MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes       |
| [Unix Timestamp](https://tinytask.tools/tools/timestamp)                      | Convert between epoch timestamps and dates                 |
| [List Cleaner](https://tinytask.tools/tools/list-cleaner)                     | Deduplicate, sort, trim, and reformat lists                |
| [Luhn Checker](https://tinytask.tools/tools/luhn-checker)                     | Validate or generate card numbers using the Luhn algorithm |
| [JWT Debugger](https://tinytask.tools/tools/jwt-debugger)                     | Decode JWT header, payload, and signature                  |
| [ISO 4217 Currency Lookup](https://tinytask.tools/tools/currency-lookup)      | Search currency codes, symbols, and exponents              |
| [YAML ↔ JSON](https://tinytask.tools/tools/yaml-json)                         | Convert between YAML and JSON                              |
| [Diff Checker](https://tinytask.tools/tools/diff-checker)                     | Compare two texts side-by-side or inline                   |
| [SVG Optimizer](https://tinytask.tools/tools/svg-optimizer)                   | Minify and clean SVGs with SVGO                            |
| [Image → WebP](https://tinytask.tools/tools/image-optimizer)                  | Convert images to WebP with adjustable quality             |
| [Dummy Text Generator](https://tinytask.tools/tools/dummy-text)               | Generate themed placeholder text                           |
| [CSV ↔ JSON](https://tinytask.tools/tools/csv-json)                           | Convert between CSV and JSON                               |
| [Interest / APR Calculator](https://tinytask.tools/tools/interest-calculator) | Loan amortization and interest accrual                     |
| [Password Generator](https://tinytask.tools/tools/password-generator)         | Cryptographically random passwords and secrets             |
| [RSA Key Pair Generator](https://tinytask.tools/tools/rsa-keygen)             | Generate RSA key pairs in the browser                      |
| [Character / Word Counter](https://tinytask.tools/tools/text-counter)         | Live character, word, sentence, and byte counts            |
| [QR Code Generator](https://tinytask.tools/tools/qr-code-generator)           | Styled QR codes with custom shapes and colours             |

## Tech stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS](https://tailwindcss.com) — styling
- [TypeScript](https://www.typescriptlang.org) — type safety
- [Vitest](https://vitest.dev) — unit tests
- [Playwright](https://playwright.dev) — end-to-end tests
- [Cloudflare Workers](https://workers.cloudflare.com) — hosting and edge API

## Development

```bash
npm install
npm run dev          # start dev server at localhost:4321
```

Other useful commands:

```bash
npm run build        # production build to ./dist/
npm run lint         # run ESLint
npm run format       # run Prettier
npm test             # run unit tests
npm run test:e2e     # run Playwright e2e tests
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new tools, reporting bugs, and submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
