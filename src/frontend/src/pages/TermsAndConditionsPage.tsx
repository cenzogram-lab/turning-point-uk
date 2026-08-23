import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { Link } from "@tanstack/react-router";

/**
 * TermsAndConditionsPage — standard UK-compliant Terms & Conditions for
 * Turning Point UK, a political activist organisation operated by
 * Media & Activism Ltd.
 *
 * Six sections as h2 headings:
 *   1. Acceptance of Terms
 *   2. Intellectual Property Rights
 *   3. User Conduct
 *   4. Donations & Purchases
 *   5. Limitation of Liability
 *   6. Governing Law
 *
 * Layout: a single full-viewport Section (background="background",
 * noSnap) so the page sits inside the global Layout shell with the
 * deep-blue theme. Crisp bright white headings (text-foreground /
 * text-headline), muted body text (text-foreground/70), red TPUK
 * accent reserved for the page eyebrow and h1 title only.
 *
 * References Media & Activism Ltd as the operator and links to the
 * Privacy Policy via the TanStack Router Link component.
 */

/** User Conduct rules — explicit rules for the Education Watch and Petition tools. */
const USER_CONDUCT_RULES: { heading: string; items: string[] }[] = [
  {
    heading: "Education Watch tool",
    items: [
      "You must not submit false, misleading, or malicious reports.",
      "Submissions must be based on your own genuine observations or verifiable evidence.",
      "You must not use the tool to harass, defame, or target any individual or institution.",
    ],
  },
  {
    heading: "Petition tool",
    items: [
      "You must not submit fraudulent or fabricated signatures.",
      "Only one signature per person is permitted.",
      "You must provide accurate personal details when signing.",
    ],
  },
];

export function TermsAndConditionsPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/terms-and-conditions"].title,
    description: PAGE_SEO["/terms-and-conditions"].description,
    canonical: `${SITE_BASE_URL}/terms-and-conditions`,
    url: `${SITE_BASE_URL}/terms-and-conditions`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/terms-and-conditions"])],
  });

  return (
    <Section
      variant="default"
      noSnap
      background="background"
      id="terms-and-conditions"
    >
      <div
        ref={ref}
        className="mx-auto w-full max-w-4xl px-6 pb-24 pt-32 sm:px-10 sm:pb-32 sm:pt-40"
      >
        {/* Page header — eyebrow + h1 title. Red TPUK accent reserved here. */}
        <span
          className="entrance-left text-eyebrow text-primary"
          data-entrance-delay="0"
        >
          LEGAL
        </span>
        <h1
          className="entrance-left mt-4 text-headline text-foreground"
          data-entrance-delay="80"
        >
          Terms &amp; Conditions
        </h1>

        {/* ── 1. Acceptance of Terms ───────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          1. Acceptance of Terms
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          By accessing or using this website, you agree to be bound by these
          Terms &amp; Conditions in full. If you do not agree to these terms,
          you must not access or use the website. Your continued use of the site
          constitutes acceptance of these terms and any updates made to them
          from time to time.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          This website is owned and operated by Media &amp; Activism Ltd
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), the
          organisation behind Turning Point UK (&ldquo;TPUK&rdquo;).
        </p>

        {/* ── 2. Intellectual Property Rights ──────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          2. Intellectual Property Rights
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          All content on this website — including text, graphics, logos,
          branding, imagery, video, audio, downloadable materials, and software
          — is the property of Media &amp; Activism Ltd or its licensors and is
          protected by United Kingdom and international intellectual property
          laws.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          You may not reproduce, republish, distribute, transmit, display, sell,
          or otherwise exploit any content from this website without our prior
          written consent. Unauthorised reproduction of TPUK-owned content,
          branding, or materials is strictly prohibited.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          The Turning Point UK name, logos, and associated branding may not be
          used to imply endorsement, partnership, or affiliation without our
          express written permission.
        </p>

        {/* ── 3. User Conduct ──────────────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          3. User Conduct
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          You agree to use this website lawfully and respectfully. You must not
          use the site to commit, encourage, or facilitate any unlawful act, or
          to abuse, threaten, or harass any person. The following rules apply
          specifically to our interactive tools:
        </p>
        {USER_CONDUCT_RULES.map((group, gi) => (
          <div
            key={group.heading}
            className="entrance-left mt-6"
            data-entrance-delay={120 + gi * 80}
          >
            <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-foreground sm:text-xl">
              {group.heading}
            </h3>
            <ul
              className="mt-3 space-y-2 border-l border-border pl-6"
              data-ocid={`terms.conduct.group.${gi + 1}`}
            >
              {group.items.map((item, ii) => (
                <li
                  key={item}
                  data-ocid={`terms.conduct.item.${gi + 1}.${ii + 1}`}
                  className="font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="320"
        >
          We reserve the right to remove any submission that we believe breaches
          these rules and to suspend or restrict access for users who repeatedly
          violate them.
        </p>

        {/* ── 4. Donations & Purchases ─────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          4. Donations &amp; Purchases
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          Voluntary donations made to support the work of Turning Point UK are
          non-refundable except where a refund is required by law. By making a
          donation you acknowledge that it is a voluntary contribution and not a
          payment for goods or services.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          Merchandise purchased through this website is sold subject to the
          terms displayed at the point of sale. Financial transactions are
          handled by our third-party payment provider, and your use of those
          services is subject to their own terms and conditions.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          For information about how we handle your personal data in connection
          with donations and purchases, please see our{" "}
          <Link
            to={ROUTES.privacyPolicy}
            data-ocid="terms.privacy_link"
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-smooth hover:decoration-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* ── 5. Limitation of Liability ───────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          5. Limitation of Liability
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          To the maximum extent permitted by law, Media &amp; Activism Ltd
          accepts no liability for any loss or damage arising from your use of,
          or reliance on, this website or its content. We do not warrant that
          the site will be uninterrupted, error-free, or free of harmful
          components.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          We accept no responsibility for the content of any third-party
          websites linked to from this site, and your use of such links is at
          your own risk.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          To the extent permitted by law, our liability for any user-generated
          submissions — including Education Watch reports and Petition
          signatures — is limited to the maximum extent permitted by applicable
          law. We are not responsible for the accuracy, legality, or
          consequences of content submitted by users.
        </p>

        {/* ── 6. Governing Law ─────────────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          6. Governing Law
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          These Terms &amp; Conditions are governed by the laws of England and
          Wales. Any dispute arising in connection with these terms or your use
          of this website shall be subject to the exclusive jurisdiction of the
          courts of England and Wales.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          This website is operated by Media &amp; Activism Ltd, registered in
          England and Wales under registration number 11786279.
        </p>
      </div>
    </Section>
  );
}
