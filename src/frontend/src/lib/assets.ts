/**
 * Centralized asset path constants.
 *
 * Generated image filenames receive a `.dim_WxH` suffix automatically; reference
 * the suffixed path here, not the unsuffixed name.
 */

/** Full TPUK arrow — opaque RGB image with a clean solid background. Used as-is
 *  on the branded loading screen. */
export const FULL_ARROW_SRC =
  "/assets/generated/tpuk-arrow-full.dim_1024x1024.png";

/**
 * Hero background video URLs.
 *
 * All hero videos are served from the external file.garden host per the
 * authoritative video mapping. Every hero renders a native HTML5
 * <video autoPlay loop muted playsInline> background with NO poster/fallback
 * image — the ambient dark page background shows while the video buffers.
 *
 * Mapping (authoritative — do not "correct"):
 *   VIDEO_FLAG_WAVING     — homepage main top hero + the DEFAULT for every
 *                           other hero section across the site that has no
 *                           specific video assigned (about, activism,
 *                           activism-kit, university-societies, petition,
 *                           join-us, contact, gallery, donate, patreon, etc.)
 *   VIDEO_MASCOT_WALK     — $MBGA homepage section + /mbga page hero
 *   VIDEO_NEWSPAPER_AD    — Latest News / Blog / Newsroom homepage section +
 *                           /blog + article page heroes
 *   VIDEO_HISTORIC_LONDON — British History homepage section +
 *                           /real-british-history hero
 *   VIDEO_EDUCATION_CROWD — Education Watch homepage section +
 *                           /education-watch hero
 *   VIDEO_MERCH_DISPLAY   — Official Merchandise homepage section +
 *                           /merchandise hero
 */
const VIDEO_BASE =
  "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER";

export const VIDEO_FLAG_WAVING = `${VIDEO_BASE}/0806.mp4`;
export const VIDEO_MASCOT_WALK = `${VIDEO_BASE}/mcointpuk.mp4`;
export const VIDEO_MERCH_DISPLAY = `${VIDEO_BASE}/0806.mp4`;
export const VIDEO_HISTORIC_LONDON = `${VIDEO_BASE}/0806%281%29.mp4`;
export const VIDEO_EDUCATION_CROWD = `${VIDEO_BASE}/hf_20260806_184005_968d6943-9d45-4c67-9926-2d826067622e.mp4`;
export const VIDEO_NEWSPAPER_AD = `${VIDEO_BASE}/0803%284%29.mp4`;

/**
 * $MBGA hero background video — used for BOTH the homepage "$MBGA" section
 * and the /mbga hero.
 */
export const VIDEO_MBGA_HERO = VIDEO_MASCOT_WALK;

/**
 * Universal default hero video — the main homepage hero video, used as the
 * background for every hero section across the site that does not have a
 * specific video assigned.
 */
export const VIDEO_DEFAULT_HERO = VIDEO_FLAG_WAVING;

/**
 * Endorsement graphics — social-media proof images shown on the $MBGA page.
 * ELON_MUSK_MBGA is the uploaded Elon Musk social graphic ("Followed and
 * subscribed by Elon Musk" endorsement) displayed in its own section.
 * ELON_MUSK_MBGA_2 is the second uploaded Elon Musk graphic rendered beside
 * the first in the same endorsement section.
 */
export const ELON_MUSK_MBGA = "/assets/endorsements/elon-musk-mbga.jpg";
export const ELON_MUSK_MBGA_2 = "/assets/endorsements/elon-musk-mbga-2.jpg";

/**
 * Blog cover fallback — a bundled generated cover asset shown when a post's
 * coverImageUrl is empty or fails to load. Replaces the old blank "No cover"
 * box so every article card and article page renders a real image instead of
 * a dark empty frame. The file ships in `public/assets/generated/`, so it is
 * always browser-fetchable with no object-storage indirection.
 */
export const BLOG_COVER_FALLBACK =
  "/assets/generated/cover-free-speech.dim_1280x720.webp";
