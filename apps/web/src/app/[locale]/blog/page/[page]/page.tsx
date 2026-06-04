import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import { getBodyHtml, getBlogArchiveManifestPages, getPageByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

type BlogPaginationProps = {
  params: Promise<{ locale: string; page: string }>;
};

export async function generateStaticParams() {
  const result: Array<{ locale: string; page: string }> = [];

  for (const locale of routing.locales) {
    const archivePages = await getBlogArchiveManifestPages(locale as AppLocale);
    for (const entry of archivePages) {
      const match = entry.route.match(/\/blog\/page\/(\d+)\/$/);
      if (match) {
        result.push({ locale, page: match[1] });
      }
    }
  }

  return result;
}

export async function generateMetadata({ params }: BlogPaginationProps) {
  const { locale, page: pageNum } = await params;
  const route =
    locale === 'ru' ? `/blog/page/${pageNum}/` : `/${locale}/blog/page/${pageNum}/`;
  const manifestPage = await getPageByRoute(route);

  if (!manifestPage) return { title: 'Blog' };
  return buildPageMetadata(manifestPage);
}

export default async function BlogPaginationPage({ params }: BlogPaginationProps) {
  const { locale, page: pageNum } = await params;
  const appLocale = locale as AppLocale;
  const pageNumber = Number.parseInt(pageNum, 10);

  if (Number.isNaN(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const route =
    appLocale === 'ru' ? `/blog/page/${pageNumber}/` : `/${appLocale}/blog/page/${pageNumber}/`;
  const manifestPage = await getPageByRoute(route);

  if (!manifestPage) {
    notFound();
  }

  const bodyHtml = await getBodyHtml(manifestPage);

  return <PageShell page={manifestPage} bodyHtml={bodyHtml} />;
}
