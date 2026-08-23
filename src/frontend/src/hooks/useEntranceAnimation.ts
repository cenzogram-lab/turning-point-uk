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

const ENTRANCE_SELECTOR = ".entrance-left, .entrance-right";

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
    const mo = new MutationObserver(() => observeAll());
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
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
