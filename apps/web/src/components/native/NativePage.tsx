import type { PageRecord } from '@/lib/types';

type NativePageProps = {
  page: PageRecord;
};

/** Native layout for legal/about pages extracted to content/pages/*.json */
export function NativePage({ page }: NativePageProps) {
  return (
    <article className="native-page" data-route={page.route}>
      <header className="native-page__header">
        <h1>{page.title}</h1>
      </header>
      <div
        className="native-page__content"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </article>
  );
}
