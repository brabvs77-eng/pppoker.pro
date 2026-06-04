const SITE_ORIGINS = [
  'https://www.pppoker.pro',
  'https://pppoker.pro',
  'http://www.pppoker.pro',
  'http://pppoker.pro',
];

const PROTOCOL_RELATIVE_HOSTS = ['pppoker.pro', 'www.pppoker.pro'];

const HEKLER_PATTERN = /https?:\/\/(?:www\.)?hekler\.info/gi;
const HEKLER_PROTOCOL_RELATIVE = /\/\/(?:www\.)?hekler\.info/gi;
const HEKLER_BARE = /(?<![\w./-])hekler\.info/gi;

/**
 * Maps legacy hekler.info URLs to pppoker.pro, then root-relative paths where possible.
 */
export function normalizeUrls(value) {
  if (!value) return value;

  let result = value
    .replace(HEKLER_PATTERN, 'https://pppoker.pro')
    .replace(HEKLER_PROTOCOL_RELATIVE, '//pppoker.pro')
    .replace(HEKLER_BARE, 'pppoker.pro');

  for (const origin of SITE_ORIGINS) {
    result = result.split(`${origin}/`).join('/');
    result = result.split(origin).join('');
  }

  for (const host of PROTOCOL_RELATIVE_HOSTS) {
    result = result.replaceAll(`//${host}/`, '/');
  }

  // JSON-escaped and bare hostnames (e.g. fuse-index.json: https:\/\/hekler.info\/)
  result = result.replace(/hekler\.info/gi, 'pppoker.pro');

  return result;
}

/**
 * Fail CI/build if legacy domain leaks into generated content.
 */
export function assertNoHekler(value, context = 'content') {
  if (typeof value === 'string' && /hekler\.info/i.test(value)) {
    throw new Error(`Legacy domain hekler.info found in ${context}`);
  }
}
