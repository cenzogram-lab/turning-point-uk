import { Checkbox } from "@/components/ui/checkbox";
import { ROUTES } from "@/lib/routes";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

/**
 * ContactForm — reusable Mailchimp contact form.
 *
 * Submits natively via the action attribute to the Turning Point UK
 * Mailchimp audience. No Mailchimp JS (mc-validate.js / jQuery / $mcj)
 * is loaded; the form posts directly to Mailchimp. All Mailchimp backend
 * hidden fields, tags, and the honeypot are preserved verbatim so
 * submissions route correctly into the audience.
 *
 * Form id is suffixed `-contact` to avoid duplicate-id collisions with the
 * other Mailchimp forms on the site (EducationWatch, Petition, etc.).
 * The component is self-contained and reusable — embed it on /contact or
 * globally above the footer.
 */
export function ContactForm() {
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  return (
    <form
      action="https://tpointuk.us3.list-manage.com/subscribe/post?u=6fe69c3d0521b617677c81700&amp;id=2ce1dac979&amp;f_id=007cc1e5f0"
      method="post"
      id="mc-embedded-subscribe-form-contact"
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
          placeholder="you@example.com"
          className="admin-input"
          data-ocid="contact.email_input"
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
          placeholder="First Name"
          className="admin-input"
          data-ocid="contact.fname_input"
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
          placeholder="Last Name"
          className="admin-input"
          data-ocid="contact.lname_input"
        />
      </div>
      <div className="mc-field-group mb-5">
        <label
          htmlFor="mce-MMERGE9"
          className="block mb-2 font-body text-sm font-medium text-foreground"
        >
          Comment / Message
        </label>
        <textarea
          name="MMERGE9"
          id="mce-MMERGE9"
          rows={4}
          placeholder="How can we help or what is this regarding?"
          className="admin-input"
          data-ocid="contact.message_textarea"
        />
      </div>
      {/* Mailchimp hidden tags input — routes the submission into the
          correct Mailchimp audience/tag. Preserved verbatim. */}
      <input type="hidden" name="tags" value="10158645" />
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
          id="mc-embedded-subscribe-contact"
          value="SEND MESSAGE"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-4 px-8 rounded-md transition-colors duration-200"
          data-ocid="contact.submit_button"
        />
      </div>
      {/* Shared consent block — matches the pattern on EducationWatchPage,
          PetitionPage, ActivismKitPage, and UniversitySocietiesPage. */}
      <div data-ocid="contact.consent" className="mt-6 flex items-start gap-3">
        <Checkbox
          id="contact-consent"
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
          htmlFor="contact-consent"
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
            data-ocid="contact.consent_error"
            className="font-body text-sm font-medium text-primary"
          >
            Please consent to our Privacy Policy to continue.
          </p>
        )}
      </div>
    </form>
  );
}
