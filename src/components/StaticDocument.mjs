import React from 'react';

import { normalizeReactAttributes } from './htmlAttributes.mjs';

export function StaticDocument({
  htmlAttributes,
  headHtml,
  bodyAttributes,
  bodyHtml,
}) {
  return React.createElement(
    'html',
    normalizeReactAttributes(htmlAttributes),
    React.createElement('head', {
      dangerouslySetInnerHTML: { __html: headHtml },
    }),
    React.createElement('body', {
      ...normalizeReactAttributes(bodyAttributes),
      dangerouslySetInnerHTML: { __html: bodyHtml },
    }),
  );
}
