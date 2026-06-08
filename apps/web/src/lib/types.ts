export type HreflangEntry = {
  hreflang: string;
  href: string;
};

export type RuntimeScriptEntry =
  | { kind: 'external'; src: string; type?: string; id?: string }
  | { kind: 'inline'; content: string; type?: string; id?: string };

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
  publishedAt?: string;
  ogImage?: string;
  hreflang: HreflangEntry[];
  stylesheets: string[];
  headInlineStyles: string[];
  bodyScripts: string[];
  runtimeScripts?: RuntimeScriptEntry[];
  bodyAttributes: Record<string, string>;
  jsonLd: string[];
  isRedirect: boolean;
  redirectTo?: string | null;
  hasStructuredPost: boolean;
  needsElementorRuntime: boolean;
};

export type PostRecord = {
  route: string;
  locale: string;
  title: string;
  description: string;
  publishedAt: string;
  html: string;
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
  coreStylesheets: string[];
  allStylesheets: string[];
  globalStylesheets: string[];
  cssBudget: CssBudgetStats;
  pages: PageEntry[];
};
