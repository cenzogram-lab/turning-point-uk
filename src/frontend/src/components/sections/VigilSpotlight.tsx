import { ROUTES } from "@/lib/routes";
import { Link } from "@tanstack/react-router";

/**
 * VigilSpotlight — high-contrast featured-event spotlight for the Charlie
 * Kirk Vigil, rendered directly below the homepage Hero.
 *
 * Two-column layout on desktop (image left, details right), stacking on
 * mobile. The left side displays the vigil promotional graphic
 * (/assets/images/charlie-kirk-vigil.jpg); the right side carries the event
 * headline, subtitle, key details, and an RSVP/Newsletter CTA.
 *
 * The section carries id="vigil" so the announcement bar's 'Learn More' link
 * (ROUTES.home + '#vigil') can scroll to it. scroll-mt accounts for the fixed
 * announcement bar + fixed Nav so the anchor clears the fixed header.
 *
 * Matches the dark navy / red / Oswald brand aesthetic with the existing
 * zero-radius / no-shadow SpaceX discipline and the universal entrance
 * animation system (entrance-left / entrance-right + staggered
 * data-entrance-delay, observed by the homepage's useEntranceAnimation
 * containerRef).
 */
const VIGIL_DETAILS = [
  { label: "Date", value: "Thursday 10th Sept 2026" },
  { label: "Gather", value: "18:30" },
  { label: "Vigil", value: "19:00" },
  { label: "Location", value: "Montgomery Statue, Whitehall, London SW1A 2AT" },
] as const;

export function VigilSpotlight() {
  return (
    <section
      id="vigil"
      data-ocid="section.vigil_spotlight"
      className="w-full scroll-mt-[calc(var(--announcement-bar-height)+4rem)] bg-navy/60 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left — vigil promotional graphic. */}
        <div
          className="entrance-left overflow-hidden border border-border bg-card/40"
          data-entrance-delay="0"
        >
          <img
            src="/assets/images/charlie-kirk-vigil.jpg"
            alt="Charlie Kirk Vigil — Thursday 10th September 2026 at the Montgomery Statue, Whitehall, London"
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right — event headline, subtitle, key details, and CTA. */}
        <div className="flex flex-col gap-6">
          <span
            className="entrance-left text-eyebrow text-primary"
            data-entrance-delay="80"
          >
            FEATURED EVENT
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="160"
          >
            Charlie Kirk Vigil
          </h2>
          <p
            className="entrance-left font-display text-xl font-medium uppercase leading-snug tracking-wide text-foreground/90 sm:text-2xl"
            data-entrance-delay="240"
          >
            Honour his life. Defend his legacy. Stand for what&apos;s right.
          </p>

          {/* Key details — labelled rows. */}
          <dl
            className="entrance-left flex flex-col gap-3 border-t border-border pt-6"
            data-entrance-delay="320"
          >
            {VIGIL_DETAILS.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <dt className="w-24 shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="font-body text-base font-medium text-foreground">
                  {detail.value}
                </dd>
              </div>
            ))}
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
              <dt className="w-24 shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Bring
              </dt>
              <dd className="font-body text-base font-medium text-foreground">
                Candles and photos
              </dd>
            </div>
          </dl>

          {/* RSVP / Newsletter update CTA. */}
          <div
            className="entrance-left mt-2 flex flex-wrap gap-3"
            data-entrance-delay="400"
          >
            <Link
              to={ROUTES.joinUs}
              data-ocid="section.vigil_spotlight.rsvp_button"
              className="btn-primary-square group rounded-full"
            >
              <span>RSVP &amp; Get Updates</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
