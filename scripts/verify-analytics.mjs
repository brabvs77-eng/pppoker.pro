import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');

const METRIKA_ID = '98592596';
const GOOGLE_TAG_ID = 'GT-KF6XSGPD';

/** Representative routes: native shell + legacy runtime homepage + popup landing. */
const SAMPLE_ROUTES = [
  { route: '/', label: 'RU homepage (legacy runtime analytics)' },
  { route: '/blog/', label: 'RU blog archive (native)' },
  { route: '/blog-chto-takoe-ev-v-pokere/', label: 'RU structured post (native)' },
  { route: '/en/user-agreement/', label: 'EN native legal page' },
  { route: '/spasibo/', label: 'RU conversion landing (native analytics)' },
];

function outputPathForRoute(route) {
  if (route === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

function hasMetrika(html) {
  return (
    html.includes(`ym(${METRIKA_ID}`) ||
    html.includes(`ym("${METRIKA_ID}"`) ||
    html.includes(`mc.yandex.ru/watch/${METRIKA_ID}`)
  );
}

function hasGoogleTag(html) {
  return html.includes(GOOGLE_TAG_ID) || html.includes(`gtag("config", "${GOOGLE_TAG_ID}")`);
}

async function main() {
  const violations = [];

  for (const { route, label } of SAMPLE_ROUTES) {
    const outputPath = outputPathForRoute(route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`[${label}] missing export at ${route}`);
      continue;
    }

    if (!hasMetrika(html)) {
      violations.push(`[${label}] missing Yandex Metrika counter ${METRIKA_ID}`);
    }

    if (!hasGoogleTag(html)) {
      violations.push(`[${label}] missing Google Tag ${GOOGLE_TAG_ID}`);
    }
  }

  if (violations.length) {
    console.error('verify-analytics failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`verify-analytics: OK (${SAMPLE_ROUTES.length} sample routes)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
