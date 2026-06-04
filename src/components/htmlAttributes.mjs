export function normalizeReactAttributes(attributes = {}) {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => {
      if (name === 'class') {
        return ['className', value];
      }

      return [name, value];
    }),
  );
}
