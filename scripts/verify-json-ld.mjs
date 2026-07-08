#!/usr/bin/env node
/**
 * Verifies native JSON-LD on blog archive and structured post exports.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const SITE_ORIGIN = 'https://pppoker.pro';

const CHECKS = [
  {
    label: 'RU archive',
    outPath: 'blog/index.html',
    types: ['BreadcrumbList', 'WebSite', 'Organization', 'CollectionPage'],
    minBreadcrumbItems: 2,
    requireBlogPosting: false,
  },
  {
    label: 'EN archive',
    outPath: 'en/blog/index.html',
    types: ['BreadcrumbList', 'WebSite', 'Organization', 'CollectionPage'],
    minBreadcrumbItems: 2,
    requireBlogPosting: false,
  },
  {
    label: 'RU post',
    outPath: 'blog-chto-takoe-ev-v-pokere/index.html',
    types: ['BreadcrumbList', 'WebSite', 'Organization', 'BlogPosting'],
    minBreadcrumbItems: 3,
    requireBlogPosting: true,
  },
  {
    label: 'EN post',
    outPath: 'en/pppoker-review-2026/index.html',
    types: ['BreadcrumbList', 'WebSite', 'Organization', 'BlogPosting'],
    minBreadcrumbItems: 3,
    requireBlogPosting: true,
  },
];

function readExport(relativePath) {
  return fs.readFileSync(path.join(outDir, relativePath), 'utf8');
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match = pattern.exec(html);
  while (match) {
    blocks.push(match[1].trim());
    match = pattern.exec(html);
  }
  return blocks;
}

function parseGraph(blocks) {
  const nodes = [];

  for (const block of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch {
      continue;
    }

    if (Array.isArray(parsed['@graph'])) {
      nodes.push(...parsed['@graph']);
      continue;
    }

    if (parsed['@type']) {
      nodes.push(parsed);
    }
  }

  return nodes;
}

function nodeTypes(nodes) {
  return nodes.flatMap((node) => {
    const type = node['@type'];
    return Array.isArray(type) ? type : [type];
  });
}

function findBreadcrumbList(nodes) {
  return nodes.find((node) => {
    const type = node['@type'];
    return type === 'BreadcrumbList' || (Array.isArray(type) && type.includes('BreadcrumbList'));
  });
}

function assert(cond, message, violations) {
  if (!cond) violations.push(message);
}

function main() {
  const violations = [];

  if (!fs.existsSync(outDir)) {
    console.error('verify-json-ld: apps/web/out missing — run npm run build first');
    process.exitCode = 1;
    return;
  }

  for (const check of CHECKS) {
    const filePath = path.join(outDir, check.outPath);
    if (!fs.existsSync(filePath)) {
      violations.push(`[${check.label}] Missing export: ${check.outPath}`);
      continue;
    }

    const html = readExport(check.outPath);
    const blocks = extractJsonLdBlocks(html);
    assert(blocks.length > 0, `[${check.label}] No JSON-LD blocks found`, violations);

    const nodes = parseGraph(blocks);
    const types = nodeTypes(nodes);

    for (const expectedType of check.types) {
      assert(
        types.includes(expectedType),
        `[${check.label}] Missing @type ${expectedType} in JSON-LD graph`,
        violations,
      );
    }

    const breadcrumbs = findBreadcrumbList(nodes);
    const breadcrumbCount = breadcrumbs?.itemListElement?.length ?? 0;
    assert(
      breadcrumbCount >= check.minBreadcrumbItems,
      `[${check.label}] Expected at least ${check.minBreadcrumbItems} breadcrumb items, got ${breadcrumbCount}`,
      violations,
    );

    if (breadcrumbs?.itemListElement?.length) {
      for (const item of breadcrumbs.itemListElement) {
        assert(
          typeof item.item === 'string' && item.item.startsWith(SITE_ORIGIN),
          `[${check.label}] Breadcrumb item must use absolute URL (${item.name ?? 'unknown'})`,
          violations,
        );
      }
    }

    if (check.requireBlogPosting) {
      const posting = nodes.find((node) => node['@type'] === 'BlogPosting');
      assert(!!posting, `[${check.label}] Missing BlogPosting node`, violations);
      assert(
        typeof posting?.headline === 'string' && posting.headline.length > 0,
        `[${check.label}] BlogPosting must include headline`,
        violations,
      );
      assert(
        typeof posting?.datePublished === 'string',
        `[${check.label}] BlogPosting must include datePublished`,
        violations,
      );
    }

    const organization = nodes.find((node) => node['@type'] === 'Organization');
    assert(!!organization?.logo?.url, `[${check.label}] Organization must include logo.url`, violations);
    assert(
      String(organization?.logo?.url).startsWith(SITE_ORIGIN),
      `[${check.label}] Organization logo must be absolute URL`,
      violations,
    );
    assert(
      Array.isArray(organization?.sameAs) && organization.sameAs.length > 0,
      `[${check.label}] Organization must include sameAs links`,
      violations,
    );

    const website = nodes.find((node) => node['@type'] === 'WebSite');
    assert(
      typeof website?.url === 'string' && website.url.startsWith(SITE_ORIGIN),
      `[${check.label}] WebSite must use absolute url`,
      violations,
    );

    const yoastArticle = nodes.find((node) => node['@type'] === 'Article');
    assert(
      !yoastArticle,
      `[${check.label}] Legacy Yoast Article JSON-LD should be replaced on native blog routes`,
      violations,
    );
  }

  if (violations.length) {
    console.error('JSON-LD verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`verify-json-ld: OK (${CHECKS.length} routes)`);
}

main();
