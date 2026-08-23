/**
 * Central route registry for Turning Point UK.
 * Single source of truth for paths used by the router, nav, footer, and mobile bar.
 */

export interface NavLink {
  label: string;
  to: string;
  /** Mark external links (open in new tab). */
  external?: boolean;
}

export interface NavDropdown {
  label: string;
  /** Optional parent link — when present, the dropdown header is rendered as
     a clickable NavLink to this route (e.g. ABOUT → /about) while the
     dropdown panel still opens on hover/focus-within. Used by the ABOUT and
     ACTIVISM dropdowns in Nav.tsx. */
  to?: string;
  items: NavLink[];
}

export type NavEntry = NavLink | NavDropdown;

function isDropdown(entry: NavEntry): entry is NavDropdown {
  return "items" in entry;
}

export { isDropdown };

export const ROUTES = {
  home: "/",
  about: "/about",
  activism: "/activism",
  becomeAnActivist: "/become-an-activist",
  activismKit: "/activism-kit",
  educationWatch: "/education-watch",
  universitySocieties: "/university-societies",
  petition: "/petition",
  joinUs: "/join-us",
  /**
   * Internal landing page route for the Patreon page. Renders
   * PatreonPage, which carries the hero + benefit sections and the
   * external BECOME A PATRON CTA. The Join dropdown's Patreon entry
   * points here so users hit the landing page first.
   */
  patreonPage: "/patreon",
  /**
   * External Patreon URL — the CTA target on the /patreon landing page
   * and any other surface that links supporters straight to Patreon.
   * Opens in a new tab.
   */
  patreon: "https://www.patreon.com/tpointuk",
  events: "/events",
  merchandise: "/merchandise",
  gallery: "/gallery",
  blog: "/blog",
  realBritishHistory: "/real-british-history",
  /**
   * Alias reading route for blog-category posts. Renders PostArticlePage
   * directly (no redirect) so the URL bar preserves the /blog/ prefix the
   * reader clicked from a blog card. Used as a TanStack Router `to` value
   * with a `slug` param.
   */
  blogArticle: "/blog/$slug",
  /**
   * Alias reading route for Real British History posts. Renders
   * PostArticlePage directly (no redirect) so the URL bar preserves the
   * /real-british-history/ prefix the reader clicked from an RBH card.
   * Used as a TanStack Router `to` value with a `slug` param.
   */
  realBritishHistoryArticle: "/real-british-history/$slug",
  /**
   * Canonical reading route for any published post regardless of category.
   * The /blog/$slug and /real-british-history/$slug alias routes render the
   * same PostArticlePage directly (no redirect) so the URL bar preserves the
   * hub prefix the reader clicked. Used as a TanStack Router `to` value
   * with a `slug` param.
   */
  post: "/post/$slug",
  contact: "/contact",
  donate: "/donate",
  /**
   * Stripe Checkout success redirect target. Stripe appends
   * ?session_id=... to this URL on redirect; CheckoutSuccessPage reads
   * it and polls getStripeSessionStatus for the order summary.
   */
  checkoutSuccess: "/checkout/success",
  /**
   * Stripe Checkout cancel redirect target. CheckoutCancelPage renders
   * a clean retry/return screen with links back to /merchandise and
   * /join-us.
   */
  checkoutCancel: "/checkout/cancel",
  mbga: "/mbga",
  privacyPolicy: "/privacy-policy",
  termsAndConditions: "/terms-and-conditions",
  /**
   * Hidden admin route — NOT included in NAV_ENTRIES. Reachable only via
   * direct URL. Protected by a password gate (authorization extension)
   * inside the page.
   */
  adminGallery: "/admin/gallery",
  /**
   * Hidden admin route — NOT included in NAV_ENTRIES. Reachable only via
   * direct URL. Protected by a password gate (authorization extension)
   * inside the page. Mirrors adminGallery.
   */
  adminBlog: "/admin/blog",
  /**
   * Hidden admin route — NOT included in NAV_ENTRIES. Reachable only via
   * direct URL. Protected by a password gate (authorization extension)
   * inside the page. Reuses the blog backend with
   * category='Real British History'. Mirrors adminBlog / adminGallery.
   */
  adminRealBritishHistory: "/admin/real-british-history",
  /**
   * Hidden admin route — NOT included in NAV_ENTRIES. Reachable only via
   * direct URL or the admin header tab nav. Renders AdminStripePage,
   * which hosts the StripeSetupPanel (the only surface where the
   * Stripe secret key can be set/rotated). Auth is owned centrally by
   * AdminAuthGuard, which wraps AdminLayout for the entire `/admin/*`
   * workspace — no Stripe setup UI is exposed on public
   * customer-facing routes. Mirrors adminBlog / adminGallery /
   * adminRealBritishHistory.
   */
  adminStripe: "/admin/stripe",
} as const;

/** Top-nav structure: dropdowns + standalone links, in display order. */
export const NAV_ENTRIES: NavEntry[] = [
  {
    label: "About",
    items: [
      { label: "Gallery", to: ROUTES.gallery },
      { label: "Blog", to: ROUTES.blog },
    ],
  },
  {
    label: "Activism",
    items: [
      { label: "Become An Activist", to: ROUTES.becomeAnActivist },
      { label: "Activism Kit", to: ROUTES.activismKit },
      { label: "Education Watch", to: ROUTES.educationWatch },
      { label: "University Societies", to: ROUTES.universitySocieties },
      { label: "Petition", to: ROUTES.petition },
    ],
  },
  {
    label: "Join",
    items: [
      { label: "Join Us", to: ROUTES.joinUs },
      { label: "Patreon", to: ROUTES.patreonPage },
    ],
  },
  { label: "Events", to: ROUTES.events },
  { label: "Merchandise", to: ROUTES.merchandise },
  { label: "Blog", to: ROUTES.blog },
  { label: "Real British History", to: ROUTES.realBritishHistory },
  { label: "Contact", to: ROUTES.contact },
];

/** Footer column "MOVEMENT" links. */
export const FOOTER_MOVEMENT_LINKS: NavLink[] = [
  { label: "About", to: ROUTES.about },
  { label: "Blog", to: ROUTES.blog },
  { label: "Real British History", to: ROUTES.realBritishHistory },
  { label: "Gallery", to: ROUTES.gallery },
  { label: "Events", to: ROUTES.events },
];

/** Footer column "GET INVOLVED" links. */
export const FOOTER_INVOLVED_LINKS: NavLink[] = [
  { label: "Join Us", to: ROUTES.joinUs },
  { label: "Become An Activist", to: ROUTES.becomeAnActivist },
  { label: "Activism Kit", to: ROUTES.activismKit },
  { label: "Education Watch", to: ROUTES.educationWatch },
  { label: "University Societies", to: ROUTES.universitySocieties },
  { label: "Petition", to: ROUTES.petition },
];

/** Footer column "MORE / SUPPORT" links. Donate opens the canonical
 * PayPal.me URL in a new tab; Patreon routes to the internal /patreon
 * landing page (ROUTES.patreonPage). */
export const FOOTER_MORE_LINKS: NavLink[] = [
  { label: "Merchandise", to: ROUTES.merchandise },
  { label: "Contact", to: ROUTES.contact },
  {
    label: "DONATE VIA STRIPE / CARD / APPLE PAY",
    to: "https://donate.stripe.com/00w28r7VfeHtcVQfDffw406",
    external: true,
  },
  { label: "Patreon", to: ROUTES.patreonPage },
];

/** Categorized mobile menu sections — mirrors the footer's three columns
 * (MOVEMENT, GET INVOLVED, MORE / SUPPORT) so the full link list is grouped
 * with visible category labels instead of a flat, cluttered list. Routes
 * identically to the footer: internal paths for site pages, external
 * new-tab for the Donate PayPal link, internal /patreon for Patreon. */
export const MOBILE_MENU_SECTIONS: { label: string; links: NavLink[] }[] = [
  { label: "MOVEMENT", links: FOOTER_MOVEMENT_LINKS },
  { label: "GET INVOLVED", links: FOOTER_INVOLVED_LINKS },
  { label: "MORE / SUPPORT", links: FOOTER_MORE_LINKS },
];

export const SOCIAL_LINKS: { label: string; href: string; icon: string }[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/TPointUK/",
    icon: "facebook",
  },
  { label: "X", href: "https://x.com/TPointUK", icon: "x" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/tpointuk/?hl=en",
    icon: "instagram",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@TurningPointUK1",
    icon: "youtube",
  },
];
