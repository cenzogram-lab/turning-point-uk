import { VIDEO_DEFAULT_HERO } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { BackgroundVideo } from "./BackgroundVideo";

/**
 * Hero — full-viewport scroll-snap hero with a native HTML5 background video.
 *
 * SpaceX discipline: full-bleed background video, dark readability scrim,
 * eyebrow + huge uppercase headline + one-line subhead + 1–2 buttons
 * positioned LOW on screen (flex-end), not centered.
 *
 * EVERY hero renders a native <video autoPlay loop muted playsInline
 * controls={false}> background. When `videoSrc` is omitted, the universal
 * default hero video (VIDEO_DEFAULT_HERO — the main homepage hero footage)
 * renders instead, so no hero anywhere on the site falls back to a static
 * background, placeholder plate, or fallback image.
 *
 * Z-LAYERING: the section carries `isolate` so it establishes its own
 * stacking context. <BackgroundVideo> renders at -z-10 INSIDE that context
 * (with its own bg-black/50 readability overlay directly over the video),
 * which paints above the section's (transparent) background but below the
 * content at z-20. Without `isolate` a -z-10 child would escape behind the
 * section entirely — which is exactly the "flat dark plate, no video" bug.
 *
 * Videos autoplay, loop, muted, playsinline. Heroes below the fold lazy-load.
 * The muted, looped, ambient background videos play even under
 * prefers-reduced-motion.
 *
 * CTA buttons are rounded-full pills. Primary CTAs include an inline SVG of
 * the curved Turning Point UK arrow (clockwise arc sweeping from bottom-left
 * up to a right-pointing arrowhead) on the right of the label; the .tpuk-arrow
 * class nudges it up-and-right on hover (defined in index.css).
 *
 * Entrance animations: the eyebrow, headline, sub, and buttons carry
 * .entrance-left classes (left-aligned content slides in from the left) and
 * staggered data-entrance-delay attributes. These run ALONGSIDE the existing
 * hero-fade-in (on the content wrapper) and headline-rise (on the h1) — they
 * are additional classes on the inner elements, not replacements.
 */
export interface HeroButton {
  label: string;
  /**
   * Internal route path, OR an in-page hash anchor (e.g. "#donate-embed").
   * Hash-prefixed targets render as a plain <a href> that smooth-scrolls to
   * the matching in-page element instead of being routed as a path by
   * TanStack Router.
   */
  to?: string;
  /** External URL. */
  href?: string;
  /** "primary" = solid red pill with arrow; "outline" = white outline pill. */
  variant?: "primary" | "outline";
}

export interface HeroProps {
  eyebrow?: string;
  headline: string;
  sub?: string;
  buttons?: HeroButton[];
  /** Which video belongs here, e.g. "Home hero — crowd at rally". */
  videoLabel: string;
  /**
   * Optional MP4 video source URL. A native HTML5 <video> element (autoPlay
   * loop muted playsInline, controls disabled) always renders as the hero
   * background; when this prop is omitted, the universal default hero video
   * (VIDEO_DEFAULT_HERO) is used so every hero site-wide has moving footage
   * with no static/fallback image.
   */
  videoSrc?: string;
  /**
   * Lazy-load this hero's video. When true (default), the video starts with
   * `preload="metadata"` and only begins autoplay when the section nears the
   * viewport (IntersectionObserver), so below-the-fold heroes do not all
   * compete for mobile bandwidth at once. When false, the video starts with
   * `preload="auto"` and autoplays immediately — use for the top/first hero
   * only. The muted, looped, ambient hero video plays even under
   * prefers-reduced-motion.
   */
  lazy?: boolean;
  className?: string;
}

/**
 * Inline curved TPUK arrow — the branded call-to-action arrow used inside every
 * primary CTA pill.
 *
 * Renders the official TPUK semi-circular arrow image (red top half + Union
 * Jack bottom half) as a true RGBA PNG with real alpha transparency, so only
 * the arrow shape shows on the button — no black box, no checkerboard grid
 * behind it.
 *
 * SIZED SMALL (1em) so the arrow sits inline inside the pill button next to
 * the label text, flowing in the button's normal flex/gap content layout. It
 * is NOT absolutely positioned and does NOT overhang the pill edge — it is a
 * small inline <img> that nudges slightly up-and-to-the-right on hover.
 *
 * Uses Tailwind utilities — w-[1em] h-[1em] inline-block transition-transform
 * duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5
 * select-none — so the arrow slides smoothly up and to the right on hover.
 * The parent primary CTA element MUST carry the `group` class for the
 * group-hover utilities to fire.
 *
 * NOTE: this component intentionally does NOT carry the legacy .tpuk-arrow CSS
 * class — the hover transform is driven entirely by Tailwind group-hover
 * utilities. The .tpuk-arrow CSS rule in index.css is left in place because it
 * may still be referenced elsewhere.
 */
const TPUK_ARROW_SRC =
  "/assets/generated/tpuk-arrow-transparent.dim_1024x1024.png";

export function TpukArrow({ className }: { className?: string }) {
  return (
    <img
      src={TPUK_ARROW_SRC}
      alt="TPUK arrow"
      loading="eager"
      aria-hidden="true"
      draggable={false}
      className={cn(
        "inline-block w-[1em] h-[1em] ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 select-none motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0",
        className,
      )}
    />
  );
}

export function Hero({
  eyebrow,
  headline,
  sub,
  buttons = [],
  videoLabel,
  videoSrc,
  lazy = true,
  className,
}: HeroProps) {
  return (
    <section
      data-ocid="hero"
      className={cn(
        "scroll-snap-section relative isolate overflow-hidden",
        className,
      )}
    >
      {/* Background layer — native HTML5 <video>, always. Falls back to the
          universal default hero video when no specific source is assigned.

          Z-LAYERING: the section carries `isolate` (its own stacking
          context), so <BackgroundVideo>'s -z-10 wrapper paints above the
          section's transparent background but below every other child. The
          bg-black/50 readability overlay is rendered by <BackgroundVideo>
          directly over the video.

          The <BackgroundVideo> component handles IntersectionObserver lazy
          loading (preload="metadata" until near the viewport, then "auto" +
          play()) and the mobile play() retry path; autoPlay loop muted
          playsInline keep it playing as an ambient background. */}
      <BackgroundVideo
        videoSrc={videoSrc ?? VIDEO_DEFAULT_HERO}
        lazy={lazy}
        ariaLabel={videoLabel}
      />

      {/* Bottom-edge fade — a thin gradient from transparent to the page's
          midnight background so the hero's bottom edge blends smoothly into
          the ambient page beneath it instead of cutting a hard line. Sits at
          z-10 (above the -z-10 video, below the content at z-20). */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#030712] z-10"
        aria-hidden="true"
      />

      {/* Content anchored low like SpaceX, not centered.
          The content wrapper keeps the existing hero-fade-in animation.
          Inner elements carry .entrance-left + staggered data-entrance-delay
          so the universal Intersection Observer slides them in from the left
          ALONGSIDE the fade-in. Sits at z-20 so it renders above the video
          (z-0) and gradient overlays (z-10). */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-[8dvh] pt-24 sm:px-10 sm:pb-[14dvh] sm:pt-32">
        <div className="flex max-w-3xl flex-col gap-5 animate-[hero-fade-in_0.8s_cubic-bezier(0.4,0,0.2,1)_both]">
          {eyebrow ? (
            <span
              className="entrance-left text-eyebrow text-foreground/80"
              data-entrance-delay="0"
            >
              {eyebrow}
            </span>
          ) : null}
          <h1
            className="entrance-left text-headline text-foreground animate-[headline-rise_0.7s_cubic-bezier(0.4,0,0.2,1)_0.15s_both]"
            data-entrance-delay="80"
          >
            {headline}
          </h1>
          {sub ? (
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="220"
            >
              {sub}
            </p>
          ) : null}
          {buttons.length > 0 ? (
            <div
              className="entrance-left mt-2 flex flex-col items-start gap-3"
              data-entrance-delay="360"
            >
              {buttons.map((btn) => {
                const isPrimary = btn.variant !== "outline";
                const cls = cn(
                  isPrimary ? "btn-primary-square group" : "btn-outline-invert",
                  "rounded-full",
                );
                const content = isPrimary ? (
                  <span>{btn.label}</span>
                ) : (
                  <span>{btn.label}</span>
                );
                if (btn.to) {
                  // Hash-prefixed targets (e.g. "#donate-embed") are in-page
                  // anchors, NOT route paths. Render a plain <a href> that
                  // smooth-scrolls to the matching element instead of letting
                  // TanStack Router treat the hash as a route path (which
                  // would no-op or navigate to a non-existent route).
                  if (btn.to.startsWith("#")) {
                    const handleHashClick = (
                      e: MouseEvent<HTMLAnchorElement>,
                    ) => {
                      e.preventDefault();
                      const id = btn.to!.slice(1);
                      const target = document.getElementById(id);
                      if (target) {
                        target.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      } else {
                        // Fallback: update the URL hash so the browser
                        // performs its native anchor jump.
                        window.location.hash = id;
                      }
                    };
                    return (
                      <a
                        key={btn.label}
                        href={btn.to}
                        onClick={handleHashClick}
                        data-ocid="hero.button"
                        className={cls}
                      >
                        {content}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={btn.label}
                      to={btn.to}
                      data-ocid="hero.button"
                      className={cls}
                    >
                      {content}
                    </Link>
                  );
                }
                return (
                  <a
                    key={btn.label}
                    href={btn.href ?? "#"}
                    target={btn.href ? "_blank" : undefined}
                    rel={btn.href ? "noopener noreferrer" : undefined}
                    data-ocid="hero.button"
                    className={cls}
                  >
                    {content}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
