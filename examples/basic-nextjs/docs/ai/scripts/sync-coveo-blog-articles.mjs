#!/usr/bin/env node

/**
 * Scrape Coveo blog articles, download hero images, upload to Content Hub,
 * and emit Sitecore update payloads for main-website article pages.
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync, createWriteStream } from 'fs';
import { join, basename } from 'path';
import https from 'https';
import http from 'http';

const OUTPUT_DIR = join(process.cwd(), 'docs/ai/demos/coveo/blog-sync');
const IMAGES_DIR = join(OUTPUT_DIR, 'images');

const ARTICLE_MAP = [
  {
    itemId: 'c56d8083-cb80-4178-922c-bcbc6c3ddf36',
    url: 'https://www.coveo.com/blog/building-a-search-agent/',
  },
  {
    itemId: '8ca60486-f3eb-402e-8900-2812d350f8eb',
    url: 'https://www.coveo.com/blog/conversational-rag/',
  },
  {
    itemId: 'ff71e139-a53f-449d-8e49-741fca3b1494',
    url: 'https://www.coveo.com/blog/conversational-commerce-is-changing-how-shoppers-decide/',
  },
  {
    itemId: '4d596024-c28c-48c9-afd1-5eff83c7de58',
    url: 'https://www.coveo.com/blog/payloads-events-state-how-coveo-builds-trusted-data/',
  },
  {
    itemId: 'a9aec259-10a5-440f-afe5-ab303b50b7ec',
    url: 'https://www.coveo.com/blog/offline-purchase-ingestion/',
  },
  {
    itemId: 'd3c81d17-ee77-4e1e-80f7-fd3737a86624',
    url: 'https://www.coveo.com/blog/it-helpdesk-specialist/',
  },
  {
    itemId: 'd2fcf69c-2706-46ac-aeb1-7855a7551b6b',
    url: 'https://www.coveo.com/blog/multi-market-support/',
  },
  {
    itemId: '4ef19e90-fe3f-4c48-b5ad-e91d095b9d1e',
    url: 'https://www.coveo.com/blog/agentic-commerce-unpacked/',
  },
  {
    itemId: '06c734d0-1a60-405a-b6a7-5cc8bed2fd0d',
    url: 'https://www.coveo.com/blog/site-search-best-practices/',
  },
  {
    itemId: 'f14e6731-385e-45d4-bba0-15c5396474ce',
    url: 'https://www.coveo.com/blog/coveo-conversational-search/',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const protocol = parsed.protocol === 'https:' ? https : http;
    const file = createWriteStream(dest);
    protocol
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          downloadFile(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', reject);
  });
}

function toSitecoreDate(dateStr) {
  // "Jun 9, 2026" -> 20260609T000000Z
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}T000000Z`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function extractArticle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2500);

  return page.evaluate(() => {
    const textOf = (el) => el?.textContent?.replace(/\s+/g, ' ').trim() || '';

    const h1 = textOf(document.querySelector('h1'));
    const metaDesc =
      document.querySelector('meta[name="description"]')?.content ||
      document.querySelector('meta[property="og:description"]')?.content ||
      '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';

    const categoryLink = [...document.querySelectorAll('a[href*="/blog/category/"]')]
      .map((a) => ({ text: textOf(a), href: a.getAttribute('href') || '' }))
      .find((a) => a.text && !['Platform', 'Blog'].includes(a.text));

    const category = categoryLink?.text || '';

    const bodyRoot =
      document.querySelector('.blog-article-content') ||
      document.querySelector('[class*="article-content"]') ||
      document.querySelector('article') ||
      document.querySelector('main');

    const metaText = bodyRoot ? textOf(bodyRoot) : '';
    const readTimeMatch = document.body.innerText.match(/(\d+)\s*min\s*read/i);
    const readTime = readTimeMatch ? `${readTimeMatch[1]} min read` : '';

    const dateMatch = document.body.innerText.match(
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/
    );
    const publicationDate = dateMatch ? dateMatch[0] : '';

    const byMatch = document.body.innerText.match(/By\s+([^\n|]+)/i);
    const authorName = byMatch ? byMatch[1].replace(/\s+/g, ' ').trim() : '';

    const authorImg = [...document.querySelectorAll('img')].find((img) => {
      const src = img.src || '';
      return src.includes('blogprod/') && !src.includes('logo');
    });

    const heroImg =
      ogImage ||
      [...document.querySelectorAll('img')].find((img) => {
        const src = img.src || '';
        return (
          (src.includes('wpengine') || src.includes('coveoblog')) &&
          !src.includes('logo') &&
          (img.naturalWidth || img.width || 0) > 200
        );
      })?.src ||
      '';

    const headings = bodyRoot
      ? [...bodyRoot.querySelectorAll('h2, h3')]
          .map((h) => textOf(h))
          .filter((t) => t.length > 2 && t.length < 120)
          .slice(0, 12)
      : [];

    const blocks = [];
    if (bodyRoot) {
      const nodes = [...bodyRoot.querySelectorAll('p, h2, h3, ul, ol, blockquote')];
      for (const node of nodes) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'p') {
          const t = textOf(node);
          if (t.length > 20) blocks.push({ tag: 'p', text: t });
        } else if (tag === 'h2' || tag === 'h3') {
          const t = textOf(node);
          if (t) blocks.push({ tag, text: t });
        } else if (tag === 'ul' || tag === 'ol') {
          const items = [...node.querySelectorAll('li')]
            .map((li) => textOf(li))
            .filter(Boolean)
            .slice(0, 8);
          if (items.length) blocks.push({ tag, items });
        } else if (tag === 'blockquote') {
          const t = textOf(node);
          if (t.length > 20) blocks.push({ tag: 'blockquote', text: t });
        }
        if (blocks.length >= 40) break;
      }
    }

    return {
      h1,
      metaDesc,
      ogImage,
      heroImg,
      category,
      readTime,
      publicationDate,
      authorName,
      authorImg: authorImg?.src || '',
      headings,
      blocks,
    };
  });
}

function blocksToRichText(blocks) {
  const parts = ['<div class="ck-content">'];
  for (const block of blocks) {
    if (block.tag === 'p') {
      parts.push(`<p>${escapeHtml(block.text)}</p>`);
    } else if (block.tag === 'h2' || block.tag === 'h3') {
      parts.push(`<${block.tag}>${escapeHtml(block.text)}</${block.tag}>`);
    } else if (block.tag === 'blockquote') {
      parts.push(`<blockquote><p>${escapeHtml(block.text)}</p></blockquote>`);
    } else if (block.tag === 'ul' || block.tag === 'ol') {
      const items = block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');
      parts.push(`<${block.tag}>${items}</${block.tag}>`);
    }
  }
  parts.push('</div>');
  return parts.join('');
}

function headingsToTakeaways(headings) {
  if (!headings.length) return '';
  const items = headings.map((h) => `<li>${escapeHtml(h)}</li>`).join('');
  return `<div class="ck-content"><ul>${items}</ul></div>`;
}

mkdirSync(IMAGES_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

for (const entry of ARTICLE_MAP) {
  console.log(`[scrape] ${entry.url}`);
  try {
    const data = await extractArticle(page, entry.url);
    const slug = basename(new URL(entry.url).pathname);
    let localHeroFile = '';
    let heroStatus = 'skipped';

    if (data.heroImg) {
      const ext = data.heroImg.includes('.png') ? 'png' : data.heroImg.includes('.webp') ? 'webp' : 'jpg';
      localHeroFile = `${slug}-hero.${ext}`;
      const dest = join(IMAGES_DIR, localHeroFile);
      try {
        await downloadFile(data.heroImg, dest);
        heroStatus = 'downloaded';
        console.log(`  hero: ${localHeroFile}`);
      } catch (err) {
        heroStatus = 'failed';
        console.warn(`  hero download failed: ${err.message}`);
      }
    }

    results.push({
      itemId: entry.itemId,
      url: entry.url,
      slug,
      title: data.h1,
      pageSummary: data.metaDesc,
      metadataKeywords: data.category,
      readTime: data.readTime,
      publicationDate: toSitecoreDate(data.publicationDate),
      authorName: data.authorName,
      heroImageUrl: data.heroImg,
      localHeroFile: heroStatus === 'downloaded' ? localHeroFile : '',
      heroStatus,
      articleContent: blocksToRichText(data.blocks),
      articleKeyTakeaways: headingsToTakeaways(data.headings),
      headings: data.headings,
    });
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    results.push({ itemId: entry.itemId, url: entry.url, error: err.message });
  }
}

await browser.close();

const manifest = results
  .filter((r) => r.localHeroFile)
  .map((r, idx) => ({
    sectionPosition: idx + 1,
    src: r.heroImageUrl,
    localFile: r.localHeroFile,
    alt: r.title,
    status: 'downloaded',
    itemId: r.itemId,
    slug: r.slug,
  }));

writeFileSync(join(OUTPUT_DIR, 'article-updates.json'), JSON.stringify(results, null, 2));
writeFileSync(join(IMAGES_DIR, 'image-manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`\nDone. ${results.length} articles scraped, ${manifest.length} images downloaded.`);
console.log(`Output: ${OUTPUT_DIR}`);
