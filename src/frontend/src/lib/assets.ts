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
 * Hero background video URLs — embedded directly in code.
 *
 * Every hero and background container reads one of these constants; nothing
 * is fetched from the backend, so the code carries the footage with it.
 *
 * Authoritative mapping (do not "correct"):
 *
 *   VIDEO_MAIN_HERO      0806(3).mp4
 *                        Homepage top hero ("Winning the Cultural War") AND
 *                        the universal default for every hero that has no
 *                        specific video assigned (about, donate, contact,
 *                        events, join-us, gallery, patreon, ...).
 *
 *   VIDEO_SHOP_HERO      0806.mp4
 *                        Shop / Official Merchandise ONLY — the homepage
 *                        "Wear the Message" section and the /merchandise
 *                        hero. This is the merch footage; it must NOT leak
 *                        onto any other hero. It is its OWN constant,
 *                        separate from VIDEO_MAIN_HERO, precisely so those
 *                        two heroes are the only places it appears.
 *
 *   VIDEO_ACTIVISM       hf_20260806_...mp4
 *                        Education Watch (homepage section + page) AND every
 *                        activism page: /activism, /become-an-activist,
 *                        /activism-kit, /university-societies, /petition.
 *
 *   VIDEO_BRITISH_HISTORY  0806(1).mp4 — homepage British History section +
 *                        /real-british-history + RBH article heroes.
 *
 *   VIDEO_MBGA           mcointpuk.mp4 — homepage $MBGA section + /mbga.
 *
 *   VIDEO_NEWSROOM       0803(4).mp4 — homepage Latest News section + /blog
 *                        + article heroes.
 *
 * Parentheses are percent-encoded (%28 / %29) because they are not valid
 * unescaped in a URL literal; the browser resolves them to 0806(3).mp4,
 * 0806(1).mp4 and 0803(4).mp4.
 */
/**
 * Shared file.garden folder holding the site's large media. Named for the
 * host rather than for video because it now carries stills too (the featured
 * talk poster below).
 */
const FILE_GARDEN_BASE =
  "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER";

/** Homepage top hero + universal default for all unassigned heroes. */
export const VIDEO_MAIN_HERO = `${FILE_GARDEN_BASE}/0806%283%29.mp4`;

/**
 * Shop / Official Merchandise ONLY (homepage merch section + /merchandise).
 * 0806.mp4 is the merch footage: it belongs to those two heroes and nowhere
 * else. Every other hero reads VIDEO_MAIN_HERO / VIDEO_DEFAULT_HERO, so this
 * constant having its own value is what keeps the merch clip off the rest of
 * the site.
 */
export const VIDEO_SHOP_HERO = `${FILE_GARDEN_BASE}/0806.mp4`;

/** Education Watch + every activism page hero. */
export const VIDEO_ACTIVISM = `${FILE_GARDEN_BASE}/hf_20260806_184005_968d6943-9d45-4c67-9926-2d826067622e.mp4`;

/** British History section + /real-british-history + RBH article heroes. */
export const VIDEO_BRITISH_HISTORY = `${FILE_GARDEN_BASE}/0806%281%29.mp4`;

/** $MBGA section + /mbga hero. */
export const VIDEO_MBGA = `${FILE_GARDEN_BASE}/mcointpuk.mp4`;

/** Latest News / Newsroom section + /blog + article heroes. */
export const VIDEO_NEWSROOM = `${FILE_GARDEN_BASE}/0803%284%29.mp4`;

/**
 * Universal default hero video — the fallback <Hero> and <BackgroundVideo>
 * substitute whenever a call site passes no explicit source.
 */
export const VIDEO_DEFAULT_HERO = VIDEO_MAIN_HERO;

/**
 * Featured talk poster — "Why Are Nigerian Christians Suffering?", the
 * Vans Without Borders talk at St Paul's Church, Shadwell on 7th September.
 * Rendered by the homepage <ExclusiveTalk> section directly below the vigil.
 *
 * Hosted on file.garden alongside the hero videos rather than bundled into
 * the repo, matching how the rest of the site's large media is served.
 * Replace this URL when the poster is reissued.
 */
export const IMAGE_EXCLUSIVE_TALK_POSTER = `${FILE_GARDEN_BASE}/06958be7-09d3-4feb-8809-2011547a3061.JPG`;

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
