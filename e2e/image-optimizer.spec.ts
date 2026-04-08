import { expect, test } from '@playwright/test';

const URL = '/tools/image-optimizer';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Image|WebP/i);
});

test('shows upload zone on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#upload-zone')).toBeVisible();
});

test('settings panel is hidden on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#settings-panel')).toBeHidden();
});

test('result panel is hidden on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#result-panel')).toBeHidden();
});

test('upload zone shows prompt text', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.upload-title')).toBeVisible();
});

// ── File upload ───────────────────────────────────────────────────────────────

test('uploading an image shows settings panel', async ({ page }) => {
  await page.goto(URL);

  // Create a minimal 1x1 pixel PNG in memory via canvas
  const pngBuffer = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, 10);
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return Array.from(bytes);
  });

  const buffer = Buffer.from(pngBuffer);

  await page.locator('#img-file-input').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer,
  });

  await expect(page.locator('#settings-panel')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#upload-zone')).toBeHidden();
});

test('quality slider is visible after upload', async ({ page }) => {
  await page.goto(URL);

  const pngBuffer = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 10, 10);
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return Array.from(bytes);
  });

  const buffer = Buffer.from(pngBuffer);

  await page.locator('#img-file-input').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer,
  });

  await expect(page.locator('#quality-slider')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#quality-value')).toHaveText('80');
});
