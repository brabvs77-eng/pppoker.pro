import React from 'react';

import { normalizeReactAttributes } from './htmlAttributes.mjs';

export function LegacyHeader({ fragment }) {
  return React.createElement(LegacyElement, {
    fallbackTagName: 'header',
    fragment,
  });
}

export function LegacyFooter({ fragment }) {
  return React.createElement(LegacyElement, {
    fallbackTagName: 'footer',
    fragment,
  });
}

function LegacyElement({ fallbackTagName, fragment }) {
  if (!fragment?.tagName) {
    return null;
  }

  return React.createElement(fragment.tagName || fallbackTagName, {
    ...normalizeReactAttributes(fragment.attributes),
    dangerouslySetInnerHTML: { __html: fragment.innerHtml },
  });
}
