import { type Product, hasLiveCheckout } from "@/lib/products";
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

/**
 * BuyNowButton — the checkout CTA, shared by the grid card, the featured card
 * and the showcase modal.
 *
 * A product still waiting on its Stripe Payment Link renders a disabled
 * "Coming soon" button instead of an anchor: linking to the placeholder string
 * would open a 404 in a new tab. It is a real <button disabled> so assistive
 * tech announces it as unavailable rather than as a link that goes nowhere.
 */
export function BuyNowButton({
  product,
  primary,
  ocid,
  label = "BUY NOW",
}: {
  product: Product;
  primary: boolean;
  ocid: string;
  label?: string;
}) {
  const className = primary
    ? "btn-primary-square group w-full"
    : "btn-outline-invert group w-full";

  if (!hasLiveCheckout(product)) {
    return (
      // The pill classes carry a hover scale and a hover colour change, both
      // declared in index.css at the same specificity as any Tailwind
      // `hover:` override, so an override would win or lose on emit order.
      // Taking the button out of hit-testing removes the hover state outright;
      // the wrapper keeps the not-allowed cursor.
      <span className="block w-full cursor-not-allowed">
        <button
          type="button"
          disabled
          data-ocid={ocid}
          className={`${className} pointer-events-none opacity-60`}
        >
          <span>Coming soon</span>
        </button>
      </span>
    );
  }

  return (
    <a
      href={product.stripeUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid={ocid}
      className={className}
    >
      <span>{label}</span>
    </a>
  );
}

/** ProductBadge — the label pill, e.g. "Limited Edition". */
export function ProductBadge({
  text,
  size = "sm",
}: {
  text: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={
        size === "lg"
          ? "inline-flex w-fit items-center rounded-full bg-primary px-4 py-1.5 font-display text-sm font-bold uppercase tracking-[0.12em] text-white"
          : "inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white"
      }
    >
      {text}
    </span>
  );
}

/** ViewDetailsButton — the secondary action that opens the showcase. */
function ViewDetailsButton({
  product,
  ocid,
  onViewDetails,
}: {
  product: Product;
  ocid: string;
  onViewDetails: (product: Product) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onViewDetails(product)}
      data-ocid={ocid}
      className="inline-flex w-full items-center justify-center gap-2 border border-border px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span>View Details</span>
    </button>
  );
}

/** ProductImageButton — the clickable image that also opens the showcase. */
function ProductImageButton({
  product,
  ocid,
  onViewDetails,
  className,
  backdrop = false,
}: {
  product: Product;
  ocid: string;
  onViewDetails: (product: Product) => void;
  className: string;
  /**
   * Fill the letterbox bars with a blurred, dimmed copy of the same photo.
   * Used on the featured card, whose wide image panel would otherwise frame a
   * portrait photo with large empty bars. It is the same URL as the main
   * image, so it costs no extra request.
   */
  backdrop?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onViewDetails(product)}
      data-ocid={ocid}
      aria-label={`View details for ${product.name}`}
      className={`group relative w-full cursor-zoom-in overflow-hidden border-0 border-border bg-slate-900/40 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${className}`}
    >
      {backdrop ? (
        <img
          src={product.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
      ) : null}
      {/* object-contain, not cover: these are product shots on flat grounds,
          and cropping a hat or a sticker to fill the frame loses the thing
          being sold. */}
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
  );
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
      <ProductImageButton
        product={product}
        ocid={`${ocidPrefix}.image.${index}`}
        onViewDetails={onViewDetails}
        className="aspect-square border-b"
      />

      {/* Body — name, description, price, then the two actions. */}
      <div className="flex flex-1 flex-col gap-2 px-6 py-6">
        {product.badge ? <ProductBadge text={product.badge} /> : null}
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
          <BuyNowButton
            product={product}
            primary={isPrimaryCta}
            ocid={`${ocidPrefix}.buy_button.${index}`}
          />
          <ViewDetailsButton
            product={product}
            ocid={`${ocidPrefix}.details_button.${index}`}
            onViewDetails={onViewDetails}
          />
        </div>
      </div>
    </article>
  );
}

/**
 * FeaturedProductCard — the full-width spotlight for a `featured` product,
 * rendered above the regular grid.
 *
 * It sits outside the grid deliberately. The grid holds six items in a clean
 * 3 x 2 on desktop; a seventh card inside it would leave a hole in the last
 * row, and making the featured card span two columns leaves the same hole one
 * row later. A separate band keeps the grid whole and gives the featured item
 * the prominence it is meant to have.
 *
 * Layout: a full-width red band carrying the badge text ("LIMITED EDITION")
 * in large display type across the top, then image left / details right from
 * `md`, stacked (image first) below that. The whole card is framed in the
 * brand red so it reads as distinct from the grid beneath it.
 */
export function FeaturedProductCard({
  product,
  isPrimaryCta = false,
  ocidPrefix,
  onViewDetails,
}: Omit<ProductCardProps, "index">) {
  return (
    <article
      data-ocid={`${ocidPrefix}.featured`}
      className="overflow-hidden border-2 border-primary bg-card"
    >
      {product.badge ? (
        <p
          data-ocid={`${ocidPrefix}.featured_badge`}
          className="bg-primary px-6 py-4 text-center font-display text-3xl font-bold uppercase leading-none tracking-tight text-white sm:py-5 sm:text-5xl lg:text-6xl"
        >
          {product.badge}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2">
        <ProductImageButton
          product={product}
          ocid={`${ocidPrefix}.featured_image`}
          onViewDetails={onViewDetails}
          backdrop
          className="aspect-square border-b md:aspect-auto md:min-h-[30rem] md:border-b-0 md:border-r"
        />

        <div className="flex min-w-0 flex-col justify-center gap-4 px-6 py-8 sm:px-10 sm:py-12">
          <h3 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h3>
          <p className="font-body text-base font-light leading-relaxed text-white/70">
            {product.description}
          </p>
          <span className="font-display text-3xl font-bold text-white sm:text-4xl">
            {product.price}
          </span>

          <div className="mt-2 flex flex-col gap-2 sm:max-w-sm">
            <BuyNowButton
              product={product}
              primary={isPrimaryCta}
              ocid={`${ocidPrefix}.featured_buy_button`}
            />
            <ViewDetailsButton
              product={product}
              ocid={`${ocidPrefix}.featured_details_button`}
              onViewDetails={onViewDetails}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
