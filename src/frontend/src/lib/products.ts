import {
  IMAGE_PRODUCT_HAT_MBGA,
  IMAGE_PRODUCT_HAT_MBGA_ST_GEORGE,
  IMAGE_PRODUCT_SHIRT_FREEDOM,
  IMAGE_PRODUCT_STICKER_COUNTRY_BACK,
  IMAGE_PRODUCT_STICKER_STOP_IMPORTING,
  IMAGE_PRODUCT_STICKER_STOP_THE_INVASION,
} from "@/lib/assets";

/**
 * The merchandise catalogue — the single source of truth for every product
 * surface on the site.
 *
 * It lives in `lib/` rather than inside MerchandisePage because the homepage
 * merchandise grid renders the same six items. Two copies would drift the
 * first time a price or a Stripe link changed.
 *
 * CHECKOUT: `stripeUrl` is a live hosted Stripe Payment Link. Both the card's
 * "Buy Now" button and the modal's checkout CTA open it in a new tab. The
 * backend `createCheckoutSession` path and `useStripeCheckout` remain in the
 * codebase so session-based checkout can be switched back on later; the
 * Payment Link simply bypasses it for now.
 *
 * SPEC HONESTY: `specs` carries only facts this repo actually knows — pack
 * counts, VAT treatment, and the material wording already present in each
 * product's own description. No garment measurements or hat circumferences are
 * invented here, because a wrong dimension on a shop page costs a return.
 * `sizingNote` therefore points the buyer at the official product page
 * (`href`) for full sizing, and the showcase modal links to it. Replace those
 * notes with real measurements when they are to hand — nothing else needs to
 * change.
 */

/** One labelled specification row shown in the product showcase modal. */
export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  /**
   * Stable slug. Used for React keys and to namespace `data-ocid` values, so
   * the same card rendered on two pages does not emit duplicate ocids.
   */
  id: string;
  name: string;
  /** Human-readable price exactly as shown on the card, e.g. "£36". */
  price: string;
  /** Numeric price in pence (GBP) for the Stripe checkout line item. */
  priceInCents: bigint;
  /** Short product description, also passed to Stripe as the line-item description. */
  description: string;
  /** The official tpointuk.co.uk product page — full details and sizing. */
  href: string;
  /** Live Stripe Payment Link URL the Buy Now CTA opens in a new tab. */
  stripeUrl: string;
  image: string;
  alt: string;
  /** Specification rows rendered in the showcase modal. */
  specs: ProductSpec[];
  /** Sizing / dimensions guidance shown beneath the specs. */
  sizingNote: string;
}

/** Shared by every item — the shop's single delivery promise. */
const UK_DELIVERY: ProductSpec = {
  label: "Delivery",
  value: "Shipped across the UK",
};

/** Shared by the three sticker packs. */
const STICKER_SPECS: ProductSpec[] = [
  { label: "Pack size", value: "48 stickers" },
  { label: "VAT", value: "Included in the price" },
  UK_DELIVERY,
];

const STICKER_SIZING =
  "Supplied as a pack of 48. For individual sticker dimensions, see the full product page.";

const APPAREL_SIZING =
  "For the full size chart and fit guidance, see the official product page.";

export const PRODUCTS: Product[] = [
  {
    id: "charlie-kirk-freedom-shirt",
    name: "Charlie Kirk Freedom Shirt",
    price: "£36",
    priceInCents: 3600n,
    description:
      "Official Turning Point UK Charlie Kirk Freedom Shirt. Premium cotton, bold freedom message.",
    href: "https://tpointuk.co.uk/product/charlie-kirk-freedom-shirt-only-authentic-tpuk-version-30/",
    stripeUrl: "https://buy.stripe.com/14A14n8Zj56T1d81Mpfw407",
    image: IMAGE_PRODUCT_SHIRT_FREEDOM,
    alt: "Charlie Kirk Freedom Shirt",
    specs: [
      { label: "Material", value: "Premium cotton" },
      { label: "Design", value: "Bold freedom message" },
      UK_DELIVERY,
    ],
    sizingNote: APPAREL_SIZING,
  },
  {
    id: "mbga-hat-union-flag",
    name: "Make Britain Great Again Hat With Union Flag",
    price: "£30",
    priceInCents: 3000n,
    description:
      "Official Turning Point UK Make Britain Great Again hat with the Union Flag embroidered.",
    href: "https://tpointuk.co.uk/product/make-britain-great-again-hat-with-union-flag/",
    stripeUrl: "https://buy.stripe.com/14A6oH0sN42Pf3Y3Uxfw408",
    image: IMAGE_PRODUCT_HAT_MBGA,
    alt: "Make Britain Great Again Hat With Union Flag",
    specs: [{ label: "Detail", value: "Embroidered Union Flag" }, UK_DELIVERY],
    sizingNote: APPAREL_SIZING,
  },
  {
    id: "mbga-hat-st-george",
    name: "Make Britain Great Again Hat - St George's Cross Hybrid",
    price: "£30",
    priceInCents: 3000n,
    description:
      "Official Turning Point UK Make Britain Great Again hat, St George's Cross hybrid edition.",
    href: "https://tpointuk.co.uk/product/make-britain-great-again-hat-st-georges-cross-hybrid/",
    stripeUrl: "https://buy.stripe.com/aFa14n2AV6aX4pk8aNfw409",
    image: IMAGE_PRODUCT_HAT_MBGA_ST_GEORGE,
    alt: "Make Britain Great Again Hat - St George's Cross Hybrid",
    specs: [
      { label: "Edition", value: "St George's Cross hybrid" },
      UK_DELIVERY,
    ],
    sizingNote: APPAREL_SIZING,
  },
  {
    id: "stop-the-invasion-stickers",
    name: "'Stop The Invasion' Stickers",
    price: "48 for £15.60",
    priceInCents: 1560n,
    description:
      "Official Turning Point UK 'Stop The Invasion' stickers - pack of 48, including VAT.",
    href: "https://tpointuk.co.uk/product/stop-the-invasion-stickers-48-for-15-60-including-vat/",
    stripeUrl: "https://buy.stripe.com/6oUeVddfzgPB3lg8aNfw40a",
    image: IMAGE_PRODUCT_STICKER_STOP_THE_INVASION,
    alt: "'Stop The Invasion' Stickers",
    specs: STICKER_SPECS,
    sizingNote: STICKER_SIZING,
  },
  {
    id: "we-want-our-country-back-stickers",
    name: "'We Want Our Country Back' Stickers",
    price: "48 for £15.60",
    priceInCents: 1560n,
    description:
      "Official Turning Point UK 'We Want Our Country Back' stickers - pack of 48, including VAT.",
    // NOTE: this href intentionally matches what the upstream shop ships, even
    // though it reads like the 'Stop The Invasion' slug. Do not "fix" it here —
    // it also lands in the JSON-LD Offer.url.
    href: "https://tpointuk.co.uk/product/stop-the-invasion-stickers-48-for-15-60-inc-vat/",
    stripeUrl: "https://buy.stripe.com/7sYaEX3EZ0QDg82dv7fw40b",
    image: IMAGE_PRODUCT_STICKER_COUNTRY_BACK,
    alt: "'We Want Our Country Back' Stickers",
    specs: STICKER_SPECS,
    sizingNote: STICKER_SIZING,
  },
  {
    id: "stop-importing-start-deporting-stickers",
    name: "'Stop Importing - Start Deporting' Stickers",
    price: "48 for £15.60",
    priceInCents: 1560n,
    description:
      "Official Turning Point UK 'Stop Importing - Start Deporting' stickers - pack of 48, including VAT.",
    href: "https://tpointuk.co.uk/product/stop-importing-start-deporting-stickers-48-for-15-60-inc-vat/",
    stripeUrl: "https://buy.stripe.com/9B6dR94J39n92hc8aNfw40c",
    image: IMAGE_PRODUCT_STICKER_STOP_IMPORTING,
    alt: "'Stop Importing - Start Deporting' Stickers",
    specs: STICKER_SPECS,
    sizingNote: STICKER_SIZING,
  },
];
