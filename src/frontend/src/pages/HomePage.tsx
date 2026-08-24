import { ArticleCard } from "@/components/ArticleCard";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { Hero } from "@/components/Hero";
import { CampaignCountdown } from "@/components/sections/CampaignCountdown";
import { VigilSpotlight } from "@/components/sections/VigilSpotlight";
import { usePublishedPostsByCategory } from "@/hooks/useBlogPosts";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import {
  VIDEO_ACTIVISM,
  VIDEO_BRITISH_HISTORY,
  VIDEO_MAIN_HERO,
  VIDEO_MBGA,
  VIDEO_NEWSROOM,
  VIDEO_SHOP_HERO,
} from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import { PAGE_SEO, SITE_BASE_URL, buildWebsiteJsonLd } from "@/lib/seo";
import { Link } from "@tanstack/react-router";
import {
  Ban,
  Flag,
  GraduationCap,
  HandMetal,
  Landmark,
  type LucideIcon,
  Medal,
  Megaphone,
  Mic,
  Search,
  Users,
  Video,
} from "lucide-react";

/**
 * HomePage — the front door.
 *
 * Strict 10-section order (per user spec):
 *   (1) Main Top Hero — "Winning the Cultural War" [VIDEO_MAIN_HERO]
 *   (2) The Movement — "What We Stand For" pillars section (bg-navy)
 *   (3) Events & Education Watch [VIDEO_ACTIVISM]
 *   (4) Wear the Message / Shop & Merchandise [VIDEO_SHOP_HERO]
 *   (5) Preserving Our Heritage / History [VIDEO_BRITISH_HISTORY]
 *   (6) Blog Showcase — "LATEST FROM THE MOVEMENT" [VIDEO_NEWSROOM bg]
 *   (7) Memecoin ($MBGA) [VIDEO_MBGA bg]
 *   (8) Our Achievements — six polished impact cards on a dark navy grid
 *   (9) FAQ Accordion — mounted in Layout (homepage only)
 *   (10) Footer — rendered by the Layout shell (not added here)
 *
 * Universal entrance animations: a single `useEntranceAnimation` ref wraps
 * the whole page. The Intersection Observer finds every `.entrance-left` /
 * `.entrance-right` element on the page (including those inside the Hero
 * components, which already carry entrance classes + staggered
 * `data-entrance-delay` on their inner eyebrow / headline / sub / buttons) and
 * adds `.entrance-visible` as they enter the viewport. `prefers-reduced-motion`
 * is honoured by the hook + index.css.
 */

/**
 * TPUK_MOVEMENT_DEFINITION — the canonical movement statement that opens the
 * "What We Stand For" section. Rendered as a single emphasized block above
 * the six aims so the definition reads as the parent statement and the aims
 * as its enumerated commitments.
 */
const TPUK_MOVEMENT_DEFINITION =
  "TPUK IS A MOVEMENT FOR FREE MARKETS, LIMITED GOVERNMENT, PERSONAL RESPONSIBILITY & DUTY TO OTHERS THAT AIMS TO:";

/**
 * AIMS — the six enumerated aims of the movement, rendered as distinct cards.
 * Order matches the canonical TPUK statement: end indoctrination, champion
 * patriotism, protect free speech, promote family & community, oppose
 * socialism & Marxism, and present it all in a youth-friendly format.
 *
 * Each aim carries a Lucide icon (flat solid red glyph, ~28px) rendered above
 * the hairline divider. The icons share a continuous staggered scale-pulse
 * animation (.icon-pulse in index.css) with a per-card animation-delay so the
 * six icons breathe out of phase rather than in lockstep. The delay values
 * (0s, 0.4s, 0.8s, 1.2s, 1.6s, 2.0s) are set inline on each icon element.
 */
const AIMS = [
  {
    title: "End Indoctrination",
    description:
      "End the political indoctrination of students by extremists in our schools and universities.",
    Icon: HandMetal,
    pulseDelay: "0s",
  },
  {
    title: "Champion Patriotism",
    description:
      "Champion patriotism and British culture, protecting and celebrating our national heritage.",
    Icon: Flag,
    pulseDelay: "0.4s",
  },
  {
    title: "Protect Free Speech",
    description:
      "Protect and promote free speech across campuses, institutions, and the public square.",
    Icon: Megaphone,
    pulseDelay: "0.8s",
  },
  {
    title: "Promote Family & Community",
    description:
      "Promote the concept of family and community as the foundation of a strong society.",
    Icon: Users,
    pulseDelay: "1.2s",
  },
  {
    title: "Oppose Socialism & Marxism",
    description:
      "Oppose socialism and Marxism in all their forms, wherever they take root.",
    Icon: Ban,
    pulseDelay: "1.6s",
  },
  {
    title: "Youth-Friendly Format",
    description:
      "Present all the above in a youth-friendly, easily digestible format that reaches the next generation.",
    Icon: Video,
    pulseDelay: "2.0s",
  },
] as const;

/** Number of recent blog articles to preview in the Blog Showcase grid. */
const BLOG_PREVIEW_COUNT = 6;

/**
 * ACHIEVEMENTS — the six headline accomplishments of the movement, rendered
 * as polished cards in the homepage-only "OUR ACHIEVEMENTS" section that sits
 * directly below the $MBGA section. Each card pairs a Lucide icon badge
 * (alternating red / royal blue accents) with a bold white title and a lighter
 * description, on a dark navy grid background that matches the site's deep
 * blue theme. Order matches the canonical TPUK impact list: social reach,
 * government policy, veterans, campus campaigns, high-profile events, and
 * investigative reporting.
 */
const ACHIEVEMENTS: ReadonlyArray<{
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "red" | "blue";
}> = [
  {
    title: "Social Reach",
    description: "Reached millions of people on social media each month.",
    icon: Megaphone,
    accent: "red",
  },
  {
    title: "Influencing Government Policy",
    description:
      "The Campus Free Speech Law. The Culture Department stating that all government buildings must fly the Union Flag all year round.",
    icon: Landmark,
    accent: "blue",
  },
  {
    title: "Supporting Veterans",
    description:
      "Assisting Gurkha veterans in meeting with the government to discuss equal pensions through a digital campaign and a petition signed by over 100,000 people.",
    icon: Medal,
    accent: "red",
  },
  {
    title: "Campus Campaigns",
    description:
      "Ran successful campaigns in over thirty universities across the U.K.",
    icon: GraduationCap,
    accent: "blue",
  },
  {
    title: "High-Profile Events",
    description:
      "Hosted a range of speakers at well-attended events, including Nigel Farage, Lord Daniel Hannan, and Candace Owens.",
    icon: Mic,
    accent: "red",
  },
  {
    title: "Investigative Reporting",
    description:
      "Placed an undercover journalist in Momentum and other leftist political organisations who feeds stories through us to the press regarding extremism and racism in leftist politics.",
    icon: Search,
    accent: "blue",
  },
];

export function HomePage() {
  const containerRef = useEntranceAnimation<HTMLDivElement>();

  // SEO meta — homepage gets the WebSite schema (Organization is handled
  // globally by Layout). No BreadcrumbList on the homepage (it is the
  // root). canonical + og:url use the absolute SITE_BASE_URL + "/".
  useSeoMeta({
    title: PAGE_SEO["/"].title,
    description: PAGE_SEO["/"].description,
    canonical: `${SITE_BASE_URL}/`,
    url: `${SITE_BASE_URL}/`,
    jsonLd: [buildWebsiteJsonLd()],
  });

  // Fetch recent published "Blog" category posts for the Blog Showcase grid.
  // usePublishedPostsByCategory mirrors the /blog hub so the homepage
  // preview and the hub share the same cache key prefix.
  const { posts, loading } = usePublishedPostsByCategory({
    category: "Blog",
    offset: 0,
    limit: BLOG_PREVIEW_COUNT,
  });
  const previewPosts = posts.slice(0, BLOG_PREVIEW_COUNT);

  return (
    <div ref={containerRef}>
      {/* (1) Hero — The movement / Winning the Cultural War */}
      <div className="relative">
        <Hero
          eyebrow="TURNING POINT UK"
          headline="WINNING THE CULTURAL WAR"
          sub="Britain's fastest-growing conservative youth movement. Question. Challenge. Fight Back."
          videoLabel="Hero video 1 - Union Jack waving"
          videoSrc={VIDEO_MAIN_HERO}
          buttons={[
            {
              label: "JOIN THE MOVEMENT",
              to: ROUTES.joinUs,
              variant: "primary",
            },
            {
              label: "DONATE VIA STRIPE / CARD / APPLE PAY",
              href: "https://donate.stripe.com/00w28r7VfeHtcVQfDffw406",
              variant: "outline",
            },
            {
              label: "CONTACT",
              to: ROUTES.contact,
              variant: "outline",
            },
          ]}
          lazy={false}
        />
      </div>

      {/* (1a) Campaign Countdown — featured urgency banner for the live
          Crowdfunder medical-care appeal. Sits directly above the Charlie
          Kirk vigil spotlight. Counts down to a FIXED deadline so it ticks
          toward zero for every visitor rather than resetting to 38 days on
          each load. */}
      <CampaignCountdown />

      {/* (1b) Vigil Spotlight — featured event, directly below the Hero and
          before the 'What We Stand For' pillars section. Carries id="vigil"
          so the announcement bar's 'Learn More' link scrolls here. */}
      <VigilSpotlight />

      {/* (2) What We Stand For — the TPUK movement definition + six aims.
          The movement definition is rendered as a single emphasized statement
          block (red eyebrow + large display headline + definition paragraph)
          that establishes the parent commitment; the six aims follow as a
          responsive 1/2/3-column card grid, each card a hairline-bordered
          neutral panel that lifts its border to red on hover with a title
          and description. The section background is transparent so the
          universal ambient midnight mesh (painted on <body>) shows through,
          zoning it apart from the full-viewport heroes above and
          below. Universal entrance animations are preserved: the eyebrow,
          headline, definition, and each card carry entrance-left with
          staggered data-entrance-delay, observed by the single
          useEntranceAnimation wrapper that scopes the homepage. */}
      <section
        id="pillars"
        data-ocid="section.pillars"
        className="w-full px-6 py-32 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Movement definition block — the parent statement.
              Eyebrow + headline + definition paragraph, each sliding in
              from the left with a staggered delay. The definition paragraph
              is set in display caps with key terms emphasized in red so the
              four pillars (free markets, limited government, personal
              responsibility, duty to others) read as a single emphatic
              commitment before the six aims enumerate the actions. */}
          <div className="mb-20 flex max-w-4xl flex-col gap-5">
            <span
              className="entrance-left text-eyebrow"
              data-entrance-delay="0"
            >
              WHAT WE STAND FOR
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              The Movement
            </h2>
            <p
              className="entrance-left font-display text-xl font-medium uppercase leading-snug tracking-wide text-foreground/90 sm:text-2xl md:text-3xl"
              data-entrance-delay="160"
            >
              {TPUK_MOVEMENT_DEFINITION}
            </p>
          </div>

          {/* Six aims — responsive card grid.
              1 column on mobile, 2 on sm, 3 on lg. Each card carries a
              display-caps title and a muted body description. Cards stagger
              in from the left. */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AIMS.map((aim, i) => {
              const { Icon } = aim;
              return (
                <div
                  key={aim.title}
                  data-ocid={`section.pillars.card.${i + 1}`}
                  className="entrance-left group flex flex-col gap-4 border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md transition-colors hover:border-red-600 sm:p-8"
                  data-entrance-delay={String(i * 80)}
                >
                  {/* Flat solid red Lucide glyph (~28px) above the hairline
                      divider. Carries the .icon-pulse staggered scale-pulse
                      with a soft red drop-shadow glow; per-card
                      animation-delay staggers the six icons out of phase.
                      The existing prefers-reduced-motion block in index.css
                      neutralizes the animation for reduced-motion users. */}
                  <Icon
                    className="icon-pulse h-7 w-7 text-red-600"
                    style={{ animationDelay: aim.pulseDelay }}
                    aria-hidden="true"
                  />
                  {/* Hairline divider above the title — widens to red on
                      hover for a subtle interactive cue. */}
                  <span className="h-px w-10 bg-border transition-colors group-hover:bg-red-600" />
                  <h3 className="font-display text-lg uppercase tracking-wide text-foreground">
                    {aim.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {aim.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* (3) Hero — Events & Education Watch */}
      <Hero
        eyebrow="ON THE GROUND"
        headline="EVENTS & EDUCATION WATCH"
        sub="Campus speeches, rallies, and a confidential channel to report classroom bias."
        videoLabel="Hero video 2 - modern London montage"
        videoSrc={VIDEO_ACTIVISM}
        buttons={[
          { label: "VIEW CALENDAR", to: ROUTES.events, variant: "primary" },
          {
            label: "SUBMIT A REPORT",
            to: ROUTES.educationWatch,
            variant: "outline",
          },
        ]}
      />

      {/* (4) Hero — Wear the Message / Shop & Merchandise */}
      <Hero
        eyebrow="OFFICIAL MERCHANDISE"
        headline="WEAR THE MESSAGE"
        sub="Every order funds the movement. Shipped across the UK."
        videoLabel="Hero video 3 - merch flatlay on Union Jack"
        videoSrc={VIDEO_SHOP_HERO}
        buttons={[
          {
            label: "SHOP THE COLLECTION",
            to: ROUTES.merchandise,
            variant: "primary",
          },
        ]}
      />

      {/* (5) Hero — Preserving Our Heritage / History */}
      <Hero
        eyebrow="OUR ROOTS"
        headline="PRESERVING OUR HERITAGE"
        sub="Rooted in the story of Britain — and fighting for its future."
        videoLabel="Hero video 4 - black-and-white Victorian London"
        videoSrc={VIDEO_BRITISH_HISTORY}
        buttons={[
          {
            label: "LEARN OUR HISTORY",
            to: ROUTES.realBritishHistory,
            variant: "primary",
          },
        ]}
      />

      {/* (6) Blog Showcase — "LATEST FROM THE MOVEMENT".
          A full-bleed section with VIDEO_NEWSROOM as the background
          hero video, the deep-blue gradient overlay, and a grid of recent
          "Blog" category article preview cards rendered through the shared
          ArticleCard component. A primary "READ ALL ARTICLES" CTA links
          to /blog (ROUTES.blog). Built as a custom <section> (not a Hero)
          because the grid + header + CTA layout is not supported by the
          full-viewport Hero component.

          Z-LAYERING: the section carries `isolate` (its own stacking
          context) so the shared <BackgroundVideo> -z-10 wrapper paints
          above the section's transparent background but below the content
          at z-20. The bg-black/50 readability overlay is rendered by
          <BackgroundVideo> directly over the video.

          The video uses autoPlay loop muted playsInline controls={false}
          so it plays as a background with no lag and no user controls. */}
      <section
        data-ocid="section.blog-showcase"
        className="relative isolate w-full overflow-hidden px-6 py-20 sm:px-10 sm:py-28 lg:py-32"
      >
        {/* Background video — rendered through the shared <BackgroundVideo>
            component so it inherits IntersectionObserver lazy loading
            (preload="metadata" until near the viewport, then "auto" + play())
            and the mobile play() retry path. lazy defaults to true since
            this section is below the fold. */}
        <BackgroundVideo
          videoSrc={VIDEO_NEWSROOM}
          ariaLabel="Background video - UK newspaper collage"
        />

        {/* Extra readability tint — this section's text spans its full
            height (unlike the bottom-anchored Hero), so a uniform midnight
            tint on top of BackgroundVideo's bg-black/50 keeps all copy at
            WCAG AA contrast against bright video frames. Later -z-10
            sibling paints above the video container, below the content. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[#030712]/35"
        />

        {/* Content — header + article grid + CTA, all at z-20 above the
            overlay. */}
        <div className="relative z-20 mx-auto w-full max-w-7xl">
          {/* Section header — eyebrow + headline + subtext, each sliding in
              from the left with a staggered delay. */}
          <div className="mb-16 flex max-w-3xl flex-col gap-5">
            <span
              className="entrance-left text-eyebrow text-foreground/80"
              data-entrance-delay="0"
            >
              FROM THE NEWSROOM
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              LATEST FROM THE MOVEMENT
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="160"
            >
              Commentary, campaign updates, and stories from the front line of
              the cultural war — straight from the TPUK newsroom.
            </p>
          </div>

          {/* Article grid — recent "Blog" category posts rendered through
              the shared ArticleCard component. Responsive 1/2/3 columns.
              Shows up to BLOG_PREVIEW_COUNT cards. While posts load, a
              matching set of skeleton placeholders preserves the grid
              layout so the section never collapses. When no posts are
              available, a single-line empty state invites the reader to
              the /blog hub. */}
          {loading && previewPosts.length === 0 ? (
            <div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              data-ocid="section.blog-showcase.loading_state"
            >
              {[
                { key: "skeleton-a", pos: 1 },
                { key: "skeleton-b", pos: 2 },
                { key: "skeleton-c", pos: 3 },
              ].map(({ key, pos }) => (
                <div
                  key={key}
                  data-ocid={`section.blog-showcase.skeleton.${pos}`}
                  className="article-card animate-pulse"
                  aria-hidden="true"
                >
                  <div className="article-card-cover bg-foreground/10" />
                  <div className="article-card-body">
                    <div className="h-5 w-24 rounded-full bg-foreground/10" />
                    <div className="mt-3 h-5 w-3/4 rounded bg-foreground/10" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-foreground/10" />
                    <div className="mt-4 h-10 w-full rounded bg-foreground/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : previewPosts.length === 0 ? (
            <div
              className="article-card entrance-left flex flex-col gap-4 p-8 sm:p-10"
              data-ocid="section.blog-showcase.empty_state"
              data-entrance-delay="240"
            >
              <span className="category-pill is-blog">Newsroom</span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground sm:text-3xl">
                New articles coming soon
              </h3>
              <p className="max-w-xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
                The TPUK newsroom is preparing the next dispatch from the front
                line of the cultural war. Check back shortly for the latest
                commentary, campaign updates, and stories from the movement.
              </p>
              <div className="mt-2 flex">
                <Link
                  to={ROUTES.blog}
                  data-ocid="section.blog-showcase.empty_state.visit_hub_button"
                  className="btn-primary-square group rounded-full"
                >
                  <span>VISIT THE NEWSROOM</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {previewPosts.map((post, i) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  index={i + 1}
                  baseDelay={240}
                />
              ))}
            </div>
          )}

          {/* READ ALL ARTICLES CTA — primary red pill linking directly to
              /blog (ROUTES.blog). Slides in from the left after the grid. */}
          <div className="entrance-left mt-16 flex" data-entrance-delay="320">
            <Link
              to={ROUTES.blog}
              data-ocid="section.blog-showcase.read_all_button"
              className="btn-primary-square group rounded-full"
            >
              <span>READ ALL ARTICLES</span>
            </Link>
          </div>
        </div>
      </section>

      {/* (7) $MBGA — the movement's official memecoin.
           A dark premium single-column section: the header (eyebrow + h2 +
           paragraph) and the pill CTA sit left-aligned on the left side of
           the section, over the background video. Slides in on scroll via
           the existing entrance system (entrance-left + staggered
           data-entrance-delay), reusing the single useEntranceAnimation
           wrapper that already scopes the whole homepage. Built as a custom
           <section> (not a Hero) because the left-aligned text + CTA
           layout is not supported by the full-viewport Hero component.

           A native HTML5 background video (the $MBGA footage) sits at -z-10
           inside the section's isolated stacking context, with the
           bg-black/50 readability overlay rendered by <BackgroundVideo>
           directly over the video and the left-aligned content at z-20. */}
      <section
        data-ocid="section.mbga"
        className="relative isolate w-full overflow-hidden px-6 py-20 sm:px-10 sm:py-28 lg:py-32"
      >
        {/* Background video — rendered through the shared <BackgroundVideo>
            component so it inherits IntersectionObserver lazy loading
            (preload="metadata" until near the viewport, then "auto" + play())
            and the mobile play() retry path. lazy defaults to true since
            this section is below the fold. */}
        <BackgroundVideo
          videoSrc={VIDEO_MBGA}
          ariaLabel="Background video - $MBGA hero"
        />

        {/* Extra readability tint — full-height text section; see the blog
            showcase section above for the contrast rationale. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[#030712]/35"
        />

        {/* Left-aligned content — eyebrow + h2 + paragraph + CTA, all
            aligned to the left side of the section. The single column
            uses items-start / justify-start and text-left so the header
            and CTA sit on the left, not centered. Eyebrow, headline,
            subtext, and CTA each carry their own entrance-left +
            staggered delay so they reveal in sequence. */}
        <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-start justify-start gap-6 text-left">
          <span
            className="entrance-left text-eyebrow text-foreground/80"
            data-entrance-delay="0"
          >
            $MBGA
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            The Official Token of the Movement:{" "}
            <span className="text-primary">$MBGA</span>
          </h2>
          <p
            className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
            data-entrance-delay="160"
          >
            $MBGA is the movement's official memecoin — a decentralised way to
            back the cause, fund the fight, and put Britain's cultural comeback
            on-chain. Every transaction fuels the movement.
          </p>
          <div
            className="entrance-left mt-2 flex flex-wrap gap-3"
            data-entrance-delay="240"
          >
            <Link
              to={ROUTES.mbga}
              data-ocid="section.mbga.button"
              className="btn-primary-square group rounded-full"
            >
              <span>Explore $MBGA</span>
            </Link>
          </div>
        </div>
      </section>

      {/* (8) OUR ACHIEVEMENTS — homepage-only section inserted directly
           below the $MBGA section. A high-impact dark navy grid background
           (deep blue #00247D / navy-950 gradient) matching the site's primary
           theme, with a bold heading, short subtitle, and exactly six polished
           achievement cards. Each card carries a Lucide icon badge in red or
           royal blue, a bold white title, a lighter white/grey description,
           and a clean red/blue left border accent with a subtle hover lift.
           The hover lift is neutralized for reduced-motion users by the
           existing index.css prefers-reduced-motion block. Built inline in
           HomePage.tsx (NOT in the shared Layout) so it renders on the
           homepage only. The homepage order becomes: ... -> $MBGA ->
           OUR ACHIEVEMENTS -> [page ends] -> EndorsementsSlider (Layout) ->
           HomeFaq (Layout) -> Footer (Layout). */}
      <section
        data-ocid="section.achievements"
        className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Section header — bold heading + short subtitle, each sliding in
              from the left with a staggered delay via the existing entrance
              system. */}
          <div className="mb-12 flex max-w-3xl flex-col gap-4">
            <span
              className="entrance-left text-eyebrow text-foreground/80"
              data-entrance-delay="0"
            >
              OUR IMPACT
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              OUR ACHIEVEMENTS
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
              data-entrance-delay="160"
            >
              A track record of real impact for the movement.
            </p>
          </div>

          {/* Six achievement cards — responsive 1/2/3 column grid.
              Each card: Lucide icon badge (red or royal blue), bold white
              title, lighter description, and a clean left border accent
              (red-600 or blue-700) with a subtle hover lift + shadow. Cards
              stagger in from the left. */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((achievement, i) => {
              const Icon = achievement.icon;
              const isRed = achievement.accent === "red";
              return (
                <div
                  key={achievement.title}
                  data-ocid={`section.achievements.card.${i + 1}`}
                  className={`entrance-left group flex flex-col gap-4 border-l-4 bg-slate-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${
                    isRed ? "border-red-600" : "border-blue-700"
                  }`}
                  data-entrance-delay={String(i * 80)}
                >
                  {/* Icon badge — rounded badge with the Lucide icon in red
                      or royal blue, matching the card's border accent. */}
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                      isRed
                        ? "bg-red-600/15 text-red-600"
                        : "bg-blue-700/15 text-blue-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                    {achievement.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-white/70">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* (9) FAQ — extracted to components/sections/HomeFaq.tsx and mounted
          in Layout.tsx directly below <EndorsementsSlider /> (homepage
          only) so the homepage order is: ... -> $MBGA -> OUR ACHIEVEMENTS ->
          Endorsements Slider -> FAQ -> Footer. On all other pages the FAQ
          does not render. The inline section, the FAQ_ITEMS const, and the
          now-unused Accordion imports were removed from this file. */}

      {/* (10) Footer — rendered by the Layout shell, not added here. */}
    </div>
  );
}
