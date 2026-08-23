import { ContactForm } from "@/components/ContactForm";
import { Hero } from "@/components/Hero";
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
 * ContactPage — full-viewport hero + contact form + large social buttons.
 *
 * SpaceX discipline: one idea + one action per screen. The hero is the
 * single full-viewport moment. Below it: the reusable ContactForm component
 * (a self-contained Mailchimp contact form with its own consent block),
 * then a row of large square social buttons linking to each platform.
 * Social URLs are placeholders for now.
 */

interface SocialButton {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface GalleryPhoto {
  src: string;
  alt: string;
}

/**
 * "ON THE GROUND" photo grid for the contact page — community and
 * campus activism photos showing people engaging with the movement.
 * Uses the established site photo tile pattern (group relative flex
 * aspect-[4/5] flex-col justify-end bg-background; inner absolute
 * inset-0 overflow-hidden bg-image-fallback; img loading='lazy'
 * decoding='async' object-cover group-hover:scale-[1.04]
 * group-hover:brightness-110). No captions, no scrim — image-only
 * tiles, matching the ActivismPage movement grid discipline.
 */
const COMMUNITY_PHOTOS: GalleryPhoto[] = [
  {
    src: "/assets/activism/snapchat-1339628970-01a007b9-75b3-767f-b23c-b4bb591126ed.jpg",
    alt: "Young woman holding a red 'NOTHING IS FREE' protest sign at a Turning Point UK action.",
  },
  {
    src: "/assets/activism/img_2670-01a0079f-a797-76de-aa65-a2145d261370.jpg",
    alt: "Three activists holding capitalism and socialism leaflets at a Turning Point UK street stall.",
  },
  {
    src: "/assets/gallery/img_6390-019fff0e-00cf-7489-badd-850b8d63551f.webp",
    alt: "Man holding a 'SOCIALISM SUCKS' poster at a Turning Point UK stall.",
  },
  {
    src: "/assets/gallery/img_6402-019fff0e-0118-763b-bae0-1c5a0441776b.webp",
    alt: "Man holding a 'CAPITALISM CURES POVERTY' sign at a Turning Point UK event.",
  },
  {
    src: "/assets/activism/wolverhampton-1-01a007b9-74d1-7488-8bc0-3a5b218b2d3e.webp",
    alt: "Activist holding a free-speech poster outside the University of Wolverhampton.",
  },
  {
    src: "/assets/activism/manchester2-optimized-01a007b9-74f2-749a-9bbe-80f7ffb957e5.webp",
    alt: "Young man holding a 'Reasons to be a Socialist' flyer at a Turning Point UK street stall.",
  },
  {
    src: "/assets/gallery/winchester1-1-1-01a007b9-74f3-7610-9c9b-7a48b54a9589.jpg",
    alt: "Woman holding a 'FREE MARKETS, FREE PEOPLE' placard with the Turning Point UK hashtag.",
  },
  {
    src: "/assets/gallery/img_6405-019fff0e-00c5-75d0-a6a4-8626571c1979.webp",
    alt: "Whiteboard street poll comparing capitalism and socialism at a Turning Point UK event.",
  },
];

const SOCIAL_BUTTONS: SocialButton[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/turningpointuk",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/turningpointuk",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/turningpointuk",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.5.01-4.74.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.39-.32-1.71a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.59-.07-4.74-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08Zm6.95-9.22a1.27 1.27 0 1 1-2.55 0 1.27 1.27 0 0 1 2.55 0Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@turningpointuk",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    ),
  },
];

export function ContactPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/contact"].title,
    description: PAGE_SEO["/contact"].description,
    canonical: `${SITE_BASE_URL}/contact`,
    url: `${SITE_BASE_URL}/contact`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/contact"])],
  });

  return (
    <div ref={ref}>
      <Hero
        eyebrow="Get in touch"
        headline="CONTACT"
        sub="Questions, press enquiries, or ready to get involved?"
        videoLabel="Contact hero video"
      />

      {/* Contact form zone — intro paragraphs, form embed, consent, press line. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="contact-form"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              SEND US A MESSAGE
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              We read every message
            </h2>
          </div>

          {/* Intro paragraphs — newsletter signup + join/contact lead-in. */}
          <div
            data-ocid="contact.intro_paragraphs"
            className="entrance-left mb-10 flex flex-col gap-5 text-center"
            data-entrance-delay="160"
          >
            <p className="mx-auto max-w-2xl font-body text-base font-light leading-relaxed text-foreground/85 sm:text-lg">
              If you want to help us redress the balance and get equipped to
              speak out by receiving information on action days, meetings and
              national events, you can sign up for our newsletter.
            </p>
            <p className="mx-auto max-w-2xl font-body text-base font-light leading-relaxed text-foreground/85 sm:text-lg">
              But if you want to take the next step and join us, or if you need
              to contact us about anything else, you can use the form below.
            </p>
          </div>

          <div className="entrance-left" data-entrance-delay="280">
            <ContactForm />

            {/* Consent notice — sits directly beneath the form + checkbox. */}
            <p
              data-ocid="contact.consent_notice"
              className="mt-6 text-center font-body text-sm font-light leading-relaxed text-foreground/60"
            >
              By contacting us, you consent to us contacting you by e-mail.
            </p>

            {/* Press enquiries — clickable mailto with red accent. */}
            <p
              data-ocid="contact.press_line"
              className="mt-4 text-center font-body text-sm font-light leading-relaxed text-foreground/70"
            >
              (For any press enquiries, please e-mail us directly at{" "}
              <a
                href="mailto:press@tpointuk.co.uk"
                data-ocid="contact.press_email_link"
                className="text-primary underline underline-offset-2 transition-smooth hover:text-primary/80"
              >
                press@tpointuk.co.uk
              </a>
              .)
            </p>
          </div>
        </div>
      </Section>

      {/* On the ground — community and campus activism photo grid. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="contact-gallery"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              On the ground
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              OUR MOVEMENT IN ACTION
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Real people, real streets, real campuses. This is the community
              you join when you get in touch.
            </p>
          </div>

          <div
            data-ocid="contact.photos"
            className="entrance-left grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 sm:grid-cols-3 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {COMMUNITY_PHOTOS.map((photo, i) => (
              <div
                key={photo.src}
                data-ocid={`contact.photo.${i}`}
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
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Large social buttons — navy surface for zone change. */}
      <Section
        variant="center"
        background="navy"
        noSnap
        id="contact-social"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              FOLLOW THE MOVEMENT
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Find us everywhere
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Tap a platform to follow, share, and join the conversation.
            </p>
          </div>

          <div
            data-ocid="contact.social_grid"
            className="entrance-left grid grid-cols-2 gap-px overflow-hidden border border-foreground/15 bg-foreground/15 lg:grid-cols-4"
            data-entrance-delay="320"
          >
            {SOCIAL_BUTTONS.map((social, i) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid={`contact.social_button.${i}`}
                aria-label={social.label}
                className="group flex aspect-square w-full flex-col items-center justify-center gap-4 bg-navy transition-smooth hover:bg-primary hover:text-primary-foreground"
              >
                <span className="text-foreground/80 transition-smooth group-hover:text-primary-foreground">
                  {social.icon}
                </span>
                <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-foreground/90 transition-smooth group-hover:text-primary-foreground">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
