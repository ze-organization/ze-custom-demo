#!/usr/bin/env node

/**
 * Retry failed image downloads using Playwright browser context (cookies + currentSrc).
 *
 * Usage:
 *   node docs/ai/scripts/retry-image-downloads.mjs \
 *     --url https://www.coveo.com/ \
 *     --manifest docs/ai/demos/coveo/images/image-manifest.json \
 *     --images-dir docs/ai/demos/coveo/images
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const args = process.argv.slice(2);
function getArg(name, fallback = null) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--') ? args[idx + 1] : fallback;
}

const siteUrl = getArg('url', 'https://www.coveo.com/');
const manifestPath = getArg('manifest');
const imagesDir = getArg('images-dir');

if (!manifestPath || !imagesDir) {
  console.error('Usage: --manifest <path> --images-dir <dir> [--url URL]');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

const isBadSrc = (src) => {
  if (!src || src.startsWith('data:')) return true;
  // Truncated Cloudinary/srcset tokens without full asset path
  if (/\/c_scale$/.test(src)) return true;
  if (/\/d_placeholder\.png$/.test(src)) return true;
  if (/\/d_placeholder-svg\.svg$/.test(src)) return true;
  return false;
};

const extFromContentType = (ct, url) => {
  if (ct?.includes('svg')) return 'svg';
  if (ct?.includes('png')) return 'png';
  if (ct?.includes('webp')) return 'webp';
  if (ct?.includes('gif')) return 'gif';
  const ext = extname(new URL(url).pathname).replace('.', '').toLowerCase();
  if (ext && ext.length <= 5) return ext === 'jpeg' ? 'jpg' : ext;
  return 'jpg';
};

console.log(`[retry] Loading ${siteUrl} with Playwright...`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await context.newPage();

await page.goto(siteUrl, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);

// Dismiss cookie banners
await page.evaluate(() => {
  for (const sel of ['#onetrust-accept-btn-handler', '.cc-btn.cc-allow']) {
    try { document.querySelector(sel)?.click(); } catch {}
  }
});
await page.waitForTimeout(500);

// Scroll to load lazy content
await page.evaluate(async () => {
  const step = 400;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 250));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2000);

// Collect resolved image URLs from the live DOM + network
const liveUrls = await page.evaluate(() => {
  const urls = new Map();

  const add = (src, alt = '', type = 'live') => {
    if (!src || src.startsWith('data:')) return;
    try {
      const abs = new URL(src, location.href).href;
      if (!urls.has(abs)) urls.set(abs, { src: abs, alt, type });
    } catch {}
  };

  for (const img of document.querySelectorAll('img')) {
    add(img.currentSrc || img.src, img.alt || '', 'img-currentSrc');
    for (const attr of ['data-src', 'data-lazy-src', 'data-original']) {
      add(img.getAttribute(attr), img.alt || '', 'img-lazy');
    }
  }

  for (const source of document.querySelectorAll('picture source[srcset], picture source[data-srcset]')) {
    const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset') || '';
    for (const part of srcset.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      add(url, '', 'picture-srcset');
    }
  }

  for (const el of document.querySelectorAll('*')) {
    try {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        for (const m of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) add(m[1], '', 'background');
      }
    } catch {}
  }

  for (const entry of performance.getEntriesByType('resource')) {
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(entry.name) || entry.name.includes('/image/')) {
      add(entry.name, '', 'resource');
    }
  }

  return [...urls.values()];
});

console.log(`[retry] Collected ${liveUrls.length} live image URLs from page`);

// Build lookup: alt text -> url, filename fragment -> url
const byAlt = new Map();
const byFragment = new Map();
for (const item of liveUrls) {
  if (item.alt) byAlt.set(item.alt.toLowerCase().trim(), item.src);
  const parts = item.src.split('/');
  const frag = parts.slice(-3).join('/');
  byFragment.set(frag, item.src);
  byFragment.set(parts[parts.length - 1], item.src);
}

let retried = 0;
let downloaded = 0;
let stillFailed = 0;
let skipped = 0;

for (let i = 0; i < manifest.length; i++) {
  const entry = manifest[i];
  if (entry.status === 'downloaded' && entry.localFile && existsSync(join(imagesDir, entry.localFile))) {
    skipped++;
    continue;
  }
  if (entry.uploadStatus === 'uploaded') {
    skipped++;
    continue;
  }

  retried++;

  // Resolve a fetchable URL
  let fetchUrl = null;
  if (!isBadSrc(entry.src)) {
    fetchUrl = entry.src;
  }
  if (!fetchUrl && entry.alt) {
    fetchUrl = byAlt.get(entry.alt.toLowerCase().trim()) || null;
  }
  if (!fetchUrl && entry.src) {
    const tail = entry.src.split('/').slice(-2).join('/');
    fetchUrl = byFragment.get(tail) || byFragment.get(entry.src.split('/').pop()) || null;
  }
  // Match by library path fragment (e.g. blackwoods-logo-update)
  if (!fetchUrl && entry.src) {
    const libMatch = entry.src.match(/library\/(.+)$/);
    if (libMatch) {
      for (const item of liveUrls) {
        if (item.src.includes(libMatch[1])) {
          fetchUrl = item.src;
          break;
        }
      }
    }
  }

  if (!fetchUrl) {
    entry.status = 'failed';
    entry.error = entry.error || 'no-resolvable-url';
    stillFailed++;
    continue;
  }

  try {
    const response = await context.request.get(fetchUrl, {
      headers: { Referer: siteUrl },
      timeout: 30000,
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    const buffer = await response.body();
    if (buffer.length < 200 && !fetchUrl.includes('.svg')) {
      throw new Error('file too small');
    }

    const ct = response.headers()['content-type'] || '';
    const ext = extFromContentType(ct, fetchUrl);
    const safeName = entry.localFile || `section${entry.sectionPosition}-retry${i + 1}.${ext}`;
    const localPath = join(imagesDir, safeName);

    writeFileSync(localPath, buffer);

    entry.src = fetchUrl;
    entry.localFile = safeName;
    entry.extension = ext;
    entry.fileSize = buffer.length;
    entry.status = 'downloaded';
    entry.error = undefined;
    delete entry.uploadStatus;
    delete entry.assetId;
    delete entry.imageFieldXml;

    downloaded++;
    console.log(`  OK  ${safeName} (${(buffer.length / 1024).toFixed(1)} KB) — ${fetchUrl.substring(0, 80)}...`);
  } catch (err) {
    entry.status = 'failed';
    entry.error = err.message;
    stillFailed++;
    console.log(`  FAIL ${entry.alt || entry.src?.substring(0, 60)} — ${err.message}`);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('\n[retry] Summary');
console.log(`  Skipped (already OK): ${skipped}`);
console.log(`  Retried: ${retried}`);
console.log(`  Newly downloaded: ${downloaded}`);
console.log(`  Still failed: ${stillFailed}`);
console.log(`  Manifest: ${manifestPath}`);

await browser.close();
