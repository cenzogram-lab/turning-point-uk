import { a as useEntranceAnimation, j as jsxRuntimeExports, S as Section, z as StripeSetupPanel } from "./index-B49Pzxc5.js";
function AdminStripePage() {
  const containerRef = useEntranceAnimation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminStripeDashboard, { containerRef });
}
function AdminStripeDashboard({ containerRef }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, "data-ocid": "admin.stripe.dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Section,
    {
      variant: "center",
      noSnap: true,
      background: "background",
      className: "min-h-[60dvh] items-center justify-center !justify-items-center pt-8",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 pb-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-eyebrow entrance-left", children: "Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-headline entrance-left", "data-entrance-delay": "80", children: "Stripe Configuration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "max-w-xl text-sm text-muted-foreground entrance-right",
            "data-entrance-delay": "160",
            children: "Configure the Stripe secret key that powers merchandise checkout. This surface is admin-only — the key never appears on public customer-facing routes."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "entrance-left w-full text-left",
            "data-entrance-delay": "240",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(StripeSetupPanel, {})
          }
        )
      ] })
    }
  ) });
}
export {
  AdminStripePage,
  AdminStripePage as default
};
