import type { ReactNode } from 'react';

import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import { JsonLd } from '@/components/JsonLd';
import { WordPressBody } from '@/components/WordPressBody';
import { WordPressHead } from '@/components/WordPressHead';
import type { PageEntry } from '@/lib/types';

type PageShellProps = {
  page: PageEntry;
  bodyHtml: string;
  children?: ReactNode;
};

export function PageShell({ page, bodyHtml, children }: PageShellProps) {
  const bodyClass = page.bodyAttributes.class;

  return (
    <>
      <WordPressHead page={page} />
      <JsonLd blocks={page.jsonLd} />
      {children ?? (
        <WordPressBody page={page} bodyHtml={bodyHtml} bodyClassName={bodyClass} />
      )}
      <AnalyticsScripts />
      {page.bodyScripts.map((src) => (
        <script key={src} src={src} defer />
      ))}
    </>
  );
}
