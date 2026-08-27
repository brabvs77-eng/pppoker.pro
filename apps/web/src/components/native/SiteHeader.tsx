import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { siteBranding, siteContacts } from '@/config/site';
import { getLocaleAlternates } from '@/lib/localeAlternates';
import { blogHref, homeHref } from '@/lib/navigation';
import type { PageEntry } from '@/lib/types';

import { LocaleSwitcher } from './LocaleSwitcher';

type SiteHeaderProps = {
  page: PageEntry;
};

export async function SiteHeader({ page }: SiteHeaderProps) {
  const t = await getTranslations({ locale: page.locale, namespace: 'siteHeader' });
  const alternates = getLocaleAlternates(page);
  const home = homeHref(page.locale);
  const blog = blogHref(page.locale);

  return (
    <header className="nuts-header" data-locale={page.locale}>
      <div className="nuts-header__inner">
        <Link className="nuts-header__brand" href={home}>
          <img
            src={siteBranding.logoSrc}
            alt={siteBranding.logoAlt}
            width={120}
            height={28}
            decoding="async"
          />
        </Link>

        <details className="nuts-header__drawer">
          <summary className="nuts-header__menu-btn" aria-label={t('openMenu')}>
            <span aria-hidden="true">☰</span>
          </summary>
          <nav className="nuts-header__nav" aria-label={t('navLabel')}>
            <Link href={home}>{t('home')}</Link>
            <Link href={blog}>{t('blog')}</Link>
            <a href={siteContacts.telegramManager} target="_blank" rel="noopener noreferrer">
              {t('manager')}
            </a>
            <a href={siteContacts.telegramChannel} target="_blank" rel="noopener noreferrer">
              {t('channel')}
            </a>
          </nav>
        </details>

        <nav className="nuts-header__nav nuts-header__nav--desktop" aria-label={t('navLabel')}>
          <Link href={home}>{t('home')}</Link>
          <Link href={blog}>{t('blog')}</Link>
          <a href={siteContacts.telegramManager} target="_blank" rel="noopener noreferrer">
            {t('manager')}
          </a>
          <a href={siteContacts.telegramChannel} target="_blank" rel="noopener noreferrer">
            {t('channel')}
          </a>
        </nav>

        <div className="nuts-header__locales">
          <LocaleSwitcher
            alternates={alternates}
            currentLocale={page.locale}
            label={t('languageLabel')}
          />
        </div>
      </div>
    </header>
  );
}
