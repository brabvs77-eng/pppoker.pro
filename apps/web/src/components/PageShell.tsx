import type { ReactNode } from 'react';

import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import { JsonLd } from '@/components/JsonLd';
import { LegacyElementorBoot } from '@/components/LegacyElementorBoot';
import { BlogJsonLdBlock } from '@/components/native/BlogJsonLdBlock';
import { HomePromo } from '@/components/native/HomePromo';
import { ReviewSnippetsJsonLd } from '@/components/native/ReviewSnippetsJsonLd';
import { NativeBlogArchive } from '@/components/native/NativeBlogArchive';
import { NativePage } from '@/components/native/NativePage';
import { StructuredPost } from '@/components/native/StructuredPost';
import { SiteFooter } from '@/components/native/SiteFooter';
import { SiteHeader } from '@/components/native/SiteHeader';
import { WordPressBody } from '@/components/WordPressBody';
import { WordPressHead } from '@/components/WordPressHead';
import { WordPressRuntimeScripts } from '@/components/WordPressRuntimeScripts';
import { homePromoRoutes } from '@/config/site';
import type { BlogArchiveSlice } from '@/lib/blogArchive';
import type { AppLocale } from '@/i18n/routing';
import type { PageEntry, PageRecord, PostRecord } from '@/lib/types';

type PageShellProps = {
  page: PageEntry;
  bodyHtml: string;
  structuredPost?: PostRecord | null;
  nativePage?: PageRecord | null;
  nativeBlog?: BlogArchiveSlice | null;
  children?: ReactNode;
};

export function PageShell({
  page,
  bodyHtml,
  structuredPost,
  nativePage,
  nativeBlog,
  children,
}: PageShellProps) {
  const bodyClass = page.bodyAttributes.class;
  const showHomePromo = (homePromoRoutes as readonly string[]).includes(page.route);
  const useLegacyBody = !structuredPost && !nativePage && !nativeBlog;
  const hasElementorFooter = useLegacyBody && bodyHtml.includes('id="colophon"');
  const loadPageStyles = useLegacyBody || Boolean(structuredPost) || Boolean(nativePage);
  const loadElementorRuntime = useLegacyBody && page.needsElementorRuntime;
  const useNativeBlogJsonLd = Boolean(nativeBlog || structuredPost);

  return (
    <>
      {loadPageStyles ? <WordPressHead page={page} /> : null}
      <JsonLd blocks={useNativeBlogJsonLd ? [] : page.jsonLd} />
      {nativeBlog ? (
        <BlogJsonLdBlock locale={page.locale as AppLocale} route={page.route} />
      ) : null}
      {structuredPost ? (
        <BlogJsonLdBlock locale={page.locale as AppLocale} post={structuredPost} />
      ) : null}
      {showHomePromo ? (
        <ReviewSnippetsJsonLd locale={page.locale as AppLocale} />
      ) : null}
      <SiteHeader page={page} />
      {showHomePromo ? <HomePromo locale={page.locale} /> : null}
      {children ??
        (nativeBlog ? (
          <NativeBlogArchive locale={page.locale as AppLocale} archive={nativeBlog} />
        ) : nativePage ? (
          <NativePage page={nativePage} />
        ) : structuredPost ? (
          <StructuredPost post={structuredPost} />
        ) : (
          <WordPressBody page={page} bodyHtml={bodyHtml} bodyClassName={bodyClass} />
        ))}
      <SiteFooter page={page} variant={hasElementorFooter ? 'locale-only' : 'full'} />
      <AnalyticsScripts />
      {loadElementorRuntime ? (
        <>
          <WordPressRuntimeScripts scripts={page.runtimeScripts ?? []} />
          <LegacyElementorBoot />
        </>
      ) : null}
    </>
  );
}
