/**
 * Centralized SEO configuration for Turning Point UK.
 *
 * Single source of truth for site-wide constants (canonical host, OG image,
 * Organization identity), JSON-LD builders, per-page title/description copy,
 * and breadcrumb trails derived from the visual nav hierarchy in lib/routes.ts.
 *
 * PAGE_SEO and BREADCRUMB_TRAILS are the single source of truth for static
 * pages. When a route is added, removed, or renamed, update both maps AND
 * regenerate src/frontend/public/sitemap.xml to match (the sitemap is a static
 * file because this is an SPA without a build-time sitemap generator; the
 * centralized config here keeps it maintainable).
 */

/** Canonical host — www.tpointuk.co.uk is the single canonical host. */
export const SITE_BASE_URL = "https://www.tpointuk.co.uk";

/** Absolute OG image URL used as the default social preview across all pages. */
export const OG_IMAGE_URL =
  "https://www.tpointuk.co.uk/assets/generated/og-image.dim_1200x630.jpg";

/** Absolute URL to the Organization logo (used in Organization JSON-LD). */
export const ORGANIZATION_LOGO_URL =
  "https://www.tpointuk.co.uk/assets/logos/tpuk-logo.webp";

/** Organization description used in Organization JSON-LD. */
export const ORGANIZATION_DESCRIPTION =
  "Turning Point UK is Britain's largest conservative youth activist movement.";

/** sameAs array — the 4 official social profile URLs. */
export const SOCIAL_SAMEAS: string[] = [
  "https://www.facebook.com/TPointUK",
  "https://www.twitter.com/TPointUK",
  "https://www.instagram.com/tpointuk/",
  "https://www.youtube.com/channel/UCmbm72l60p3OH4aL4o7BFeA",
];

/** Build the Organization JSON-LD schema object. */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Turning Point UK",
    url: SITE_BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: ORGANIZATION_LOGO_URL,
    },
    description: ORGANIZATION_DESCRIPTION,
    sameAs: SOCIAL_SAMEAS,
  };
}

/** Build the WebSite JSON-LD schema object (used on the homepage). */
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Turning Point UK",
    url: SITE_BASE_URL,
  };
}

/** A single breadcrumb trail step: a visible label + its site path. */
export interface BreadcrumbStep {
  name: string;
  path: string;
}

/**
 * Build a BreadcrumbList JSON-LD schema object from an array of {name, path}
 * pairs. Positions are 1-indexed; each item's URL is SITE_BASE_URL + path.
 */
export function buildBreadcrumbJsonLd(trail: BreadcrumbStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${SITE_BASE_URL}${step.path}`,
    })),
  };
}

/** Per-page SEO copy keyed by route path. Titles < 60 chars, descriptions 140–160 chars. */
export const PAGE_SEO: Record<string, { title: string; description: string }> =
  {
    "/": {
      title: "Turning Point UK | Britain's Conservative Youth Movement",
      description:
        "Turning Point UK is Britain's largest conservative youth activist movement. Question. Challenge. Fight Back. Join the movement today.",
    },
    "/about": {
      title: "About Turning Point UK | Who We Are",
      description:
        "Founded in 2019, Turning Point UK is the UK's largest conservative and free speech activist organisation, active across 30+ universities.",
    },
    "/activism": {
      title: "Activism | Get Involved with Turning Point UK",
      description:
        "Take action with Turning Point UK - become an activist, start a university society, order an activism kit, or report classroom bias.",
    },
    "/become-an-activist": {
      title: "Become An Activist | Turning Point UK",
      description:
        "Join the Turning Point UK activist team. Get trained and equipped to stand up for conservative values on campus and beyond.",
    },
    "/activism-kit": {
      title: "Activism Kit | Turning Point UK",
      description:
        "Order your Turning Point UK activism kit - flyers, banners, placards and stickers, delivered free across the UK.",
    },
    "/education-watch": {
      title: "Education Watch | Report Classroom Bias | Turning Point UK",
      description:
        "Confidentially report political indoctrination in schools, colleges and universities through Turning Point UK's Education Watch portal.",
    },
    "/university-societies": {
      title: "University Societies | Turning Point UK Chapters",
      description:
        "Find your local Turning Point UK university chapter or start a society on your campus. Active at Manchester, UCL, Imperial and more.",
    },
    "/petition": {
      title: "Petitions | Turning Point UK Campaigns",
      description:
        "Add your name to Turning Point UK campaigns. Our Gurkha veterans pension petition was signed by over 100,000 people.",
    },
    "/join-us": {
      title: "Join Turning Point UK | Membership & Donations",
      description:
        "Join Turning Point UK. Choose a membership tier from £5/month and stand with Britain's conservative youth movement.",
    },
    "/donate": {
      title: "Donate | Support Turning Point UK",
      description:
        "Support Turning Point UK. Every donation funds campus outreach, direct action and the fight for British values.",
    },
    "/checkout/success": {
      title: "Payment Successful | Turning Point UK",
      description: "Your payment to Turning Point UK was successful.",
    },
    "/checkout/cancel": {
      title: "Payment Cancelled | Turning Point UK",
      description:
        "Your payment was cancelled. Try again or return to the site.",
    },
    "/events": {
      title: "Events | Campus Speeches & Rallies | Turning Point UK",
      description:
        "Upcoming Turning Point UK events, campus speeches and rallies across the UK. RSVP and get involved.",
    },
    "/merchandise": {
      title: "Shop | Official Turning Point UK Merchandise",
      description:
        "Official Turning Point UK merchandise - hats, shirts and stickers. Every order funds the movement. Shipped across the UK.",
    },
    "/gallery": {
      title: "Gallery | Turning Point UK Campaigns",
      description:
        "See Turning Point UK in action - photos from campuses, rallies and direct action across the country.",
    },
    "/blog": {
      title: "Blog | News & Analysis | Turning Point UK",
      description:
        "Commentary, campaign updates and news from Turning Point UK, Britain's conservative youth movement.",
    },
    "/real-british-history": {
      title: "Real British History | Turning Point UK",
      description:
        "Turning Point UK on protecting British heritage, historical figures and the story of our nation.",
    },
    "/contact": {
      title: "Contact Turning Point UK",
      description:
        "Get in touch with Turning Point UK for press enquiries, partnerships, or to get involved with the movement.",
    },
    // Secondary pages (not in the user's explicit list but exist as routes).
    "/patreon": {
      title: "Patreon | Support Turning Point UK Podcasts",
      description:
        "Back Turning Point UK on Patreon. Support our podcasts and exclusive content, and join the community backing Britain's conservative youth movement.",
    },
    "/mbga": {
      title: "MBGA | Make Britain Great Again | Turning Point UK",
      description:
        "Make Britain Great Again - Turning Point UK's campaign to defend British values, sovereignty and heritage. Get involved today.",
    },
    "/privacy-policy": {
      title: "Privacy Policy | Turning Point UK",
      description:
        "Turning Point UK privacy policy - how we collect, use and protect your personal data when you use our website and services.",
    },
    "/terms-and-conditions": {
      title: "Terms & Conditions | Turning Point UK",
      description:
        "Turning Point UK terms and conditions of use - the rules and policies governing access to our website, membership and services.",
    },
  };

/**
 * Breadcrumb trails keyed by route path, derived from the visual nav
 * hierarchy in lib/routes.ts (NAV_ENTRIES). The About dropdown contains
 * Gallery and Blog; the Activism dropdown contains Become An Activist,
 * Activism Kit, Education Watch, University Societies, and Petition; the
 * Join dropdown contains Join Us and Patreon. Standalone nav entries
 * (Events, Merchandise, Real British History, Contact) and secondary
 * pages (Donate, MBGA, Privacy Policy, Terms & Conditions) sit directly
 * under Home.
 */
export const BREADCRUMB_TRAILS: Record<string, BreadcrumbStep[]> = {
  "/": [{ name: "Home", path: "/" }],
  "/about": [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ],
  "/activism": [
    { name: "Home", path: "/" },
    { name: "Activism", path: "/activism" },
  ],
  "/become-an-activist": [
    { name: "Home", path: "/" },
    { name: "Activism", path: "/activism" },
    { name: "Become An Activist", path: "/become-an-activist" },
  ],
  "/activism-kit": [
    { name: "Home", path: "/" },
    { name: "Activism", path: "/activism" },
    { name: "Activism Kit", path: "/activism-kit" },
  ],
  "/education-watch": [
    { name: "Home", path: "/" },
    { name: "Activism", path: "/activism" },
    { name: "Education Watch", path: "/education-watch" },
  ],
  "/university-societies": [
    { name: "Home", path: "/" },
    { name: "Activism", path: "/activism" },
    { name: "University Societies", path: "/university-societies" },
  ],
  "/petition": [
    { name: "Home", path: "/" },
    { name: "Activism", path: "/activism" },
    { name: "Petition", path: "/petition" },
  ],
  "/join-us": [
    { name: "Home", path: "/" },
    { name: "Join", path: "/join-us" },
    { name: "Join Us", path: "/join-us" },
  ],
  "/patreon": [
    { name: "Home", path: "/" },
    { name: "Join", path: "/join-us" },
    { name: "Patreon", path: "/patreon" },
  ],
  "/events": [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
  ],
  "/merchandise": [
    { name: "Home", path: "/" },
    { name: "Merchandise", path: "/merchandise" },
  ],
  "/gallery": [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Gallery", path: "/gallery" },
  ],
  "/blog": [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
  ],
  "/real-british-history": [
    { name: "Home", path: "/" },
    { name: "Real British History", path: "/real-british-history" },
  ],
  "/contact": [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ],
  "/donate": [
    { name: "Home", path: "/" },
    { name: "Donate", path: "/donate" },
  ],
  "/checkout/success": [
    { name: "Home", path: "/" },
    { name: "Checkout", path: "/donate" },
    { name: "Success", path: "/checkout/success" },
  ],
  "/checkout/cancel": [
    { name: "Home", path: "/" },
    { name: "Checkout", path: "/donate" },
    { name: "Cancel", path: "/checkout/cancel" },
  ],
  "/mbga": [
    { name: "Home", path: "/" },
    { name: "MBGA", path: "/mbga" },
  ],
  "/privacy-policy": [
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ],
  "/terms-and-conditions": [
    { name: "Home", path: "/" },
    { name: "Terms & Conditions", path: "/terms-and-conditions" },
  ],
};
