import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations('notFound');
  const home = locale === 'ru' ? '/' : `/${locale}/`;

  return (
    <main className="not-found">
      <h1>{t('title')}</h1>
      <p>{t('message')}</p>
      <p>
        <Link href={home}>{t('back')}</Link>
      </p>
    </main>
  );
}
