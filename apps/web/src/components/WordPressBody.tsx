import { hideLegacyBlogSectionRoutes, homePromoRoutes } from '@/config/site';
import type { PageEntry } from '@/lib/types';

type WordPressBodyProps = {
  page: PageEntry;
  bodyHtml: string;
  bodyClassName?: string;
};

export function WordPressBody({ page, bodyHtml, bodyClassName }: WordPressBodyProps) {
  const onHomeNative = (homePromoRoutes as readonly string[]).includes(page.route);
  const hideLegacyBlog = (hideLegacyBlogSectionRoutes as readonly string[]).includes(
    page.route,
  );

  return (
    <div
      id="wordpress-page-root"
      suppressHydrationWarning
      data-route={page.route}
      data-locale={page.locale}
      data-native-chrome=""
      data-home-promo={onHomeNative ? '' : undefined}
      data-hide-legacy-blog={hideLegacyBlog ? '' : undefined}
      className={bodyClassName}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
