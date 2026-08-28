import { useState } from "react";

/**
 * ExclusiveTalk — a single-purpose spotlight for the featured talk poster,
 * rendered directly below the VigilSpotlight on the homepage.
 *
 * The poster is a self-contained flyer: the speaker, date, time, venue, and
 * QR code are all baked into the artwork. This section therefore does NOT
 * restate that copy as HTML — duplicating it would create two sources of
 * truth that drift apart the moment the poster is reissued. The section is
 * just the caption plus the artwork, and the full poster text is carried in
 * the image's `alt` so screen-reader users get the same information sighted
 * users read off the flyer.
 *
 * GRACEFUL ABSENCE: the whole section unmounts if the poster fails to load
 * (`onError`). The artwork is the entire content here, so a missing file
 * would otherwise leave a heading floating above a broken-image icon. Hiding
 * the section means the page degrades to exactly how it looked before this
 * section existed — vigil straight into the pillars — rather than showing a
 * visibly broken block.
 *
 * SIZING: the poster is portrait, so it is capped by HEIGHT (max-h-[85vh])
 * rather than by width. Constraining a ~2:3 flyer by width alone makes it
 * taller than the viewport on desktop, so the reader can never see the whole
 * thing at once — and a flyer only works if it can be taken in as a whole.
 * The frame shrink-wraps the image (w-fit) so the border hugs the artwork
 * instead of leaving bars beside it.
 */

/** Poster artwork. Portrait flyer; see the graceful-absence note above. */
const POSTER_SRC = "/assets/images/exclusive-talk-nigeria.jpg";

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
      className="w-full scroll-mt-[calc(var(--announcement-bar-height)+4rem)] px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
        <h2
          className="entrance-left text-headline text-center text-foreground"
          data-entrance-delay="0"
        >
          Exclusive Talk
        </h2>

        <div
          className="entrance-left w-fit max-w-full overflow-hidden border border-border bg-card/40"
          data-entrance-delay="80"
        >
          <img
            src={POSTER_SRC}
            alt={POSTER_ALT}
            loading="lazy"
            draggable={false}
            onError={() => setPosterFailed(true)}
            className="block h-auto max-h-[85vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
