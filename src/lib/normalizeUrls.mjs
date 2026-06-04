const SITE_ORIGINS = [
  'https://www.pppoker.pro',
  'https://pppoker.pro',
  'https://www.hekler.info',
  'https://hekler.info',
  'http://www.pppoker.pro',
  'http://pppoker.pro',
  'http://hekler.info',
];

const PROTOCOL_RELATIVE_HOSTS = ['pppoker.pro', 'www.pppoker.pro', 'hekler.info', 'www.hekler.info'];

/**
 * Converts absolute site URLs to root-relative paths in HTML, CSS url(), and attributes.
 */
export function normalizeUrls(value) {
  if (!value) return value;

  let result = value;

  for (const origin of SITE_ORIGINS) {
    result = result.split(`${origin}/`).join('/');
    result = result.split(origin).join('');
  }

  for (const host of PROTOCOL_RELATIVE_HOSTS) {
    result = result.replaceAll(`//${host}/`, '/');
  }

  return result;
}
