import { FULL_ARROW_SRC } from "@/lib/assets";
import { useEffect, useState } from "react";

/**
 * The attached Turning Point arrow PNG ships with a SOLID BLACK background.
 * On the deep-navy preloader we apply `mix-blend-mode: screen` so the black
 * background drops out (black screens to transparent) and only the red arrow
 * + Union Jack pattern remain visible against the navy container.
 */
const PRELOADER_ARROW_SRC = "/assets/turning-point-arrow.png";

/**
 * LoadingScreen — branded full-screen loading overlay.
 *
 * Two responsibilities, both reusing the same visual (deep-navy overlay +
 * centered Turning Point arrow with a subtle pulse + a thin progress bar):
 *
 *  1. `pendingComponent` on the rootRoute + `<Suspense fallback>` in main.tsx.
 *     Rendered by TanStack Router / React Suspense, so this component must NOT
 *     manage its own mount lifecycle here — the framework mounts/unmounts it.
 *     The `fadeOut` prop is unused in this path.
 *
 *  2. The global initial-load + route-transition preloader driven by
 *     `Layout.tsx`. In that path Layout passes `fadeOut` to trigger the
 *     opacity-0 transition-opacity duration-500 fade-out, and unmounts the
 *     overlay after the fade completes (handled in Layout via the `hidden`
 *     prop). After fade-out the overlay is `pointer-events-none` and removed
 *     from the tab order (`aria-hidden`, `tabIndex={-1}`) so it never blocks
 *     clicks, scroll, or navigation.
 *
 * The overlay sits at `z-[9999]` so it covers the navbar and all other
 * content. Motion is the arrow pulse (scale 1 -> 1.08, opacity 1 -> 0.85,
 * ~1.6s ease-in-out infinite) plus the indeterminate progress bar; both are
 * neutralized under `prefers-reduced-motion` by the global CSS override in
 * index.css, leaving the static arrow + a static accent segment visible.
 */
type LoadingScreenProps = {
  /** When true, fade the overlay out (opacity-0 transition-opacity duration-500).
   *  Used by Layout for the initial-load + route-transition preloader lifecycle.
   *  Defaults to false (fully visible) for the framework-mounted pending/Suspense path. */
  fadeOut?: boolean;
  /** When true, the overlay is hidden from the tab order and pointer events are
   *  disabled. Layout sets this after the fade-out completes so the overlay
   *  never blocks interaction. Defaults to false. */
  hidden?: boolean;
};

export function LoadingScreen({
  fadeOut = false,
  hidden = false,
}: LoadingScreenProps) {
  return (
    <div
      data-ocid="loading_state"
      aria-live="polite"
      aria-label="Loading"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={[
        "loading-screen fixed inset-0 z-[9999] flex w-screen h-screen flex-col items-center justify-center overflow-hidden bg-blue-950 transition-opacity duration-500",
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100",
        hidden ? "pointer-events-none" : "",
      ].join(" ")}
    >
      {/* Centered Turning Point arrow — mix-blend-screen drops the solid black
          background of the source PNG so only the red arrow + Union Jack
          pattern remain visible against the deep-navy container. */}
      <img
        src={PRELOADER_ARROW_SRC}
        alt="Turning Point UK"
        className="spinner-glow mix-blend-screen h-24 w-24 select-none object-contain sm:h-32 sm:w-32"
        draggable={false}
      />

      {/* Thin on-brand indeterminate progress bar beneath the arrow.
          A royal-blue (#00247D) accent travels left-to-right across a faint
          white track. Minimal, on-brand, square-corners discipline. */}
      <div
        aria-hidden="true"
        className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-white/15 sm:w-56"
      >
        <div className="preloader-progress-bar h-full w-1/4 rounded-full bg-[#00247D]" />
      </div>
    </div>
  );
}

/**
 * InitialLoadPreloader — the global full-screen preloader shown on first render
 * and faded out once the DOM + initial assets have loaded.
 *
 * Mounted once at the top of `Layout.tsx` (sibling to Nav/Outlet). On mount it
 * is visible. It listens for `window.load` (or a short timeout fallback) then
 * sets `isLoading=false` to trigger the `fadeOut` opacity transition. After the
 * 500ms fade completes it sets `hidden=true` so the overlay becomes
 * `pointer-events-none` and is removed from the tab order, then unmounts itself.
 *
 * This component is self-contained: Layout just drops `<InitialLoadPreloader />`
 * in and the lifecycle runs itself.
 */
export function InitialLoadPreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      setIsLoading(false);
    };

    if (document.readyState === "complete") {
      finish();
      return;
    }
    window.addEventListener("load", finish, { once: true });
    // Fallback: if window.load never fires (slow assets, ad blockers, etc.),
    // fade out after 2.5s so the preloader never permanently blocks the page.
    const fallback = window.setTimeout(finish, 2500);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(fallback);
    };
  }, []);

  // After the fade-out completes, hide the overlay from interaction + tab order
  // and unmount it so it never blocks clicks, scroll, or navigation.
  useEffect(() => {
    if (isLoading) return;
    const t = window.setTimeout(() => setHidden(true), 500);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  if (hidden) return null;
  return <LoadingScreen fadeOut={!isLoading} />;
}

export default LoadingScreen;
