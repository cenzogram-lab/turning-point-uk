import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useState } from "react";

/**
 * BecomeAnActivistPage — the activist signup page.
 *
 * SpaceX discipline: full-viewport video hero with the BECOME AN ACTIVIST
 * headline, then a light section carrying the NationBuilder activist signup
 * form embed slot. One idea + one action per screen.
 *
 * The form itself is a third-party NationBuilder embed pasted in later — this
 * page renders a clearly labelled placeholder slot only. No live integration.
 *
 * Below the signup form: a dedicated 16:9 "Standing Up On Campus" video
 * section embedding YouTube video fkDzedP7E20. The EndorsementsSlider now
 * renders globally via the shared Layout (above the Footer) on every route,
 * so it is no longer mounted on this page. Both sections reuse the universal
 * entrance animation pattern observed by this page's
 * useEntranceAnimation containerRef.
 */

const STANDING_UP_VIDEO_SRC =
  "https://www.youtube.com/embed/fkDzedP7E20?si=fkDzedP7E20&controls=0";

/**
 * ACTIVISM_PHOTOS — the four assigned activism photos for the
 * "Standing Up On Campus" gallery section. Files are copied verbatim from
 * .platform/attachments/ into src/frontend/public/assets/activism/ and
 * referenced via absolute /assets/activism/<filename> paths.
 */
const ACTIVISM_PHOTOS: { src: string; alt: string }[] = [
  {
    src: "/assets/activism/img_2670-01a0079f-a797-76de-aa65-a2145d261370.jpg",
    alt: "Three activists holding capitalism and socialism leaflets at a Turning Point UK street stall.",
  },
  {
    src: "/assets/activism/snapchat-1339628970-01a007b9-75b3-767f-b23c-b4bb591126ed.jpg",
    alt: "Young woman holding a red 'NOTHING IS FREE' protest sign at a Turning Point UK action.",
  },
  {
    src: "/assets/activism/home-600x450-1-019fd809-c4a6-75ba-904e-d275f8c3ca4d.webp",
    alt: "Group of Turning Point UK activists holding a banner beside a red double-decker bus on a city street.",
  },
  {
    src: "/assets/activism/wolverhampton-1-01a007b9-74d1-7488-8bc0-3a5b218b2d3e.webp",
    alt: "Activist holding a free-speech poster outside the University of Wolverhampton.",
  },
];

export function BecomeAnActivistPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  useSeoMeta({
    title: PAGE_SEO["/become-an-activist"].title,
    description: PAGE_SEO["/become-an-activist"].description,
    canonical: `${SITE_BASE_URL}/become-an-activist`,
    url: `${SITE_BASE_URL}/become-an-activist`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/become-an-activist"])],
  });
  return (
    <div ref={ref}>
      <Hero
        eyebrow="Activism"
        headline="BECOME AN ACTIVIST"
        sub="Stand up against the woke mob. Get trained, get equipped, get active."
        videoLabel="Become an activist hero video"
        buttons={[
          {
            label: "SIGN UP NOW",
            to: "#signup",
            variant: "primary",
          },
          {
            label: "ORDER A KIT",
            to: ROUTES.activismKit,
            variant: "outline",
          },
        ]}
        lazy={false}
      />

      {/* Light section — NationBuilder activist signup form embed slot. */}
      <Section
        background="card"
        variant="center"
        id="signup"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Sign up
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              JOIN THE FRONT LINE
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Fill in the form below and a member of our activism team will be
              in touch with training, resources, and your first campaign.
            </p>
          </div>

          <div className="entrance-right mt-12" data-entrance-delay="320">
            {/* Activist signup form — Mailchimp subscribe form.
                No Mailchimp JS (mc-validate.js / jQuery / $mcj) is loaded; the
                form submits natively via its action attribute. All Mailchimp
                backend hidden fields, tags, and the honeypot are preserved so
                submissions route directly into Mailchimp. Mirrors the
                whistleblower form pattern on EducationWatchPage. */}
            <form
              action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;f_id=0078c1e5f0"
              method="post"
              id="mc-embedded-subscribe-form-activist"
              name="mc-embedded-subscribe-form"
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
                <label
                  htmlFor="mce-EMAIL-activist"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  E-mail Address *
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL-activist"
                  required
                  className="admin-input"
                  data-ocid="activist.email_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-FNAME-activist"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="FNAME"
                  id="mce-FNAME-activist"
                  className="admin-input"
                  data-ocid="activist.fname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-LNAME-activist"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="LNAME"
                  id="mce-LNAME-activist"
                  className="admin-input"
                  data-ocid="activist.lname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE7-activist"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="MMERGE7"
                  id="mce-MMERGE7-activist"
                  className="admin-input"
                  data-ocid="activist.mobile_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE12-activist"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Country / City
                </label>
                <input
                  type="text"
                  name="MMERGE12"
                  id="mce-MMERGE12-activist"
                  className="admin-input"
                  data-ocid="activist.country_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE13-activist"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Criminal Convictions
                </label>
                <input
                  type="text"
                  name="MMERGE13"
                  id="mce-MMERGE13-activist"
                  className="admin-input"
                  data-ocid="activist.convictions_input"
                />
              </div>
              {/* Mailchimp hidden tags input — routes the submission into the
                  correct Mailchimp audience/tag. Preserved verbatim. */}
              <input type="hidden" name="tags" value="10158641" />
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
                data-ocid="activist.consent"
                className="mt-6 flex items-start gap-3"
              >
                <Checkbox
                  id="activist-consent"
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
                  htmlFor="activist-consent"
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
                    data-ocid="activist.consent_error"
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
                  value="APPLY TO BECOME AN ACTIVIST"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
                  data-ocid="activist.submit_button"
                />
              </div>
            </form>
          </div>
        </div>
      </Section>

      {/* Activism in action — photo gallery showing real activism scenes to
          inspire signups. Placed between the signup form and the "Standing Up
          On Campus" YouTube embed so a freshly-signed-up visitor sees the
          movement they are joining before the video. Reuses the universal
          photo tile pattern from UniversitySocietiesPage: group relative flex
          aspect-[4/5] flex-col justify-end bg-background wrapper; absolute
          inset-0 overflow-hidden bg-image-fallback inner; img with
          loading="lazy" decoding="async" object-cover transition-smooth
          duration-500 group-hover:scale-[1.04] group-hover:brightness-110.
          Grid wrapper: grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden
          border border-foreground/15 bg-foreground/15 with
          data-entrance-delay="320". */}
      <Section
        background="card"
        variant="center"
        id="activism-in-action"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Join the fight
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              STANDING UP ON CAMPUS
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              From interview tables to banner drops, this is what activism looks
              like on the ground. Real members, real courage, real change.
            </p>
          </div>

          <div
            data-ocid="activism-photos.grid"
            className="entrance-left mt-12 grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3"
            data-entrance-delay="320"
          >
            {ACTIVISM_PHOTOS.map((photo, i) => (
              <figure
                key={photo.src}
                data-ocid={`activism-photos.tile.${i}`}
                className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden bg-image-fallback"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      {/* Standing Up On Campus — dedicated 16:9 YouTube video section.
          Inline (not a reusable component) per the doNotBuild contract.
          Container spec and iframe attributes follow the OnYouTube.tsx
          reference pattern, with the assigned title rendered as a visible
          heading above the player. */}
      <section
        data-ocid="section.standing-up-on-campus"
        className="w-full px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-10 flex flex-col gap-3">
            <span
              className="entrance-left text-eyebrow text-red-500"
              data-entrance-delay="0"
            >
              On Campus
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Standing Up On Campus
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="160"
            >
              Real students, real courage. Watch how young activists are pushing
              back against the woke mob on campuses across the country.
            </p>
          </div>

          <div
            className="entrance-left aspect-video mx-auto my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-blue-800 shadow-[0_0_25px_rgba(220,38,38,0.15)]"
            data-entrance-delay="240"
          >
            <iframe
              src={STANDING_UP_VIDEO_SRC}
              title="Standing Up On Campus"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
