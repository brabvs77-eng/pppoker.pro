import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import {
  iplanutsHref,
  siteContacts,
  siteFooterAssets,
  siteFooterPaymentIcons,
  siteLegalEntity,
  siteSocial,
} from '@/config/site';
import { getLocaleAlternates } from '@/lib/localeAlternates';
import { blogHref, legalHref } from '@/lib/navigation';
import type { PageEntry } from '@/lib/types';

import { LocaleSwitcher } from './LocaleSwitcher';

type SiteFooterProps = {
  page: PageEntry;
  variant?: 'full' | 'locale-only';
};

const SOCIAL_CARDS = [
  {
    key: 'manager',
    href: siteContacts.telegramManager,
    icon: siteFooterAssets.telegramIcon,
    labelKey: 'manager',
  },
  {
    key: 'channel',
    href: siteContacts.telegramChannel,
    icon: siteFooterAssets.telegramIcon,
    labelKey: 'channel',
  },
  {
    key: 'instagram',
    href: siteSocial.instagram,
    icon: siteFooterAssets.instagramIcon,
    labelKey: 'instagram',
  },
  {
    key: 'youtube',
    href: siteSocial.youtube,
    icon: siteFooterAssets.youtubeIcon,
    labelKey: 'youtube',
  },
] as const;

export async function SiteFooter({ page, variant = 'full' }: SiteFooterProps) {
  const t = await getTranslations({ locale: page.locale, namespace: 'siteFooter' });
  const alternates = getLocaleAlternates(page);
  const year = new Date().getFullYear();
  const localeOnly = variant === 'locale-only';
  const partnerUrl = iplanutsHref(page.locale);

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
            <div className="site-footer__social" aria-label={t('socialLabel')}>
              {SOCIAL_CARDS.map((card) => (
                <a
                  key={card.key}
                  className="site-footer__social-card"
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="site-footer__social-icon"
                    src={card.icon}
                    alt=""
                    width={43}
                    height={43}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="site-footer__social-label">{t(card.labelKey)}</span>
                </a>
              ))}
            </div>

            <div className="site-footer__payments" aria-label={t('paymentsLabel')}>
              {siteFooterPaymentIcons.map((icon) => (
                <span key={icon.src} className="site-footer__payment">
                  <img
                    src={icon.src}
                    alt={icon.alt}
                    width={icon.width}
                    height={icon.height}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              ))}
            </div>

            <div className="site-footer__partner">
              <a
                className="site-footer__social-card site-footer__social-card--compact"
                href={siteContacts.telegramManager}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="site-footer__social-icon"
                  src={siteFooterAssets.telegramIcon}
                  alt=""
                  width={43}
                  height={43}
                  loading="lazy"
                  decoding="async"
                />
                <span className="site-footer__social-label">{t('manager')}</span>
              </a>
              <a
                className="site-footer__partner-link"
                href={partnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('partnerLabel')}
              >
                <img
                  src={siteFooterAssets.partnerIcon}
                  alt=""
                  width={43}
                  height={44}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>

            <nav className="site-footer__nav" aria-label={t('navLabel')}>
              <Link href={blogHref(page.locale)}>{t('blog')}</Link>
              <a href={legalHref(page.locale, 'user-agreement')}>{t('terms')}</a>
              <a href={legalHref(page.locale, 'privacy-policy')}>{t('privacy')}</a>
            </nav>

            <address className="site-footer__contact" itemScope itemType="https://schema.org/PostalAddress">
              <span className="site-footer__address" itemProp="streetAddress">
                {siteLegalEntity.address}
              </span>
              <a className="site-footer__phone" href={siteLegalEntity.phoneHref} itemProp="telephone">
                {siteLegalEntity.phoneDisplay}
              </a>
            </address>

            <p className="site-footer__copy">
              © {siteLegalEntity.copyrightStartYear}–{year} {siteLegalEntity.associationName} ·{' '}
              {t('tagline')}
            </p>
          </>
        )}
      </div>
    </footer>
  );
}
