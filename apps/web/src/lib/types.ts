export type HreflangEntry = {
  hreflang: string;
  href: string;
};

export type PageEntry = {
  route: string;
  slug: string[];
  fileId: string;
  source: string;
  locale: string;
  type: string;
  title: string;
  description: string;
  canonical: string;
  lang: string;
  hreflang: HreflangEntry[];
  stylesheets: string[];
  headInlineStyles: string[];
  bodyScripts: string[];
  bodyAttributes: Record<string, string>;
  isRedirect: boolean;
};

export type ContentManifest = {
  generatedAt: string;
  pageCount: number;
  globalStylesheets: string[];
  pages: PageEntry[];
};
