import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { ROUTES } from "@/lib/routes";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

/**
 * EndorsementsSlider — reusable "OUR ENDORSEMENTS" auto-playing swipeable
 * carousel of real endorsement image cards.
 *
 * Reusable across any page: the component is fully self-contained — it owns
 * its heading, endorsement image set, autoplay/loop carousel behaviour, and the
 * red TPUK arrow CTA. Mount it anywhere with `<EndorsementsSlider />`; no
 * props are required.
 *
 * The endorsement set is a hardcoded const of image paths (not a prop) so
 * every page that mounts the slider shows the same voices of support —
 * keeping the component's contract narrow and predictable.
 *
 * Reuses the shared shadcn Carousel (embla-based) with the Autoplay plugin
 * for auto-advance. The plugin's built-in `stopOnInteraction` and
 * `stopOnMouseEnter` options handle pause/resume on manual interaction and
 * hover — no manual timer wiring is needed.
 *
 * Each slide renders exactly ONE full endorsement promotional card image
 * (red header banner, endorser name/title, quote, portrait, TPUK logo) as-is
 * in an <img>, centered in its slide at full visible width with rounded
 * corners and a subtle border/shadow matching the deep blue Turning Point UK
 * theme (royal blue #00247D, red #C8102E, white). One card per slide — the
 * full picture is shown with no cropping or shrinking.
 *
 * Tracking-free by construction: this component renders only static images, an
 * embla carousel, and an internal-route CTA link. It loads no analytics
 * scripts, no tracking pixels, and no email-capture popups, so it is safe to
 * mount on no-tracking pages such as /education-watch.
 *
 * Entrance: the header slides in from the left; the carousel wrapper slides
 * in from the right, both observed by the component's own
 * useEntranceAnimation() call (no ref → observes document.body). This makes
 * the slider self-sufficient: because it mounts globally in Layout (the root
 * route component, which persists across route changes), it cannot rely on a
 * page-level useEntranceAnimation containerRef — only the HomePage and HomeFaq
 * set one up. Without its own observer the .entrance-left / .entrance-right
 * elements would stay at opacity:0 on every non-homepage route and the slider
 * would render but never become visible. Calling useEntranceAnimation() here
 * guarantees the IntersectionObserver is always active wherever the slider
 * mounts, so the section reveals on every page.
 */

const ENDORSEMENT_IMAGES = [
  "/assets/endorsements/1507-300x300.webp",
  "/assets/endorsements/1509-300x300.webp",
  "/assets/endorsements/1510-300x300.webp",
  "/assets/endorsements/1511.webp",
  "/assets/endorsements/1512-300x300.webp",
  "/assets/endorsements/1513-300x300.webp",
  "/assets/endorsements/1514-300x300.webp",
  "/assets/endorsements/1637-300x300.webp",
];

export function EndorsementsSlider() {
  // Self-sufficient entrance observer: this component mounts globally in
  // Layout (the root route component), so it cannot depend on a page-level
  // useEntranceAnimation containerRef to reveal its .entrance-left /
  // .entrance-right elements. Only the HomePage and HomeFaq set up an
  // observer; without one here the slider would stay at opacity:0 on every
  // non-homepage route. Calling the hook with no ref falls back to observing
  // document.body per its documented contract, so the IntersectionObserver is
  // always active wherever the slider mounts. The internal MutationObserver
  // re-scans on subtree changes, so the reveal fires correctly even though
  // the component mounts only once and persists across route transitions.
  useEntranceAnimation();

  // Respect prefers-reduced-motion: the embla Autoplay plugin is JS-driven
  // (not CSS), so the index.css reduced-motion block does NOT disable it.
  // We conditionally exclude the Autoplay plugin for reduced-motion users
  // while keeping manual navigation (arrows/drag/dots) fully functional.
  // SSR-safe: defaults to false (autoplay enabled) until the effect runs.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const plugins = reducedMotion
    ? []
    : [
        Autoplay({
          delay: 3500,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ];

  return (
    <section
      data-ocid="section.endorsements"
      className="w-full px-6 py-32 sm:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 flex flex-col gap-4">
          <span className="entrance-left text-eyebrow" data-entrance-delay="0">
            OUR ENDORSEMENTS
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Voices Of Support
          </h2>
        </div>

        <div className="entrance-right relative" data-entrance-delay="160">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={plugins}
            className="w-full"
            aria-label="Our endorsements"
          >
            <CarouselContent className="-ml-4">
              {ENDORSEMENT_IMAGES.map((src, i) => (
                <CarouselItem
                  key={src}
                  className="pl-4"
                  data-ocid={`section.endorsements.item.${i + 1}`}
                >
                  <div className="flex h-full items-center justify-center">
                    <img
                      src={src}
                      alt={`Turning Point UK endorsement card ${i + 1}`}
                      loading="lazy"
                      className="block max-h-[70vh] w-auto max-w-full rounded-xl border border-border bg-card object-contain shadow-subtle"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className="left-2 border-border bg-card text-foreground hover:bg-card/80 hover:text-foreground sm:-left-12"
              data-ocid="section.endorsements.prev"
            />
            <CarouselNext
              className="right-2 border-border bg-card text-foreground hover:bg-card/80 hover:text-foreground sm:-right-12"
              data-ocid="section.endorsements.next"
            />
          </Carousel>
        </div>

        {/* Red TPUK arrow CTA — navigates directly to the /activism page so
            the next step is reachable on every route (the slider mounts
            globally via Layout, not only on the homepage). Kept consistent
            with the pill CTA pattern used across the site. */}
        <div
          className="entrance-left mt-12 flex justify-center"
          data-entrance-delay="240"
        >
          <Link
            to={ROUTES.activism}
            data-ocid="section.endorsements.cta"
            className="btn-primary-square group rounded-full"
          >
            <span>Take Action</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Backward-compatible alias. Existing call sites (e.g. HomePage) import
 * `Endorsements`; new call sites should import `EndorsementsSlider`. Both
 * resolve to the same reusable component.
 */
export const Endorsements = EndorsementsSlider;
