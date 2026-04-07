import { expect, test } from '@playwright/test';

const URL = '/tools/hash-generator';

const MD5_RE = /^[0-9a-f]{32}$/;
const SHA1_RE = /^[0-9a-f]{40}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;
const SHA384_RE = /^[0-9a-f]{96}$/;
const SHA512_RE = /^[0-9a-f]{128}$/;

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('tt_hash_history'));
  await page.reload();
});

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/Hash Generator/);
});

test('all algorithm rows are visible on load', async ({ page }) => {
  for (const algo of ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
    await expect(page.locator(`.hash-algo:text("${algo}")`)).toBeVisible();
  }
});

test('output values show placeholder dash on load', async ({ page }) => {
  for (const algo of ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
    const value = await page.locator(`#result-${algo}`).textContent();
    expect(value?.trim()).toBe('—');
  }
});

test('copy buttons are disabled on load', async ({ page }) => {
  const copyBtns = page.locator('.hash-copy-btn');
  const count = await copyBtns.count();
  expect(count).toBe(5);
  for (let i = 0; i < count; i++) {
    await expect(copyBtns.nth(i)).toBeDisabled();
  }
});

test('history section shows empty state on load', async ({ page }) => {
  await expect(page.locator('#history-empty')).toBeVisible();
});

// ── Generate ──────────────────────────────────────────────────────────────────

test('generate button produces hashes for all algorithms', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();

  await expect(page.locator('#result-MD5')).not.toHaveText('—');
  await expect(page.locator('#result-SHA-1')).not.toHaveText('—');
  await expect(page.locator('#result-SHA-256')).not.toHaveText('—');
  await expect(page.locator('#result-SHA-384')).not.toHaveText('—');
  await expect(page.locator('#result-SHA-512')).not.toHaveText('—');
});

test('generated MD5 hash is valid hex of correct length', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-MD5').textContent();
  expect(value?.trim()).toMatch(MD5_RE);
});

test('generated SHA-1 hash is valid hex of correct length', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-SHA-1').textContent();
  expect(value?.trim()).toMatch(SHA1_RE);
});

test('generated SHA-256 hash is valid hex of correct length', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-SHA-256').textContent();
  expect(value?.trim()).toMatch(SHA256_RE);
});

test('generated SHA-384 hash is valid hex of correct length', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-SHA-384').textContent();
  expect(value?.trim()).toMatch(SHA384_RE);
});

test('generated SHA-512 hash is valid hex of correct length', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-SHA-512').textContent();
  expect(value?.trim()).toMatch(SHA512_RE);
});

test('MD5 of "hello" matches known value', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-MD5').textContent();
  expect(value?.trim()).toBe('5d41402abc4b2a76b9719d911017c592');
});

test('SHA-256 of "hello" matches known value', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-SHA-256').textContent();
  expect(value?.trim()).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
});

test('empty input does nothing', async ({ page }) => {
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-MD5').textContent();
  expect(value?.trim()).toBe('—');
});

test('whitespace-only input does nothing', async ({ page }) => {
  await page.locator('#hash-input').fill('   ');
  await page.locator('#generate-btn').click();
  const value = await page.locator('#result-MD5').textContent();
  expect(value?.trim()).toBe('—');
});

// ── Keyboard shortcut ─────────────────────────────────────────────────────────

test('Ctrl+Enter triggers generation', async ({ page }) => {
  await page.locator('#hash-input').fill('keyboard test');
  await page.locator('#hash-input').press('Control+Enter');
  await expect(page.locator('#result-MD5')).not.toHaveText('—');
});

test('Meta+Enter triggers generation', async ({ page }) => {
  await page.locator('#hash-input').fill('meta test');
  await page.locator('#hash-input').press('Meta+Enter');
  await expect(page.locator('#result-MD5')).not.toHaveText('—');
});

// ── Copy buttons ──────────────────────────────────────────────────────────────

test('copy buttons become enabled after generating', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const copyBtns = page.locator('.hash-copy-btn');
  const count = await copyBtns.count();
  for (let i = 0; i < count; i++) {
    await expect(copyBtns.nth(i)).toBeEnabled();
  }
});

test('copy button briefly shows "copied" feedback', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  const copyBtn = page.locator('[data-algo="SHA-256"].hash-copy-btn');
  await copyBtn.click();
  await expect(copyBtn).toHaveText('copied');
  await expect(copyBtn).toHaveText('copy', { timeout: 2000 });
});

// ── Clear input ───────────────────────────────────────────────────────────────

test('clear input button resets textarea', async ({ page }) => {
  await page.locator('#hash-input').fill('some text');
  await page.locator('#clear-input-btn').click();
  await expect(page.locator('#hash-input')).toHaveValue('');
});

test('clear input button resets output to dashes', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  await expect(page.locator('#result-MD5')).not.toHaveText('—');
  await page.locator('#clear-input-btn').click();
  await expect(page.locator('#result-MD5')).toHaveText('—');
});

test('clear input disables copy buttons', async ({ page }) => {
  await page.locator('#hash-input').fill('hello');
  await page.locator('#generate-btn').click();
  await page.locator('#clear-input-btn').click();
  const copyBtns = page.locator('.hash-copy-btn');
  const count = await copyBtns.count();
  for (let i = 0; i < count; i++) {
    await expect(copyBtns.nth(i)).toBeDisabled();
  }
});

// ── History ───────────────────────────────────────────────────────────────────

test('generating adds an entry to history', async ({ page }) => {
  await page.locator('#hash-input').fill('history test');
  await page.locator('#generate-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await expect(page.locator('#history-empty')).toBeHidden();
});

test('multiple generations add multiple history entries', async ({ page }) => {
  await page.locator('#hash-input').fill('first');
  await page.locator('#generate-btn').click();
  await page.locator('#hash-input').fill('second');
  await page.locator('#generate-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(2);
});

test('history persists across page reload', async ({ page }) => {
  await page.locator('#hash-input').fill('persist me');
  await page.locator('#generate-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.history-row')).toHaveCount(1);
});

test('clear history button removes all entries', async ({ page }) => {
  await page.locator('#hash-input').fill('to clear');
  await page.locator('#generate-btn').click();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await page.locator('#clear-history-btn').click();
  await expect(page.locator('#history-empty')).toBeVisible();
  await expect(page.locator('.history-row')).toHaveCount(0);
});

test('history stays cleared after reload', async ({ page }) => {
  await page.locator('#hash-input').fill('temporary');
  await page.locator('#generate-btn').click();
  await page.locator('#clear-history-btn').click();
  await page.reload();
  await expect(page.locator('#history-empty')).toBeVisible();
});

test('history row contains a copy button', async ({ page }) => {
  await page.locator('#hash-input').fill('copy history');
  await page.locator('#generate-btn').click();
  await expect(page.locator('.history-copy-btn')).toHaveCount(1);
});
