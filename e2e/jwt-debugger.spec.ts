import { expect, test } from '@playwright/test';

const URL = '/tools/jwt-debugger';

// A minimal valid JWT (header.payload.signature) — HS256, no verification needed
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/JWT/);
});

test('shows token input on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#jwt-input')).toBeVisible();
});

test('copy header and payload buttons are disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#jwt-copy-header')).toBeDisabled();
  await expect(page.locator('#jwt-copy-payload')).toBeDisabled();
});

test('shows placeholder text in header and payload panes on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#jwt-header-out')).toContainText('header will appear here');
  await expect(page.locator('#jwt-payload-out')).toContainText('payload will appear here');
});

// ── Decode valid JWT ──────────────────────────────────────────────────────────

test('decodes header from a valid JWT', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('#jwt-header-out')).toContainText('HS256');
  await expect(page.locator('#jwt-header-out')).toContainText('JWT');
});

test('decodes payload from a valid JWT', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('#jwt-payload-out')).toContainText('1234567890');
  await expect(page.locator('#jwt-payload-out')).toContainText('John Doe');
});

test('shows signature section after decoding', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('#jwt-sig-out')).not.toContainText(
    'signature (raw, not verified) will appear here',
  );
});

test('copy buttons become enabled after decoding', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('#jwt-copy-header')).toBeEnabled();
  await expect(page.locator('#jwt-copy-payload')).toBeEnabled();
});

test('shows color-coded segment preview', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('.jwt-seg--h')).toBeVisible();
  await expect(page.locator('.jwt-seg--p')).toBeVisible();
  await expect(page.locator('.jwt-seg--s')).toBeVisible();
});

// ── Copy buttons ──────────────────────────────────────────────────────────────

test('copy header button copies formatted header JSON', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await page.locator('#jwt-copy-header').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  const parsed = JSON.parse(text);
  expect(parsed.alg).toBe('HS256');
});

test('copy payload button copies formatted payload JSON', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await page.locator('#jwt-copy-payload').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  const parsed = JSON.parse(text);
  expect(parsed.sub).toBe('1234567890');
});

test('copy header button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await page.locator('#jwt-copy-header').click();
  await expect(page.locator('#jwt-copy-header')).toHaveText('copied');
  await expect(page.locator('#jwt-copy-header')).toHaveText('copy', { timeout: 5000 });
});

// ── Error handling ────────────────────────────────────────────────────────────

test('shows error message for invalid token', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill('not.a.valid.jwt.token');
  await expect(page.locator('#jwt-error')).not.toBeEmpty();
});

test('error shows in red segment preview for malformed token', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill('justonepart');
  await expect(page.locator('.jwt-seg--error')).toBeVisible();
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button resets all panes', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('#jwt-copy-header')).toBeEnabled();
  await page.locator('#jwt-clear-btn').click();
  await expect(page.locator('#jwt-input')).toHaveValue('');
  await expect(page.locator('#jwt-copy-header')).toBeDisabled();
  await expect(page.locator('#jwt-header-out')).toContainText('header will appear here');
});

// ── iat / exp hint rendering ──────────────────────────────────────────────────

test('shows timestamp hints for iat claim', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#jwt-input').fill(VALID_JWT);
  await expect(page.locator('.jwt-claim-hint')).toBeVisible();
});
