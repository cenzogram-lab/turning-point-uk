import { SOCIAL_ICONS } from "@/components/SocialIcons";
import { useNavConfig } from "@/hooks/useNavConfig";
import {
  type NavEntry,
  type NavLink,
  ROUTES,
  SOCIAL_LINKS,
  isDropdown,
} from "@/lib/routes";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

/**
 * Footer — dark four-column footer.
 *
 * Columns: brand blurb / Movement / Get Involved / More.
 * Social links (Facebook, X, Instagram, YouTube) + copyright line.
 * Navy secondary surface per the design contract.
 */

function FooterLink({ link }: { link: NavLink }) {
  if (link.external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="footer.link"
        className="font-body text-sm text-foreground/70 transition-smooth hover:text-foreground"
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link
      to={link.to}
      data-ocid="footer.link"
      className="font-body text-sm text-foreground/70 transition-smooth hover:text-foreground"
    >
      {link.label}
    </Link>
  );
}

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-eyebrow text-foreground/50">{title}</h3>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <FooterLink key={link.to} link={link} />
        ))}
      </div>
    </div>
  );
}

/**
 * Collects every leaf link (standalone entries + flattened dropdown
 * children) from the backend-driven entries into a `Map<string, NavLink>`
 * keyed by label so the footer column builder can look up any link by its
 * label in O(1). External links are preserved with their `external` flag.
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

/** The external Donate PayPal link — hardcoded because it is not part of the
 * backend nav config (NAV_ENTRIES has no Donate entry). Kept as a stable
 * constant so the MORE / SUPPORT column always renders it identically. */
const DONATE_LINK: NavLink = {
  label: "DONATE VIA STRIPE / CARD / APPLE PAY",
  to: "https://donate.stripe.com/00w28r7VfeHtcVQfDffw406",
  external: true,
};

/** Label lists for each footer column, in display order. The links are
 * looked up by label from the backend-driven entries so the footer stays in
 * sync with the nav config. "About" falls back to ROUTES.about when the nav
 * config's About dropdown has no `to` (it is a dropdown, not a leaf). */
const MOVEMENT_LABELS = [
  "About",
  "Blog",
  "Real British History",
  "Gallery",
  "Events",
] as const;
const INVOLVED_LABELS = [
  "Join Us",
  "Become An Activist",
  "Activism Kit",
  "Education Watch",
  "University Societies",
  "Petition",
] as const;
const MORE_LABELS = ["Merchandise", "Contact", "Patreon"] as const;

/**
 * Derives the three footer columns from the backend-driven `NavEntry[]`.
 * Mirrors the previous hardcoded `FOOTER_MOVEMENT_LINKS` /
 * `FOOTER_INVOLVED_LINKS` / `FOOTER_MORE_LINKS` exactly so the rendered
 * footer is visually identical — only the data source moves from static
 * consts to a backend query. The Donate PayPal link is appended to the
 * MORE / SUPPORT column as a hardcoded external link (it is not part of the
 * nav config). "About" falls back to `{ label: "About", to: ROUTES.about }`
 * when the nav config's About dropdown has no leaf `to`.
 */
function deriveFooterColumns(entries: readonly NavEntry[]) {
  const leaf = collectLeafLinks(entries);

  const lookup = (label: string): NavLink | undefined => leaf.get(label);

  const movement: NavLink[] = MOVEMENT_LABELS.map((label) => {
    const found = lookup(label);
    if (found) return found;
    // "About" is a dropdown in the nav config (no leaf `to`); fall back to
    // the canonical /about route so the footer link still resolves.
    if (label === "About") return { label, to: ROUTES.about };
    return undefined;
  }).filter((l): l is NavLink => Boolean(l));

  const involved: NavLink[] = INVOLVED_LABELS.map((label) =>
    lookup(label),
  ).filter((l): l is NavLink => Boolean(l));

  // MORE / SUPPORT: Merchandise, Contact, Donate (hardcoded external),
  // Patreon — in that order.
  const more: NavLink[] = MORE_LABELS.map((label) => lookup(label)).filter(
    (l): l is NavLink => Boolean(l),
  );
  // Insert the hardcoded Donate link after Contact (matching the original
  // FOOTER_MORE_LINKS order: Merchandise, Contact, Donate, Patreon).
  const contactIdx = more.findIndex((l) => l.label === "Contact");
  if (contactIdx >= 0) {
    more.splice(contactIdx + 1, 0, DONATE_LINK);
  } else {
    // Contact not found in nav config — prepend Donate so it still appears.
    more.unshift(DONATE_LINK);
  }

  return { movement, involved, more };
}

export function Footer() {
  const year = new Date().getFullYear();
  const { entries } = useNavConfig();
  const { movement, involved, more } = useMemo(
    () => deriveFooterColumns(entries),
    [entries],
  );
  return (
    <footer
      data-ocid="footer"
      className="bg-navy border-t border-border/40 text-foreground"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand blurb */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <Link
              to={ROUTES.home}
              data-ocid="footer.logo"
              className="flex items-center gap-3"
              aria-label="Turning Point UK — home"
            >
              <span className="sheet-logo-plate">
                <img
                  src="/assets/logos/tpuk-logo.webp"
                  alt=""
                  className="h-9 w-auto"
                  width={36}
                  height={36}
                />
              </span>
              <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
                Turning Point <span className="text-primary">UK</span>
              </span>
            </Link>
            <p className="max-w-xs font-body text-sm font-light leading-relaxed text-foreground/70">
              A civic movement defending British values, free speech, and
              democratic accountability. Built by people, not politicians.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.social_link"
                  aria-label={`Turning Point UK ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center border border-foreground/30 text-foreground/70 transition-smooth hover:border-primary hover:text-primary"
                >
                  <span className="block h-4 w-4">
                    {SOCIAL_ICONS[social.icon]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="MOVEMENT" links={movement} />
          <FooterColumn title="GET INVOLVED" links={involved} />
          <FooterColumn title="MORE / SUPPORT" links={more} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-foreground/15 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50">
            © {year} Turning Point UK. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to={ROUTES.privacyPolicy}
              data-ocid="footer.link.privacy_policy"
              className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50 transition-smooth hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              to={ROUTES.termsAndConditions}
              data-ocid="footer.link.terms_and_conditions"
              className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50 transition-smooth hover:text-primary"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
