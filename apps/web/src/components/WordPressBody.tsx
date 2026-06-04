import type { PageEntry } from '@/lib/types';

type WordPressBodyProps = {
  page: PageEntry;
  bodyHtml: string;
  bodyClassName?: string;
};

export function WordPressBody({ page, bodyHtml, bodyClassName }: WordPressBodyProps) {
  return (
    <div
      id="wordpress-page-root"
      data-route={page.route}
      data-locale={page.locale}
      className={bodyClassName}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
