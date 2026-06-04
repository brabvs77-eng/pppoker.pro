/**
 * Derives core (shared) vs page-specific stylesheets from per-page link lists.
 */

const CORE_FREQUENCY_RATIO = 0.85;
const MIN_CORE_SIZE = 15;

const SEED_ROUTES = ['/', '/elementor-hf/shapka-2/', '/elementor-hf/podval/'];

/**
 * @param {Array<{ route: string, stylesheets: string[], isRedirect?: boolean }>} pages
 */
export function computeCssBudget(pages) {
  const active = pages.filter((page) => !page.isRedirect);
  const frequency = new Map();

  for (const page of active) {
    for (const href of page.stylesheets) {
      frequency.set(href, (frequency.get(href) || 0) + 1);
    }
  }

  const threshold = Math.ceil(active.length * CORE_FREQUENCY_RATIO);
  const core = new Set();

  for (const [href, count] of frequency) {
    if (count >= threshold) {
      core.add(href);
    }
  }

  if (core.size < MIN_CORE_SIZE) {
    for (const route of SEED_ROUTES) {
      const seedPage = active.find((page) => page.route === route);
      if (seedPage) {
        for (const href of seedPage.stylesheets) {
          core.add(href);
        }
      }
    }
  }

  const coreStylesheets = [...core].sort();
  const coreSet = new Set(coreStylesheets);

  const pagesWithBudget = pages.map((page) => {
    const pageSpecificStylesheets = page.isRedirect
      ? []
      : page.stylesheets.filter((href) => !coreSet.has(href));

    return {
      ...page,
      stylesheets: pageSpecificStylesheets,
    };
  });

  const allStylesheets = [...frequency.keys()].sort();

  return {
    coreStylesheets,
    allStylesheets,
    pages: pagesWithBudget,
    stats: {
      totalUnique: allStylesheets.length,
      coreCount: coreStylesheets.length,
      activePages: active.length,
      threshold,
      averagePageSpecific:
        pagesWithBudget
          .filter((page) => !page.isRedirect)
          .reduce((sum, page) => sum + page.stylesheets.length, 0) /
        Math.max(active.length, 1),
    },
  };
}
