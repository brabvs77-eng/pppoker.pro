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

function NavLinks({
  home,
  blog,
  homeLabel,
  blogLabel,
  managerLabel,
  channelLabel,
}: {
  home: string;
  blog: string;
  homeLabel: string;
  blogLabel: string;
  managerLabel: string;
  channelLabel: string;
}) {
  return (
    <>
      <Link href={home}>{homeLabel}</Link>
      <Link href={blog}>{blogLabel}</Link>
      <a href={siteContacts.telegramManager} target="_blank" rel="noopener noreferrer">
        {managerLabel}
      </a>
      <a href={siteContacts.telegramChannel} target="_blank" rel="noopener noreferrer">
        {channelLabel}
      </a>
    </>
  );
}

export async function SiteHeader({ page }: SiteHeaderProps) {
  const t = await getTranslations({ locale: page.locale, namespace: 'siteHeader' });
  const alternates = getLocaleAlternates(page);
  const home = homeHref(page.locale);
  const blog = blogHref(page.locale);
  const navProps = {
    home,
    blog,
    homeLabel: t('home'),
    blogLabel: t('blog'),
    managerLabel: t('manager'),
    channelLabel: t('channel'),
  };

  return (
    <header className="nuts-header" data-locale={page.locale}>
      <div className="nuts-header__inner">
        <details className="nuts-header__drawer">
          <summary className="nuts-header__menu-btn" aria-label={t('openMenu')}>
            <span className="nuts-header__menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </summary>
          <nav className="nuts-header__nav nuts-header__nav--drawer" aria-label={t('navLabel')}>
            <NavLinks {...navProps} />
          </nav>
        </details>

        <Link className="nuts-header__brand" href={home}>
          <img
            src={siteBranding.logoSrc}
            alt={siteBranding.logoAlt}
            width={120}
            height={28}
            decoding="async"
          />
        </Link>

        <nav className="nuts-header__nav nuts-header__nav--bar" aria-label={t('navLabel')}>
          <NavLinks {...navProps} />
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
