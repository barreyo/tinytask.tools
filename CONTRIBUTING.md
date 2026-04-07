# Contributing to tinytask.tools

Thanks for your interest in contributing! This document covers the basics for reporting bugs, suggesting tools, and submitting pull requests.

## Reporting bugs

Open a [GitHub issue](https://github.com/johanbackman/tinytask/issues) with:

1. Which tool is affected.
2. What you expected to happen and what actually happened.
3. Browser name and version.

## Suggesting a new tool

Open an issue with the title **Tool idea: \<name\>**. Describe what the tool does and why it belongs in a browser-only collection (i.e. it should not require a server).

## Development setup

```bash
git clone https://github.com/johanbackman/tinytask.git
cd tinytask
npm install
npm run dev
```

The dev server starts at `http://localhost:4321`.

## Project structure

```
src/
├── data/tools.ts            # tool registry (slug, name, description, FAQ)
├── lib/                     # pure logic for each tool (no UI)
├── components/tools/        # Astro components (UI for each tool)
├── pages/tools/             # one page per tool (imports component + layout)
├── layouts/ToolLayout.astro # shared tool page layout
└── __tests__/               # Vitest unit tests for lib/
```

## Adding a new tool

1. **Register the tool** — add an entry to `src/data/tools.ts` with a unique `slug`, `name`, `description`, and at least one FAQ entry. Set `implemented: true`.
2. **Write the logic** — create `src/lib/<slug>.ts` with pure functions (no DOM access). This keeps the logic testable.
3. **Build the UI** — create `src/components/tools/<Name>.astro`. All interactivity uses vanilla `<script>` blocks — no framework runtime ships to the client.
4. **Create the page** — create `src/pages/tools/<slug>.astro` that imports `ToolLayout` and your component.
5. **Add tests** — create `src/__tests__/<slug>.test.ts` covering the core logic in `src/lib/`.

## Code style

- **TypeScript** everywhere. Avoid `any`.
- **Prettier** and **ESLint** are configured. Run `npm run format` and `npm run lint:fix` before committing.
- Keep client-side bundles small — prefer the Web platform APIs over npm packages when practical.
- All processing must happen in the browser. Never send user data to a server.

## Running tests

```bash
npm test             # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright)
```

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your changes and ensure `npm run lint`, `npm run format:check`, and `npm test` all pass.
3. Open a PR with a clear description of what changed and why.
4. Keep PRs focused — one tool or one fix per PR.

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
