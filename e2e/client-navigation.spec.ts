import { expect, test, type Page } from '@playwright/test';

/**
 * Uncaught exceptions (e.g. null.addEventListener in astro:page-load handlers) do not
 * fail Playwright by default. Attach this before any navigation in tests that should
 * be free of page JS errors.
 */
function failOnPageError(page: Page) {
  page.on('pageerror', (error) => {
    throw error;
  });
}

function expectHomePath(page: Page) {
  return expect(page).toHaveURL((url: URL) => url.pathname === '/');
}

test.describe('Astro client router (regression)', () => {
  test.beforeEach(({ page }) => {
    failOnPageError(page);
  });

  test('home → tool via tool card causes no uncaught errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.tool-grid')).toBeVisible();

    await page.locator('a.tool-card[href="/tools/uuid-generator"]').click();
    await expect(page).toHaveURL(/\/tools\/uuid-generator\/?$/);
    await expect(page.getByRole('heading', { name: /^UUID Generator$/ })).toBeVisible();
  });

  test('home → tool → home via back link causes no uncaught errors', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.tool-card[href="/tools/base64"]').click();
    await expect(page).toHaveURL(/\/tools\/base64\/?$/);

    await page.locator('a.back-link').click();
    await expectHomePath(page);
    await expect(page.locator('.tool-grid')).toBeVisible();
    await expect(page.locator('#search-panel')).toBeAttached();
  });

  test('repeated client navigations do not throw', async ({ page }) => {
    await page.goto('/');

    for (let i = 0; i < 3; i++) {
      await page.locator('a.tool-card[href="/tools/uuid-generator"]').click();
      await expect(page).toHaveURL(/\/tools\/uuid-generator\/?$/);

      await page.locator('a.back-link').click();
      await expectHomePath(page);
      await expect(page.locator('.tool-grid')).toBeVisible();
    }
  });

  test('tool page → home → different tool (no full reload between)', async ({ page }) => {
    await page.goto('/tools/hash-generator');
    await expect(page).toHaveURL(/\/tools\/hash-generator\/?$/);

    await page.locator('a.back-link').click();
    await expectHomePath(page);

    await page.locator('a.tool-card[href="/tools/url-encoder"]').click();
    await expect(page).toHaveURL(/\/tools\/url-encoder\/?$/);
    await expect(page.getByRole('heading', { name: /URL Encoder/i })).toBeVisible();
  });

  test('open and close search panel then client-navigate away', async ({ page }) => {
    await page.goto('/');
    await page.locator('#search-trigger').click();
    await expect(page.locator('#search-panel')).toHaveAttribute('aria-hidden', 'false');

    await page.keyboard.press('Escape');
    await expect(page.locator('#search-panel')).toHaveAttribute('aria-hidden', 'true');

    await page.locator('a.tool-card[href="/tools/crontab"]').click();
    await expect(page).toHaveURL(/\/tools\/crontab\/?$/);
  });

  test('cross-tool via home does not throw', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.tool-card[href="/tools/timestamp"]').click();
    await expect(page).toHaveURL(/\/tools\/timestamp\/?$/);

    await page.locator('a.back-link').click();
    await expect(page.locator('.tool-grid')).toBeVisible();

    await page.locator('a.tool-card[href="/tools/json-formatter"]').click();
    await expect(page).toHaveURL(/\/tools\/json-formatter\/?$/);
  });
});
