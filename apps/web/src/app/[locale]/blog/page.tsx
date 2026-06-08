import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import { BLOG_ARCHIVE_PAGE_SIZE, paginateBlogPosts } from '@/lib/blogArchive';
import { getBlogArchivePosts, getPageByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

type BlogIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  const params: Array<{ locale: string }> = [];

  for (const locale of routing.locales) {
    const page = await getPageByRoute(blogRoute(locale as AppLocale));
    if (page) {
      params.push({ locale });
    }
  }

  return params;
}

function blogRoute(locale: AppLocale) {
  return locale === 'ru' ? '/blog/' : `/${locale}/blog/`;
}

export async function generateMetadata({ params }: BlogIndexProps) {
  const { locale } = await params;
  const page = await getPageByRoute(blogRoute(locale as AppLocale));

  if (!page) return { title: 'Blog' };
  return buildPageMetadata(page);
}

export default async function BlogIndexPage({ params }: BlogIndexProps) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;
  const page = await getPageByRoute(blogRoute(appLocale));

  if (!page) {
    notFound();
  }

  const posts = await getBlogArchivePosts(appLocale);
  const archive = paginateBlogPosts(posts, 1, BLOG_ARCHIVE_PAGE_SIZE);

  return <PageShell page={page} bodyHtml="" nativeBlog={archive} />;
}
