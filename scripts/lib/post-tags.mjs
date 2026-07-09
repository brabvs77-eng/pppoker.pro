import { promises as fs } from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { glob } from 'glob';

/**
 * Tags live on /tag/<slug>/ archive pages in the static export.
 * Inverts tag archives into route -> tag slugs and slug -> display name.
 */
export async function buildPostTagsIndex(rootDir) {
  const tagFiles = await glob('tag/*/index.html', { cwd: rootDir });
  const pagedTagFiles = await glob('tag/*/page/*/index.html', { cwd: rootDir });

  /** @type {Map<string, Set<string>>} */
  const routeTags = new Map();
  /** @type {Map<string, string>} */
  const tagNames = new Map();

  for (const relativePath of [...tagFiles, ...pagedTagFiles]) {
    const slug = relativePath.split('/')[1];
    const html = await fs.readFile(path.join(rootDir, relativePath), 'utf8');
    const $ = load(html, { decodeEntities: false });

    const displayName = $('h1.entry-title span').first().text().trim();
    if (displayName && !tagNames.has(slug)) {
      tagNames.set(slug, displayName);
    }

    $('article.post').each((_, article) => {
      const href = $(article).find('h2.entry-title a').first().attr('href');
      if (!href) return;
      if (!routeTags.has(href)) routeTags.set(href, new Set());
      routeTags.get(href).add(slug);
    });
  }

  /** @type {Record<string, string[]>} */
  const routeTagsPlain = {};
  for (const [route, slugs] of routeTags) {
    routeTagsPlain[route] = [...slugs].sort();
  }

  return {
    routeTags: routeTagsPlain,
    tagNames: Object.fromEntries(tagNames),
  };
}
