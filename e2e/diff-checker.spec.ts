import { expect, test } from '@playwright/test';

const URL = '/tools/diff-checker';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Diff/);
});

test('shows two input panes on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#dc-original')).toBeVisible();
  await expect(page.locator('#dc-modified')).toBeVisible();
});

test('copy diff button is disabled on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#dc-copy-btn')).toBeDisabled();
});

test('inline mode button is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#dc-mode-inline')).toHaveClass(/dc-toggle--active/);
  await expect(page.locator('#dc-mode-side')).not.toHaveClass(/dc-toggle--active/);
});

test('shows placeholder text in output on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.dc-placeholder')).toBeVisible();
});

// ── Identical texts ───────────────────────────────────────────────────────────

test('shows identical message when both panes have same content', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('hello world');
  await page.locator('#dc-modified').fill('hello world');
  await expect(page.locator('.dc-identical')).toBeVisible();
  await expect(page.locator('.dc-identical')).toContainText('identical');
});

// ── Diff output ───────────────────────────────────────────────────────────────

test('shows diff output when texts differ', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('line one\nline two');
  await page.locator('#dc-modified').fill('line one\nline three');
  await expect(page.locator('.dc-pre')).toBeVisible();
});

test('shows added lines highlighted', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('aaa');
  await page.locator('#dc-modified').fill('aaa\nbbb');
  await expect(page.locator('.dc-row--added')).toBeVisible();
});

test('shows removed lines highlighted', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('aaa\nbbb');
  await page.locator('#dc-modified').fill('aaa');
  await expect(page.locator('.dc-row--removed')).toBeVisible();
});

test('shows +/- stats after diff', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('line1\nline2');
  await page.locator('#dc-modified').fill('line1\nline3');
  await expect(page.locator('#dc-stats')).toContainText('+');
  await expect(page.locator('#dc-stats')).toContainText('-');
});

test('copy diff button becomes enabled after diff', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('old text');
  await page.locator('#dc-modified').fill('new text');
  await expect(page.locator('#dc-copy-btn')).toBeEnabled();
});

// ── View modes ────────────────────────────────────────────────────────────────

test('switching to side-by-side mode re-renders diff', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('a\nb');
  await page.locator('#dc-modified').fill('a\nc');
  await page.locator('#dc-mode-side').click();
  await expect(page.locator('#dc-mode-side')).toHaveClass(/dc-toggle--active/);
  await expect(page.locator('.dc-side-table')).toBeVisible();
});

test('switching back to inline mode shows inline diff', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('x\ny');
  await page.locator('#dc-modified').fill('x\nz');
  await page.locator('#dc-mode-side').click();
  await page.locator('#dc-mode-inline').click();
  await expect(page.locator('#dc-mode-inline')).toHaveClass(/dc-toggle--active/);
  await expect(page.locator('.dc-pre')).toBeVisible();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy diff button copies plain diff to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#dc-original').fill('foo');
  await page.locator('#dc-modified').fill('bar');
  await page.locator('#dc-copy-btn').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text.length).toBeGreaterThan(0);
});

test('copy diff button shows "copied" feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await page.locator('#dc-original').fill('old');
  await page.locator('#dc-modified').fill('new');
  await page.locator('#dc-copy-btn').click();
  await expect(page.locator('#dc-copy-btn')).toHaveText('copied');
  await expect(page.locator('#dc-copy-btn')).toHaveText('copy diff', { timeout: 2000 });
});

// ── Clear buttons ─────────────────────────────────────────────────────────────

test('clear left button clears original pane', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-original').fill('some text');
  await page.locator('#dc-clear-left').click();
  await expect(page.locator('#dc-original')).toHaveValue('');
});

test('clear right button clears modified pane', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#dc-modified').fill('some text');
  await page.locator('#dc-clear-right').click();
  await expect(page.locator('#dc-modified')).toHaveValue('');
});
