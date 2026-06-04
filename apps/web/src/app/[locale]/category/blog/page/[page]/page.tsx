import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import { getBodyHtml, getPageByRoute, getPagesByLocale } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

type CategoryBlogPageProps = {
  params: Promise<{ locale: string; page: string }>;
};

export async function generateStaticParams() {
  const result: Array<{ locale: string; page: string }> = [];

  for (const locale of routing.locales) {
    const pages = await getPagesByLocale(locale as AppLocale);
    for (const entry of pages) {
      const match = entry.route.match(/\/category\/blog\/page\/(\d+)\/$/);
      if (match) {
        result.push({ locale, page: match[1] });
      }
    }
  }

  return result;
}

export async function generateMetadata({ params }: CategoryBlogPageProps) {
  const { locale, page: pageNum } = await params;
  const route =
    locale === 'ru'
      ? `/category/blog/page/${pageNum}/`
      : `/${locale}/category/blog/page/${pageNum}/`;
  const manifestPage = await getPageByRoute(route);

  if (!manifestPage) return { title: 'Blog' };
  return buildPageMetadata(manifestPage);
}

export default async function CategoryBlogPaginationPage({ params }: CategoryBlogPageProps) {
  const { locale, page: pageNum } = await params;
  const pageNumber = Number.parseInt(pageNum, 10);

  if (Number.isNaN(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const route =
    locale === 'ru'
      ? `/category/blog/page/${pageNumber}/`
      : `/${locale}/category/blog/page/${pageNumber}/`;
  const page = await getPageByRoute(route);

  if (!page) {
    notFound();
  }

  const bodyHtml = await getBodyHtml(page);

  return <PageShell page={page} bodyHtml={bodyHtml} />;
}
