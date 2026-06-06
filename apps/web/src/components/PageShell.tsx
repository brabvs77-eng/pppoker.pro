import type { ReactNode } from 'react';

import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import { JsonLd } from '@/components/JsonLd';
import { HomeBlogRotator } from '@/components/native/HomeBlogRotator';
import { HomePromo } from '@/components/native/HomePromo';
import { SiteFooter } from '@/components/native/SiteFooter';
import { SiteHeader } from '@/components/native/SiteHeader';
import { WordPressBody } from '@/components/WordPressBody';
import { WordPressHead } from '@/components/WordPressHead';
import { WordPressRuntimeScripts } from '@/components/WordPressRuntimeScripts';
import { homePromoRoutes, homepageRotatingBlogRoutes } from '@/config/site';
import type { PageEntry } from '@/lib/types';

type PageShellProps = {
  page: PageEntry;
  bodyHtml: string;
  children?: ReactNode;
};

export function PageShell({ page, bodyHtml, children }: PageShellProps) {
  const bodyClass = page.bodyAttributes.class;
  const showHomePromo = (homePromoRoutes as readonly string[]).includes(page.route);
  const showRotatingBlog = (homepageRotatingBlogRoutes as readonly string[]).includes(
    page.route,
  );
  const hasElementorFooter = bodyHtml.includes('id="colophon"');

  return (
    <>
      <WordPressHead page={page} />
      <JsonLd blocks={page.jsonLd} />
      <SiteHeader page={page} />
      {showHomePromo ? <HomePromo locale={page.locale} /> : null}
      {children ?? (
        <WordPressBody page={page} bodyHtml={bodyHtml} bodyClassName={bodyClass} />
      )}
      {showRotatingBlog ? <HomeBlogRotator locale={page.locale} /> : null}
      <SiteFooter page={page} variant={hasElementorFooter ? 'locale-only' : 'full'} />
      <AnalyticsScripts />
      <WordPressRuntimeScripts scripts={page.runtimeScripts ?? []} />
    </>
  );
}
