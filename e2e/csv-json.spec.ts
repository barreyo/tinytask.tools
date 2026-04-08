import { expect, test } from '@playwright/test';

const URL = '/tools/csv-json';

const SAMPLE_CSV = `name,age,city
Alice,30,NYC
Bob,25,LA`;

const SAMPLE_JSON = `[{"name":"Alice","age":"30","city":"NYC"},{"name":"Bob","age":"25","city":"LA"}]`;

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/CSV/);
});

test('shows CSV and JSON panes on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#csv-input')).toBeVisible();
  await expect(page.locator('#json-input')).toBeVisible();
});

test('shows direction buttons on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#to-json-btn')).toBeVisible();
  await expect(page.locator('#to-csv-btn')).toBeVisible();
});

test('csv copy and download buttons are disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#csv-copy-btn')).toBeDisabled();
  await expect(page.locator('#json-copy-btn')).toBeDisabled();
});

// ── CSV → JSON ────────────────────────────────────────────────────────────────

test('converts CSV to JSON on button click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#csv-input').fill(SAMPLE_CSV);
  await page.locator('#to-json-btn').click();
  const output = await page.locator('#json-input').inputValue();
  expect(output).toContain('Alice');
  expect(output).toContain('name');
});

test('JSON copy button becomes enabled after CSV→JSON conversion', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#csv-input').fill(SAMPLE_CSV);
  await page.locator('#to-json-btn').click();
  await expect(page.locator('#json-copy-btn')).toBeEnabled();
});

test('parsed JSON is a valid JSON array', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#csv-input').fill(SAMPLE_CSV);
  await page.locator('#to-json-btn').click();
  const output = await page.locator('#json-input').inputValue();
  const parsed = JSON.parse(output);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed).toHaveLength(2);
});

// ── JSON → CSV ────────────────────────────────────────────────────────────────

test('converts JSON to CSV on button click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#json-input').fill(SAMPLE_JSON);
  await page.locator('#to-csv-btn').click();
  const output = await page.locator('#csv-input').inputValue();
  expect(output).toContain('name');
  expect(output).toContain('Alice');
});

test('CSV copy button becomes enabled after JSON→CSV conversion', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#json-input').fill(SAMPLE_JSON);
  await page.locator('#to-csv-btn').click();
  await expect(page.locator('#csv-copy-btn')).toBeEnabled();
});

// ── Options ───────────────────────────────────────────────────────────────────

test('"first row is header" checkbox is checked by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#header-toggle')).toBeChecked();
});

test('"skip empty lines" checkbox is checked by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#skip-empty-toggle')).toBeChecked();
});

// ── Clear buttons ─────────────────────────────────────────────────────────────

test('CSV clear button empties the CSV textarea', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#csv-input').fill(SAMPLE_CSV);
  await page.locator('#csv-clear-btn').click();
  await expect(page.locator('#csv-input')).toHaveValue('');
});

test('JSON clear button empties the JSON textarea', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#json-input').fill(SAMPLE_JSON);
  await page.locator('#json-clear-btn').click();
  await expect(page.locator('#json-input')).toHaveValue('');
});

// ── Error handling ────────────────────────────────────────────────────────────

test('shows error on invalid JSON input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#json-input').fill('{not json}');
  await page.locator('#to-csv-btn').click();
  await expect(page.locator('#error-display')).not.toBeHidden();
});

// ── Copy buttons ──────────────────────────────────────────────────────────────

test('JSON copy button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#csv-input').fill(SAMPLE_CSV);
  await page.locator('#to-json-btn').click();
  await page.locator('#json-copy-btn').click();
  await expect(page.locator('#json-copy-btn')).toHaveText('copied');
  await expect(page.locator('#json-copy-btn')).toHaveText('copy', { timeout: 2000 });
});
