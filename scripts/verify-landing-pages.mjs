import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CONVERSION_LANDING_ROUTES } from './lib/landing-pages.mjs';
import { siteContacts } from './lib/site-contacts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const manifestPath = path.join(rootDir, 'content/manifest.json');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const violations = [];
  const checked = [];

  for (const { label, route, outPath } of CONVERSION_LANDING_ROUTES) {
    const page = manifest.pages.find((entry) => entry.route === route && !entry.isRedirect);
    if (!page) {
      violations.push(`[${label}] Missing manifest entry for ${route}`);
      continue;
    }

    if (page.needsElementorRuntime !== false) {
      violations.push(`[${label}] Conversion landing must not need Elementor runtime`);
    }

    const filePath = path.join(outDir, outPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`[${label}] Missing export: ${outPath}`);
      continue;
    }

    if (!html.includes('class="site-header"')) {
      violations.push(`[${label}] Missing native site-header`);
    }

    if (!html.includes('class="site-footer"')) {
      violations.push(`[${label}] Missing native site-footer`);
    }

    if (html.includes('elementor-frontend-js')) {
      violations.push(`[${label}] Elementor runtime still loaded`);
    }

    for (const [key, url] of Object.entries(siteContacts)) {
      if (key === 'telegramManager') continue;
      if (!html.includes(url)) {
        violations.push(`[${label}] Missing ${key} link: ${url}`);
      }
    }

    if (!violations.some((line) => line.startsWith(`[${label}]`))) {
      checked.push(label);
    }
  }

  if (violations.length) {
    console.error('Conversion landing page verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified ${checked.length} conversion landing pages (native chrome, no Elementor runtime, contacts).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
