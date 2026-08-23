import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

/**
 * ActivismPage — the activism hub.
 *
 * SpaceX discipline: full-viewport video hero with the TAKE ACTION headline,
 * then a six-card grid of the ways to join the fight. One idea + one action
 * per screen. Content sits low in the viewport.
 */

interface ActionCard {
  title: string;
  description: string;
  to: string;
  cta: string;
}

interface MovementPhoto {
  src: string;
  alt: string;
}

/**
 * "THE MOVEMENT IN ACTION" photo grid — six on-the-ground activism
 * photos shown below the JOIN THE FIGHT card grid. Uses the established
 * photo tile pattern (group relative flex aspect-[4/5] flex-col
 * justify-end bg-background; inner absolute inset-0 overflow-hidden
 * bg-image-fallback; img loading='lazy' decoding='async' with
 * group-hover:scale-[1.04] group-hover:brightness-110). No captions,
 * no scrim — image-only tiles, matching the UniversitySocietiesPage
 * chapter grid discipline.
 */
const MOVEMENT_PHOTOS: MovementPhoto[] = [
  {
    src: "/assets/activism/img_2670-01a0079f-a797-76de-aa65-a2145d261370.jpg",
    alt: "Three activists holding capitalism and socialism leaflets at a Turning Point UK street stall.",
  },
  {
    src: "/assets/activism/wolverhampton-1-01a007b9-74d1-7488-8bc0-3a5b218b2d3e.webp",
    alt: "Activist holding a free-speech poster outside the University of Wolverhampton.",
  },
  {
    src: "/assets/activism/manchester2-optimized-01a007b9-74f2-749a-9bbe-80f7ffb957e5.webp",
    alt: "Young man holding a 'Reasons to be a Socialist' flyer at a Turning Point UK street stall.",
  },
];

const ACTIONS: ActionCard[] = [
  {
    title: "Join Us",
    description:
      "Membership tiers (Ambassador, Member, Donor) and backing the movement.",
    to: ROUTES.joinUs,
    cta: "Become a member",
  },
  {
    title: "Become an Activist",
    description:
      "Grassroots volunteer and activist application intake. Get trained, equipped, and deployed to the front line of the movement.",
    to: ROUTES.becomeAnActivist,
    cta: "Sign up",
  },
  {
    title: "Activism Kit",
    description:
      "Request free official campaign materials, stickers, and gear. Everything you need to organise, canvass, and campaign effectively.",
    to: ROUTES.activismKit,
    cta: "Get the kit",
  },
  {
    title: "Education Watch",
    description:
      "Submit confidential whistleblower reports and track bias. Hold institutions accountable for impartiality.",
    to: ROUTES.educationWatch,
    cta: "Submit a report",
  },
  {
    title: "University Societies",
    description:
      "Campus chapter directory and starting student societies. Bring the fight to your campus — find your local chapter or launch a new one.",
    to: ROUTES.universitySocieties,
    cta: "Find a chapter",
  },
  {
    title: "Petition",
    description:
      "Signing active campaigns and regional movement petitions. Add your name to the campaigns pushing for change.",
    to: ROUTES.petition,
    cta: "Sign a petition",
  },
];

export function ActivismPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  useSeoMeta({
    title: PAGE_SEO["/activism"].title,
    description: PAGE_SEO["/activism"].description,
    canonical: `${SITE_BASE_URL}/activism`,
    url: `${SITE_BASE_URL}/activism`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/activism"])],
  });
  return (
    <div ref={ref}>
      <Hero
        eyebrow="Activism"
        headline="TAKE ACTION"
        sub="Six ways to join the fight — on campus, on the streets, and online."
        videoLabel="Activism hero video"
        buttons={[
          {
            label: "BECOME AN ACTIVIST",
            to: ROUTES.becomeAnActivist,
            variant: "primary",
          },
        ]}
        lazy={false}
      />

      {/* Six-card grid — the six ways to join the fight. */}
      <Section
        background="background"
        variant="center"
        id="ways-to-join"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Six ways in
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              JOIN THE FIGHT
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Pick your front. Every role matters. Spot bias in the classroom?{" "}
              <Link
                to={ROUTES.educationWatch}
                className="text-inherit underline"
              >
                Report it through Education Watch
              </Link>
              .
            </p>
          </div>

          <div
            data-ocid="activism.cards"
            className="entrance-left mt-14 grid grid-cols-1 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-3"
            data-entrance-delay="320"
          >
            {ACTIONS.map((card, i) => (
              <Link
                key={card.title}
                to={card.to}
                data-ocid={`activism.card.${i}`}
                className={cn(
                  "group flex h-full flex-col bg-background p-8 transition-smooth",
                  "hover:bg-card focus-visible:bg-card",
                )}
              >
                <span className="text-eyebrow text-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 font-body text-sm font-light leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
                <span
                  className={cn(
                    "mt-8 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-foreground",
                    "transition-smooth group-hover:text-primary",
                  )}
                >
                  {card.cta}
                  <span
                    aria-hidden="true"
                    className="inline-block h-px w-6 bg-current transition-smooth group-hover:w-10"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* The movement in action — on-the-ground activism photo grid. */}
      <Section
        background="background"
        variant="center"
        id="movement-in-action"
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
              THE MOVEMENT IN ACTION
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Real activists, real streets, real campuses. This is what the
              fight looks like.
            </p>
          </div>

          <div
            data-ocid="activism.photos"
            className="entrance-left mt-14 grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {MOVEMENT_PHOTOS.map((photo, i) => (
              <div
                key={photo.src}
                data-ocid={`activism.photo.${i}`}
                className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden bg-image-fallback"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
