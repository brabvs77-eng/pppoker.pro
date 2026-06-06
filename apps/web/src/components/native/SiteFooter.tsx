import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { siteContacts } from '@/config/site';
import { getLocaleAlternates } from '@/lib/localeAlternates';
import { blogHref, legalHref } from '@/lib/navigation';
import type { PageEntry } from '@/lib/types';

import { LocaleSwitcher } from './LocaleSwitcher';

type SiteFooterProps = {
  page: PageEntry;
  variant?: 'full' | 'locale-only';
};

export async function SiteFooter({ page, variant = 'full' }: SiteFooterProps) {
  const t = await getTranslations({ locale: page.locale, namespace: 'siteFooter' });
  const alternates = getLocaleAlternates(page);
  const year = new Date().getFullYear();
  const localeOnly = variant === 'locale-only';

  return (
    <footer className="site-footer" data-locale={page.locale} data-variant={variant}>
      <div className="site-footer__inner">
        <LocaleSwitcher
          alternates={alternates}
          currentLocale={page.locale}
          label={t('languageLabel')}
        />

        {localeOnly ? null : (
          <>
            <nav className="site-footer__nav" aria-label={t('navLabel')}>
              <Link href={blogHref(page.locale)}>{t('blog')}</Link>
              <a href={siteContacts.telegramManager} target="_blank" rel="noopener noreferrer">
                {t('manager')}
              </a>
              <a href={legalHref(page.locale, 'user-agreement')}>{t('terms')}</a>
              <a href={legalHref(page.locale, 'privacy-policy')}>{t('privacy')}</a>
            </nav>

            <p className="site-footer__copy">
              © {year} Nuts · PPPoker.pro — {t('tagline')}
            </p>
          </>
        )}
      </div>
    </footer>
  );
}
