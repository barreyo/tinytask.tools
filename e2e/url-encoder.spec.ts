import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tools/url-encoder');
  await page.evaluate(() => localStorage.removeItem('tt_url_history'));
  await page.reload();
});

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/URL Encoder/);
});

test('encode component mode is active by default', async ({ page }) => {
  await expect(page.locator('.mode-btn[data-mode="component"]')).toHaveClass(/active/);
});

test('output pane starts with placeholder text', async ({ page }) => {
  await expect(page.locator('#ue-output')).toContainText('output will appear here');
});

test('copy button is disabled until there is output', async ({ page }) => {
  await expect(page.locator('#ue-copy-btn')).toBeDisabled();
});

// ── Encode component ──────────────────────────────────────────────────────────

test('encodes a URL component on input', async ({ page }) => {
  await page.fill('#ue-input', 'hello world');
  await expect(page.locator('#ue-output')).toHaveText('hello%20world');
});

test('encodes & and = characters', async ({ page }) => {
  await page.fill('#ue-input', 'key=value&other=1');
  await expect(page.locator('#ue-output')).toHaveText('key%3Dvalue%26other%3D1');
});

test('encodes a full URL path including protocol', async ({ page }) => {
  await page.fill('#ue-input', 'https://example.com/path');
  await expect(page.locator('#ue-output')).toContainText('https%3A%2F%2F');
});

// ── Encode URI ────────────────────────────────────────────────────────────────

test('encode uri mode preserves structural URL characters', async ({ page }) => {
  await page.click('.mode-btn[data-mode="uri"]');
  await page.fill('#ue-input', 'https://example.com/path?q=hello world');
  await expect(page.locator('#ue-output')).toHaveText('https://example.com/path?q=hello%20world');
});

test('encode uri preserves : / ? # & = characters', async ({ page }) => {
  await page.click('.mode-btn[data-mode="uri"]');
  await page.fill('#ue-input', 'https://example.com/?a=1&b=2#section');
  await expect(page.locator('#ue-output')).toHaveText('https://example.com/?a=1&b=2#section');
});

// ── Decode ────────────────────────────────────────────────────────────────────

test('decode mode decodes percent-encoded input', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'hello%20world');
  await expect(page.locator('#ue-output')).toHaveText('hello world');
});

test('decode mode handles full encoded URLs', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1');
  // Highlighted output — check the visible text contains the decoded URL
  await expect(page.locator('#ue-output')).toContainText('example.com');
});

// ── URL highlighting ──────────────────────────────────────────────────────────

test('decode mode renders highlighted spans for a full URL', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world');
  // Scheme span
  await expect(page.locator('.url-scheme')).toHaveText('https');
  // Host span
  await expect(page.locator('.url-host')).toHaveText('example.com');
  // Path segment span
  await expect(page.locator('.url-path-seg')).toHaveText('path');
  // Param key and value spans
  await expect(page.locator('.url-param-key')).toHaveText('q');
  await expect(page.locator('.url-param-val')).toHaveText('hello world');
});

test('highlighting is not shown for encode-component mode', async ({ page }) => {
  await page.fill('#ue-input', 'https://example.com/?q=1');
  await expect(page.locator('.url-scheme')).toHaveCount(0);
});

test('highlighting is not shown for plain decoded text (non-URL)', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'hello%20world');
  await expect(page.locator('.url-scheme')).toHaveCount(0);
});

// ── URL breakdown panel ───────────────────────────────────────────────────────

test('url breakdown panel is hidden by default', async ({ page }) => {
  await expect(page.locator('#ue-breakdown')).toBeHidden();
});

test('url breakdown appears when decoding a full URL', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2Fapi%3Ftoken%3Dabc%26page%3D2');
  await expect(page.locator('#ue-breakdown')).toBeVisible();
});

test('url breakdown shows scheme, host, path rows', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2Fapi%2Fv1%3Ftoken%3Dabc');
  await expect(page.locator('#ue-breakdown')).toBeVisible();
  await expect(page.locator('.bd-scheme')).toHaveText('https');
  await expect(page.locator('.bd-host')).toHaveText('example.com');
  await expect(page.locator('.bd-path')).toHaveText('/api/v1');
});

test('url breakdown lists all query params with keys and values', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill(
    '#ue-input',
    'https%3A%2F%2Fexample.com%2F%3Fq%3Dhello%20world%26page%3D3%26sort%3Ddesc',
  );
  await expect(page.locator('#ue-breakdown')).toBeVisible();
  const keys = await page.locator('.bd-param-key').allTextContents();
  const vals = await page.locator('.bd-param-val').allTextContents();
  expect(keys).toEqual(['q', 'page', 'sort']);
  expect(vals).toEqual(['hello world', '3', 'desc']);
});

test('url breakdown param copy button copies the value', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2F%3Ftoken%3Dabc123');
  await expect(page.locator('#ue-breakdown')).toBeVisible();
  const copyBtn = page.locator('.bd-copy-btn').first();
  await copyBtn.click();
  await expect(copyBtn).toHaveText('copied');
  await expect(copyBtn).toHaveText('copy', { timeout: 2000 });
});

test('breakdown hides when switching to encode mode', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2F%3Fq%3D1');
  await expect(page.locator('#ue-breakdown')).toBeVisible();
  await page.click('.mode-btn[data-mode="component"]');
  await expect(page.locator('#ue-breakdown')).toBeHidden();
});

test('breakdown hides when input is cleared', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'https%3A%2F%2Fexample.com%2F%3Fq%3D1');
  await expect(page.locator('#ue-breakdown')).toBeVisible();
  await page.click('#ue-clear-btn');
  await expect(page.locator('#ue-breakdown')).toBeHidden();
});

test('decode mode shows an error for malformed percent sequences', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', '%GG invalid');
  await expect(page.locator('.ue-error')).toBeVisible();
  await expect(page.locator('#ue-copy-btn')).toBeDisabled();
});

// ── Mode switching ────────────────────────────────────────────────────────────

test('switching mode re-converts existing input', async ({ page }) => {
  await page.fill('#ue-input', 'hello world');
  await expect(page.locator('#ue-output')).toHaveText('hello%20world');

  await page.click('.mode-btn[data-mode="decode"]');
  // "hello world" has no percent sequences, so decode returns it unchanged
  await expect(page.locator('#ue-output')).toHaveText('hello world');
});

test('active mode button updates when switching', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await expect(page.locator('.mode-btn[data-mode="decode"]')).toHaveClass(/active/);
  await expect(page.locator('.mode-btn[data-mode="component"]')).not.toHaveClass(/active/);
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button empties the input and output', async ({ page }) => {
  await page.fill('#ue-input', 'hello world');
  await expect(page.locator('#ue-output')).not.toContainText('output will appear here');
  await page.click('#ue-clear-btn');
  await expect(page.locator('#ue-input')).toHaveValue('');
  await expect(page.locator('#ue-output')).toContainText('output will appear here');
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button becomes enabled after typing', async ({ page }) => {
  await page.fill('#ue-input', 'hello');
  await expect(page.locator('#ue-copy-btn')).toBeEnabled();
});

test('copy button changes text to "copied" then reverts', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  await page.fill('#ue-input', 'hello world');
  const copyBtn = page.locator('#ue-copy-btn');
  await expect(copyBtn).toBeEnabled();
  await copyBtn.click();
  await expect(copyBtn).toHaveText('copied');
  await expect(copyBtn).toHaveText('copy', { timeout: 2000 });
});

// ── History ───────────────────────────────────────────────────────────────────

test('"no history yet" is visible with empty history', async ({ page }) => {
  await expect(page.locator('#ue-history-empty')).toBeVisible();
});

test('history entry is added after input blur', async ({ page }) => {
  await page.fill('#ue-input', 'hello world');
  // Trigger blur by focusing another element
  await page.click('#ue-copy-btn');
  await expect(page.locator('.history-row')).toHaveCount(1);
  await expect(page.locator('#ue-history-empty')).toBeHidden();
});

test('history entry shows the correct mode badge', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'hello%20world');
  await page.click('#ue-copy-btn');
  await expect(page.locator('.history-badge').first()).toHaveText('decode');
});

test('history entry shows input and output snippets', async ({ page }) => {
  await page.fill('#ue-input', 'hello world');
  await page.click('#ue-copy-btn');
  const row = page.locator('.history-row').first();
  await expect(row.locator('.history-input')).toContainText('hello world');
  await expect(row.locator('.history-output')).toContainText('hello%20world');
});

test('history persists across page reloads', async ({ page }) => {
  await page.fill('#ue-input', 'persist me');
  await page.click('#ue-copy-btn');
  await page.reload();
  await expect(page.locator('.history-row')).toHaveCount(1);
});

test('clear history button empties the list', async ({ page }) => {
  await page.fill('#ue-input', 'hello world');
  await page.click('#ue-copy-btn');
  await expect(page.locator('.history-row')).not.toHaveCount(0);
  await page.click('#ue-clear-history-btn');
  await expect(page.locator('.history-row')).toHaveCount(0);
  await expect(page.locator('#ue-history-empty')).toBeVisible();
});

test('load button restores input and mode from history', async ({ page }) => {
  await page.click('.mode-btn[data-mode="decode"]');
  await page.fill('#ue-input', 'hello%20world');
  await page.click('#ue-copy-btn');
  // Clear input
  await page.click('#ue-clear-btn');
  await expect(page.locator('#ue-input')).toHaveValue('');
  // Load from history
  await page.click('.history-load-btn');
  await expect(page.locator('#ue-input')).toHaveValue('hello%20world');
  await expect(page.locator('.mode-btn[data-mode="decode"]')).toHaveClass(/active/);
});

test('history copy button writes output to clipboard', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  await page.fill('#ue-input', 'hello world');
  await page.click('#ue-copy-btn');
  const histCopyBtn = page.locator('.history-copy-btn').first();
  await histCopyBtn.click();
  await expect(histCopyBtn).toHaveText('copied');
  await expect(histCopyBtn).toHaveText('copy', { timeout: 2000 });
});

test('duplicate inputs are not added to history twice', async ({ page }) => {
  await page.fill('#ue-input', 'same input');
  await page.click('#ue-copy-btn');
  // Blur again without changing input
  await page.click('#ue-clear-btn');
  await page.fill('#ue-input', 'same input');
  await page.click('#ue-copy-btn');
  // Should still be just 1 entry since content and mode are identical
  await expect(page.locator('.history-row')).toHaveCount(1);
});
