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
 * ActivismKitPage — the activism kit page.
 *
 * SpaceX discipline: full-viewport video hero with the ACTIVISM KIT headline,
 * then a four-card WHAT'S INSIDE grid, then the kit order form. One idea + one
 * action per screen.
 *
 * The order form is a Mailchimp subscribe form, analytics-free. No Mailchimp
 * JS (mc-validate.js / jQuery / $mcj) is loaded; the form submits natively via
 * its action attribute. All Mailchimp backend hidden fields and the honeypot
 * are preserved so submissions route directly into Mailchimp. Mirrors the
 * whistleblower form pattern on EducationWatchPage.
 */

const ORGANISING_CAMPAIGN_VIDEO_SRC =
  "https://www.youtube.com/embed/ucbkvGoIZcg?si=ucbkvGoIZcg&controls=0";

interface KitItem {
  title: string;
  description: string;
}

const KIT_ITEMS: KitItem[] = [
  {
    title: "Leaflets",
    description:
      "Print-ready leaflets for door-to-door canvassing and campus handouts. Customisable with your chapter branding.",
  },
  {
    title: "Banners",
    description:
      "Bold, weatherproof banners for rallies, stalls, and street campaigns. Built to be seen from a distance.",
  },
  {
    title: "Placards",
    description:
      "Sturdy placards for demonstrations and photo moments. Carry the message loud and clear.",
  },
  {
    title: "Stickers",
    description:
      "Laptop, helmet, and street stickers. Small, sticky, and impossible to ignore.",
  },
];

interface KitInActionPhoto {
  src: string;
  alt: string;
}

/* KIT IN THE FIELD — four photos of activists using kit materials in the
   field (placards, flyers, banners, table setups). Placed AFTER the
   WHAT'S INSIDE grid and BEFORE the ORGANISING YOUR CAMPAIGN video so the
   page rhythm reads: what's in the kit → what it looks like in action →
   how to organise → order. Uses the established photo tile pattern from
   UniversitySocietiesPage. */
const KIT_IN_ACTION_PHOTOS: KitInActionPhoto[] = [
  {
    src: "/assets/activism/manchester2-optimized-01a007b9-74f2-749a-9bbe-80f7ffb957e5.webp",
    alt: "Young man holding a 'Reasons to be a Socialist' flyer at a Turning Point UK street stall.",
  },
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
];

export function ActivismKitPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();
  // Pure local UI state for the consent checkbox — no persistence beyond
  // this component. Mirrors the EducationWatchPage consent pattern.
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  useSeoMeta({
    title: PAGE_SEO["/activism-kit"].title,
    description: PAGE_SEO["/activism-kit"].description,
    canonical: `${SITE_BASE_URL}/activism-kit`,
    url: `${SITE_BASE_URL}/activism-kit`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/activism-kit"])],
  });
  return (
    <div ref={ref}>
      <Hero
        eyebrow="Tools for the movement"
        headline="ACTIVISM KIT"
        sub="Flyers, banners, placards and stickers."
        videoLabel="Activism kit hero video"
        buttons={[
          {
            label: "ORDER A KIT",
            to: "#order",
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

      {/* WHAT'S INSIDE — four-card grid. */}
      <Section
        background="background"
        variant="center"
        id="whats-inside"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              The kit
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              WHAT'S INSIDE
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Four essentials. One kit. Ready to deploy.
            </p>
          </div>

          <div
            data-ocid="kit.cards"
            className="entrance-left mt-14 grid grid-cols-1 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {KIT_ITEMS.map((item, i) => (
              <div
                key={item.title}
                data-ocid={`kit.card.${i}`}
                className="flex h-full flex-col bg-background p-8"
              >
                <span className="text-eyebrow text-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 font-body text-sm font-light leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* KIT IN THE FIELD — photo gallery of activists using kit materials.
          Placed AFTER the WHAT'S INSIDE grid and BEFORE the ORGANISING YOUR
          CAMPAIGN video. Uses the established photo tile pattern: group
          relative flex aspect-[4/5] flex-col justify-end bg-background wrapper;
          inner absolute inset-0 overflow-hidden bg-image-fallback div; img with
          loading='lazy' decoding='async' object-cover + group-hover scale/brightness.
          Grid wrapper: grid gap-px overflow-hidden border border-foreground/15
          bg-foreground/15 + responsive cols, with data-entrance-delay='320'. */}
      <Section
        background="background"
        variant="center"
        id="kit-in-the-field"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              In action
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              KIT IN THE FIELD
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Placards, banners, flyers, and tables — deployed by activists
              across the country.
            </p>
          </div>

          <div
            data-ocid="kit.photos"
            className="entrance-left mt-14 grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {KIT_IN_ACTION_PHOTOS.map((photo, i) => (
              <div
                key={photo.src}
                data-ocid={`kit.photo.${i}`}
                className="group relative flex aspect-[4/5] flex-col justify-end bg-background"
              >
                <div className="absolute inset-0 overflow-hidden bg-image-fallback">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-smooth duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ORGANISING YOUR CAMPAIGN — 16:9 YouTube embed section. */}
      <Section
        background="background"
        variant="center"
        id="organising-your-campaign"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Field training
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              ORGANISING YOUR CAMPAIGN
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Watch the playbook. Then take it to the streets.
            </p>
          </div>

          <div
            data-ocid="section.organising-campaign.video"
            className="entrance-left aspect-video mx-auto max-w-4xl w-full overflow-hidden rounded-2xl border border-blue-800 shadow-[0_0_25px_rgba(220,38,38,0.15)] my-8"
            data-entrance-delay="320"
          >
            <iframe
              src={ORGANISING_CAMPAIGN_VIDEO_SRC}
              title="Organising Your Campaign - YouTube video player"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </Section>

      {/* Order form — Mailchimp kit order form, analytics-free.
          No Mailchimp JS (mc-validate.js / jQuery / $mcj) is loaded; the form
          submits natively via its action attribute. All Mailchimp backend
          hidden fields and the honeypot are preserved so submissions route
          directly into Mailchimp. Mirrors the whistleblower form pattern on
          EducationWatchPage. */}
      <Section
        background="card"
        variant="center"
        id="order"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              Order
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              REQUEST YOUR KIT
            </h2>
            <p
              className="entrance-left max-w-xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Submit the form below and we'll dispatch your activism kit. Every
              order funds the movement.
            </p>
          </div>

          <div className="entrance-right mt-12" data-entrance-delay="320">
            <form
              action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;v_id=5016&amp;f_id=007fc1e5f0"
              method="post"
              id="mc-embedded-subscribe-form-kit"
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
                  data-ocid="kit.email_input"
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
                  data-ocid="kit.fname_input"
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
                  data-ocid="kit.lname_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE3-addr1"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Address
                </label>
                <input
                  type="text"
                  name="MMERGE3[addr1]"
                  id="mce-MMERGE3-addr1"
                  maxLength={70}
                  className="admin-input"
                  data-ocid="kit.address1_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE3-addr2"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="MMERGE3[addr2]"
                  id="mce-MMERGE3-addr2"
                  maxLength={70}
                  className="admin-input"
                  data-ocid="kit.address2_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE3-city"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  City
                </label>
                <input
                  type="text"
                  name="MMERGE3[city]"
                  id="mce-MMERGE3-city"
                  maxLength={40}
                  className="admin-input"
                  data-ocid="kit.city_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE3-state"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  State/Province/Region
                </label>
                <input
                  type="text"
                  name="MMERGE3[state]"
                  id="mce-MMERGE3-state"
                  maxLength={20}
                  className="admin-input"
                  data-ocid="kit.state_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE3-zip"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Postal/Zip Code
                </label>
                <input
                  type="text"
                  name="MMERGE3[zip]"
                  id="mce-MMERGE3-zip"
                  maxLength={10}
                  className="admin-input"
                  data-ocid="kit.zip_input"
                />
              </div>
              <div className="mc-field-group mb-5">
                <label
                  htmlFor="mce-MMERGE3-country"
                  className="block mb-2 font-body text-sm font-medium text-foreground"
                >
                  Country
                </label>
                <select
                  name="MMERGE3[country]"
                  id="mce-MMERGE3-country"
                  className="admin-select"
                  defaultValue="United Kingdom"
                  data-ocid="kit.country_select"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Ireland">Ireland</option>
                </select>
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
                  data-ocid="kit.student_select"
                >
                  <option value="" />
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
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
                  data-ocid="kit.institution_input"
                />
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
                data-ocid="kit.consent"
                className="mt-6 flex items-start gap-3"
              >
                <Checkbox
                  id="kit-consent"
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
                  htmlFor="kit-consent"
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
                    data-ocid="kit.consent_error"
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
                  value="REQUEST FREE ACTIVISM KIT"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
                  data-ocid="kit.submit_button"
                />
              </div>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
