import type { AppLocale } from '@/i18n/routing';

const RSS_FEED_HREF: Partial<Record<AppLocale, string>> = {
  ru: '/feed.xml',
  en: '/en/feed.xml',
  uz: '/uz/feed.xml',
  kz: '/kz/feed.xml',
};

type SiteHeadProps = {
  locale: AppLocale;
  rssFeedTitle?: string;
};

/** Global head tags shared across all locale layouts. */
export function SiteHead({ locale, rssFeedTitle }: SiteHeadProps) {
  const rssHref = RSS_FEED_HREF[locale];

  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        rel="icon"
        href="/assets/media/2024/07/cropped-photo_2022-09-21_22-05-12-32x32.jpg"
        sizes="32x32"
      />
      <link
        rel="icon"
        href="/assets/media/2024/07/cropped-photo_2022-09-21_22-05-12-192x192.jpg"
        sizes="192x192"
      />
      <link
        rel="apple-touch-icon"
        href="/assets/media/2024/07/cropped-photo_2022-09-21_22-05-12-180x180.jpg"
      />
      {rssHref && rssFeedTitle ? (
        <link
          rel="alternate"
          type="application/rss+xml"
          title={rssFeedTitle}
          href={rssHref}
        />
      ) : null}
    </>
  );
}
