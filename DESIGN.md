# Design Brief

> Cinematic Civic — Turning Point UK. SpaceX homepage discipline applied to a civic movement: near-black deep-blue canvas, square corners, no shadows, one idea + one action per screen. Extended for the dynamic gallery, hidden admin dashboard, and the native Blog CMS.

## Direction
Cinematic Civic. Full-bleed dark heroes with video/cover plates, scroll-snap pacing, condensed-grotesque uppercase headlines, red reserved for the single primary action per screen. Blog extends the discipline: cinematic cover images, narrow reading column, translucent blue-tinted grid cards, dark admin composer.

## Tone
Resolute, sober, monumental. Reads like a manifesto, not a brochure. Blog hub is editorial and cinematic; article pages are focused and readable; admin composer is utilitarian and quiet — content commands, chrome recedes.

## Differentiation
Square corners and zero shadows across the entire UI — including blog cards, composer, and management table — a discipline no other civic site commits to. Cinematic full-width covers paired with a narrow max-w-3xl reading column create a broadsheet-to-manifesto reading rhythm.

## Color Palette

| Token | OKLCH | Role |
|---|---|---|
| background | 0.2 0.08 255 | Deep-blue canvas (universal) |
| foreground | 0.98 0.005 250 | Bright white headings/text |
| primary | 0.55 0.22 25 | Red TPUK — CTAs, badges, arrows, focus rings |
| card | 0.26 0.08 255 | Blue-tinted card surface |
| navy | 0.22 0.08 255 | Secondary surfaces, footer |
| muted | 0.24 0.06 255 | Recessed panels, code blocks |
| muted-foreground | 0.74 0.04 255 | Captions, eyebrows |
| border | 0.3 0.08 255 | Hairline dividers |
| blog-hero-card | 0.3 0.08 255 | Featured hero surface (one step above card) |
| blog-card | 0.26 0.08 255 | Grid card base (consumed at 40% + blur) |
| blog-cover-fallback | 0.2 0.06 255 | Failed-cover placeholder (distinct from card) |
| blog-prose-heading | 0.98 0.005 250 | Article headings (bright white) |
| blog-prose-body | 0.78 0.025 255 | Article body (soft blue-tinted grey) |
| blog-prose-muted | 0.62 0.025 255 | Article metadata/captions |
| status-draft | 0.7 0.15 85 | Draft badge (amber) |
| status-published | 0.62 0.16 150 | Published badge (green) |
| composer-surface | 0.24 0.08 255 | Admin composer surface |
| destructive-soft | 0.3 0.1 25 | Muted red delete confirmation |

## Typography
- Display: Oswald — condensed-grotesque, uppercase headlines, weight 700, tracking -0.02em, clamp 36–86px.
- Body: Inter — neutral sans, weights 300/400/500/600/700, line-height 1.6–1.75.
- Mono: JetBrains Mono — eyebrow labels, metadata, badges, admin captions, uppercase, tracking 0.16–0.22em.
- Logo serif stays in the logo only — never used in UI type.

## Elevation & Depth
No shadows anywhere. Depth comes from layered OKLCH surfaces (background → composer → card → blog-hero-card → navy), hairline borders (border-blue-800 / white at 10%), translucent backdrop-blur on blog cards, and the hero gradient scrim. No rounded corners; --radius: 0 (pill CTAs exempt).

## Structural Zones

| Zone | Surface | Border | Treatment |
|---|---|---|---|
| Fixed nav (top) | background / 0.55 → solid | border-b hairline | Translucent at top, solidifies on scroll |
| Hero sections | background + video/cover plate | none | Full-bleed, gradient scrim darkest top+bottom |
| Blog hub hero | blog-hero-card + cover | border hairline | Full-width featured post, headline low-left, red pill CTA |
| Blog grid | blog-card / 0.4 + blur | white/10 hairline | Responsive grid, fade-in-up per card, hover lift -4px |
| Article cover | blog-cover-fallback | none | Full-viewport-width cinematic cover, ~55vh, bottom scrim |
| Reading column | background | none | max-w-3xl mx-auto, white headings, blue-grey body |
| Admin composer | composer-surface | 1px hairline | Dark form, dashed cover upload, draft/published toggle |
| Admin table | admin-card | border-b hairline | Cover thumb, title, badge, author, status, date |
| Footer | navy | border-t hairline | Dark four-column, white text |

## Spacing & Rhythm
- Section padding: py-24 md:py-32; inner gutters px-6 md:px-12 lg:px-20.
- Blog grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6; Load More in batches of 9.
- Reading column: max-w-3xl (48rem) mx-auto, padding clamp(2rem,5vw,4rem) 1.5rem; body line-height 1.75.
- Composer padding: clamp(1.5rem,3vw,2.5rem); field gap 1.5rem; textarea min-height 18rem.
- One idea + one action per 100dvh screen; no competing CTAs.

## Component Patterns
- `.featured-hero-card` — full-width cinematic hero, cover + scrim, headline low-left, min-height clamp(22rem,60vh,42rem).
- `.blog-card` — translucent blue-tinted grid card (40% + backdrop-blur), 16:9 cover, body gap 0.625rem, hover lift -4px.
- `.category-badge` — small red uppercase mono pill, square corners, no shadow.
- `.article-reading-column` — max-w-3xl mx-auto, white display headings, blue-grey Inter body, red-link + red-border blockquote.
- `.cinematic-cover` — full-viewport-width cover, ~55vh, blog-cover-reveal animation, bottom gradient scrim.
- `.publish-status-badge` — draft (amber) / published (green), mono uppercase, dot indicator, square corners.
- `.blog-admin-composer` — dark composer surface, mono labels, .admin-input fields, dashed cover upload, textarea 18rem.
- `.markdown-content` — prose styling for rendered Markdown; white headings, blue-grey body, red links/blockquote border.
- `.load-more-button` — red outline pill, inverts to solid red on hover, disabled state fades to muted.
- `.btn-primary-square` — solid red pill CTA, single per screen (existing, reused).
- `.entrance-left` / `.entrance-right` / `.fade-in-up` — universal Intersection Observer entrances (existing, reused).

## Motion
- Blog cover reveal: `blog-cover-reveal` 1.1s ease-out, opacity 0→1 + scale 1.04→1, on cinematic cover img.
- Blog grid: `.fade-in-up` rises 1.5rem + fades in, 600ms ease-out, staggered across grid items.
- Featured hero: `.entrance-left` headline slides in from -5rem, 700ms ease-out.
- Article body: `.fade-in-up` per section as it enters the reading column.
- CTA hover: pill scales to 1.05; inline `.tpuk-arrow` nudges translate(2px,-2px).
- Blog card hover: translateY(-4px) + background/border intensify, 0.3s ease.
- Load More hover: invert to solid red + scale 1.05; disabled fades to muted.
- `prefers-reduced-motion`: cover reveal + load-more scale disabled, entrance/fade jump to settled, kill transitions.

## Constraints
- Front-end only for design tokens — backend CRUD via existing gallery pattern (types/lib/mixin/api).
- Cover images uploaded to object-storage; reuse existing upload-dropzone pattern.
- Markdown content via textarea (no WYSIWYG, no live preview — out of scope).
- No category filtering or search on the blog hub (out of scope).
- Load More pagination in batches of 9.
- Red reserved for CTAs, badges, arrows, focus rings, blockquote borders — never decorative.
- Hidden /admin/blog route behind II auth — no link in public nav.
- Square corners (pill CTAs exempt), zero shadows, across all blog surfaces.
- Reuse existing navbar, footer, loading screen, entrance animations.

## Signature Detail
A full-viewport-width cinematic cover image opens every article like a broadsheet front page, then collapses into a narrow max-w-3xl reading column where bright white condensed headlines anchor soft blue-tinted grey body text — the shift from spectacle to manifesto happens in one scroll. The blog hub mirrors this: one full-width featured hero commands attention, then a quiet translucent grid of cards fades in upward as you scroll, each lifting one OKLCH step on hover, until a single red outline "Load More" pill invites the next batch of nine.

## ArticleCard & /real-british-history Hub

> Reusable vertical preview card shared by both hubs and the /blog featured grid below the hero. The /real-british-history hub uses a uniform ArticleCard grid with NO featured hero — just a hub header zone, then the grid.

### ArticleCard
- `.article-card` — vertical card; translucent blue-tinted surface (reuses `--blog-card` / 0.4 + backdrop-blur), white/10 hairline border, square corners, hover lift translateY(-4px) + background/border intensify.
- Top image: `.article-card-cover` — `aspect-video w-full h-full object-cover`, `--blog-cover-fallback` placeholder, image reveal on load.
- Body: `.article-card-body` — padding 1.25rem 1.5rem 1.5rem, gap 0.75rem.
- Title: `.article-card-title` — `--blog-prose-heading` bright white, Oswald display 700, uppercase, 1.25rem, line-clamp-2.
- Meta: `.article-card-meta` — author + readTime on one line, `--blog-prose-muted`, JetBrains Mono uppercase, dot separator.
- Entire card + Read Article button route to `/post/[slug]`.

### Category Pill (per-category color)
- `.category-pill` — small uppercase mono badge below the image, square corners, no shadow.
- `.is-blog` — red `--primary` (matches existing `.category-badge`).
- `.is-rbh` — blue-tinted azure `--category-rbh` (oklch 0.6 0.14 235) so the two hubs are distinguishable at a glance.

### Read Article Button
- `.read-article-button` — primary red `--primary`, square corners (card-internal, NOT a pill), full-width in card body, hover intensifies to oklch(0.62 0.24 25). Inline `.read-article-arrow` nudges up-right on hover.

### /real-british-history Hub
- `.hub-header` — eyebrow + display headline + standfirst zone (max-w-3xl mx-auto), matches the /blog hub hero header styling WITHOUT a featured hero card.
- `.hub-eyebrow` — `--muted-foreground`, JetBrains Mono uppercase, 0.22em tracking.
- `.hub-title` — `--blog-prose-heading` bright white, Oswald display 700, uppercase, clamp 36–64px.
- `.hub-standfirst` — `--blog-prose-body` soft blue-grey, Inter, max-width 40rem.
- Uniform `.article-card` grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6), no featured hero, Load More in batches of 9, empty state when no published posts.

### New Tokens
| Token | OKLCH | Role |
|---|---|---|
| category-rbh | 0.6 0.14 235 | Real British History pill accent (blue-tinted azure, distinct from red) |
| category-rbh-foreground | 0.14 0.04 235 | RBH pill text (dark navy on azure) |
