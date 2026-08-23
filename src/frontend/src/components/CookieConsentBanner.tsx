import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ROUTES } from "../lib/routes";

/**
 * CookieConsentBanner — global, fixed-bottom cookie consent banner.
 *
 * Renders on first visit (no stored preference) on every route, including
 * Education Watch. CRITICAL: this component ONLY stores the consent choice
 * in localStorage and renders the banner UI. It does NOT load any third-party
 * scripts, set tracking cookies, or call analytics endpoints — respecting
 * the Education Watch page's no-tracking constraint regardless of which
 * button is clicked.
 *
 * Mounted globally by Layout.tsx after <Footer/>.
 */

const STORAGE_KEY = "tpuk-cookie-consent";
type ConsentValue = "accepted" | "rejected";

function readStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "accepted" || value === "rejected") return value;
    return null;
  } catch {
    // localStorage may be unavailable (private mode, disabled storage) —
    // treat as no preference so the banner still renders and the user can
    // dismiss it for the current session.
    return null;
  }
}

function writeStoredConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Silently ignore write failures — the banner is already being hidden
    // by the in-memory visibility state for this session.
  }
}

export function CookieConsentBanner() {
  // Start hidden to avoid a flash of the banner on every mount before the
  // stored preference is read. The effect flips visibility to true when no
  // preference is stored.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored === null) setVisible(true);
  }, []);

  function handleChoice(value: ConsentValue) {
    writeStoredConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section
      data-ocid="cookie_consent.banner"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-[88px] lg:bottom-0 z-[110] border-t border-blue-800 bg-blue-950/50 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p className="text-sm leading-relaxed text-foreground sm:text-base">
            We use cookies to keep the site working and to understand how it's
            used. You can read more in our{" "}
            <Link
              to={ROUTES.privacyPolicy}
              data-ocid="cookie_consent.privacy_link"
              className="font-medium underline underline-offset-4 transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:shrink-0">
            <button
              type="button"
              data-ocid="cookie_consent.accept_button"
              onClick={() => handleChoice("accepted")}
              className="h-11 flex-1 rounded-md bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-none lg:min-w-[180px]"
            >
              Accept All
            </button>
            <button
              type="button"
              data-ocid="cookie_consent.reject_button"
              onClick={() => handleChoice("rejected")}
              className="h-11 flex-1 rounded-md border border-blue-800 bg-transparent px-6 text-sm font-semibold uppercase tracking-wide text-foreground transition-all hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-none lg:min-w-[180px]"
            >
              Reject Non-Essential
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
