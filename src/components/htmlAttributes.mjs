export function normalizeReactAttributes(attributes = {}) {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => {
      if (name === 'class') {
        return ['className', value];
      }

      if (name === 'itemscope') {
        return ['itemScope', value];
      }

      if (name === 'itemtype') {
        return ['itemType', value];
      }

      return [name, value];
    }),
  );
}
