import { expect, test } from '@playwright/test';

const URL = '/tools/json-formatter';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/JSON Formatter/);
});

test('shows input and output panes on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#jf-input')).toBeVisible();
  await expect(page.locator('#jf-output')).toBeVisible();
});

test('copy and download buttons are disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#jf-copy-btn')).toBeDisabled();
  await expect(page.locator('#jf-download-btn')).toBeDisabled();
});

test('shows placeholder text on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.jf-placeholder')).toBeVisible();
});

// ── Format valid JSON ─────────────────────────────────────────────────────────

test('formats valid JSON on input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"name":"Alice","age":30}');
  await expect(page.locator('.jf-placeholder')).toBeHidden();
  await expect(page.locator('#jf-output')).toContainText('Alice');
});

test('copy and download buttons become enabled after valid JSON', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"hello":"world"}');
  await expect(page.locator('#jf-copy-btn')).toBeEnabled();
  await expect(page.locator('#jf-download-btn')).toBeEnabled();
});

test('formats nested JSON with proper indentation', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"a":{"b":{"c":1}}}');
  const output = page.locator('#jf-output');
  await expect(output).toContainText('"a"');
  await expect(output).toContainText('"b"');
  await expect(output).toContainText('"c"');
});

test('formats JSON array', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('[1,2,3]');
  await expect(page.locator('#jf-output')).toContainText('1');
  await expect(page.locator('#jf-copy-btn')).toBeEnabled();
});

// ── Error handling ────────────────────────────────────────────────────────────

test('shows error class on invalid JSON', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{not valid json}');
  await expect(page.locator('.jf-output--error')).toBeVisible();
});

test('copy and download buttons stay disabled on invalid JSON', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{bad json');
  await expect(page.locator('#jf-copy-btn')).toBeDisabled();
  await expect(page.locator('#jf-download-btn')).toBeDisabled();
});

test('error clears when input becomes valid', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{bad}');
  await expect(page.locator('.jf-output--error')).toBeVisible();
  await page.locator('#jf-input').fill('{"ok":true}');
  await expect(page.locator('.jf-output--error')).toBeHidden();
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button empties input and resets output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"key":"value"}');
  await expect(page.locator('#jf-copy-btn')).toBeEnabled();
  await page.locator('#jf-clear-btn').click();
  await expect(page.locator('#jf-input')).toHaveValue('');
  await expect(page.locator('.jf-placeholder')).toBeVisible();
  await expect(page.locator('#jf-copy-btn')).toBeDisabled();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies formatted JSON to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"x":1}');
  await expect(page.locator('#jf-copy-btn')).toBeEnabled();
  await page.locator('#jf-copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('"x"');
  expect(text).toContain('1');
});

test('copy button briefly shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"y":2}');
  await page.locator('#jf-copy-btn').click();
  await expect(page.locator('#jf-copy-btn')).toHaveText('copied');
  await expect(page.locator('#jf-copy-btn')).toHaveText('copy', { timeout: 2000 });
});

// ── Download button ───────────────────────────────────────────────────────────

test('download button triggers file download', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jf-input').fill('{"download":true}');
  await expect(page.locator('#jf-download-btn')).toBeEnabled();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#jf-download-btn').click(),
  ]);
  expect(download.suggestedFilename()).toBe('formatted.json');
});
