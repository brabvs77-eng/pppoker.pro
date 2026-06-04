import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { PostArticle } from '@/components/PostArticle';
import { routing, type AppLocale } from '@/i18n/routing';
import {
  getBodyHtml,
  getPageBySlug,
  getPagesByLocale,
  getPostRecord,
  slugParamsFromPage,
} from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug?: string[] }> = [];

  for (const locale of routing.locales) {
    const pages = await getPagesByLocale(locale as AppLocale);
    for (const page of pages) {
      if (page.type === 'blog' || page.route.match(/\/blog\/page\/\d+\/$/)) {
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

  const [bodyHtml, post] = await Promise.all([
    getBodyHtml(page),
    page.hasStructuredPost ? getPostRecord(page) : Promise.resolve(null),
  ]);

  if (page.type === 'post' && post) {
    return (
      <PageShell page={page} bodyHtml={bodyHtml}>
        <PostArticle post={post} bodyClassName={page.bodyAttributes.class} />
      </PageShell>
    );
  }

  return <PageShell page={page} bodyHtml={bodyHtml} />;
}
