import { expect, test } from '@playwright/test';

const URL = '/tools/passkey-inspector';

// A known AAGUID for YubiKey 5 series
const YUBIKEY_AAGUID = 'cb69481e-8ff7-4039-93ec-0a2729a154a8';

// A real clientDataJSON (base64url) for testing
const SAMPLE_CLIENT_DATA_JSON =
  'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiYUJjRGVGZ0hpSmpLbExNbU5uT29QcFFyUnNTdFV1VnZXd1h4WXlaeiIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9';

// ── Page load ─────────────────────────────────────────────────────────────────

test('page has correct title', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Passkey/);
});

test('shows the four tab buttons on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-tab="aaguid"]')).toBeVisible();
  await expect(page.locator('[data-tab="webauthn"]')).toBeVisible();
  await expect(page.locator('[data-tab="clientdata"]')).toBeVisible();
  await expect(page.locator('[data-tab="playground"]')).toBeVisible();
});

test('AAGUID Lookup tab is active by default', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-tab="aaguid"]')).toHaveClass(/active/);
  await expect(page.locator('#tab-aaguid')).toBeVisible();
});

test('other panels are hidden on load', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#tab-webauthn')).toBeHidden();
  await expect(page.locator('#tab-clientdata')).toBeHidden();
  await expect(page.locator('#tab-playground')).toBeHidden();
});

// ── Tab switching ─────────────────────────────────────────────────────────────

test('clicking WebAuthn Decoder tab shows its panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="webauthn"]').click();
  await expect(page.locator('#tab-webauthn')).toBeVisible();
  await expect(page.locator('#tab-aaguid')).toBeHidden();
});

test('clicking ClientDataJSON tab shows its panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="clientdata"]').click();
  await expect(page.locator('#tab-clientdata')).toBeVisible();
  await expect(page.locator('#tab-aaguid')).toBeHidden();
});

test('clicking Playground tab shows its panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="playground"]').click();
  await expect(page.locator('#tab-playground')).toBeVisible();
});

test('clicking back to AAGUID tab shows AAGUID panel', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="webauthn"]').click();
  await page.locator('[data-tab="aaguid"]').click();
  await expect(page.locator('#tab-aaguid')).toBeVisible();
  await expect(page.locator('#tab-webauthn')).toBeHidden();
});

// ── AAGUID Lookup ─────────────────────────────────────────────────────────────

test('AAGUID input is visible on AAGUID tab', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#aaguid-input')).toBeVisible();
});

test('entering a valid AAGUID shows result', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#aaguid-input').fill(YUBIKEY_AAGUID);
  await expect(page.locator('#aaguid-result')).not.toBeHidden({ timeout: 3000 });
});

test('entering an unrecognized AAGUID shows unknown result', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#aaguid-input').fill('00000000-0000-0000-0000-000000000000');
  await expect(page.locator('#aaguid-result')).not.toBeHidden({ timeout: 3000 });
});

// ── ClientDataJSON tab ────────────────────────────────────────────────────────

test('ClientDataJSON textarea is visible on that tab', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="clientdata"]').click();
  await expect(page.locator('#clientdata-input')).toBeVisible();
});

test('pasting a valid clientDataJSON base64url shows decoded output', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="clientdata"]').click();
  await page.locator('#clientdata-input').fill(SAMPLE_CLIENT_DATA_JSON);
  await expect(page.locator('#clientdata-output')).not.toBeHidden({ timeout: 3000 });
  await expect(page.locator('#clientdata-output')).toContainText('origin');
});

// ── WebAuthn Decoder tab ──────────────────────────────────────────────────────

test('WebAuthn decode button is visible', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="webauthn"]').click();
  await expect(page.locator('#webauthn-decode-btn')).toBeVisible();
});

test('WebAuthn clear button resets the textarea', async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-tab="webauthn"]').click();
  await page.locator('#webauthn-input').fill('{"some":"json"}');
  await page.locator('#webauthn-clear-btn').click();
  await expect(page.locator('#webauthn-input')).toHaveValue('');
});
