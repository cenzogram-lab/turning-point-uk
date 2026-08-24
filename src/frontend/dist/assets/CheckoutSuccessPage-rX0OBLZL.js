import { u as useActor, w as useQuery, c as createActor, a as useEntranceAnimation, x as useSearch, m as useSeoMeta, j as jsxRuntimeExports, S as Section, L as Link, R as ROUTES, y as ContactForm } from "./index-D0j-3k0D.js";
const POLL_INTERVAL_MS = 2e3;
function resolveActor(actor) {
  if (actor) return actor;
  return null;
}
function isTerminal(status) {
  return !!status && (status.__kind__ === "completed" || status.__kind__ === "failed");
}
function toPollResult(data) {
  if (!data) {
    return { status: "loading" };
  }
  switch (data.__kind__) {
    case "completed":
      return { status: "completed", data };
    case "failed":
      return { status: "failed", data };
    default:
      return { status: "loading" };
  }
}
function useStripeSessionStatus(sessionId) {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);
  const effectiveSessionId = sessionId ?? null;
  const query = useQuery({
    queryKey: ["stripe", "sessionStatus", effectiveSessionId],
    queryFn: async () => {
      if (!resolvedActor || !effectiveSessionId) {
        const synthetic = {
          __kind__: "failed",
          failed: { error: "No session_id found in the URL." }
        };
        return synthetic;
      }
      return await resolvedActor.getStripeSessionStatus(effectiveSessionId);
    },
    enabled: Boolean(resolvedActor) && !isFetching,
    refetchInterval: (query2) => {
      const data2 = query2.state.data;
      return isTerminal(data2) ? false : POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: false
  });
  const { status, data } = toPollResult(query.data);
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isPending = status === "loading";
  return {
    /** The Stripe session_id passed in (or null when absent). */
    sessionId: effectiveSessionId,
    /** Normalized status — `'loading' | 'completed' | 'failed'`. */
    status,
    /** Raw backend variant once a terminal status is received. */
    data,
    /** True once the backend reports `completed`. */
    isCompleted,
    /** True once the backend reports `failed`. */
    isFailed,
    /** True while waiting for a terminal status. */
    isPending,
    /** Combined loading flag (actor fetching or query loading). */
    loading: isFetching || query.isLoading,
    /** True while polling is actively refetching. */
    isPolling: query.isFetching && !isCompleted && !isFailed,
    error: query.error,
    refetch: query.refetch
  };
}
function parseStripeResponse(response) {
  var _a;
  if (!response) return null;
  try {
    const data = JSON.parse(response);
    const lineItems = data.line_items;
    const lineItemDescriptions = (_a = lineItems == null ? void 0 : lineItems.data) == null ? void 0 : _a.map((item) => item.description).filter((d) => typeof d === "string" && d.length > 0);
    return {
      customerEmail: typeof data.customer_email === "string" ? data.customer_email : void 0,
      amountTotal: typeof data.amount_total === "number" ? data.amount_total : void 0,
      currency: typeof data.currency === "string" ? data.currency : void 0,
      lineItemDescriptions: lineItemDescriptions && lineItemDescriptions.length > 0 ? lineItemDescriptions : void 0,
      mode: typeof data.mode === "string" ? data.mode : void 0,
      subscriptionId: typeof data.subscription === "string" ? data.subscription : void 0
    };
  } catch {
    return null;
  }
}
function formatAmount(amountTotal, currency) {
  const value = amountTotal / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase()
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}
function CheckoutSuccessPage() {
  var _a;
  const ref = useEntranceAnimation();
  const { session_id } = useSearch({ strict: false });
  const { status, data } = useStripeSessionStatus(session_id);
  useSeoMeta({
    title: "Payment Successful | Turning Point UK",
    description: "Your payment to Turning Point UK was successful. Thank you for fueling the movement for Britain's future."
  });
  const hasSessionId = Boolean(session_id && session_id.length > 0);
  const isLoading = hasSessionId && status === "loading";
  const isRealFailure = hasSessionId && (status === "failed" || (data == null ? void 0 : data.__kind__) === "failed");
  const isCompleted = hasSessionId && status === "completed" && (data == null ? void 0 : data.__kind__) === "completed";
  const isSuccessConfirmation = !hasSessionId || isCompleted;
  const parsed = isCompleted ? parseStripeResponse(data.completed.response) : null;
  const isSubscription = (parsed == null ? void 0 : parsed.mode) === "subscription" || !!(parsed == null ? void 0 : parsed.subscriptionId);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Section,
    {
      variant: "center",
      background: "navy",
      noSnap: true,
      id: "checkout-success",
      className: "px-6 py-20 sm:px-10",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "entrance-left text-eyebrow text-foreground/70",
              "data-entrance-delay": "0",
              children: "Checkout"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h1",
            {
              className: "entrance-left text-headline text-foreground",
              "data-entrance-delay": "80",
              children: "Payment Successful"
            }
          ),
          isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "entrance-left flex flex-col items-center gap-4",
              "data-entrance-delay": "200",
              "data-ocid": "checkout_success.loading_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    "aria-hidden": "true",
                    className: "h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-primary"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg", children: "Confirming your payment..." })
              ]
            }
          ),
          isSuccessConfirmation && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "entrance-left flex w-full flex-col items-center gap-8",
              "data-entrance-delay": "200",
              "data-ocid": "checkout_success.success_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg", children: "Thank you for standing with Turning Point UK. Your support fuels grassroots activism, training days, and campaigns across the country. Your payment has been processed successfully." }),
                isCompleted && ((parsed == null ? void 0 : parsed.customerEmail) || (parsed == null ? void 0 : parsed.amountTotal) || (parsed == null ? void 0 : parsed.lineItemDescriptions)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    "data-ocid": "checkout_success.summary",
                    className: "w-full max-w-xl border border-border bg-card px-6 py-8 text-left sm:px-10",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70", children: "Order Summary" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "flex flex-col gap-4 font-body text-sm", children: [
                        (parsed == null ? void 0 : parsed.customerEmail) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
                            "data-ocid": "checkout_success.summary.email",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground", children: "Email" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-light text-foreground", children: parsed.customerEmail })
                            ]
                          }
                        ),
                        (_a = parsed == null ? void 0 : parsed.lineItemDescriptions) == null ? void 0 : _a.map((desc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
                            "data-ocid": `checkout_success.summary.item.${i}`,
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground", children: "Item" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-light text-foreground", children: desc })
                            ]
                          },
                          desc
                        )),
                        (parsed == null ? void 0 : parsed.amountTotal) && (parsed == null ? void 0 : parsed.currency) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
                            "data-ocid": "checkout_success.summary.total",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground", children: "Total" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-display text-lg font-semibold text-foreground", children: formatAmount(
                                parsed.amountTotal,
                                parsed.currency
                              ) })
                            ]
                          }
                        ),
                        isSubscription && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
                            "data-ocid": "checkout_success.summary.type",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground", children: "Type" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-light text-foreground", children: "Recurring subscription" })
                            ]
                          }
                        )
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: ROUTES.home,
                    "data-ocid": "checkout_success.return_home_button",
                    className: "btn-primary-square",
                    children: "Return Home"
                  }
                )
              ]
            }
          ),
          isRealFailure && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "entrance-left flex w-full flex-col items-center gap-6",
              "data-entrance-delay": "200",
              "data-ocid": "checkout_success.error_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg", children: "We could not confirm your payment. Please try again or contact us if the issue persists." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 sm:flex-row sm:justify-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: ROUTES.merchandise,
                      "data-ocid": "checkout_success.retry_merchandise_link",
                      className: "btn-primary-square",
                      children: "Return to Merchandise"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: ROUTES.joinUs,
                      "data-ocid": "checkout_success.join_us_link",
                      className: "btn-outline-invert",
                      children: "Join Us"
                    }
                  )
                ] })
              ]
            }
          )
        ] }),
        isSuccessConfirmation && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "entrance-left mx-auto mt-20 flex w-full max-w-2xl flex-col items-center gap-6",
            "data-entrance-delay": "320",
            "data-ocid": "checkout_success.newsletter_section",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-eyebrow text-foreground/70", children: "Stay in the movement" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-headline text-foreground text-2xl sm:text-3xl", children: "Join our newsletter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg", children: "Get campaign updates, event invites, and ways to act straight to your inbox." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ContactForm, {})
            ]
          }
        )
      ] })
    }
  ) });
}
export {
  CheckoutSuccessPage
};
