import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { POSTER_FLAG_WAVING, VIDEO_FLAG_WAVING } from "@/lib/assets";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";

/**
 * PatreonPage — dedicated /patreon landing page.
 *
 * Routes supporters to the external Patreon at
 * https://www.patreon.com/tpointuk. SpaceX discipline: full-bleed hero
 * with the single primary BECOME A PATRON CTA (external href, opens in a
 * new tab), then 2-3 supporting sections explaining the benefits of
 * backing independent TPUK podcast content — exclusive episodes,
 * behind-the-scenes, community access, and direct support of the movement.
 * A final closing section repeats the primary CTA so the page never
 * leaves a convinced reader without an immediate next step.
 */

/** External Patreon URL — the single CTA target across the page. */
const PATREON_URL = "https://www.patreon.com/tpointuk";

interface Benefit {
  eyebrow: string;
  title: string;
  body: string;
}

interface GalleryPhoto {
  src: string;
  alt: string;
}

/**
 * ENDORSEMENT_PHOTOS — MP endorsement graphics for the Patreon page.
 * One endorsement tile per MP, using the -019fd809 crop of each numeric
 * thumbnail (1507, 1509, 1510, 1511, 1512, 1513, 1514, 1637). These
 * sit between the mission section and the benefits section to motivate
 * becoming a patron: the people's representatives back the movement, so
 * should the people who listen. Uses the established site photo tile
 * pattern (group relative flex aspect-[4/5] flex-col justify-end
 * bg-background; inner absolute inset-0 overflow-hidden bg-image-fallback;
 * img loading='lazy' decoding='async' object-cover group-hover:scale-[1.04]
 * group-hover:brightness-110).
 */
const ENDORSEMENT_PHOTOS: GalleryPhoto[] = [
  {
    src: "/assets/activism/1507-300x300-019fd809-c47a-732f-a0ee-d385094eb40b.webp",
    alt: "MP endorsement graphic for Turning Point UK - Priti Patel.",
  },
  {
    src: "/assets/activism/1509-300x300-019fd809-c48c-7130-9fc0-ec276a3c4336.webp",
    alt: "MP endorsement graphic for Turning Point UK - Jacob Rees-Mogg.",
  },
  {
    src: "/assets/activism/1510-300x300-019fd809-c4a0-75c5-b194-8b6c3e375159.webp",
    alt: "MP endorsement graphic for Turning Point UK - Bernard Jenkin.",
  },
  {
    src: "/assets/activism/1511-019fd809-c4a5-77f7-9a0e-217d691084af.webp",
    alt: "MP endorsement graphic for Turning Point UK - Anne-Marie Trevelyan.",
  },
  {
    src: "/assets/activism/1512-300x300-019fd809-c487-71bc-870c-eaec6f4774fd.webp",
    alt: "MP endorsement graphic for Turning Point UK - Chris Green.",
  },
  {
    src: "/assets/activism/1513-300x300-019fd809-c496-714e-a79b-db3f247246a4.webp",
    alt: "MP endorsement graphic for Turning Point UK - Ben Bradley.",
  },
  {
    src: "/assets/activism/1514-300x300-019fd809-c487-77c0-9ab5-4bc12cc7b58c.webp",
    alt: "MP endorsement graphic for Turning Point UK - Nigel Farage.",
  },
  {
    src: "/assets/activism/1637-300x300-019fd809-c490-76af-8d4b-91bead75d63a.webp",
    alt: "MP endorsement graphic for Turning Point UK - Brendan Clarke-Smith.",
  },
];

const BENEFITS: Benefit[] = [
  {
    eyebrow: "EXCLUSIVE EPISODES",
    title: "Hear what the platforms won't air",
    body: "Patrons unlock full-length episodes, extended interviews, and off-the-record conversations that never make it to the public feed. The deeper analysis, the unfiltered takes, and the guests who can only speak when the cameras are off — all yours, ad-free, the moment they're recorded.",
  },
  {
    eyebrow: "BEHIND THE SCENES",
    title: "Inside the studio",
    body: "Watch how each episode is built. Raw footage, the prep calls before a guest goes live, the segments that hit the cutting-room floor, and the producer notes that shape every show. You see the movement the way the team sees it — unpolished, honest, and in real time.",
  },
  {
    eyebrow: "COMMUNITY ACCESS",
    title: "Stand with the people who get it",
    body: "Join a private community of supporters who back independent British media. Dedicated discussion channels, early notice on live recordings, direct lines to the hosts, and meet-ups where the conversation continues off-air. This is where the movement's most engaged listeners actually talk back.",
  },
];

const CLOSING_BENEFITS: Benefit[] = [
  {
    eyebrow: "DIRECT SUPPORT",
    title: "Fund the movement, not the middlemen",
    body: "Every pound goes straight to the equipment, the studio time, the travel, and the people who make the podcasts. No advertisers to please, no algorithm to feed, no editorial line handed down from above. Patron support is what keeps the mic independent.",
  },
];

export function PatreonPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/patreon"].title,
    description: PAGE_SEO["/patreon"].description,
    canonical: `${SITE_BASE_URL}/patreon`,
    url: `${SITE_BASE_URL}/patreon`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/patreon"])],
  });

  return (
    <div ref={ref}>
      {/* Hero — the call to back the podcasts. */}
      <Hero
        eyebrow="Back the podcasts"
        headline="SUPPORT ON PATREON"
        sub="Independent British podcasting, funded by the people who listen. Back the movement, unlock the full feed, and keep the mic free of advertisers and algorithms."
        videoLabel="Patreon hero video"
        videoSrc={VIDEO_FLAG_WAVING}
        posterSrc={POSTER_FLAG_WAVING}
        buttons={[
          {
            label: "BECOME A PATRON",
            href: PATREON_URL,
            variant: "primary",
          },
          {
            label: "EXPLORE THE BENEFITS",
            to: "#benefits",
            variant: "outline",
          },
        ]}
        lazy={false}
      />

      {/* Mission — what Turning Point UK stands for and why support matters. */}
      <Section
        variant="center"
        background="background"
        noSnap
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-6 text-left">
            <p
              className="entrance-left font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="0"
            >
              Turning Point UK is a grassroots organisation dedicated to
              educating students and other young people on the values of free
              markets, limited government and personal responsibility.
            </p>
            <p
              className="entrance-left font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="80"
            >
              We seek to defend the structures of society that have created both
              one of the world's most competitive economies, and one of the
              oldest, most influential democracies in human history.
            </p>
            <p
              className="entrance-left font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="160"
            >
              It is now more important than ever to defend our values against a
              dogmatic left-wing political climate, education system and radical
              Labour Party which sympathises with terrorists, wishes to disarm
              the nation and whose Shadow Chancellor of the Exchequer — if
              elected — would bankrupt the economy.
            </p>
            <p
              className="entrance-left font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="240"
            >
              However, to carry out our vital work in promoting capitalism and
              preventing the rise of socialism in the UK we need your support.
              So sign up now and join Turning Point UK in the fight for economic
              and personal freedom.
            </p>
            <p
              className="entrance-left font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="320"
            >
              Please note, for our UK supporters: all Patreon donation amounts
              are listed in dollars, which is a global Patreon policy and
              applies to all content creators, all around the world. Any amounts
              our UK supporters choose to donate will of course be converted to
              pounds sterling automatically.
            </p>
          </div>

          <div
            data-ocid="patreon.youtube_embed"
            className="entrance-left mt-12 flex justify-center"
            data-entrance-delay="400"
          >
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/ajHsA15mQc0?si=KpP7i6kzkIwfGRz4"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="aspect-video h-auto w-full max-w-[560px]"
            />
          </div>
        </div>
      </Section>

      {/* Endorsements — MP endorsement graphics grid. Sits between the
          mission section and the benefits section to show that the
          movement is backed by parliamentarians, motivating visitors to
          become patrons. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="patreon-endorsements"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              WHY YOUR SUPPORT MATTERS
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Endorsed by MPs who back Britain
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Members of Parliament from across the conservative movement have
              put their names behind Turning Point UK. When you become a patron,
              you stand with them — and with every listener who refuses to let
              the left-wing consensus go unchallenged.
            </p>
          </div>

          <div
            data-ocid="patreon.endorsements"
            className="entrance-left grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {ENDORSEMENT_PHOTOS.map((photo, i) => (
              <div
                key={photo.src}
                data-ocid={`patreon.endorsement.${i}`}
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

      {/* Benefits — three full-width sections, alternating surface tone. */}
      <Section
        id="benefits"
        variant="center"
        background="navy"
        noSnap
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-16 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              WHY PATREON
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              What your support unlocks
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Three reasons listeners become patrons — and stay patrons.
            </p>
          </div>

          <div className="flex flex-col gap-px border border-foreground/15 bg-foreground/15">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit.title}
                data-ocid={`patreon.benefit.${i}`}
                className="entrance-left flex flex-col gap-4 bg-navy px-7 py-12 sm:px-12 sm:py-14"
                data-entrance-delay={String(i * 120)}
              >
                <span className="text-eyebrow text-primary">
                  {benefit.eyebrow}
                </span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                  {benefit.title}
                </h3>
                <p className="max-w-3xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
                  {benefit.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Direct support — single closing benefit on the default surface. */}
      <Section
        variant="center"
        background="background"
        noSnap
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-5 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              {CLOSING_BENEFITS[0].eyebrow}
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              {CLOSING_BENEFITS[0].title}
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="200"
            >
              {CLOSING_BENEFITS[0].body}
            </p>
          </div>
        </div>
      </Section>

      {/* Final CTA — repeat the primary action so a convinced reader
          never has to scroll back to the hero. */}
      <Section
        variant="center"
        background="navy"
        noSnap
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <span
            className="entrance-left text-eyebrow text-foreground/70"
            data-entrance-delay="0"
          >
            JOIN THE PATRONS
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Back the movement today
          </h2>
          <p
            className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
            data-entrance-delay="200"
          >
            Choose a tier, unlock the full feed, and stand with the people
            keeping independent British podcasting on the air.
          </p>
          <a
            href={PATREON_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="patreon.cta_button"
            className="btn-primary-square group rounded-full"
          >
            <span>BECOME A PATRON</span>
          </a>
        </div>
      </Section>
    </div>
  );
}
