import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { POSTER_FLAG_WAVING, VIDEO_FLAG_WAVING } from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

/**
 * UniversitySocietiesPage — the chapter directory + start-a-society page.
 *
 * SpaceX discipline: full-viewport video hero with the UNIVERSITY SOCIETIES
 * headline, then a tile grid of TPUK chapters with real campus photos, then a
 * "More campus photos" gallery strip showing the remaining uploaded photos,
 * then a START A SOCIETY section carrying the NationBuilder chapter application
 * embed slot. One idea + one action per screen.
 *
 * The chapter application is a third-party NationBuilder embed pasted in later
 * — this page renders a clearly labelled placeholder slot only. No live
 * integration.
 */

/** Base path for the staged campus photos (served from `public/`). */
const GALLERY_BASE = "/assets/gallery/";

/** Base path for the activism-in-action photos (served from `public/`). */
const ACTIVISM_BASE = "/assets/activism/";

interface Chapter {
  /**
   * Internal label for the chapter tile. NOT rendered — city-name captions
   * were removed from the grid, so this field is internal reference only.
   */
  name: string;
  /** Primary photo filename in /assets/gallery/. */
  photo: string;
  /** Accessible alt text describing the campus photo. */
  alt: string;
}

/**
 * The 12 chapter tiles in fixed render order. Each maps to one primary campus
 * photo by filename. The "+ More" tile uses the group banner photo.
 */
const CHAPTERS: Chapter[] = [
  {
    name: "Manchester",
    photo: "birmingham1-1-scaled-019fe4a2-2e9d-712f-9852-855f31ef415e.webp",
    alt: "Two TPUK activists holding FREE MARKETS FREE PEOPLE and SOCIALISM KILLS signs on campus.",
  },
  {
    name: "York",
    photo: "york-1-019fd7d4-3e5d-73ba-b570-20a72e039619.webp",
    alt: "Turning Point UK chapter photo from York.",
  },
  {
    name: "Winchester",
    photo: "winchester1-1-019fd7d4-3e79-763f-a5ea-c1edd1060d05.jpg",
    alt: "Turning Point UK chapter photo from Winchester.",
  },
  {
    name: "Southampton",
    photo: "southampton1-1-019fd7d4-3e64-705d-84b4-d337f1afea84.jpg",
    alt: "Turning Point UK chapter photo from Southampton.",
  },
  {
    name: "Coventry",
    photo: "coventry-1-019fd7d4-3e58-77cc-bac6-f8fa7f6cb5f9.webp",
    alt: "Turning Point UK chapter photo from Coventry.",
  },
  {
    name: "Loughborough",
    photo: "keele2-optimized-scaled-019fe4a2-2eba-712f-b34a-bc83ce6b141b.webp",
    alt: "TPUK activist holding an I LOVE CAPITALISM sign at a campus stall.",
  },
  {
    name: "Keele",
    photo: "keele1-optimized-scaled-019fd7d4-3fb1-7691-8081-a85bc7ed82f6.webp",
    alt: "Turning Point UK chapter photo from Keele.",
  },
  {
    name: "UCL",
    photo: "ucl-optimized-scaled-019fd7d4-3d50-7571-ae99-8bb8fea3a572.webp",
    alt: "Turning Point UK chapter photo from UCL.",
  },
  {
    name: "Portsmouth",
    photo: "york-1-019fe4a2-2c84-737d-8fd5-9c8294f19d24.webp",
    alt: "Two TPUK activists holding an I'm a Conservative poster and a capitalism poster on campus.",
  },
  {
    name: "Birmingham",
    photo: "birmingham1-1-scaled-019fd7d4-4044-7494-94bb-bd25d683cb8f.webp",
    alt: "Turning Point UK chapter photo from Birmingham.",
  },
  {
    name: "Imperial",
    photo: "keele1-optimized-scaled-019fe4a2-2e8f-700f-bae6-8efcd773fd12.webp",
    alt: "Three TPUK activists at an outreach table with campaign pamphlets on campus.",
  },
  {
    name: "+ More",
    photo: "home-600x450-019fd7d4-3d0d-772f-8898-dde66fbf2fa0.webp",
    alt: "Turning Point UK activists holding a banner on a city street.",
  },
];

/**
 * The activities TPUK campus societies host, in fixed display order. Rendered
 * as a numbered grid in the "What Societies Host" section.
 */
const SOCIETY_ACTIVITIES: string[] = [
  "Debates / Discussion Forums / Panels",
  "Speakers",
  "Activist Training Seminars",
  "Film Screenings",
  "Grassroots Activism Campaigns",
];

/**
 * The requirements every TPUK University Society agrees to, in fixed display
 * order. Rendered as a numbered list in the "Chapter Requirements" section.
 */
const CHAPTER_REQUIREMENTS: string[] = [
  "Maintain an Executive Board with at least three (3) positions: President, Vice President, and Treasurer",
  "Organise at least one (1) activism initiative per academic term",
  "Remain in communication with a TPUK Regional Director",
  "Submit an 'End of Year' Report to TPUK HQ",
  "Sign the Societies Charter Agreement",
  "Adhere to TPUK's Chapter Code of Conduct",
];

/**
 * The remaining uploaded campus photos not used as primary chapter tiles.
 * Rendered in a "More campus photos" gallery strip below the chapter grid.
 * City-name captions were removed from the grid — only the image (with alt
 * text for accessibility) is rendered. Update this array when more photos are
 * uploaded.
 */
const MORE_PHOTOS: { photo: string; alt: string }[] = [
  {
    photo: "keele2-optimized-scaled-019fd7d4-4045-7095-b153-186b57fd9af1.webp",
    alt: "Turning Point UK chapter photo from Keele.",
  },
  {
    photo: "edinburgh-019ffefd-47b9-749c-9139-b3d2f988734a.webp",
    alt: "TPUK activist holding a Margaret Thatcher quote poster at the University of Edinburgh.",
  },
  {
    photo: "wolverhampton-1-019ffefd-47c0-773f-8c79-4a4b05bac343.webp",
    alt: "TPUK activist holding a Jordan Peterson quote poster at the University of Wolverhampton.",
  },
  {
    photo: "keele1-optimized-scaled-019fe4a2-2e8f-700f-bae6-8efcd773fd12.webp",
    alt: "Three TPUK activists at an outreach table with campaign pamphlets.",
  },
  {
    photo: "img_6436-019ffefd-481c-7434-9774-b10efc04ac92.webp",
    alt: "Two people outdoors, one wearing a Refugees Welcome shirt.",
  },
  {
    photo: "manchester2-optimized-1-019ffefd-48d8-7176-bbaa-c1b6c8d12caf.webp",
    alt: "TPUK activist holding a red Reasons to be a Socialist flyer.",
  },
  {
    photo: "winchester1-1-1-019ffefd-48dd-75df-9d61-c9046216318e.jpg",
    alt: "Two TPUK activists holding a NOTHING IS FREE sign and a flyer.",
  },
  {
    photo: "birmingham1-1-scaled-019fe4a2-2e9d-712f-9852-855f31ef415e.webp",
    alt: "Two TPUK activists holding FREE MARKETS FREE PEOPLE and SOCIALISM KILLS signs on campus.",
  },
  {
    photo: "keele2-optimized-scaled-019fe4a2-2eba-712f-b34a-bc83ce6b141b.webp",
    alt: "TPUK activist holding an I LOVE CAPITALISM sign at a campus stall.",
  },
  {
    photo: "event-019fff0e-0081-74dd-995a-696298fc3c21.webp",
    alt: "Two speakers on stage with a Turning Point UK banner.",
  },
  {
    photo: "heriot-watt-019fff0e-00bf-7745-a7c2-fcc071243292.webp",
    alt: "Man holding an I AM NOT A VICTIM poster at a Turning Point UK stall.",
  },
  {
    photo: "york-1-1-019fff0e-00b9-701d-8d63-777abfd866ab.webp",
    alt: "Two men holding capitalism and conservative posters at the University of York.",
  },
  {
    photo: "coventry-1-1-019fff0e-00b8-7485-8906-2911c11f9a56.webp",
    alt: "Three men behind a table with signs at a Turning Point UK Coventry stall.",
  },
  {
    photo: "img_6448-019fff0e-00ad-732b-9603-b5a5c59637c4.webp",
    alt: "Woman being interviewed outdoors at a Turning Point UK event.",
  },
  {
    photo: "ucl-optimized-scaled-2-019fff0e-00cd-718a-98d9-e94fa72a0db8.webp",
    alt: "Woman in a hijab holding a SOCIALISM SUCKS sign at UCL.",
  },
  {
    photo: "img_6435-019fff0e-0085-75a5-84ff-67c3ab2fb263.webp",
    alt: "Man in a red shirt recording an interview at a Turning Point UK event.",
  },
  {
    photo: "img_6397-1-019fff0e-00e3-717c-bae5-f9d5320e105a.webp",
    alt: "Person holding a Cut Taxes Not Trees sign at a Turning Point UK stall.",
  },
  {
    photo: "img_6405-019fff0e-00c5-75d0-a6a4-8626571c1979.webp",
    alt: "Whiteboard street poll comparing Capitalist vs Socialist at a Turning Point UK event.",
  },
  {
    photo: "york-1-019fe4a2-2c84-737d-8fd5-9c8294f19d24.webp",
    alt: "Two TPUK activists holding an I'm a Conservative poster and a capitalism poster on campus.",
  },
  {
    photo: "img_6402-019fff0e-0118-763a-bae0-1c5a0441776b.webp",
    alt: "Man holding a CAPITALISM CURES POVERTY sign at a Turning Point UK event.",
  },
  {
    photo: "img_6390-019fff0e-00cf-7489-badd-850b8d63551f.webp",
    alt: "Man holding a SOCIALISM SUCKS poster at a Turning Point UK stall.",
  },
  {
    photo: "winchester1-1-1-01a007b9-74f3-7610-9c9b-7a48b54a9589.jpg",
    alt: "Two TPUK activists holding a NOTHING IS FREE sign and a flyer.",
  },
  {
    photo: "southampton1-1-019fe4a2-2cc7-770d-a822-76242cd89d0b.jpg",
    alt: "Turning Point UK chapter photo from Southampton.",
  },
];

/**
 * Activism-in-action photos shown in the "Activism in Action" gallery. These
 * are distinct from the campus chapter photos in /assets/gallery/ — they live
 * in /assets/activism/ and depict students with signs, banners, and society
 * tables on the ground. Rendered in a 4-tile grid between the "What Societies
 * Host" section and the "Chapter Requirements" list.
 */
const ACTIVISM_PHOTOS: { photo: string; alt: string }[] = [
  {
    photo: "img_2670-01a0079f-a797-76de-aa65-a2145d261370.jpg",
    alt: "Three TPUK activists holding capitalism and socialism flyers at a campus stall.",
  },
  {
    photo: "home-600x450-1-019fd809-c4a6-75ba-904e-d275f8c3ca4d.webp",
    alt: "Group of TPUK activists holding a Turning Point UK banner beside a red bus on a city street.",
  },
  {
    photo: "manchester2-optimized-01a007b9-74f2-749a-9bbe-80f7ffb957e5.webp",
    alt: "TPUK activist holding a red Reasons to be a Socialist flyer on a city street.",
  },
  {
    photo: "snapchat-1339628970-01a007b9-75b3-767f-b23c-b4bb591126ed.jpg",
    alt: "TPUK activist holding a NOTHING IS FREE sign at a campus stall.",
  },
];

export function UniversitySocietiesPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  // Pure local UI state for the consent checkbox on the chapter application
  // form. Mirrors the EducationWatchPage consent pattern.
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  useSeoMeta({
    title: PAGE_SEO["/university-societies"].title,
    description: PAGE_SEO["/university-societies"].description,
    canonical: `${SITE_BASE_URL}/university-societies`,
    url: `${SITE_BASE_URL}/university-societies`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/university-societies"])],
  });
  return (
    <div ref={ref}>
      <Hero
        eyebrow="On campus"
        headline="UNIVERSITY SOCIETIES"
        sub="Find your local TPUK chapter — or start one."
        videoLabel="University societies hero video"
        buttons={[
          {
            label: "START A SOCIETY",
            to: "#start",
            variant: "primary",
          },
        ]}
        lazy={false}
        videoSrc={VIDEO_FLAG_WAVING}
        posterSrc={POSTER_FLAG_WAVING}
      />

      {/* Mission overview — introductory copy + quick-jump CTAs to the
          chapter directory (#chapters) and the start-a-society form
          (#start). Sits between the Hero and the campus photo grid so the
          reader gets context before browsing chapters. */}
      <Section
        background="navy"
        variant="center"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Our mission on campus
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              WHY TPUK SOCIETIES
            </h2>
          </div>

          <p
            className="entrance-left mt-8 max-w-3xl mx-auto text-center font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
            data-entrance-delay="200"
          >
            TPUK University Societies exist to educate students about the
            importance of limited government, free markets and capitalism.
            Through grassroots activism and peer-to-peer conversations, TPUK
            activists promote and re-brand conservative values at their
            universities. TPUK currently has a presence in universities across
            the country.
          </p>

          <div
            className="entrance-left mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            data-entrance-delay="320"
          >
            {/* biome-ignore lint/a11y/useValidAnchor: in-page anchor to #chapters (element exists below); onClick adds smooth-scroll, href provides native anchor fallback */}
            <a
              href="#chapters"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("chapters")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              data-ocid="societies.quick_jump.directory"
              className="btn-primary-square group rounded-full"
            >
              <span>View Chapter Directory</span>
            </a>
            {/* biome-ignore lint/a11y/useValidAnchor: in-page anchor to #start (element exists below); onClick adds smooth-scroll, href provides native anchor fallback */}
            <a
              href="#start"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("start")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              data-ocid="societies.quick_jump.start"
              className="btn-outline-invert rounded-full"
            >
              <span>Start a Chapter</span>
            </a>
          </div>
        </div>
      </Section>

      {/* Chapter directory — tile grid with real campus photos. */}
      <Section
        background="background"
        variant="center"
        id="chapters"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Find your chapter
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              TPUK ON CAMPUS
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Active societies defending free speech at universities across
              Britain.
            </p>
          </div>

          <div
            data-ocid="chapters.grid"
            className="entrance-left mt-14 grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {CHAPTERS.map((chapter, i) => (
              <div
                key={chapter.name}
                data-ocid={`chapters.tile.${i}`}
                className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              >
                {chapter.photo ? (
                  // Real campus photo — image only, no city-name caption or scrim.
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden bg-image-fallback"
                  >
                    <img
                      src={`${GALLERY_BASE}${chapter.photo}`}
                      alt={chapter.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                    />
                  </div>
                ) : (
                  /* Placeholder tile for chapters with no uploaded photo. */
                  <div
                    data-ocid={`chapters.tile.${i}.placeholder`}
                    className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/40 p-5 text-center"
                  >
                    <span className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
                      {chapter.name}
                    </span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Photo coming soon
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* More campus photos — gallery strip showing the remaining uploaded
          photos. Currently 1 photo (Keele) renders here alongside the 12
          chapter tiles above. Responsive grid with object-cover images and
          subtle captions. */}
      <Section
        background="card"
        variant="center"
        id="more-photos"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              On the ground
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              MORE CAMPUS PHOTOS
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              TPUK societies in action at universities across the country.
            </p>
          </div>

          <div
            data-ocid="more-photos.grid"
            className="entrance-left mt-12 grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {MORE_PHOTOS.map((item, i) => (
              <figure
                key={item.photo}
                data-ocid={`more-photos.item.${i}`}
                className="group relative flex aspect-[4/3] flex-col justify-end bg-background"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden bg-image-fallback"
                >
                  <img
                    src={`${GALLERY_BASE}${item.photo}`}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      {/* Campus Debate & Action — 16:9 YouTube embed. Inline section (not a
          reusable component) per the build contract; reuses the iframe
          attribute pattern from OnYouTube.tsx with the dark SpaceX theme and
          red TPUK accent glow. */}
      <section
        data-ocid="section.campus-debate-action"
        className="w-full bg-background px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              On the ground
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Campus Debate &amp; Action
            </h2>
          </div>

          <div
            className="entrance-left aspect-video mx-auto my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-blue-800 shadow-[0_0_25px_rgba(220,38,38,0.15)]"
            data-entrance-delay="160"
          >
            <iframe
              src="https://www.youtube.com/embed/P9Dtze5ZhPU?si=P9Dtze5ZhPU&controls=0"
              title="Campus Debate & Action"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* What societies host + leadership context — styled card listing the
          events/activities campus societies run, followed by the leadership
          mission copy. Sits after the campus-debate video so the reader sees
          concrete activity before reading the leadership pitch. */}
      <Section
        background="navy"
        variant="center"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              On the ground
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              WHAT SOCIETIES HOST
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              TPUK societies bring the movement to campus through a packed
              calendar of debates, training, and direct action.
            </p>
          </div>

          <div
            data-ocid="societies.activities.grid"
            className="entrance-left mt-12 grid grid-cols-1 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-3"
            data-entrance-delay="320"
          >
            {SOCIETY_ACTIVITIES.map((activity, i) => (
              <div
                key={activity}
                data-ocid={`societies.activities.item.${i}`}
                className="flex flex-col gap-2 bg-navy p-6"
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
                  {activity}
                </span>
              </div>
            ))}
          </div>

          <div
            className="entrance-left mt-12 mx-auto max-w-3xl border-l-2 border-primary pl-6"
            data-entrance-delay="440"
          >
            <span className="block text-eyebrow text-foreground/70">
              Leadership context
            </span>
            <p className="mt-3 font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
              As a TPUK University Societies Leader, you will have the
              opportunity to build a strong conservative activist network at
              your place of education, plan and execute activism initiatives,
              help students consider new perspectives, and inform your peers
              about the importance of economic freedom and limited government.
            </p>
          </div>
        </div>
      </Section>

      {/* Activism in action — gallery of activism photos (students with
          signs, banners, society tables) sourced from /assets/activism/. This
          is a NEW section distinct from the #chapters grid and #more-photos
          strip above (which use /assets/gallery/ campus photos). Sits after
          the "What Societies Host" grid and before the "Chapter Requirements"
          list so the reader sees concrete on-the-ground activism before
          reading the commitment. */}
      <Section
        background="background"
        variant="center"
        id="activism"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              ACTIVISM IN ACTION
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              OUR SOCIETIES ON THE GROUND
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              TPUK societies take the fight for free speech and free markets
              directly to campus — with signs, banners, and outreach tables.
            </p>
          </div>

          <div
            data-ocid="activism.grid"
            className="entrance-left mt-14 grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {ACTIVISM_PHOTOS.map((item, i) => (
              <figure
                key={item.photo}
                data-ocid={`activism.item.${i}`}
                className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden bg-image-fallback"
                >
                  <img
                    src={`${ACTIVISM_BASE}${item.photo}`}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      {/* Requirements breakdown — clear card listing what a TPUK society
          must maintain to stay in good standing. Sits between the leadership
          section and the support callouts so the reader understands the
          commitment before reading what TPUK provides. */}
      <Section
        background="card"
        variant="center"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              The commitment
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              CHAPTER REQUIREMENTS
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Every TPUK University Society agrees to a clear set of standards
              that keep the movement organised, accountable, and effective.
            </p>
          </div>

          <ul
            data-ocid="societies.requirements.list"
            className="entrance-left mt-10 grid grid-cols-1 gap-px overflow-hidden border border-foreground/15 bg-foreground/15"
            data-entrance-delay="320"
          >
            {CHAPTER_REQUIREMENTS.map((req, i) => (
              <li
                key={req}
                data-ocid={`societies.requirements.item.${i}`}
                className="flex items-start gap-4 bg-card p-5"
              >
                <span className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-body text-sm font-light leading-relaxed text-foreground/85 sm:text-base">
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Support callouts — two paired blocks explaining what TPUK provides
          to new and existing chapters. "LET'S GET STARTED" speaks to founders
          launching a new chapter; "JOIN A SOCIETY" speaks to students joining
          an existing one. Sits right before the #start form so the call to
          action flows directly into the application. */}
      <Section
        background="background"
        variant="center"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 md:grid-cols-2">
            <div
              data-ocid="societies.support.get_started"
              className="entrance-left flex flex-col gap-4 bg-background p-8 sm:p-10"
              data-entrance-delay="0"
            >
              <span className="text-eyebrow text-primary">For founders</span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                LET'S GET STARTED
              </h3>
              <p className="font-body text-base font-light leading-relaxed text-foreground/80">
                TPUK provides materials, advising, and on-site staff support to
                help you launch and grow your campus chapter. From your first
                informational meeting to your first activism campaign, we back
                you with training, resources, and kit.
              </p>
              {/* biome-ignore lint/a11y/useValidAnchor: in-page anchor to #start (element exists below); onClick adds smooth-scroll, href provides native anchor fallback */}
              <a
                href="#start"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("start")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                data-ocid="societies.support.get_started.cta"
                className="btn-primary-square group mt-2 self-start rounded-full"
              >
                <span>Launch a Chapter</span>
              </a>
            </div>

            <div
              data-ocid="societies.support.join"
              className="entrance-right flex flex-col gap-4 bg-background p-8 sm:p-10"
              data-entrance-delay="120"
            >
              <span className="text-eyebrow text-primary">For students</span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                JOIN A SOCIETY
              </h3>
              <p className="font-body text-base font-light leading-relaxed text-foreground/80">
                Already a TPUK chapter at your university? Join the network.
                TPUK provides materials, advising, and on-site staff support to
                every active society, so you can plug straight into organised
                activism, training, and events from day one.
              </p>
              {/* biome-ignore lint/a11y/useValidAnchor: in-page anchor to #chapters (element exists above); onClick adds smooth-scroll, href provides native anchor fallback */}
              <a
                href="#chapters"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("chapters")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                data-ocid="societies.support.join.cta"
                className="btn-outline-invert mt-2 self-start rounded-full"
              >
                <span>Find Your Chapter</span>
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* START A SOCIETY — NationBuilder chapter application embed slot. */}
      <Section
        background="card"
        variant="center"
        id="start"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Don't see your uni?
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              START A SOCIETY
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              No chapter at your university? Launch one. We'll back you with
              training, resources, and kit. Apply below.
            </p>
          </div>

          <div className="entrance-left mt-12" data-entrance-delay="320">
            {/* Chapter application form — Mailchimp subscribe form, analytics-free.
                No Mailchimp JS (mc-validate.js / jQuery / $mcj) is loaded; the
                form submits natively via its action attribute. All Mailchimp
                backend hidden fields and the honeypot are preserved so
                submissions route directly into Mailchimp. Mirrors the
                EducationWatchPage whistleblower form pattern. */}
            <form
              action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;f_id=007ec1e5f0"
              method="post"
              id="mc-embedded-subscribe-form-societies"
              name="mc-embedded-subscribe-form"
              className="validate w-full max-w-2xl mx-auto"
              target="_blank"
              onSubmit={(e) => {
                if (!consent) {
                  e.preventDefault();
                  setConsentError(true);
                  return;
                }
                setConsentError(false);
              }}
            >
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-EMAIL"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  E-mail Address *
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL"
                  required
                  className="admin-input"
                  data-ocid="societies.email_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-FNAME"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="FNAME"
                  id="mce-FNAME"
                  className="admin-input"
                  data-ocid="societies.fname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-LNAME"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="LNAME"
                  id="mce-LNAME"
                  className="admin-input"
                  data-ocid="societies.lname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE8"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Student Number
                </label>
                <input
                  type="number"
                  name="MMERGE8"
                  id="mce-MMERGE8"
                  className="admin-input"
                  data-ocid="societies.student_number_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE14"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Institution / School Name *
                </label>
                <input
                  type="text"
                  name="MMERGE14"
                  id="mce-MMERGE14"
                  required
                  className="admin-input"
                  data-ocid="societies.institution_input"
                />
              </div>
              {/* Mailchimp bot-protection honeypot — hidden off-screen so human
                  users never see it but bots fill it in. Preserved verbatim. */}
              <div
                aria-hidden="true"
                style={{ position: "absolute", left: "-5000px" }}
              >
                <input
                  type="text"
                  name="b_6fe69c3d0521b617677c81700_2ce1dac979"
                  tabIndex={-1}
                  value=""
                />
              </div>
              {/* Required consent checkbox — must live INSIDE the <form> so the
                  browser blocks submission until it is checked. Mirrors the
                  ContactForm gold-standard pattern. */}
              <div
                data-ocid="societies.consent"
                className="mt-6 flex items-start gap-3"
              >
                <Checkbox
                  id="societies-consent"
                  required
                  checked={consent}
                  onCheckedChange={(value) => {
                    setConsent(value === true);
                    if (value === true) setConsentError(false);
                  }}
                  aria-label="Required: consent to data processing"
                  className="mt-0.5"
                />
                <label
                  htmlFor="societies-consent"
                  className="font-body text-sm font-light leading-relaxed text-foreground/70"
                >
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>{" "}
                  I consent to Turning Point UK processing my personal data in
                  line with the{" "}
                  <Link
                    to={ROUTES.privacyPolicy}
                    className="underline underline-offset-2 transition-smooth hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
                {consentError && (
                  <p
                    data-ocid="societies.consent_error"
                    className="font-body text-sm font-medium text-primary"
                  >
                    Please consent to our Privacy Policy to continue.
                  </p>
                )}
              </div>
              {/* Submit button — user-specified exact classes (intentional
                  exception to the square-corner/red-token discipline for this
                  one button). Wrapped in .clear to preserve Mailchimp semantics. */}
              <div className="clear mt-2">
                <input
                  type="submit"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  value="LAUNCH A CAMPUS CHAPTER"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
                  data-ocid="societies.submit_button"
                />
              </div>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
