import type { PageEntry } from '@/lib/types';

type WordPressBodyProps = {
  page: PageEntry;
  bodyHtml: string;
};

export function WordPressBody({ page, bodyHtml }: WordPressBodyProps) {
  return (
    <div
      id="wordpress-page-root"
      data-route={page.route}
      data-locale={page.locale}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
