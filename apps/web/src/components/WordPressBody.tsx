import { hideBlogLoopRoutes, homePromoRoutes } from '@/config/site';
import type { PageEntry } from '@/lib/types';

type WordPressBodyProps = {
  page: PageEntry;
  bodyHtml: string;
  bodyClassName?: string;
};

export function WordPressBody({ page, bodyHtml, bodyClassName }: WordPressBodyProps) {
  const onHomeNative = (homePromoRoutes as readonly string[]).includes(page.route);
  const hideBlogLoop = (hideBlogLoopRoutes as readonly string[]).includes(page.route);

  return (
    <div
      id="wordpress-page-root"
      data-route={page.route}
      data-locale={page.locale}
      data-native-chrome=""
      data-home-promo={onHomeNative ? '' : undefined}
      data-hide-blog-loop={hideBlogLoop ? '' : undefined}
      className={bodyClassName}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
