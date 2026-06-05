import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import {
  getBodyHtml,
  getHomeBodyParts,
  getPageBySlug,
  getPagesByLocale,
  slugParamsFromPage,
} from '@/lib/content';
import { splitHomepageBodyForNativeBlog } from '@/lib/splitHomepageBody';
import { buildPageMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug?: string[] }> = [];

  for (const locale of routing.locales) {
    const pages = await getPagesByLocale(locale as AppLocale);
    for (const page of pages) {
      if (
        page.type === 'blog' ||
        page.route.match(/\/blog\/page\/\d+\/$/) ||
        page.route.match(/\/category\/blog\/page\/\d+\/$/)
      ) {
        continue;
      }
      params.push({
        locale,
        slug: slugParamsFromPage(page, locale as AppLocale),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug, locale as AppLocale);

  if (!page) {
    return { title: 'Not Found' };
  }

  return buildPageMetadata(page);
}

export default async function CatchAllPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const page = await getPageBySlug(slug, appLocale);

  if (!page) {
    notFound();
  }

  const bodyHtml = await getBodyHtml(page);
  const homeParts = await getHomeBodyParts(page);
  const runtimeSplit =
    page.route === '/' && !homeParts
      ? splitHomepageBodyForNativeBlog(bodyHtml)
      : null;

  return (
    <PageShell
      page={page}
      bodyHtml={bodyHtml}
      bodyBeforeHtml={homeParts?.beforeHtml ?? runtimeSplit?.beforeHtml}
      bodyAfterHtml={homeParts?.afterHtml ?? runtimeSplit?.afterHtml}
    />
  );
}
