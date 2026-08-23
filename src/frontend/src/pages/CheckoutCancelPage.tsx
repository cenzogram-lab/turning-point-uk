import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { ROUTES } from "@/lib/routes";
import { Link } from "@tanstack/react-router";

/**
 * CheckoutCancelPage — Stripe Checkout cancel return URL at /checkout/cancel.
 *
 * Renders a clean retry/return screen for supporters who abandoned checkout.
 * No polling is required on this route — the payment was not completed, so
 * there is no session status to confirm. The page offers a single primary
 * CTA (Browse Merchandise) and a secondary outline CTA (Become a Supporter).
 *
 * Brand discipline: dark navy / red / white Oswald system, square corners,
 * zero shadows, fully responsive. Red is reserved for the single primary
 * CTA (Browse Merchandise); the secondary action uses the neutral
 * .btn-outline-invert treatment.
 */
export function CheckoutCancelPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: "Payment Cancelled | Turning Point UK",
    description:
      "Your payment to Turning Point UK was not completed. Try again or return to the site.",
  });

  return (
    <div ref={ref}>
      <Section
        variant="center"
        background="navy"
        noSnap
        id="checkout-cancel"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Checkout
            </span>
            <h1
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Payment Cancelled
            </h1>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
              data-entrance-delay="200"
            >
              Your payment was not completed. You can try again or return to the
              site.
            </p>

            <div
              className="entrance-left mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center"
              data-entrance-delay="320"
            >
              <Link
                to={ROUTES.merchandise}
                data-ocid="checkout_cancel.browse_merchandise_button"
                className="btn-primary-square w-full sm:w-auto"
              >
                Browse Merchandise
              </Link>
              <Link
                to={ROUTES.joinUs}
                data-ocid="checkout_cancel.become_a_supporter_button"
                className="btn-outline-invert w-full sm:w-auto"
              >
                Become a Supporter
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
