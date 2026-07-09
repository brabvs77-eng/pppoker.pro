import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { KZ_HOME_FORBIDDEN_MARKERS } from './patches/kz-home-locale-content.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kzHomePath = path.join(rootDir, 'kz/index.html');

const requiredKazakhMarkers = [
  'Клубта жаңа формат — 🤝NUTS: CRASH',
  'Орыс покері енді 🤝NUTS-те',
];

function main() {
  const html = readFileSync(kzHomePath, 'utf8');
  const violations = [];

  for (const marker of KZ_HOME_FORBIDDEN_MARKERS) {
    if (html.includes(marker)) {
      violations.push(`Russian leak on KZ homepage: "${marker}"`);
    }
  }

  for (const marker of requiredKazakhMarkers) {
    if (!html.includes(marker)) {
      violations.push(`Missing Kazakh block on KZ homepage: "${marker}"`);
    }
  }

  if (!html.includes('class="elementor-element elementor-element-db11841 kz-promo-update')) {
    violations.push('Missing kz-promo-update class on CRASH block container');
  }

  if (!html.includes('kz-promo-update__heading')) {
    violations.push('Missing unified kz-promo-update__heading class on promo blocks');
  }

  if (!html.includes('poster="/assets/media/2025/12/turbo.webp"')) {
    violations.push('CRASH video missing turbo.webp poster');
  }

  if (!html.includes('class="elementor-video kz-promo-update__video"')) {
    violations.push('CRASH video missing kz-promo-update__video autoplay markup');
  }

  if (violations.length) {
    console.error('KZ homepage locale verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    'Verified KZ homepage promo blocks: Kazakh copy, unified layout classes, video poster/autoplay.',
  );
}

main();
