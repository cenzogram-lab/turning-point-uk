import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { POSTER_MERCH_DISPLAY, VIDEO_MERCH_DISPLAY } from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

/**
 * MerchandisePage — the product grid.
 *
 * SpaceX discipline: full-bleed hero, then a six-card product grid. Each
 * card has a square product-image placeholder, name, price, and an Order
 * button that opens the item's direct tpointuk.co.uk checkout page in a
 * new tab. The hero is unchanged — same background, same size.
 */

interface Product {
  name: string;
  price: string;
  /** Numeric price in pence (GBP) for the Stripe checkout line item. */
  priceInCents: bigint;
  /** Short product description passed to Stripe as the line-item description. */
  description: string;
  href: string;
  /** Live Stripe Payment Link URL the BUY button opens in a new tab. */
  stripeUrl: string;
  image: string;
  alt: string;
}

const PRODUCTS: Product[] = [
  {
    name: "Charlie Kirk Freedom Shirt",
    price: "£36",
    priceInCents: 3600n,
    description:
      "Official Turning Point UK Charlie Kirk Freedom Shirt. Premium cotton, bold freedom message.",
    href: "https://tpointuk.co.uk/product/charlie-kirk-freedom-shirt-only-authentic-tpuk-version-30/",
    stripeUrl: "https://buy.stripe.com/14A14n8Zj56T1d81Mpfw407",
    image: "/assets/images/product-shirt-freedom.jpg",
    alt: "Charlie Kirk Freedom Shirt",
  },
  {
    name: "Make Britain Great Again Hat With Union Flag",
    price: "£30",
    priceInCents: 3000n,
    description:
      "Official Turning Point UK Make Britain Great Again hat with the Union Flag embroidered.",
    href: "https://tpointuk.co.uk/product/make-britain-great-again-hat-with-union-flag/",
    stripeUrl: "https://buy.stripe.com/14A6oH0sN42Pf3Y3Uxfw408",
    image: "/assets/images/product-hat-mbga.jpg",
    alt: "Make Britain Great Again Hat With Union Flag",
  },
  {
    name: "Make Britain Great Again Hat - St George's Cross Hybrid",
    price: "£30",
    priceInCents: 3000n,
    description:
      "Official Turning Point UK Make Britain Great Again hat, St George's Cross hybrid edition.",
    href: "https://tpointuk.co.uk/product/make-britain-great-again-hat-st-georges-cross-hybrid/",
    stripeUrl: "https://buy.stripe.com/aFa14n2AV6aX4pk8aNfw409",
    image: "/assets/images/product-hat-mbga-stgeorge.jpg",
    alt: "Make Britain Great Again Hat - St George's Cross Hybrid",
  },
  {
    name: "'Stop The Invasion' Stickers",
    price: "48 for £15.60",
    priceInCents: 1560n,
    description:
      "Official Turning Point UK 'Stop The Invasion' stickers - pack of 48, including VAT.",
    href: "https://tpointuk.co.uk/product/stop-the-invasion-stickers-48-for-15-60-including-vat/",
    stripeUrl: "https://buy.stripe.com/6oUeVddfzgPB3lg8aNfw40a",
    image: "/assets/images/stop-the-invasion.png",
    alt: "'Stop The Invasion' Stickers",
  },
  {
    name: "'We Want Our Country Back' Stickers",
    price: "48 for £15.60",
    priceInCents: 1560n,
    description:
      "Official Turning Point UK 'We Want Our Country Back' stickers - pack of 48, including VAT.",
    href: "https://tpointuk.co.uk/product/stop-the-invasion-stickers-48-for-15-60-inc-vat/",
    stripeUrl: "https://buy.stripe.com/7sYaEX3EZ0QDg82dv7fw40b",
    image: "/assets/images/we-want-our-country-back.webp",
    alt: "'We Want Our Country Back' Stickers",
  },
  {
    name: "'Stop Importing - Start Deporting' Stickers",
    price: "48 for £15.60",
    priceInCents: 1560n,
    description:
      "Official Turning Point UK 'Stop Importing - Start Deporting' stickers - pack of 48, including VAT.",
    href: "https://tpointuk.co.uk/product/stop-importing-start-deporting-stickers-48-for-15-60-inc-vat/",
    stripeUrl: "https://buy.stripe.com/9B6dR94J39n92hc8aNfw40c",
    image: "/assets/images/stop-importing-start-deporting.webp",
    alt: "'Stop Importing - Start Deporting' Stickers",
  },
];

/**
 * Build one Product JSON-LD schema object per inline product, mirroring the
 * visible card content (name, image, price). The numeric offer price is
 * parsed from the visible price string — for "£36" / "£30" that is the
 * currency figure, and for "48 for £15.60" it is the £15.60 pack price
 * (the last currency figure in the string). Image paths are relative
 * ("/assets/...") so they are prefixed with SITE_BASE_URL to form
 * absolute URLs as schema.org requires. Description is derived from the
 * product name per the build contract.
 */
const PRODUCT_SCHEMAS = PRODUCTS.map((product) => {
  const priceMatch = product.price.match(/£\s*([\d.]+)/);
  const numericPrice = priceMatch ? priceMatch[1] : "0";
  const imageUrl = product.image.startsWith("/")
    ? `${SITE_BASE_URL}${product.image}`
    : product.image;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageUrl,
    description: `Official Turning Point UK ${product.name}`,
    offers: {
      "@type": "Offer",
      price: numericPrice,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: product.href,
    },
  };
});

/**
 * MerchSubscribeForm — Mailchimp email capture for the merchandise page.
 *
 * Mirrors the ContactForm Mailchimp pattern verbatim: native HTML form
 * POST to the Turning Point UK Mailchimp audience, EMAIL/FNAME/LNAME
 * fields styled with .admin-input, hidden tags input, honeypot, and
 * the Radix Checkbox consent component with the onSubmit guard. Form
 * id is suffixed `-merch` and the submit button id `-merch` to avoid
 * duplicate-id collisions with the other Mailchimp forms on the site.
 * Uses a dedicated f_id (0080c1e5f0) and tags value (10158646) so
 * merchandise signups route into their own Mailchimp segment.
 */
function MerchSubscribeForm() {
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  return (
    <form
      action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;f_id=0080c1e5f0"
      method="post"
      id="mc-embedded-subscribe-form-merch"
      name="mc-embedded-subscribe-form"
      className="validate w-full"
      target="_blank"
      onSubmit={(e) => {
        if (!consent) {
          e.preventDefault();
          setConsentError(true);
          return;
        }
        setConsentError(false);
      }}
    >
      <div className="mc-field-group mb-5">
        <label
          htmlFor="mce-EMAIL-merch"
          className="block mb-2 font-body text-sm font-medium text-foreground"
        >
          E-mail Address *
        </label>
        <input
          type="email"
          name="EMAIL"
          id="mce-EMAIL-merch"
          required
          placeholder="you@example.com"
          className="admin-input"
          data-ocid="merch.email_input"
        />
      </div>
      <div className="mc-field-group mb-5">
        <label
          htmlFor="mce-FNAME-merch"
          className="block mb-2 font-body text-sm font-medium text-foreground"
        >
          First Name
        </label>
        <input
          type="text"
          name="FNAME"
          id="mce-FNAME-merch"
          placeholder="First Name"
          className="admin-input"
          data-ocid="merch.fname_input"
        />
      </div>
      <div className="mc-field-group mb-5">
        <label
          htmlFor="mce-LNAME-merch"
          className="block mb-2 font-body text-sm font-medium text-foreground"
        >
          Last Name
        </label>
        <input
          type="text"
          name="LNAME"
          id="mce-LNAME-merch"
          placeholder="Last Name"
          className="admin-input"
          data-ocid="merch.lname_input"
        />
      </div>
      {/* Mailchimp hidden tags input — routes the submission into the
          correct Mailchimp audience/tag. Preserved verbatim pattern. */}
      <input type="hidden" name="tags" value="10158646" />
      {/* Mailchimp bot-protection honeypot — hidden off-screen so human
          users never see it but bots fill it in. Preserved verbatim. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
        <input
          type="text"
          name="b_6fe69c3d0521b617677c81700_2ce1dac979"
          tabIndex={-1}
          value=""
        />
      </div>
      {/* Submit button — full-width bold red CTA. Wrapped in .clear to
          preserve Mailchimp semantics. name='subscribe' preserved exactly. */}
      <div className="clear mt-2">
        <input
          type="submit"
          name="subscribe"
          id="mc-embedded-subscribe-merch"
          value="SUBSCRIBE"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
          data-ocid="merch.submit_button"
        />
      </div>
      {/* Shared consent block — matches the pattern on ContactForm,
          EducationWatchPage, PetitionPage, ActivismKitPage, and
          UniversitySocietiesPage. */}
      <div data-ocid="merch.consent" className="mt-6 flex items-start gap-3">
        <Checkbox
          id="merch-consent"
          required
          checked={consent}
          onCheckedChange={(value) => {
            setConsent(value === true);
            if (value === true) setConsentError(false);
          }}
          aria-label="Required: consent to data processing"
          className="mt-0.5"
        />
        <label
          htmlFor="merch-consent"
          className="font-body text-sm font-light leading-relaxed text-foreground/70"
        >
          <span aria-hidden="true" className="text-primary">
            *
          </span>{" "}
          I consent to Turning Point UK processing my personal data in line with
          the{" "}
          <Link
            to={ROUTES.privacyPolicy}
            className="underline underline-offset-2 transition-smooth hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </label>
        {consentError && (
          <p
            data-ocid="merch.consent_error"
            className="font-body text-sm font-medium text-primary"
          >
            Please consent to our Privacy Policy to continue.
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * ProductCard — one merchandise card with a direct Stripe Payment Link.
 *
 * Renders the product image, name, price, and a BUY anchor. The CTA is an
 * active <a> that opens the product's live Stripe Payment Link
 * (product.stripeUrl) in a new tab (target="_blank" rel="noopener
 * noreferrer"), so visitors go straight to a hosted Stripe checkout.
 *
 * The backend createCheckoutSession wiring and the useStripeCheckout hook
 * are intentionally left intact in the codebase so the session-based
 * checkout can be toggled back on later — this card simply bypasses it
 * with a direct Payment Link for now.
 *
 * Brand discipline: the BUY anchor is the single red primary CTA per card
 * (`.btn-primary-square`), square corners, zero shadows.
 */
interface ProductCardProps {
  product: Product;
  index: number;
  /** True for the single card whose BUY anchor is the red primary CTA.
   *  All other cards use the neutral secondary treatment so red is
   *  reserved for one primary CTA per screen. */
  isPrimaryCta?: boolean;
}

function ProductCard({
  product,
  index,
  isPrimaryCta = false,
}: ProductCardProps) {
  return (
    <article
      key={product.name}
      data-ocid={`products.item.${index}`}
      className="flex flex-col bg-card"
    >
      {/* Square product image. */}
      <div
        className="relative aspect-square w-full overflow-hidden border-b border-foreground/15"
        data-ocid={`products.image.${index}`}
      >
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Body — name + description + price + BUY anchor. */}
      <div className="flex flex-1 flex-col gap-2 px-6 py-6">
        <h3 className="font-display text-base font-semibold uppercase tracking-tight text-foreground">
          {product.name}
        </h3>
        <p className="font-body text-sm font-light leading-relaxed text-foreground/70">
          {product.description}
        </p>
        <span className="font-body text-lg font-light text-foreground/80">
          {product.price}
        </span>
        <a
          href={product.stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid={`products.buy_button.${index}`}
          className={
            isPrimaryCta
              ? "btn-primary-square group mt-auto w-full"
              : "btn-outline-invert group mt-auto w-full"
          }
        >
          <span>BUY</span>
        </a>
      </div>
    </article>
  );
}

export function MerchandisePage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  useSeoMeta({
    title: PAGE_SEO["/merchandise"].title,
    description: PAGE_SEO["/merchandise"].description,
    canonical: `${SITE_BASE_URL}/merchandise`,
    url: `${SITE_BASE_URL}/merchandise`,
    jsonLd: [
      buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/merchandise"]),
      ...PRODUCT_SCHEMAS,
    ],
  });
  return (
    <div ref={ref}>
      {/* Hero — the store entrance. */}
      <Hero
        headline="WEAR THE MESSAGE"
        videoLabel="Merchandise hero video"
        lazy={false}
        videoSrc={VIDEO_MERCH_DISPLAY}
        posterSrc={POSTER_MERCH_DISPLAY}
      />

      {/* Subscribe banner + Mailchimp subscribe form. Sits above the
          product grid so visitors can subscribe for campaign and event
          updates. Mirrors the ContactForm Mailchimp pattern (native HTML
          POST, EMAIL/FNAME/LNAME, hidden tags, honeypot, Radix consent
          checkbox with onSubmit guard). */}
      <Section
        id="shop-down-notice"
        background="navy"
        noSnap
        className="px-6 py-16 sm:px-10 sm:py-20"
      >
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-primary"
              data-entrance-delay="0"
            >
              STAY IN THE FIGHT
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Get the latest from Turning Point UK
            </h2>
            <p
              className="entrance-left font-body text-lg font-light leading-relaxed text-foreground/80"
              data-entrance-delay="160"
            >
              Subscribe for updates on campaigns, events, and how to get
              involved.
            </p>
          </div>

          <MerchSubscribeForm />
        </div>
      </Section>

      {/* Product grid — six cards. */}
      <Section id="products" variant="center" className="px-6 py-24 sm:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              THE COLLECTION
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Every order funds the movement
            </h2>
          </div>

          <div
            data-ocid="products.list"
            className="entrance-left grid gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-3"
            data-entrance-delay="320"
          >
            {PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.name}
                product={product}
                index={i}
                isPrimaryCta={i === 0}
              />
            ))}
          </div>

          <p
            className="entrance-left mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground"
            data-entrance-delay="440"
          >
            Orders are fulfilled securely via Stripe checkout. Prefer to give
            directly?{" "}
            <Link to={ROUTES.donate} className="text-inherit underline">
              Donate to support the movement
            </Link>
            .
          </p>
        </div>
      </Section>
    </div>
  );
}
