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

/**
 * DonatePage — dedicated /donate route with its own hero.
 *
 * SpaceX discipline: one idea + one action per screen. The hero is the
 * single full-viewport moment with the primary DONATE NOW button that
 * scrolls to the supporter membership tiers. Below: a short supporting
 * prose section explaining how donations fund the movement, then the
 * three supporter membership tiers (Ambassador / Standard / Donor).
 * Each tier's select button is a direct outbound link to a Stripe-hosted
 * Payment Link URL (opens in a new tab) — no canister checkout session
 * is created from this page. The StripeSetupPanel is no longer used
 * here because the tier flow no longer depends on the canister's Stripe
 * configuration.
 *
 * NOTE: the backend module does NOT support subscription mode or a
 * Customer Portal (both excluded from this build). The tier buttons
 * link out to Stripe Payment Links, which Stripe hosts entirely; there
 * is no "Manage Membership" button and no Customer Portal endpoint.
 */

/**
 * SUPPORTER_TIERS — the three recurring supporter membership tiers on
 * /donate. Each tier's select button is a direct outbound link to a
 * Stripe-hosted Payment Link URL (stripeLink) that opens in a new tab;
 * no canister checkout session is created from this page. The middle
 * tier (Standard £5) is the highlighted tier — its select button is the
 * single red primary CTA on this screen per the brand discipline (red
 * reserved for one primary action per screen). The other two tiers use
 * the neutral foreground treatment for their select buttons.
 *
 * LIVE STRIPE PAYMENT LINKS: the `stripeLink` values below are the
 * live Stripe Payment Link URLs for the three recurring supporter
 * membership tiers — Ambassador (£2/mo), Standard (£5/mo), and
 * Donor (£100/mo) — created in the Stripe Dashboard under Payment
 * Links. Each one opens the tier's checkout directly on Stripe.
 */
interface SupporterTier {
  /** Tier display name, e.g. "Standard". */
  name: string;
  /** Monthly price in whole pounds (used for display). */
  pricePounds: number;
  /** Short benefit line shown beneath the price. */
  benefit: string;
  /** Select-button label. */
  cta: string;
  /**
   * Live Stripe-hosted Payment Link URL for this tier — the recurring
   * supporter membership checkout (Ambassador £2/mo, Standard £5/mo,
   * or Donor £100/mo) hosted directly on Stripe.
   */
  stripeLink: string;
  /** Highlighted tier carries the single red primary CTA per screen. */
  highlighted?: boolean;
}

const SUPPORTER_TIERS: SupporterTier[] = [
  {
    name: "Ambassador",
    pricePounds: 2,
    benefit:
      "Join the movement at the ground level and help us reach the next supporter.",
    cta: "Select Ambassador",
    stripeLink: "https://buy.stripe.com/8x23cvgrLbvh6xs9eRfw403",
  },
  {
    name: "Standard",
    pricePounds: 5,
    benefit:
      "Back the movement month after month and help us plan a term ahead.",
    cta: "Select Standard",
    stripeLink: "https://buy.stripe.com/28EfZha3n2YLg82ezbfw404",
    highlighted: true,
  },
  {
    name: "Donor",
    pricePounds: 100,
    benefit:
      "Stand with us as a founder-level backer and shape the movement's future.",
    cta: "Select Donor",
    stripeLink: "https://buy.stripe.com/aFafZhb7r6aX2hc76Jfw405",
  },
];

export function DonatePage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/donate"].title,
    description: PAGE_SEO["/donate"].description,
    canonical: `${SITE_BASE_URL}/donate`,
    url: `${SITE_BASE_URL}/donate`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/donate"])],
  });

  return (
    <div ref={ref}>
      <Hero
        eyebrow="Fuel the movement"
        headline="FUND THE FIGHT"
        sub="Every pound fuels the movement for Britain's future."
        videoLabel="Donate hero video"
        buttons={[
          {
            label: "DONATE NOW",
            to: "#donate-embed",
            variant: "primary",
          },
        ]}
        lazy={false}
      />

      {/* Supporting prose — how donations fund the movement. */}
      <Section
        variant="center"
        background="navy"
        noSnap
        id="donate-why"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-5 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              WHERE YOUR MONEY GOES
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Every pound is a pound for Britain
            </h2>
            <div
              className="entrance-left flex flex-col gap-5 font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="200"
            >
              <p>
                Turning Point UK is built by people, not politicians. Your
                donation funds grassroots activism on campuses across the
                country, training days that turn first-time supporters into
                confident organisers, and the campaigns that keep free speech,
                limited government, and personal responsibility in the public
                conversation.
              </p>
              <p>
                Give once or give monthly. Recurring support is what lets us
                plan a term ahead instead of a week ahead — it is the backbone
                of a movement built to last.
              </p>
            </div>

            {/* One-off donation — direct outbound link to the live Stripe
                Payment Link for a single donation. Opens in a new tab so
                visitors don't lose the site. Uses the neutral outline
                treatment so red stays reserved for the single primary CTA
                per screen (the highlighted Standard tier below). */}
            <a
              href="https://donate.stripe.com/00w28r7VfeHtcVQfDffw406"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="donate.one_off_button"
              className="btn-outline-invert mt-2"
            >
              DONATE VIA STRIPE / CARD / APPLE PAY
            </a>
          </div>
        </div>
      </Section>

      {/* Donation embed slot — the three supporter membership tiers. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="donate-embed"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              SUPPORTER MEMBERSHIP
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Fund the fight
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Choose a monthly tier and stand with us month after month. Every
              tier fuels grassroots activism, training days, and campaigns
              across the country.
            </p>
          </div>

          {/* Tier grid — three supporter tiers. Each tier's select
              button is a direct outbound link to a Stripe-hosted
              Payment Link URL (opens in a new tab via an <a> element).
              The highlighted tier (Standard) carries the single red
              primary CTA per screen; the other two use the neutral
              foreground treatment. Square corners, zero shadows,
              hairline grid dividers via the bg-foreground/15 gap-px
              trick. The stripeLink values are the live Stripe Payment
              Link URLs — see the SUPPORTER_TIERS comment above. */}
          <div
            data-ocid="donate.tiers.list"
            className="entrance-left grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-3"
            data-entrance-delay="320"
          >
            {SUPPORTER_TIERS.map((tier, i) => {
              // Guard against an empty/undefined stripeLink before
              // navigating — avoids ever opening /undefined or an
              // empty tab. If a link is missing we render the button
              // as a no-op span so the layout stays intact.
              const hasLink =
                typeof tier.stripeLink === "string" &&
                tier.stripeLink.length > 0;
              return (
                <div
                  key={tier.name}
                  data-ocid={`donate.tiers.item.${i}`}
                  className={cn(
                    "flex h-full min-h-[26rem] flex-col gap-6 p-6 sm:p-8",
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
                      {tier.name}
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

                  {hasLink ? (
                    <a
                      href={tier.stripeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`donate.tiers.select_button.${i}`}
                      className={cn(
                        "group relative mt-auto block w-full py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] transition-smooth",
                        tier.highlighted
                          ? "bg-primary-foreground text-primary hover:bg-foreground"
                          : "border border-foreground text-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {tier.cta}
                    </a>
                  ) : (
                    <span
                      data-ocid={`donate.tiers.select_button.${i}`}
                      aria-disabled="true"
                      className={cn(
                        "mt-auto block w-full py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] opacity-60",
                        tier.highlighted
                          ? "bg-primary-foreground text-primary"
                          : "border border-foreground text-foreground",
                      )}
                    >
                      {tier.cta}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p
            className="entrance-left mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground"
            data-entrance-delay="440"
          >
            Secure checkout handled by Stripe. UK cards only.
          </p>
        </div>
      </Section>
    </div>
  );
}
