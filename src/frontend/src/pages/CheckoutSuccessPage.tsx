import { ContactForm } from "@/components/ContactForm";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { useStripeSessionStatus } from "@/hooks/useStripeSessionStatus";
import { ROUTES } from "@/lib/routes";
import { Link, useSearch } from "@tanstack/react-router";

/**
 * CheckoutSuccessPage — Stripe Checkout success return URL at /checkout/success.
 *
 * Stripe appends ?session_id=... to this URL on redirect. The page reads the
 * session id from the URL query params and polls getStripeSessionStatus via
 * the useStripeSessionStatus hook. While polling, a "Confirming your payment..."
 * loading state is shown. On #completed the order/subscription summary is
 * rendered (parsed from the Stripe JSON response when useful, otherwise a
 * branded generic thank-you). On #failed (with a real session_id) a friendly
 * recovery screen with retry/return links is shown.
 *
 * When there is NO session_id in the URL — the user was redirected here by
 * Stripe but we have nothing to poll — the page renders a graceful
 * "Payment Successful" confirmation screen (headline + thank-you + newsletter
 * signup + Return Home). The technical "No session_id found" error from the
 * hook is NEVER surfaced to users; the no-session_id case is treated as a
 * successful landing, not a failure.
 *
 * The newsletter signup (native Mailchimp <ContactForm />) is ALWAYS present
 * on the success page — in both the no-session_id confirmation and the
 * completed-with-summary states.
 *
 * Brand discipline: dark navy / red / white Oswald system, square corners,
 * zero shadows, fully responsive. Red is reserved for the single primary CTA
 * (Return Home). The newsletter signup is the secondary action and embeds
 * the native Mailchimp <ContactForm /> verbatim.
 */

interface CheckoutSuccessSearch {
  session_id?: string;
}

/**
 * Best-effort parse of the Stripe checkout session JSON returned by
 * getStripeSessionStatus. Extracts a small set of summary fields (customer
 * email, amount total, currency, line-item descriptions) when present. The
 * Stripe response shape varies between payment and subscription modes, so
 * every field is optional and the page falls back to a branded generic
 * summary when parsing yields nothing useful.
 */
interface ParsedStripeSession {
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  lineItemDescriptions?: string[];
  mode?: string;
  subscriptionId?: string;
}

function parseStripeResponse(response: string): ParsedStripeSession | null {
  if (!response) return null;
  try {
    const data = JSON.parse(response) as Record<string, unknown>;
    const lineItems = data.line_items as
      | { data?: Array<{ description?: string }> }
      | undefined;
    const lineItemDescriptions = lineItems?.data
      ?.map((item) => item.description)
      .filter((d): d is string => typeof d === "string" && d.length > 0);
    return {
      customerEmail:
        typeof data.customer_email === "string"
          ? (data.customer_email as string)
          : undefined,
      amountTotal:
        typeof data.amount_total === "number"
          ? (data.amount_total as number)
          : undefined,
      currency:
        typeof data.currency === "string"
          ? (data.currency as string)
          : undefined,
      lineItemDescriptions:
        lineItemDescriptions && lineItemDescriptions.length > 0
          ? lineItemDescriptions
          : undefined,
      mode: typeof data.mode === "string" ? (data.mode as string) : undefined,
      subscriptionId:
        typeof data.subscription === "string"
          ? (data.subscription as string)
          : undefined,
    };
  } catch {
    return null;
  }
}

function formatAmount(amountTotal: number, currency: string): string {
  // Stripe amounts are in the currency's smallest unit (pence for GBP).
  const value = amountTotal / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function CheckoutSuccessPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  const { session_id } = useSearch({ strict: false }) as CheckoutSuccessSearch;
  const { status, data } = useStripeSessionStatus(session_id);

  useSeoMeta({
    title: "Payment Successful | Turning Point UK",
    description:
      "Your payment to Turning Point UK was successful. Thank you for fueling the movement for Britain's future.",
  });

  const hasSessionId = Boolean(session_id && session_id.length > 0);

  // Loading only applies when we actually have a session_id to poll.
  // Without a session_id we render the successful confirmation directly.
  const isLoading = hasSessionId && status === "loading";

  // A real failure requires a session_id (we polled and the backend said
  // failed). The no-session_id synthetic `failed` from the hook is NOT
  // treated as a failure — it's a successful landing.
  const isRealFailure =
    hasSessionId && (status === "failed" || data?.__kind__ === "failed");

  const isCompleted =
    hasSessionId && status === "completed" && data?.__kind__ === "completed";

  // The no-session_id case AND the completed case both render the successful
  // confirmation screen. The only difference is whether the order summary
  // is shown (only when completed with parseable data).
  const isSuccessConfirmation = !hasSessionId || isCompleted;

  const parsed = isCompleted
    ? parseStripeResponse(data.completed.response)
    : null;
  const isSubscription =
    parsed?.mode === "subscription" || !!parsed?.subscriptionId;

  return (
    <div ref={ref}>
      <Section
        variant="center"
        background="navy"
        noSnap
        id="checkout-success"
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
              Payment Successful
            </h1>

            {isLoading && (
              <div
                className="entrance-left flex flex-col items-center gap-4"
                data-entrance-delay="200"
                data-ocid="checkout_success.loading_state"
              >
                <div
                  aria-hidden="true"
                  className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-primary"
                />
                <p className="font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
                  Confirming your payment...
                </p>
              </div>
            )}

            {isSuccessConfirmation && (
              <div
                className="entrance-left flex w-full flex-col items-center gap-8"
                data-entrance-delay="200"
                data-ocid="checkout_success.success_state"
              >
                <p className="max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
                  Thank you for standing with Turning Point UK. Your support
                  fuels grassroots activism, training days, and campaigns across
                  the country. Your payment has been processed successfully.
                </p>

                {isCompleted &&
                  (parsed?.customerEmail ||
                    parsed?.amountTotal ||
                    parsed?.lineItemDescriptions) && (
                    <div
                      data-ocid="checkout_success.summary"
                      className="w-full max-w-xl border border-border bg-card px-6 py-8 text-left sm:px-10"
                    >
                      <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70">
                        Order Summary
                      </h2>
                      <dl className="flex flex-col gap-4 font-body text-sm">
                        {parsed?.customerEmail && (
                          <div
                            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            data-ocid="checkout_success.summary.email"
                          >
                            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                              Email
                            </dt>
                            <dd className="font-light text-foreground">
                              {parsed.customerEmail}
                            </dd>
                          </div>
                        )}
                        {parsed?.lineItemDescriptions?.map((desc, i) => (
                          <div
                            key={desc}
                            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            data-ocid={`checkout_success.summary.item.${i}`}
                          >
                            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                              Item
                            </dt>
                            <dd className="font-light text-foreground">
                              {desc}
                            </dd>
                          </div>
                        ))}
                        {parsed?.amountTotal && parsed?.currency && (
                          <div
                            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            data-ocid="checkout_success.summary.total"
                          >
                            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                              Total
                            </dt>
                            <dd className="font-display text-lg font-semibold text-foreground">
                              {formatAmount(
                                parsed.amountTotal,
                                parsed.currency,
                              )}
                            </dd>
                          </div>
                        )}
                        {isSubscription && (
                          <div
                            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            data-ocid="checkout_success.summary.type"
                          >
                            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                              Type
                            </dt>
                            <dd className="font-light text-foreground">
                              Recurring subscription
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                <Link
                  to={ROUTES.home}
                  data-ocid="checkout_success.return_home_button"
                  className="btn-primary-square"
                >
                  Return Home
                </Link>
              </div>
            )}

            {isRealFailure && (
              <div
                className="entrance-left flex w-full flex-col items-center gap-6"
                data-entrance-delay="200"
                data-ocid="checkout_success.error_state"
              >
                <p className="max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
                  We could not confirm your payment. Please try again or contact
                  us if the issue persists.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to={ROUTES.merchandise}
                    data-ocid="checkout_success.retry_merchandise_link"
                    className="btn-primary-square"
                  >
                    Return to Merchandise
                  </Link>
                  <Link
                    to={ROUTES.joinUs}
                    data-ocid="checkout_success.join_us_link"
                    className="btn-outline-invert"
                  >
                    Join Us
                  </Link>
                </div>
              </div>
            )}
          </div>

          {isSuccessConfirmation && (
            <div
              className="entrance-left mx-auto mt-20 flex w-full max-w-2xl flex-col items-center gap-6"
              data-entrance-delay="320"
              data-ocid="checkout_success.newsletter_section"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-eyebrow text-foreground/70">
                  Stay in the movement
                </span>
                <h2 className="text-headline text-foreground text-2xl sm:text-3xl">
                  Join our newsletter
                </h2>
                <p className="max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg">
                  Get campaign updates, event invites, and ways to act straight
                  to your inbox.
                </p>
              </div>
              <ContactForm />
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
