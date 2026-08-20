import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hreflangAlternatesForPage, invalidHreflangCodes, loadHreflangConfig } from './lib/hreflang-config.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const outDir = path.join(rootDir, 'apps/web/out');

const SITEMAP_FILES = ['post-sitemap.xml', 'page-sitemap.xml'];

const STAGES = [
  { label: 'root', dir: rootDir },
  { label: 'public', dir: path.join(rootDir, 'apps/web/public') },
  { label: 'out', dir: outDir },
];

const HEAD_SAMPLES = [
  { route: '/', label: 'RU homepage' },
  { route: '/kz/', label: 'KZ homepage' },
  { route: '/blog/', label: 'RU blog archive' },
];

function outputPathForRoute(route) {
  if (route === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

function extractHreflangAttrs(xml) {
  const attrs = [];
  for (const match of xml.matchAll(/hreflang="([^"]+)"/g)) {
    attrs.push(match[1]);
  }
  return attrs;
}

function extractLocForRoute(xml, route) {
  const loc = route === '/'
    ? 'https://pppoker.pro/'
    : `https://pppoker.pro${route.startsWith('/') ? route : `/${route}`}`;
  const blockStart = xml.indexOf(`<loc>${loc}</loc>`);
  if (blockStart === -1) return null;
  const blockEnd = xml.indexOf('</url>', blockStart);
  if (blockEnd === -1) return null;
  return xml.slice(blockStart, blockEnd);
}

function verifySitemapXml(xml, label, violations) {
  const invalidCodes = invalidHreflangCodes();
  for (const code of extractHreflangAttrs(xml)) {
    if (invalidCodes.has(code)) {
      violations.push(
        `[${label}] deprecated hreflang code "${code}" — use BCP 47 from hreflang.json codeMap`,
      );
    }
  }
}

function verifyHomeCluster(block, label, violations) {
  const config = loadHreflangConfig();
  for (const code of Object.keys(config.homeLanguages)) {
    if (!block.includes(`hreflang="${code}"`)) {
      violations.push(`[${label}] missing home hreflang="${code}"`);
    }
  }
}

function verifyExportHead(html, label, violations) {
  if (html.includes('hrefLang":"kz"') || html.includes('"hreflang":"kz"')) {
    violations.push(`[${label}] export metadata still uses hreflang kz instead of kk`);
  }
  if (html.includes('hrefLang":"tj"') || html.includes('"hreflang":"tj"')) {
    violations.push(`[${label}] export metadata still uses hreflang tj instead of tg`);
  }

  if (label.includes('KZ homepage') && !html.includes('"kk"')) {
    violations.push(`[${label}] export metadata missing kk hreflang entry`);
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const config = loadHreflangConfig();
  const violations = [];

  for (const stage of STAGES) {
    let combinedXml = '';
    for (const filename of SITEMAP_FILES) {
      const filePath = path.join(stage.dir, filename);
      let xml;
      try {
        xml = await fs.readFile(filePath, 'utf8');
      } catch {
        violations.push(`[${stage.label}] missing ${filename}`);
        continue;
      }

      verifySitemapXml(xml, `${stage.label}/${filename}`, violations);
      combinedXml += xml;
    }

    for (const route of config.homeRoutes) {
      const block = extractLocForRoute(combinedXml, route);
      if (!block) {
        violations.push(`[${stage.label}] home route missing from sitemap: ${route}`);
        continue;
      }
      verifyHomeCluster(block, `${stage.label} ${route}`, violations);
    }
  }

  for (const sample of HEAD_SAMPLES) {
    const htmlPath = outputPathForRoute(sample.route);
    let html;
    try {
      html = await fs.readFile(htmlPath, 'utf8');
    } catch {
      violations.push(`[${sample.label}] missing export at ${sample.route}`);
      continue;
    }
    verifyExportHead(html, sample.label, violations);
  }

  for (const page of manifest.pages.filter((entry) => config.reviewRoutes.includes(entry.route))) {
    const alternates = hreflangAlternatesForPage(page);
    for (const alt of alternates) {
      if (invalidHreflangCodes().has(alt.hreflang)) {
        violations.push(`Review cluster for ${page.route} uses invalid code ${alt.hreflang}`);
      }
    }
  }

  if (violations.length) {
    console.error('verify-hreflang failed:');
    violations.slice(0, 40).forEach((line) => console.error(`  - ${line}`));
    if (violations.length > 40) {
      console.error(`  - …and ${violations.length - 40} more`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `verify-hreflang: OK (BCP 47 in sitemaps, ${config.homeRoutes.length} home clusters, ${HEAD_SAMPLES.length} export samples)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
