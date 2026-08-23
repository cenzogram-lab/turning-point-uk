import { cn } from "@/lib/utils";

/**
 * EmbedSlot — a labelled placeholder slot for third-party embeds.
 *
 * All forms and payments are third-party embeds (NationBuilder, WooCommerce,
 * Stripe, etc.) pasted in later. This component renders a clearly labelled,
 * dashed-border container so editors know exactly what to drop in.
 *
 * It is intentionally a presentational shell — no live integration lives here.
 */
export interface EmbedSlotProps {
  /** Short label, e.g. "NationBuilder activist signup form". */
  label: string;
  /** Longer description of what embed goes here and where to paste it. */
  description?: string;
  /** Fixed height for the slot (CSS value). Defaults to a comfortable form height. */
  height?: string;
  className?: string;
}

export function EmbedSlot({
  label,
  description,
  height = "min-h-[320px]",
  className,
}: EmbedSlotProps) {
  return (
    <div
      data-ocid="embed_slot"
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-4 border border-dashed border-foreground/30 bg-card/40 px-6 py-10 text-center",
        height,
        className,
      )}
    >
      <span
        className="flex h-12 w-12 items-center justify-center border border-foreground/25 text-foreground/50"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2" />
          <path d="M8 12h12M16 8l4 4-4 4" />
        </svg>
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="text-eyebrow text-foreground/80">{label}</span>
        {description ? (
          <span className="max-w-md font-body text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
        <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/80">
          Paste third-party embed snippet here
        </span>
      </div>
    </div>
  );
}
