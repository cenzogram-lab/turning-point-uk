import { SOCIAL_ICONS } from "@/components/SocialIcons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavConfig } from "@/hooks/useNavConfig";
import {
  type NavDropdown,
  type NavEntry,
  type NavLink,
  ROUTES,
  SOCIAL_LINKS,
  isDropdown,
} from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Nav — fixed top navigation.
 *
 * Desktop (xl and up): three-region flex row — logo far-left (shrink-0),
 * centered primary navigation group (ABOUT, ACTIVISM, MERCHANDISE, EVENTS,
 * BLOG + a MORE ▾ overflow dropdown), right utility cluster (shrink-0)
 * holding compact social icons, the $MBGA Pump.fun pill, and the DONATE
 * button.
 *
 * Below xl: only the logo on the left, the $MBGA pill + DONATE button on the
 * right, and a hamburger toggle (☰) that opens a full mobile drawer
 * containing every route link (including the MORE ▾ overflow links and the
 * existing nested dropdown sub-links) and all social channels.
 *
 * Transparent over the hero at the top of the page, transitions smoothly
 * into bg-navy/90 backdrop-blur-md with a subtle bottom border once the user
 * scrolls past a small threshold. The logo's white notch plate stays solid
 * white at every scroll position.
 *
 * Each parent <li> is relative and its dropdown is absolutely positioned
 * left-aligned to the parent (left-0), revealed on hover/focus-within so it
 * is keyboard reachable. The MORE ▾ dropdown additionally closes on outside
 * click and Escape.
 */

/**
 * Derives the desktop primary group, the MORE ▾ overflow dropdown, and the
 * categorized mobile menu sections from a backend-driven `NavEntry[]` (the
 * same shape `NAV_ENTRIES` produces in `lib/routes.ts`).
 *
 * The reorganization mirrors the previous hardcoded layout EXACTLY so the
 * rendered navbar is visually identical to the pre-dynamic version — only
 * the data source moves from static consts to a backend query. The backend
 * seed (and the baked-in `DEFAULT_NAV_ENTRIES` fallback) match `NAV_ENTRIES`,
 * so the derived output is identical to the previous static output.
 *
 * Reorganization rules (label-based, applied to the dynamic entries):
 *   - PRIMARY_ENTRIES: About (dropdown, keeping only its non-overflow
 *     sub-links), Activism (dropdown, keeping only its non-overflow
 *     sub-links), Merchandise, Events, Blog — in that order. About and
 *     Activism keep their `to` so their header is a clickable NavLink.
 *   - MORE_OVERFLOW: Real British History, the overflow sub-links pulled
 *     out of About (Gallery) and Activism (Petition), Contact, Donate, and
 *     the Join nested dropdown (Join Us, Patreon) — in that order.
 *   - MOBILE_MENU_SECTIONS: three categorized sections (MOVEMENT, GET
 *     INVOLVED, MORE / SUPPORT) flattening the full link list so the mobile
 *     drawer groups every route with visible category labels.
 *
 * `ABOUT_OVERFLOW_LABELS` and `ACTIVISM_OVERFLOW_LABELS` pin which sub-links
 * are pulled into the MORE ▾ overflow dropdown. They are matched by label
 * (case-sensitive) so the reorganization is stable regardless of the order
 * the backend returns the children in.
 */
const ABOUT_OVERFLOW_LABELS = new Set(["Gallery"]);
const ACTIVISM_OVERFLOW_LABELS = new Set(["Petition"]);

/**
 * The standalone (non-dropdown) entries that belong to the centered primary
 * desktop group, in display order. Matched by label so the order is stable
 * regardless of the backend's return order.
 */
const PRIMARY_STANDALONE_LABELS = ["Merchandise", "Events", "Blog"] as const;

/**
 * The standalone (non-dropdown) entries that belong to the MORE ▾ overflow
 * dropdown, in display order, BEFORE the Join nested dropdown. Matched by
 * label. Real British History, Contact, and Donate are standalone; Gallery
 * and Petition are pulled out of the About/Activism dropdowns.
 */
const MORE_STANDALONE_LABELS = [
  "Real British History",
  "Contact",
  "Donate",
] as const;

/** The label of the Join nested dropdown (kept as a nested dropdown in MORE). */
const JOIN_DROPDOWN_LABEL = "Join";

/** The labels of the About and Activism dropdowns in the primary group. */
const ABOUT_LABEL = "About";
const ACTIVISM_LABEL = "Activism";

/**
 * Mobile menu section definitions — the category label + the labels of the
 * entries (standalone or dropdown children) that belong to that section, in
 * display order. The mobile drawer flattens every entry into its section so
 * the full link list is grouped with visible category labels, mirroring the
 * previous hand-curated `MOBILE_MENU_SECTIONS`.
 */
const MOBILE_SECTION_DEFS = [
  {
    label: "MOVEMENT",
    entryLabels: ["About", "Blog", "Real British History", "Gallery", "Events"],
  },
  {
    label: "GET INVOLVED",
    entryLabels: [
      "Join Us",
      "Become An Activist",
      "Activism Kit",
      "Education Watch",
      "University Societies",
      "Petition",
    ],
  },
  {
    label: "MORE / SUPPORT",
    entryLabels: ["Merchandise", "Contact", "Donate", "Patreon"],
  },
] as const;

/**
 * Finds a dropdown entry by its label in the backend-driven entries.
 * Returns `undefined` when the label is not present (the fallback defaults
 * guarantee the label is always present in practice).
 */
function findDropdown(
  entries: readonly NavEntry[],
  label: string,
): NavDropdown | undefined {
  return entries.find(
    (e): e is NavDropdown => isDropdown(e) && e.label === label,
  );
}

/**
 * Collects every leaf link (standalone entries + flattened dropdown
 * children) from the backend-driven entries into a `Map<string, NavLink>`
 * keyed by label so the mobile section builder can look up any link by its
 * label in O(1). External links (e.g. Donate) are preserved with their
 * `external` flag so the mobile drawer renders them as new-tab anchors.
 */
function collectLeafLinks(entries: readonly NavEntry[]): Map<string, NavLink> {
  const map = new Map<string, NavLink>();
  for (const entry of entries) {
    if (isDropdown(entry)) {
      for (const child of entry.items) {
        map.set(child.label, child);
      }
    } else {
      map.set(entry.label, entry);
    }
  }
  return map;
}

/**
 * Derives the desktop primary group, the MORE ▾ overflow dropdown, and the
 * categorized mobile menu sections from the backend-driven `NavEntry[]`.
 * Memoized in `Nav` so the derivation only re-runs when the backend entries
 * actually change.
 */
function deriveNavLayout(entries: readonly NavEntry[]) {
  // ── Primary group ──────────────────────────────────────────────────
  // About and Activism keep their dropdown panel but drop the sub-links
  // that are pulled into the MORE ▾ overflow (Gallery, Petition). They also
  // keep their `to` so the header label is a clickable NavLink.
  const about = findDropdown(entries, ABOUT_LABEL);
  const activism = findDropdown(entries, ACTIVISM_LABEL);

  const primaryAbout: NavDropdown | undefined = about
    ? {
        label: about.label,
        to: about.to ?? ROUTES.about,
        items: about.items.filter(
          (item) => !ABOUT_OVERFLOW_LABELS.has(item.label),
        ),
      }
    : undefined;

  const primaryActivism: NavDropdown | undefined = activism
    ? {
        label: activism.label,
        to: activism.to ?? ROUTES.activism,
        items: activism.items.filter(
          (item) => !ACTIVISM_OVERFLOW_LABELS.has(item.label),
        ),
      }
    : undefined;

  // Standalone primary entries (Merchandise, Events, Blog) — looked up by
  // label from the backend entries so the order is stable.
  const leafLinks = collectLeafLinks(entries);
  const primaryStandalone: NavLink[] = PRIMARY_STANDALONE_LABELS.map((label) =>
    leafLinks.get(label),
  ).filter((e): e is NavLink => Boolean(e));

  const primaryEntries: NavEntry[] = [
    ...(primaryAbout ? [primaryAbout] : []),
    ...(primaryActivism ? [primaryActivism] : []),
    ...primaryStandalone,
  ];

  // ── MORE ▾ overflow ───────────────────────────────────────────────
  // Real British History + the overflow sub-links pulled out of About
  // (Gallery) and Activism (Petition) + Contact + Donate + the Join nested
  // dropdown (Join Us, Patreon).
  const aboutOverflow: NavLink[] = about
    ? about.items.filter((item) => ABOUT_OVERFLOW_LABELS.has(item.label))
    : [];
  const activismOverflow: NavLink[] = activism
    ? activism.items.filter((item) => ACTIVISM_OVERFLOW_LABELS.has(item.label))
    : [];

  const moreStandalone: NavLink[] = MORE_STANDALONE_LABELS.map((label) =>
    leafLinks.get(label),
  ).filter((e): e is NavLink => Boolean(e));

  const joinDropdown = findDropdown(entries, JOIN_DROPDOWN_LABEL);

  const moreOverflow: NavEntry[] = [
    ...aboutOverflow,
    ...activismOverflow,
    ...moreStandalone,
    ...(joinDropdown ? [joinDropdown] : []),
  ];

  // ── Mobile menu sections ───────────────────────────────────────────
  // Three categorized sections flattening the full link list so the mobile
  // drawer groups every route with visible category labels. Each section's
  // links are looked up by label from the leaf-link map so external links
  // (Donate) are preserved with their `external` flag.
  const mobileMenuSections = MOBILE_SECTION_DEFS.map((section) => ({
    label: section.label,
    links: section.entryLabels
      .map((label) => leafLinks.get(label))
      .filter((link): link is NavLink => Boolean(link)),
  })).filter((section) => section.links.length > 0);

  return { primaryEntries, moreOverflow, mobileMenuSections };
}

function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * Centered logo on a white notch plate. The plate hangs slightly below the
 * navbar bar and stays solid white at every scroll position. The logo image
 * uses responsive sizing h-10 md:h-12 w-auto object-contain shrink-0 so it
 * renders at its full natural aspect ratio instead of a narrow sliver.
 * Hidden below xl (the mobile top bar shows the logo instead).
 */
function CenteredLogo() {
  return (
    <div className="nav-notch-plate inline-block">
      <Link
        to={ROUTES.home}
        data-ocid="nav.logo"
        className="flex items-center justify-center"
        aria-label="Turning Point UK — home"
      >
        <img
          src="/assets/logos/tpuk-logo.webp"
          alt="Turning Point UK"
          className="h-10 w-auto object-contain md:h-12 xl:h-16 shrink-0"
        />
      </Link>
    </div>
  );
}

/**
 * Mobile top-bar logo on a white notch plate. Same white-backed shield
 * treatment as the desktop CenteredLogo, sized down via .nav-notch-plate-sm.
 * The logo image is enlarged on mobile (h-14 sm:h-16) so it fills the vertical
 * height of the navbar cleanly on smaller screens — taller than the desktop
 * CenteredLogo (h-10 md:h-12) so the brand reads prominently on phones.
 */
function MobileTopBarLogo() {
  return (
    <div className="nav-notch-plate-sm inline-block">
      <Link
        to={ROUTES.home}
        data-ocid="nav.logo"
        className="flex items-center justify-center"
        aria-label="Turning Point UK — home"
      >
        <img
          src="/assets/logos/tpuk-logo.webp"
          alt="Turning Point UK"
          className="h-10 sm:h-12 w-auto object-contain shrink-0"
        />
      </Link>
    </div>
  );
}

/**
 * Compact logo used in the mobile sheet header. The logo image sits on a
 * white .sheet-logo-plate backing so the brand is clearly visible against
 * the Sheet's bg-background, matching the white-plate treatment of the
 * desktop and mobile top-bar logos. The text wordmark sits beside it.
 * Uses the same responsive sizing fix for consistency.
 */
function SheetLogo() {
  return (
    <Link
      to={ROUTES.home}
      data-ocid="nav.logo"
      className="flex items-center gap-3"
      aria-label="Turning Point UK — home"
    >
      <span className="sheet-logo-plate inline-flex items-center justify-center">
        <img
          src="/assets/logos/tpuk-logo.webp"
          alt=""
          className="h-10 w-auto object-contain md:h-12 shrink-0"
        />
      </span>
      <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">
        Turning Point <span className="text-primary">UK</span>
      </span>
    </Link>
  );
}

/**
 * Red CTA DONATE button. Solid red background, white text, rounded-full,
 * compact sizing. Links to the existing donate route. Visible on both the
 * desktop right utility cluster and the mobile/tablet top bar.
 */
function DonateButton({
  className,
  compact = false,
}: { className?: string; compact?: boolean }) {
  return (
    <a
      href="https://donate.stripe.com/00w28r7VfeHtcVQfDffw406"
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="nav.donate_button"
      className={cn(
        "bg-red-600 hover:bg-red-700 text-white rounded-full font-black uppercase tracking-[0.08em] whitespace-nowrap shrink-0 transition-colors duration-200",
        compact ? "px-2.5 py-1 text-[0.65rem]" : "px-3.5 py-1.5 text-xs",
        className,
      )}
    >
      DONATE VIA STRIPE / CARD / APPLE PAY
    </a>
  );
}

/**
 * Two-tone capsule pill SVG icon for the $MBGA badge. Stadium/capsule shape
 * tilted ~45° (bottom-left to top-right), split into two equal halves —
 * bottom-left half mint green (#50C878 / emerald-400), top-right half white —
 * with a thick dark charcoal border (#2F3E46 / slate-800) and subtle gloss
 * highlights (a small white curved arc on the green section and a light-grey
 * shading on the right edge of the white section). The SVG fills its parent
 * <a> via h-full w-full, so the parent's h-/w- classes control the size.
 */
function CapsuleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g transform="rotate(45 12 12)">
        {/* Capsule body — stadium shape with fully rounded ends. */}
        <rect
          x="3"
          y="8"
          width="18"
          height="8"
          rx="4"
          ry="4"
          fill="#50C878"
          stroke="#2F3E46"
          strokeWidth="1.6"
        />
        {/* White top-right half — clipped to the capsule body. */}
        <rect
          x="12"
          y="8"
          width="9"
          height="8"
          rx="4"
          ry="4"
          fill="#FFFFFF"
          stroke="#2F3E46"
          strokeWidth="1.6"
        />
        {/* Center dividing line between the two halves. */}
        <line
          x1="12"
          y1="8"
          x2="12"
          y2="16"
          stroke="#2F3E46"
          strokeWidth="1.6"
        />
        {/* Subtle light-grey shading on the right edge of the white section
            for a cylindrical 3D effect. */}
        <path
          d="M19.5 9.2 C20.6 10.4 20.6 13.6 19.5 14.8"
          stroke="#D8DEE4"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        {/* Small white curved gloss highlight arc on the green section. */}
        <path
          d="M5.2 9.5 C5.6 9.1 6.4 9.1 6.8 9.5"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

/**
 * $MBGA Pump.fun pill — high-visibility capsule styled with Pump.fun
 * branding (emerald background, dark text, emerald glow). Links to the
 * pump.fun coin page in a new tab.
 *
 * Two variants:
 *   - default (desktop): capsule icon (h-7 w-7) + "$MBGA" text, full padding
 *   - compact (mobile):  smaller capsule icon (h-5 w-5) + "$MBGA" text,
 *                        tighter padding to fit the tight mobile top-bar
 *                        right cluster (alongside DonateButton and the
 *                        hamburger) without overflow.
 */
function MbgaPill({ compact = false }: { compact?: boolean }) {
  const PUMP_URL =
    "https://pump.fun/coin/dFybjfpAbTxjen9Ux2Q2dQSFTmrbcVRzYsGoiV5pump";
  return (
    <a
      href={PUMP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="nav.mbga_pill"
      aria-label="$MBGA — open in a new tab"
      className={cn(
        "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full whitespace-nowrap shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1.5",
        compact ? "px-2 py-0.5 text-[0.65rem]" : "px-3 py-1.5 text-sm",
      )}
    >
      <span
        className={cn("shrink-0 spin-jump", compact ? "h-4 w-4" : "h-7 w-7")}
      >
        <CapsuleIcon />
      </span>
      <span>$MBGA</span>
    </a>
  );
}

/**
 * Compact social icon links for the desktop right utility cluster. Each icon
 * is h-7 w-7 and links to its platform via SOCIAL_LINKS from lib/routes.ts.
 * White icons that fade to 80% opacity on hover, with a smooth opacity
 * transition.
 */
function NavSocialLinks() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 shrink-0">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="nav.social_link"
          aria-label={`Turning Point UK ${social.label}`}
          className="h-7 w-7 text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
        >
          {SOCIAL_ICONS[social.icon]}
        </a>
      ))}
    </div>
  );
}

/**
 * UK-branded nav link classes — shared by every nav link surface.
 *
 * - Default: text-foreground/80 (existing muted white).
 * - Hover: text shifts to red (#C8102E) with a royal-blue (#00247D) underline
 *   accent drawn via a background-image gradient on the bottom edge.
 * - Active (current route): red text + a solid red underline, distinct from
 *   hover so the current page is unambiguous.
 *
 * `transition-smooth` is preserved. The underline uses background-image so
 * it animates cleanly without layout shift (transform/opacity only).
 */
const NAV_LINK_BASE =
  "font-body text-sm font-medium uppercase tracking-[0.08em] transition-smooth";
const NAV_LINK_HOVER =
  "text-foreground/80 hover:text-[#C8102E] hover:bg-[linear-gradient(to_bottom,transparent_70%,#00247D_70%,#00247D_85%,transparent_85%)] hover:bg-[length:100%_100%] hover:no-underline";
const NAV_LINK_ACTIVE =
  "text-[#C8102E] bg-[linear-gradient(to_bottom,transparent_70%,#C8102E_70%,#C8102E_85%,transparent_85%)] bg-[length:100%_100%]";

function NavLinkItem({
  link,
  onNavigate,
}: { link: NavLink; onNavigate?: () => void }) {
  if (link.external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="nav.link"
        className={cn(NAV_LINK_BASE, NAV_LINK_HOVER)}
        onClick={onNavigate}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link
      to={link.to}
      data-ocid="nav.link"
      className={cn(NAV_LINK_BASE, NAV_LINK_HOVER)}
      activeProps={{ className: NAV_LINK_ACTIVE }}
      onClick={onNavigate}
    >
      {link.label}
    </Link>
  );
}

/**
 * UK-branded dropdown sub-link classes — shared by every dropdown panel link
 * (ABOUT/ACTIVISM sub-links, MORE ▾ sub-links, JOIN nested sub-links).
 *
 * Block-style full-width links: hover shifts text to red (#C8102E) with a
 * subtle royal-blue (#00247D) background tint; active (current route) shows
 * red text + a red left-edge accent bar. `transition-smooth` preserved.
 */
const DROPDOWN_LINK_BASE =
  "flex w-full items-center px-3 py-2 font-body text-sm transition-smooth";
const DROPDOWN_LINK_HOVER =
  "text-foreground/80 hover:text-[#C8102E] hover:bg-[#00247D]/30";
const DROPDOWN_LINK_ACTIVE =
  "text-[#C8102E] bg-[linear-gradient(to_right,#C8102E_0%,#C8102E_3px,transparent_3px)] bg-[length:100%_100%]";

/**
 * MORE ▾ overflow dropdown for the centered primary group. Opens on hover
 * and focus-within, is keyboard accessible, and closes on outside click,
 * Escape, and route navigation. Contains the standalone overflow links
 * (Real British History, Gallery, Petition, Contact) plus the JOIN nested
 * dropdown (Join Us, Patreon) preserved unchanged.
 *
 * `entries` is the backend-driven MORE ▾ overflow list (derived in `Nav`
 * from `useNavConfig().entries` via `deriveNavLayout`). Passed as a prop so
 * the dropdown re-renders when the backend nav config resolves.
 */
function MoreDropdown({ entries }: { entries: NavEntry[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const prevPathname = useRef<string | null>(null);

  // Close on route navigation — only when pathname actually changes between
  // renders, not on every render where it is truthy (which would close the
  // dropdown on mount and on every unrelated state update).
  useEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      setOpen(false);
    }
    prevPathname.current = pathname;
  }, [pathname]);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li
      ref={containerRef}
      className="group relative"
      data-ocid="nav.dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        data-ocid="nav.dropdown_trigger"
        className="flex items-center font-body text-sm font-medium uppercase tracking-[0.08em] text-foreground/80 transition-smooth hover:text-[#C8102E] hover:bg-[linear-gradient(to_bottom,transparent_70%,#00247D_70%,#00247D_85%,transparent_85%)] hover:bg-[length:100%_100%] focus:text-[#C8102E] focus:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        More
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "ml-1 h-3 w-3 transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className={cn(
          "absolute left-0 top-full z-50 mt-2 transition-all duration-200 ease-out",
          open
            ? "visible translate-y-0 opacity-100 pointer-events-auto"
            : "invisible translate-y-1 opacity-0 pointer-events-none",
        )}
      >
        <ul className="w-[15rem] border border-border bg-popover p-2 shadow-lg">
          {entries.map((entry: NavEntry) =>
            isDropdown(entry) ? (
              // Nested JOIN dropdown inside MORE ▾ — rendered as a labeled
              // sub-group with its sub-links listed beneath the label.
              <li key={entry.label} className="my-1">
                <div className="px-3 pt-2 pb-1 text-eyebrow text-foreground/50">
                  {entry.label}
                </div>
                {entry.items.map((item) => (
                  <div key={item.to}>
                    {item.external ? (
                      <a
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-ocid="nav.dropdown_link"
                        className={cn(DROPDOWN_LINK_BASE, DROPDOWN_LINK_HOVER)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        data-ocid="nav.dropdown_link"
                        className={cn(DROPDOWN_LINK_BASE, DROPDOWN_LINK_HOVER)}
                        activeProps={{ className: DROPDOWN_LINK_ACTIVE }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </li>
            ) : (
              <li key={entry.to}>
                {entry.external ? (
                  <a
                    href={entry.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="nav.dropdown_link"
                    className={cn(DROPDOWN_LINK_BASE, DROPDOWN_LINK_HOVER)}
                  >
                    {entry.label}
                  </a>
                ) : (
                  <Link
                    to={entry.to}
                    data-ocid="nav.dropdown_link"
                    className={cn(DROPDOWN_LINK_BASE, DROPDOWN_LINK_HOVER)}
                    activeProps={{ className: DROPDOWN_LINK_ACTIVE }}
                  >
                    {entry.label}
                  </Link>
                )}
              </li>
            ),
          )}
        </ul>
      </div>
    </li>
  );
}

function MobileNav({
  sections,
}: {
  sections: { label: string; links: NavLink[] }[];
}) {
  const [open, setOpen] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const prevPathname = useRef<string | null>(null);
  // Close sheet on route change — only when pathname actually changes between
  // renders, not on every render where it is truthy (which would close the
  // sheet immediately after opening in some interaction sequences).
  useEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      setOpen(false);
    }
    prevPathname.current = pathname;
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          data-ocid="nav.menu_button"
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[85%] max-w-sm border-border bg-background p-0"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle asChild>
            <SheetLogo />
          </SheetTitle>
        </SheetHeader>
        <nav
          className="flex flex-col gap-1 overflow-y-auto p-4"
          data-ocid="nav.mobile_menu"
        >
          {/* Categorized mobile menu — mirrors the footer's three columns
              (MOVEMENT, GET INVOLVED, MORE / SUPPORT) so the full link list
              is grouped with visible category labels instead of a flat,
              cluttered list. Each section renders its label as a non-clickable
              eyebrow header followed by its links via the shared NavLinkItem
              (which handles external new-tab vs internal <Link>). Routes
              identically to the footer. The sections are derived from the
              backend-driven entries in `Nav` (via `deriveNavLayout`) so the
              mobile drawer stays in sync with the desktop primary group and
              MORE ▾ overflow. */}
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col">
              <span className="text-eyebrow mt-4 mb-1 px-3 text-foreground/50">
                {section.label}
              </span>
              {section.links.map((link) => (
                <NavLinkItem
                  key={link.to}
                  link={link}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
          {/* Social channels — thumb-friendly tap targets at the bottom of
              the drawer. */}
          <div className="mt-6 border-t border-border pt-4">
            <div className="text-eyebrow mb-3 px-3 text-foreground/50">
              Follow
            </div>
            <div className="flex items-center gap-4 px-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="nav.social_link"
                  aria-label={`Turning Point UK ${social.label}`}
                  className="h-8 w-8 text-foreground/80 hover:text-primary transition-colors duration-300 cursor-pointer flex items-center justify-center"
                >
                  {SOCIAL_ICONS[social.icon]}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-3 px-3">
            <DonateButton className="w-full !px-4 !py-2.5 !text-sm" />
          </div>
        </nav>
        <SheetClose className="sr-only">Close</SheetClose>
      </SheetContent>
    </Sheet>
  );
}

export function Nav() {
  const scrolled = useScrolled(24);

  // Backend-driven nav config. `entries` falls back to DEFAULT_NAV_ENTRIES
  // (the existing hardcoded NAV_ENTRIES) while loading and on fetch error,
  // so the navbar renders the known-default links immediately rather than
  // an empty bar. The derived layout (primaryEntries / moreOverflow /
  // mobileMenuSections) is memoized so it only re-derives when the backend
  // entries actually change — the rendered structure is visually identical
  // to the pre-dynamic version because the fallback defaults ARE the
  // pre-dynamic values.
  const { entries } = useNavConfig();
  const { primaryEntries, moreOverflow, mobileMenuSections } = useMemo(
    () => deriveNavLayout(entries),
    [entries],
  );

  return (
    <header
      data-ocid="nav"
      className={cn(
        "fixed inset-x-0 top-[var(--announcement-bar-height)] z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-navy/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* Desktop navbar (xl and up) — three-region flex row.
          Left: logo (shrink-0). Center: primary navigation group
          (ABOUT, ACTIVISM, MERCHANDISE, EVENTS, BLOG + MORE ▾). Right:
          utility cluster (shrink-0) — compact social icons, $MBGA pill,
          DONATE button. No overlap or cutoff at any desktop width. */}
      <div className="hidden h-16 w-full items-center justify-between px-6 sm:px-10 xl:flex xl:pl-0 xl:pr-12">
        {/* Left: logo far-left with shrink-0. */}
        <div className="flex shrink-0 items-center">
          <CenteredLogo />
        </div>

        {/* Center: centered primary navigation group. */}
        <nav
          className="flex flex-1 items-center justify-center"
          data-ocid="nav.primary_group"
        >
          <ul className="flex items-center gap-6 xl:gap-10">
            {primaryEntries.map((entry: NavEntry) =>
              isDropdown(entry) ? (
                <li
                  key={entry.label}
                  className="group relative"
                  data-ocid="nav.dropdown"
                >
                  {/* ABOUT/ACTIVISM header is a clickable NavLink to its
                      section landing page (entry.to) while the dropdown panel
                      still opens on hover/focus-within. The chevron rotates on
                      group-hover. No useState — pure group-hover/focus-within
                      per the dropdown wiring contract. */}
                  <Link
                    to={entry.to ?? ROUTES.home}
                    data-ocid="nav.dropdown_trigger"
                    className={cn(
                      "flex items-center font-body text-sm font-medium uppercase tracking-[0.08em] transition-smooth",
                      NAV_LINK_HOVER,
                    )}
                    activeProps={{ className: NAV_LINK_ACTIVE }}
                    aria-haspopup="true"
                  >
                    {entry.label}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:rotate-180"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 mt-2 translate-y-1 opacity-0 transition-all duration-200 ease-out pointer-events-none group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                    <ul className="w-[15rem] border border-border bg-popover p-2 shadow-lg">
                      {entry.items.map((item) => (
                        <li key={item.to}>
                          {item.external ? (
                            <a
                              href={item.to}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-ocid="nav.dropdown_link"
                              className={cn(
                                DROPDOWN_LINK_BASE,
                                DROPDOWN_LINK_HOVER,
                              )}
                            >
                              {item.label}
                            </a>
                          ) : (
                            <Link
                              to={item.to}
                              data-ocid="nav.dropdown_link"
                              className={cn(
                                DROPDOWN_LINK_BASE,
                                DROPDOWN_LINK_HOVER,
                              )}
                              activeProps={{ className: DROPDOWN_LINK_ACTIVE }}
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={entry.to} className="relative">
                  <NavLinkItem link={entry} />
                </li>
              ),
            )}
            <MoreDropdown entries={moreOverflow} />
          </ul>
        </nav>

        {/* Right: utility cluster (shrink-0) — compact social icons,
            $MBGA pill, DONATE button, CONTACT US button, SIGN IN control. */}
        <div className="flex items-center gap-4 sm:gap-5 xl:gap-6 shrink-0">
          <NavSocialLinks />
          <MbgaPill />
          <DonateButton />
        </div>
      </div>

      {/* Mobile/tablet navbar (below xl) — SINGLE-ROW layout:
          [LOGO shrink-0] [SOCIALS flex-1 justify-center] [$MBGA pill shrink-0]
          [DONATE shrink-0] [HAMBURGER shrink-0] all on one row. The social
          icons are sized w-6 h-6 (24px) and sit in a flex-1 centered container
          so all 4 fit visibly alongside the logo, $MBGA pill, DONATE button,
          and hamburger on narrow phone viewports (down to ~360px). DONATE sits
          directly to the right of the pill (matching the desktop right-cluster
          order: socials → pill → donate), and the hamburger is the far-right
          element. The hamburger drawer still contains the full link list + its
          own Follow social block — these top-bar icons are a quick shortcut.
          The .mobile-nav-row class (index.css) enforces min-width: 0 on flex
          children and clips any residual overflow as defense-in-depth. */}
      <div className="mobile-nav-row mx-auto flex w-full max-w-7xl items-center gap-1 py-1.5 pl-0 pr-2 sm:gap-2 sm:pr-4 xl:hidden">
        {/* Left: logo far-left (shrink-0). */}
        <div className="flex shrink-0 items-center">
          <MobileTopBarLogo />
        </div>

        {/* Center: centered social icons — flex-1 + justify-center so the
            icons sit perfectly balanced in the middle between the logo and
            the $MBGA pill. Sized to w-6 h-6 (24px) so all 4 icons fit
            comfortably on narrow phones alongside the other row elements
            while remaining recognizable and tappable (24px hit target).
            Reuse SOCIAL_LINKS + SOCIAL_ICONS (no duplication). hover:opacity-80
            transition-opacity matches the desktop NavSocialLinks hover
            behavior. */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 sm:gap-2">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="nav.social_link"
              aria-label={`Turning Point UK ${social.label}`}
              className="w-6 h-6 sm:w-7 sm:h-7 text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center shrink-0"
            >
              {SOCIAL_ICONS[social.icon]}
            </a>
          ))}
        </div>

        {/* Right: $MBGA pill (shrink-0). */}
        <div className="flex shrink-0 items-center">
          <MbgaPill compact />
        </div>

        {/* DONATE button — directly to the right of the $MBGA pill, matching
            the desktop right-cluster order (socials → pill → donate). Compact
            variant shrinks padding + font so it fits the tight mobile row.
            Hidden below xl on the mobile row (desktop row keeps its own copy);
            wrapper uses 'hidden xl:block' per the below-xl convention. */}
        <span className="hidden xl:block">
          <DonateButton compact />
        </span>

        {/* Hamburger menu — far-right element. */}
        <MobileNav sections={mobileMenuSections} />
      </div>
    </header>
  );
}
