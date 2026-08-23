import { cn } from "@/lib/utils";

/**
 * VideoPlaceholder — the cinematic dark plate used inside heroes.
 *
 * Real MP4 hero videos will be uploaded later. Until then, every hero
 * renders this clean cinematic plate: a deep-blue radial gradient with a
 * subtle scanline texture. It reads as an intentional, atmospheric
 * backdrop — never as a broken or "to be uploaded" state — so the hero
 * headline and CTA content remain the visual focus.
 *
 * A poster-image fallback is shown when reduced motion is requested or
 * when no video source is available.
 */
export interface VideoPlaceholderProps {
  /** Which video belongs here, e.g. "Home hero — crowd at rally". Kept on
   *  the public API for call-site stability; no longer rendered as a label
   *  so the plate stays clean and cinematic. */
  label?: string;
  /** Optional poster image shown as the plate background. */
  posterSrc?: string;
  className?: string;
}

export function VideoPlaceholder({
  label,
  posterSrc,
  className,
}: VideoPlaceholderProps) {
  // `label` is accepted for API stability but intentionally not rendered —
  // the plate is a clean cinematic backdrop, not a labelled placeholder.
  void label;
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden bg-background",
        className,
      )}
      aria-hidden="true"
      data-ocid="video_placeholder"
    >
      {posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          className="h-full w-full object-cover opacity-50"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 40%, oklch(0.22 0.08 255 / 0.55), oklch(0.20 0.08 255) 70%)",
          }}
        />
      )}

      {/* Subtle film-grain / scanline texture to read as a cinematic plate. */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, oklch(0.98 0.005 250) 0px, oklch(0.98 0.005 250) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Soft vignette to deepen the edges and focus the eye toward the
          center-low content area where the headline and CTAs sit. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, transparent 40%, oklch(0.18 0.08 255 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
