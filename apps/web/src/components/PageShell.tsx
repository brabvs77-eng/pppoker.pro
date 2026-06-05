import type { ReactNode } from 'react';

import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import { JsonLd } from '@/components/JsonLd';
import { HomeBlogRotator } from '@/components/native/HomeBlogRotator';
import { HomePromo } from '@/components/native/HomePromo';
import { SiteFooter } from '@/components/native/SiteFooter';
import { SiteHeader } from '@/components/native/SiteHeader';
import { WordPressBody } from '@/components/WordPressBody';
import { WordPressHead } from '@/components/WordPressHead';
import { homePromoRoutes, homepageRotatingBlogRoutes } from '@/config/site';
import type { PageEntry } from '@/lib/types';

type PageShellProps = {
  page: PageEntry;
  bodyHtml: string;
  bodyBeforeHtml?: string;
  bodyAfterHtml?: string;
  children?: ReactNode;
};

type PageShellBodyProps = {
  page: PageEntry;
  bodyHtml: string;
  bodyBeforeHtml?: string;
  bodyAfterHtml?: string;
};

function PageShellBody({
  page,
  bodyHtml,
  bodyBeforeHtml,
  bodyAfterHtml,
}: PageShellBodyProps) {
  const bodyClass = page.bodyAttributes.class;
  const showRotatingBlog = (homepageRotatingBlogRoutes as readonly string[]).includes(
    page.route,
  );
  const usesSplitBody = bodyBeforeHtml != null && bodyAfterHtml != null;

  return (
    <WordPressBody
      page={page}
      bodyHtml={usesSplitBody ? undefined : bodyHtml}
      bodyBeforeHtml={bodyBeforeHtml}
      bodyAfterHtml={bodyAfterHtml}
      bodyClassName={bodyClass}
      middleContent={
        showRotatingBlog && usesSplitBody ? (
          <HomeBlogRotator locale={page.locale} />
        ) : null
      }
    />
  );
}

export function PageShell({
  page,
  bodyHtml,
  bodyBeforeHtml,
  bodyAfterHtml,
  children,
}: PageShellProps) {
  const showHomePromo = (homePromoRoutes as readonly string[]).includes(page.route);
  const showRotatingBlog = (homepageRotatingBlogRoutes as readonly string[]).includes(
    page.route,
  );
  const usesSplitBody = bodyBeforeHtml != null && bodyAfterHtml != null;

  return (
    <>
      <WordPressHead page={page} />
      <JsonLd blocks={page.jsonLd} />
      <SiteHeader page={page} />
      {showHomePromo ? <HomePromo locale={page.locale} /> : null}
      {children ?? (
        <PageShellBody
          page={page}
          bodyHtml={bodyHtml}
          bodyBeforeHtml={bodyBeforeHtml}
          bodyAfterHtml={bodyAfterHtml}
        />
      )}
      {showRotatingBlog && !usesSplitBody ? (
        <HomeBlogRotator locale={page.locale} />
      ) : null}
      <SiteFooter page={page} />
      <AnalyticsScripts />
      {page.bodyScripts.map((src) => (
        <script key={src} src={src} defer />
      ))}
    </>
  );
}
