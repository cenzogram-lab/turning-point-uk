import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * BackgroundVideo — a high-performance, responsive full-bleed HTML5 background
 * <video> used behind every hero section and designated background container.
 *
 * Structure (per the universal video contract):
 *   - Wrapper: `absolute inset-0 w-full h-full overflow-hidden -z-10`
 *   - Video:   `autoPlay loop muted playsInline` +
 *              `className="w-full h-full object-cover"`
 *   - Overlay: `<div className="absolute inset-0 bg-black/50" />` directly
 *              over the video so foreground text/buttons stay readable.
 *
 * IMPORTANT: because the wrapper carries a NEGATIVE z-index, the parent
 * section MUST establish its own stacking context (Tailwind `isolate`) and
 * must NOT paint an opaque background of its own — otherwise the video paints
 * behind the parent background and disappears. The shared <Hero> and the
 * custom homepage sections all carry `isolate` for this reason.
 *
 * No poster / fallback images: fallback images were removed universally from
 * every hero background. While the video buffers (or if the host is
 * unreachable) the ambient dark page background shows through.
 *
 * Reliability concerns encapsulated here:
 *
 *  1. **Lazy loading via IntersectionObserver.** Below-the-fold heroes do not
 *     mount their <video> (no network request) until the section nears the
 *     viewport, so heroes never compete for bandwidth simultaneously on
 *     mobile. When `lazy` is false (the top hero), the video mounts with
 *     `preload="auto"` and autoplays immediately.
 *
 *  2. **Preload escalation.** Once the IntersectionObserver fires, preload is
 *     bumped to `"auto"` and the video begins buffering.
 *
 *  3. **Reliable play() on mobile.** `play()` is called on mount AND on
 *     `canplay`/`loadeddata`/`canplaythrough`, because the initial `play()`
 *     frequently rejects while the source is still buffering. The handlers
 *     re-issue `play()` once enough frames are buffered. `muted` is asserted
 *     as a PROPERTY (not just the JSX attribute) before play() — mobile
 *     Safari's autoplay policy requires the property to be genuinely true.
 *
 *  4. **prefers-reduced-motion.** The hero background videos are muted,
 *     looped, and ambient (non-distracting), so they still play under
 *     reduced motion (commonly reported by phones in battery-saver mode).
 *
 * `playsInline` + `muted` (plus the non-standard `webkit-playsinline`
 * attribute) guarantee smooth mobile + desktop autoplay with no user
 * interaction. A `<source>` child maximises browser compatibility alongside
 * the direct `src` attribute.
 *
 * LOCKED CONSTRAINT: the video source URL is identical on mobile and desktop.
 */
export interface BackgroundVideoProps {
  /** MP4 video source URL. Identical on mobile and desktop (locked). */
  videoSrc: string;
  /**
   * Lazy-load this video. When true (default), the video only mounts and
   * begins autoplay when the section nears the viewport. When false, the
   * video mounts with `preload="auto"` and autoplays immediately — use for
   * the top/first hero only.
   */
  lazy?: boolean;
  /** Accessible label for screen readers describing the background video. */
  ariaLabel?: string;
  className?: string;
}

export function BackgroundVideo({
  videoSrc,
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
  // Tracks whether the section is currently near/inside the viewport. Battery
  // + memory guard for mobile: once a video has started, the visibility
  // observer below PAUSES it when it scrolls fully offscreen and resumes it
  // when it returns. requestPlay() checks this ref so the buffer-readiness
  // retries (canplay/loadeddata/timers) can never resurrect a video that was
  // deliberately paused while offscreen.
  const inViewRef = useRef(!lazy);

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
            inViewRef.current = true;
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
    // Never (re)start playback while the section is offscreen — the
    // visibility observer paused it on purpose to save battery/CPU.
    if (!inViewRef.current) return;
    // If it is already playing, do not re-issue play().
    if (!video.paused && !video.ended) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  // Visibility-driven pause/resume — once the <video> exists, keep watching
  // the section: fully offscreen (beyond a 200px margin) → pause decoding;
  // back in view → resume. Looping muted background videos otherwise keep
  // decoding for the whole session, which drains battery on mobile when a
  // page stacks several heroes. The observer stays attached for the
  // component's lifetime and is disconnected on unmount.
  useEffect(() => {
    if (!shouldPlay) return;
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inViewRef.current = entry.isIntersecting;
          const video = videoRef.current;
          if (!video) continue;
          if (entry.isIntersecting) {
            requestPlay();
          } else if (!video.paused) {
            video.pause();
          }
        }
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [shouldPlay, requestPlay]);

  // Once the <video> is rendered (shouldPlay true), escalate preload to "auto"
  // and call play() so it begins buffering and playing immediately. This runs
  // under reduced-motion too: the hero videos are muted, looped, and ambient.
  useEffect(() => {
    if (!shouldPlay) return;
    const video = videoRef.current;
    if (!video) return;
    // iOS Safari (and older iOS Chrome) requires the non-standard
    // `webkit-playsinline` attribute (in addition to the standard
    // `playsinline` / `playsInline`) to allow inline autoplay inside a
    // scrolling page rather than forcing fullscreen. React has no typed prop
    // for it, so set it as a DOM attribute on the element.
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";
    // CRITICAL: set the muted PROPERTY (not just the JSX attribute) before
    // calling play(). React's `muted` JSX attribute sets the HTML attribute,
    // but the HTMLMediaElement.muted PROPERTY is what actually controls
    // muting — and React does NOT sync them. On mobile Safari the autoplay
    // policy blocks autoplay unless the video is genuinely muted.
    video.muted = true;
    playRequestedRef.current = false;
    // Kick off buffering + an initial play attempt. On mobile this initial
    // play() often rejects while the source is still fetching; the
    // canplaythrough / canplay / loadeddata handlers below retry once the
    // browser has buffered enough frames.
    requestPlay();
    // Defense-in-depth: a couple of timed retries cover the case where the
    // initial play() rejects and the buffer-readiness events are slow to
    // fire. Each retry is guarded by requestPlay's own "already playing"
    // check so they never fight a playing video.
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
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden -z-10",
        className,
      )}
      aria-hidden="true"
      aria-label={ariaLabel}
    >
      {shouldPlay ? (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          // Start with metadata-only preload for lazy heroes; the effect above
          // escalates to "auto" once the video is rendered. Non-lazy heroes
          // start at "auto" directly so the top hero loads immediately.
          preload={lazy ? "metadata" : "auto"}
          controls={false}
          // Reliability hooks for the in-view hero on mobile: the initial
          // play() call frequently rejects while the source is still
          // buffering. These buffer-readiness events each retry play() so the
          // hero reliably transitions to a playing video.
          onCanPlayThrough={() => requestPlay()}
          onCanPlay={() => requestPlay()}
          onLoadedData={() => requestPlay()}
          // loadedmetadata can reset the muted PROPERTY on some browsers.
          // Re-assert muted=true and immediately retry play().
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.muted = true;
            requestPlay();
          }}
          onPlay={() => {
            playRequestedRef.current = true;
          }}
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
      {/* Readability overlay — sits directly over the video so foreground
          text and buttons stay legible against any frame of the footage. */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
}
