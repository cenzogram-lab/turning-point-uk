import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { cn } from "@/lib/utils";
import { StripeSetupPanel } from "../components/StripeSetupPanel";

/**
 * JoinUsPage — membership tiers + outbound Stripe Payment Links.
 *
 * SpaceX discipline: full-bleed hero, then a single decisive screen for
 * choosing a tier. One primary action per screen. Each tier's select
 * button is a direct outbound link to a Stripe-hosted Payment Link URL,
 * opening in a new tab so visitors don't lose the site.
 */

interface Tier {
  name: string;
  /** Display label shown above the price, e.g. "Standard / Supporter". */
  label: string;
  /** Monthly price in whole pounds, e.g. 5. Used for display. */
  pricePounds: number;
  /** Short benefit line shown beneath the price. */
  benefit: string;
  cta: string;
  /**
   * Live Stripe-hosted Payment Link URL the tier button links out to.
   * These are the live per-tier Stripe Payment Link URLs for the
   * recurring memberships: Ambassador (£2/mo), Standard (£5/mo), and
   * Donor (£100/mo).
   */
  stripeLink: string;
  highlighted?: boolean;
}

interface GalleryPhoto {
  src: string;
  alt: string;
}

/**
 * JOIN_PHOTOS — community and campus activism photos for the Join Us page.
 * Sits between the membership tiers section and the one-off donation
 * section to show the movement people are joining: real activists, real
 * campuses, real streets. Uses already-present activism photos distinct
 * from the ContactPage set (no duplicates). Uses the established site
 * photo tile pattern (group relative flex aspect-[4/5] flex-col justify-end
 * bg-background; inner absolute inset-0 overflow-hidden bg-image-fallback;
 * img loading='lazy' decoding='async' object-cover group-hover:scale-[1.04]
 * group-hover:brightness-110).
 */
const JOIN_PHOTOS: GalleryPhoto[] = [
  {
    src: "/assets/activism/img_2670-01a0079f-a797-76de-aa65-a2145d261370.jpg",
    alt: "Turning Point UK activists gathered at a campus outreach event.",
  },
  {
    src: "/assets/gallery/birmingham1-1-scaled-019fe4a2-2e9d-712f-9852-855f31ef415e.webp",
    alt: "Turning Point UK outreach stall outside the University of Birmingham.",
  },
  {
    src: "/assets/gallery/ucl-optimized-scaled-019fe4a2-2cf5-72bd-963b-1264643f1ce5.webp",
    alt: "Activist engaging with students outside a London university campus.",
  },
  {
    src: "/assets/activism/manchester2-optimized-01a007b9-74f2-749a-9bbe-80f7ffb957e5.webp",
    alt: "Turning Point UK street stall with activists handing out flyers in Manchester.",
  },
  {
    src: "/assets/activism/home-600x450-1-019fd809-c4a6-75ba-904e-d275f8c3ca4d.webp",
    alt: "Turning Point UK members rallying together for free speech on campus.",
  },
];

// Live Stripe Payment Link URLs for the three recurring membership
// tiers: Ambassador (£2/mo), Standard (£5/mo), and Donor (£100/mo).
// Each `stripeLink` below is a live Stripe-hosted Payment Link URL
// (https://buy.stripe.com/...) that opens the tier's checkout directly
// on Stripe.
const TIERS: Tier[] = [
  {
    name: "Ambassador",
    label: "Ambassador / Supporter",
    pricePounds: 2,
    benefit:
      "Stand with us month after month and help fund the fight for free speech on campus.",
    cta: "Join Now",
    stripeLink: "https://buy.stripe.com/8x23cvgrLbvh6xs9eRfw403",
  },
  {
    name: "Standard",
    label: "Standard / Member",
    pricePounds: 5,
    benefit:
      "Early access to live events and the inside track on the movement's progress.",
    highlighted: true,
    cta: "Subscribe",
    stripeLink: "https://buy.stripe.com/28EfZha3n2YLg82ezbfw404",
  },
  {
    name: "Donor",
    label: "Donor / Patron",
    pricePounds: 100,
    benefit:
      "Private community and chat, exclusive content, and direct access to discuss strategy with the team.",
    cta: "Join Now",
    stripeLink: "https://buy.stripe.com/aFafZhb7r6aX2hc76Jfw405",
  },
];

/**
 * CODE_OF_CONDUCT — the verbatim TPUK Basic Code of Conduct. Prospective
 * members must read and agree every bullet before joining. Do not
 * paraphrase, reword, or omit any item.
 */
const CODE_OF_CONDUCT: string[] = [
  "Be respectful of other members and their views. Remember we are a broad-church organisation so you may not agree with other members on everything.",
  "Adhere to your university's rules and the law. We will never ask you, nor do we expect you to engage in illegal activity or jeopardise your university education.",
  "Bullying of any form will not be tolerated. Likewise neither will sexism, racism, ableism, homophobia or any other form of discrimination.",
  "TPUK is not a dating network and we advise members to save romantic advances and PDA for outside of TPUK events and meetings.",
  "When representing TPUK please conduct yourself in a friendly and respectful manner.",
  "If you come across any information that may damage your chapter's or TPUK's reputation please inform the leadership team immediately.",
  "Absolute honesty is expected at all times from TPUK's members.",
  "Do not partake in any media interview without prior permission from the TPUK leadership. Requests for permission to do media interviews can be sent to info@tpoint.co.uk.",
  "At TPUK's events and in public members are expected to conduct themselves respectfully and with dignity.",
  "Members are prohibited from attending any TPUK event or event where they are representing TPUK in a drunken state.",
];

export function JoinUsPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/join-us"].title,
    description: PAGE_SEO["/join-us"].description,
    canonical: `${SITE_BASE_URL}/join-us`,
    url: `${SITE_BASE_URL}/join-us`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/join-us"])],
  });

  return (
    <div ref={ref}>
      {/* Hero — the call to join. */}
      <Hero
        headline="JOIN THE MOVEMENT"
        sub="Fed up with the left-wing bias of your university? Don't just sit down and shut up."
        videoLabel="Join us hero video"
        lazy={false}
      />

      {/* Membership tiers — one decisive screen. Each tier's select
          button is a direct outbound link to a Stripe-hosted Payment
          Link URL, opening in a new tab so visitors don't lose the
          site. Red is reserved for the single primary CTA per screen
          (the highlighted Standard tier's select button); secondary
          tiers use the neutral foreground treatment. */}
      <Section id="tiers" variant="center" className="px-6 py-24 sm:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              MEMBERSHIP
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Pick your tier
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Stand with us month after month. Every tier funds the fight for
              free speech on campus.
            </p>
          </div>

          {/* Admin-only Stripe setup panel. Renders null for non-admins
              so it can be embedded here without leaking the form. When
              Stripe is not yet configured an admin can enter the secret
              key; once configured the panel collapses to an "Update
              Stripe key" button. Retained for admin configuration even
              though tier buttons now link out to Stripe Payment Links
              directly. */}
          <div className="entrance-left mb-10" data-entrance-delay="260">
            <StripeSetupPanel />
          </div>

          <div
            data-ocid="tiers.list"
            className="entrance-left grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-3"
            data-entrance-delay="320"
          >
            {TIERS.map((tier, i) => {
              const href = tier.stripeLink || undefined;
              return (
                <div
                  key={tier.name}
                  data-ocid={`tiers.item.${i}`}
                  className={cn(
                    "flex h-full min-h-[28rem] flex-col gap-6 p-6 sm:p-8",
                    tier.highlighted
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "text-eyebrow",
                        tier.highlighted
                          ? "text-primary-foreground/80"
                          : "text-foreground/70",
                      )}
                    >
                      {tier.highlighted ? "MOST POPULAR" : "TIER"}
                    </span>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-tight">
                      {tier.label}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold tracking-tight">
                      £{tier.pricePounds}
                    </span>
                    <span
                      className={cn(
                        "font-body text-sm",
                        tier.highlighted
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      /month
                    </span>
                  </div>

                  <p
                    className={cn(
                      "font-body text-sm font-light leading-relaxed",
                      tier.highlighted
                        ? "text-primary-foreground/90"
                        : "text-foreground/80",
                    )}
                  >
                    {tier.benefit}
                  </p>

                  {/* Direct outbound link to the tier's Stripe Payment
                      Link. Opens in a new tab so visitors don't lose
                      the site. href is guarded against an empty
                      stripeLink so we never navigate to "undefined". */}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={href ? undefined : true}
                    data-ocid={`tiers.select_button.${i}`}
                    className={cn(
                      "group relative mt-auto block w-full py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] transition-smooth",
                      href
                        ? ""
                        : "pointer-events-none cursor-not-allowed opacity-60",
                      tier.highlighted
                        ? "bg-primary-foreground text-primary hover:bg-foreground"
                        : "border border-foreground text-foreground hover:bg-foreground hover:text-background",
                    )}
                  >
                    <span>{tier.cta}</span>
                  </a>
                </div>
              );
            })}
          </div>

          <p
            className="entrance-left mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground"
            data-entrance-delay="440"
          >
            Secure checkout hosted by Stripe. UK customers only.
          </p>
        </div>
      </Section>

      {/* Movement in action — community and campus activism photo grid.
          Sits between the membership tiers section and the one-off
          donation section to show the movement people are joining. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="join-gallery"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              JOIN THE FIGHT
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Our movement, in action
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              This is what you join. Real students, real campuses, real streets
              - pushing back against the left-wing bias, one stall, one
              conversation, one chapter at a time.
            </p>
          </div>

          <div
            data-ocid="joinus.photos"
            className="entrance-left grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {JOIN_PHOTOS.map((photo, i) => (
              <div
                key={photo.src}
                data-ocid={`joinus.photo.${i}`}
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

      {/* Code of Conduct — verbatim TPUK basic conduct. Prospective members
          must read and agree before joining. Contrasting card surface with
          white text for clean legibility against the deep-blue canvas. */}
      <Section
        id="code-of-conduct"
        background="card"
        variant="center"
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              BEFORE YOU JOIN
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Code of Conduct
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light italic leading-relaxed text-muted-foreground sm:text-lg"
              data-entrance-delay="200"
            >
              Any prospective members must also read and agree our Code of
              Conduct below.
            </p>
            <p
              className="entrance-left max-w-xl font-body text-base font-light italic leading-relaxed text-muted-foreground sm:text-lg"
              data-entrance-delay="260"
            >
              We look forward to hearing from you!
            </p>
          </div>

          <div
            data-ocid="joinus.code_of_conduct"
            className="entrance-left border border-foreground/15 bg-background/40 px-6 py-10 sm:px-10 sm:py-12"
            data-entrance-delay="320"
          >
            <h3 className="mb-8 text-center font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
              BASIC CODE OF CONDUCT
            </h3>

            <ul
              data-ocid="joinus.code_of_conduct.list"
              className="flex flex-col gap-5"
            >
              {CODE_OF_CONDUCT.map((item, i) => (
                <li
                  key={item}
                  data-ocid={`joinus.code_of_conduct.item.${i}`}
                  className="flex items-start gap-3 font-body text-base font-light leading-loose text-foreground/85 sm:text-lg"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-primary"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-center font-body text-base font-bold leading-relaxed text-foreground sm:text-lg">
              For any clarification on TPUK's Basic Code of Conduct please
              contact the leadership team.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
