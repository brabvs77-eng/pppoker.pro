import type { PageEntry } from '@/lib/types';

type WordPressHeadProps = {
  page: PageEntry;
};

/** Page-specific stylesheets (core set is in root layout via CoreStylesheets). */
export function WordPressHead({ page }: WordPressHeadProps) {
  return (
    <>
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
