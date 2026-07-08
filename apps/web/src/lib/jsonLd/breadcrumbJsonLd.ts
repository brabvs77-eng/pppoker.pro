import { absoluteUrl } from './urls';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
