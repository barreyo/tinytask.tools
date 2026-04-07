import { expect, test } from '@playwright/test';

const URL = '/tools/timestamp';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page loads with correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Unix Timestamp/);
});

test('page shows the tool heading', async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByRole('heading', { name: /Unix Timestamp/i })).toBeVisible();
});

// ── Live clock ────────────────────────────────────────────────────────────────

test('live timestamp is visible and contains digits', async ({ page }) => {
  await page.goto(URL);
  const liveEl = page.locator('#ts-live');
  await expect(liveEl).toBeVisible();
  const text = await liveEl.textContent();
  expect(text).toMatch(/^\d{10}$/);
});

test('live timestamp increments over time', async ({ page }) => {
  await page.goto(URL);
  const first = await page.locator('#ts-live').textContent();
  await page.waitForTimeout(1100);
  const second = await page.locator('#ts-live').textContent();
  expect(Number(second)).toBeGreaterThan(Number(first));
});

test('live UTC time is visible', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#ts-live-utc')).toBeVisible();
  const text = await page.locator('#ts-live-utc').textContent();
  expect(text).toContain('UTC');
});

test('copy live timestamp button copies the value', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  const liveVal = await page.locator('#ts-live').textContent();
  await page.locator('#ts-copy-live-btn').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(liveVal);
});

test('copy live button text changes to "copied" then reverts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#ts-copy-live-btn').click();
  await expect(page.locator('#ts-copy-live-btn')).toHaveText('copied');
  await expect(page.locator('#ts-copy-live-btn')).toHaveText('copy', { timeout: 3000 });
});

// ── Timestamp → Date ──────────────────────────────────────────────────────────

test('converts a known timestamp to date', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('#ts-result')).toBeVisible();
  await expect(page.locator('#ts-out-utc')).toContainText('2023');
  await expect(page.locator('#ts-out-iso')).toHaveText('2023-11-14T22:13:20.000Z');
});

test('shows milliseconds output for timestamp', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('#ts-out-ms')).toHaveText('1700000000000');
});

test('auto-detects and normalizes millisecond timestamp', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000000');
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('#ts-result')).toBeVisible();
  await expect(page.locator('#ts-out-iso')).toHaveText('2023-11-14T22:13:20.000Z');
});

test('shows relative time for a converted timestamp', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  const relative = await page.locator('#ts-out-relative').textContent();
  expect(relative).toMatch(/(ago|in )/);
});

test('convert on Enter key', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-input').press('Enter');

  await expect(page.locator('#ts-result')).toBeVisible();
});

test('"now" button fills input with current timestamp and converts', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-now-btn').click();

  const inputVal = await page.locator('#ts-input').inputValue();
  expect(inputVal).toMatch(/^\d{10}$/);
  await expect(page.locator('#ts-result')).toBeVisible();
});

test('clear button hides result and empties input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();
  await expect(page.locator('#ts-result')).toBeVisible();

  await page.locator('#ts-clear-btn').click();
  await expect(page.locator('#ts-input')).toHaveValue('');
  await expect(page.locator('#ts-result')).toBeHidden();
});

test('shows error for invalid timestamp input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-input').fill('not-a-number');
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('#ts-error')).toBeVisible();
  await expect(page.locator('#ts-result')).toBeHidden();
});

test('shows error for empty input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('#ts-error')).toBeVisible();
});

test('copy UTC result button works', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  const utcText = await page.locator('#ts-out-utc').textContent();
  await page.locator('[data-target="ts-out-utc"]').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(utcText?.trim());
});

test('copy ISO result button works', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  await page.locator('[data-target="ts-out-iso"]').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe('2023-11-14T22:13:20.000Z');
});

// ── Date → Timestamp ──────────────────────────────────────────────────────────

test('date inputs are pre-filled with today', async ({ page }) => {
  await page.goto(URL);
  const dateVal = await page.locator('#ts-date-input').inputValue();
  expect(dateVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const timeVal = await page.locator('#ts-time-input').inputValue();
  expect(timeVal).toMatch(/^\d{2}:\d{2}:\d{2}$/);
});

test('converts a known date to Unix timestamp (UTC mode)', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-date-input').fill('2023-11-14');
  await page.locator('#ts-time-input').fill('22:13:20');
  await page.locator('[data-tz="utc"]').click();
  await page.locator('#ts-date-convert-btn').click();

  await expect(page.locator('#ts-date-result')).toBeVisible();
  await expect(page.locator('#ts-date-out-s')).toHaveText('1700000000');
  await expect(page.locator('#ts-date-out-ms')).toHaveText('1700000000000');
});

test('UTC/local timezone toggle buttons work', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-tz="local"]')).toHaveClass(/active/);
  await page.locator('[data-tz="utc"]').click();
  await expect(page.locator('[data-tz="utc"]')).toHaveClass(/active/);
  await expect(page.locator('[data-tz="local"]')).not.toHaveClass(/active/);
});

test('shows error when date field is empty', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#ts-date-input').fill('');
  await page.locator('#ts-date-convert-btn').click();
  await expect(page.locator('#ts-date-error')).toBeVisible();
});

test('copy seconds result from date conversion', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#ts-date-input').fill('2023-11-14');
  await page.locator('#ts-time-input').fill('22:13:20');
  await page.locator('[data-tz="utc"]').click();
  await page.locator('#ts-date-convert-btn').click();

  await page.locator('[data-target="ts-date-out-s"]').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe('1700000000');
});

// ── History ───────────────────────────────────────────────────────────────────

test('"no history yet" shown on first load', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await expect(page.locator('#ts-history-empty')).toBeVisible();
  await expect(page.locator('#ts-history-empty')).toHaveText('no history yet');
});

test('history row appears after a timestamp conversion', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('#ts-history-empty')).toBeHidden();
  await expect(page.locator('.history-row')).toHaveCount(1);
});

test('history badge shows "to date" for timestamp conversion', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  await expect(page.locator('.history-badge').first()).toHaveText('to date');
});

test('history badge shows "to ts" for date conversion', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-date-input').fill('2023-11-14');
  await page.locator('#ts-time-input').fill('22:13:20');
  await page.locator('[data-tz="utc"]').click();
  await page.locator('#ts-date-convert-btn').click();

  await expect(page.locator('.history-badge').first()).toHaveText('to ts');
});

test('history accumulates multiple entries', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  for (const ts of ['1700000000', '1000000000', '500000000']) {
    await page.locator('#ts-input').fill(ts);
    await page.locator('#ts-convert-btn').click();
  }

  await expect(page.locator('.history-row')).toHaveCount(3);
});

test('history copy button copies the result', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();

  await page.locator('.history-copy-btn').first().click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe('2023-11-14T22:13:20.000Z');
});

test('history persists across page reloads', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);

  await page.reload();
  await expect(page.locator('.history-row')).toHaveCount(1);
});

test('clear history button removes all entries', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);

  await page.locator('#ts-clear-history-btn').click();
  await expect(page.locator('#ts-history-empty')).toBeVisible();
  await expect(page.locator('.history-row')).toHaveCount(0);
});

test('history stays cleared after reload', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_timestamp_history'));
  await page.reload();

  await page.locator('#ts-input').fill('1700000000');
  await page.locator('#ts-convert-btn').click();
  await page.locator('#ts-clear-history-btn').click();
  await page.reload();

  await expect(page.locator('#ts-history-empty')).toBeVisible();
});
