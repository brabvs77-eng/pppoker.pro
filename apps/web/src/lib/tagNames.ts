import { promises as fs } from 'fs';
import path from 'path';

const contentRoot = path.join(process.cwd(), '..', '..', 'content');

let cache: Record<string, string> | null = null;

/** slug -> display name (e.g. "shkola-pokera" -> "Школа покера"), from content/tag-names.json. */
export async function getTagNames(): Promise<Record<string, string>> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(path.join(contentRoot, 'tag-names.json'), 'utf8');
    cache = JSON.parse(raw) as Record<string, string>;
  } catch {
    cache = {};
  }
  return cache;
}

export async function getTagDisplayName(slug: string): Promise<string> {
  const names = await getTagNames();
  return names[slug] ?? slug;
}
