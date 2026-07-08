import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

import {
  AUTO_FIX_REGEX,
  AUTO_FIXES,
  LEGACY_GLOBS,
  LEGACY_IGNORE,
  detectEnglishPopupsOnRu,
} from './known-legacy-issues.mjs';
import { KZ_HOME_LOCALE_REPLACEMENTS } from './kz-home-locale-content.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const checkOnly = process.argv.includes('--check');

/**
 * @param {string} original
 * @returns {{ next: string; fixes: string[] }}
 */
function applyAutoFixes(original) {
  let next = original;
  const fixes = [];

  for (const fix of AUTO_FIXES) {
    if (!next.includes(fix.search)) continue;
    const count = next.split(fix.search).length - 1;
    next = next.split(fix.search).join(fix.replace);
    fixes.push(`${fix.id} (${count})`);
  }

  for (const fix of AUTO_FIX_REGEX) {
    if (!fix.pattern.test(next)) {
      fix.pattern.lastIndex = 0;
      continue;
    }
    fix.pattern.lastIndex = 0;
    const before = next;
    next = next.replace(fix.pattern, fix.replace);
    if (next !== before) {
      fixes.push(fix.id);
    }
    fix.pattern.lastIndex = 0;
  }

  return { next, fixes };
}

/**
 * @param {string} relativePath
 * @param {string} original
 * @returns {{ next: string; fixes: string[] }}
 */
function applyLocaleFileFixes(relativePath, original) {
  if (relativePath !== 'kz/index.html') {
    return { next: original, fixes: [] };
  }

  let next = original;
  const fixes = [];

  for (const replacement of KZ_HOME_LOCALE_REPLACEMENTS) {
    if (!next.includes(replacement.from)) continue;
    next = next.split(replacement.from).join(replacement.to);
    fixes.push(replacement.id);
  }

  return { next, fixes };
}

async function main() {
  const files = (
    await Promise.all(
      LEGACY_GLOBS.map((pattern) =>
        glob(pattern, { cwd: rootDir, nodir: true, ignore: [...LEGACY_IGNORE] }),
      ),
    )
  ).flat();

  const uniqueFiles = [...new Set(files)].sort();
  let updatedFiles = 0;
  let remainingAutoFixes = 0;
  const manualReports = [];

  for (const relativePath of uniqueFiles) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    const autoResult = applyAutoFixes(original);
    const localeResult = applyLocaleFileFixes(relativePath, autoResult.next);
    const next = localeResult.next;
    const fixes = [...autoResult.fixes, ...localeResult.fixes];

    if (fixes.length) {
      if (checkOnly) {
        remainingAutoFixes += 1;
        console.error(`[check] ${relativePath}: would apply ${fixes.join(', ')}`);
      } else if (next !== original) {
        await fs.writeFile(fullPath, next, 'utf8');
        updatedFiles += 1;
        console.log(`Fixed ${relativePath}: ${fixes.join(', ')}`);
      }
    }

    const popupFindings = detectEnglishPopupsOnRu(original, relativePath);
    for (const finding of popupFindings) {
      manualReports.push({ relativePath, finding });
    }
  }

  if (manualReports.length) {
    console.warn('\nManual review required (English popups on RU pages — see patches/manual-steps.md):');
    const byFile = new Map();
    for (const { relativePath, finding } of manualReports) {
      if (!byFile.has(relativePath)) byFile.set(relativePath, []);
      byFile.get(relativePath).push(finding);
    }
    for (const [relativePath, findings] of byFile) {
      console.warn(`  ${relativePath}:`);
      for (const finding of [...new Set(findings)]) {
        console.warn(`    - ${finding}`);
      }
    }
  }

  if (checkOnly) {
    if (remainingAutoFixes) {
      console.error(`\nfix:legacy-html --check: ${remainingAutoFixes} file(s) still need auto-fixes.`);
      process.exitCode = 1;
      return;
    }
    console.log('fix:legacy-html --check passed (no pending auto-fixes).');
    return;
  }

  console.log(`\nLegacy HTML codemod finished: ${updatedFiles} file(s) updated.`);
  if (manualReports.length) {
    console.warn(`${manualReports.length} manual-review finding(s) logged (not auto-fixed).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
