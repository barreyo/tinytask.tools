import { expect, test } from '@playwright/test';

const URL = '/tools/rsa-keygen';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/RSA/);
});

test('shows configuration controls on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#key-size')).toBeVisible();
  await expect(page.locator('#hash-algo')).toBeVisible();
  await expect(page.locator('#key-usage')).toBeVisible();
});

test('generate button is visible on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#generate-btn')).toBeVisible();
});

test('default key size is 2048', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#key-size')).toHaveValue('2048');
});

test('key sections are hidden before generation', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#public-key-section')).toBeHidden();
  await expect(page.locator('#private-key-section')).toBeHidden();
});

// ── Generate key pair ─────────────────────────────────────────────────────────

test('generates RSA key pair and shows key sections', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  // Key generation takes a moment — use a generous timeout
  await expect(page.locator('#public-key-section')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#private-key-section')).toBeVisible({ timeout: 15000 });
});

test('public key output contains PEM header', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#public-key-section')).toBeVisible({ timeout: 15000 });
  const pem = await page.locator('#public-key-output').inputValue();
  expect(pem).toContain('-----BEGIN PUBLIC KEY-----');
});

test('private key output contains PEM header', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#private-key-section')).toBeVisible({ timeout: 15000 });
  const pem = await page.locator('#private-key-output').inputValue();
  expect(pem).toContain('-----BEGIN PRIVATE KEY-----');
});

test('shows fingerprint for public key', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#public-fingerprint')).not.toBeEmpty({ timeout: 15000 });
});

// ── Copy buttons ──────────────────────────────────────────────────────────────

test('copy public key button copies PEM to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#public-key-section')).toBeVisible({ timeout: 15000 });
  await page.locator('#copy-public-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('-----BEGIN PUBLIC KEY-----');
});

test('copy private key button copies PEM to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#private-key-section')).toBeVisible({ timeout: 15000 });
  await page.locator('#copy-private-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('-----BEGIN PRIVATE KEY-----');
});

// ── Download buttons ──────────────────────────────────────────────────────────

test('download public key triggers PEM file download', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#public-key-section')).toBeVisible({ timeout: 15000 });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#download-public-btn').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pem$/);
});

// ── Key options ───────────────────────────────────────────────────────────────

test('can select SHA-512 hash algorithm', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#hash-algo').selectOption('SHA-512');
  await expect(page.locator('#hash-algo')).toHaveValue('SHA-512');
});

test('can switch usage to signing', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#key-usage').selectOption('sign');
  await expect(page.locator('#key-usage')).toHaveValue('sign');
});

test('generates new different keys on repeated clicks', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn[data-initialized="true"]').waitFor({ timeout: 5000 });
  await page.locator('#generate-btn').click();
  await expect(page.locator('#public-key-section')).toBeVisible({ timeout: 15000 });
  const first = await page.locator('#public-key-output').inputValue();

  await page.locator('#generate-btn').click();
  await expect(page.locator('#public-key-section')).toBeVisible({ timeout: 15000 });
  const second = await page.locator('#public-key-output').inputValue();
  expect(first).not.toBe(second);
});
