import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { launch as launchChrome } from 'chrome-launcher';
import lighthouse from 'lighthouse/core/index.js';

import { startStaticServer } from './lib/smoke-static-server.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9877;

/** Core Web Vitals budgets for static homepages (legacy Elementor + native chrome). */
const BUDGET = {
  lcpMs: 4500,
  cls: 0.1,
};

const PAGES = [
  { label: 'RU', urlPath: '/' },
  { label: 'EN', urlPath: '/en/' },
  { label: 'UZ', urlPath: '/uz/' },
  { label: 'KZ', urlPath: '/kz/' },
  { label: 'TJ', urlPath: '/tj/' },
];

/** Local static export: no simulated throttling; block third-party analytics timeouts. */
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    throttlingMethod: 'provided',
    throttling: { rttMs: 0, throughputKbps: 0, cpuSlowdownMultiplier: 1 },
    blockedUrlPatterns: [
      '*google-analytics.com*',
      '*googletagmanager.com*',
      '*mc.yandex.ru*',
      '*metrika*',
    ],
    skipAudits: ['screenshot-thumbnails', 'final-screenshot'],
  },
};

async function measurePage(chrome, urlPath) {
  const url = `http://127.0.0.1:${port}${urlPath}`;
  const result = await lighthouse(
    url,
    {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
    },
    LIGHTHOUSE_CONFIG,
  );

  if (!result?.lhr) {
    throw new Error(`Lighthouse returned no report for ${urlPath}`);
  }

  const lcp = result.lhr.audits['largest-contentful-paint']?.numericValue;
  const cls = result.lhr.audits['cumulative-layout-shift']?.numericValue;

  return {
    lcp,
    cls,
    performanceScore: result.lhr.categories.performance?.score,
  };
}

async function main() {
  const server = await startStaticServer(outDir, port);
  const chrome = await launchChrome({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  const violations = [];

  try {
    for (const { label, urlPath } of PAGES) {
      const { lcp, cls, performanceScore } = await measurePage(chrome, urlPath);

      if (typeof lcp !== 'number' || Number.isNaN(lcp)) {
        violations.push(`[${label}] Lighthouse missing LCP for ${urlPath}`);
      } else if (lcp > BUDGET.lcpMs) {
        violations.push(
          `[${label}] LCP ${Math.round(lcp)}ms exceeds budget ${BUDGET.lcpMs}ms (${urlPath})`,
        );
      }

      if (typeof cls !== 'number' || Number.isNaN(cls)) {
        violations.push(`[${label}] Lighthouse missing CLS for ${urlPath}`);
      } else if (cls > BUDGET.cls) {
        violations.push(`[${label}] CLS ${cls.toFixed(3)} exceeds budget ${BUDGET.cls} (${urlPath})`);
      }

      console.log(
        `[${label}] performance=${performanceScore ?? 'n/a'} LCP=${Math.round(lcp ?? 0)}ms CLS=${(cls ?? 0).toFixed(3)}`,
      );
    }
  } finally {
    await chrome.kill();
    server.close();
  }

  if (violations.length) {
    console.error('Lighthouse budget check failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Lighthouse budget OK for ${PAGES.map((p) => p.label).join(', ')} (LCP ≤ ${BUDGET.lcpMs}ms, CLS ≤ ${BUDGET.cls}).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
