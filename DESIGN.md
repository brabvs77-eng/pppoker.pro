---
name: Nuts PPPoker
description: Dark marketing site for an online poker club. Gold accent on navy lacquer; green tag pills; editorial blog.

colors:
  ground: "#131b2b"
  ground-deep: "#0c111a"
  surface-raised: "#1a2438"
  accent-gold: "#fde661"
  accent-green: "#61ce70"
  text-primary: "#e8ecf4"
  text-muted: "#9aa8c7"
  text-faint: "#7b8db2"
  rule-gold: "rgba(253, 230, 97, 0.12)"

typography:
  stack: "system-ui, -apple-system, sans-serif"
  display-tracking: "-0.02em"
  body-line-height: "1.6"
  body-max-width: "42rem"

components:
  tag-pill: "6px radius, green tint border, 600 weight — not generic full pill"
  pagination: "numbered pages, gold current state, navy buttons"
  blog-row: "zigzag image/text, 220px thumb, hover lift + tinted shadow"

motion:
  duration: "200-300ms"
  easing: "ease-out"
  reduced-motion: "disable transforms; keep color/focus states"

anti-patterns:
  - "Do not introduce a second accent (purple, cyan) on native UI"
  - "Do not use Inter as a deliberate brand font swap without user request"
  - "Do not add GSAP/Motion for static-export pages unless explicitly scoped"
---

# Design — Nuts PPPoker (native surfaces)

Visual source of truth for **native React** work (`SiteHeader`, `SiteFooter`, `HomePromo`, `NativeBlogArchive`, `StructuredPost`, `ReviewSnippets`, home-blog slot).

Legacy Elementor pages keep WordPress-export styling; do not restyle them in this file.

## Color strategy

**Committed** on dark ground: one gold accent, green reserved for tags/success chips only.

## Typography

System stack (no webfont dependency in static export). Headlines: `clamp()` + `text-wrap: balance`. Body: max ~65–75ch in prose blocks.

## Layout

Blog archive max-width ~960px. Zigzag rows alternate image side. Pagination: full numbered nav for ≤10 pages.

## References (anchor)

- Dark editorial sports/media sites (ESPN night mode, poker broadcast overlays)
- Gold-on-navy VIP club aesthetic — not fintech SaaS
