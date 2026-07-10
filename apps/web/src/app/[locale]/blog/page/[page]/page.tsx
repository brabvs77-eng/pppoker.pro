import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import { BLOG_ARCHIVE_PAGE_SIZE, paginateBlogPosts } from '@/lib/blogArchive';
import { getBlogArchivePosts, getPageByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

type BlogPaginationProps = {
  params: Promise<{ locale: string; page: string }>;
};

export async function generateStaticParams() {
  const result: Array<{ locale: string; page: string }> = [];

  for (const locale of routing.locales) {
    const appLocale = locale as AppLocale;
    const posts = await getBlogArchivePosts(appLocale);
    const { totalPages } = paginateBlogPosts(posts, 1, BLOG_ARCHIVE_PAGE_SIZE);

    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
      const route =
        appLocale === 'ru'
          ? `/blog/page/${pageNumber}/`
          : `/${appLocale}/blog/page/${pageNumber}/`;
      const manifestPage = await getPageByRoute(route);
      if (manifestPage) {
        result.push({ locale, page: String(pageNumber) });
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

  const metadata = buildPageMetadata(manifestPage);
  const pageSuffix = locale === 'ru' ? `— страница ${pageNum}` : `— page ${pageNum}`;
  const rawTitle = String(metadata.title ?? '');
  const titleHasPage = /страница|page/i.test(rawTitle);
  const title = titleHasPage ? rawTitle : `${rawTitle} ${pageSuffix}`;
  const description = metadata.description
    ? `${metadata.description} ${pageSuffix}.`
    : undefined;

  return {
    ...metadata,
    title,
    description,
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, title, description }
      : undefined,
  };
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

  const posts = await getBlogArchivePosts(appLocale);
  const archive = paginateBlogPosts(posts, pageNumber, BLOG_ARCHIVE_PAGE_SIZE);

  if (archive.pageNumber !== pageNumber) {
    notFound();
  }

  return <PageShell page={manifestPage} bodyHtml="" nativeBlog={archive} />;
}
