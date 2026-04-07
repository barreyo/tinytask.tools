import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/tinytask\.tools/i);
});

// ── December seasonal effects ────────────────────────────────────────────────

function freezeDateToMonth(month: number) {
  // Overrides Date so getMonth() always returns the given 0-based month index.
  return `
    const _OrigDate = Date;
    class MockDate extends _OrigDate {
      constructor(...args) {
        if (args.length === 0) {
          super(2024, ${month}, 1);
        } else {
          super(...args);
        }
      }
      static now() { return new _OrigDate(2024, ${month}, 1).getTime(); }
    }
    window.Date = MockDate;
  `;
}

test('santa hat and snow are hidden outside December', async ({ page }) => {
  // Use July (month 6) as a representative non-December month.
  await page.addInitScript(freezeDateToMonth(6));
  await page.goto('/');

  await expect(page.locator('body')).not.toHaveClass(/is-december/);
  await expect(page.locator('.santa-hat')).toHaveCSS('display', 'none');
  await expect(page.locator('#snow-canvas')).toHaveCount(0);
});

test('santa hat is visible in December', async ({ page }) => {
  await page.addInitScript(freezeDateToMonth(11));
  await page.goto('/');

  await expect(page.locator('body')).toHaveClass(/is-december/);
  await expect(page.locator('.santa-hat')).toHaveCSS('display', 'block');
});

test('snow canvas is created in December', async ({ page }) => {
  await page.addInitScript(freezeDateToMonth(11));
  await page.goto('/');

  await expect(page.locator('#snow-canvas')).toHaveCount(1);
});
