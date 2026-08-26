#!/usr/bin/env node
/**
 * Bootstraps post translation JSON from extracted content/posts (dev only).
 * Primary source of truth: apps/web/src/config/post-translations/posts/*.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCatalog } from './lib/post-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(rootDir, 'content/posts');
const outDir = path.join(rootDir, 'apps/web/src/config/post-translations/posts');

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeTranslation(postId, data) {
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${postId}.json`);
  const existing = existsSync(outPath) ? readJson(outPath) : {};
  writeFileSync(outPath, `${JSON.stringify({ ...existing, ...data }, null, 2)}\n`, 'utf8');
}

function main() {
  const catalog = loadCatalog();
  let written = 0;

  for (const entry of catalog) {
    for (const locale of ['en', 'uz', 'kz']) {
      const slug = entry.slugs[locale];
      const fileId = `${locale}__${slug}`;
      const filePath = path.join(postsDir, `${fileId}.json`);
      if (!existsSync(filePath)) continue;
      const record = readJson(filePath);
      writeTranslation(entry.id, {
        [locale]: {
          title: record.title,
          description: record.description,
          bodyHtml: record.html,
        },
      });
      written += 1;
    }
  }

  console.log(
    `Bootstrapped ${written} locale copies from content/posts (optional dev import; JSON files are canonical).`,
  );
}

main();
