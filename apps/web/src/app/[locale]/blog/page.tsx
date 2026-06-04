import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { BlogArchive } from '@/components/BlogArchive';
import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import { getBlogPosts, getPageByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

type BlogIndexProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
  const t = await getTranslations('blog');
  const page = await getPageByRoute(blogRoute(appLocale));

  if (!page) {
    notFound();
  }

  const posts = await getBlogPosts(appLocale);

  return (
    <PageShell page={page} bodyHtml="">
      <BlogArchive posts={posts} page={1} locale={appLocale} title={t('title')} />
    </PageShell>
  );
}
