import { expect, test, type Page } from '@playwright/test';

const URL = '/tools/crontab';

async function fillExpression(page: Page, expr: string) {
  const [minute, hour, dom, month, dow] = expr.trim().split(/\s+/);
  await page.locator('#cron-minute').fill(minute ?? '');
  await page.locator('#cron-hour').fill(hour ?? '');
  await page.locator('#cron-dom').fill(dom ?? '');
  await page.locator('#cron-month').fill(month ?? '');
  await page.locator('#cron-dow').fill(dow ?? '');
}

// ── Page load ─────────────────────────────────────────────────────────────────

test('page loads with correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Crontab Calculator/);
});

test('page shows the tool heading', async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByRole('heading', { name: /Crontab Calculator/i })).toBeVisible();
});

// ── Default state ─────────────────────────────────────────────────────────────

test('fields are pre-populated with the example expression', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cron-minute')).toHaveValue('0');
  await expect(page.locator('#cron-hour')).toHaveValue('9');
  await expect(page.locator('#cron-dom')).toHaveValue('*');
  await expect(page.locator('#cron-month')).toHaveValue('*');
  await expect(page.locator('#cron-dow')).toHaveValue('1-5');
});

test('description is visible on load from the default expression', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cron-description')).not.toBeEmpty();
});

test('breakdown section is visible on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cron-breakdown-section')).toBeVisible();
});

test('breakdown shows 5 field rows', async ({ page }) => {
  await page.goto(URL);
  const rows = page.locator('.breakdown-row');
  await expect(rows).toHaveCount(5);
});

test('next triggers section is visible on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cron-next-section')).toBeVisible();
});

test('next triggers list shows 5 items', async ({ page }) => {
  await page.goto(URL);
  const items = page.locator('.next-item');
  await expect(items).toHaveCount(5);
});

// ── Parsing ───────────────────────────────────────────────────────────────────

test('typing a new expression and clicking parse updates the description', async ({ page }) => {
  await page.goto(URL);
  await fillExpression(page, '* * * * *');
  await page.locator('#cron-parse-btn').click();
  await expect(page.locator('#cron-description')).toHaveText('Every minute');
});

test('pressing Enter in a field triggers parse', async ({ page }) => {
  await page.goto(URL);
  await fillExpression(page, '0 0 * * *');
  await page.locator('#cron-minute').press('Enter');
  await expect(page.locator('#cron-description')).not.toBeEmpty();
  await expect(page.locator('#cron-error')).toBeHidden();
});

test('description reflects the parsed expression', async ({ page }) => {
  await page.goto(URL);
  await fillExpression(page, '*/15 * * * *');
  await page.locator('#cron-parse-btn').click();
  const desc = await page.locator('#cron-description').textContent();
  expect(desc?.toLowerCase()).toMatch(/15 minute/);
});

// ── Error handling ────────────────────────────────────────────────────────────

test('invalid expression shows error message', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cron-minute').fill('not');
  await page.locator('#cron-parse-btn').click();
  await expect(page.locator('#cron-error')).toBeVisible();
  await expect(page.locator('#cron-description')).toBeHidden();
});

test('error shows for out-of-range field', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cron-minute').fill('60');
  await page.locator('#cron-parse-btn').click();
  await expect(page.locator('#cron-error')).toBeVisible();
  await expect(page.locator('#cron-error')).toContainText(/Minute/i);
});

test('error clears when a valid expression is parsed after an invalid one', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cron-minute').fill('99');
  await page.locator('#cron-parse-btn').click();
  await expect(page.locator('#cron-error')).toBeVisible();

  await fillExpression(page, '0 12 * * *');
  await page.locator('#cron-parse-btn').click();
  await expect(page.locator('#cron-error')).toBeHidden();
  await expect(page.locator('#cron-description')).not.toBeEmpty();
});

test('breakdown and next triggers are hidden when expression is invalid', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cron-minute').fill('wrong');
  await page.locator('#cron-parse-btn').click();
  await expect(page.locator('#cron-breakdown-section')).toBeHidden();
  await expect(page.locator('#cron-next-section')).toBeHidden();
});

// ── Copy button ───────────────────────────────────────────────────────────────

test('copy button copies the description to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await fillExpression(page, '* * * * *');
  await page.locator('#cron-parse-btn').click();
  await page.locator('#cron-copy-btn').click();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('Every minute');
});

test('copy button text changes to "copied" then reverts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  await fillExpression(page, '* * * * *');
  await page.locator('#cron-parse-btn').click();
  await page.locator('#cron-copy-btn').click();
  await expect(page.locator('#cron-copy-btn')).toHaveText('copied');
  await expect(page.locator('#cron-copy-btn')).toHaveText('copy', { timeout: 3000 });
});

// ── Clear button ──────────────────────────────────────────────────────────────

test('clear button empties all fields and hides results', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cron-description')).not.toBeEmpty();

  await page.locator('#cron-clear-btn').click();
  await expect(page.locator('#cron-minute')).toHaveValue('');
  await expect(page.locator('#cron-hour')).toHaveValue('');
  await expect(page.locator('#cron-result')).toBeHidden();
  await expect(page.locator('#cron-breakdown-section')).toBeHidden();
  await expect(page.locator('#cron-next-section')).toBeHidden();
});

// ── Presets ───────────────────────────────────────────────────────────────────

test('preset buttons are rendered', async ({ page }) => {
  await page.goto(URL);
  const presets = page.locator('.preset-btn');
  await expect(presets).toHaveCount(7);
});

test('clicking "every minute" preset sets the expression and parses', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.preset-btn[data-expr="* * * * *"]').click();
  await expect(page.locator('#cron-minute')).toHaveValue('*');
  await expect(page.locator('#cron-hour')).toHaveValue('*');
  await expect(page.locator('#cron-dom')).toHaveValue('*');
  await expect(page.locator('#cron-month')).toHaveValue('*');
  await expect(page.locator('#cron-dow')).toHaveValue('*');
  await expect(page.locator('#cron-description')).toHaveText('Every minute');
});

test('clicking "hourly" preset sets the correct expression', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.preset-btn[data-expr="0 * * * *"]').click();
  await expect(page.locator('#cron-minute')).toHaveValue('0');
  await expect(page.locator('#cron-hour')).toHaveValue('*');
  await expect(page.locator('#cron-dom')).toHaveValue('*');
  await expect(page.locator('#cron-month')).toHaveValue('*');
  await expect(page.locator('#cron-dow')).toHaveValue('*');
  await expect(page.locator('#cron-description')).not.toBeEmpty();
  await expect(page.locator('#cron-error')).toBeHidden();
});

test('clicking a preset auto-parses and shows breakdown', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.preset-btn[data-expr="0 0 * * *"]').click();
  await expect(page.locator('#cron-breakdown-section')).toBeVisible();
  await expect(page.locator('.breakdown-row')).toHaveCount(5);
});

// ── Breakdown content ─────────────────────────────────────────────────────────

test('breakdown rows display field name, raw value, and meaning', async ({ page }) => {
  await page.goto(URL);
  await fillExpression(page, '0 9 * * 1-5');
  await page.locator('#cron-parse-btn').click();

  const firstRow = page.locator('.breakdown-row').first();
  await expect(firstRow.locator('.bd-field')).toBeVisible();
  await expect(firstRow.locator('.bd-value')).toBeVisible();
  await expect(firstRow.locator('.bd-meaning')).toBeVisible();
});

test('breakdown shows the raw cron value in the value cell', async ({ page }) => {
  await page.goto(URL);
  await fillExpression(page, '*/15 * * * *');
  await page.locator('#cron-parse-btn').click();

  const minuteRow = page.locator('.breakdown-row').first();
  await expect(minuteRow.locator('.bd-value')).toHaveText('*/15');
});

// ── Next triggers content ─────────────────────────────────────────────────────

test('next trigger items contain formatted date strings', async ({ page }) => {
  await page.goto(URL);
  await fillExpression(page, '* * * * *');
  await page.locator('#cron-parse-btn').click();

  const items = page.locator('.next-item');
  await expect(items).toHaveCount(5);

  const firstText = await items.first().textContent();
  // Should contain a year like 2026
  expect(firstText).toMatch(/20\d{2}/);
});
