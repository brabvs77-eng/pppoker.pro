import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { CoreStylesheets } from '@/components/CoreStylesheets';
import { SiteHead } from '@/components/SiteHead';
import { localeHtmlLang } from '@/i18n/localeHtmlLang';
import { routing, type AppLocale } from '@/i18n/routing';

import '../globals.css';

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
  const messages = await getMessages();

  const appLocale = locale as AppLocale;

  return (
    <html lang={localeHtmlLang[appLocale]} suppressHydrationWarning>
      <head>
        <SiteHead />
        <CoreStylesheets />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
