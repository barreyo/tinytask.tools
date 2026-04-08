import { expect, test } from '@playwright/test';

const URL = '/tools/http-status-codes';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/HTTP Status/);
});

test('shows search input on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#hsc-search')).toBeVisible();
});

test('shows all status codes count on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#hsc-count')).toContainText('Showing all');
});

test('category filter buttons are visible', async ({ page }) => {
  await page.goto(URL);
  for (const cat of ['All', '1xx', '2xx', '3xx', '4xx', '5xx']) {
    await expect(page.locator(`.hsc-filter-btn[data-category="${cat}"]`)).toBeVisible();
  }
});

test('All filter button is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.hsc-filter-btn[data-category="All"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('table rows are visible on load', async ({ page }) => {
  await page.goto(URL);
  const rows = page.locator('.hsc-row:not([hidden])');
  const count = await rows.count();
  expect(count).toBeGreaterThan(30);
});

// ── Search ────────────────────────────────────────────────────────────────────

test('searching by code "200" shows the OK row', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#hsc-search').fill('200');
  await expect(page.locator('.hsc-row[data-code="200"]')).toBeVisible();
});

test('searching by phrase "not found" shows 404 row', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#hsc-search').fill('not found');
  await expect(page.locator('.hsc-row[data-code="404"]')).toBeVisible();
});

test('searching filters down the visible row count', async ({ page }) => {
  await page.goto(URL);
  const allCount = await page.locator('.hsc-row:not([hidden])').count();
  await page.locator('#hsc-search').fill('redirect');
  const filtered = await page.locator('.hsc-row:not([hidden])').count();
  expect(filtered).toBeLessThan(allCount);
});

test('count updates when searching', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#hsc-search').fill('200');
  await expect(page.locator('#hsc-count')).not.toContainText('Showing all');
});

test('shows empty state for unrecognized search', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#hsc-search').fill('zzznotastatus');
  await expect(page.locator('#hsc-empty')).toBeVisible();
  await expect(page.locator('#hsc-count')).toContainText('No');
});

// ── Category filters ──────────────────────────────────────────────────────────

test('clicking 2xx shows only 2xx rows', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.hsc-filter-btn[data-category="2xx"]').click();
  await expect(page.locator('.hsc-filter-btn[data-category="2xx"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const visibleRows = page.locator('.hsc-row:not([hidden])');
  const count = await visibleRows.count();
  expect(count).toBeGreaterThan(0);
  // All visible rows should be 2xx
  const codes = await visibleRows.evaluateAll((rows) =>
    rows.map((r) => parseInt((r as HTMLElement).dataset.code ?? '0')),
  );
  for (const code of codes) {
    expect(code).toBeGreaterThanOrEqual(200);
    expect(code).toBeLessThan(300);
  }
});

test('clicking 4xx shows only 4xx rows', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.hsc-filter-btn[data-category="4xx"]').click();
  const visibleRows = page.locator('.hsc-row:not([hidden])');
  const codes = await visibleRows.evaluateAll((rows) =>
    rows.map((r) => parseInt((r as HTMLElement).dataset.code ?? '0')),
  );
  for (const code of codes) {
    expect(code).toBeGreaterThanOrEqual(400);
    expect(code).toBeLessThan(500);
  }
});

test('clicking 5xx shows only 5xx rows', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.hsc-filter-btn[data-category="5xx"]').click();
  const visibleRows = page.locator('.hsc-row:not([hidden])');
  const count = await visibleRows.count();
  expect(count).toBeGreaterThan(0);
  const codes = await visibleRows.evaluateAll((rows) =>
    rows.map((r) => parseInt((r as HTMLElement).dataset.code ?? '0')),
  );
  for (const code of codes) {
    expect(code).toBeGreaterThanOrEqual(500);
  }
});

test('clicking All restores all rows after filtering', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.hsc-filter-btn[data-category="4xx"]').click();
  const filtered = await page.locator('.hsc-row:not([hidden])').count();
  await page.locator('.hsc-filter-btn[data-category="All"]').click();
  const all = await page.locator('.hsc-row:not([hidden])').count();
  expect(all).toBeGreaterThan(filtered);
});
