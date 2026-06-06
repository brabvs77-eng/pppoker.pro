import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slotBodyPath = path.join(rootDir, 'content/bodies/_root-with-blog-slot.html');

function divTagBalance(html) {
  return (html.match(/<div/gi) ?? []).length - (html.match(/<\/div>/gi) ?? []).length;
}

async function main() {
  const html = await fs.readFile(slotBodyPath, 'utf8');
  const violations = [];

  if (!html.includes('id="native-home-blog-slot"')) {
    violations.push('Missing native-home-blog-slot in _root-with-blog-slot.html');
  }

  if (html.includes('elementor-element-39311d7')) {
    violations.push('Legacy blog container 39311d7 still present in slotted homepage body');
  }

  if (html.includes('data-id="39eeae8"')) {
    violations.push('Legacy blog loop widget 39eeae8 still present in slotted homepage body');
  }

  const balance = divTagBalance(html);
  if (balance !== 0) {
    violations.push(`Unbalanced div tags in slotted homepage body: ${balance}`);
  }

  if (violations.length) {
    console.error('Homepage DOM verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Verified slotted homepage body HTML (balanced divs, legacy blog removed).');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
