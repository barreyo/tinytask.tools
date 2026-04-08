import { expect, test } from '@playwright/test';

const URL = '/tools/xml-formatter';

const VALID_XML = `<root><person><name>Alice</name><age>30</age></person></root>`;
const INVALID_XML = `<root><unclosed>`;

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/XML/);
});

test('shows input and output panes on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#xf-input')).toBeVisible();
  await expect(page.locator('#xf-output')).toBeVisible();
});

test('copy and download buttons are disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#xf-copy-btn')).toBeDisabled();
  await expect(page.locator('#xf-download-btn')).toBeDisabled();
});

test('shows placeholder text in output on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.xf-placeholder')).toBeVisible();
});

// ── Format valid XML ──────────────────────────────────────────────────────────

test('formats valid XML on input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await expect(page.locator('.xf-placeholder')).toBeHidden();
  await expect(page.locator('#xf-output')).toContainText('Alice');
});

test('copy and download buttons become enabled after valid XML', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await expect(page.locator('#xf-copy-btn')).toBeEnabled();
  await expect(page.locator('#xf-download-btn')).toBeEnabled();
});

test('output shows tag names from formatted XML', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await expect(page.locator('#xf-output')).toContainText('root');
  await expect(page.locator('#xf-output')).toContainText('person');
  await expect(page.locator('#xf-output')).toContainText('name');
});

// ── Error handling ────────────────────────────────────────────────────────────

test('shows error output on invalid XML', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(INVALID_XML);
  await expect(page.locator('.xf-output--error')).toBeVisible();
  await expect(page.locator('#xf-copy-btn')).toBeDisabled();
});

test('error clears when valid XML is entered', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(INVALID_XML);
  await expect(page.locator('.xf-output--error')).toBeVisible();
  await page.locator('#xf-input').fill(VALID_XML);
  await expect(page.locator('.xf-output--error')).toBeHidden();
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button resets input and output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await expect(page.locator('#xf-copy-btn')).toBeEnabled();
  await page.locator('#xf-clear-btn').click();
  await expect(page.locator('#xf-input')).toHaveValue('');
  await expect(page.locator('.xf-placeholder')).toBeVisible();
  await expect(page.locator('#xf-copy-btn')).toBeDisabled();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies formatted XML to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await page.locator('#xf-copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('<root>');
  expect(text).toContain('Alice');
});

test('copy button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await page.locator('#xf-copy-btn').click();
  await expect(page.locator('#xf-copy-btn')).toHaveText('copied');
  await expect(page.locator('#xf-copy-btn')).toHaveText('copy', { timeout: 5000 });
});

// ── Download button ───────────────────────────────────────────────────────────

test('download button triggers file download', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#xf-input').fill(VALID_XML);
  await expect(page.locator('#xf-download-btn')).toBeEnabled();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#xf-download-btn').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.xml$/);
});
