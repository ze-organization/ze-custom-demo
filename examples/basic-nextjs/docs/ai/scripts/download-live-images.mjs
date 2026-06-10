#!/usr/bin/env node

/**
 * Download all resolvable images from a live page via Playwright.
 * Skips truncated/broken CDN tokens; uses currentSrc + network resources.
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const args = process.argv.slice(2);
function getArg(name, fallback = null) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--') ? args[idx + 1] : fallback;
}

const siteUrl = getArg('url', 'https://www.coveo.com/en');
const imagesDir = getArg('images-dir');
const manifestPath = getArg('manifest');

if (!imagesDir || !manifestPath) {
  console.error('Usage: --images-dir DIR --manifest PATH [--url URL]');
  process.exit(1);
}

mkdirSync(imagesDir, { recursive: true });

const isBadSrc = (src) => {
  if (!src || src.startsWith('data:')) return true;
  if (/\/c_scale(\?|$)/.test(src)) return true;
  if (/\/d_placeholder\.png(\?|$)/.test(src)) return true;
  if (/\/d_placeholder-svg\.svg(\?|$)/.test(src)) return true;
  return false;
};

const extFrom = (ct, url) => {
  if (ct?.includes('svg')) return 'svg';
  if (ct?.includes('png')) return 'png';
  if (ct?.includes('webp')) return 'webp';
  if (ct?.includes('gif')) return 'gif';
  const ext = extname(new URL(url).pathname).replace('.', '').toLowerCase();
  if (ext && ext.length <= 5) return ext === 'jpeg' ? 'jpg' : ext;
  return 'jpg';
};

console.log(`[live-dl] ${siteUrl}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await context.newPage();

await page.goto(siteUrl, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);
await page.evaluate(() => {
  try { document.querySelector('#onetrust-accept-btn-handler')?.click(); } catch {}
});
await page.waitForTimeout(500);

await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 200));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2000);

const candidates = await page.evaluate(() => {
  const map = new Map();
  const add = (src, alt = '', type = '') => {
    if (!src || src.startsWith('data:')) return;
    try {
      const abs = new URL(src, location.href).href;
      if (!map.has(abs)) map.set(abs, { src: abs, alt, type });
    } catch {}
  };

  for (const img of document.querySelectorAll('img')) {
    add(img.currentSrc || img.src, img.alt || '', 'img');
  }
  for (const entry of performance.getEntriesByType('resource')) {
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(entry.name) || /\/image\//.test(entry.name)) {
      add(entry.name, '', 'resource');
    }
  }
  return [...map.values()];
});

const filtered = candidates.filter((c) => !isBadSrc(c.src));
console.log(`[live-dl] ${filtered.length} resolvable URLs (${candidates.length} total)`);

const manifest = [];
let ok = 0;
let fail = 0;

for (let i = 0; i < filtered.length; i++) {
  const item = filtered[i];
  try {
    const res = await context.request.get(item.src, { headers: { Referer: siteUrl }, timeout: 30000 });
    if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
    const buf = await res.body();
    const ct = res.headers()['content-type'] || '';
    const ext = extFrom(ct, item.src);
    if (buf.length < 150 && ext !== 'svg') continue;

    const name = `live-${String(i + 1).padStart(3, '0')}.${ext}`;
    writeFileSync(join(imagesDir, name), buf);

    manifest.push({
      src: item.src,
      alt: item.alt,
      localFile: name,
      extension: ext,
      sectionPosition: null,
      type: item.type,
      fileSize: buf.length,
      status: 'downloaded',
    });
    ok++;
    if (ok <= 20 || ok % 25 === 0) {
      console.log(`  OK  ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
  } catch (e) {
    fail++;
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\n[live-dl] Downloaded ${ok}, failed ${fail}`);
console.log(`[live-dl] Manifest: ${manifestPath}`);

await browser.close();
