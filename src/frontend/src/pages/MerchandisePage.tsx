import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductShowcaseModal } from "@/components/ProductShowcaseModal";
import { Section } from "@/components/Section";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { VIDEO_SHOP_HERO } from "@/lib/assets";
import { PRODUCTS, type Product } from "@/lib/products";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";

/**
 * MerchandisePage — the product grid.
 *
 * SpaceX discipline: full-bleed hero, then a six-card product grid. Each
 * card has a square product-image placeholder, name, price, and an Order
 * button that opens the item's direct tpointuk.co.uk checkout page in a
 * new tab. The hero is unchanged — same background, same size.
 */

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

export function MerchandisePage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  /** The product whose showcase modal is open, or null when none is. */
  const [shownProduct, setShownProduct] = useState<Product | null>(null);
  const closeShowcase = useCallback(() => setShownProduct(null), []);

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
        videoSrc={VIDEO_SHOP_HERO}
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
            className="entrance-left grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
            data-entrance-delay="320"
          >
            {PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                isPrimaryCta={i === 0}
                ocidPrefix="products"
                onViewDetails={setShownProduct}
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

      {/* Showcase modal — portaled to document.body by Radix, so it is not
          affected by this page's entrance-animation container. */}
      <ProductShowcaseModal product={shownProduct} onClose={closeShowcase} />
    </div>
  );
}
