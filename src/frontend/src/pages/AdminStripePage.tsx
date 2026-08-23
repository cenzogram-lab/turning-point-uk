import { Section } from "@/components/Section";
import { StripeSetupPanel } from "@/components/StripeSetupPanel";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";

/**
 * AdminStripePage — hidden admin dashboard for configuring Stripe.
 *
 * Route: `/admin/stripe` (registered in App.tsx but NOT in NAV_ENTRIES,
 * so it is unreachable from the public nav — only via direct URL or the
 * admin header tab nav).
 *
 * Auth is centralized in `AdminAuthGuard` (see
 * `src/frontend/src/components/AdminAuthGuard.tsx`), which wraps
 * `AdminLayout` for the entire `/admin/*` workspace. This page does NOT
 * carry its own auth gate — it only owns the dashboard body (heading +
 * StripeSetupPanel) and renders inside the shared `AdminLayout`.
 *
 * The StripeSetupPanel component is itself self-gating for admins
 * (renders null for non-admins or while Internet Identity is
 * initializing), so rendering it inside the admin route tree is
 * sufficient — no Stripe setup UI leaks to public customer-facing
 * routes.
 *
 * Dashboard contents:
 *   - an h1 "Stripe Configuration" heading with an eyebrow + standfirst,
 *   - the StripeSetupPanel below it (secret-key input, read-only GB
 *     country field, Save/Update/Cancel buttons).
 *
 * The page renders inside the shared `AdminLayout` so the admin header,
 * tab nav, II principal + sign-out, and Quick Links are reused.
 */

export function AdminStripePage() {
  const containerRef = useEntranceAnimation<HTMLDivElement>();
  return <AdminStripeDashboard containerRef={containerRef} />;
}

export default AdminStripePage;

// ──────────────────────────────────────────────────────────────────────────
// AdminStripeDashboard — heading + StripeSetupPanel.
// ──────────────────────────────────────────────────────────────────────────

interface AdminStripeDashboardProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function AdminStripeDashboard({ containerRef }: AdminStripeDashboardProps) {
  return (
    <div ref={containerRef} data-ocid="admin.stripe.dashboard">
      <Section
        variant="center"
        noSnap
        background="background"
        className="min-h-[60dvh] items-center justify-center !justify-items-center pt-8"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 pb-16 text-center">
          <p className="text-eyebrow entrance-left">Admin</p>
          <h1 className="text-headline entrance-left" data-entrance-delay="80">
            Stripe Configuration
          </h1>
          <p
            className="max-w-xl text-sm text-muted-foreground entrance-right"
            data-entrance-delay="160"
          >
            Configure the Stripe secret key that powers merchandise checkout.
            This surface is admin-only — the key never appears on public
            customer-facing routes.
          </p>

          {/* ── Stripe setup panel ─────────────────────────────────── */}
          <div
            className="entrance-left w-full text-left"
            data-entrance-delay="240"
          >
            <StripeSetupPanel />
          </div>
        </div>
      </Section>
    </div>
  );
}
