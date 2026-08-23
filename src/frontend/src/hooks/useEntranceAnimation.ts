import { useEffect, useRef } from "react";

/**
 * useEntranceAnimation — universal Intersection Observer hook for the
 * TPUK entrance-animation system.
 *
 * Convention (used by every page):
 *   1. Add `className="entrance-left"` (slides in from the left) or
 *      `className="entrance-right"` (slides in from the right) to any element
 *      you want to animate in.
 *   2. Optionally add `data-entrance-delay="120"` (ms) to stagger the reveal.
 *   3. Call `useEntranceAnimation()` once near the top of the page (or attach
 *      the returned `containerRef` to a wrapper). The observer finds every
 *      `.entrance-left` / `.entrance-right` element inside, watches them, and
 *      adds `.entrance-visible` when they enter the viewport — which transitions
 *      them to `opacity:1 translateX(0)` (defined in index.css).
 *
 * The hook re-scans whenever `containerRef`'s subtree changes (MutationObserver)
 * so dynamically rendered content is picked up too.
 *
 * `prefers-reduced-motion`: the index.css `@media (prefers-reduced-motion)`
 * block already forces `.entrance-left` / `.entrance-right` to the settled
 * state and disables transitions, so the hook still adds `.entrance-visible`
 * (a no-op visually) but skips the IntersectionObserver entirely to avoid
 * hiding content behind motion that may never reveal it.
 */

export interface UseEntranceAnimationOptions {
  /** IntersectionObserver rootMargin. Default: "0px 0px -10% 0px". */
  rootMargin?: string;
  /** IntersectionObserver threshold. Default: 0.1. */
  threshold?: number;
  /**
   * Default stagger delay in ms applied when an element has no
   * `data-entrance-delay` attribute. Default: 0 (no default stagger —
   * use the data attribute per element).
   */
  stagger?: number;
  /** Disable the observer entirely (e.g. for SSR-only routes). Default: false. */
  disabled?: boolean;
}

const ENTRANCE_SELECTOR = ".entrance-left, .entrance-right, .entrance-up";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Attach to a container element to scope the observer, OR call with no ref
 * to observe the entire document body.
 *
 * @example
 * // Observe the whole page (simplest — works for every page):
 * useEntranceAnimation();
 *
 * @example
 * // Scope to a wrapper:
 * const ref = useEntranceAnimation<HTMLDivElement>();
 * return <div ref={ref}>...</div>;
 */
export function useEntranceAnimation<T extends HTMLElement = HTMLElement>(
  options: UseEntranceAnimationOptions = {},
) {
  const {
    rootMargin = "0px 0px -10% 0px",
    threshold = 0.1,
    stagger = 0,
    disabled = false,
  } = options;

  const containerRef = useRef<T | null>(null);

  // Mark the document as JS-ready so the entrance-animation hidden state
  // (opacity:0 / translateX) only applies once JS is active. The CSS gates
  // `.entrance-left` / `.entrance-right` behind `.entrance-js`, so before this
  // class is present (or if JS never runs) entrance elements stay fully
  // visible. This eliminates the FOUC flash where footer/content briefly
  // appears then hides then animates back in on initial load. The class is
  // added once and never removed — it is a permanent "JS is active" marker.
  useEffect(() => {
    document.documentElement.classList.add("entrance-js");
  }, []);

  useEffect(() => {
    if (disabled) return;

    const root = containerRef.current ?? document.body;
    if (!root) return;

    const reduced = prefersReducedMotion();

    const reveal = (el: Element) => {
      if (reduced) {
        el.classList.add("entrance-visible");
        return;
      }
      const delayAttr = el.getAttribute("data-entrance-delay");
      const delay = delayAttr ? Number(delayAttr) : stagger;
      if (delay && Number.isFinite(delay) && delay > 0) {
        window.setTimeout(() => el.classList.add("entrance-visible"), delay);
      } else {
        el.classList.add("entrance-visible");
      }
    };

    // Reduced motion: settle everything immediately, no observer.
    if (reduced) {
      for (const el of root.querySelectorAll(ENTRANCE_SELECTOR)) {
        reveal(el);
      }
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold },
    );

    const observeAll = () => {
      for (const el of root.querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR)) {
        if (!el.classList.contains("entrance-visible")) {
          io.observe(el);
        }
      }
    };

    observeAll();

    // Re-scan when the subtree changes so dynamically rendered content
    // (route transitions, lazy sections, fetched lists) is picked up.
    // Coalesced to at most one scan per animation frame so mutation bursts
    // (autoplaying carousels, streaming lists) don't trigger a full
    // querySelectorAll pass per mutation record.
    let rafId = 0;
    const mo = new MutationObserver(() => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        observeAll();
      });
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [rootMargin, threshold, stagger, disabled]);

  return containerRef;
}

/**
 * entranceProps — non-JSX helper that returns the className string and
 * data-entrance-delay attribute for spreading onto any element. Use this
 * when you want a self-documenting marker instead of remembering the
 * class/attribute convention. Works in `.ts` files (no JSX required) and
 * composes with existing classNames.
 *
 * @example
 * const props = entranceProps({ from: "left", delay: 120, className: "text-headline" });
 * <h1 {...props}>Headline</h1>
 *
 * @example
 * <section {...entranceProps({ from: "right" })}>...</section>
 */
export interface EntrancePropsOptions {
  /** Slide-in direction. Default: "left". */
  from?: "left" | "right";
  /** Stagger delay in ms (sets data-entrance-delay). */
  delay?: number;
  /** Existing className to compose with the entrance class. */
  className?: string;
}

export function entranceProps({
  from = "left",
  delay,
  className,
}: EntrancePropsOptions = {}): {
  className: string;
  "data-entrance-delay"?: string;
} {
  const entranceClass = from === "right" ? "entrance-right" : "entrance-left";
  const composed = className ? `${entranceClass} ${className}` : entranceClass;
  return delay !== undefined
    ? { className: composed, "data-entrance-delay": String(delay) }
    : { className: composed };
}

/**
 * useUniversalReveal — site-wide auto-animation for texts and blocks.
 *
 * Mounted once in the shared <Layout> shell. Automatically tags every
 * animatable content element inside <main> (headings, paragraphs, list
 * items, blockquotes, figures, images, and card surfaces) with the
 * `.entrance-up` class (rise-up + fade-in, defined in index.css), assigns a
 * small per-sibling stagger via `data-entrance-delay`, then observes the
 * whole document with the same IntersectionObserver + MutationObserver
 * machinery as `useEntranceAnimation` so elements reveal as they scroll
 * into view — on EVERY page, with no per-page markup required.
 *
 * Elements that already participate in the manual entrance system
 * (`.entrance-left` / `.entrance-right`, or nested inside one) are skipped
 * so the two systems never fight over the same node, as are elements inside
 * `aria-hidden` containers (background video plates, decorative overlays)
 * and anything carrying `data-no-reveal`.
 *
 * FOUC + reduced-motion safety are inherited from the shared system: the
 * hidden initial state is gated behind the `.entrance-js` html marker, and
 * the index.css prefers-reduced-motion block forces `.entrance-up` straight
 * to its settled state.
 */
const AUTO_REVEAL_SELECTOR = [
  "main h1",
  "main h2",
  "main h3",
  "main h4",
  "main p",
  "main li",
  "main blockquote",
  "main figure",
  "main img",
  "main .article-card",
  "main .ambient-card",
].join(", ");

export function useUniversalReveal(): void {
  useEffect(() => {
    document.documentElement.classList.add("entrance-js");

    // Scope all scanning to <main> (the selectors only match inside it
    // anyway). This keeps the MutationObserver from firing full-page
    // re-scans for DOM churn outside the page content — e.g. the
    // continuously auto-playing endorsements slider, toasts, or portals —
    // which would otherwise burn CPU on every animation frame on mobile.
    const scanRoot: ParentNode =
      document.querySelector("main") ?? document.body;
    const observeRoot: Node =
      scanRoot instanceof Element ? scanRoot : document.body;

    const tag = (root: ParentNode) => {
      for (const el of root.querySelectorAll<HTMLElement>(
        AUTO_REVEAL_SELECTOR,
      )) {
        if (
          el.classList.contains("entrance-left") ||
          el.classList.contains("entrance-right") ||
          el.classList.contains("entrance-up") ||
          el.closest(
            ".entrance-left, .entrance-right, [data-no-reveal], [aria-hidden='true']",
          )
        ) {
          continue;
        }
        el.classList.add("entrance-up");
        if (!el.hasAttribute("data-entrance-delay")) {
          // Small per-sibling stagger so grids/lists cascade instead of
          // popping in as one block. Capped so late items never lag far
          // behind the scroll.
          const parent = el.parentElement;
          const index = parent
            ? Array.prototype.indexOf.call(parent.children, el)
            : 0;
          el.setAttribute(
            "data-entrance-delay",
            String(Math.min(Math.max(index, 0) * 60, 360)),
          );
        }
      }
    };

    const reduced = prefersReducedMotion();

    const reveal = (el: Element) => {
      if (reduced) {
        el.classList.add("entrance-visible");
        return;
      }
      const delayAttr = el.getAttribute("data-entrance-delay");
      const delay = delayAttr ? Number(delayAttr) : 0;
      if (delay && Number.isFinite(delay) && delay > 0) {
        window.setTimeout(() => el.classList.add("entrance-visible"), delay);
      } else {
        el.classList.add("entrance-visible");
      }
    };

    tag(scanRoot);

    // Coalesce mutation bursts into at most one scan per animation frame.
    // Route transitions and data fetches fire dozens of mutations in a row;
    // without this the full tag() pass would run once per mutation record.
    let rafId = 0;
    const scheduleScan = (work: () => void) => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        work();
      });
    };

    // Reduced motion: settle everything immediately, no observer.
    if (reduced) {
      for (const el of scanRoot.querySelectorAll(".entrance-up")) {
        reveal(el);
      }
      // Still keep tagging new content so it never hides (tag + settle).
      const settleMo = new MutationObserver(() =>
        scheduleScan(() => {
          tag(scanRoot);
          for (const el of scanRoot.querySelectorAll(
            ".entrance-up:not(.entrance-visible)",
          )) {
            reveal(el);
          }
        }),
      );
      settleMo.observe(observeRoot, { childList: true, subtree: true });
      return () => {
        settleMo.disconnect();
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            // Unobserve as soon as an element has revealed — reveals are
            // one-shot, so keeping settled elements under observation would
            // only cost memory/callback work on long pages.
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const observeAll = () => {
      for (const el of scanRoot.querySelectorAll<HTMLElement>(".entrance-up")) {
        if (!el.classList.contains("entrance-visible")) {
          io.observe(el);
        }
      }
    };

    observeAll();

    // Re-tag + re-observe when the page content changes so route
    // transitions and dynamically fetched content (blog grids, gallery
    // tiles) are picked up — coalesced to one pass per frame.
    const mo = new MutationObserver(() =>
      scheduleScan(() => {
        tag(scanRoot);
        observeAll();
      }),
    );
    mo.observe(observeRoot, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);
}
