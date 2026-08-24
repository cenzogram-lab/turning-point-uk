import { a as useEntranceAnimation, m as useSeoMeta, j as jsxRuntimeExports, S as Section, L as Link, R as ROUTES } from "./index-Bit4PJ4S.js";
function CheckoutCancelPage() {
  const ref = useEntranceAnimation();
  useSeoMeta({
    title: "Payment Cancelled | Turning Point UK",
    description: "Your payment to Turning Point UK was not completed. Try again or return to the site."
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Section,
    {
      variant: "center",
      background: "navy",
      noSnap: true,
      id: "checkout-cancel",
      className: "px-6 py-20 sm:px-10",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-full max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6 text-center", children: [
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
            children: "Payment Cancelled"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg",
            "data-entrance-delay": "200",
            children: "Your payment was not completed. You can try again or return to the site."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "entrance-left mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center",
            "data-entrance-delay": "320",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: ROUTES.merchandise,
                  "data-ocid": "checkout_cancel.browse_merchandise_button",
                  className: "btn-primary-square w-full sm:w-auto",
                  children: "Browse Merchandise"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: ROUTES.joinUs,
                  "data-ocid": "checkout_cancel.become_a_supporter_button",
                  className: "btn-outline-invert w-full sm:w-auto",
                  children: "Become a Supporter"
                }
              )
            ]
          }
        )
      ] }) })
    }
  ) });
}
export {
  CheckoutCancelPage
};
