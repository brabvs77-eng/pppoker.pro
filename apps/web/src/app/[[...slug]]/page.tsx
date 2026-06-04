import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import { BodyAttributes } from '@/components/BodyAttributes';
import { WordPressBody } from '@/components/WordPressBody';
import { WordPressHead } from '@/components/WordPressHead';
import {
  getAllPages,
  getBodyHtml,
  getManifest,
  getPageBySlug,
} from '@/lib/content';
import type { PageEntry } from '@/lib/types';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function buildAlternates(page: PageEntry): Metadata['alternates'] {
  if (!page.hreflang.length) return undefined;

  const languages: Record<string, string> = {};
  for (const entry of page.hreflang) {
    if (entry.hreflang === 'x-default') continue;
    languages[entry.hreflang] = entry.href;
  }

  const defaultEntry = page.hreflang.find((entry) => entry.hreflang === 'x-default');

  return {
    canonical: page.canonical,
    languages,
    ...(defaultEntry ? {} : {}),
  };
}

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((page) => ({
    slug: page.slug.length ? page.slug : undefined,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: page.title,
    description: page.description || undefined,
    alternates: buildAlternates(page),
    openGraph: {
      title: page.title,
      description: page.description || undefined,
      url: page.canonical,
      locale: page.lang.replace('-', '_'),
      type: page.type === 'post' || page.type === 'blog' ? 'article' : 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WordPressPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const [manifest, bodyHtml] = await Promise.all([getManifest(), getBodyHtml(page)]);

  return (
    <>
      <WordPressHead page={page} globalStylesheets={manifest.globalStylesheets} />
      <BodyAttributes attributes={page.bodyAttributes} />
      <WordPressBody page={page} bodyHtml={bodyHtml} />
      <AnalyticsScripts />
      {page.bodyScripts.map((src) => (
        <script key={src} src={src} defer />
      ))}
    </>
  );
}
