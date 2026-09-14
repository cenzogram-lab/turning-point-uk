import type { Product } from "@/lib/products";
import { Maximize2 } from "lucide-react";

/**
 * ProductCard — one merchandise card with two actions.
 *
 * Dual CTAs:
 *   1. "BUY NOW"      — an anchor straight to the item's live Stripe Payment
 *                       Link, opened in a new tab.
 *   2. "VIEW DETAILS" — opens the full-screen <ProductShowcaseModal>, where
 *                       the image can be magnified and the specs read.
 *
 * ONE PRIMARY CTA PER SCREEN: the house rule reserves the solid red pill for a
 * single action per screen, so only the card marked `isPrimaryCta` renders its
 * Buy Now in red; every other card uses the inverted outline treatment. View
 * Details is always the quieter of the two on a given card.
 *
 * OCID NAMESPACING: `ocidPrefix` exists because the same card renders on both
 * the homepage and /merchandise. Index-based ocids alone would collide across
 * the two surfaces, and ocid values are load-bearing (index.css targets some
 * of them), so each surface passes its own prefix.
 */
export interface ProductCardProps {
  product: Product;
  index: number;
  /**
   * True for the single card whose Buy Now is the red primary CTA. All other
   * cards use the neutral treatment so red stays reserved for one primary
   * action per screen.
   */
  isPrimaryCta?: boolean;
  /** Namespace for this surface's `data-ocid` values, e.g. "products". */
  ocidPrefix: string;
  /** Opens the showcase modal for this product. */
  onViewDetails: (product: Product) => void;
}

export function ProductCard({
  product,
  index,
  isPrimaryCta = false,
  ocidPrefix,
  onViewDetails,
}: ProductCardProps) {
  return (
    <article
      data-ocid={`${ocidPrefix}.item.${index}`}
      className="flex flex-col bg-card"
    >
      {/* Square product image. object-contain, not cover: these are product
          shots on flat grounds, and cropping a hat or a sticker to fill a
          square loses the thing being sold. */}
      <button
        type="button"
        onClick={() => onViewDetails(product)}
        data-ocid={`${ocidPrefix}.image.${index}`}
        aria-label={`View details for ${product.name}`}
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden border-0 border-b border-border bg-slate-900/40 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* Body — name, description, price, then the two actions. */}
      <div className="flex flex-1 flex-col gap-2 px-6 py-6">
        <h3 className="font-display text-base font-semibold uppercase tracking-tight text-foreground">
          {product.name}
        </h3>
        <p className="font-body text-sm font-light leading-relaxed text-white/70">
          {product.description}
        </p>
        <span className="font-body text-lg font-light text-white/80">
          {product.price}
        </span>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <a
            href={product.stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid={`${ocidPrefix}.buy_button.${index}`}
            className={
              isPrimaryCta
                ? "btn-primary-square group w-full"
                : "btn-outline-invert group w-full"
            }
          >
            <span>BUY NOW</span>
          </a>
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            data-ocid={`${ocidPrefix}.details_button.${index}`}
            className="inline-flex w-full items-center justify-center gap-2 border border-border px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </article>
  );
}
