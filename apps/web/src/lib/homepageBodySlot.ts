import {
  homepageLegacyBlogSectionElementId,
  nativeHomeBlogSlotId,
} from '@/config/site';

export const nativeHomeBlogSlotHtml = `<div id="${nativeHomeBlogSlotId}"></div>`;

/**
 * Removes the legacy Elementor blog container and inserts a mount slot for the
 * native home-blog slot. Returns one contiguous HTML fragment (balanced divs).
 */
export function replaceLegacyBlogWithSlot(
  bodyHtml: string,
  legacySectionId = homepageLegacyBlogSectionElementId,
): string | null {
  const classNeedle = `elementor-element-${legacySectionId}`;
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return null;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return null;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return null;

  return `${bodyHtml.slice(0, divStart)}${nativeHomeBlogSlotHtml}${bodyHtml.slice(divEnd)}`;
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

export function divTagBalance(html: string): number {
  const opens = (html.match(/<div/gi) ?? []).length;
  const closes = (html.match(/<\/div>/gi) ?? []).length;
  return opens - closes;
}
