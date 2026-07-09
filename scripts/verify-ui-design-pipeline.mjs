/**
 * CI guard: UI design pipeline artifacts are present (Impeccable + Taste + orchestrator).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED = [
  'PRODUCT.md',
  'DESIGN.md',
  '.agents/skills/ui-design-pipeline/SKILL.md',
  '.agents/skills/design-taste-frontend/SKILL.md',
  '.agents/skills/redesign-existing-projects/SKILL.md',
  '.cursor/skills/impeccable/SKILL.md',
];

async function main() {
  const missing = [];
  for (const relativePath of REQUIRED) {
    try {
      await fs.access(path.join(rootDir, relativePath));
    } catch {
      missing.push(relativePath);
    }
  }

  if (missing.length) {
    console.error('UI design pipeline verification failed — missing:');
    missing.forEach((p) => console.error(`  - ${p}`));
    process.exitCode = 1;
    return;
  }

  console.log('Verified UI design pipeline: Impeccable + Taste Skill + orchestrator + PRODUCT/DESIGN.md');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
