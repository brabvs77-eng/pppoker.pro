import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const ruDir = path.join(outDir, 'ru');

async function moveRecursive(from, to) {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });

  for (const entry of entries) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);

    if (entry.isDirectory()) {
      await moveRecursive(source, target);
    } else {
      await fs.rename(source, target).catch(async () => {
        await fs.copyFile(source, target);
        await fs.unlink(source);
      });
    }
  }
}

async function main() {
  try {
    await fs.access(ruDir);
  } catch {
    console.log('No apps/web/out/ru directory — skip flatten');
    return;
  }

  await moveRecursive(ruDir, outDir);
  await fs.rm(ruDir, { recursive: true, force: true });
  console.log('Flattened /ru export paths to site root');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
