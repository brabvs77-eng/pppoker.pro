#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { write as writeStartovye } from './lib/post-translations/startovye-ruki-v-tehasskom-holdeme.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(
  rootDir,
  'apps/web/src/config/post-translations/posts/startovye-ruki-v-tehasskom-holdeme.json',
);

const existing = JSON.parse(readFileSync(outPath, 'utf8'));
writeStartovye();
const generated = JSON.parse(readFileSync(outPath, 'utf8'));

writeFileSync(
  outPath,
  `${JSON.stringify({ en: existing.en, uz: existing.uz, kz: existing.kz, hy: generated.hy, tj: generated.tj }, null, 2)}\n`,
  'utf8',
);
console.log('Merged hy/tj into startovye-ruki-v-tehasskom-holdeme.json');
