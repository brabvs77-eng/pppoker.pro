/**
 * Bundles render-blocking stylesheets in the exported site (apps/web/out).
 *
 * Each page loads ~39 separate <link rel="stylesheet"> files; on mobile
 * networks the request overhead alone costs seconds of FCP. This step:
 *   1. collects local stylesheet links (/assets/..., /includes/...) per page
 *      in document order (skipping /_next/ — Next manages its own CSS);
 *   2. rewrites relative url(...) references inside each file to absolute
 *      paths (fonts/images are resolved against the source CSS location);
 *   3. concatenates them into a content-hashed bundle under
 *      /assets/css-bundles/bundle-<hash>.css (immutable-cached via /assets/*);
 *   4. replaces the first stylesheet link with the bundle link and removes
 *      the rest. Inline <style> blocks are untouched, so cascade order is
 *      preserved (all pages keep links before inline styles).
 *
 * Pages sharing the same stylesheet set share one bundle file.
 * Runs after `flatten:ru` so all output paths are final.
 */
import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const BUNDLE_DIR = 'assets/css-bundles';

const LINK_RE = /<link\b[^>]*rel="stylesheet"[^>]*>/g;
const HREF_RE = /href="([^"]+)"/;
const URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

function isBundleable(href) {
  return (
    (href.startsWith('/assets/') || href.startsWith('/includes/'))
    && !href.startsWith(`/${BUNDLE_DIR}/`)
    && href.split('?')[0].endsWith('.css')
  );
}

function rewriteUrls(css, cssHref) {
  const baseDir = path.posix.dirname(cssHref.split('?')[0]);
  return css.replace(URL_RE, (match, quote, target) => {
    const trimmed = target.trim();
    if (
      trimmed.startsWith('data:')
      || trimmed.startsWith('#')
      || trimmed.startsWith('http:')
      || trimmed.startsWith('https:')
      || trimmed.startsWith('//')
      || trimmed.startsWith('/')
    ) {
      return match;
    }
    const absolute = path.posix.normalize(path.posix.join(baseDir, trimmed));
    return `url(${quote}${absolute}${quote})`;
  });
}

async function main() {
  const pages = await glob('**/index.html', { cwd: outDir, nodir: true });
  const cssCache = new Map();
  const bundles = new Map(); // hash -> content
  let pagesBundled = 0;

  async function readCss(href) {
    if (cssCache.has(href)) return cssCache.get(href);
    const filePath = path.join(outDir, href.split('?')[0].replace(/^\//, ''));
    let css;
    try {
      css = await fs.readFile(filePath, 'utf8');
    } catch {
      css = null; // отсутствующий файл — линк оставляем как есть
    }
    const rewritten = css === null ? null : rewriteUrls(css, href);
    cssCache.set(href, rewritten);
    return rewritten;
  }

  for (const relative of pages.sort()) {
    const pagePath = path.join(outDir, relative);
    let html = await fs.readFile(pagePath, 'utf8');
    const links = [...html.matchAll(LINK_RE)]
      .map((m) => ({ tag: m[0], href: m[0].match(HREF_RE)?.[1] ?? '' }))
      .filter((l) => isBundleable(l.href));

    if (links.length < 2) continue;

    const parts = [];
    const bundledTags = [];
    for (const link of links) {
      const css = await readCss(link.href);
      if (css === null) continue;
      parts.push(`/* === ${link.href} === */\n${css}`);
      bundledTags.push(link.tag);
    }
    if (bundledTags.length < 2) continue;

    const content = parts.join('\n\n');
    const hash = crypto.createHash('sha1').update(content).digest('hex').slice(0, 12);
    bundles.set(hash, content);
    const bundleHref = `/${BUNDLE_DIR}/bundle-${hash}.css`;

    // первый линк -> бандл, остальные удаляем
    html = html.replace(bundledTags[0], `<link rel="stylesheet" href="${bundleHref}"/>`);
    for (const tag of bundledTags.slice(1)) {
      html = html.replace(tag, '');
    }
    await fs.writeFile(pagePath, html, 'utf8');
    pagesBundled += 1;
  }

  await fs.mkdir(path.join(outDir, BUNDLE_DIR), { recursive: true });
  for (const [hash, content] of bundles) {
    await fs.writeFile(path.join(outDir, BUNDLE_DIR, `bundle-${hash}.css`), content, 'utf8');
  }

  console.log(`CSS bundles: ${bundles.size} bundle(s) for ${pagesBundled} page(s).`);
  if (pagesBundled === 0) {
    throw new Error('bundle-css: no pages were bundled — pipeline layout changed?');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
