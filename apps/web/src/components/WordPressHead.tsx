import type { PageEntry } from '@/lib/types';

import { homePromoRoutes } from '@/config/site';

const CRASH_POSTER_PRELOAD = '/assets/media/2025/12/turbo.webp';

type WordPressHeadProps = {
  page: PageEntry;
};

/** Page-specific stylesheets (core set is in root layout via CoreStylesheets). */
export function WordPressHead({ page }: WordPressHeadProps) {
  const preloadCrashPoster = (homePromoRoutes as readonly string[]).includes(page.route);

  return (
    <>
      {preloadCrashPoster ? (
        <link rel="preload" as="image" href={CRASH_POSTER_PRELOAD} fetchPriority="high" />
      ) : null}
      {page.stylesheets.map((href) => (
        <link key={`page-${href}`} rel="stylesheet" href={href} />
      ))}
      {page.headInlineStyles.map((css, index) => (
        <style
          key={`${page.fileId}-inline-${index}`}
          dangerouslySetInnerHTML={{ __html: css }}
        />
      ))}
    </>
  );
}
