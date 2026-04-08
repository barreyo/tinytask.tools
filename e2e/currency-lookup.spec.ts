import { expect, test } from '@playwright/test';

const URL = '/tools/currency-lookup';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Currency/);
});

test('shows search input on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cl-search')).toBeVisible();
});

test('shows count of all currencies on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cl-count')).toContainText('Showing all');
});

test('table has header columns on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('th.cl-th--code')).toBeVisible();
  await expect(page.locator('th.cl-th--name')).toBeVisible();
  await expect(page.locator('th.cl-th--sym')).toBeVisible();
});

test('rows are visible in the table on load', async ({ page }) => {
  await page.goto(URL);
  const rows = page.locator('.cl-row');
  const count = await rows.count();
  expect(count).toBeGreaterThan(100);
});

// ── Search ────────────────────────────────────────────────────────────────────

test('searching "USD" shows the US dollar row', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('USD');
  await expect(page.locator('.cl-row[data-code="usd"]')).toBeVisible();
});

test('searching by code hides non-matching rows', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('EUR');
  const visibleRows = page.locator('.cl-row:not([hidden])');
  const count = await visibleRows.count();
  expect(count).toBeLessThan(10);
});

test('searching by currency name works', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('Japanese yen');
  await expect(page.locator('.cl-row[data-code="jpy"]')).toBeVisible();
});

test('searching by symbol works', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('$');
  const visibleRows = page.locator('.cl-row:not([hidden])');
  const count = await visibleRows.count();
  expect(count).toBeGreaterThan(0);
});

test('count updates to reflect filtered results', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('USD');
  await expect(page.locator('#cl-count')).not.toContainText('Showing all');
});

test('shows empty state when no currencies match', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('zzzznotacurrency');
  await expect(page.locator('#cl-empty')).toBeVisible();
  await expect(page.locator('#cl-count')).toContainText('No results');
});

test('clearing search restores all rows', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cl-search').fill('USD');
  const filtered = await page.locator('.cl-row:not([hidden])').count();

  await page.locator('#cl-search').fill('');
  const all = await page.locator('.cl-row:not([hidden])').count();
  expect(all).toBeGreaterThan(filtered);
});
