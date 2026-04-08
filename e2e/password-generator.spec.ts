import { expect, test } from '@playwright/test';

const URL = '/tools/password-generator';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Password/);
});

test('shows generate button on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#generate-btn')).toBeVisible();
});

test('shows length slider and number input on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#length-slider')).toBeVisible();
  await expect(page.locator('#length-input')).toBeVisible();
});

test('default length is 20', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#length-input')).toHaveValue('20');
});

test('character set checkboxes are all checked by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#chk-upper')).toBeChecked();
  await expect(page.locator('#chk-lower')).toBeChecked();
  await expect(page.locator('#chk-digits')).toBeChecked();
  await expect(page.locator('#chk-symbols')).toBeChecked();
});

// ── Generate ──────────────────────────────────────────────────────────────────

test('generates a password on button click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#password-display')).not.toContainText('press generate');
  await expect(page.locator('#password-display')).not.toBeEmpty();
});

test('generated password has correct length', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#length-input').fill('16');
  await page.locator('#generate-btn').click();
  const password = await page.locator('#password-display').textContent();
  expect(password?.trim().length).toBe(16);
});

test('shows strength label after generating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#strength-label')).not.toBeEmpty();
});

test('shows entropy label after generating', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await expect(page.locator('#entropy-label')).not.toBeEmpty();
});

test('Ctrl+Enter generates a password', async ({ page }) => {
  await page.goto(URL);
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('#password-display')).not.toContainText('press generate');
});

test('copy button becomes enabled after generating', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#copy-btn')).toBeDisabled();
  await page.locator('#generate-btn').click();
  await expect(page.locator('#copy-btn')).toBeEnabled();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies password to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  const displayed = (await page.locator('#password-display').textContent())?.trim();
  await page.locator('#copy-btn').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(displayed);
});

test('copy button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#generate-btn').click();
  await page.locator('#copy-btn').click();
  await expect(page.locator('#copy-btn')).toHaveText('copied');
  await expect(page.locator('#copy-btn')).toHaveText('copy', { timeout: 2000 });
});

// ── Options ───────────────────────────────────────────────────────────────────

test('unchecking uppercase produces password without uppercase letters', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#chk-upper').uncheck();
  await page.locator('#chk-symbols').uncheck();
  await page.locator('#generate-btn').click();
  const password = (await page.locator('#password-display').textContent())?.trim() ?? '';
  expect(password).toMatch(/^[a-z0-9]+$/);
});

test('changing length via slider updates the number input', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#length-slider').fill('32');
  const value = await page.locator('#length-input').inputValue();
  expect(value).toBe('32');
});

// ── Batch mode ────────────────────────────────────────────────────────────────

test('batch section is hidden on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#batch-section')).toBeHidden();
});

test('generate batch button shows batch results', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#batch-count').fill('5');
  await page.locator('#batch-btn').click();
  await expect(page.locator('#batch-section')).toBeVisible();
  const items = page.locator('#batch-list .batch-row-item');
  await expect(items).toHaveCount(5);
});
