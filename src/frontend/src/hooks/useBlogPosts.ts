import { createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import {
  BLOG_ADMIN_QUERY_KEY,
  BLOG_CATEGORY_QUERY_KEY,
  BLOG_QUERY_KEY,
  BLOG_SLUG_QUERY_KEY,
  type BlogPost,
  toBlogPost,
} from "@/types/blog";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * useBlogPosts — fetches a page of published posts via
 * `listPublishedPosts(offset, limit)`.
 *
 * The backend returns `{ posts: BlogPost[], total: bigint }`. This hook
 * normalizes every post via `toBlogPost` (bigint->number,
 * ExternalBlob.getDirectURL()->coverImageUrl) and returns
 * `{ posts: BlogPost[], total: number }` so consumers can use ordinary
 * numbers for pagination math (Load More batches of 9).
 *
 * The query is enabled only once the actor is ready (post-auth). While
 * the actor is fetching, `isLoading` is true so callers can show a
 * skeleton without distinguishing the two loading phases.
 *
 * Mock mode: when `VITE_USE_MOCK=true` the core-infrastructure actor
 * factory cannot reach a real canister, so `useActor` returns a null
 * actor and the query would never fire. To keep the public blog hub
 * rendering the seeded sample posts during frontend-only development,
 * we fall back to the in-memory `mockBackend` (from `@/mocks/backend`)
 * whenever the real actor is null AND mock mode is enabled. Production
 * behavior is unchanged — the fallback only activates in mock mode.
 *
 * Mirrors `useGalleryItems` but with pagination params.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Resolves the effective backend actor for read queries. Returns the
 * real actor when available; otherwise falls back to `mockBackend` in
 * mock mode so seeded sample data renders on /blog and /real-british-history.
 * Returns `null` in production when the actor is not yet ready.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

export interface UseBlogPostsArgs {
  /** Number of published posts to skip (zero-based offset). */
  offset: number;
  /** Page size (the blog hub uses batches of 9). */
  limit: number;
}

export interface BlogPostsPage {
  /** Normalized published posts for the requested page. */
  posts: BlogPost[];
  /** Total published post count (normalized from bigint). */
  total: number;
}

export function useBlogPosts({ offset, limit }: UseBlogPostsArgs) {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<BlogPostsPage>({
    queryKey: [...BLOG_QUERY_KEY, offset, limit],
    queryFn: async () => {
      if (!resolvedActor) return { posts: [], total: 0 };
      const page = await resolvedActor.listPublishedPosts(
        BigInt(offset),
        BigInt(limit),
      );
      return {
        posts: page.posts.map(toBlogPost),
        total: Number(page.total),
      };
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  return {
    posts: query.data?.posts ?? [],
    total: query.data?.total ?? 0,
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * useAllBlogPosts — fetches every post (published + draft) via
 * `listAllPosts()` for the admin dashboard. Mirrors `useGalleryItems`
 * but for the blog admin list. Normalizes via `toBlogPost`.
 */
export function useAllBlogPosts() {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<BlogPost[]>({
    queryKey: BLOG_ADMIN_QUERY_KEY,
    queryFn: async () => {
      if (!resolvedActor) return [];
      const posts = await resolvedActor.listAllPosts();
      return posts.map(toBlogPost);
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  return {
    posts: query.data ?? [],
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * usePublishedPostsByCategory — fetches a page of published posts filtered
 * by category via `listPublishedPostsByCategory(category, offset, limit)`.
 *
 * Mirrors `useBlogPosts` but scopes the query to a single category so the
 * /blog hub (category "Blog") and the /real-british-history hub (category
 * "Real British History") each fetch only their own posts. The query key
 * includes the category so each hub caches independently. Normalizes every
 * post via `toBlogPost` and returns `{ posts, total }` with ordinary
 * numbers for Load More pagination math (batches of 9).
 */
export interface UsePublishedPostsByCategoryArgs {
  /** Category filter (e.g. "Blog" or "Real British History"). */
  category: string;
  /** Number of published posts to skip (zero-based offset). */
  offset: number;
  /** Page size (the hubs use batches of 9). */
  limit: number;
}

export function usePublishedPostsByCategory({
  category,
  offset,
  limit,
}: UsePublishedPostsByCategoryArgs) {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<BlogPostsPage>({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, category, offset, limit],
    queryFn: async () => {
      if (!resolvedActor) return { posts: [], total: 0 };
      const page = await resolvedActor.listPublishedPostsByCategory(
        category,
        BigInt(offset),
        BigInt(limit),
      );
      return {
        posts: page.posts.map(toBlogPost),
        total: Number(page.total),
      };
    },
    enabled:
      Boolean(resolvedActor) && (USE_MOCK || !isFetching) && Boolean(category),
  });

  return {
    posts: query.data?.posts ?? [],
    total: query.data?.total ?? 0,
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * useBlogPostBySlug — fetches a single published post by its slug via
 * `getPostBySlug(slug)`. Returns `null` when the slug matches no post.
 * Used by the /post/$slug article page (canonical reading route) and the
 * legacy /blog/$slug redirect target.
 */
export function useBlogPostBySlug(slug: string) {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<BlogPost | null>({
    queryKey: [...BLOG_SLUG_QUERY_KEY, slug],
    queryFn: async () => {
      if (!resolvedActor) return null;
      const post = await resolvedActor.getPostBySlug(slug);
      return post ? toBlogPost(post) : null;
    },
    enabled:
      Boolean(resolvedActor) && (USE_MOCK || !isFetching) && Boolean(slug),
  });

  return {
    post: query.data ?? null,
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
