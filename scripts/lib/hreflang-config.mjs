import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/hreflang.json');

/** @typedef {{ codeMap: Record<string, string>; homeRoutes: string[]; homeLanguages: Record<string, string>; reviewRoutes: string[]; reviewLanguages: Record<string, string> }} HreflangConfig */

/** @type {HreflangConfig | null} */
let cached = null;

export function loadHreflangConfig() {
  if (cached) return cached;
  cached = JSON.parse(readFileSync(configPath, 'utf8'));
  return cached;
}

export function normalizeHreflangCode(code) {
  const { codeMap } = loadHreflangConfig();
  return codeMap[code] ?? code;
}

export function invalidHreflangCodes() {
  return new Set(Object.keys(loadHreflangConfig().codeMap));
}

/** @param {{ route: string; hreflang?: Array<{ hreflang: string; href: string }> }} page */
export function hreflangAlternatesForPage(page) {
  const config = loadHreflangConfig();

  if (config.homeRoutes.includes(page.route)) {
    return Object.entries(config.homeLanguages).map(([hreflang, href]) => ({ hreflang, href }));
  }

  if (config.reviewRoutes.includes(page.route)) {
    return Object.entries(config.reviewLanguages).map(([hreflang, href]) => ({ hreflang, href }));
  }

  return (page.hreflang ?? []).map((alt) => ({
    hreflang: normalizeHreflangCode(alt.hreflang),
    href: alt.href,
  }));
}
