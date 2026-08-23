import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { POSTER_FLAG_WAVING, VIDEO_FLAG_WAVING } from "@/lib/assets";
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
 * PetitionPage — the petitions hub.
 *
 * SpaceX discipline: full-viewport video hero with the PETITIONS headline, then
 * a section noting real impact (the Gurkha veterans pension petition signed by
 * over 100,000 people), then the NationBuilder petition form + live signature
 * counter embed slot. One idea + one action per screen.
 *
 * The petition form and live counter are third-party NationBuilder embeds
 * pasted in later — this page renders a clearly labelled placeholder slot
 * only. No live integration, no signee data stored here.
 */

export function PetitionPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  useSeoMeta({
    title: PAGE_SEO["/petition"].title,
    description: PAGE_SEO["/petition"].description,
    canonical: `${SITE_BASE_URL}/petition`,
    url: `${SITE_BASE_URL}/petition`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/petition"])],
  });
  return (
    <div ref={ref}>
      <Hero
        eyebrow="Make your voice heard"
        headline="PETITIONS"
        sub="Add your name to the campaigns fighting for Britain."
        videoLabel="Petition hero video"
        buttons={[
          {
            label: "SIGN NOW",
            to: "#sign",
            variant: "primary",
          },
          {
            label: "BECOME AN ACTIVIST",
            to: ROUTES.becomeAnActivist,
            variant: "outline",
          },
        ]}
        lazy={false}
        videoSrc={VIDEO_FLAG_WAVING}
        posterSrc={POSTER_FLAG_WAVING}
      />

      {/* Real impact — the Gurkha veterans pension petition. */}
      <Section
        background="navy"
        variant="center"
        id="impact"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Real impact
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              SIGNATURES THAT COUNT
            </h2>
          </div>

          <div
            data-ocid="petition.impact"
            className="entrance-left mt-12 grid grid-cols-1 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 lg:grid-cols-3"
            data-entrance-delay="320"
          >
            <div className="flex flex-col items-center justify-center gap-2 bg-navy px-6 py-12 text-center">
              <span className="font-display text-5xl font-bold uppercase tracking-tight text-foreground sm:text-6xl">
                100k+
              </span>
              <span className="text-eyebrow text-foreground/70">
                Signatures
              </span>
            </div>
            <div className="flex flex-col justify-center gap-3 bg-navy px-6 py-12 lg:col-span-2 lg:items-start lg:px-10 lg:text-left">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                Gurkha Veterans Pension
              </h3>
              <p className="max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80">
                Our petition demanding equal pension rights for Gurkha veterans
                was signed by over 100,000 people — forcing the issue onto the
                national agenda and delivering real change for those who served.
                That is what a focused, signed, shared campaign can do.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* The British Empire Civilised The World — 16:9 YouTube video section.
          Inline (not a reusable component) per the doNotBuild contract; the
          iframe attribute pattern is reused from OnYouTube.tsx. */}
      <section
        data-ocid="section.petition-video"
        className="w-full bg-background px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Watch
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              The British Empire Civilised The World
            </h2>
          </div>

          <div
            className="entrance-left aspect-video max-w-4xl mx-auto overflow-hidden rounded-2xl border border-blue-800 shadow-[0_0_25px_rgba(220,38,38,0.15)] my-8"
            data-entrance-delay="160"
          >
            <iframe
              src="https://www.youtube.com/embed/lsR4NlHZSCw?si=lsR4NlHZSCw&controls=0"
              title="The British Empire Civilised The World"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Sign the petition — NationBuilder petition form + live counter slot. */}
      <Section
        background="card"
        variant="center"
        id="sign"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Add your name
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              SIGN THE PETITION
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Every signature is a voice Westminster cannot ignore. Add yours
              below and watch the counter climb in real time.
            </p>
          </div>

          <div className="entrance-left mt-12" data-entrance-delay="320">
            {/* Mailchimp petition form — analytics-free. No Mailchimp JS
                (mc-validate.js / jQuery / $mcj) is loaded; the form submits
                natively via its action attribute. All Mailchimp backend hidden
                fields and the honeypot are preserved so submissions route
                directly into Mailchimp. Matches the whistleblower form pattern
                on EducationWatchPage. */}
            <form
              action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;f_id=007dc1e5f0"
              method="post"
              id="mc-embedded-subscribe-form-petition"
              name="mc-embedded-subscribe-form-petition"
              className="validate w-full max-w-2xl mx-auto"
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
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL"
                  required
                  placeholder="Email Address *"
                  className="admin-input"
                  data-ocid="petition.email_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <input
                  type="text"
                  name="FNAME"
                  id="mce-FNAME"
                  placeholder="First Name"
                  className="admin-input"
                  data-ocid="petition.fname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <input
                  type="text"
                  name="LNAME"
                  id="mce-LNAME"
                  placeholder="Last Name"
                  className="admin-input"
                  data-ocid="petition.lname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <select
                  name="group[26661]"
                  id="mce-group[26661]"
                  className="admin-select"
                  data-ocid="petition.region_select"
                >
                  <option value="">Location (Region)</option>
                  <option value="1">North East</option>
                  <option value="2">North West</option>
                  <option value="4">South East</option>
                  <option value="8">South West</option>
                  <option value="16">Midlands</option>
                  <option value="32">London</option>
                  <option value="64">Scotland</option>
                  <option value="128">Wales</option>
                  <option value="256">Northern Ireland</option>
                </select>
              </div>
              {/* Mailchimp bot-protection honeypot — hidden off-screen so human
                  users never see it but bots fill it in. Preserved verbatim. */}
              <div
                aria-hidden="true"
                style={{ position: "absolute", left: "-5000px" }}
              >
                <input
                  type="text"
                  name="b_6fe69c3d0521b617677c81700_2ce1dac979"
                  tabIndex={-1}
                  value=""
                />
              </div>
              {/* Required consent checkbox — must live INSIDE the <form> so the
                  browser blocks submission until it is checked. Mirrors the
                  ContactForm gold-standard pattern. */}
              <div
                data-ocid="petition.consent"
                className="mt-6 flex items-start gap-3"
              >
                <Checkbox
                  id="petition-consent"
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
                  htmlFor="petition-consent"
                  className="font-body text-sm font-light leading-relaxed text-foreground/70"
                >
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>{" "}
                  I consent to Turning Point UK processing my personal data in
                  line with the{" "}
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
                    data-ocid="petition.consent_error"
                    className="font-body text-sm font-medium text-primary"
                  >
                    Please consent to our Privacy Policy to continue.
                  </p>
                )}
              </div>
              {/* Submit button — user-specified exact classes (intentional
                  exception to the square-corner/red-token discipline for this
                  one button). Wrapped in .clear to preserve Mailchimp semantics. */}
              <div className="clear mt-2">
                <input
                  type="submit"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  value="SIGN THE PETITION"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
                  data-ocid="petition.submit_button"
                />
              </div>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
