import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const { cssBudget, coreStylesheets, allStylesheets, pages } = manifest;

  console.log('Stylesheet analysis');
  console.log('───────────────────');
  console.log(`Unique stylesheets: ${allStylesheets.length}`);
  console.log(`Core (layout):      ${coreStylesheets.length}`);
  console.log(`CSS budget stats:   ${JSON.stringify(cssBudget, null, 2)}`);

  const byType = {};
  for (const page of pages.filter((p) => !p.isRedirect)) {
    byType[page.type] ??= { count: 0, totalSpecific: 0 };
    byType[page.type].count += 1;
    byType[page.type].totalSpecific += page.stylesheets.length;
  }

  console.log('\nAverage page-specific stylesheets by type:');
  for (const [type, data] of Object.entries(byType)) {
    console.log(`  ${type}: ${(data.totalSpecific / data.count).toFixed(1)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
