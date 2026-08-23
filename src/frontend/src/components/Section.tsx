import { cn } from "@/lib/utils";

/**
 * Section — a full-viewport scroll-snap section wrapper.
 *
 * Encapsulates the SpaceX-style "one idea + one action per screen" rhythm:
 * 100dvh height, scroll-snap alignment, content anchored low (flex-end) like
 * SpaceX heroes, not centered like a generic hero.
 *
 * Use `variant="default"` for hero-style sections (content low) and
 * `variant="center"` for content that should sit centered (e.g. form pages).
 */
export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Anchor content low (default, hero-style) or centered. */
  variant?: "default" | "center";
  /** Optional id for in-page anchor navigation. */
  id?: string;
  /** Background fill. Under the universal ambient midnight theme the
   *  "background" variant is fully transparent (the fixed body mesh IS the
   *  page background); "navy" and "card" render as translucent tints so the
   *  ambient glow still reads through while zoning the section. */
  background?: "background" | "navy" | "card";
  /** Disable scroll-snap on this section (for tall content pages). */
  noSnap?: boolean;
}

export function Section({
  children,
  className,
  variant = "default",
  id,
  background = "background",
  noSnap = false,
}: SectionProps) {
  return (
    <section
      id={id}
      data-ocid="section"
      className={cn(
        "relative flex w-full flex-col overflow-hidden",
        noSnap ? "min-h-[100dvh]" : "scroll-snap-section",
        variant === "center" ? "items-center justify-center" : "justify-end",
        background === "navy" && "bg-navy/60",
        background === "card" && "bg-card/60",
        background === "background" && "bg-transparent",
        className,
      )}
    >
      {children}
    </section>
  );
}
