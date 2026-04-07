/**
 * Fetches tool hit counts from Cloudflare KV and writes them to
 * src/data/tool-popularity.json before the Astro build.
 *
 * Required env vars:
 *   CLOUDFLARE_API_TOKEN   — API token with KV read permission
 *   CLOUDFLARE_ACCOUNT_ID  — Cloudflare account ID
 *   KV_NAMESPACE_ID        — The HITS namespace ID
 *
 * On any failure, writes {} so the build falls back to default tool ordering.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const OUTPUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/tool-popularity.json',
);

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, KV_NAMESPACE_ID } = process.env;

async function fetchPopularity() {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !KV_NAMESPACE_ID) {
    console.warn('[fetch-popularity] Missing env vars — writing empty popularity data.');
    return {};
  }

  const base = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}`;
  const headers = { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` };

  // List all keys in the namespace
  const listRes = await fetch(`${base}/keys`, { headers });
  if (!listRes.ok) {
    console.warn(`[fetch-popularity] KV list failed: ${listRes.status} ${listRes.statusText}`);
    return {};
  }

  const { result: keys } = await listRes.json();
  if (!Array.isArray(keys) || keys.length === 0) {
    console.log('[fetch-popularity] No keys in KV yet — writing empty popularity data.');
    return {};
  }

  // Fetch each key's value in parallel
  const entries = await Promise.all(
    keys.map(async ({ name }) => {
      const valRes = await fetch(`${base}/values/${encodeURIComponent(name)}`, { headers });
      if (!valRes.ok) return [name, 0];
      const text = await valRes.text();
      return [name, parseInt(text, 10) || 0];
    }),
  );

  return Object.fromEntries(entries);
}

try {
  const popularity = await fetchPopularity();
  writeFileSync(OUTPUT_PATH, JSON.stringify(popularity, null, 2) + '\n');
  const total = Object.values(popularity).reduce((s, n) => s + n, 0);
  console.log(
    `[fetch-popularity] Wrote ${Object.keys(popularity).length} tool(s) / ${total} total hits.`,
  );
} catch (err) {
  console.warn('[fetch-popularity] Unexpected error — writing empty popularity data.', err);
  writeFileSync(OUTPUT_PATH, '{}\n');
}
