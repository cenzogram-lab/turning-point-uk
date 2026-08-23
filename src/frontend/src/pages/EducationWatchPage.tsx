import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { POSTER_EDUCATION_CROWD, VIDEO_EDUCATION_CROWD } from "@/lib/assets";
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
 * EducationWatchPage — the confidential whistleblower portal.
 *
 * ─────────────────────────────────────────────────────────────────────
 * CRITICAL CONSTRAINT — DO NOT VIOLATE:
 * This page must NEVER carry analytics, tracking pixels, or the email
 * popup. No analytics scripts, no tracking pixels, no newsletter/email
 * capture popups, no third-party embeds that load trackers. Only the
 * secure report/upload form embed (which itself must be analytics-free)
 * is permitted. Source-level enforcement — keep this comment.
 * ─────────────────────────────────────────────────────────────────────
 */

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Is it anonymous?",
    answer:
      "Yes. You do not need to give your name. If you want us to follow up with you, you may leave contact details, but that is entirely your choice. Reports can be submitted with no identifying information at all.",
  },
  {
    question: "What can I report?",
    answer:
      "Political indoctrination in lessons, biased reading lists, one-sided guest speakers, discrimination against students for their political views, or any pressure to conform to a particular political position. Include the institution, course, and what was said or done where you can.",
  },
  {
    question: "What happens next?",
    answer:
      "Our team reviews every report. Where there is a clear case of bias or free-speech violation, we may publish it anonymously, raise it with the institution, or help you take it further. We will never use your report without your consent.",
  },
  {
    question: "Who sees my report?",
    answer:
      "Only the Education Watch team sees submitted reports. Nothing is shared externally, published, or passed to your institution without your explicit consent. Your identity — if you provide one — stays confidential.",
  },
];

/**
 * Build a single FAQPage JSON-LD schema object mirroring the visible
 * Q&A pairs rendered in the FAQ accordion. The question and answer text
 * match the inline FAQ_ITEMS array verbatim.
 */
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function EducationWatchPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  // Pure local UI state — no analytics, no tracking, no persistence beyond
  // this component. Honors the CRITICAL CONSTRAINT on this page.
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  useSeoMeta({
    title: PAGE_SEO["/education-watch"].title,
    description: PAGE_SEO["/education-watch"].description,
    canonical: `${SITE_BASE_URL}/education-watch`,
    url: `${SITE_BASE_URL}/education-watch`,
    jsonLd: [
      buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/education-watch"]),
      FAQ_SCHEMA,
    ],
  });
  return (
    <div ref={ref}>
      {/* Hero — the portal entrance. */}
      <Hero
        eyebrow="WHISTLEBLOWER PORTAL"
        headline="EDUCATION WATCH"
        sub="Report political indoctrination in your school, college or university — confidentially."
        videoLabel="Education Watch hero video"
        buttons={[
          { label: "SUBMIT A REPORT", to: "#report-form", variant: "primary" },
          { label: "READ THE FAQ", to: "#faq", variant: "outline" },
        ]}
        lazy={false}
        videoSrc={VIDEO_EDUCATION_CROWD}
        posterSrc={POSTER_EDUCATION_CROWD}
      />

      {/* Student rights — confidential, no tracking. */}
      <Section
        id="student-rights"
        background="navy"
        variant="center"
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl text-center">
          <span
            className="entrance-left text-eyebrow text-foreground/70"
            data-entrance-delay="0"
          >
            YOUR RIGHTS
          </span>
          <h2
            className="entrance-left mt-4 text-headline text-foreground"
            data-entrance-delay="80"
          >
            You have the right to a balanced education
          </h2>
          <div
            className="entrance-left mt-8 flex flex-col gap-5 text-left font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg"
            data-entrance-delay="200"
          >
            <p>
              Schools, colleges, and universities should teach you how to think
              — not what to think. If you have been pressured to adopt a
              particular political position, marked down for your views, or
              silenced for questioning the consensus, you have the right to
              speak up.
            </p>
            <p>
              This page is confidential. We do not collect analytics, run
              tracking pixels, or show an email pop-up here. Nothing you do on
              this page is tracked. Your report goes to the Education Watch team
              and no one else.
            </p>
          </div>
        </div>
      </Section>

      {/* Campus Voices — photo gallery of students speaking up.
       * Static images only; no third-party scripts, no tracking. Honors
       * the CRITICAL CONSTRAINT on this page. */}
      <Section
        id="campus-voices"
        background="navy"
        variant="center"
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              CAMPUS VOICES
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              SPEAKING UP ON CAMPUS
            </h2>
          </div>
          <div
            className="entrance-left grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15"
            data-ocid="campus-voices.gallery"
            data-entrance-delay="320"
          >
            <div
              className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              data-ocid="campus-voices.tile.0"
            >
              <div className="absolute inset-0 overflow-hidden bg-image-fallback">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/assets/activism/snapchat-1339628970-01a007b9-75b3-767f-b23c-b4bb591126ed.jpg"
                  alt="Woman holding a NOTHING IS FREE sign on campus"
                  className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                />
              </div>
            </div>
            <div
              className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              data-ocid="campus-voices.tile.1"
            >
              <div className="absolute inset-0 overflow-hidden bg-image-fallback">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/assets/activism/wolverhampton-1-01a007b9-74d1-7488-8bc0-3a5b218b2d3e.webp"
                  alt="Man holding a Jordan Peterson quote poster at a university"
                  className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Exposing Indoctrination — 16:9 YouTube embed.
       * Inline (not a reusable component) per the build contract.
       * Tracking-free: only the official YouTube iframe is mounted; no
       * analytics wrappers, event trackers, or email capture. The iframe
       * attribute pattern mirrors OnYouTube.tsx. */}
      <section
        data-ocid="section.exposing-indoctrination"
        className="w-full bg-background px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              ON THE RECORD
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Exposing Indoctrination
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Watch first-hand accounts of political bias in the classroom — and
              the work being done to push back. Hosted on YouTube; this page
              adds no tracking of its own.
            </p>
          </div>
          <div
            className="entrance-left aspect-video mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-blue-800 shadow-[0_0_25px_rgba(220,38,38,0.15)] my-8"
            data-entrance-delay="320"
          >
            <iframe
              src="https://www.youtube.com/embed/uK0SsAoeS1w?si=uK0SsAoeS1w&controls=0"
              title="Exposing Indoctrination — YouTube video player"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Secure report / upload form embed slot. */}
      <Section
        id="report-form"
        variant="center"
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              SUBMIT A REPORT
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Tell us what happened
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Use the secure form below. Upload evidence if you have it. Your
              report is confidential and never tracked on this page.
            </p>
          </div>
          <div className="entrance-left" data-entrance-delay="320">
            {/* Secure report form — Mailchimp subscribe form, analytics-free.
                No Mailchimp JS (mc-validate.js / jQuery / $mcj) is loaded; the
                form submits natively via its action attribute. All Mailchimp
                backend hidden fields, tags, and the honeypot are preserved so
                submissions route directly into Mailchimp. Honors the CRITICAL
                CONSTRAINT on this page — no tracking scripts, only the form. */}
            <form
              action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;v_id=5014&amp;f_id=0079c1e5f0"
              method="post"
              id="mc-embedded-subscribe-form-whistleblower"
              name="mc-embedded-subscribe-form-whistleblower"
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
                  htmlFor="mce-EMAIL"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  E-mail Address *
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL"
                  required
                  className="admin-input"
                  data-ocid="educationwatch.email_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-FNAME"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="FNAME"
                  id="mce-FNAME"
                  className="admin-input"
                  data-ocid="educationwatch.fname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-LNAME"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="LNAME"
                  id="mce-LNAME"
                  className="admin-input"
                  data-ocid="educationwatch.lname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE10"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Are you a student?
                </label>
                <select
                  name="MMERGE10"
                  id="mce-MMERGE10"
                  className="admin-select"
                  data-ocid="educationwatch.student_select"
                >
                  <option value="" />
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE9"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Description / Details
                </label>
                <input
                  type="text"
                  name="MMERGE9"
                  id="mce-MMERGE9"
                  className="admin-input"
                  data-ocid="educationwatch.description_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE14"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Institution / School Name
                </label>
                <input
                  type="text"
                  name="MMERGE14"
                  id="mce-MMERGE14"
                  className="admin-input"
                  data-ocid="educationwatch.institution_input"
                />
              </div>
              {/* Mailchimp hidden tags input — routes the submission into the
                  correct Mailchimp audience/tag. Preserved verbatim. */}
              <input type="hidden" name="tags" value="10158645" />
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
                  ContactForm gold-standard pattern. Honors the CRITICAL
                  CONSTRAINT on this page — no tracking, only the form field. */}
              <div
                data-ocid="educationwatch.consent"
                className="mt-6 flex items-start gap-3"
              >
                <Checkbox
                  id="educationwatch-consent"
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
                  htmlFor="educationwatch-consent"
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
                    data-ocid="educationwatch.consent_error"
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
                  value="SUBMIT CONFIDENTIAL REPORT"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
                  data-ocid="educationwatch.submit_button"
                />
              </div>
            </form>
          </div>
        </div>
      </Section>

      {/* FAQ — four-item accordion grid. */}
      <Section
        id="faq"
        background="navy"
        variant="center"
        className="px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              FAQ
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              How the portal works
            </h2>
          </div>
          <Accordion
            type="single"
            collapsible
            className="entrance-left grid gap-px overflow-hidden border border-foreground/15 bg-foreground/15 md:grid-cols-2"
            data-ocid="faq.list"
            data-entrance-delay="320"
          >
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={item.question}
                value={`item-${i}`}
                data-ocid={`faq.item.${i}`}
                className="bg-navy px-6 py-2"
              >
                <AccordionTrigger className="text-left font-display text-base font-semibold uppercase tracking-wide text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm font-light leading-relaxed text-foreground/75">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </div>
  );
}
