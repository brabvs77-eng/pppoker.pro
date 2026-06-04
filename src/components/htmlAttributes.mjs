export function normalizeReactAttributes(attributes = {}) {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => {
      if (name === 'style') {
        return ['style', cssTextToReactStyle(value)];
      }

      return [attributeNameMap[name] ?? name, normalizeAttributeValue(name, value)];
    }),
  );
}

const attributeNameMap = {
  acceptcharset: 'acceptCharset',
  accesskey: 'accessKey',
  allowfullscreen: 'allowFullScreen',
  autocomplete: 'autoComplete',
  autoplay: 'autoPlay',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  charset: 'charSet',
  class: 'className',
  colspan: 'colSpan',
  contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  enctype: 'encType',
  fetchpriority: 'fetchPriority',
  for: 'htmlFor',
  frameborder: 'frameBorder',
  hreflang: 'hrefLang',
  'http-equiv': 'httpEquiv',
  imagesizes: 'imageSizes',
  imagesrcset: 'imageSrcSet',
  itemscope: 'itemScope',
  itemprop: 'itemProp',
  itemtype: 'itemType',
  maxlength: 'maxLength',
  minlength: 'minLength',
  readonly: 'readOnly',
  rowspan: 'rowSpan',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srcset: 'srcSet',
  tabindex: 'tabIndex',
  usemap: 'useMap',
  viewbox: 'viewBox',
  controlslist: 'controlsList',
  playsinline: 'playsInline',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'fill-rule': 'fillRule',
  'stop-color': 'stopColor',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-width': 'strokeWidth',
  xlinkhref: 'xlinkHref',
};

function normalizeAttributeValue(name, value) {
  if ((name === 'itemscope' || name === 'inert' || name === 'playsinline') && value === '') {
    return true;
  }

  return value;
}

function cssTextToReactStyle(cssText = '') {
  return Object.fromEntries(
    cssText
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const separatorIndex = declaration.indexOf(':');

        if (separatorIndex === -1) {
          return null;
        }

        const property = declaration.slice(0, separatorIndex).trim();
        const value = declaration.slice(separatorIndex + 1).trim();

        if (!property) {
          return null;
        }

        return [toReactStyleProperty(property), value];
      })
      .filter(Boolean),
  );
}

function toReactStyleProperty(property) {
  if (property.startsWith('--')) {
    return property;
  }

  return property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
