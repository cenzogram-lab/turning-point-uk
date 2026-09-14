import { ProductCard } from "@/components/ProductCard";
import { ProductShowcaseModal } from "@/components/ProductShowcaseModal";
import { PRODUCTS, type Product } from "@/lib/products";
import { ROUTES } from "@/lib/routes";
import { Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";

/**
 * MerchandiseShowcase — the homepage product grid, rendered directly beneath
 * the "Wear the Message" merchandise hero.
 *
 * Before this existed the homepage merchandise section was a hero and a single
 * "Shop the Collection" link, so nothing on the homepage could be bought
 * without a page change. It renders the same six items as /merchandise from
 * the shared `@/lib/products` catalogue, through the same <ProductCard>, so
 * prices and Stripe links cannot drift between the two surfaces.
 *
 * ONE PRIMARY CTA PER SCREEN: no card here passes `isPrimaryCta`. The red pill
 * on this stretch of the homepage belongs to the hero's "Shop the Collection"
 * button directly above, so every Buy Now in the grid takes the inverted
 * outline treatment. On /merchandise there is no competing hero CTA beside the
 * grid, so the first card there does carry the red pill.
 */
export function MerchandiseShowcase() {
  const [shownProduct, setShownProduct] = useState<Product | null>(null);
  const closeShowcase = useCallback(() => setShownProduct(null), []);

  return (
    <section
      id="shop"
      data-ocid="section.merchandise_showcase"
      className="w-full scroll-mt-[calc(var(--announcement-bar-height)+4rem)] px-6 py-20 sm:px-10 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span
            className="entrance-left text-eyebrow text-primary"
            data-entrance-delay="0"
          >
            The Collection
          </span>
          <h2
            className="entrance-left font-display text-3xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            data-entrance-delay="80"
          >
            Every order funds the movement
          </h2>
        </div>

        <div
          data-ocid="home_products.list"
          className="entrance-left grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
          data-entrance-delay="240"
        >
          {PRODUCTS.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              ocidPrefix="home_products"
              onViewDetails={setShownProduct}
            />
          ))}
        </div>

        <p className="entrance-left mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          Secure Stripe checkout.{" "}
          <Link to={ROUTES.merchandise} className="text-inherit underline">
            See the full shop
          </Link>
          .
        </p>
      </div>

      {/* Portaled to document.body by Radix — outside this page's entrance
          container, which is why nothing inside it carries entrance classes. */}
      <ProductShowcaseModal product={shownProduct} onClose={closeShowcase} />
    </section>
  );
}
