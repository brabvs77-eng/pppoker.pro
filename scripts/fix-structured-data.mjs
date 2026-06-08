import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

import { discoverWordPressPages } from '../src/lib/wordpressHtml.mjs';
import { collectStructuredDataIssues, fixJsonLdBreadcrumbItems } from '../src/lib/structuredData.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const pages = await discoverWordPressPages(rootDir);
  const fixedPages = [];
  let fixedItems = 0;

  for (const page of pages) {
    const source = await fs.readFile(page.sourcePath, 'utf8');
    const $ = load(source, { decodeEntities: false });
    const beforeIssues = collectStructuredDataIssues($);

    if (beforeIssues.length === 0) {
      continue;
    }

    const fixed = fixStructuredDataInHtml(source, page.route);
    const after = load(fixed.html, { decodeEntities: false });
    const afterIssues = collectStructuredDataIssues(after);

    if (afterIssues.length > 0) {
      throw new Error(`${page.relativePath} still has structured data issues after fixing`);
    }

    await fs.writeFile(page.sourcePath, fixed.html, 'utf8');
    fixedPages.push({
      route: page.route,
      source: page.relativePath,
      fixedItems: fixed.fixedItems,
    });
    fixedItems += fixedPages.at(-1).fixedItems;
  }

  console.log(JSON.stringify({
    fixedPageCount: fixedPages.length,
    fixedItems,
    fixedPages,
  }, null, 2));
}

function fixStructuredDataInHtml(html, route) {
  let fixedItems = 0;
  const pageUrl = pageUrlFromHtml(html, route);
  const fixedHtml = html.replace(
    /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (match, openTag, jsonText, closeTag) => {
      if (!jsonText.includes('BreadcrumbList')) {
        return match;
      }

      let data;

      try {
        data = JSON.parse(jsonText);
      } catch {
        return match;
      }

      const count = fixJsonLdBreadcrumbItems(data, pageUrl);

      if (count === 0) {
        return match;
      }

      fixedItems += count;
      return `${openTag}${JSON.stringify(data)}${closeTag}`;
    },
  );

  return {
    html: fixedHtml,
    fixedItems,
  };
}

function pageUrlFromHtml(html, route) {
  const canonicalMatch = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);

  if (canonicalMatch?.[1]) {
    return canonicalMatch[1];
  }

  return `https://pppoker.pro${route}`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
