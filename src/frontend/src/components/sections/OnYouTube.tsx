/**
 * OnYouTube — full-width responsive 16:9 YouTube embed section.
 *
 * SpaceX discipline exception: the container carries an intentional red
 * shadow glow (shadow-[0_0_30px_rgba(220,38,38,0.2)]) per user preference,
 * alongside a hairline red border. The iframe is the official YouTube embed
 * for the TPUK channel video.
 *
 * Entrance: the section header and the video container each slide in from
 * the left with a staggered data-entrance-delay, auto-observed by the
 * HomePage's useEntranceAnimation containerRef.
 */
const YOUTUBE_EMBED_SRC =
  "https://www.youtube.com/embed/f9fGq3E_zKw?si=zk4LnI4bIvv-nHND";

export function OnYouTube() {
  return (
    <section
      data-ocid="section.on-youtube"
      className="w-full bg-background px-6 py-32 sm:px-10"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-12 flex flex-col gap-4">
          <span className="entrance-left text-eyebrow" data-entrance-delay="0">
            ON YOUTUBE
          </span>
          <h2
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            Watch The Movement
          </h2>
        </div>

        <div
          className="entrance-left aspect-video w-full overflow-hidden rounded-2xl border border-red-900/40 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
          data-entrance-delay="160"
        >
          <iframe
            src={YOUTUBE_EMBED_SRC}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
