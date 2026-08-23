import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { VIDEO_FLAG_WAVING } from "@/lib/assets";
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
 * AboutPage — "What We Do".
 *
 * SpaceX rhythm: full-bleed hero → light prose section with the verbatim
 * movement copy → six-card "Our Aims" grid on dark. One idea per screen,
 * square corners, no shadows.
 */

const ABOUT_COPY = (
  <>
    Turning Point UK is a grassroots conservative and free speech activist
    organisation — the largest conservative activist group in the UK. Our main
    focus is to challenge the often far-left bias in our educational
    institutions, particularly across universities nationwide. Since our
    inception in 2019, we have reached thousands of university students and set
    up activist chapters across the United Kingdom. We have been endorsed by
    prominent conservative figures from Priti Patel and Jacob Rees-Mogg to Nigel
    Farage. We enjoy a diverse membership from a variety of backgrounds who
    stand with us against Marxism and radical socialism. Online we reach
    millions of British people each month. In 2022 we welcomed Conservative MP
    Marco Longhi as our honorary President. Ready to get involved?{" "}
    <Link to={ROUTES.joinUs} className="text-inherit underline">
      Join Turning Point UK
    </Link>
    .
  </>
);

interface Aim {
  title: string;
  description: string;
}

const AIMS: Aim[] = [
  {
    title: "End Indoctrination",
    description:
      "Expose and challenge partisan teaching that passes opinion off as fact in our schools and universities.",
  },
  {
    title: "Champion Britain",
    description:
      "Stand up for the history, traditions, and sovereignty that made the United Kingdom a force for good.",
  },
  {
    title: "Protect Free Speech",
    description:
      "Defend the right to speak, debate, and dissent without fear of cancellation or career ruin.",
  },
  {
    title: "Family & Community",
    description:
      "Strengthen the families and local communities that are the bedrock of a free and stable society.",
  },
  {
    title: "Oppose Socialism",
    description:
      "Resist the spread of Marxism and radical socialism in our institutions, media, and public life.",
  },
  {
    title: "Youth-Friendly Format",
    description:
      "Reach the next generation with bold, shareable, short-form content built for how young people watch.",
  },
];

export function AboutPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  useSeoMeta({
    title: PAGE_SEO["/about"].title,
    description: PAGE_SEO["/about"].description,
    canonical: `${SITE_BASE_URL}/about`,
    url: `${SITE_BASE_URL}/about`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/about"])],
  });
  return (
    <div ref={ref}>
      {/* 1 — Hero */}
      <Hero
        headline="What We Do"
        sub="A grassroots movement defending free speech, British values, and the next generation."
        videoLabel="About hero video"
        buttons={[
          { label: "Join Us", to: ROUTES.joinUs, variant: "primary" },
          {
            label: "DONATE VIA STRIPE / CARD / APPLE PAY",
            href: "https://donate.stripe.com/00w28r7VfeHtcVQfDffw406",
            variant: "outline",
          },
        ]}
        lazy={false}
        videoSrc={VIDEO_FLAG_WAVING}
      />

      {/* 2 — Prose section with verbatim About copy. Previously an inverted
          light surface (bg-foreground text-background); now transparent so
          the universal ambient midnight mesh shows through, matching the
          site-wide dark aesthetic, with the copy inside an ambient glass
          card. */}
      <Section variant="center" noSnap id="what-we-do">
        <div className="mx-auto w-full max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
          <div className="ambient-card p-6 sm:p-8 lg:p-12">
            <span
              className="entrance-left text-eyebrow text-foreground/60"
              data-entrance-delay="0"
            >
              Who we are
            </span>
            <h2
              className="entrance-left mt-4 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl"
              data-entrance-delay="80"
            >
              Our Story
            </h2>
            <p
              className="entrance-left mt-8 font-body text-lg font-light leading-relaxed text-foreground/85 sm:text-xl"
              data-entrance-delay="200"
            >
              {ABOUT_COPY}
            </p>
          </div>
        </div>
      </Section>

      {/* 3 — Why We Do What We Do — YouTube embed in a responsive wrapper */}
      <Section variant="center" noSnap background="background" id="why-we-do">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
          <div className="flex flex-col items-center text-center">
            <span
              className="entrance-left text-eyebrow"
              data-entrance-delay="0"
            >
              Our motivation
            </span>
            <h2
              className="entrance-left mt-4 text-headline text-foreground"
              data-entrance-delay="80"
            >
              Why We Do What We Do
            </h2>
          </div>
          <div
            data-ocid="about.video-embed"
            className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl mt-8"
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ajHsA15mQc0?si=6l5_gZQRbHgpCtJk&start=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* 4 — Our Aims grid on dark */}
      <Section variant="center" noSnap background="background" id="our-aims">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
          <div className="flex flex-col items-center text-center">
            <span
              className="entrance-left text-eyebrow"
              data-entrance-delay="0"
            >
              What we fight for
            </span>
            <h2
              className="entrance-left mt-4 text-headline text-foreground"
              data-entrance-delay="80"
            >
              Our Aims
            </h2>
          </div>

          <div
            data-ocid="aims.grid"
            className="entrance-left mt-16 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
            data-entrance-delay="220"
          >
            {AIMS.map((aim, i) => (
              <article
                key={aim.title}
                data-ocid={`aims.card.${i + 1}`}
                className={cn(
                  "group flex flex-col gap-4 bg-background p-8 transition-smooth",
                  "hover:bg-card",
                )}
              >
                <span
                  className="font-mono text-xs uppercase tracking-[0.2em] text-primary"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-foreground">
                  {aim.title}
                </h3>
                <p className="font-body text-sm font-light leading-relaxed text-muted-foreground">
                  {aim.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
