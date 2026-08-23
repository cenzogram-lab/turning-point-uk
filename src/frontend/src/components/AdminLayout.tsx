import { ROUTES } from "@/lib/routes";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, Outlet, useLocation } from "@tanstack/react-router";

/**
 * AdminLayout — shared shell for all `/admin/*` dashboards.
 *
 * Renders a clean minimal dashboard with a dark navy background
 * (`bg-blue-950`) covering the full viewport, a fixed `AdminHeader` at the
 * top, and an `<Outlet/>` for the admin page content below.
 *
 * `AdminHeader` owns:
 *   - a bold `ADMIN DASHBOARD` title at the top left,
 *   - a horizontal tab nav between admin dashboards (Blog Editor,
 *     Gallery Manager, Historic Preservation) using TanStack Router
 *     `<Link>` so switching is seamless (no full page reload),
 *   - the signed-in Internet Identity principal display + a Sign out
 *     button (replacing the per-page local AdminHeader duplicates),
 *   - a Quick Links cluster of two external-tool CTAs (Mailchimp Login,
 *     Plesk / Store Login) that open in a new tab.
 *
 * Auth is sourced from `useInternetIdentity()` from
 * `@caffeineai/core-infrastructure`: `identity?.getPrincipal().toText()`
 * for the principal, `clear()` for sign-out. Auth gating itself is owned
 * centrally by `AdminAuthGuard` (see
 * `src/frontend/src/components/AdminAuthGuard.tsx`), which wraps this
 * layout for the entire `/admin/*` workspace — the admin pages no longer
 * carry their own per-page password gate or `isCallerAdmin` check. This
 * layout only provides the chrome, so it renders once auth has resolved
 * (the principal string is non-empty once signed in).
 *
 * NOTE: routing is NOT wired here. A later task routes `/admin/*` pages
 * through this layout via App.tsx. This component is created in
 * isolation so it can be imported and tested independently.
 */

/** Admin tab descriptor — internal nav between admin dashboards. */
interface AdminTabEntry {
  label: string;
  to: string;
  /** data-ocid terminal token for the tab (e.g. "blog", "gallery"). */
  token: string;
}

/** Horizontal tab nav entries, in display order. */
const ADMIN_TABS: AdminTabEntry[] = [
  { label: "Blog Editor", to: ROUTES.adminBlog, token: "blog" },
  { label: "Gallery Manager", to: ROUTES.adminGallery, token: "gallery" },
  {
    label: "Historic Preservation",
    to: ROUTES.adminRealBritishHistory,
    token: "real_british_history",
  },
  { label: "Stripe Setup", to: ROUTES.adminStripe, token: "stripe" },
];

/** Quick Links — external-tool CTAs that open in a new tab. */
interface AdminQuickLinkEntry {
  label: string;
  href: string;
  /** data-ocid terminal token for the link. */
  token: string;
}

const ADMIN_QUICK_LINKS: AdminQuickLinkEntry[] = [
  {
    label: "Mailchimp Login",
    href: "https://login.mailchimp.com/",
    token: "mailchimp",
  },
  {
    label: "Plesk / Store Login",
    href: "https://platform360.io/auth/login",
    token: "plesk",
  },
];

/**
 * AdminLayout — the dashboard shell. Renders the fixed AdminHeader and an
 * `<Outlet/>` for the admin page content on a `bg-blue-950` full-viewport
 * surface. The content area pads from the top so it clears the fixed
 * header.
 */
export function AdminLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div
      className="flex min-h-[100dvh] flex-col bg-blue-950"
      data-ocid="admin.layout"
    >
      <AdminHeader pathname={pathname} />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
    </div>
  );
}

interface AdminHeaderProps {
  /** Current pathname — used to highlight the active admin tab. */
  pathname: string;
}

/**
 * AdminHeader — fixed top bar of the admin dashboard.
 *
 * Three regions:
 *   1. Left: bold `ADMIN DASHBOARD` title.
 *   2. Center: horizontal tab nav between admin dashboards.
 *   3. Right: II principal + Sign out + Quick Links cluster.
 *
 * The active tab is highlighted by matching the current pathname against
 * each tab's `to` route. A tab is active when the pathname starts with
 * its route (so `/admin/blog/some-post` still highlights Blog Editor).
 */
function AdminHeader({ pathname }: AdminHeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toText() ?? "";

  return (
    <header className="admin-header" data-ocid="admin.header">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* ── Left: bold ADMIN DASHBOARD title ─────────────────────── */}
        <div className="flex min-w-0 items-center">
          <h1
            className="font-display text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl"
            data-ocid="admin.header.title"
          >
            Admin Dashboard
          </h1>
        </div>

        {/* ── Center: horizontal tab nav between dashboards ────────── */}
        <nav
          aria-label="Admin sections"
          className="flex flex-wrap items-center gap-2"
          data-ocid="admin.header.tabs"
        >
          {ADMIN_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                data-ocid={`admin.header.tab.${tab.token}`}
                aria-current={isActive ? "page" : undefined}
                className={`admin-tab${isActive ? " admin-tab-active" : ""}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: principal + Sign out + Quick Links ────────────── */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Principal + Sign out */}
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-eyebrow text-[0.6rem]">Signed in as</span>
              <code
                data-ocid="admin.header.principal"
                className="truncate font-mono text-[0.7rem] text-foreground/80 sm:text-xs"
                title={principalText}
              >
                {principalText || "Not signed in"}
              </code>
            </div>
            <button
              type="button"
              onClick={() => clear()}
              data-ocid="admin.header.signout_button"
              className="btn-outline-invert !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>Sign out</span>
            </button>
          </div>

          {/* Quick Links — external tools, open in a new tab */}
          <div
            className="flex flex-wrap items-center gap-2"
            data-ocid="admin.header.quick_links"
          >
            {ADMIN_QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid={`admin.header.quick_link.${link.token}`}
                className="admin-quick-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
