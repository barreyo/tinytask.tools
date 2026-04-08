import { expect, test } from '@playwright/test';

const URL = '/tools/text-counter';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Character|Word|Counter/i);
});

test('shows text input area on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#text-input')).toBeVisible();
});

test('all stat counters start at zero', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#s-chars')).toHaveText('0');
  await expect(page.locator('#s-words')).toHaveText('0');
  await expect(page.locator('#s-sentences')).toHaveText('0');
  await expect(page.locator('#s-paragraphs')).toHaveText('0');
  await expect(page.locator('#s-lines')).toHaveText('0');
  await expect(page.locator('#s-bytes')).toHaveText('0');
});

// ── Stats update ──────────────────────────────────────────────────────────────

test('character count updates on input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('Hello');
  await expect(page.locator('#s-chars')).toHaveText('5');
});

test('character count without spaces is correct', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('hi there');
  await expect(page.locator('#s-chars')).toHaveText('8');
  await expect(page.locator('#s-chars-ns')).toHaveText('7');
});

test('word count is correct', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('one two three four five');
  await expect(page.locator('#s-words')).toHaveText('5');
});

test('sentence count is correct', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('Hello world. How are you? I am fine!');
  await expect(page.locator('#s-sentences')).toHaveText('3');
});

test('line count is correct', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('line one\nline two\nline three');
  await expect(page.locator('#s-lines')).toHaveText('3');
});

test('paragraph count is correct', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('Para one.\n\nPara two.\n\nPara three.');
  await expect(page.locator('#s-paragraphs')).toHaveText('3');
});

test('bytes count is non-zero for ASCII text', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('hello');
  const bytes = await page.locator('#s-bytes').textContent();
  expect(parseInt(bytes ?? '0')).toBeGreaterThan(0);
});

test('shows reading time after entering enough text', async ({ page }) => {
  await page.goto(URL);
  const words = Array(300).fill('word').join(' ');
  await page.locator('#text-input').fill(words);
  await expect(page.locator('#s-reading')).not.toHaveText('—');
});

// ── Top keywords ──────────────────────────────────────────────────────────────

test('shows no keywords on empty input', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.keywords-empty')).toBeVisible();
});

test('shows keywords after entering text', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('apple apple apple banana banana cherry');
  const chips = page.locator('.kw-item');
  const count = await chips.count();
  expect(count).toBeGreaterThan(0);
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button resets all stats to zero', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#text-input').fill('Some sample text for testing.');
  await expect(page.locator('#s-words')).not.toHaveText('0');
  await page.locator('#clear-btn').click();
  await expect(page.locator('#text-input')).toHaveValue('');
  await expect(page.locator('#s-chars')).toHaveText('0');
  await expect(page.locator('#s-words')).toHaveText('0');
});

// ── Copy stats button ─────────────────────────────────────────────────────────

test('copy stats button copies stats text to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#text-input').fill('hello world test text here');
  await page.locator('#copy-stats-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text.length).toBeGreaterThan(0);
  expect(text).toMatch(/\d/);
});
