const DEFAULT_SITE_NAME = 'Nuts онлайн покер клуб pppoker россия';
const DEFAULT_IMAGE = 'https://pppoker.pro/assets/media/2025/08/logo-ppp.webp';

const LOCALE_DESCRIPTIONS = {
  en: 'Online poker club NUTS on PPPoker: articles, tournaments, bonuses, poker strategy, private club reviews, and player support.',
  hy: 'NUTS online poker club on PPPoker: articles, tournaments, bonuses, poker strategy, reviews, and player support.',
  kz: 'PPPoker NUTS онлайн покер клубы: мақалалар, турнирлер, бонустар, стратегиялар және ойыншыларға қолдау.',
  tj: 'Клуби онлайнии покери NUTS дар PPPoker: мақолаҳо, мусобиқаҳо, бонусҳо, стратегия ва дастгирии бозигарон.',
  uz: 'PPPoker NUTS onlayn poker klubi: maqolalar, turnirlar, bonuslar, strategiyalar va o‘yinchilar uchun yordam.',
  ru: 'Онлайн покер клуб NUTS на PPPoker: статьи, турниры, бонусы, стратегии, обзоры платформы и поддержка игроков.',
};

const ARCHIVE_DESCRIPTIONS = {
  en: (title) => `${title}: articles, poker news, tournaments, bonuses, and strategy from NUTS online poker club on PPPoker.`,
  hy: (title) => `${title}: NUTS PPPoker online poker club articles, tournaments, bonuses, strategy, and player materials.`,
  kz: (title) => `${title}: PPPoker NUTS онлайн покер клубының мақалалары, жаңалықтары, турнирлері, бонустары және стратегиялары.`,
  tj: (title) => `${title}: мақолаҳо, хабарҳо, мусобиқаҳо, бонусҳо ва стратегияҳо аз клуби онлайнии NUTS дар PPPoker.`,
  uz: (title) => `${title}: PPPoker NUTS onlayn poker klubidan maqolalar, yangiliklar, turnirlar, bonuslar va strategiyalar.`,
  ru: (title) => `${title}: подборка материалов, новостей и стратегий от онлайн покер клуба NUTS на PPPoker.`,
};

const SEARCH_DESCRIPTIONS = {
  en: 'Search results on NUTS PPPoker: articles, reviews, tournaments, bonuses, and online poker materials.',
  hy: 'Search results on NUTS PPPoker: articles, reviews, tournaments, bonuses, and online poker materials.',
  kz: 'NUTS PPPoker сайтындағы іздеу нәтижелері: мақалалар, шолулар, турнирлер, бонустар және онлайн покер материалдары.',
  tj: 'Натиҷаҳои ҷустуҷӯ дар NUTS PPPoker: мақолаҳо, баррасиҳо, мусобиқаҳо, бонусҳо ва маводи покери онлайн.',
  uz: 'NUTS PPPoker saytidagi qidiruv natijalari: maqolalar, sharhlar, turnirlar, bonuslar va onlayn poker materiallari.',
  ru: 'Результаты поиска на сайте NUTS PPPoker: статьи, обзоры, турниры, бонусы и материалы об онлайн покере.',
};

const TITLE_OVERRIDES = {
  'bez-kategorii': 'Без категории',
  uncategorized: 'Uncategorized',
  fb: 'NUTS FB',
  thanks: 'Thanks',
  spasibo: 'Спасибо',
};

export function applySeoSnippet($, context) {
  const head = $('head').first();

  if (head.length === 0 || context.isRedirect) {
    return {
      snippet: readSeoSnippet($, context),
      transforms: [],
    };
  }

  const transforms = [];
  const snippet = buildSeoSnippet($, context);

  setTextTag($, head, 'title', snippet.title, transforms, 'title');
  setMetaAttribute($, head, 'name', 'description', snippet.description, transforms, 'meta description');
  setLinkAttribute($, head, 'canonical', snippet.canonical, transforms, 'canonical');
  setMetaAttribute($, head, 'property', 'og:locale', snippet.ogLocale, transforms, 'og:locale');
  setMetaAttribute($, head, 'property', 'og:type', snippet.ogType, transforms, 'og:type');
  setMetaAttribute($, head, 'property', 'og:title', snippet.title, transforms, 'og:title');
  setMetaAttribute($, head, 'property', 'og:description', snippet.description, transforms, 'og:description');
  setMetaAttribute($, head, 'property', 'og:url', snippet.canonical, transforms, 'og:url');
  setMetaAttribute($, head, 'property', 'og:site_name', snippet.siteName, transforms, 'og:site_name');
  setMetaAttribute($, head, 'property', 'og:image', snippet.image, transforms, 'og:image');
  setMetaAttribute($, head, 'name', 'twitter:card', 'summary_large_image', transforms, 'twitter:card');
  setMetaAttribute($, head, 'name', 'twitter:title', snippet.title, transforms, 'twitter:title');
  setMetaAttribute($, head, 'name', 'twitter:description', snippet.description, transforms, 'twitter:description');
  setMetaAttribute($, head, 'name', 'twitter:image', snippet.image, transforms, 'twitter:image');

  return {
    snippet: readSeoSnippet($, context),
    transforms,
  };
}

export function readSeoSnippet($, context) {
  const title = normalizeText($('head title').first().text());
  const description = $('head meta[name="description"]').first().attr('content') ?? '';
  const canonical = $('head link[rel="canonical"]').first().attr('href') ?? '';

  return {
    route: context.route,
    locale: context.locale,
    type: context.type,
    title,
    description,
    canonical,
    ogTitle: $('head meta[property="og:title"]').first().attr('content') ?? '',
    ogDescription: $('head meta[property="og:description"]').first().attr('content') ?? '',
    ogUrl: $('head meta[property="og:url"]').first().attr('content') ?? '',
    ogImage: $('head meta[property="og:image"]').first().attr('content') ?? '',
    twitterCard: $('head meta[name="twitter:card"]').first().attr('content') ?? '',
    twitterTitle: $('head meta[name="twitter:title"]').first().attr('content') ?? '',
    twitterDescription: $('head meta[name="twitter:description"]').first().attr('content') ?? '',
    twitterImage: $('head meta[name="twitter:image"]').first().attr('content') ?? '',
  };
}

function buildSeoSnippet($, context) {
  const existing = readSeoSnippet($, context);
  const routeTitle = titleFromRoute(context.route);
  const title = normalizeText(existing.title || existing.ogTitle || routeTitle || DEFAULT_SITE_NAME);
  const locale = context.locale || 'ru';
  const description = normalizeDescription(
    existing.description
      || existing.ogDescription
      || descriptionFromPageType(context, title)
      || LOCALE_DESCRIPTIONS[locale]
      || LOCALE_DESCRIPTIONS.ru,
  );
  const canonical = existing.canonical || existing.ogUrl || absoluteUrlForRoute(context.route);
  const image = existing.ogImage || existing.twitterImage || DEFAULT_IMAGE;

  return {
    title,
    description,
    canonical,
    image,
    siteName: existingSiteName($) || DEFAULT_SITE_NAME,
    ogLocale: ogLocaleFromLocale(locale),
    ogType: context.type === 'post' ? 'article' : 'website',
  };
}

function setTextTag($, head, tagName, value, transforms, label) {
  const existing = head.find(tagName).first();

  if (existing.length > 0) {
    if (!normalizeText(existing.text())) {
      existing.text(value);
      transforms.push(`filled ${label}`);
    }

    return;
  }

  head.prepend(`<${tagName}>${escapeHtml(value)}</${tagName}>`);
  transforms.push(`added ${label}`);
}

function setMetaAttribute($, head, attributeName, attributeValue, content, transforms, label) {
  const selector = `meta[${attributeName}="${attributeValue}"]`;
  const existing = head.find(selector).first();

  if (existing.length > 0) {
    if (!existing.attr('content')) {
      existing.attr('content', content);
      transforms.push(`filled ${label}`);
    }

    return;
  }

  head.append(`<meta ${attributeName}="${attributeValue}" content="${escapeHtml(content)}">`);
  transforms.push(`added ${label}`);
}

function setLinkAttribute($, head, rel, href, transforms, label) {
  const existing = head.find(`link[rel="${rel}"]`).first();

  if (existing.length > 0) {
    if (!existing.attr('href')) {
      existing.attr('href', href);
      transforms.push(`filled ${label}`);
    }

    return;
  }

  head.append(`<link rel="${rel}" href="${escapeHtml(href)}">`);
  transforms.push(`added ${label}`);
}

function descriptionFromPageType(context, title) {
  const localeDescription = LOCALE_DESCRIPTIONS[context.locale] || LOCALE_DESCRIPTIONS.ru;
  const cleanTitle = stripSiteSuffix(title);

  if (context.type === 'category' || context.type === 'tag' || context.type === 'blog-index' || context.type === 'blog-page') {
    return (ARCHIVE_DESCRIPTIONS[context.locale] || ARCHIVE_DESCRIPTIONS.ru)(cleanTitle);
  }

  if (context.type === 'search') {
    return SEARCH_DESCRIPTIONS[context.locale] || SEARCH_DESCRIPTIONS.ru;
  }

  if (context.type === 'page') {
    return `${cleanTitle}. ${localeDescription}`;
  }

  return localeDescription;
}

function titleFromRoute(route = '/') {
  if (route === '/') {
    return DEFAULT_SITE_NAME;
  }

  const slug = route
    .split('/')
    .filter(Boolean)
    .at(-1);

  if (!slug) {
    return DEFAULT_SITE_NAME;
  }

  return TITLE_OVERRIDES[slug]
    ?? slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function absoluteUrlForRoute(route = '/') {
  return `https://pppoker.pro${route}`;
}

function existingSiteName($) {
  return $('head meta[property="og:site_name"]').first().attr('content') ?? '';
}

function ogLocaleFromLocale(locale) {
  return {
    en: 'en_US',
    hy: 'hy_AM',
    kz: 'kk_KZ',
    tj: 'tg_TJ',
    uz: 'uz_UZ',
    ru: 'ru_RU',
  }[locale] ?? 'ru_RU';
}

function stripSiteSuffix(title) {
  return normalizeText(title.split(' - ')[0]);
}

function normalizeDescription(value) {
  return normalizeText(value).slice(0, 300);
}

function normalizeText(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
