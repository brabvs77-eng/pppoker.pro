# Аудит рудиментов (Sprint 6)

Проверка репозитория после миграции на Next.js 15 static export.

## Удалено в Sprint 6

| Рудимент | Причина |
|----------|---------|
| `scripts/build-react-static-site.mjs`, `verify-react-static-site.mjs` | Предыдущий этап (React SSR в `dist/`), заменён `apps/web` |
| `src/components/StaticDocument.mjs` | Только для legacy-сборки |
| `apps/web/src/components/BlogArchive.tsx`, `PostArticle.tsx` | Не используются: блог/посты рендерятся из Elementor HTML |
| `apps/web/src/app/page.module.css` | Шаблон create-next-app, не подключён |
| `apps/web/src/app/sitemap.ts` | Дублирует Yoast `sitemap_index.xml` (уже в `public/`) |
| `react`, `react-dom`, `sharp` в корневом `package.json` | Нужны только в `apps/web/` |
| npm-скрипты `build:legacy-react`, `migrate:react` | Устарели |

## Оставлено намеренно

| Элемент | Зачем |
|---------|--------|
| Корневые `index.html`, `blog/`, … | Источник для `npm run extract:content` |
| `scripts/flatten-ru-export.mjs` | next-intl + `output: 'export'` всё ещё кладёт `ru` в `/ru/`; без middleware `as-needed` на статике не работает |
| `content/posts/*.json` | Структурированные статьи для будущего RSS/API (пока не в UI) |
| Дубль `robots.txt` | `prepare:public` копирует legacy; в `out/` побеждает `app/robots.ts` → Yoast sitemap |
| `apps/web/out/**/*.txt` | RSC payload Next.js при export — не публиковать отдельно, Vercel отдаёт `index.html` |
| `normalizeUrls` / `strip:hekler` | Защита от legacy-домена в исходниках |

## Native chrome (Sprint 6–9)

| Компонент | Заменяет |
|-----------|----------|
| `HomePromo` | Дубли CTA / `menu-item-3206`; hero play/hotspot/icon row |
| `SiteHeader` | Elementor HF + secondary `section` в `#masthead` (все локали); спейсеры `8141f77` / `3f45d89`; `menu-item-3206` |
| `SiteFooter` | `#colophon`, `.main_footer`, WPML footer |

Elementor `#masthead` **сохраняется** — внутри hero и контент главной.

## Рекомендации (позже)

- Сузить или заменить `#masthead` на внутренних страницах
- Headless CMS вместо HTML-extract
