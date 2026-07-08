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

  if (violations.length) {
    console.error('KZ homepage locale verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Verified KZ homepage CRASH and Russian poker blocks are in Kazakh.');
}

main();
