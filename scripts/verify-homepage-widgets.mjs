import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homepagePath = path.join(rootDir, 'apps/web/out/index.html');

async function main() {
  const html = await fs.readFile(homepagePath, 'utf8');
  const violations = [];

  if (html.includes('href="#collapse-')) {
    violations.push('FAQ accordion still uses lowercase #collapse- href anchors');
  }

  if (!html.includes('LegacyElementorBoot') && !html.includes('elementorFrontend')) {
    // Static export inlines scripts; ensure Elementor runtime is present.
    if (!html.includes('elementor-frontend-js')) {
      violations.push('Missing elementor-frontend-js on homepage');
    }
  }

  const swiperCount = (html.match(/class="[^"]*elementor-main-swiper[^"]*"/g) ?? []).length;
  if (swiperCount < 3) {
    violations.push(`Expected at least 3 elementor-main-swiper carousels, found ${swiperCount}`);
  }

  if (!html.includes('elementor-location-popup')) {
    violations.push('Missing elementor-location-popup markup on homepage');
  }

  if (violations.length) {
    console.error('Homepage widgets verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Verified homepage widget markup (FAQ anchors, carousels, popups).');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
