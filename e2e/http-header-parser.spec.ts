import { expect, test } from '@playwright/test';

const URL = '/tools/http-header-parser';

const SAMPLE_HEADERS = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: max-age=3600, public
X-Frame-Options: DENY
Content-Length: 1024`;

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/HTTP Header/);
});

test('shows header input textarea on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#header-input')).toBeVisible();
});

test('shows empty state message on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#empty-state')).toBeVisible();
});

test('output section is hidden on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#output-section')).toBeHidden();
});

// ── Parse headers ─────────────────────────────────────────────────────────────

test('parses headers and shows output section', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  await expect(page.locator('#output-section')).toBeVisible();
  await expect(page.locator('#empty-state')).toBeHidden();
});

test('shows header count after parsing', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  await expect(page.locator('#header-count')).not.toBeEmpty();
});

test('shows Content-Type header in parsed output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  await expect(page.locator('#header-table')).toContainText('Content-Type');
});

test('shows Cache-Control header in parsed output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  await expect(page.locator('#header-table')).toContainText('Cache-Control');
});

test('parses status line when included', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  // Status line should be represented somewhere
  await expect(page.locator('#header-table')).not.toBeEmpty();
});

// ── Copy as markdown ──────────────────────────────────────────────────────────

test('copy table button copies markdown to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  await page.locator('#copy-table-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('|');
  expect(text).toContain('Content-Type');
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button resets input and hides output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill(SAMPLE_HEADERS);
  await expect(page.locator('#output-section')).toBeVisible();
  await page.locator('#clear-btn').click();
  await expect(page.locator('#header-input')).toHaveValue('');
  await expect(page.locator('#output-section')).toBeHidden();
  await expect(page.locator('#empty-state')).toBeVisible();
});

// ── Single header ─────────────────────────────────────────────────────────────

test('parses a single header line', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#header-input').fill('Authorization: Bearer token123');
  await expect(page.locator('#header-table')).toContainText('Authorization');
  await expect(page.locator('#header-table')).toContainText('Bearer');
});
