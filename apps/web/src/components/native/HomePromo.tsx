import { getTranslations } from 'next-intl/server';

import { siteContacts } from '@/config/site';

type HomePromoProps = {
  locale: string;
};

export async function HomePromo({ locale }: HomePromoProps) {
  const t = await getTranslations({ locale, namespace: 'homePromo' });

  return (
    <aside className="home-promo" aria-label={t('ariaLabel')}>
      <p className="home-promo__title">{t('title')}</p>
      <div className="home-promo__actions">
        <a
          className="home-promo__btn home-promo__btn--primary"
          href={siteContacts.telegramManager}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('manager')}
        </a>
        <a
          className="home-promo__btn home-promo__btn--ghost"
          href={siteContacts.telegramChannel}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('channel')}
        </a>
        <a
          className="home-promo__btn home-promo__btn--ghost"
          href={siteContacts.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('whatsapp')}
        </a>
      </div>
    </aside>
  );
}
