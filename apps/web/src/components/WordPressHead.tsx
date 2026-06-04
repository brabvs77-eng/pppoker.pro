import type { PageEntry } from '@/lib/types';

type WordPressHeadProps = {
  page: PageEntry;
  globalStylesheets: string[];
};

export function WordPressHead({ page, globalStylesheets }: WordPressHeadProps) {
  const stylesheets = [...new Set([...globalStylesheets, ...page.stylesheets])];

  return (
    <>
      {stylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
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
