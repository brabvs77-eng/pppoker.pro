import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { routing, type AppLocale } from '@/i18n/routing';
import { getBodyHtml, getPageByRoute } from '@/lib/content';
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

  const bodyHtml = await getBodyHtml(page);

  return <PageShell page={page} bodyHtml={bodyHtml} />;
}
