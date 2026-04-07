import { expect, test } from '@playwright/test';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

test.beforeEach(async ({ page }) => {
  // Clear history between tests so each test starts with a clean state
  await page.goto('/tools/uuid-generator');
  await page.evaluate(() => localStorage.removeItem('tt_uuid_history'));
  await page.reload();
});

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/UUID Generator/);
});

test('generates a v4 UUID on load', async ({ page }) => {
  const output = page.locator('#uuid-output');
  const value = await output.textContent();
  expect(value?.trim()).toMatch(UUID_RE);
  expect(value?.charAt(14)).toBe('4');
});

// ── Type selector ─────────────────────────────────────────────────────────────

test('v4 button is active by default', async ({ page }) => {
  const v4Btn = page.locator('.type-btn[data-type="v4"]');
  await expect(v4Btn).toHaveClass(/active/);
});

test('switching to v1 generates a v1 UUID', async ({ page }) => {
  await page.click('.type-btn[data-type="v1"]');
  const value = await page.locator('#uuid-output').textContent();
  expect(value?.trim()).toMatch(UUID_RE);
  expect(value?.charAt(14)).toBe('1');
});

test('switching to v7 generates a v7 UUID', async ({ page }) => {
  await page.click('.type-btn[data-type="v7"]');
  const value = await page.locator('#uuid-output').textContent();
  expect(value?.trim()).toMatch(UUID_RE);
  expect(value?.charAt(14)).toBe('7');
});

test('switching to ulid generates a valid ULID', async ({ page }) => {
  await page.click('.type-btn[data-type="ulid"]');
  const value = await page.locator('#uuid-output').textContent();
  expect(value?.trim()).toMatch(ULID_RE);
});

// ── Namespace inputs (v3 / v5) ────────────────────────────────────────────────

test('namespace inputs are hidden for v4', async ({ page }) => {
  await expect(page.locator('#ns-inputs')).toBeHidden();
});

test('namespace inputs appear when v5 is selected', async ({ page }) => {
  await page.click('.type-btn[data-type="v5"]');
  await expect(page.locator('#ns-inputs')).toBeVisible();
});

test('namespace inputs appear when v3 is selected', async ({ page }) => {
  await page.click('.type-btn[data-type="v3"]');
  await expect(page.locator('#ns-inputs')).toBeVisible();
});

test('namespace inputs hide again after switching back to v4', async ({ page }) => {
  await page.click('.type-btn[data-type="v5"]');
  await expect(page.locator('#ns-inputs')).toBeVisible();
  await page.click('.type-btn[data-type="v4"]');
  await expect(page.locator('#ns-inputs')).toBeHidden();
});

test('custom namespace input appears when "custom…" is selected', async ({ page }) => {
  await page.click('.type-btn[data-type="v5"]');
  await page.selectOption('#ns-select', 'custom');
  await expect(page.locator('#custom-ns-wrap')).toBeVisible();
});

test('v5 with dns namespace and a name generates a deterministic UUID', async ({ page }) => {
  await page.click('.type-btn[data-type="v5"]');
  // Fill the name input and generate
  await page.fill('#ns-name', 'example.com');
  await page.click('#generate-btn');
  const first = (await page.locator('#uuid-output').textContent())?.trim();
  // Generate again with same inputs — v5 is deterministic
  await page.click('#generate-btn');
  const second = (await page.locator('#uuid-output').textContent())?.trim();
  expect(first).toBe(second);
  expect(first).toMatch(UUID_RE);
  expect(first?.charAt(14)).toBe('5');
});

// ── Generate button ───────────────────────────────────────────────────────────

test('generate button produces a new UUID each time', async ({ page }) => {
  const first = (await page.locator('#uuid-output').textContent())?.trim();
  await page.click('#generate-btn');
  const second = (await page.locator('#uuid-output').textContent())?.trim();
  // Extremely unlikely to collide for v4
  expect(first).not.toBe(second);
});

// ── Batch output ──────────────────────────────────────────────────────────────

test('batch output is hidden when count is 1', async ({ page }) => {
  await expect(page.locator('#batch-wrap')).toBeHidden();
});

test('batch generates the requested number of values', async ({ page }) => {
  await page.fill('#batch-count', '5');
  await page.click('#generate-btn');
  await expect(page.locator('#batch-wrap')).toBeVisible();
  const rows = page.locator('.batch-row');
  await expect(rows).toHaveCount(5);
});

test('each batch row contains a valid UUID', async ({ page }) => {
  await page.fill('#batch-count', '3');
  await page.click('#generate-btn');
  const values = await page.locator('.batch-value').allTextContents();
  expect(values).toHaveLength(3);
  for (const v of values) {
    expect(v.trim()).toMatch(UUID_RE);
  }
});

test('batch output is hidden again when switching back to count 1', async ({ page }) => {
  await page.fill('#batch-count', '3');
  await page.click('#generate-btn');
  await expect(page.locator('#batch-wrap')).toBeVisible();
  await page.fill('#batch-count', '1');
  await page.click('#generate-btn');
  await expect(page.locator('#batch-wrap')).toBeHidden();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button changes text to "copied" then reverts', async ({ page }) => {
  // Grant clipboard write permission
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  const copyBtn = page.locator('#copy-btn');
  await copyBtn.click();
  await expect(copyBtn).toHaveText('copied');
  await expect(copyBtn).toHaveText('copy', { timeout: 2000 });
});

test('copy all button changes text to "copied" then reverts', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  await page.fill('#batch-count', '3');
  await page.click('#generate-btn');
  const copyAllBtn = page.locator('#copy-all-btn');
  await copyAllBtn.click();
  await expect(copyAllBtn).toHaveText('copied');
  await expect(copyAllBtn).toHaveText('copy all', { timeout: 2000 });
});

test('download button triggers a file download with correct line count', async ({ page }) => {
  await page.fill('#batch-count', '5');
  await page.click('#generate-btn');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#download-all-btn'),
  ]);
  expect(download.suggestedFilename()).toMatch(/^v4-batch-5\.txt$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf-8');
  const lines = text.trim().split('\n');
  expect(lines).toHaveLength(5);
  for (const line of lines) {
    expect(line.trim()).toMatch(UUID_RE);
  }
});

// ── History ───────────────────────────────────────────────────────────────────

test('"no history yet" message is visible after clearing history', async ({ page }) => {
  // The page auto-generates one entry on load, so we need to clear first
  await page.click('#clear-history-btn');
  await expect(page.locator('#history-empty')).toBeVisible();
});

test('generating a UUID adds it to the history list', async ({ page }) => {
  await page.click('#generate-btn');
  const outputValue = (await page.locator('#uuid-output').textContent())?.trim();
  const historyValues = await page.locator('.history-value').allTextContents();
  expect(historyValues.some((v) => v.trim() === outputValue)).toBe(true);
});

test('history shows the correct type badge', async ({ page }) => {
  await page.click('.type-btn[data-type="v7"]');
  await page.click('#generate-btn');
  const badge = page.locator('.history-badge').first();
  await expect(badge).toHaveText('v7');
});

test('history persists across page reloads', async ({ page }) => {
  await page.click('#generate-btn');
  const outputValue = (await page.locator('#uuid-output').textContent())?.trim();
  await page.reload();
  const historyValues = await page.locator('.history-value').allTextContents();
  expect(historyValues.some((v) => v.trim() === outputValue)).toBe(true);
});

test('clear history button empties the list', async ({ page }) => {
  await page.click('#generate-btn');
  await expect(page.locator('.history-row')).not.toHaveCount(0);
  await page.click('#clear-history-btn');
  await expect(page.locator('.history-row')).toHaveCount(0);
  await expect(page.locator('#history-empty')).toBeVisible();
});

test('history copy button changes text to "copied"', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  await page.click('#generate-btn');
  const histCopyBtn = page.locator('.history-copy-btn').first();
  await histCopyBtn.click();
  await expect(histCopyBtn).toHaveText('copied');
  await expect(histCopyBtn).toHaveText('copy', { timeout: 2000 });
});

test('batch adds all generated values to history', async ({ page }) => {
  await page.fill('#batch-count', '4');
  await page.click('#generate-btn');
  const historyRows = page.locator('.history-row');
  // 4 from batch + 1 auto-generated on page load
  await expect(historyRows).toHaveCount(5);
});
