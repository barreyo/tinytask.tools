import { expect, test } from '@playwright/test';

const URL = '/tools/base64';

// ── Page load ────────────────────────────────────────────────────────────────

test('page loads with correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Base64/);
});

test('page shows the tool heading and description', async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByRole('heading', { name: /Base64 Encoder \/ Decoder/i })).toBeVisible();
});

test('encode and decode mode buttons are visible', async ({ page }) => {
  await page.goto(URL);
  const modeGroup = page.getByRole('group', { name: 'Mode' });
  await expect(modeGroup.getByRole('button', { name: /^encode$/i })).toBeVisible();
  await expect(modeGroup.getByRole('button', { name: /^decode$/i })).toBeVisible();
});

// ── Encode mode ──────────────────────────────────────────────────────────────

test('encodes ASCII text on button click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#b64-input').fill('Hello, World!');
  await page.locator('#convert-btn').click();
  await expect(page.locator('#b64-output')).toHaveText('SGVsbG8sIFdvcmxkIQ==');
});

test('encodes text on Ctrl+Enter', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#b64-input').fill('test');
  await page.locator('#b64-input').press('Control+Enter');
  await expect(page.locator('#b64-output')).toHaveText('dGVzdA==');
});

test('encodes Unicode text', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#b64-input').fill('café');
  await page.locator('#convert-btn').click();
  await expect(page.locator('#b64-output')).toHaveText('Y2Fmw6k=');
});

// ── Decode mode ──────────────────────────────────────────────────────────────

test('switches to decode mode and decodes Base64', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-mode="decode"]').click();
  await page.locator('#b64-input').fill('SGVsbG8sIFdvcmxkIQ==');
  await page.locator('#convert-btn').click();
  await expect(page.locator('#b64-output')).toHaveText('Hello, World!');
});

test('decode button label changes to "decode" when in decode mode', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-mode="decode"]').click();
  await expect(page.locator('#convert-btn')).toHaveText('decode');
});

test('shows error message for invalid Base64 input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-mode="decode"]').click();
  await page.locator('#b64-input').fill('this is not valid base64 $$$$');
  await page.locator('#convert-btn').click();
  const errorEl = page.locator('#b64-error');
  await expect(errorEl).toBeVisible();
  await expect(errorEl).toContainText('Invalid Base64');
});

test('error clears when switching modes', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-mode="decode"]').click();
  await page.locator('#b64-input').fill('!!not base64!!');
  await page.locator('#convert-btn').click();
  await expect(page.locator('#b64-error')).toBeVisible();

  await page.locator('[data-mode="encode"]').click();
  await expect(page.locator('#b64-error')).toBeHidden();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies output to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#b64-input').fill('Hello');
  await page.locator('#convert-btn').click();
  await page.locator('#copy-btn').click();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('SGVsbG8=');
});

test('copy button text changes to "copied" then reverts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#b64-input').fill('Hi');
  await page.locator('#convert-btn').click();
  await page.locator('#copy-btn').click();
  await expect(page.locator('#copy-btn')).toHaveText('copied');
  await expect(page.locator('#copy-btn')).toHaveText('copy', { timeout: 3000 });
});

// ── Clear input ───────────────────────────────────────────────────────────────

test('clear button empties the input and output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#b64-input').fill('some text');
  await page.locator('#convert-btn').click();
  await expect(page.locator('#b64-output')).not.toBeEmpty();

  await page.locator('#clear-input-btn').click();
  await expect(page.locator('#b64-input')).toHaveValue('');
  await expect(page.locator('#b64-output')).toBeEmpty();
});

// ── History ───────────────────────────────────────────────────────────────────

test('"no history yet" message is shown on first load', async ({ page }) => {
  await page.goto(URL);
  // Clear any leftover history from other tests
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();
  await expect(page.locator('#history-empty')).toBeVisible();
  await expect(page.locator('#history-empty')).toHaveText('no history yet');
});

test('history row appears after an encode operation', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('#b64-input').fill('hello history');
  await page.locator('#convert-btn').click();

  await expect(page.locator('#history-empty')).toBeHidden();
  const rows = page.locator('.history-row');
  await expect(rows).toHaveCount(1);
});

test('history badge shows correct mode', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('#b64-input').fill('badge test');
  await page.locator('#convert-btn').click();

  const badge = page.locator('.history-badge').first();
  await expect(badge).toHaveText('encode');
});

test('history shows decode badge for decode operations', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('[data-mode="decode"]').click();
  await page.locator('#b64-input').fill('SGVsbG8=');
  await page.locator('#convert-btn').click();

  const badge = page.locator('.history-badge').first();
  await expect(badge).toHaveText('decode');
});

test('history accumulates multiple entries', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  for (const text of ['first', 'second', 'third']) {
    await page.locator('#b64-input').fill(text);
    await page.locator('#convert-btn').click();
  }

  await expect(page.locator('.history-row')).toHaveCount(3);
});

test('history copy button copies the result value', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('#b64-input').fill('clipboard');
  await page.locator('#convert-btn').click();

  await page.locator('.history-copy-btn').first().click();
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('Y2xpcGJvYXJk');
});

// ── History persistence ───────────────────────────────────────────────────────

test('history persists across page reloads', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('#b64-input').fill('persist me');
  await page.locator('#convert-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);

  await page.reload();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await expect(page.locator('.history-badge').first()).toHaveText('encode');
});

// ── Clear history ─────────────────────────────────────────────────────────────

test('clear history button removes all entries', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('#b64-input').fill('to be cleared');
  await page.locator('#convert-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);

  await page.locator('#clear-history-btn').click();
  await expect(page.locator('#history-empty')).toBeVisible();
  await expect(page.locator('.history-row')).toHaveCount(0);
});

test('history stays cleared after reload', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_base64_history'));
  await page.reload();

  await page.locator('#b64-input').fill('temporary');
  await page.locator('#convert-btn').click();
  await page.locator('#clear-history-btn').click();
  await page.reload();

  await expect(page.locator('#history-empty')).toBeVisible();
});

// ── Mode toggle ───────────────────────────────────────────────────────────────

test('encode mode button is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-mode="encode"]')).toHaveClass(/active/);
});

test('switching to decode makes decode button active', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-mode="decode"]').click();
  await expect(page.locator('[data-mode="decode"]')).toHaveClass(/active/);
  await expect(page.locator('[data-mode="encode"]')).not.toHaveClass(/active/);
});

test('switching modes clears the output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#b64-input').fill('clear me');
  await page.locator('#convert-btn').click();
  await expect(page.locator('#b64-output')).not.toBeEmpty();

  await page.locator('[data-mode="decode"]').click();
  await expect(page.locator('#b64-output')).toBeEmpty();
});

test('placeholder text updates when switching modes', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#b64-input')).toHaveAttribute('placeholder', /encode/i);
  await page.locator('[data-mode="decode"]').click();
  await expect(page.locator('#b64-input')).toHaveAttribute('placeholder', /decode/i);
});
