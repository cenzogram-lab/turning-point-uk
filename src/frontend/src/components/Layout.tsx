import { ROUTES } from "@/lib/routes";
import { buildOrganizationJsonLd } from "@/lib/seo";
import {
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CookieConsentBanner } from "./CookieConsentBanner";
import { Footer } from "./Footer";
import { InitialLoadPreloader, LoadingScreen } from "./LoadingScreen";
import { Nav } from "./Nav";
import { EndorsementsSlider } from "./sections/Endorsements";
import { HomeFaq } from "./sections/HomeFaq";

/**
 * ORG_JSONLD_ID — the stable id of the Organization JSON-LD <script> tag
 * injected by Layout on every page. A dedicated id (NOT the
 * `data-oc-seo-jsonld-<index>` markers used by useSeoMeta) keeps the
 * Organization schema completely separate from page-level useSeoMeta
 * calls so the two never collide or clean each other up.
 */
const ORG_JSONLD_ID = "tpuk-org-jsonld";
const ORG_JSONLD_ATTR = "data-tpuk-org-jsonld";

/**
 * RouteTransitionPreloader — a brief full-screen preloader fade-in/fade-out
 * shown on actual route changes (navigating between inner pages). Reuses the
 * shared LoadingScreen visual (arrow + pulse + progress bar) for consistency.
 *
 * Uses TanStack Router's `useLocation` to detect `location.pathname` changes.
 * On each change it shows the overlay for ~350ms then fades it out over 500ms,
 * after which it becomes pointer-events-none and is removed from the tab order.
 * It does NOT fire on minor interactions — only on real pathname changes.
 */
function RouteTransitionPreloader() {
  const location = useLocation();
  const pathname = location.pathname;
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(true);
  const firstRender = useRef(true);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Skip the very first render — the InitialLoadPreloader already covers the
    // initial page load. Only subsequent pathname changes trigger the transition.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Reference pathname so the dependency array is genuinely necessary —
    // the effect must re-run on every route change, and reading it here keeps
    // Biome's useExhaustiveDependencies rule satisfied without a suppression.
    void pathname;

    // Clear any in-flight timers from a previous transition.
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);

    // Show the overlay immediately on the route change.
    setHidden(false);
    setFadeOut(false);
    setVisible(true);

    // After ~350ms, start the fade-out.
    showTimer.current = window.setTimeout(() => setFadeOut(true), 350);

    // After the fade-out completes (~350 + 500ms), hide from interaction + tab
    // order and unmount so it never blocks clicks, scroll, or navigation.
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      setHidden(true);
    }, 350 + 500);

    return () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  if (hidden) return null;
  return visible ? <LoadingScreen fadeOut={fadeOut} /> : null;
}

/**
 * Layout — the shared shell rendered on every route.
 *
 * Fixed Nav (translucent → solid on scroll) + page outlet + dark four-column
 * Footer. A sticky red DONATE pill is fixed at the bottom on mobile only.
 *
 * The global preloader overlays mount here as siblings to Nav/Outlet:
 *  - `InitialLoadPreloader` covers the very first page load and fades out once
 *    the DOM + initial assets have loaded.
 *  - `RouteTransitionPreloader` fires a brief 300-500ms fade-in/fade-out on
 *    each actual route change (detected via TanStack Router's useLocation).
 * Both reuse the shared LoadingScreen visual and never permanently block the
 * page — after fade-out they are pointer-events-none and removed from the tab
 * order, then unmounted.
 */
export function Layout() {
  // Detect the homepage route so the FAQ can render directly below the
  // EndorsementsSlider on the homepage only. On every other route the
  // order stays: page content -> EndorsementsSlider -> Footer (no FAQ).
  // useLocation is already imported and used by RouteTransitionPreloader;
  // reading pathname here is cheap and avoids a second hook instance.
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  // Belt-and-suspenders guard: admin routes are already reparented under
  // AdminLayout (not Layout) in App.tsx, so this shell should never mount on
  // /admin/* paths in practice. Still, defensively hide the public
  // EndorsementsSlider + Footer whenever the pathname starts with /admin so a
  // misconfigured route can never surface them on admin pages.
  const isAdmin = location.pathname.startsWith("/admin");

  // Organization JSON-LD — injected on EVERY page (including admin) so the
  // Organization schema is always present. Uses a dedicated <script> tag
  // with a stable id (ORG_JSONLD_ID) and a private marker attribute
  // (ORG_JSONLD_ATTR), completely separate from the
  // `data-oc-seo-jsonld-<index>` markers used by useSeoMeta, so page-level
  // useSeoMeta calls (which manage their own BreadcrumbList / WebSite
  // blocks) never collide with or clean up this Organization block. The
  // tag is upserted on mount and removed on unmount; the dependency array
  // is empty so it runs once per Layout mount.
  useEffect(() => {
    const existing = document.head.querySelector<HTMLScriptElement>(
      `script#${ORG_JSONLD_ID}`,
    );
    if (existing) {
      existing.textContent = JSON.stringify(buildOrganizationJsonLd());
      return () => {
        // Only remove if it still carries our marker (a future Layout
        // mount may have re-adopted it). Defensive — keeps cleanup local.
        const el = document.head.querySelector<HTMLScriptElement>(
          `script#${ORG_JSONLD_ID}`,
        );
        if (el?.hasAttribute(ORG_JSONLD_ATTR)) {
          el.remove();
        }
      };
    }
    const el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute(ORG_JSONLD_ATTR, "true");
    el.id = ORG_JSONLD_ID;
    el.textContent = JSON.stringify(buildOrganizationJsonLd());
    document.head.appendChild(el);
    return () => {
      const node = document.head.querySelector<HTMLScriptElement>(
        `script#${ORG_JSONLD_ID}`,
      );
      if (node?.hasAttribute(ORG_JSONLD_ATTR)) {
        node.remove();
      }
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <InitialLoadPreloader />
      <RouteTransitionPreloader />
      {/* Persistent red announcement bar — fixed at the very top, above the
          fixed Nav (which offsets itself by --announcement-bar-height). Red
          primary background, white Oswald text, and a 'Learn More' link that
          navigates to the homepage vigil spotlight section via a hash anchor. */}
      <div
        data-ocid="announcement_bar"
        className="fixed inset-x-0 top-0 z-[60] flex h-[var(--announcement-bar-height)] items-center justify-center gap-2 bg-primary px-4 text-center"
      >
        <span className="truncate font-display text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground sm:text-sm">
          🕯️ Charlie Kirk Vigil — Thursday 10th September 2026 | Montgomery
          Statue, Whitehall, London | Gather 18:30
        </span>
        <Link
          to={ROUTES.home}
          hash="vigil"
          data-ocid="announcement_bar.learn_more"
          className="shrink-0 font-display text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity sm:text-sm"
        >
          Learn More
        </Link>
      </div>
      <Nav />
      {/* pb-24 lg:pb-0 compensates for the mobile-only fixed email capture bar
          (portaled to body) so page content and the footer are never occluded
          when scrolled to the absolute bottom on mobile. */}
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      {!isAdmin && <EndorsementsSlider />}
      {isHomepage && <HomeFaq />}
      {!isAdmin && <Footer />}
      <CookieConsentBanner />

      {/* Mobile email capture bar — mobile only, fixed/pinned to the bottom of
            the phone viewport at all times while scrolling. Stays visible
            during scroll, never scrolls away with the page.

            Exact fixed container spec: a wrapper fixed to the bottom edge,
            full width, z-[100] (above the floating Patreon CTA at z-[99] and
            the CookieConsentBanner at z-50), dark navy surface (bg-navy) with a
            hairline top border so it reads as a distinct chrome zone against
            the page. lg:hidden keeps it off desktop where the in-page
            subscribe sections and header CTAs suffice.

            The bar is a compact native Mailchimp email capture form: a single
            email input (flex-1) plus a red SUBSCRIBE button (shrink-0). It
            posts directly to the Turning Point UK Mailchimp audience (same
            action URL as the other in-page subscribe forms) in a new tab.

            PORTAL TO document.body: the bar is portaled out of the Layout root
            div to document.body so NO ancestor can ever break its
            position:fixed. The Layout root div contains the InitialLoadPreloader
            and RouteTransitionPreloader overlays, whose <LoadingScreen> child
            <img> runs the spinner-glow animation (will-change: transform,
            filter: drop-shadow()). On some mobile browsers, will-change/filter
            on a descendant can promote the root div to a composited layer,
            which creates a containing block for position:fixed descendants and
            makes the bar scroll with the page instead of staying pinned to the
            viewport. Portaling to body places the bar completely outside the
            root div's compositing context so it always pins to the viewport.
            <main> keeps pb-24 lg:pb-0 to compensate for the bar's height so
            page content (and the footer) is never occluded when scrolled to the
            absolute bottom. */}
      {typeof document !== "undefined"
        ? createPortal(
            <div className="fixed bottom-0 left-0 w-full z-[100] bg-navy border-t border-border/40 lg:hidden">
              <form
                action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;f_id=0081c1e5f0"
                method="post"
                target="_blank"
                className="flex items-center gap-2 px-4 py-3"
                data-ocid="mobile.subscribe_bar"
              >
                <label htmlFor="mce-EMAIL-mobile" className="sr-only">
                  Email Address
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL-mobile"
                  required
                  placeholder="Email address"
                  className="admin-input min-w-0 flex-1"
                  data-ocid="mobile.subscribe.email_input"
                />
                <button
                  type="submit"
                  name="subscribe"
                  className="shrink-0 bg-red-600 hover:bg-red-700 px-4 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors"
                  data-ocid="mobile.subscribe.submit_button"
                >
                  Subscribe
                </button>
              </form>
            </div>,
            document.body,
          )
        : null}

      {/* Global floating half-oval Patreon CTA — fixed on the middle-right
          edge of the viewport on EVERY route. Stacked column: bold animated
          'Our podcasts' label above, half-oval 'Join our patreon' button
          flush against the right side below. Sits at z-[99] so it floats
          above page content but stays clear of the bottom-fixed mobile
          Donate pill (z-40, bottom inset). The label is rotated -90deg so
          the two words read bottom-to-top along the narrow right-edge
          column; the button is a half-oval (rounded-l-full) anchored to
          the right edge. */}
      <div
        className="fixed top-1/2 right-0 -translate-y-1/2 z-[99] flex flex-col items-end"
        data-ocid="floating.patreon_cta"
      >
        <span
          data-ocid="floating.patreon_cta.label"
          className="podcasts-bounce mb-2 mr-1 origin-center -rotate-90 whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-white [transform-origin:center] [writing-mode:vertical-rl] [text-orientation:mixed] sm:text-sm"
        >
          Our podcasts
        </span>
        <a
          href="https://www.patreon.com/tpointuk"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="floating.patreon_cta.button"
          className="rounded-l-full py-3 pl-6 pr-3 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-colors"
        >
          Join our patreon
        </a>
      </div>

      <ScrollRestoration />
    </div>
  );
}
