import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * ZoomableImage — hover magnifier lens (fine pointers) + tap-to-zoom (touch).
 *
 * Zero new dependencies: the magnification is a second copy of the SAME image
 * URL painted as a `background-image` on a small lens <div>, offset via
 * `background-position`. Because it is the same URL, it resolves from the HTTP
 * cache — no second network request — and because CSS images are fetched
 * `no-cors`, it needs no CORS headers from the remote origin (file.garden).
 *
 * Rendering model
 * ---------------
 *   <figure>                      position: relative  (measured element)
 *     <img>                       object-contain, fills the figure
 *     <div class="lens">          aria-hidden, pointer-events: none
 *
 * All per-frame work writes directly to `lensRef.current.style` inside one
 * rAF — never through setState — so a 120 Hz pointer stream costs zero React
 * renders. React state holds only discrete mode flags (lens shown / zoomed).
 */

/**
 * Largest lens edge length in CSS px. The actual size is computed per-measure
 * as `min(LENS_MAX, cw * 0.7, ch * 0.7)` so the lens never overhangs a small
 * rendered image — at 320px wide a fixed 180px lens covers most of the photo
 * and hangs off its edges.
 */
const LENS_MAX = 180;

/** Desired magnification. Clamped at runtime to the image's native resolution. */
const DEFAULT_ZOOM = 2.5;

/** Keyboard pan step, in displayed-image px, per arrow press. */
const PAN_STEP = 24;

/** Max pointer travel (px) that still counts as a tap rather than a drag. */
const TAP_SLOP = 10;

/** Geometry of the *rendered pixels* inside the element box (object-contain). */
interface ContentBox {
  /** Element bounding rect, viewport-relative. */
  rect: DOMRect;
  /** Rendered content width/height after object-contain letterboxing. */
  cw: number;
  ch: number;
  /** Letterbox offsets from the element's top-left to the content's top-left. */
  ox: number;
  oy: number;
  /** Effective zoom, clamped so we never upscale past the natural raster. */
  z: number;
  /** Lens edge length for this geometry; shrinks on small rendered images. */
  lens: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Derive the content box from the element rect + the image's intrinsic size.
 *
 * `object-contain` scales the raster by `min(rect.w/natW, rect.h/natH)` and
 * centres it, so for a non-square image inside a square frame the rendered
 * pixels occupy only part of the rect. Every subsequent calculation works in
 * CONTENT coordinates (origin `ox,oy`, size `cw x ch`), never rect
 * coordinates — that is what makes non-square images correct.
 */
function measure(
  img: HTMLImageElement,
  desiredZoom: number,
): ContentBox | null {
  const { naturalWidth: natW, naturalHeight: natH } = img;
  // naturalWidth is 0 until the raster has decoded, and stays 0 for a broken
  // image. Dividing by it would put NaN into background-position, which the
  // CSS parser silently discards — the lens would stick to the top-left.
  if (!natW || !natH) return null;

  const rect = img.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const scale = Math.min(rect.width / natW, rect.height / natH);
  const cw = natW * scale;
  const ch = natH * scale;

  // Past natW/cw the browser is interpolating, not revealing detail. Clamping
  // here is what makes the magnifier show real pixels rather than a blur.
  const z = clamp(desiredZoom, 1.01, Math.max(1.01, natW / cw));

  return {
    rect,
    cw,
    ch,
    ox: (rect.width - cw) / 2,
    oy: (rect.height - ch) / 2,
    z,
    // Keep the lens comfortably inside the rendered pixels on small screens,
    // so it reads as a magnifier over the photo rather than a disc hanging
    // off its edge.
    lens: Math.max(64, Math.min(LENS_MAX, cw * 0.7, ch * 0.7)),
  };
}

export interface ZoomableImageProps {
  src: string;
  alt: string;
  /** Desired magnification; clamped to the image's native resolution. */
  zoom?: number;
  /** Called when the image 404s / the origin refuses it. */
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** True while an ancestor modal is still running its open animation. */
  disabled?: boolean;
  /**
   * Zoom state is CONTROLLED by the parent, deliberately.
   *
   * Inside a Radix dialog the first Escape keypress must un-zoom rather than
   * close the dialog, and that cannot be arranged from in here: Radix listens
   * for Escape on `document` in the CAPTURE phase
   * (react-use-escape-keydown), which runs before React's delegated listener
   * at #root. A `stopPropagation()` in this component's own keydown handler is
   * therefore too late — the dialog has already dismissed. The owning dialog
   * has to read this flag in its `onEscapeKeyDown` and `preventDefault()`
   * while it is true.
   */
  zoomed: boolean;
  onZoomedChange: (zoomed: boolean) => void;
  className?: string;
  imageClassName?: string;
}

export function ZoomableImage({
  src,
  alt,
  zoom = DEFAULT_ZOOM,
  onImageError,
  disabled = false,
  zoomed,
  onZoomedChange,
  className,
  imageClassName,
}: ZoomableImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  /** Cached geometry. Re-measured on enter / load / resize / scroll — never
   *  inside pointermove, so we never interleave a layout read with a style
   *  write (the classic forced-reflow thrash). */
  const boxRef = useRef<ContentBox | null>(null);

  /** Latest lens centre in CONTENT coordinates. Written by handlers, read by
   *  the single rAF. */
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  /** pointerType of the most recent pointerdown — decides tap vs hover.
   *  Read per event, never cached globally: hybrid laptops legitimately
   *  alternate between "mouse" and "touch" on the same element. */
  const lastPointerType = useRef<string>("mouse");

  /** Viewport coords of the last pointerdown — used to tell a tap from a drag. */
  const downRef = useRef({ x: 0, y: 0 });

  /** Viewport coords of the last pointerup — paired with downRef for the slop test. */
  const lastUpRef = useRef({ x: 0, y: 0 });

  /** True once posRef holds a real position rather than its {0,0} default. */
  const hasPos = useRef(false);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lensVisible, setLensVisible] = useState(false);
  const hintId = useId();

  const active = (lensVisible || zoomed) && ready && !failed && !disabled;

  /* ── Measurement ─────────────────────────────────────────────────── */

  const remeasure = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    boxRef.current = measure(img, zoom);
  }, [zoom]);

  // A cached image can already be `complete` before React attaches onLoad, in
  // which case onLoad NEVER fires. Checking `complete` in a layout effect is
  // the only reliable way to catch that case.
  useLayoutEffect(() => {
    setReady(false);
    setFailed(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      remeasure();
      setReady(true);
    }
  }, [remeasure]);

  /* ── The one rAF that touches the DOM ────────────────────────────── */

  const paint = useCallback(() => {
    rafRef.current = 0;
    const lens = lensRef.current;
    const box = boxRef.current;
    if (!lens || !box) return;

    const { cw, ch, ox, oy, z, lens: L } = box;
    const half = L / 2;

    // Clamp the lens so it stays wholly inside the rendered pixels. This alone
    // guarantees the magnified region is also inside the image, so the lens can
    // never reveal dead space — no second clamp on background-position needed.
    // When the image is smaller than the lens the range inverts; centre it.
    const maxLeft = cw - L;
    const maxTop = ch - L;
    const lensLeft =
      maxLeft <= 0 ? maxLeft / 2 : clamp(posRef.current.x - half, 0, maxLeft);
    const lensTop =
      maxTop <= 0 ? maxTop / 2 : clamp(posRef.current.y - half, 0, maxTop);

    // ── The maths ────────────────────────────────────────────────────
    // The lens covers L displayed px starting at `lensLeft` (content coords).
    // Magnified z times it must show L/z of those px, centred on the lens
    // centre. That source strip starts at
    //     s = lensLeft + L/2 - L/(2z)
    // In the zoomed backdrop (which is cw*z wide) that point sits at s*z, and
    // it must land at lens-local 0, so background-position is -s*z:
    //     bgX = -z*lensLeft - (z - 1) * L / 2
    // Same derivation on the Y axis. Both are <= 0, as background-position
    // offsets of an oversized backdrop always are.
    const bgX = -(z * lensLeft) - ((z - 1) * L) / 2;
    const bgY = -(z * lensTop) - ((z - 1) * L) / 2;

    // translate3d keeps lens movement on the compositor (no layout, no paint
    // of the parent); only background-position repaints, and only lens-sized.
    lens.style.width = `${L}px`;
    lens.style.height = `${L}px`;
    lens.style.transform = `translate3d(${ox + lensLeft}px, ${oy + lensTop}px, 0)`;
    lens.style.backgroundSize = `${cw * z}px ${ch * z}px`;
    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current) return; // coalesce: at most one write per frame
    rafRef.current = requestAnimationFrame(paint);
  }, [paint]);

  // rect is VIEWPORT-relative, so scrolling invalidates it. ResizeObserver
  // covers layout changes; the capture-phase scroll listener covers every
  // scrollable ancestor including the modal body.
  useEffect(() => {
    if (!active) return;
    const img = imgRef.current;
    if (!img) return;

    // Re-measuring alone is not enough: paint() is only scheduled from the
    // pointer/keyboard handlers, so after a rotate or a scroll the lens would
    // keep the size, offset and backgroundSize of the previous paint while
    // boxRef held fresh geometry. Repaint with every re-measure.
    const onGeometryChange = () => {
      remeasure();
      schedule();
    };
    const ro = new ResizeObserver(onGeometryChange);
    ro.observe(img);
    window.addEventListener("scroll", onGeometryChange, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onGeometryChange, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onGeometryChange, { capture: true });
      window.removeEventListener("resize", onGeometryChange);
    };
  }, [active, remeasure, schedule]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // Repaint when the lens is (re)shown or the zoom changes.
  useEffect(() => {
    if (active) schedule();
  }, [active, schedule]);

  /* ── Pointer handling ────────────────────────────────────────────── */

  /** Convert a pointer event to CONTENT coordinates using the cached rect. */
  const track = useCallback((e: React.PointerEvent) => {
    const box = boxRef.current;
    if (!box) return false;
    const x = e.clientX - box.rect.left - box.ox;
    const y = e.clientY - box.rect.top - box.oy;
    // Outside the rendered pixels (letterbox bars) — treat as "not over image".
    if (x < 0 || y < 0 || x > box.cw || y > box.ch) return false;
    posRef.current = { x, y };
    hasPos.current = true;
    return true;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      lastPointerType.current = e.pointerType;
      downRef.current = { x: e.clientX, y: e.clientY };
      // Seed the lens position from the TAP. Without this the touch path never
      // writes posRef before zoom turns on — handlePointerEnter early-returns
      // for a finger, and the touch branch of handlePointerMove only tracks
      // once `zoomed` is already true — so the first tap would magnify the
      // image's top-left corner instead of the point that was touched.
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") {
        remeasure();
        if (track(e)) hasPos.current = true;
      }
    },
    [remeasure, track],
  );

  /**
   * Turn zoom on, defaulting the lens to the middle of the image when no
   * pointer has ever established a position (keyboard activation). Opening in
   * the corner would look broken, and because PAN_STEP (24) is smaller than
   * half the lens, the first few arrow presses would not move it at all.
   */
  const zoomOn = useCallback(() => {
    remeasure();
    if (!hasPos.current) {
      const box = boxRef.current;
      if (box) {
        posRef.current = { x: box.cw / 2, y: box.ch / 2 };
        hasPos.current = true;
      }
    }
    onZoomedChange(true);
    schedule();
  }, [remeasure, onZoomedChange, schedule]);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      // pointerType is per-event: a touchscreen laptop gives "mouse" for the
      // trackpad and "touch" for a finger on the very same element. Never
      // decide this once from a media query or a width breakpoint.
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      remeasure(); // measure here, not on mount: any ancestor open-animation
      // transform (Radix `zoom-in-95`) has finished by now, and
      // getBoundingClientRect reports the POST-transform box.
      if (track(e)) {
        setLensVisible(true);
        schedule();
      }
    },
    [remeasure, track, schedule],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        const inside = track(e);
        setLensVisible(inside);
        if (inside) schedule();
        return;
      }
      // Touch: drag to pan, but only once zoomed in. `touch-action: none` is
      // applied via CSS when zoomed, so the browser hands us the moves instead
      // of scrolling — no preventDefault needed (React's listeners are passive).
      if (zoomed && track(e)) schedule();
    },
    [track, schedule, zoomed],
  );

  const handlePointerLeave = useCallback(() => setLensVisible(false), []);

  /** Tap-to-zoom. Click fires for touch, pen and mouse; the pointerdown we
   *  recorded tells us which it was, so a mouse click never toggles. */
  const handleClick = useCallback(() => {
    if (lastPointerType.current === "mouse") return;
    // A pan gesture ends in a click too. Only treat it as a tap if the finger
    // barely moved, otherwise dragging to pan would toggle zoom back off.
    const dx = lastUpRef.current.x - downRef.current.x;
    const dy = lastUpRef.current.y - downRef.current.y;
    if (Math.hypot(dx, dy) > TAP_SLOP) return;
    if (zoomed) onZoomedChange(false);
    else zoomOn();
  }, [zoomed, onZoomedChange, zoomOn]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    lastUpRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  /* ── Keyboard ────────────────────────────────────────────────────── */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (zoomed) onZoomedChange(false);
        else zoomOn();
        return;
      }
      if (!zoomed) return; // never swallow keys we are not using

      // NOTE: Escape is deliberately NOT handled here. When this component is
      // inside a Radix dialog the dialog has already seen the keypress on
      // `document` in the capture phase, so anything done here runs too late.
      // The owning dialog un-zooms via `onEscapeKeyDown` instead (see the
      // `zoomed` prop docs).

      const step =
        e.key === "ArrowLeft"
          ? [-PAN_STEP, 0]
          : e.key === "ArrowRight"
            ? [PAN_STEP, 0]
            : e.key === "ArrowUp"
              ? [0, -PAN_STEP]
              : e.key === "ArrowDown"
                ? [0, PAN_STEP]
                : null;
      if (!step) return;
      e.preventDefault(); // only now — arrows still scroll when not zoomed
      // Clamp to the content box: the pointer path is bounded by track()'s
      // in-bounds test, but nothing bounds repeated arrow presses, and an
      // unbounded posRef makes the first presses back the other way do nothing.
      const box = boxRef.current;
      const nx = posRef.current.x + step[0];
      const ny = posRef.current.y + step[1];
      posRef.current = box
        ? { x: clamp(nx, 0, box.cw), y: clamp(ny, 0, box.ch) }
        : { x: nx, y: ny };
      schedule();
    },
    [zoomed, schedule, onZoomedChange, zoomOn],
  );

  /* ── Image lifecycle ─────────────────────────────────────────────── */

  const handleLoad = useCallback(() => {
    remeasure();
    setFailed(false);
    setReady(true);
  }, [remeasure]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      // Magnifying a placeholder is nonsense — shut the whole affordance off
      // and drop the stale geometry.
      setFailed(true);
      setReady(false);
      setLensVisible(false);
      onZoomedChange(false);
      boxRef.current = null;
      hasPos.current = false;
      onImageError?.(e);
    },
    [onImageError, onZoomedChange],
  );

  const interactive = ready && !failed && !disabled;

  return (
    <figure className={cn("relative m-0 select-none", className)}>
      {/* A real <button> is the affordance: focusable, Enter/Space activated,
          and its pressed state is announced. The magnifier is an enhancement
          layered on top; nothing here is the only route to the detail. */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handlePointerLeave}
        aria-pressed={zoomed}
        aria-label={`${alt} — activate to zoom`}
        aria-describedby={hintId}
        disabled={!interactive}
        className={cn(
          // overflow-hidden is load-bearing: the lens dims its surroundings with
          // a 9999px spread shadow, which without a clip would darken the whole
          // modal rather than just the photo.
          "relative block w-full cursor-zoom-in appearance-none overflow-hidden border-0 bg-transparent p-0",
          zoomed && "cursor-zoom-out",
          // Only take the touch gestures we actually consume. Leaving this at
          // `auto` would let the modal scroll under a pan; setting it to none
          // unconditionally would make the page un-scrollable over the image.
          zoomed ? "touch-none" : "touch-auto",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          // Native image dragging hijacks the pointer stream mid-move.
          draggable={false}
          // NOTE: deliberately NO crossOrigin attribute. Adding it to an image
          // whose origin does not answer with Access-Control-Allow-Origin makes
          // the load FAIL outright, and it would also split the HTTP cache key
          // from the lens's background-image, causing a second download.
          className={cn(
            "block max-h-[75vh] w-full object-contain",
            imageClassName,
          )}
        />

        {/* The lens. pointer-events:none is load-bearing — a lens that took
            hit-tests would sit under the cursor and fire pointerleave on the
            image, flickering itself on and off forever. */}
        <div
          ref={lensRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 origin-top-left rounded-full",
            "border-2 border-primary/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]",
            "bg-no-repeat will-change-transform",
            "transition-opacity duration-150 motion-reduce:transition-none",
            active ? "opacity-100" : "opacity-0",
          )}
          style={{
            // width/height are set by paint() from the measured geometry; these
            // are the pre-measure defaults so the lens is never 0x0 on first
            // paint.
            width: LENS_MAX,
            height: LENS_MAX,
            // `src` is already a valid, percent-encoded URL — used verbatim. Do
            // NOT round-trip it through decodeURI/encodeURI: encodeURI leaves
            // "(" ")" and "#" unescaped, so the round trip can hand CSS a URL
            // that no longer resolves. Quoting is mandatory regardless, because
            // these URLs carry %20 and parentheses.
            backgroundImage: `url("${src}")`,
          }}
        />
      </button>

      <p id={hintId} className="sr-only">
        Hover to magnify, or activate and use the arrow keys to pan. Press
        Escape to exit zoom.
      </p>
    </figure>
  );
}
