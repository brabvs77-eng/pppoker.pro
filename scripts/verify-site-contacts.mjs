import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homepagePath = path.join(rootDir, 'apps/web/out/index.html');

const expected = {
  telegramChannel: 'https://t.me/+Sj5sG5o0aqJkMTBi',
  whatsapp: 'https://wa.clck.bar/995592934850',
  telegramManager: 'https://t.me/NUTSsup',
};

async function main() {
  const html = await fs.readFile(homepagePath, 'utf8');
  const violations = [];

  for (const [key, url] of Object.entries(expected)) {
    if (!html.includes(url)) {
      violations.push(`Missing ${key} link in homepage output: ${url}`);
    }
  }

  if (violations.length) {
    console.error('Site contacts verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Verified site contact links in homepage output.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
