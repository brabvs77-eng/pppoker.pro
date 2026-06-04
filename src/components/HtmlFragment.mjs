import React from 'react';
import { load } from 'cheerio';

import { normalizeReactAttributes } from './htmlAttributes.mjs';

const RAW_TEXT_TAGS = new Set(['script', 'style']);

export function HtmlFragment({ html, keyPrefix = 'html-fragment' }) {
  if (!html) {
    return null;
  }

  const $ = load(html, { decodeEntities: false }, false);
  const children = $.root()
    .contents()
    .toArray()
    .map((node, index) => renderNode($, node, `${keyPrefix}-${index}`))
    .filter((node) => node !== null && node !== undefined);

  return React.createElement(React.Fragment, null, ...children);
}

function renderNode($, node, key) {
  if (node.type === 'text') {
    return node.data ?? '';
  }

  if (node.type === 'comment') {
    return null;
  }

  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') {
    return null;
  }

  const tagName = (node.name || node.tagName || '').toLowerCase();
  const attributes = normalizeReactAttributes(node.attribs ?? {});
  const props = { key, ...attributes };

  if (RAW_TEXT_TAGS.has(tagName)) {
    return React.createElement(tagName, {
      ...props,
      dangerouslySetInnerHTML: { __html: serializeChildren($, node) },
    });
  }

  const children = (node.children ?? [])
    .map((child, index) => renderNode($, child, `${key}-${index}`))
    .filter((child) => child !== null && child !== undefined);

  return React.createElement(tagName, props, ...children);
}

function serializeChildren($, node) {
  return (node.children ?? []).map((child) => $.html(child)).join('');
}
