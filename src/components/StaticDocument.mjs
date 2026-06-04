import React from 'react';

function normalizeReactAttributes(attributes = {}) {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => {
      if (name === 'class') {
        return ['className', value];
      }

      return [name, value];
    }),
  );
}

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
