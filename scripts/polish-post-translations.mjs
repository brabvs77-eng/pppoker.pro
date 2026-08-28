/**
 * Polish post-translations JSON: fix locale-prefixed internal links in bodyHtml.
 * Run before seed:post-translations (npm run polish:post-translations).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCatalog, TARGET_LOCALES } from './lib/post-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(rootDir, 'apps/web/src/config/post-translations/posts');

/** EN title/description touch-ups for remaining quality-pass posts. */
const EN_COPY_OVERRIDES = {
  'author-roman-shaposhnikov': {
    title: 'Roman Shaposhnikov — Poker Coach & Author — Nuts PPPoker',
    description:
      'Roman Shaposhnikov is a professional poker player and coach at the NUTS club on PPPoker. Chess background, live and online experience, and strategy articles for club players.',
  },
  'mnogostolovye-turniry-mtt': {
    title: 'Multi-Table Tournaments (MTT): Rules, Formats & Strategy — Nuts PPPoker',
  },
  'na-chto-potratit-vyigrysh-v-pokere': {
    title: 'What to Do With Poker Winnings: Bankroll, Training & More — Nuts PPPoker',
  },
  'open-face-chinese-poker-ofc': {
    title: 'Open Face Chinese Poker (OFC): Rules & Scoring — Nuts PPPoker',
  },
  'osnovnye-tipy-igrokov-v-pokere': {
    title: 'Poker Player Types: TAG, LAG, Nit & Fish — Nuts PPPoker',
  },
  'osnovy-pravilnogo-bet-sajzinga-v-pokere': {
    title: 'Bet Sizing in Poker: Preflop & Postflop Basics — Nuts PPPoker',
  },
  'pravila-tehasskogo-holdema': {
    title: "Texas Hold'em Rules for Beginners — Nuts PPPoker",
  },
  'pravila-igry-v-tehasskij-holdem-nlh': {
    title: "No-Limit Texas Hold'em (NLH) Rules — Nuts PPPoker",
    description:
      'Learn No-Limit Texas Hold\'em (NLH) rules at the NUTS club on PPPoker: blinds, betting rounds, showdown, and how to apply them at real-money tables.',
  },
  'pravila-pot-limit-omahi-plo': {
    title: 'Pot-Limit Omaha (PLO) Rules & Hand Rankings — Nuts PPPoker',
  },
  'samyj-krupnyj-turnir-v-pppoker': {
    title: 'Biggest PPPoker Tournament: Prize Pool & Highlights — Nuts PPPoker',
  },
};

function normalizeRoute(route) {
  if (!route || route === '/') return '/';
  const withLeading = route.startsWith('/') ? route : `/${route}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function buildRouteMaps(catalog) {
  /** @type {Map<string, Record<string, string>>} locale -> ruRoute -> localeRoute */
  const byLocale = new Map(TARGET_LOCALES.map((locale) => [locale, new Map()]));

  for (const entry of catalog) {
    const ruRoute = normalizeRoute(entry.sourceRoute);
    for (const locale of TARGET_LOCALES) {
      const slug = entry.slugs?.[locale];
      if (!slug) continue;
      byLocale.get(locale).set(ruRoute, normalizeRoute(`/${locale}/${slug}`));
    }
  }

  return byLocale;
}

function localePrefix(locale) {
  return `/${locale}`;
}

function rewriteInternalLinks(bodyHtml, locale, routeMap) {
  if (!bodyHtml) return bodyHtml;

  let next = bodyHtml;

  // Author bio (same slug in every locale).
  next = next.replaceAll(
    'href="/author-roman-shaposhnikov/"',
    `href="${localePrefix(locale)}/author-roman-shaposhnikov/"`,
  );

  // Blog archive and pagination.
  next = next.replaceAll('href="/blog/"', `href="${localePrefix(locale)}/blog/"`);
  next = next.replace(
    /href="\/blog\/page\/(\d+)\/"/g,
    `href="${localePrefix(locale)}/blog/page/$1/"`,
  );

  // Native legal/about shortcuts.
  next = next.replaceAll('href="/user-agreement/"', `href="${localePrefix(locale)}/user-agreement/"`);
  next = next.replaceAll('href="/privacy-policy/"', `href="${localePrefix(locale)}/privacy-policy/"`);

  // Cross-post links from catalog RU routes.
  for (const [ruRoute, localeRoute] of routeMap.entries()) {
    if (ruRoute === '/') continue;
    next = next.replaceAll(`href="${ruRoute}"`, `href="${localeRoute}"`);
    // Unquoted variants in rare markup.
    next = next.replaceAll(`href='${ruRoute}'`, `href='${localeRoute}'`);
  }

  // Homepage CTA on translated pages.
  next = next.replaceAll('href="/"', `href="${localePrefix(locale)}/"`);

  return next;
}

async function main() {
  const catalog = loadCatalog();
  const routeMaps = buildRouteMaps(catalog);
  const files = (await fs.readdir(postsDir)).filter((name) => name.endsWith('.json')).sort();

  let updatedFiles = 0;
  let updatedFields = 0;

  for (const fileName of files) {
    const filePath = path.join(postsDir, fileName);
    const postId = fileName.replace(/\.json$/, '');
    const original = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(original);
    let changed = false;

    for (const locale of TARGET_LOCALES) {
      const copy = data[locale];
      if (!copy?.bodyHtml) continue;

      const rewritten = rewriteInternalLinks(copy.bodyHtml, locale, routeMaps.get(locale));
      if (rewritten !== copy.bodyHtml) {
        copy.bodyHtml = rewritten;
        changed = true;
        updatedFields += 1;
      }
    }

    const enOverride = EN_COPY_OVERRIDES[postId];
    if (enOverride && data.en) {
      for (const [key, value] of Object.entries(enOverride)) {
        if (data.en[key] !== value) {
          data.en[key] = value;
          changed = true;
          updatedFields += 1;
        }
      }
    }

    if (changed) {
      await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
      updatedFiles += 1;
      console.log(`polished ${fileName}`);
    }
  }

  console.log(`polish-post-translations: ${updatedFiles} files, ${updatedFields} field updates`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
