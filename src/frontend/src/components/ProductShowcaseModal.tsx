import { ZoomableImage } from "@/components/ZoomableImage";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CreditCard, Lock, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * ProductShowcaseModal — the full-screen product view opened by a card's
 * "View Details" CTA.
 *
 * Composed from the Radix primitives directly rather than from the shared
 * <DialogContent> wrapper, for two reasons that wrapper cannot accommodate:
 *
 *   1. <DialogContent> renders a bare <DialogOverlay /> with no className, so
 *      its `bg-blue-950/50` scrim cannot be restyled through props. The glass
 *      treatment needs its own backdrop.
 *   2. <DialogContent> is pinned at `z-50`, which in this app is BELOW the
 *      announcement bar (z-[60]), the Patreon oval (z-[99]), the mobile bottom
 *      bar (z-[100]) and the cookie banner (z-[110]). A modal at z-50 is
 *      painted under the bottom bar on phones. Everything here sits at
 *      z-[120].
 *
 * Radix still supplies Esc-to-close, backdrop-click dismissal, focus trapping,
 * body scroll lock and `aria-hidden` on the rest of the page, because those
 * live in DialogPrimitive.Content / Root, not in the wrapper.
 *
 * NO ENTRANCE CLASSES ANYWHERE IN HERE. `useEntranceAnimation` only observes
 * nodes inside a page's `containerRef`; this content is portaled to
 * document.body, so `.entrance-left` / `.entrance-right` would never receive
 * `.entrance-visible` and the content would sit at opacity 0 forever.
 */

/** Payment methods the hosted Stripe checkout accepts. */
const TRUST_BADGES = [
  { Icon: Lock, label: "Stripe secure checkout" },
  { Icon: CreditCard, label: "Card, Apple Pay & Link" },
  { Icon: ShieldCheck, label: "Encrypted payment" },
] as const;

export interface ProductShowcaseModalProps {
  /** The product to show. `null` keeps the dialog closed. */
  product: Product | null;
  onClose: () => void;
}

export function ProductShowcaseModal({
  product,
  onClose,
}: ProductShowcaseModalProps) {
  const open = product !== null;

  /**
   * Closing sets `product` to null in the same render that flips the dialog
   * shut, but Radix keeps the panel mounted through its exit animation. Without
   * holding on to the last product the panel would empty out and fade away as a
   * blank box. Keep rendering the previous item until it unmounts.
   */
  const [lastProduct, setLastProduct] = useState<Product | null>(product);
  if (product !== null && product !== lastProduct) setLastProduct(product);
  const shown = product ?? lastProduct;

  /**
   * Radix runs a zoom/fade animation on open, and
   * `getBoundingClientRect` reports the POST-transform box — measuring the
   * image mid-animation makes the zoom lens track against a scaled rect. The
   * magnifier stays disabled until the animation has settled.
   */
  const [settled, setSettled] = useState(false);
  /**
   * Zoom state lives here, not in <ZoomableImage>, so Escape can un-zoom
   * before it closes the dialog. Radix's Escape listener is on `document` in
   * the capture phase and therefore beats any handler inside the image, so
   * interception has to happen on the Content's own `onEscapeKeyDown`.
   */
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!open) {
      setSettled(false);
      setZoomed(false);
      return;
    }
    const id = window.setTimeout(() => setSettled(true), 250);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-ocid="product_showcase.overlay"
          className={cn(
            "fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          data-ocid="product_showcase.panel"
          // First Escape exits zoom, second closes the dialog. Radix checks
          // `defaultPrevented` AFTER this handler runs, so preventing here
          // suppresses the dismissal for that keypress only.
          onEscapeKeyDown={(e) => {
            if (zoomed) {
              e.preventDefault();
              setZoomed(false);
            }
          }}
          className={cn(
            "fixed left-[50%] top-[50%] z-[120] translate-x-[-50%] translate-y-[-50%]",
            // BOTH width caps must be beaten. tailwind-merge treats `max-w-*`
            // and `sm:max-w-*` as separate groups, so overriding only the
            // unprefixed one silently collapses the panel to 32rem on desktop.
            "w-[calc(100%-1.5rem)] max-w-5xl sm:max-w-5xl",
            // The wrapper sets no max-height and no overflow, so tall content
            // would be clipped at both ends with no way to scroll to it.
            "flex max-h-[calc(100dvh-2rem)] flex-col",
            // The glass treatment. `rounded-2xl` is inert here — the theme
            // zeroes every radius except `full` — so the panel reads square,
            // consistent with the rest of the site.
            "overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          )}
        >
          {shown ? (
            <>
              {/* Radix requires a Title and a Description inside Content for
                  the aria-labelledby / aria-describedby wiring; both are
                  visually redundant next to the heading below, so they are
                  screen-reader only. */}
              <DialogTitle className="sr-only">{shown.name}</DialogTitle>
              <DialogDescription className="sr-only">
                {shown.description}
              </DialogDescription>

              {/* Close — the only guaranteed exit once the panel covers most
                  of the viewport and there is little backdrop left to click. */}
              <DialogPrimitive.Close
                data-ocid="product_showcase.close_button"
                aria-label="Close product details"
                className={cn(
                  "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center",
                  "rounded-full border border-white/15 bg-slate-950/70 text-white/80",
                  "transition-colors hover:bg-slate-800 hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </DialogPrimitive.Close>

              <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:overflow-hidden">
                {/* Image viewport. */}
                <div className="flex min-w-0 items-center justify-center border-white/10 bg-slate-900/60 p-4 sm:p-6 lg:border-r">
                  <ZoomableImage
                    src={shown.image}
                    alt={shown.alt}
                    disabled={!settled}
                    zoomed={zoomed}
                    onZoomedChange={setZoomed}
                    className="w-full"
                    imageClassName="max-h-[38vh] sm:max-h-[46vh] lg:max-h-[68vh]"
                  />
                </div>

                {/* Specifications + checkout. */}
                <div className="flex min-w-0 flex-col gap-5 overflow-y-auto p-5 sm:p-7">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display text-xl font-semibold uppercase leading-tight tracking-tight text-white sm:text-2xl">
                      {shown.name}
                    </h2>
                    <span
                      data-ocid="product_showcase.price"
                      className="font-display text-2xl font-bold text-white sm:text-3xl"
                    >
                      {shown.price}
                    </span>
                    <p className="font-body text-sm font-light leading-relaxed text-white/70">
                      {shown.description}
                    </p>
                  </div>

                  <dl className="flex flex-col gap-3 border-t border-white/10 pt-5">
                    {shown.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
                      >
                        <dt className="w-28 shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
                          {spec.label}
                        </dt>
                        <dd className="min-w-0 font-body text-sm font-medium text-white/90">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="flex flex-col gap-2 border-t border-white/10 pt-5">
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
                      Sizing
                    </span>
                    <p className="font-body text-sm font-light leading-relaxed text-white/70">
                      {shown.sizingNote}
                    </p>
                  </div>

                  {/* Checkout — the single primary CTA inside this view. */}
                  <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-5">
                    <a
                      href={shown.stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid="product_showcase.buy_button"
                      className="btn-primary-square group w-full"
                    >
                      <span>BUY NOW — {shown.price}</span>
                    </a>
                    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                      {TRUST_BADGES.map(({ Icon, label }) => (
                        <li
                          key={label}
                          className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/45"
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
