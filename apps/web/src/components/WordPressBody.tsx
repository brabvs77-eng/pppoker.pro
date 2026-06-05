import type { ReactNode } from 'react';

import { hideLegacyBlogSectionRoutes, homePromoRoutes } from '@/config/site';
import type { PageEntry } from '@/lib/types';

type WordPressBodyProps = {
  page: PageEntry;
  bodyHtml?: string;
  bodyBeforeHtml?: string;
  bodyAfterHtml?: string;
  middleContent?: ReactNode;
  bodyClassName?: string;
};

export function WordPressBody({
  page,
  bodyHtml,
  bodyBeforeHtml,
  bodyAfterHtml,
  middleContent,
  bodyClassName,
}: WordPressBodyProps) {
  const onHomeNative = (homePromoRoutes as readonly string[]).includes(page.route);
  const hideLegacyBlog = (hideLegacyBlogSectionRoutes as readonly string[]).includes(
    page.route,
  );
  const usesSplitBody = bodyBeforeHtml != null && bodyAfterHtml != null;

  return (
    <div
      id="wordpress-page-root"
      data-route={page.route}
      data-locale={page.locale}
      data-native-chrome=""
      data-home-promo={onHomeNative ? '' : undefined}
      data-hide-legacy-blog={hideLegacyBlog ? '' : undefined}
      className={bodyClassName}
    >
      {usesSplitBody ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: bodyBeforeHtml }} />
          {middleContent}
          <div dangerouslySetInnerHTML={{ __html: bodyAfterHtml }} />
        </>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: bodyHtml ?? '' }} />
      )}
    </div>
  );
}
