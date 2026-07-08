import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { CoreStylesheets } from '@/components/CoreStylesheets';
import { SiteHead } from '@/components/SiteHead';
import { localeHtmlLang } from '@/i18n/localeHtmlLang';
import { routing, type AppLocale } from '@/i18n/routing';

import '../globals.css';

const RSS_FEED_LOCALES = new Set<AppLocale>(['ru', 'en', 'uz', 'kz']);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const messages = await getMessages();
  const rssFeedTitle = RSS_FEED_LOCALES.has(appLocale)
    ? (await getTranslations({ locale, namespace: 'rss' }))('feedTitle')
    : undefined;

  return (
    <html lang={localeHtmlLang[appLocale]} suppressHydrationWarning>
      <head>
        <SiteHead locale={appLocale} rssFeedTitle={rssFeedTitle} />
        <CoreStylesheets />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
