import { expect, test } from '@playwright/test';

const URL = '/tools/qr-code-generator';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/QR/);
});

test('shows content input on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#qr-input')).toBeVisible();
});

test('shows QR code on load with default URL', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#qr-empty')).toBeHidden();
  await expect(page.locator('#qr-canvas-wrap')).not.toBeEmpty();
});

test('download buttons are enabled on load with default content', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#dl-png')).toBeEnabled();
  await expect(page.locator('#dl-svg')).toBeEnabled();
});

test('download buttons become disabled when input is cleared', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').clear();
  await expect(page.locator('#dl-png')).toBeDisabled();
  await expect(page.locator('#dl-svg')).toBeDisabled();
});

test('error correction level buttons are visible', async ({ page }) => {
  await page.goto(URL);
  for (const ec of ['L', 'M', 'Q', 'H']) {
    await expect(page.locator(`[data-ec="${ec}"]`)).toBeVisible();
  }
});

test('M error correction is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-ec="M"]')).toHaveClass(/active/);
});

// ── Generate QR code ──────────────────────────────────────────────────────────

test('entering content generates a QR code', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').fill('https://example.com');
  // Wait for QR code canvas/svg to be rendered inside the wrap
  await expect(page.locator('#qr-empty')).toBeHidden({ timeout: 5000 });
  const canvasWrap = page.locator('#qr-canvas-wrap');
  await expect(canvasWrap).not.toBeEmpty();
});

test('download buttons become enabled after generating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').fill('https://example.com');
  await expect(page.locator('#dl-png')).toBeEnabled({ timeout: 5000 });
  await expect(page.locator('#dl-svg')).toBeEnabled({ timeout: 5000 });
});

test('shows info panel values after generating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').fill('https://example.com');
  await expect(page.locator('#info-version')).not.toHaveText('—', { timeout: 5000 });
});

test('char count updates as user types', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').fill('hello');
  await expect(page.locator('#char-count')).not.toBeEmpty();
});

// ── Error correction ──────────────────────────────────────────────────────────

test('switching error correction level updates active button', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-ec="H"]').click();
  await expect(page.locator('[data-ec="H"]')).toHaveClass(/active/);
  await expect(page.locator('[data-ec="M"]')).not.toHaveClass(/active/);
});

// ── Download ──────────────────────────────────────────────────────────────────

test('download PNG triggers a file download', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').fill('https://example.com');
  await expect(page.locator('#dl-png')).toBeEnabled({ timeout: 5000 });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#dl-png').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('download SVG triggers a file download', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#qr-input').fill('test content');
  await expect(page.locator('#dl-svg')).toBeEnabled({ timeout: 5000 });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#dl-svg').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
});
