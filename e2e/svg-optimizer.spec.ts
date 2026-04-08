import { expect, test } from '@playwright/test';

const URL = '/tools/svg-optimizer';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <!-- a circle -->
  <circle cx="50" cy="50" r="40" fill="blue" />
</svg>`;

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/SVG/);
});

test('shows SVG input textarea on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#svg-input')).toBeVisible();
});

test('shows optimize button on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#optimize-btn')).toBeVisible();
});

test('shows empty output message on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#output-empty')).toBeVisible();
});

// ── Optimize ──────────────────────────────────────────────────────────────────

test('optimizes SVG on button click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#optimize-btn').click();
  await expect(page.locator('#output-empty')).toBeHidden();
  await expect(page.locator('#svg-output')).not.toBeEmpty();
});

test('shows stats after optimization', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#optimize-btn').click();
  await expect(page.locator('#stats-inline')).toBeVisible();
});

test('output contains the svg element', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#optimize-btn').click();
  const output = await page.locator('#svg-output').textContent();
  expect(output).toContain('<svg');
});

test('shows SVG preview after optimization', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#optimize-btn').click();
  await expect(page.locator('#svg-preview')).not.toBeEmpty();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies optimized SVG to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#optimize-btn').click();
  await page.locator('#copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('<svg');
});

// ── Download button ───────────────────────────────────────────────────────────

test('download button triggers file download after optimization', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#optimize-btn').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#download-btn').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear input button resets the textarea', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#svg-input').fill(SAMPLE_SVG);
  await page.locator('#clear-input-btn').click();
  await expect(page.locator('#svg-input')).toHaveValue('');
});

// ── Plugins panel ─────────────────────────────────────────────────────────────

test('plugin panel is hidden by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#plugin-panel')).toBeHidden();
});

test('clicking plugins button shows the plugin panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#toggle-plugins-btn').click();
  await expect(page.locator('#plugin-panel')).toBeVisible();
});

test('plugin list is populated', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#toggle-plugins-btn').click();
  const plugins = page.locator('#plugin-list input[type="checkbox"]');
  const count = await plugins.count();
  expect(count).toBeGreaterThan(0);
});
