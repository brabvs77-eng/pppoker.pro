import type { ReactNode } from 'react';

import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import { JsonLd } from '@/components/JsonLd';
import { LegacyElementorBoot } from '@/components/LegacyElementorBoot';
import { HomePromo } from '@/components/native/HomePromo';
import { NativeBlogArchive } from '@/components/native/NativeBlogArchive';
import { StructuredPost } from '@/components/native/StructuredPost';
import { SiteFooter } from '@/components/native/SiteFooter';
import { SiteHeader } from '@/components/native/SiteHeader';
import { WordPressBody } from '@/components/WordPressBody';
import { WordPressHead } from '@/components/WordPressHead';
import { WordPressRuntimeScripts } from '@/components/WordPressRuntimeScripts';
import { homePromoRoutes } from '@/config/site';
import type { BlogArchiveSlice } from '@/lib/blogArchive';
import type { AppLocale } from '@/i18n/routing';
import type { PageEntry, PostRecord } from '@/lib/types';

type PageShellProps = {
  page: PageEntry;
  bodyHtml: string;
  structuredPost?: PostRecord | null;
  nativeBlog?: BlogArchiveSlice | null;
  children?: ReactNode;
};

export function PageShell({
  page,
  bodyHtml,
  structuredPost,
  nativeBlog,
  children,
}: PageShellProps) {
  const bodyClass = page.bodyAttributes.class;
  const showHomePromo = (homePromoRoutes as readonly string[]).includes(page.route);
  const useLegacyBody = !structuredPost && !nativeBlog;
  const hasElementorFooter = useLegacyBody && bodyHtml.includes('id="colophon"');
  const loadPageStyles = useLegacyBody || Boolean(structuredPost);
  const loadElementorRuntime = useLegacyBody && page.needsElementorRuntime;

  return (
    <>
      {loadPageStyles ? <WordPressHead page={page} /> : null}
      <JsonLd blocks={page.jsonLd} />
      <SiteHeader page={page} />
      {showHomePromo ? <HomePromo locale={page.locale} /> : null}
      {children ??
        (nativeBlog ? (
          <NativeBlogArchive locale={page.locale as AppLocale} archive={nativeBlog} />
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
