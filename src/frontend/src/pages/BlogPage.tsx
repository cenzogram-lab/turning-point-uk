import { ArticleCard } from "@/components/ArticleCard";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useCreateBlogPost } from "@/hooks/useBlogMutations";
import { usePublishedPostsByCategory } from "@/hooks/useBlogPosts";
import { useBlogSeed } from "@/hooks/useBlogSeed";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { VIDEO_NEWSROOM } from "@/lib/assets";
import { BLOG_COVER_FALLBACK } from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import {
  BREADCRUMB_TRAILS,
  PAGE_SEO,
  SITE_BASE_URL,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import type { BlogPost } from "@/types/blog";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * BlogPage — full-viewport hero + live featured post + responsive grid.
 *
 * Fetches ONLY published posts with category === "Blog" via
 * `usePublishedPostsByCategory("Blog", { offset, limit: 9 })` so the /blog
 * hub shows only Blog-category posts (Real British History posts live on
 * their own hub). The latest published Blog post renders as a full-width
 * featured hero card (`.featured-hero-card`); the remaining posts render
 * in a responsive grid below using the reusable `ArticleCard` component
 * (which routes its Read Article button to /post/$slug). A Load More
 * button fetches the next batch of 9 (incrementing offset) and hides when
 * all published Blog posts are loaded.
 *
 * States mirror GalleryPage: skeleton while the initial fetch is in flight,
 * empty state when no published Blog posts exist, error state if the fetch
 * fails. `useBlogSeed()` triggers the one-time seed of placeholder articles
 * when the backend is empty. `useEntranceAnimation()` drives the universal
 * `.entrance-left` / `.entrance-right` staggered entrance on cards.
 *
 * The featured hero links directly to its canonical /post/$slug article
 * page (the legacy /blog/$slug route redirects there); ArticleCard also
 * links directly to /post/$slug.
 */

/** Category filter for the /blog hub. */
const CATEGORY_BLOG = "Blog";

/** Page size for Load More batches. */
const PAGE_SIZE = 9;

/**
 * Stable string keys for the loading skeleton tiles. Using a module-level
 * constant array (instead of an index expression inside `key={...}`) keeps
 * the keys stable across renders without tripping Biome's `noArrayIndexKey`
 * rule, which fires on index expressions used directly as React keys.
 */
const SKELETON_KEYS = [
  "blog-skeleton-1",
  "blog-skeleton-2",
  "blog-skeleton-3",
  "blog-skeleton-4",
  "blog-skeleton-5",
  "blog-skeleton-6",
  "blog-skeleton-7",
  "blog-skeleton-8",
  "blog-skeleton-9",
] as const;

export function BlogPage() {
  const entranceRef = useEntranceAnimation<HTMLDivElement>();
  const createMutation = useCreateBlogPost();

  useSeoMeta({
    title: PAGE_SEO["/blog"].title,
    description: PAGE_SEO["/blog"].description,
    canonical: `${SITE_BASE_URL}/blog`,
    url: `${SITE_BASE_URL}/blog`,
    jsonLd: [buildBreadcrumbJsonLd(BREADCRUMB_TRAILS["/blog"])],
  });

  // Pagination state — offset increments by PAGE_SIZE on each Load More.
  const [offset, setOffset] = useState(0);

  // Current page (the most recently requested batch) — scoped to the
  // "Blog" category so only Blog-category published posts are returned.
  const {
    posts: pagePosts,
    total,
    loading: pageLoading,
    error,
    isFetching,
  } = usePublishedPostsByCategory({
    category: CATEGORY_BLOG,
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

  // The accumulated list, ordered by createdAt descending (newest first) so
  // the featured hero is always the latest published Blog post.
  const orderedPosts = useMemo(
    () =>
      Array.from(allPosts.values()).sort((a, b) => b.createdAt - a.createdAt),
    [allPosts],
  );

  // The first post is the featured hero; the rest populate the grid.
  const featured = orderedPosts.length > 0 ? orderedPosts[0] : null;
  const gridPosts = orderedPosts.length > 1 ? orderedPosts.slice(1) : [];

  // Load More: increment offset by PAGE_SIZE. The hook re-fetches the next
  // batch and the accumulator merges it in.
  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, []);

  // Hide Load More when every published Blog post is loaded.
  const hasMore = orderedPosts.length < total;

  // Empty only when the initial fetch has settled (not loading, no error)
  // and there are zero published Blog posts. Drives the one-time seed.
  const isEmpty = !pageLoading && !error && orderedPosts.length === 0;
  const { seeding } = useBlogSeed({
    isEmpty,
    createOne: createMutation.mutateAsync,
  });

  // Skeleton only during the initial fetch (offset === 0) with no posts yet.
  const showSkeleton = (pageLoading || seeding) && orderedPosts.length === 0;

  return (
    <div ref={entranceRef}>
      <Hero
        eyebrow="Read"
        headline="BLOG"
        sub="Commentary, campaign updates and news."
        videoLabel="Blog hero video"
        videoSrc={VIDEO_NEWSROOM}
      />

      {/* Article grid — tall, no-snap section. */}
      <Section
        variant="center"
        background="background"
        noSnap
        id="blog-grid"
        className="px-6 py-20 sm:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span
              className="entrance-left text-eyebrow text-foreground/70"
              data-entrance-delay="0"
            >
              LATEST FROM THE MOVEMENT
            </span>
            <h2
              className="entrance-left text-headline text-foreground"
              data-entrance-delay="80"
            >
              Words that move people
            </h2>
            <p
              className="entrance-left max-w-2xl font-body text-base font-light leading-relaxed text-foreground/75 sm:text-lg"
              data-entrance-delay="200"
            >
              Commentary, campaign updates and news from Turning Point UK.
            </p>
          </div>

          {showSkeleton ? (
            <BlogSkeleton />
          ) : error ? (
            <BlogErrorState onRetry={() => window.location.reload()} />
          ) : orderedPosts.length === 0 ? (
            <BlogEmptyState />
          ) : (
            <>
              {featured ? <FeaturedHero post={featured} /> : null}

              {gridPosts.length > 0 ? (
                <div
                  data-ocid="blog.grid"
                  className="entrance-left grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  data-entrance-delay="320"
                >
                  {gridPosts.map((post, i) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      index={i}
                      baseDelay={400}
                    />
                  ))}
                </div>
              ) : null}

              {hasMore ? (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    data-ocid="blog.load_more_button"
                    aria-busy={isFetching || undefined}
                    className="load-more-button"
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
   Featured hero — full-width cinematic featured post at the top.
   The most recent published Blog-category post. Links directly to the
   canonical /post/$slug reading route (same as ArticleCard).
   ───────────────────────────────────────────────────────────── */

interface FeaturedHeroProps {
  post: BlogPost;
}

function FeaturedHero({ post }: FeaturedHeroProps) {
  // Cover source: the post's own cover when present, otherwise the bundled
  // fallback asset so the hero always renders a real image (never a broken
  // image or a blank frame).
  const hasCover = Boolean(post.coverImageUrl);
  const coverSrc = hasCover ? post.coverImageUrl : BLOG_COVER_FALLBACK;
  // Tracks whether the cover <img> failed to load so we can swap it to the
  // bundled fallback asset instead of leaving a broken-image icon visible.
  // A broken proxy URL (empty-string check passed but bytes never resolve)
  // triggers onError; we swap the src once and stop, so the hero always
  // shows a real image with the alt text intact.
  const [coverFailed, setCoverFailed] = useState(false);

  const handleCoverError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (coverFailed) return; // already swapped to the bundled fallback
      e.currentTarget.src = BLOG_COVER_FALLBACK;
      setCoverFailed(true);
    },
    [coverFailed],
  );

  return (
    <Link
      to={ROUTES.post}
      params={{ slug: post.slug }}
      data-ocid="blog.featured_hero"
      aria-label={`Read: ${post.title}`}
      className="featured-hero-card entrance-left group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      data-entrance-delay="240"
    >
      <img
        src={coverSrc}
        alt={post.title}
        loading="eager"
        decoding="async"
        onError={handleCoverError}
        className="featured-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="featured-scrim" aria-hidden="true" />
      <div className="featured-content">
        <span className="category-badge">{post.category}</span>
        <h3 className="font-display text-3xl font-bold uppercase leading-tight tracking-[-0.01em] text-foreground sm:text-4xl lg:text-5xl">
          {post.title}
        </h3>
        <p className="max-w-2xl font-body text-base font-light leading-relaxed text-foreground/80 sm:text-lg line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
            {post.readTime}
          </span>
          <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-smooth group-hover:text-[oklch(0.62_0.24_25)]">
            Read Article
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   States — loading skeleton, empty, error.
   ───────────────────────────────────────────────────────────── */

function BlogSkeleton() {
  return (
    <div
      data-ocid="blog.loading_state"
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading blog"
    >
      {/* Featured hero skeleton */}
      <div className="aspect-[16/9] w-full animate-pulse bg-card sm:aspect-[21/9]" />
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_KEYS.map((skeletonKey, i) => (
          <div
            key={skeletonKey}
            data-ocid={`blog.skeleton.${i}`}
            className="flex flex-col"
          >
            <div className="aspect-[16/9] w-full animate-pulse bg-card" />
            <div className="mt-3 h-5 w-1/3 animate-pulse bg-card" />
            <div className="mt-2 h-6 w-2/3 animate-pulse bg-card" />
            <div className="mt-2 h-4 w-full animate-pulse bg-card" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogEmptyState() {
  return (
    <div
      data-ocid="blog.empty_state"
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
        No Blog-category articles have been published yet. Commentary, campaign
        updates and news from Turning Point UK will appear here once they are
        published.
      </p>
    </div>
  );
}

function BlogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      data-ocid="blog.error_state"
      className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center"
    >
      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        Couldn&apos;t load the blog
      </h3>
      <p className="max-w-md font-body text-base font-light leading-relaxed text-foreground/70">
        Something went wrong while fetching the articles. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        data-ocid="blog.retry_button"
        className="btn-primary-square group rounded-full"
      >
        <span>Retry</span>
      </button>
    </div>
  );
}
