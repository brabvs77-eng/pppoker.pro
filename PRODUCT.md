# Product

## Register

brand

## Platform

web

## Users

Poker players and prospects (RU-first, plus EN/UZ/KZ/HY/TJ locales) looking for a trusted online PPPoker club. They arrive from search, Telegram, or referrals — often on mobile, sometimes comparing clubs before joining.

## Product Purpose

pppoker.pro is the marketing site for **Nuts PPPoker Club**. It must convert visitors into Telegram/WhatsApp contact and communicate trust, scale (50k+ players), and bonuses — without feeling like a generic AI landing page.

Success: clear CTAs to manager/channel, readable blog content, fast static pages, brand-consistent dark UI on native React surfaces.

## Brand Personality

**Confident, nocturnal, premium-accessible.** A real club with money on the line — not a SaaS template. Gold accent reads as “jackpot / VIP”, green tags as “live / winning”.

Three words: **nocturnal, gold, direct**.

## Anti-references

- Purple-to-blue AI gradients, glassmorphism hero, Inter + slate-900 defaults
- Three equal feature-card rows, nested cards, gray muted body text on tinted backgrounds
- Hedging marketing copy (“seamless”, “elevate”, “next-gen”)
- Light-mode blog that breaks the dark chrome elsewhere on the site

## Design Principles

1. **Preserve Nuts gold** (`#fde661`) as the single primary accent on native surfaces.
2. **Dark navy ground** (`#131b2b` / `#0c111a`) — full-site consistency on blog and chrome.
3. **Strangler Fig discipline** — native React only where manifest says so; legacy Elementor bodies untouched unless scoped.
4. **Editorial blog** — readable hierarchy, tags, related posts; not a card-grid SaaS blog.
5. **Static export safe** — no client-only portals into Elementor slots; no new runtime deps without justification.

## Accessibility & Inclusion

WCAG 2.1 AA on native surfaces. Visible `:focus-visible`, `prefers-reduced-motion` respected, semantic HTML (`nav`, `main`, `article`, `aside`). Russian is default locale; all user-facing strings via `apps/web/messages/*.json`.
