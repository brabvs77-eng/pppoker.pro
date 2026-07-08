import { buildReviewSnippetsJsonLd } from '@/lib/reviewSnippetsJsonLd';
import type { AppLocale } from '@/i18n/routing';

type ReviewSnippetsJsonLdProps = {
  locale: AppLocale;
};

/** Rich snippet JSON-LD with aggregate star rating for homepages. */
export function ReviewSnippetsJsonLd({ locale }: ReviewSnippetsJsonLdProps) {
  const json = buildReviewSnippetsJsonLd(locale);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
