import React from 'react';

import { HtmlFragment } from './HtmlFragment.mjs';
import { LegacyFooter, LegacyHeader } from './LegacyFragments.mjs';
import { normalizeReactAttributes } from './htmlAttributes.mjs';

export function StaticDocument({
  htmlAttributes,
  headHtml,
  bodyAttributes,
  bodyFragments,
}) {
  return React.createElement(
    'html',
    normalizeReactAttributes(htmlAttributes),
    React.createElement(
      'head',
      null,
      React.createElement(HtmlFragment, {
        html: headHtml,
        keyPrefix: 'head',
      }),
    ),
    React.createElement(
      'body',
      normalizeReactAttributes(bodyAttributes),
      React.createElement(HtmlFragment, {
        html: bodyFragments.beforeHeaderHtml,
        keyPrefix: 'before-header',
      }),
      React.createElement(LegacyHeader, {
        fragment: bodyFragments.header,
      }),
      React.createElement(HtmlFragment, {
        html: bodyFragments.contentHtml,
        keyPrefix: 'content',
      }),
      React.createElement(LegacyFooter, {
        fragment: bodyFragments.footer,
      }),
      React.createElement(HtmlFragment, {
        html: bodyFragments.afterFooterHtml,
        keyPrefix: 'after-footer',
      }),
    ),
  );
}
