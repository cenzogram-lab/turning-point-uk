import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * BackgroundVideo — a full-bleed background <video> used behind hero sections.
 *
 * Encapsulates the mobile/reliability concerns that previously broke the
 * homepage heroes:
 *
 *  1. **Lazy loading via IntersectionObserver.** Below-the-fold heroes start
 *     with `preload="metadata"` (only the first frames fetch) and do NOT
 *     autoplay until the section nears the viewport. This stops every hero on
 *     the page from competing for bandwidth simultaneously on mobile, which
 *     was the main cause of the "videos lag and never populate" symptom.
 *     When `lazy` is false (the top hero), the video starts with
 *     `preload="auto"` and autoplay immediately.
 *
 *  2. **Preload escalation.** Once the IntersectionObserver fires, preload is
 *     bumped to `"auto"` and the video begins buffering so it is ready by the
 *     time the user reaches it.
 *
 *  3. **Reliable play() on mobile.** `play()` is called both when the video
 *     element mounts AND on `canplay`/`loadeddata` events. On mobile, the
 *     initial `play()` call frequently rejects while the video is still
 *     buffering (the source has not yet fetched enough data). Previously the
 *     rejected promise was swallowed and never retried, so the in-view hero
 *     stayed on its poster forever. Now the `canplaythrough` / `canplay` /
 *     `loadeddata` handlers re-issue `play()` once the browser has buffered
 *     enough frames, so the in-view hero reliably transitions from poster to
 *     playing video on mobile. The poster remains visible (via the `poster`
 *     attribute) until the first frame is painted, then the video takes over.
 *
 *  4. **Poster fallback.** A static poster image is always set on the
 *     <video> element so a frame shows while the file buffers, when the
 *     external host is unreachable, or when the video fails to load. The
 *     poster also doubles as the reduced-motion background (see below).
 *
 *  5. **prefers-reduced-motion.** The hero background videos are muted,
 *     looped, and ambient (non-distracting), so they are allowed to play
 *     even when the user prefers reduced motion. Many mobile devices report
 *     `prefers-reduced-motion: reduce` under battery saver / low-power mode,
 *     and the user explicitly wants the homepage hero video to PLAY on
 *     mobile. Under reduced-motion the component still renders the
 *     `<video>` element (with the poster set as a buffering fallback), so
 *     the ambient video plays rather than showing only a static poster. The
 *     poster remains as the fallback while the video buffers or if it fails
 *     to load.
 *
 * The video element carries `autoPlay loop muted playsInline controls={false}`
 * and sits at z-0 (positive — never negative, which would hide it behind the
 * parent's background). A `<source>` child maximises browser compatibility
 * alongside the direct `src` attribute.
 *
 * LOCKED CONSTRAINT: the video source URL is identical on mobile and desktop.
 * This component never switches sources per viewport — it only fixes the
 * loading/playback reliability for the in-view hero on mobile.
 *
 * Used by the shared <Hero> component and by the two custom full-bleed
 * sections on the homepage (Blog Showcase + $MBGA) that render their own
 * background video outside the Hero component.
 */
export interface BackgroundVideoProps {
  /** MP4 video source URL. Identical on mobile and desktop (locked). */
  videoSrc: string;
  /** Poster image fallback (also shown under reduced-motion and while buffering). */
  posterSrc?: string;
  /**
   * Lazy-load this video. When true (default), the video starts with
   * `preload="metadata"` and only begins autoplay when the section nears the
   * viewport. When false, the video starts with `preload="auto"` and autoplays
   * immediately — use for the top/first hero only.
   */
  lazy?: boolean;
  /** Accessible label for screen readers describing the background video. */
  ariaLabel?: string;
  className?: string;
}

export function BackgroundVideo({
  videoSrc,
  posterSrc,
  lazy = true,
  ariaLabel,
  className,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  // `shouldPlay` flips true once the IntersectionObserver fires (lazy) or on
  // mount (non-lazy top hero). It controls whether the <video> element is
  // rendered at all so a lazy below-the-fold hero does not even create a
  // network request until it is near the viewport.
  const [shouldPlay, setShouldPlay] = useState(!lazy);
  // `playRequested` guards against issuing play() repeatedly on every buffer
  // event once the video is already playing. It is reset when the video
  // element is (re)mounted so a fresh element gets a fresh play attempt.
  const playRequestedRef = useRef(false);

  useEffect(() => {
    // Non-lazy top hero: render + play immediately.
    if (!lazy) {
      setShouldPlay(true);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    // Use a generous rootMargin so the video starts loading slightly before it
    // enters the viewport, giving it time to buffer before the user sees it.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldPlay(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0.01 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [lazy]);

  // Issue play() on the video element. On mobile the first call frequently
  // rejects while the source is still buffering; callers that listen for
  // buffer-readiness events re-invoke this to retry. The rejected promise is
  // swallowed because autoplay attributes + the buffer-event retries will
  // recover once enough data is available.
  const requestPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // If it is already playing, do not re-issue play().
    if (!video.paused && !video.ended) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  // Once the <video> is rendered (shouldPlay true), escalate preload to "auto"
  // and call play() so it begins buffering and playing immediately. This runs
  // under reduced-motion too: the hero videos are muted, looped, and ambient,
  // so they are non-distracting and the user explicitly wants them to play on
  // mobile (where reduced-motion is commonly reported under battery saver).
  useEffect(() => {
    if (!shouldPlay) return;
    const video = videoRef.current;
    if (!video) return;
    // iOS Safari (and older iOS Chrome) requires the non-standard
    // `webkit-playsinline` attribute (in addition to the standard
    // `playsinline` / `playsInline`) to allow inline autoplay inside a
    // scrolling page rather than forcing fullscreen. React has no typed prop
    // for it, so set it as a DOM attribute on the element. This MUST appear in
    // the rendered DOM as webkit-playsinline="true" for inline mobile
    // playback to work reliably.
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";
    // CRITICAL: set the muted PROPERTY (not just the JSX attribute) before
    // calling play(). React's `muted` JSX attribute sets the HTML attribute,
    // but the HTMLMediaElement.muted PROPERTY is what actually controls
    // muting — and React does NOT sync them. On mobile Safari the autoplay
    // policy blocks autoplay unless the video is genuinely muted, so a video
    // with the `muted` attribute but an unset/false `muted` property stays
    // stuck on its poster forever. Setting video.muted = true here (and again
    // on loadedmetadata, which can reset it) guarantees the property is set
    // before play() is issued.
    video.muted = true;
    playRequestedRef.current = false;
    // Kick off buffering + an initial play attempt. On mobile this initial
    // play() often rejects while the source is still fetching; the
    // canplaythrough / canplay / loadeddata handlers below retry once the
    // browser has buffered enough frames.
    requestPlay();
    // Defense-in-depth: a couple of timed retries cover the case where the
    // initial play() rejects and the buffer-readiness events are slow to
    // fire (e.g. the source is large and the browser is still fetching the
    // first frames). Each retry is guarded by requestPlay's own
    // "already playing" check so they never fight a playing video.
    const retryA = window.setTimeout(() => requestPlay(), 600);
    const retryB = window.setTimeout(() => requestPlay(), 1500);
    return () => {
      window.clearTimeout(retryA);
      window.clearTimeout(retryB);
    };
  }, [shouldPlay, requestPlay]);

  return (
    <div
      ref={sectionRef}
      className={cn("absolute inset-0 z-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {shouldPlay ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          // Start with metadata-only preload for lazy heroes; the effect above
          // escalates to "auto" once the video is rendered. Non-lazy heroes
          // start at "auto" directly so the hero video loads immediately on
          // mobile.
          preload={lazy ? "metadata" : "auto"}
          controls={false}
          // Reliability hooks for the in-view hero on mobile: the initial
          // play() call (issued in the mount effect) frequently rejects while
          // the source is still buffering. These buffer-readiness events fire
          // once the browser has fetched enough frames, and each one retries
          // play() so the in-view hero reliably transitions from poster to
          // playing video. Without these, a rejected play() on mobile left
          // the hero stuck on its poster forever.
          onCanPlayThrough={() => requestPlay()}
          onCanPlay={() => requestPlay()}
          onLoadedData={() => requestPlay()}
          // loadedmetadata can reset the muted PROPERTY on some browsers
          // (the HTML attribute is set, but the property is re-derived from
          // the media resource once metadata arrives). Re-assert muted=true
          // here and immediately retry play() so the video transitions from
          // poster to playing instead of stalling on a muted-property reset.
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.muted = true;
            requestPlay();
          }}
          onPlay={() => {
            playRequestedRef.current = true;
          }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : posterSrc ? (
        // Below-the-fold lazy hero that has not yet entered the viewport:
        // show the poster as a static placeholder so the hero is never a flat
        // dark plate while waiting for the IntersectionObserver to fire.
        <img
          src={posterSrc}
          alt={ariaLabel ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}
    </div>
  );
}
