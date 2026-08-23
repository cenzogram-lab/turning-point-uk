import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../lib/routes";

/**
 * FindOutMore — two-column "FIND OUT MORE" section.
 *
 * Card 1 "Read Our Story" — outline pill CTA → /about.
 * Card 2 "Join Our Movement" — primary red pill CTA → /join-us.
 *
 * Cards use bg-neutral-900 + border-neutral-800 + rounded-xl + shadow-lg
 * (the shadow-lg here is an intentional exception to the SpaceX no-shadow
 * discipline, per user preference). Images render in aspect-video containers
 * with object-cover; placeholder SVGs are saved with the exact intended
 * .webp filenames so real images drop in later without code changes.
 *
 * Entrance: each card slides in from a side (left/right) with a staggered
 * data-entrance-delay, auto-observed by the HomePage's useEntranceAnimation
 * containerRef.
 */
const CARDS = [
  {
    eyebrow: "READ OUR STORY",
    image: "/assets/cards/home-600x450-1.webp",
    imageAlt: "Read Our Story",
    body: "Turning Point UK is the product of increasing conservative marginalisation at our universities, the stifling of proper debate through meaningless buzzwords and the bullish behaviour of Momentum and the Labour Party. To learn more about how Turning Point UK works, click the button below.",
    cta: { label: "Learn More", to: ROUTES.about, variant: "outline" as const },
    entrance: "entrance-left" as const,
  },
  {
    eyebrow: "JOIN OUR MOVEMENT",
    image: "/assets/cards/imperial-optimized-scaled-600x450.webp",
    imageAlt: "Join Our Movement",
    body: "Fed up with Momentum propaganda on your newsfeed? Let down by the left-wing bias of your university? If you’re being silenced for your conservative opinions or entrepreneurial spirit, then don’t just sit down and shut up!",
    cta: {
      label: "Learn More",
      to: ROUTES.joinUs,
      variant: "primary" as const,
    },
    entrance: "entrance-right" as const,
  },
] as const;

export function FindOutMore() {
  return (
    <section
      data-ocid="section.find-out-more"
      className="w-full bg-background px-6 py-32 sm:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 flex flex-col gap-4">
          <span className="entrance-left text-eyebrow" data-entrance-delay="0">
            FIND OUT MORE
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Get Involved
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {CARDS.map((card, i) => {
            const isPrimary = card.cta.variant === "primary";
            const ctaClass = isPrimary
              ? "btn-primary-square group rounded-full"
              : "btn-outline-invert group rounded-full";
            const ctaContent = isPrimary ? (
              <span>{card.cta.label}</span>
            ) : (
              <span>{card.cta.label}</span>
            );
            return (
              <article
                key={card.eyebrow}
                data-ocid={`section.find-out-more.card.${i + 1}`}
                className={`${card.entrance} flex flex-col overflow-hidden rounded-xl border border-border bg-card/40 shadow-lg backdrop-blur-md`}
                data-entrance-delay={String(i * 120)}
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-8">
                  <h3 className="font-display text-xl uppercase tracking-wide text-foreground">
                    {card.eyebrow}
                  </h3>
                  <p className="font-body text-base font-light leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                  <div className="mt-auto pt-2">
                    <Link
                      to={card.cta.to}
                      data-ocid={`section.find-out-more.button.${i + 1}`}
                      className={ctaClass}
                    >
                      {ctaContent}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
