import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { homeMetaOverridesForRoute } from './lib/manifest-seo.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  { route: '/tj/', file: path.join(rootDir, 'tj/index.html') },
  { route: '/en/', file: path.join(rootDir, 'en/index.html') },
];

function patchHead(html, { title, description }) {
  let next = html;

  if (title) {
    next = next.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
    next = next.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`,
    );
  }

  if (description) {
    const escaped = description.replace(/"/g, '&quot;');
    next = next.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escaped}">`,
    );
    next = next.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escaped}">`,
    );
  }

  return next;
}

async function main() {
  for (const { route, file } of TARGETS) {
    const override = homeMetaOverridesForRoute(route);
    if (!override) continue;

    let html;
    try {
      html = await fs.readFile(file, 'utf8');
    } catch {
      console.warn(`patch-home-seo-meta: missing ${file}`);
      continue;
    }

    const patched = patchHead(html, override);
    if (patched === html) {
      console.log(`patch-home-seo-meta: no changes for ${route}`);
      continue;
    }

    await fs.writeFile(file, patched, 'utf8');
    console.log(`patch-home-seo-meta: updated ${route} head meta`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
