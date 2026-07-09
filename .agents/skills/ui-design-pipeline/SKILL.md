---
name: ui-design-pipeline
description: >-
  Orchestrates native UI work on pppoker.pro: Impeccable shape (structure/brief)
  → code generation → Taste Skill visual pass → Impeccable detect/polish → ship or iterate.
  Use for any new or redesigned native React surface in apps/web/src/components/native/.
---

# UI Design Pipeline — pppoker.pro

End-to-end workflow combining **[Impeccable](https://github.com/pbakaus/impeccable)** (structure + quality gates) and **[Taste Skill](https://github.com/Leonxlnx/taste-skill)** (anti-slop visual control).

```
Запрос пользователя
        ↓
① Impeccable shape — design brief (NO code yet)
        ↓
② Генерация UI-кода — native React + globals.css
        ↓
③ Taste Skill — design read + redesign audit
        ↓
④ Impeccable detect + polish — deterministic + final pass
        ↓
⑤ Итерация или финальный результат (npm run build)
```

## When to run

- New native component or section (`apps/web/src/components/native/*`)
- Redesign of blog, chrome, home promo, review snippets
- User asks for UI/UX improvement on native surfaces

**Do not run** for legacy Elementor body edits, build scripts, or SEO-only tasks.

## Phase 0 — Context (always)

1. Read `PRODUCT.md` and `DESIGN.md` at repo root.
2. Run Impeccable context (once per session):
   ```bash
   node .cursor/skills/impeccable/scripts/context.mjs
   ```
3. Read `AGENTS.md` hard constraints (`NativeBlogArchive`, no `BlogArchive.tsx`, static export rules).

## Phase 1 — Structure (Impeccable)

**Skill:** `.cursor/skills/impeccable/` → command **`shape`**

1. Read `.cursor/skills/impeccable/reference/shape.md` and follow it fully.
2. Produce a **design brief** (purpose, audience, content ranges, edge states, fidelity, anti-goals).
3. **Stop for user confirmation** on non-trivial work (multi-screen, ambiguous vibe). For small scoped fixes, a compact 3–5 bullet brief is enough.
4. Register for this project is **brand** — read `.cursor/skills/impeccable/reference/brand.md` before visual decisions.

**Output artifact:** design brief in chat (or `docs/briefs/<feature>.md` if the user wants it saved).

**No code in Phase 1.**

## Phase 2 — Code generation

Implement against the confirmed brief:

| Area | Path |
|------|------|
| Components | `apps/web/src/components/native/` |
| Styles | `apps/web/src/app/globals.css` |
| i18n | `apps/web/messages/<locale>.json` |
| Types/data | `apps/web/src/lib/`, `scripts/` if extract pipeline changes |

Rules:

- Match existing patterns (`PageShell`, `next-intl`, static export).
- Preserve brand tokens from `DESIGN.md` (gold `#fde661`, ground `#131b2b`).
- Minimize diff scope — Strangler Fig, not rewrite.

## Phase 3 — Visual control (Taste Skill)

**Skills:**

- `.agents/skills/design-taste-frontend/SKILL.md`
- `.agents/skills/redesign-existing-projects/SKILL.md`

1. **Design read** (one line): page kind, audience, vibe, dials.
   - Default for this repo: *editorial dark blog / brand marketing, dials ~6/4/3*.
2. Run **redesign audit** checklist on changed CSS/components:
   - hover + `:focus-visible` on interactive elements
   - no gray-on-color contrast failures
   - no generic card-grid when zigzag/list is specified
   - `text-wrap: balance`, tabular-nums on dates
   - `prefers-reduced-motion` fallback
3. Apply fixes inline — do not stop at a report unless user asked review-only.

## Phase 4 — Quality gate (Impeccable)

1. **Deterministic detect** on changed files:
   ```bash
   npm run audit:ui-antipatterns
   ```
   Or scoped:
   ```bash
   npx impeccable detect apps/web/src/components/native/<Component>.tsx apps/web/src/app/globals.css
   ```
2. Read `.cursor/skills/impeccable/reference/polish.md` — align spacing, states, tokens, copy.
3. Optional UX pass: `/impeccable critique <target>` (hierarchy, clarity).

Fix all P0 detect findings before calling done.

## Phase 5 — Ship or iterate

**Required before merge:**

```bash
npm run build
```

If detect or verify fails → return to Phase 3 or 2.

If user rejects the brief direction → return to Phase 1 only.

## Quick command map

| Step | Impeccable | Taste |
|------|------------|-------|
| Setup (once) | `/impeccable init` | already in `.agents/skills/` |
| Structure | `/impeccable shape …` | — |
| Build | — | — |
| Visual pass | — | read both taste SKILL.md files |
| QA | `/impeccable detect`, `/impeccable polish` | redesign audit checklist |
| Live tweak | `/impeccable live` (optional, needs dev server) | — |

## Install / update

```bash
# Impeccable (Cursor)
npx impeccable skills install --providers=cursor --scope=project

# Taste Skill
npx skills add https://github.com/Leonxlnx/taste-skill \
  --skill "design-taste-frontend" \
  --skill "redesign-existing-projects"
```
