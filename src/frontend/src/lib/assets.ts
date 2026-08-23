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
 * All six hero videos are now served from local hosting under
 * src/frontend/public/videos/. Migrating off external catbox.moe URLs
 * (a ToS-violating host with culling risk) guarantees every hero renders
 * on the live site and removes the external CORS/availability failures
 * that previously left heroes showing a flat dark-blue plate.
 *
 * The two already-local videos (flag-waving.mp4 = 7.3MB, mascot-walk.mp4 =
 * 7.4MB) stay as-is. The four previously-external catbox.moe videos
 * (newspaper-ad, historic-london, education-crowd, merch-display) were
 * downloaded into public/videos/ and the config now points to those local
 * paths. VIDEO_MASCOT_WALK specifically now points to the existing local
 * /videos/mascot-walk.mp4 (7.4MB local copy) instead of the external
 * catbox.moe URL — the local copy is finally used.
 *
 * Mapping (authoritative — do not "correct"):
 *   VIDEO_FLAG_WAVING     — homepage main top hero + all other remaining
 *                           backgrounds (default inner pages such as /about,
 *                           /activism, /activism-kit, /university-societies,
 *                           /petition, /join-us, /contact, /gallery, etc.)
 *                           [LOCAL: /videos/flag-waving.mp4]
 *   VIDEO_MASCOT_WALK     — $MBGA homepage card + /mbga page
 *                           (lion mascots walking)
 *                           [LOCAL: /videos/mascot-walk.mp4]
 *   VIDEO_NEWSPAPER_AD    — /blog page (UK newspaper collage)
 *                           [LOCAL: /videos/newspaper-ad.mp4]
 *   VIDEO_HISTORIC_LONDON — /real-british-history
 *                           [LOCAL: /videos/historic-london.mp4]
 *   VIDEO_EDUCATION_CROWD — /education-watch
 *                           [LOCAL: /videos/education-crowd.mp4]
 *   VIDEO_MERCH_DISPLAY   — /merchandise
 *                           [LOCAL: /videos/merch-display.mp4]
 */
export const VIDEO_MASCOT_WALK = "/videos/mascot-walk.mp4";
/**
 * $MBGA hero background video — the user-provided external MP4 used for BOTH
 * the homepage "$MBGA" section and the /mbga hero. Replaces the mascot-walk
 * video in those two hero slots per user instruction.
 */
export const VIDEO_MBGA_HERO =
  "https://file.garden/aoCNkzJZYxDjRiWz/mcointpuk.mp4";
export const VIDEO_MERCH_DISPLAY = "/videos/merch-display.mp4";
export const VIDEO_HISTORIC_LONDON = "/videos/historic-london.mp4";
export const VIDEO_EDUCATION_CROWD = "/videos/education-crowd.mp4";
export const VIDEO_NEWSPAPER_AD = "/videos/newspaper-ad.mp4";
export const VIDEO_FLAG_WAVING = "/videos/flag-waving.mp4";

/**
 * Hero poster fallback images — a static frame shown while the background
 * video buffers, when the video fails to load, and under prefers-reduced-motion
 * (where autoplay is suppressed). Each poster pairs with its matching VIDEO_*
 * constant above so every hero always shows a populated background, even on
 * mobile or when an external host is unreachable.
 *
 * Generated as 1280x720 JPEGs (16:9) under /assets/generated/.
 */
export const POSTER_FLAG_WAVING =
  "/assets/generated/poster-flag-waving.dim_1280x720.jpg";
export const POSTER_MASCOT_WALK =
  "/assets/generated/poster-mascot-walk.dim_1280x720.jpg";
export const POSTER_NEWSPAPER_AD =
  "/assets/generated/poster-newspaper-ad.dim_1280x720.jpg";
export const POSTER_HISTORIC_LONDON =
  "/assets/generated/poster-historic-london.dim_1280x720.jpg";
export const POSTER_EDUCATION_CROWD =
  "/assets/generated/poster-education-crowd.dim_1280x720.jpg";
export const POSTER_MERCH_DISPLAY =
  "/assets/generated/poster-merch-display.dim_1280x720.jpg";

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
