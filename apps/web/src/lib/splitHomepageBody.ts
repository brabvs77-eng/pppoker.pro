import { homepageLegacyBlogSectionElementId } from '@/config/site';

export type HomepageBodySplit = {
  beforeHtml: string;
  afterHtml: string;
};

/**
 * Splits homepage WordPress HTML around the legacy Elementor blog container so a
 * native block can be rendered between the fragments inside #wordpress-page-root.
 */
export function splitHomepageBodyForNativeBlog(
  bodyHtml: string,
  legacySectionId = homepageLegacyBlogSectionElementId,
): HomepageBodySplit | null {
  const classNeedle = `elementor-element-${legacySectionId}`;
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return null;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return null;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return null;

  return {
    beforeHtml: bodyHtml.slice(0, divStart),
    afterHtml: bodyHtml.slice(divEnd),
  };
}

function findMatchingDivClose(html: string, divStart: number): number {
  let pos = divStart;
  let depth = 0;
  const len = html.length;

  while (pos < len) {
    const open = html.indexOf('<div', pos);
    const close = html.indexOf('</div>', pos);
    if (close === -1) return -1;

    if (open !== -1 && open < close) {
      depth += 1;
      pos = open + 4;
      continue;
    }

    depth -= 1;
    pos = close + 6;
    if (depth === 0) return pos;
  }

  return -1;
}
