import { ArticleCard } from "@/components/ArticleCard";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { usePublishedPostsByCategory } from "@/hooks/useBlogPosts";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useHeroVideoConfig } from "@/hooks/useHeroVideoConfig";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import type { BlogPost } from "@/types/blog";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * RealBritishHistoryPage — the /real-british-history hub.
 *
 * Sibling of /blog with one key difference: NO featured hero card. The
 * page opens with a `.hub-header` zone (mono eyebrow, bright white
 * Oswald headline, soft blue-grey standfirst) and then renders a uniform
 * 3-column `ArticleCard` grid of every published post whose category is
 * "Real British History".
 *
 * Data comes from `usePublishedPostsByCategory("Real British History",
 * { offset, limit })` which calls the backend's
 * `listPublishedPostsByCategory(category, offset, limit)`. Load More
 * pagination runs in batches of 9 (PAGE_SIZE) using the same Map<id,
 * BlogPost> accumulation/dedupe pattern as BlogPage so refetches never
 * lose previously loaded cards and never flash the un-accumulated page.
 *
 * States mirror BlogPage: skeleton while the initial fetch is in flight,
 * empty state when no Real British History posts are published, error
 * state if the fetch fails. `useEntranceAnimation()` drives the
 * universal `.entrance-left` staggered entrance on the header and cards.
 *
 * Each card links to its `/post/$slug` article page (the canonical
 * reading route shared by every hub).
 */

/** Category filter for this hub. */
const CATEGORY = "Real British History";

/** Page size for Load More batches. */
const PAGE_SIZE = 9;

/**
 * Stable string keys for the loading skeleton tiles. Using a module-level
 * constant array (instead of an index expression inside `key={...}`) keeps
 * the keys stable across renders without tripping Biome's `noArrayIndexKey`
 * rule, which fires on index expressions used directly as React keys.
 */
const SKELETON_KEYS = [
  "rbh-skeleton-1",
  "rbh-skeleton-2",
  "rbh-skeleton-3",
  "rbh-skeleton-4",
  "rbh-skeleton-5",
  "rbh-skeleton-6",
  "rbh-skeleton-7",
  "rbh-skeleton-8",
  "rbh-skeleton-9",
] as const;

export function RealBritishHistoryPage() {
  const entranceRef = useEntranceAnimation<HTMLDivElement>();

  // Hero video config — backend-driven via useHeroVideoConfig().getSlot(key)
  // returns the { videoUrl, posterUrl } for the slot, falling back to the
  // baked-in DEFAULT_HERO_VIDEO_SLOT_MAP while loading / on error / on
  // missing key so the hero never blanks out. The rendered hero video
  // presentation is unchanged — only the data source moves from static
  // VIDEO_* / POSTER_* constants to a backend query.
  const { getSlot } = useHeroVideoConfig();
  const historicLondon = getSlot("historic-london");

  // Pagination state — offset increments by PAGE_SIZE on each Load More.
  const [offset, setOffset] = useState(0);

  // Current page (the most recently requested batch), scoped to the
  // "Real British History" category.
  const {
    posts: pagePosts,
    total,
    loading: pageLoading,
    error,
    isFetching,
  } = usePublishedPostsByCategory({
    category: CATEGORY,
    offset,
    limit: PAGE_SIZE,
  });

  // Accumulate every loaded post across pages in a Map keyed by id so
  // refetches / re-renders dedupe and never lose previously loaded cards.
  const [accumulated, setAccumulated] = useState<Map<number, BlogPost>>(
    new Map(),
  );

  // Merge the current page into the accumulator whenever pagePosts changes.
  // Using useEffect here would re-render after paint; doing it during render
  // via a derived map keeps the UI in sync with the latest page immediately.
  const allPosts = useMemo(() => {
    if (pagePosts.length === 0) return accumulated;
    const next = new Map(accumulated);
    for (const post of pagePosts) next.set(post.id, post);
    return next;
  }, [pagePosts, accumulated]);

  // Commit the derived map back to state so it persists across the next
  // offset change. The computation lives in useMemo above (pure, returns
  // the derived value); this useEffect commits it to state after render
  // so React never sees a setState call during render (which would cause
  // extra re-renders, StrictMode warnings, and potential render loops).
  useEffect(() => {
    if (allPosts.size !== accumulated.size || pagePosts.length > 0) {
      setAccumulated(allPosts);
    }
  }, [allPosts, accumulated, pagePosts]);

  // The accumulated list, ordered by createdAt descending (newest first).
  const orderedPosts = useMemo(
    () =>
      Array.from(allPosts.values()).sort((a, b) => b.createdAt - a.createdAt),
    [allPosts],
  );

  // Load More: increment offset by PAGE_SIZE. The hook re-fetches the next
  // batch and the accumulator merges it in.
  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, []);

  // Hide Load More when every published Real British History post is loaded.
  const hasMore = orderedPosts.length < total;

  // Empty only when the initial fetch has settled (not loading, no error)
  // and there are zero published posts for this category.
  const isEmpty = !pageLoading && !error && orderedPosts.length === 0;

  // Skeleton only during the initial fetch (offset === 0) with no posts yet.
  const showSkeleton = pageLoading && orderedPosts.length === 0;

  // SEO meta for the hub. Pass null (not undefined) for fields we don't
  // inject so useSeoMeta skips them and cleanup restores the app-wide
  // title on unmount. Title/description come from the centralized
  // PAGE_SEO copy; canonical + og:url use the absolute SITE_BASE_URL;
  // jsonLd injects the BreadcrumbList for the /real-british-history trail.
  useSeoMeta({
    title: PAGE_SEO["/real-british-history"].title,
    description: PAGE_SEO["/real-british-history"].description,
    canonical: `${SITE_BASE_URL}/real-british-history`,
    url: `${SITE_BASE_URL}/real-british-history`,
    siteName: "Turning Point UK",
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/real-british-history"])],
  });

  return (
    <div ref={entranceRef}>
      {/* Video hero — full-bleed native HTML5 background video for the
          Real British History hub. Sits above the existing text-only
          hub-header Section, which is preserved below. The shared Hero
          component renders the video at z-0, the dark blue gradient
          overlay at z-10, and the eyebrow + headline + sub at z-20, with
          a bottom-edge fade that blends into the hub-header beneath it. */}
      <Hero
        videoSrc={historicLondon?.videoUrl}
        posterSrc={historicLondon?.posterUrl}
        videoLabel="Real British History hero"
        eyebrow="Turning Point UK"
        headline="REAL BRITISH HISTORY"
        sub="Recovered and reconsidered chapters of Britain's past — the people, events and ideas the established narrative left out."
      />

      {/* Hub header — replaces the featured hero. Eyebrow + display
          headline + standfirst, centered, max-w-48rem. No featured card. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="rbh-header"
        className="px-6 pt-32 pb-8 sm:px-10"
      >
        <header className="hub-header mx-auto text-center">
          <span className="hub-eyebrow entrance-left" data-entrance-delay="0">
            REAL BRITISH HISTORY
          </span>
          <h2 className="hub-title entrance-left" data-entrance-delay="80">
            The story they stopped telling
          </h2>
          <p
            className="hub-standfirst entrance-left mx-auto"
            data-entrance-delay="200"
          >
            Recovered and reconsidered chapters of Britain's past — the people,
            events and ideas the established narrative left out.
          </p>
        </header>
      </Section>

      {/* Uniform ArticleCard grid — no featured hero. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="rbh-grid"
        className="px-6 pb-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          {showSkeleton ? (
            <RbhSkeleton />
          ) : error ? (
            <RbhErrorState onRetry={() => window.location.reload()} />
          ) : isEmpty ? (
            <RbhEmptyState />
          ) : (
            <>
              <div
                data-ocid="rbh.grid"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {orderedPosts.map((post, i) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    index={i}
                    baseDelay={240}
                  />
                ))}
              </div>

              {hasMore ? (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    data-ocid="rbh.load_more_button"
                    aria-busy={isFetching || undefined}
                    className="load-more-button entrance-left"
                    data-entrance-delay="320"
                  >
                    {isFetching ? "Loading…" : "Load More"}
                    {!isFetching ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    ) : null}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   States — loading skeleton, empty, error.
   ───────────────────────────────────────────────────────────── */

function RbhSkeleton() {
  return (
    <div
      data-ocid="rbh.loading_state"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading Real British History articles"
    >
      {SKELETON_KEYS.map((skeletonKey, i) => (
        <div
          key={skeletonKey}
          data-ocid={`rbh.skeleton.${i}`}
          className="flex flex-col"
        >
          <div className="aspect-[16/9] w-full animate-pulse bg-card" />
          <div className="mt-3 h-5 w-1/3 animate-pulse bg-card" />
          <div className="mt-2 h-6 w-2/3 animate-pulse bg-card" />
          <div className="mt-2 h-4 w-full animate-pulse bg-card" />
          <div className="mt-3 h-10 w-full animate-pulse bg-card" />
        </div>
      ))}
    </div>
  );
}

function RbhEmptyState() {
  return (
    <div
      data-ocid="rbh.empty_state"
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
          aria-label="No articles"
          className="h-8 w-8"
        >
          <path d="M4 5h16M4 10h16M4 15h10M4 20h10" />
        </svg>
      </div>
      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        No articles yet
      </h3>
      <p className="max-w-md font-body text-base font-light leading-relaxed text-foreground/70">
        Recovered and reconsidered chapters of Britain's past will appear here
        once they are published.
      </p>
    </div>
  );
}

function RbhErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      data-ocid="rbh.error_state"
      className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center"
    >
      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        Couldn&apos;t load Real British History
      </h3>
      <p className="max-w-md font-body text-base font-light leading-relaxed text-foreground/70">
        Something went wrong while fetching the articles. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        data-ocid="rbh.retry_button"
        className="btn-primary-square group rounded-full"
      >
        <span>Retry</span>
      </button>
    </div>
  );
}

export default RealBritishHistoryPage;
