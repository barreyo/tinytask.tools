import { expect, test } from '@playwright/test';

const URL = '/tools/list-cleaner';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/List Cleaner/);
});

test('shows input and output textareas on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#lc-input')).toBeVisible();
  await expect(page.locator('#lc-output')).toBeVisible();
});

test('copy button is disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#lc-copy-btn')).toBeDisabled();
});

// ── Basic cleaning ────────────────────────────────────────────────────────────

test('processes a newline-separated list', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-input').fill('apple\nbanana\ncherry');
  await expect(page.locator('#lc-output')).not.toHaveValue('');
  await expect(page.locator('#lc-output')).toContainText('apple');
});

test('copy button becomes enabled after input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-input').fill('one\ntwo\nthree');
  await expect(page.locator('#lc-copy-btn')).toBeEnabled();
});

test('shows item stats after processing', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-input').fill('a\nb\nc');
  await expect(page.locator('#lc-stats')).toContainText('3 items');
});

// ── Operations ────────────────────────────────────────────────────────────────

test('removes duplicates when dedup is checked', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-dedup').check();
  await page.locator('#lc-input').fill('alpha\nbeta\nalpha\ngamma');
  const output = await page.locator('#lc-output').inputValue();
  const lines = output.split('\n').filter(Boolean);
  const unique = new Set(lines);
  expect(unique.size).toBe(lines.length);
});

test('sorts alphabetically when sort a→z is checked', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-sort-alpha').check();
  await page.locator('#lc-input').fill('zebra\napple\nmango');
  const output = await page.locator('#lc-output').inputValue();
  const lines = output.split('\n').filter(Boolean);
  expect(lines[0]).toBe('apple');
  expect(lines[lines.length - 1]).toBe('zebra');
});

test('converts to uppercase when uppercase is checked', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-upper').check();
  await page.locator('#lc-input').fill('hello\nworld');
  const output = await page.locator('#lc-output').inputValue();
  expect(output).toContain('HELLO');
  expect(output).toContain('WORLD');
});

test('converts to lowercase when lowercase is checked', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-lower').check();
  await page.locator('#lc-input').fill('HELLO\nWORLD');
  const output = await page.locator('#lc-output').inputValue();
  expect(output).toContain('hello');
  expect(output).toContain('world');
});

test('reverses list when reverse is checked', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-reverse').check();
  await page.locator('#lc-input').fill('first\nsecond\nthird');
  const output = await page.locator('#lc-output').inputValue();
  const lines = output.split('\n').filter(Boolean);
  expect(lines[0]).toBe('third');
  expect(lines[lines.length - 1]).toBe('first');
});

// ── Separator / joiner ────────────────────────────────────────────────────────

test('auto-detects comma separator', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-input').fill('a,b,c');
  const output = await page.locator('#lc-output').inputValue();
  // Should produce 3 items (joined by newline by default)
  const lines = output.split('\n').filter(Boolean);
  expect(lines).toHaveLength(3);
});

test('joining with comma+space produces comma-separated output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-joiner').selectOption('comma-space');
  await page.locator('#lc-input').fill('x\ny\nz');
  const output = await page.locator('#lc-output').inputValue();
  expect(output).toContain(', ');
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button empties input and output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lc-input').fill('some\nlist\nitems');
  await expect(page.locator('#lc-output')).not.toHaveValue('');
  await page.locator('#lc-clear-btn').click();
  await expect(page.locator('#lc-input')).toHaveValue('');
  await expect(page.locator('#lc-output')).toHaveValue('');
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies output to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#lc-input').fill('copy\nme');
  await page.locator('#lc-copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text.trim().length).toBeGreaterThan(0);
});

test('copy button briefly shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#lc-input').fill('test');
  await page.locator('#lc-copy-btn').click();
  await expect(page.locator('#lc-copy-btn')).toHaveText('copied');
  await expect(page.locator('#lc-copy-btn')).toHaveText('copy', { timeout: 2000 });
});
