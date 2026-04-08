import { expect, test } from '@playwright/test';

const URL = '/tools/nacha-parser';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/NACHA|ACH/i);
});

test('shows parse and generate tabs on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#tab-parse')).toBeVisible();
  await expect(page.locator('#tab-generate')).toBeVisible();
});

test('parse tab is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#tab-parse')).toHaveClass(/active/);
  await expect(page.locator('#panel-parse')).toBeVisible();
});

test('generate panel is hidden by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-generate')).toBeHidden();
});

test('shows NACHA input textarea', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#nacha-input')).toBeVisible();
});

// ── Load sample ───────────────────────────────────────────────────────────────

test('load sample button populates the input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#load-sample-btn').click();
  const value = await page.locator('#nacha-input').inputValue();
  expect(value.trim().length).toBeGreaterThan(0);
});

test('loading sample and parsing shows validation status', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#load-sample-btn').click();
  await expect(page.locator('#validation-status')).toBeVisible();
});

test('loading sample shows summary section', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#load-sample-btn').click();
  await expect(page.locator('#parse-summary')).toBeVisible();
});

// ── Tab switching ─────────────────────────────────────────────────────────────

test('clicking generate tab shows generate panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#tab-generate').click();
  await expect(page.locator('#panel-generate')).toBeVisible();
  await expect(page.locator('#panel-parse')).toBeHidden();
});

test('clicking parse tab after generate tab returns to parse panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#tab-generate').click();
  await page.locator('#tab-parse').click();
  await expect(page.locator('#panel-parse')).toBeVisible();
  await expect(page.locator('#panel-generate')).toBeHidden();
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button empties the input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#load-sample-btn').click();
  await expect(page.locator('#nacha-input')).not.toHaveValue('');
  await page.locator('#parse-clear-btn').click();
  await expect(page.locator('#nacha-input')).toHaveValue('');
});

test('clear button hides the summary section', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#load-sample-btn').click();
  await expect(page.locator('#parse-summary')).toBeVisible();
  await page.locator('#parse-clear-btn').click();
  await expect(page.locator('#parse-summary')).toBeHidden();
});
