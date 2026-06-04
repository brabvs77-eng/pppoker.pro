import { siteContacts } from '@/config/site';

type HomePromoProps = {
  locale: string;
};

const copy: Record<string, { title: string; manager: string; channel: string }> = {
  ru: {
    title: 'Онлайн-покер на деньги в PPPoker',
    manager: 'Написать менеджеру',
    channel: 'Telegram-канал',
  },
  hy: {
    title: 'Օնլայն պոկեր PPPoker-ում',
    manager: 'Գրել մենեջերին',
    channel: 'Telegram',
  },
  en: {
    title: 'Play poker for real money on PPPoker',
    manager: 'Message manager',
    channel: 'Telegram channel',
  },
  uz: {
    title: 'PPPoker’da pulga onlayn poker',
    manager: 'Menejerga yozish',
    channel: 'Telegram',
  },
  kz: {
    title: 'PPPoker-де ақшаға онлайн покер',
    manager: 'Менеджерге жазу',
    channel: 'Telegram',
  },
  tj: {
    title: 'Покери онлайнӣ дар PPPoker',
    manager: 'Ба менеҷер навиштан',
    channel: 'Telegram',
  },
};

export function HomePromo({ locale }: HomePromoProps) {
  const text = copy[locale] ?? copy.ru;

  return (
    <aside className="home-promo" aria-label={text.title}>
      <p className="home-promo__title">{text.title}</p>
      <div className="home-promo__actions">
        <a
          className="home-promo__btn home-promo__btn--primary"
          href={siteContacts.telegramManager}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text.manager}
        </a>
        <a
          className="home-promo__btn home-promo__btn--ghost"
          href={siteContacts.telegramChannel}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text.channel}
        </a>
      </div>
    </aside>
  );
}
