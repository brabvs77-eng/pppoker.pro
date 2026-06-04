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

## Рекомендации (позже)

- Постепенно выносить секции Elementor в `components/native/*`
- Headless CMS вместо HTML-extract
- Свести Yoast sitemap и динамический sitemap к одному источнику, если понадобится programmatic SEO
