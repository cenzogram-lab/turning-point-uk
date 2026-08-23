import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useGalleryItems } from "@/hooks/useGalleryItems";
import { useCreateGalleryItem } from "@/hooks/useGalleryMutations";
import { useGallerySeed } from "@/hooks/useGallerySeed";
import { useHeroVideoConfig } from "@/hooks/useHeroVideoConfig";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { getFallbackImageUrl } from "@/lib/galleryFallback";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types/gallery";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * GalleryPage — full-viewport hero + category filter + true CSS masonry
 * gallery + lightbox.
 *
 * Layout: the photo grid is a TRUE CSS masonry layout using CSS
 * `columns` (1 col mobile, 2 col tablet, 3 col desktop, 4 col wide
 * desktop) with `break-inside: avoid` on each tile, so mixed-orientation
 * event photos pack into variable-height columns with no fixed row
 * heights — no uniform grid.
 *
 * Filtering: a row of category filter buttons sits above the masonry
 * grid. 'All' (default active) shows every item; the four
 * user-specified categories ('Campus Events', 'Direct Action',
 * 'Rallies', 'Education Watch') show only items whose `category`
 * matches. The active button is highlighted with the red --primary
 * accent (inverted style). Filter state is local React state.
 *
 * Per-tile skeleton: each tile shows an animated shimmer placeholder
 * (CSS-only, no extra deps) until the image's `onLoad` fires, then
 * crossfades to the image. The skeleton covers the brief pre-load
 * window for every tile, not just the initial page load.
 *
 * Lightbox: clicking a tile opens the existing full-screen dark
 * lightbox (focus-trapped, Escape close, body-scroll lock, backdrop
 * click close) and now displays the full-resolution image plus the
 * item title, caption/description, event date (if set, formatted
 * nicely), and a category tag.
 *
 * Motion: gallery cards use the `.fade-in-up` / `.fade-in-up-visible`
 * scroll animation (defined in index.css) driven by a dedicated
 * IntersectionObserver here, staggered via `data-entrance-delay`. The
 * hero/section header copy keeps the universal `.entrance-left` system
 * via `useEntranceAnimation`.
 */

const STAGGER_STEP_MS = 60;
const MAX_STAGGER_MS = 480;

/**
 * The five filter buttons. 'All' is the default active filter and shows
 * every item; the other four are the user-specified gallery categories.
 * The order matches the user preference: Campus Events, Direct Action,
 * Rallies, Education Watch.
 */
const FILTER_ALL = "All";
const FILTERS = [
  FILTER_ALL,
  "Campus Events",
  "Direct Action",
  "Rallies",
  "Education Watch",
] as const;
type GalleryFilter = (typeof FILTERS)[number];

/**
 * Stable string keys for the loading skeleton tiles. Using a module-level
 * constant array (instead of an index expression inside `key={...}`) keeps
 * the keys stable across renders without tripping Biome's `noArrayIndexKey`
 * rule, which fires on index expressions used directly as React keys.
 */
const SKELETON_KEYS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
  "skeleton-7",
  "skeleton-8",
] as const;

/**
 * Formats an event date (ms since epoch) as a readable long-form date
 * (e.g. "6 August 2025"). Returns null for falsy/invalid input so the
 * caller can conditionally render the date pill.
 */
function formatEventDate(ms: number | undefined): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return null;
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function GalleryPage() {
  const entranceRef = useEntranceAnimation<HTMLDivElement>();
  const { items, loading, error, backendEmpty } = useGalleryItems();
  const createMutation = useCreateGalleryItem();

  // Hero video config — backend-driven via useHeroVideoConfig().getSlot(key)
  // returns the { videoUrl, posterUrl } for the slot, falling back to the
  // baked-in DEFAULT_HERO_VIDEO_SLOT_MAP while loading / on error / on
  // missing key so the hero never blanks out. The rendered hero video
  // presentation is unchanged — only the data source moves from static
  // VIDEO_* / POSTER_* constants to a backend query.
  const { getSlot } = useHeroVideoConfig();
  const flagWaving = getSlot("flag-waving");

  useSeoMeta({
    title: PAGE_SEO["/gallery"].title,
    description: PAGE_SEO["/gallery"].description,
    canonical: `${SITE_BASE_URL}/gallery`,
    url: `${SITE_BASE_URL}/gallery`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/gallery"])],
  });

  // One-time frontend-driven seed: when the backend gallery is genuinely
  // empty (the query resolved and returned []) and the localStorage flag is
  // unset, fetch the staged photos, build ExternalBlobs, and call
  // createGalleryItem via the existing mutation. The seed populates the
  // backend DB so real records eventually replace the frontend fallback.
  //
  // IMPORTANT: the trigger is `backendEmpty` (the raw backend query result),
  // NOT `items.length === 0`. `items` is fallback-masked by `useGalleryItems`
  // so the public grid is never empty, which means `items.length` is always
  // > 0 and would never trigger the seed. Using `backendEmpty` ensures the
  // seed fires exactly when the backend has no records, populating it so
  // admin edit/delete operations target real persistable records instead of
  // the non-persistable fallback items.
  const isEmpty = backendEmpty;
  useGallerySeed({
    isEmpty,
    createOne: createMutation.mutateAsync,
  });
  // Skeleton only while loading AND no items to show yet. Because the
  // fallback guarantees items synchronously, this is effectively only
  // the brief pre-first-render window when the actor is still fetching.
  const showSkeleton = loading && items.length === 0;

  // Category filter — local React state. 'All' is the default.
  const [filter, setFilter] = useState<GalleryFilter>(FILTER_ALL);

  const filteredItems =
    filter === FILTER_ALL
      ? items
      : items.filter((item) => item.category === filter);

  // Lightbox state — the active gallery item, or null when closed.
  // Index is relative to the FILTERED list so the lightbox always
  // corresponds to the tile the user clicked.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem =
    activeIndex !== null && filteredItems[activeIndex]
      ? filteredItems[activeIndex]
      : null;

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <div ref={entranceRef}>
      <Hero
        eyebrow="In pictures"
        headline="GALLERY"
        sub="Moments from campuses, rallies and direct action."
        videoLabel="Gallery hero video"
        videoSrc={flagWaving?.videoUrl}
        posterSrc={flagWaving?.posterUrl}
      />

      {/* Photo grid — tall, no-snap section so the whole wall reads at once. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="gallery-grid"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              FROM THE FRONT LINE
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              The movement in frames
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Moments from a movement that refuses to be quiet — captured on the
              ground, frame by frame.
            </p>
          </div>

          {items.length > 0 ? (
            <>
              <GalleryFilterBar
                filters={FILTERS}
                active={filter}
                onSelect={setFilter}
              />
              {filteredItems.length > 0 ? (
                <GalleryMasonry items={filteredItems} onOpen={openLightbox} />
              ) : (
                <GalleryFilterEmptyState filter={filter} />
              )}
            </>
          ) : showSkeleton ? (
            <GallerySkeleton />
          ) : error ? (
            <GalleryErrorState onRetry={() => window.location.reload()} />
          ) : (
            <GalleryEmptyState />
          )}
        </div>
      </Section>

      {activeItem ? (
        <GalleryLightbox item={activeItem} onClose={closeLightbox} />
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
    Category filter bar — 'All' + four user-specified categories.
    ───────────────────────────────────────────────────────────── */

interface GalleryFilterBarProps {
  filters: readonly GalleryFilter[];
  active: GalleryFilter;
  onSelect: (filter: GalleryFilter) => void;
}

function GalleryFilterBar({
  filters,
  active,
  onSelect,
}: GalleryFilterBarProps) {
  return (
    <fieldset
      className="gallery-filter-bar"
      data-ocid="gallery.filter_bar"
      aria-label="Filter gallery by category"
    >
      {filters.map((f) => {
        const isActive = f === active;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onSelect(f)}
            data-ocid={`gallery.filter_button.${f.toLowerCase().replace(/\s+/g, "_")}`}
            aria-pressed={isActive}
            className={cn("gallery-filter-button", isActive && "is-active")}
          >
            {f}
          </button>
        );
      })}
    </fieldset>
  );
}

/* ─────────────────────────────────────────────────────────────
    Gallery masonry — true CSS columns, variable-height tiles.
    ───────────────────────────────────────────────────────────── */

interface GalleryMasonryProps {
  items: GalleryItem[];
  onOpen: (index: number) => void;
}

function GalleryMasonry({ items, onOpen }: GalleryMasonryProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Dedicated IntersectionObserver for `.fade-in-up` cards (separate from
  // the universal `.entrance-*` system per the design contract). Staggers
  // via `data-entrance-delay` so cards reveal in sequence as the grid
  // scrolls into view. Re-scans on subtree changes so newly fetched items
  // are picked up.
  // biome-ignore lint/correctness/useExhaustiveDependencies: effect re-observes when the item count changes so newly fetched cards are picked up by the IntersectionObserver
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const reveal = (el: Element) => {
      if (reduced) {
        el.classList.add("fade-in-up-visible");
        return;
      }
      const delayAttr = el.getAttribute("data-entrance-delay");
      const delay = delayAttr ? Number(delayAttr) : 0;
      if (delay && Number.isFinite(delay) && delay > 0) {
        window.setTimeout(() => el.classList.add("fade-in-up-visible"), delay);
      } else {
        el.classList.add("fade-in-up-visible");
      }
    };

    if (reduced) {
      for (const el of root.querySelectorAll(".fade-in-up")) reveal(el);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    const observeAll = () => {
      for (const el of root.querySelectorAll<HTMLElement>(".fade-in-up")) {
        if (!el.classList.contains("fade-in-up-visible")) io.observe(el);
      }
    };

    observeAll();
    const mo = new MutationObserver(() => observeAll());
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [items.length]);

  return (
    <div ref={gridRef} data-ocid="gallery.grid" className="gallery-masonry">
      {items.map((item, i) => (
        <GalleryCard key={item.id} item={item} index={i} onOpen={onOpen} />
      ))}
    </div>
  );
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  onOpen: (index: number) => void;
}

function GalleryCard({ item, index, onOpen }: GalleryCardProps) {
  const stagger = Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS);
  const buttonId = `gallery-card-${item.id}`;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // onError: swap the broken opaque proxy URL to a real browser-fetchable
  // fallback (staged seed asset by title, else neutral placeholder), log the
  // failure for diagnostics, and flag the card so a title overlay renders
  // over the dark neutral background — never a blank black box.
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const failedUrl = item.imageUrl;
      console.error(
        `[gallery] image failed to load — id=${item.id} title="${item.title}" url=${failedUrl}`,
      );
      const fallback = getFallbackImageUrl(item);
      const el = e.currentTarget;
      // Guard against an infinite onError loop if the fallback itself fails.
      if (el.src !== fallback) {
        el.src = fallback;
      }
      setImageFailed(true);
    },
    [item],
  );

  // onLoad: crossfade the skeleton out and the image in. Fires for both
  // the primary URL and any fallback swap (the same <img> element).
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const eventDateLabel = formatEventDate(item.eventDate);

  return (
    <figure
      data-ocid={`gallery.card.${index}`}
      className="gallery-masonry-item fade-in-up flex flex-col"
      data-entrance-delay={String(stagger)}
    >
      <button
        id={buttonId}
        type="button"
        onClick={() => onOpen(index)}
        data-ocid={`gallery.open_lightbox_button.${index}`}
        aria-label={`Open photo: ${item.title}`}
        className="group gallery-tile-frame relative block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Per-tile skeleton — animated shimmer placeholder shown until
            the image's onLoad fires, then crossfades out. CSS-only, no
            extra deps. Hidden once the image has loaded OR once the
            image has failed (the fallback overlay takes over). */}
        <div
          className={cn(
            "gallery-tile-skeleton",
            (imageLoaded || imageFailed) && "is-hidden",
          )}
          aria-hidden="true"
        />
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={cn("gallery-tile-image", imageLoaded && "is-loaded")}
        />
        {/* Fallback title overlay — when the image has failed, render the
            item title visibly over the dark neutral background so the card
            is identifiable at a glance, not a blank black box. */}
        {imageFailed ? (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
            aria-hidden="true"
          >
            <span className="font-display text-base font-semibold uppercase tracking-wide text-foreground/90 line-clamp-2">
              {item.title}
            </span>
            {item.description ? (
              <span className="font-body text-xs font-light leading-snug text-foreground/60 line-clamp-3">
                {item.description}
              </span>
            ) : null}
          </div>
        ) : null}
        {/* Subtle bottom scrim so the hover affordance reads as a photo card. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      </button>
      <figcaption className="mt-3 flex flex-col gap-1">
        <span className="text-lg font-bold text-foreground">{item.title}</span>
        {item.description ? (
          <span className="text-sm text-muted-foreground line-clamp-3">
            {item.description}
          </span>
        ) : null}
        {/* Category + event date meta row — small mono labels beneath the
            caption so each tile carries its categorical + temporal context
            at a glance, mirroring the lightbox metadata. */}
        {item.category || eventDateLabel ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {item.category ? (
              <span className="category-pill is-blog">{item.category}</span>
            ) : null}
            {eventDateLabel ? (
              <span className="gallery-lightbox-date">{eventDateLabel}</span>
            ) : null}
          </div>
        ) : null}
      </figcaption>
    </figure>
  );
}

/* ─────────────────────────────────────────────────────────────
    States — loading skeleton, empty, filter empty, error.
    ───────────────────────────────────────────────────────────── */

function GallerySkeleton() {
  return (
    <div
      data-ocid="gallery.loading_state"
      className="gallery-masonry"
      aria-busy="true"
      aria-label="Loading gallery"
    >
      {SKELETON_KEYS.map((skeletonKey, i) => (
        <div
          key={skeletonKey}
          data-ocid={`gallery.skeleton.${i}`}
          className="gallery-masonry-item flex flex-col"
        >
          {/* Variable-height skeleton frames so the masonry columns look
              like a real mixed-orientation wall even while loading. */}
          <div
            className="gallery-tile-skeleton relative w-full"
            style={{
              aspectRatio:
                i % 3 === 0 ? "3 / 4" : i % 3 === 1 ? "1 / 1" : "4 / 3",
            }}
            aria-hidden="true"
          />
          <div className="mt-3 h-5 w-2/3 animate-pulse bg-card" />
          <div className="mt-2 h-4 w-full animate-pulse bg-card" />
        </div>
      ))}
    </div>
  );
}

function GalleryEmptyState() {
  return (
    <div
      data-ocid="gallery.empty_state"
      className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center"
    >
      <div
        className="flex h-16 w-16 items-center justify-center border border-foreground/20 text-foreground/40"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          role="img"
          aria-label="No photos"
          className="h-8 w-8"
        >
          <rect x="3" y="5" width="18" height="14" rx="0" />
          <circle cx="9" cy="11" r="2" />
          <path d="m3 17 5-4 4 3 4-5 5 6" />
        </svg>
      </div>
      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        No photos yet
      </h3>
      <p className="max-w-md font-body text-base font-light leading-relaxed text-foreground/70">
        The gallery is empty. Moments from campuses, rallies, and direct action
        will appear here once they are captured and uploaded.
      </p>
    </div>
  );
}

function GalleryFilterEmptyState({ filter }: { filter: GalleryFilter }) {
  return (
    <div
      data-ocid="gallery.filter_empty_state"
      className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center"
    >
      <div
        className="flex h-16 w-16 items-center justify-center border border-foreground/20 text-foreground/40"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          role="img"
          aria-label="No photos in this category"
          className="h-8 w-8"
        >
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
      </div>
      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        Nothing in {filter}
      </h3>
      <p className="max-w-md font-body text-base font-light leading-relaxed text-foreground/70">
        No photos are tagged with this category yet. Try another filter or check
        back as more moments are captured.
      </p>
    </div>
  );
}

function GalleryErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      data-ocid="gallery.error_state"
      className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center"
    >
      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        Couldn&apos;t load the gallery
      </h3>
      <p className="max-w-md font-body text-base font-light leading-relaxed text-foreground/70">
        Something went wrong while fetching the photos. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        data-ocid="gallery.retry_button"
        className="btn-primary-square group rounded-full"
      >
        <span>Retry</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
    Lightbox — full-screen dark modal, focus-trapped, keyboard accessible.
    Displays the full-resolution image plus title, caption/description,
    event date (if set, formatted nicely), and a category tag.
    ───────────────────────────────────────────────────────────── */

interface GalleryLightboxProps {
  item: GalleryItem;
  onClose: () => void;
}

function GalleryLightbox({ item, onClose }: GalleryLightboxProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  // onError: swap the broken opaque proxy URL to a real browser-fetchable
  // fallback (staged seed asset by title, else neutral placeholder) and log
  // the failure for diagnostics. The title/description below are always
  // rendered, so no separate failure flag is needed in the lightbox.
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const failedUrl = item.imageUrl;
      console.error(
        `[gallery.lightbox] image failed to load — id=${item.id} title="${item.title}" url=${failedUrl}`,
      );
      const fallback = getFallbackImageUrl(item);
      const el = e.currentTarget;
      if (el.src !== fallback) {
        el.src = fallback;
      }
    },
    [item],
  );

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Move focus into the dialog on open; restore to the trigger on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  // Focus trap — cycle Tab within the dialog.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const root = backdropRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  // Close only when the backdrop itself (not the content) is clicked.
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  const eventDateLabel = formatEventDate(item.eventDate);

  return (
    <div
      ref={backdropRef}
      // biome-ignore lint/a11y/useSemanticElements: custom lightbox needs div+role=dialog for focus-trap + backdrop click handling
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      data-ocid="gallery.lightbox"
      className="lightbox-backdrop animate-[lightbox-fade_0.2s_ease-out_both]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex max-h-full w-full max-w-5xl flex-col items-center gap-4">
        {/* Close button — top-right, keyboard accessible. */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          data-ocid="gallery.lightbox.close_button"
          aria-label="Close photo"
          className={cn(
            "absolute -top-2 right-0 flex h-11 w-11 items-center justify-center",
            "border border-foreground/30 text-foreground/80",
            "transition-smooth hover:border-primary hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* High-resolution image — wrapped in a dark neutral container so a
            failed image shows a dark neutral, not the near-black --card token.
            The image keeps its max-h-[75vh] object-contain sizing; the wrapper
            provides the fallback background. */}
        <div className="flex max-h-[75vh] w-full items-center justify-center bg-image-fallback">
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={handleImageError}
            className="max-h-[75vh] w-auto max-w-full object-contain"
          />
        </div>

        {/* Title + description + category tag + event date beneath the image.
            These are always rendered (not only on failure) so the lightbox is
            identifiable even when the image is broken — never a blank black
            box. The category tag reuses the red --primary accent
            (.category-pill.is-blog) and the event date is a muted mono pill. */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-2 text-center">
          <h3 id={titleId} className="text-lg font-bold text-foreground">
            {item.title}
          </h3>
          {item.description ? (
            <p id={descId} className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>
          ) : null}
          {item.category || eventDateLabel ? (
            <div className="gallery-lightbox-meta">
              {item.category ? (
                <span className="category-pill is-blog">{item.category}</span>
              ) : null}
              {eventDateLabel ? (
                <span className="gallery-lightbox-date">{eventDateLabel}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
