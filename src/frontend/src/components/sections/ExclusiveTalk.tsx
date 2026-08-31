import { IMAGE_EXCLUSIVE_TALK_POSTER } from "@/lib/assets";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useState } from "react";

/**
 * ExclusiveTalk — the featured talk poster, rendered directly below the
 * VigilSpotlight on the homepage.
 *
 * The poster is a self-contained flyer: speaker, date, time, venue and QR
 * code are all baked into the artwork. The section therefore does NOT restate
 * that copy as body text — two sources of truth would drift apart the moment
 * the poster is reissued. What it DOES surface beside the artwork is the
 * three facts a visitor scanning the page needs without stopping to read a
 * dense flyer: when, what time, and where. Those are short enough to keep in
 * sync by hand, and they make the event legible on a phone where the poster
 * renders small.
 *
 * The full poster text is carried in the image's `alt`, so screen-reader
 * users get everything a sighted reader can take off the flyer.
 *
 * LAYOUT: the poster is portrait (~2:3), so it is capped by HEIGHT rather
 * than width — constraining a tall flyer by width alone makes it taller than
 * the viewport on desktop, and a flyer only works if it can be taken in as a
 * whole. The frame shrink-wraps the artwork so the border hugs it instead of
 * leaving bars down the sides.
 *
 * The treatment follows the site's flat discipline used by VigilSpotlight:
 * hairline borders, zero radius, no drop shadows.
 *
 * GRACEFUL ABSENCE: the whole section unmounts if the artwork fails to load.
 * The poster is the entire content here, so a failed fetch would otherwise
 * leave a heading and detail rail stranded around a broken-image icon.
 */

/**
 * Event facts mirrored from the poster. Deliberately the ONLY poster copy
 * duplicated outside the artwork — keep in sync if the poster is reissued.
 */
const TALK_DETAILS = [
  { Icon: CalendarDays, label: "Date", value: "7th September" },
  { Icon: Clock, label: "Time", value: "19:00 – 21:00" },
  {
    Icon: MapPin,
    label: "Location",
    value: "St Paul's Church, Shadwell, 302 The Highway, London E1W 3DH",
  },
] as const;

/**
 * Full poster copy, transcribed for screen readers because every detail of
 * the event lives inside the artwork. Keep in sync if the poster is replaced.
 */
const POSTER_ALT =
  "Why are Nigerian Christians suffering? A powerful talk, a real story, a call to action. " +
  "A talk on the reality of Nigeria's insecurity presented by award-winning journalist and " +
  "humanitarian Jack Ross, featuring an uncensored account of the situation in Nigeria's " +
  "Middle Belt alongside an insight into the humanitarian work of Vans Without Borders, " +
  "followed by a Q&A. 7th September, 19:00 to 21:00, St Paul's Church, Shadwell, " +
  "302 The Highway, London, E1W 3DH.";

export function ExclusiveTalk() {
  const [posterFailed, setPosterFailed] = useState(false);

  if (posterFailed) return null;

  return (
    <section
      id="exclusive-talk"
      data-ocid="section.exclusive_talk"
      className="w-full scroll-mt-[calc(var(--announcement-bar-height)+4rem)] bg-navy/40 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
        {/* Caption block. */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="entrance-left text-eyebrow text-primary"
            data-entrance-delay="0"
          >
            Vans Without Borders
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Exclusive Talk
          </h2>
          {/* Short accent rule for the same vertical rhythm the other
              homepage sections carry. */}
          <span
            aria-hidden="true"
            className="entrance-left h-px w-16 bg-primary"
            data-entrance-delay="160"
          />
        </div>

        {/* Poster + the three at-a-glance facts. Side by side once there is
            room for both; stacked on phones, where the poster leads. */}
        <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-14">
          <div
            className="entrance-left w-fit max-w-full shrink-0 overflow-hidden border border-border bg-card/40"
            data-entrance-delay="240"
          >
            <img
              src={IMAGE_EXCLUSIVE_TALK_POSTER}
              alt={POSTER_ALT}
              loading="lazy"
              draggable={false}
              onError={() => setPosterFailed(true)}
              className="block h-auto max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>

          <dl
            className="entrance-right flex w-full max-w-sm flex-col gap-6 lg:w-auto"
            data-entrance-delay="320"
          >
            {TALK_DETAILS.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="font-body text-base font-medium leading-snug text-foreground">
                    {value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
