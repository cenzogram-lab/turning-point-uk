import { BackgroundVideo } from "@/components/BackgroundVideo";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import {
  ELON_MUSK_MBGA,
  ELON_MUSK_MBGA_2,
  POSTER_MASCOT_WALK,
  VIDEO_MBGA_HERO,
} from "@/lib/assets";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { useEffect, useRef, useState } from "react";

/**
 * MbgaPage — "$MBGA" token page.
 *
 * A custom full-viewport hero (real <video> background + centered mascot +
 * massive $MBGA ticker + two pill CTAs) followed by three SpaceX-rhythm
 * sections: Mission + Contract Address card, live DexScreener chart, and a
 * 3-column "How to Buy" funnel. Reuses the global Nav, Footer, and
 * LoadingScreen automatically via Layout — this file renders only its own
 * section content.
 *
 * Entrance animations: a single useEntranceAnimation<HTMLDivElement>() ref
 * wraps the whole page; every animated element carries .entrance-left or
 * .entrance-right plus a staggered data-entrance-delay.
 */

const MASCOT_SRC = "/assets/mascots/mbga-mascot.jpg";
const CONTRACT_ADDRESS = "dFybjfpAbTxjen9Ux2Q2dQSFTmrbcVRzYsGoiV5pump";
const DEXSCREENER_URL =
  "https://dexscreener.com/solana/26glcdwx5668yeq7hhhlzfdnarksnwxtguv7dufnzr7v?embed=1&theme=dark&trades=0&info=0";

// The X / Twitter Community URL the hero "Join the X Community" CTA points
// to. Overridden locally (NOT via SOCIAL_LINKS) so the Nav + Footer social
// icons keep pointing at the official Turning Point UK X profile.
const X_PROFILE_HREF = "https://x.com/i/communities/2031955611894890951";
const TELEGRAM_HREF = "https://t.me/MBGAonPF";

const MISSION_COPY =
  "$MBGA is the official Solana token of the Turning Point UK movement — a decentralised way to back free speech, British values, and the next generation of conservative activists. A portion of every swap is routed directly into movement funding: campus chapters, activism kits, and the shareable short-form content that reaches millions of Britons every month. Hold $MBGA to put your capital where your convictions are and help us turn the tide.";

interface BuyStep {
  title: string;
  description: string;
}

const BUY_STEPS: BuyStep[] = [
  {
    title: "1. Get a Wallet",
    description: "Download Phantom or Solflare from the official app store.",
  },
  {
    title: "2. Fund with SOL",
    description:
      "Transfer Solana from your preferred centralised exchange to your new wallet address.",
  },
  {
    title: "3. Swap for $MBGA",
    description:
      "Connect your wallet to Raydium or Pump.fun, paste our official Contract Address, and swap your SOL for $MBGA.",
  },
];

/**
 * Copy-to-clipboard button for the contract address. Shows a transient
 * "Copied!" success state for ~2 seconds before reverting to the default
 * label. Uses navigator.clipboard with a graceful no-op if the API is
 * unavailable (older browsers / insecure contexts).
 */
function CopyCaButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        data-ocid="mbga.ca.copy_button"
        aria-label="Copy contract address to clipboard"
        className="btn-outline-invert rounded-full px-5 py-2 text-xs"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      {copied ? (
        <output
          aria-live="polite"
          data-ocid="mbga.ca.copied_tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-background"
        >
          Copied!
        </output>
      ) : null}
    </div>
  );
}

/**
 * DexScreenerEmbed — live chart iframe with explicit load/error detection.
 *
 * The previous implementation used loading="lazy" with no onLoad/onError
 * handler, so a failed embed rendered as an empty 600px bordered box with
 * only the fallback button below it. This version:
 *   - removes loading="lazy" so the iframe attempts to load on page view,
 *   - shows a visible skeleton while the embed is still loading,
 *   - surfaces a clear fallback panel (with a prominent "View on DexScreener"
 *     button) if the embed errors or fails to load within a timeout.
 *
 * Iframe load detection is inherently limited — browsers do not fire onError
 * for cross-origin iframe network failures, and onLoad fires even for empty
 * error documents. To handle both cases we use a safety timeout: if onLoad
 * has not fired within 8s we treat the embed as failed and show the fallback.
 * The fallback panel is also rendered below the iframe as a persistent CTA so
 * users always have a direct path to the chart regardless of embed state.
 */
const EMBED_LOAD_TIMEOUT_MS = 8000;

function DexScreenerEmbed() {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Safety net: cross-origin iframes do not fire onError on network failure,
    // and some blocked embeds never fire onLoad. Treat a missing onLoad within
    // the timeout window as a failure and surface the fallback.
    timerRef.current = window.setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, EMBED_LOAD_TIMEOUT_MS);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus("loaded");
  };

  const handleError = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus("error");
  };

  return (
    <div className="mt-10 w-full">
      {/* Iframe + loading skeleton share the same 600px frame so the layout
          does not jump when the embed resolves. The skeleton sits behind the
          iframe and is hidden once status !== "loading". */}
      <div
        data-ocid="mbga.chart.frame"
        className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-border bg-card"
      >
        {/* Loading skeleton — animated pulse + spinner + label. */}
        {status === "loading" ? (
          <output
            data-ocid="mbga.chart.loading_state"
            aria-live="polite"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-card"
          >
            <span
              className="loading-arrow-spin text-primary"
              aria-hidden="true"
            />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Loading live chart…
            </span>
          </output>
        ) : null}

        {/* Error fallback — replaces the empty 600px box with a clear recovery
            path. The iframe is unmounted on error so no broken/empty frame
            remains visible. */}
        {status === "error" ? (
          <div
            data-ocid="mbga.chart.error_state"
            role="alert"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-card px-6 text-center"
          >
            <span
              className="flex h-12 w-12 items-center justify-center border border-border text-muted-foreground"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-display text-lg font-semibold uppercase tracking-tight text-foreground">
                Chart unavailable
              </p>
              <p className="max-w-md font-body text-sm text-muted-foreground">
                The live DexScreener embed could not be loaded. Open the chart
                directly on DexScreener in a new tab.
              </p>
            </div>
            <a
              href="https://dexscreener.com/solana/26glcdwx5668yeq7hhhlzfdnarksnwxtguv7dufnzr7v"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="mbga.chart.error_view_button"
              className="btn-primary-square group rounded-full"
            >
              <span>View on DexScreener</span>
            </a>
          </div>
        ) : null}

        {/* The iframe itself. loading="lazy" removed per requirement so the
            embed attempts to load on page view. Kept mounted in the loading
            and loaded states; unmounted on error to avoid a broken frame. */}
        {status !== "error" ? (
          <iframe
            src={DEXSCREENER_URL}
            title="$MBGA Live Chart"
            allow="clipboard-write; fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={handleLoad}
            onError={handleError}
            data-ocid="mbga.chart.iframe"
            className={`entrance-right absolute inset-0 z-10 h-full w-full rounded-2xl border-0 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            data-entrance-delay="220"
          />
        ) : null}
      </div>

      {/* Persistent fallback CTA — always visible below the frame so users
          have a direct path to the chart regardless of embed state. Kept
          distinct from the in-frame error button so it remains available even
          when the embed loads successfully. */}
      <div
        className="mt-8 flex justify-center"
        data-ocid="mbga.chart.fallback_wrap"
      >
        <a
          href="https://dexscreener.com/solana/26glcdwx5668yeq7hhhlzfdnarksnwxtguv7dufnzr7v"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="mbga.chart.view_button"
          className="btn-primary-square group rounded-full"
        >
          <span>View on DexScreener</span>
        </a>
      </div>
    </div>
  );
}

/**
 * HeroVideo — full-bleed background video for the $MBGA hero.
 *
 * Migrated from a raw <video> element to the shared <BackgroundVideo>
 * component so this hero inherits the full mobile-reliability logic:
 *   - IntersectionObserver lazy-loading with a shouldPlay gate (so lazy
 *     heroes emit no network request until near the viewport),
 *   - requestPlay() guarded by !video.paused && !video.ended,
 *   - onCanPlayThrough / onCanPlay / onLoadedData handlers that re-issue
 *     play() once the browser has buffered enough frames,
 *   - video.muted = true set as a PROPERTY via ref in the mount effect
 *     BEFORE requestPlay() and re-asserted in onLoadedMetadata (mobile
 *     Safari autoplay policy requires the muted PROPERTY, not just the
 *     JSX attribute),
 *   - timed play() retries (600ms / 1500ms) for slow-buffering sources,
 *   - poster <img> fallback while buffering / lazy / unmounted.
 *
 * The hero is the top section on /mbga, so lazy={false} makes it load +
 * autoplay immediately (preload="auto") instead of waiting for the
 * IntersectionObserver. The poster (POSTER_MASCOT_WALK) shows the
 * mascot still while the video buffers.
 *
 * CRITICAL Z-LAYERING: <BackgroundVideo> renders the video at z-0
 * (positive — NOT -z-10, which would hide it behind the parent
 * section's bg-background). The gradient overlay sits at z-10 and the
 * content at z-20, matching the shared Hero z-layering scheme.
 */
function HeroVideo() {
  return (
    <BackgroundVideo
      videoSrc={VIDEO_MBGA_HERO}
      posterSrc={POSTER_MASCOT_WALK}
      lazy={false}
      ariaLabel="$MBGA hero background video - lion mascots walking"
      className="z-0"
    />
  );
}

export function MbgaPage() {
  const ref = useEntranceAnimation<HTMLDivElement>();

  useSeoMeta({
    title: PAGE_SEO["/mbga"].title,
    description: PAGE_SEO["/mbga"].description,
    canonical: `${SITE_BASE_URL}/mbga`,
    url: `${SITE_BASE_URL}/mbga`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/mbga"])],
  });

  return (
    <div ref={ref}>
      {/* ─────────────────────────────────────────────────────────────
          SECTION A — HERO
          Custom full-viewport hero: real <video> background + dark scrim +
          centered mascot + massive $MBGA ticker + two pill CTAs.
          ───────────────────────────────────────────────────────────── */}
      <section
        data-ocid="mbga.hero"
        className="relative min-h-[65dvh] overflow-hidden bg-background sm:min-h-[75dvh] md:min-h-[85dvh] lg:min-h-screen"
      >
        {/* Background video plate (placeholder MP4 per user instruction).
            HeroVideo degrades gracefully to the mascot poster <img> if the
            MP4 source 404s, so the hero never shows a broken video control. */}
        <HeroVideo />

        {/* Dark gradient overlay — matches the shared Hero scheme exactly:
            bg-gradient-to-b from-blue-950/85 via-blue-950/65 to-blue-950
            absolute inset-0 z-10. Sits above the video plate (now at z-0)
            and below the content (z-20). Replaces the previous
            bg-gradient-to-t from-navy via-navy/80 to-transparent at z-[1]
            which diverged from the site standard. */}
        <div
          aria-hidden="true"
          className="bg-gradient-to-b from-blue-950/85 via-blue-950/65 to-blue-950 absolute inset-0 z-10"
        />

        {/* Centered content. */}
        <div className="relative z-20 mx-auto flex min-h-[65dvh] w-full max-w-5xl flex-col items-center justify-center px-6 text-center sm:min-h-[75dvh] md:min-h-[85dvh] lg:min-h-screen">
          <img
            src={MASCOT_SRC}
            alt="The official memecoin of Turning Point UK"
            loading="eager"
            draggable={false}
            data-ocid="mbga.hero.mascot"
            className="entrance-left mb-8 h-48 w-48 select-none object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            data-entrance-delay="0"
          />

          <h1
            data-ocid="mbga.hero.headline"
            className="entrance-left font-display text-5xl font-bold uppercase tracking-tight text-foreground sm:text-7xl md:text-9xl"
            data-entrance-delay="120"
          >
            <span className="text-primary">$</span>
            <span>MBGA</span>
          </h1>

          <div
            className="entrance-left mt-10 flex flex-wrap items-center justify-center gap-4"
            data-entrance-delay="260"
          >
            <a
              href="#how-to-buy"
              data-ocid="mbga.hero.buy_button"
              className="btn-primary-square group rounded-full"
            >
              <span>Buy $MBGA</span>
            </a>
            <a
              href={X_PROFILE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="mbga.hero.x_button"
              className="btn-outline-invert rounded-full"
            >
              Join the X Community
            </a>
            <a
              href={TELEGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="mbga.hero.telegram_button"
              className="btn-outline-invert rounded-full"
            >
              Join on Telegram
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B — ELON MUSK ENDORSEMENT
          Uploaded social graphic + "Followed and subscribed by Elon Musk"
          headline. A dedicated endorsement band that pairs the proof image
          with the claim, matching the dark/red theme.
          ───────────────────────────────────────────────────────────── */}
      <Section variant="center" noSnap background="background" id="endorsement">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Endorsement images — two uploaded Elon Musk social graphics
                rendered side by side (stacked on mobile). */}
            <div
              data-ocid="mbga.endorsement.image_wrap"
              className="entrance-left grid grid-cols-1 gap-4 sm:grid-cols-2"
              data-entrance-delay="0"
            >
              <img
                src={ELON_MUSK_MBGA}
                alt="Elon Musk social media graphic endorsing Turning Point UK"
                loading="lazy"
                draggable={false}
                data-ocid="mbga.endorsement.image"
                className="w-full select-none rounded-2xl border border-border object-contain"
              />
              <img
                src={ELON_MUSK_MBGA_2}
                alt="Elon Musk social media graphic on free speech in the UK"
                loading="lazy"
                draggable={false}
                data-ocid="mbga.endorsement.image_2"
                className="w-full select-none rounded-2xl border border-border object-contain"
              />
            </div>

            {/* Endorsement copy. */}
            <div className="flex flex-col items-start">
              <h2
                className="entrance-right mt-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl"
                data-entrance-delay="160"
              >
                Followed and subscribed by{" "}
                <span className="text-primary">Elon Musk</span>
              </h2>
              <p
                className="entrance-right mt-6 font-body text-lg font-light leading-relaxed text-foreground/80"
                data-entrance-delay="260"
              >
                The Make Britain Great Again movement is echoing far beyond our
                borders, capturing the attention of the world's most formidable
                champions of liberty. When leaders like Elon Musk stand with us,
                it proves that the fight for free expression, British culture,
                and national pride is unyielding — the momentum is ours, and the
                tide has officially turned.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C — MISSION & CONTRACT ADDRESS
          ───────────────────────────────────────────────────────────── */}
      <Section variant="center" noSnap background="background" id="mission">
        <div className="mx-auto w-full max-w-4xl px-6 py-20">
          <span
            className="entrance-left font-mono text-sm uppercase tracking-widest text-primary"
            data-entrance-delay="0"
          >
            Our Mission
          </span>
          <h2
            className="entrance-left mt-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl"
            data-entrance-delay="80"
          >
            Funding the Movement
          </h2>
          <p
            className="entrance-left mt-8 font-body text-lg font-light leading-relaxed text-foreground/80"
            data-entrance-delay="200"
          >
            {MISSION_COPY}
          </p>

          {/* Contract Address card. */}
          <div
            data-ocid="mbga.ca.card"
            className="entrance-right mt-10 rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-md"
            data-entrance-delay="320"
          >
            <p className="font-mono text-sm uppercase tracking-wider text-foreground/60">
              Official Solana Contract Address:
            </p>
            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <code
                data-ocid="mbga.ca.address"
                className="block w-full break-all font-mono text-lg text-foreground md:text-xl"
              >
                {CONTRACT_ADDRESS}
              </code>
              <CopyCaButton value={CONTRACT_ADDRESS} />
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C — LIVE CHART (DexScreener)
          ───────────────────────────────────────────────────────────── */}
      <section
        data-ocid="mbga.chart"
        className="w-full bg-background px-6 py-16"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <span
              className="entrance-left font-mono text-sm uppercase tracking-widest text-primary"
              data-entrance-delay="0"
            >
              Live Market
            </span>
            <h2
              className="entrance-left mt-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl"
              data-entrance-delay="80"
            >
              $MBGA Live Chart
            </h2>
          </div>

          <DexScreenerEmbed />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D — HOW TO BUY (3-column grid)
          Anchor target for the hero "Buy $MBGA" button (#how-to-buy).
          ───────────────────────────────────────────────────────────── */}
      <section
        id="how-to-buy"
        data-ocid="mbga.how_to_buy"
        className="w-full scroll-mt-20 bg-background px-6 py-20"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <span
              className="entrance-left font-mono text-sm uppercase tracking-widest text-primary"
              data-entrance-delay="0"
            >
              Get Started
            </span>
            <h2
              className="entrance-left mt-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl"
              data-entrance-delay="80"
            >
              How to Buy $MBGA
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {BUY_STEPS.map((step, i) => (
              <article
                key={step.title}
                data-ocid={`mbga.how_to_buy.card.${i + 1}`}
                className={`${
                  i % 2 === 0 ? "entrance-left" : "entrance-right"
                } flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-md transition-smooth hover:bg-card`}
                data-entrance-delay={i * 120}
              >
                <span
                  className="font-mono text-xs uppercase tracking-[0.2em] text-primary"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="font-body text-sm font-light leading-relaxed text-foreground/70">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default MbgaPage;
