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

export type CssBudgetStats = {
  totalUnique: number;
  coreCount: number;
  activePages: number;
  threshold: number;
  averagePageSpecific: number;
};

export type ContentManifest = {
  generatedAt: string;
  pageCount: number;
  /** Shared styles loaded once in root layout */
  coreStylesheets: string[];
  /** All unique stylesheet URLs across the site */
  allStylesheets: string[];
  /** @deprecated Use coreStylesheets */
  globalStylesheets: string[];
  cssBudget: CssBudgetStats;
  pages: PageEntry[];
};
