import { expect, test } from '@playwright/test';

const URL = '/tools/luhn-checker';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Luhn/);
});

test('shows validate and generate sections on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#lu-validate-input')).toBeVisible();
  await expect(page.locator('#lu-gen-btn')).toBeVisible();
});

test('badge shows dash on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#lu-badge')).toHaveText('—');
});

// ── Validate ──────────────────────────────────────────────────────────────────

test('shows "valid" badge for a known-valid card number', async ({ page }) => {
  await page.goto(URL);
  // Classic Visa test number
  await page.locator('#lu-validate-input').fill('4111111111111111');
  await expect(page.locator('#lu-badge')).toHaveText('valid');
  await expect(page.locator('#lu-badge')).toHaveClass(/lu-badge--valid/);
});

test('shows "invalid" badge for a known-invalid number', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-validate-input').fill('1234567890123456');
  await expect(page.locator('#lu-badge')).toHaveText('invalid');
  await expect(page.locator('#lu-badge')).toHaveClass(/lu-badge--invalid/);
});

test('shows breakdown grid after entering a number', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-validate-input').fill('4111111111111111');
  await expect(page.locator('#lu-breakdown')).not.toBeEmpty();
});

test('shows sum line in breakdown', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-validate-input').fill('4111111111111111');
  await expect(page.locator('#lu-breakdown')).toContainText('sum =');
});

test('formats input with spaces as 4-digit groups', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-validate-input').fill('4111111111111111');
  const value = await page.locator('#lu-validate-input').inputValue();
  expect(value).toContain(' ');
});

test('badge resets to dash when input is cleared', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-validate-input').fill('4111111111111111');
  await expect(page.locator('#lu-badge')).toHaveText('valid');
  await page.locator('#lu-validate-input').fill('');
  await expect(page.locator('#lu-badge')).toHaveText('—');
});

// ── Generate test number ──────────────────────────────────────────────────────

test('generates a valid 16-digit number from a Visa prefix', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-iin').fill('4');
  await page.locator('#lu-gen-btn').click();
  await expect(page.locator('#lu-gen-output')).not.toBeEmpty();
  await expect(page.locator('.lu-gen-number')).toBeVisible();
});

test('generated number passes Luhn validation when entered in the validator', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-iin').fill('4');
  await page.locator('#lu-gen-btn').click();
  const generated = await page.locator('.lu-gen-number').textContent();
  const digits = generated?.replace(/\D/g, '') ?? '';
  expect(digits.length).toBeGreaterThan(0);

  await page.locator('#lu-validate-input').fill(digits);
  await expect(page.locator('#lu-badge')).toHaveText('valid');
});

test('shows error when IIN prefix is missing', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-gen-btn').click();
  await expect(page.locator('.lu-gen-error')).toBeVisible();
});

test('generates copy button in output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#lu-iin').fill('51');
  await page.locator('#lu-gen-btn').click();
  await expect(page.locator('.lu-copy-gen')).toBeVisible();
});

test('copy button in generate output copies to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#lu-iin').fill('4');
  await page.locator('#lu-gen-btn').click();
  await page.locator('.lu-copy-gen').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text.replace(/\D/g, '').length).toBeGreaterThan(10);
});
