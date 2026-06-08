export function fixStructuredData($, context = {}) {
  const transforms = [];
  const pageUrl = pageUrlFromContext($, context);

  $('script[type="application/ld+json"]').each((_, element) => {
    const script = $(element);
    const source = script.html();

    if (!source || !source.includes('BreadcrumbList')) {
      return;
    }

    let data;

    try {
      data = JSON.parse(source);
    } catch {
      return;
    }

    const fixedCount = fixJsonLdBreadcrumbItems(data, pageUrl);

    if (fixedCount === 0) {
      return;
    }

    script.text(JSON.stringify(data));
    transforms.push({
      name: 'fix-breadcrumb-list-items',
      fixedCount,
    });
  });

  return transforms;
}

export function collectStructuredDataIssues($) {
  const issues = [];

  $('script[type="application/ld+json"]').each((scriptIndex, element) => {
    const script = $(element);
    const source = script.html();

    if (!source || !source.includes('BreadcrumbList')) {
      return;
    }

    let data;

    try {
      data = JSON.parse(source);
    } catch {
      issues.push({
        scriptIndex,
        message: 'Invalid JSON-LD',
      });
      return;
    }

    for (const breadcrumbList of findBreadcrumbLists(data)) {
      const items = normalizeArray(breadcrumbList.itemListElement);

      items.forEach((item, itemIndex) => {
        if (isListItem(item) && !item.item) {
          issues.push({
            scriptIndex,
            itemIndex,
            position: item.position ?? null,
            name: item.name ?? '',
            message: 'BreadcrumbList ListItem is missing item',
          });
        }
      });
    }
  });

  return issues;
}

export function fixJsonLdBreadcrumbItems(data, pageUrl) {
  let fixedCount = 0;

  for (const breadcrumbList of findBreadcrumbLists(data)) {
    const items = normalizeArray(breadcrumbList.itemListElement);
    const maxPosition = Math.max(
      ...items.map((item, index) => Number(item?.position ?? index + 1)),
      0,
    );

    items.forEach((item, index) => {
      if (!isListItem(item) || item.item) {
        return;
      }

      item.item = itemUrlForListItem(item, index, maxPosition, pageUrl);
      fixedCount += 1;
    });
  }

  return fixedCount;
}

function itemUrlForListItem(item, index, maxPosition, pageUrl) {
  const position = Number(item.position ?? index + 1);

  if (position === maxPosition) {
    return pageUrl;
  }

  return pageUrl;
}

function findBreadcrumbLists(data) {
  const nodes = [];

  visitJsonLd(data, (node) => {
    if (isBreadcrumbList(node)) {
      nodes.push(node);
    }
  });

  return nodes;
}

function visitJsonLd(value, visitor) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => visitJsonLd(item, visitor));
    return;
  }

  visitor(value);

  for (const nested of Object.values(value)) {
    visitJsonLd(nested, visitor);
  }
}

function isBreadcrumbList(node) {
  return normalizeArray(node?.['@type']).includes('BreadcrumbList');
}

function isListItem(node) {
  return normalizeArray(node?.['@type']).includes('ListItem');
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [value];
}

function pageUrlFromContext($, context) {
  const canonical = $('head link[rel="canonical"]').first().attr('href');

  if (canonical) {
    return canonical;
  }

  if (context.route) {
    return `https://pppoker.pro${context.route}`;
  }

  const ogUrl = $('head meta[property="og:url"]').first().attr('content');

  if (ogUrl) {
    return ogUrl;
  }

  return 'https://pppoker.pro/';
}
