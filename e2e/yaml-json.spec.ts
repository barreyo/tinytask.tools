import { expect, test } from '@playwright/test';

const URL = '/tools/yaml-json';

const SAMPLE_YAML = `name: Alice
age: 30
active: true`;

const SAMPLE_JSON = `{"name":"Alice","age":30,"active":true}`;

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/YAML/);
});

test('shows input textarea and output pane on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#yj-input')).toBeVisible();
  await expect(page.locator('#yj-output')).toBeVisible();
});

test('copy and download buttons are disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#yj-copy-btn')).toBeDisabled();
  await expect(page.locator('#yj-download-btn')).toBeDisabled();
});

test('shows placeholder text in output on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.yj-placeholder')).toBeVisible();
});

// ── YAML → JSON conversion ────────────────────────────────────────────────────

test('converts YAML to JSON and updates output label', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await expect(page.locator('#yj-output')).toContainText('Alice');
  await expect(page.locator('#yj-output-label')).toContainText('json');
});

test('enables copy and download after YAML input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await expect(page.locator('#yj-copy-btn')).toBeEnabled();
  await expect(page.locator('#yj-download-btn')).toBeEnabled();
});

test('output contains properly formatted JSON keys', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await expect(page.locator('#yj-output')).toContainText('"name"');
  await expect(page.locator('#yj-output')).toContainText('"age"');
});

// ── JSON → YAML conversion ────────────────────────────────────────────────────

test('auto-detects JSON input and converts to YAML', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_JSON);
  await expect(page.locator('#yj-output-label')).toContainText('yaml');
  await expect(page.locator('#yj-output')).toContainText('Alice');
});

test('JSON to YAML output contains expected keys', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_JSON);
  await expect(page.locator('#yj-output')).toContainText('name:');
  await expect(page.locator('#yj-output')).toContainText('age:');
});

// ── Error handling ────────────────────────────────────────────────────────────

test('shows error output on invalid input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill('{invalid json: [');
  await expect(page.locator('.yj-output--error')).toBeVisible();
  await expect(page.locator('#yj-copy-btn')).toBeDisabled();
});

// ── Swap button ───────────────────────────────────────────────────────────────

test('swap button swaps output into input and flips direction', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await expect(page.locator('#yj-output-label')).toContainText('json');

  await page.locator('#yj-swap-btn').click();
  await expect(page.locator('#yj-output-label')).toContainText('yaml');
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button empties input and resets output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await expect(page.locator('#yj-copy-btn')).toBeEnabled();
  await page.locator('#yj-clear-btn').click();
  await expect(page.locator('#yj-input')).toHaveValue('');
  await expect(page.locator('.yj-placeholder')).toBeVisible();
  await expect(page.locator('#yj-copy-btn')).toBeDisabled();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies output to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await page.locator('#yj-copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('Alice');
});

test('copy button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#yj-input').fill(SAMPLE_YAML);
  await page.locator('#yj-copy-btn').click();
  await expect(page.locator('#yj-copy-btn')).toHaveText('copied');
  await expect(page.locator('#yj-copy-btn')).toHaveText('copy', { timeout: 2000 });
});
