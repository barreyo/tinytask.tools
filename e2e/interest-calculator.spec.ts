import { expect, test } from '@playwright/test';

const URL = '/tools/interest-calculator';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Interest/);
});

test('shows principal, APR, and term inputs on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#principal')).toBeVisible();
  await expect(page.locator('#apr')).toBeVisible();
  await expect(page.locator('#term-months')).toBeVisible();
});

test('shows preset buttons on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.preset-btn[data-preset="credit-card"]')).toBeVisible();
  await expect(page.locator('.preset-btn[data-preset="mortgage"]')).toBeVisible();
});

test('credit card preset is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.preset-btn[data-preset="credit-card"]')).toHaveClass(/active/);
});

test('shows calculate button on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#calc-btn')).toBeVisible();
});

test('summary section is hidden on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#summary-section')).toBeHidden();
});

// ── Calculate ─────────────────────────────────────────────────────────────────

test('clicking calculate shows summary section', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#calc-btn').click();
  await expect(page.locator('#summary-section')).toBeVisible();
});

test('shows total interest stat after calculating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#calc-btn').click();
  await expect(page.locator('#stat-interest')).not.toHaveText('—');
});

test('shows total paid stat after calculating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#calc-btn').click();
  await expect(page.locator('#stat-total-paid')).not.toHaveText('—');
});

test('shows amortization schedule after calculating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#calc-btn').click();
  await expect(page.locator('#schedule-section')).toBeVisible();
  const rows = page.locator('#amort-table tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ── Presets ───────────────────────────────────────────────────────────────────

test('switching to mortgage preset updates APR', async ({ page }) => {
  await page.goto(URL);
  const defaultApr = await page.locator('#apr').inputValue();
  await page.locator('.preset-btn[data-preset="mortgage"]').click();
  const mortgageApr = await page.locator('#apr').inputValue();
  expect(mortgageApr).not.toBe(defaultApr);
});

test('switching to mortgage preset makes it active', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.preset-btn[data-preset="mortgage"]').click();
  await expect(page.locator('.preset-btn[data-preset="mortgage"]')).toHaveClass(/active/);
  await expect(page.locator('.preset-btn[data-preset="credit-card"]')).not.toHaveClass(/active/);
});

test('custom preset allows manual input without overriding', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.preset-btn[data-preset="custom"]').click();
  await page.locator('#principal').fill('10000');
  await page.locator('#apr').fill('5.0');
  await page.locator('#term-months').fill('12');
  await page.locator('#calc-btn').click();
  await expect(page.locator('#summary-section')).toBeVisible();
});

// ── Export CSV ────────────────────────────────────────────────────────────────

test('export CSV button triggers file download', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#calc-btn').click();
  await expect(page.locator('#schedule-section')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#export-csv-btn').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
});
