import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";

/**
 * PrivacyPolicyPage — the Turning Point UK privacy policy.
 *
 * Renders the supplied privacy policy text VERBATIM, preserving every
 * section and sub-paragraph number exactly as supplied — including the
 * out-of-sequence 6.1 under section 5 and the 12.x numbering under
 * section 6. No paraphrasing, no renumbering.
 *
 * Layout: a single full-viewport Section (background="background",
 * noSnap) so the page sits inside the global Layout shell with the
 * deep-blue theme. Crisp bright white headings (text-foreground /
 * text-headline), muted body text (text-foreground/70), red TPUK
 * accent reserved for the page eyebrow and h1 title only.
 *
 * The contact email info@tpointuk.co.uk is a clickable mailto link.
 */

/** Retention schedule bullets (4.3 a–d), rendered as a list. */
const RETENTION_SCHEDULE: string[] = [
  "usage data is retained for 30 months",
  "account data for up to 7 years",
  "transaction data for up to 7 years",
  "newsletter data for as long as opted-in",
];

/** Principal rights bullets (6.1), rendered as a list. */
const PRINCIPAL_RIGHTS: string[] = [
  "the right to access",
  "rectification",
  "erasure",
  "restrict processing",
  "object to processing",
  "data portability",
  "complain to a supervisory authority",
  "and withdraw consent",
];

export function PrivacyPolicyPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/privacy-policy"].title,
    description: PAGE_SEO["/privacy-policy"].description,
    canonical: `${SITE_BASE_URL}/privacy-policy`,
    url: `${SITE_BASE_URL}/privacy-policy`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/privacy-policy"])],
  });

  return (
    <Section
      variant="default"
      noSnap
      background="background"
      id="privacy-policy"
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
          PRIVACY
        </span>
        <h1
          className="entrance-left mt-4 text-headline text-foreground"
          data-entrance-delay="80"
        >
          Privacy Policy
        </h1>

        {/* ── 1. Introduction ───────────────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          1. Introduction
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          1.1 We are committed to safeguarding the privacy of our website
          visitors and service users.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          1.2 This policy applies where we are acting as a data controller with
          respect to the personal data of our website visitors and service
          users; in other words, where we determine the purposes and means of
          the processing of that personal data.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          1.3 We will ask you to consent to our use of cookies in accordance
          with the terms of this policy when you first visit our website.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="200"
        >
          1.4 In this policy, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
          &ldquo;our&rdquo; refer to Turning Point UK.
        </p>

        {/* ── 2. How We Use Your Personal Data ─────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          2. How We Use Your Personal Data
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          2.1 In this Section 2 we have set out: (a) the general categories of
          personal data that we may process; (b) in the case of personal data
          that we did not obtain directly from you, the source and specific
          categories of that data; (c) the purposes for which we may process
          personal data; and (d) the legal basis of the processing.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          2.2 We may process data about your use of our website and services
          (&ldquo;usage data&rdquo;). The usage data may include your IP
          address, geographical location, browser type, and version, operating
          system, referral source, length of visit, page views and website
          navigation paths. The legal basis for this processing is our
          legitimate interests, namely monitoring and improving our website and
          services.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          2.3 We may process your website account data (&ldquo;account
          data&rdquo;) for operating our website, providing services, and
          ensuring security. The legal basis is our legitimate interests.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="200"
        >
          2.4 We may process information relating to transactions
          (&ldquo;transaction data&rdquo;) for supplying purchased services and
          keeping records. The legal basis is the performance of a contract.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="240"
        >
          2.5 We may process information for subscribing to our newsletters
          (&ldquo;newsletter data&rdquo;). The legal basis is consent.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="280"
        >
          2.6 We may process information contained in any communication sent to
          us (&ldquo;message data&rdquo;) for communicating with you and
          record-keeping.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="320"
        >
          2.7 We may process personal data where necessary for the
          establishment, exercise or defence of legal claims.
        </p>

        {/* ── 3. Required Third Party Data Sharing ─────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          3. Required Third Party Data Sharing
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          3.1 We may disclose your personal data to our insurers or professional
          advisers.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          3.2 Financial transactions are handled by PayPal.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          3.3 Email communications are stored securely on Google Suite.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="200"
        >
          3.4 Email updates are distributed through Mail Chimp.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="240"
        >
          3.6 We will never sell your personally identifiable information to any
          third party.
        </p>

        {/* ── 4. Retaining & Deleting Personal Data ─────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          4. Retaining &amp; Deleting Personal Data
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          4.1 Personal data that we process for any purpose shall not be kept
          for longer than is necessary.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          4.3
        </p>
        <ul
          className="entrance-left mt-2 space-y-2 border-l border-border pl-6"
          data-entrance-delay="160"
        >
          {RETENTION_SCHEDULE.map((item, i) => (
            <li
              key={item}
              data-ocid={`privacy.retention.item.${i + 1}`}
              className="font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
            >
              <span className="font-mono text-sm text-primary">
                ({String.fromCharCode(97 + i)})
              </span>{" "}
              {item}
            </li>
          ))}
        </ul>

        {/* ── 5. Your Rights ───────────────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          5. Your Rights
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          6.1 Your principal rights under data protection law are:
        </p>
        <ul
          className="entrance-left mt-2 space-y-2 border-l border-border pl-6"
          data-entrance-delay="120"
        >
          {PRINCIPAL_RIGHTS.map((item, i) => (
            <li
              key={item}
              data-ocid={`privacy.rights.item.${i + 1}`}
              className="font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* ── 6. Our Details ───────────────────────────────────────── */}
        <h2
          className="entrance-left mt-16 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl"
          data-entrance-delay="0"
        >
          6. Our Details
        </h2>
        <p
          className="entrance-left mt-6 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="80"
        >
          12.1 This website is owned and operated by Media &amp; Activism Ltd.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="120"
        >
          12.2 We are registered in England and Wales under registration number
          11786279, and our principal office is at 5 Elstree Gate, Elstree Way,
          Borehamwood, Hertfordshire, United Kingdom, WD6 1JD.
        </p>
        <p
          className="entrance-left mt-4 font-body text-base font-light leading-relaxed text-foreground/70 sm:text-lg"
          data-entrance-delay="160"
        >
          12.3 Contact us via email:{" "}
          <a
            href="mailto:info@tpointuk.co.uk"
            data-ocid="privacy.contact_email"
            className="font-mono text-sm text-primary underline decoration-primary/40 underline-offset-4 transition-smooth hover:decoration-primary"
          >
            info@tpointuk.co.uk
          </a>
        </p>
      </div>
    </Section>
  );
}
