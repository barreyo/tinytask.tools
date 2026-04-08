import { expect, test } from '@playwright/test';

const URL = '/tools/dummy-text';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Dummy Text/);
});

test('shows generate button on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#generate-btn')).toBeVisible();
});

test('shows theme and format selector buttons on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-theme="lorem"]')).toBeVisible();
  await expect(page.locator('[data-format="paragraphs"]')).toBeVisible();
});

test('lorem theme button is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-theme="lorem"]')).toHaveClass(/active/);
});

test('paragraphs format button is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-format="paragraphs"]')).toHaveClass(/active/);
});

test('shows empty state message before generating', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#output-empty')).toBeVisible();
});

// ── Generate ──────────────────────────────────────────────────────────────────

test('generates text on button click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#output-empty')).toBeHidden();
  await expect(page.locator('#dt-output')).not.toBeEmpty();
});

test('shows char count after generating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#char-count')).toContainText('chars');
});

test('regenerate button generates new text', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  const first = await page.locator('#dt-output').textContent();
  await page.locator('#regenerate-btn').click();
  const second = await page.locator('#dt-output').textContent();
  // Regenerate uses different seeds, so text is very likely different
  // (though technically could collide — practically won't)
  expect(first).not.toBe(second);
});

// ── Themes ────────────────────────────────────────────────────────────────────

test('switching theme changes active button', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-theme="startup"]').click();
  await expect(page.locator('[data-theme="startup"]')).toHaveClass(/active/);
  await expect(page.locator('[data-theme="lorem"]')).not.toHaveClass(/active/);
});

test('generates text with startup theme', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-theme="startup"]').click();
  await page.locator('#generate-btn').click();
  await expect(page.locator('#dt-output')).not.toBeEmpty();
});

test('generates text with developer theme', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-theme="developer"]').click();
  await page.locator('#generate-btn').click();
  await expect(page.locator('#dt-output')).not.toBeEmpty();
});

// ── Formats ───────────────────────────────────────────────────────────────────

test('switching to sentences format updates active button', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-format="sentences"]').click();
  await expect(page.locator('[data-format="sentences"]')).toHaveClass(/active/);
});

test('switching to words format and generating outputs words', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-format="words"]').click();
  await page.locator('#generate-btn').click();
  await expect(page.locator('#dt-output')).not.toBeEmpty();
});

test('switching to headlines format generates headline-style text', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-format="headlines"]').click();
  await page.locator('#generate-btn').click();
  await expect(page.locator('#dt-output .output-headline').first()).toBeVisible();
});

// ── Count control ─────────────────────────────────────────────────────────────

test('increment button increases count', async ({ page }) => {
  await page.goto(URL);
  const initial = await page.locator('#count-input').inputValue();
  await page.locator('#count-inc').click();
  const updated = await page.locator('#count-input').inputValue();
  expect(parseInt(updated)).toBe(parseInt(initial) + 1);
});

test('decrement button decreases count', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#count-inc').click();
  const before = await page.locator('#count-input').inputValue();
  await page.locator('#count-dec').click();
  const after = await page.locator('#count-input').inputValue();
  expect(parseInt(after)).toBe(parseInt(before) - 1);
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies generated text to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#dt-output')).not.toBeEmpty();
  await page.locator('#copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text.trim().length).toBeGreaterThan(0);
});

test('copy button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await page.locator('#copy-btn').click();
  await expect(page.locator('#copy-btn')).toHaveText('copied');
  await expect(page.locator('#copy-btn')).toHaveText('copy', { timeout: 2000 });
});
