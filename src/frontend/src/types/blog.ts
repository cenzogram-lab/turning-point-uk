import type { BlogPost as BackendBlogPost } from "@/backend";

/**
 * BlogPost — frontend domain type for a blog article record.
 *
 * Mirrors the backend `BlogPost` candid type but uses plain JS `number`
 * for the id and createdAt (the backend returns `bigint`; the frontend
 * normalizes via `toBlogPost` so consumers can use ordinary numbers in
 * JSX keys, comparisons, and form inputs without sprinkling `Number()`
 * at every call site).
 *
 * The `coverImageUrl` field is the opaque object-storage proxy URL
 * produced by `ExternalBlob.getDirectURL()` — never inspect it for a
 * file extension. Use the original upload `file.type` / `file.name` for
 * type detection instead.
 */
export interface BlogPost {
  /** Backend record id (normalized from bigint to number). */
  id: number;
  /** URL-safe slug used for the /blog/$slug route. */
  slug: string;
  /** Display title. */
  title: string;
  /** Short summary / standfirst shown on cards and meta tags. */
  excerpt: string;
  /** Long-form Markdown content body. */
  content: string;
  /** Opaque object-storage proxy URL from `ExternalBlob.getDirectURL()`. */
  coverImageUrl: string;
  /** Category eyebrow (e.g. "Commentary", "Movement Update"). */
  category: string;
  /** Human-readable read-time label (e.g. "6 min read"). */
  readTime: string;
  /** Author byline. */
  author: string;
  /** Whether the post is publicly listed. */
  isPublished: boolean;
  /** Creation timestamp in milliseconds since epoch (normalized from bigint). */
  createdAt: number;
}

/**
 * Input payload for creating a new blog post. The `coverImageUrl` is the
 * result of an object-storage upload (`useBlogUpload`) — the mutation
 * rehydrates it into an `ExternalBlob` via `ExternalBlob.fromURL()`
 * before calling the backend.
 */
export interface CreateBlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  readTime: string;
  author: string;
  isPublished: boolean;
}

/**
 * Input payload for updating an existing blog post. Includes the record
 * id plus every editable field (the backend `updateBlogPost(id, input)`
 * signature takes the full `UpdateBlogPostInput` record).
 */
export interface UpdateBlogPostInput {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  readTime: string;
  author: string;
  isPublished: boolean;
}

/**
 * Normalizes a backend `BlogPost` (bigint id/createdAt, ExternalBlob
 * coverImage) into the frontend `BlogPost` (number id/createdAt, string
 * coverImageUrl). The backend `coverImage` field is an `ExternalBlob`
 * instance whose `getDirectURL()` returns the opaque proxy URL for
 * inline display.
 */
export function toBlogPost(post: BackendBlogPost): BlogPost {
  return {
    id: Number(post.id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImage.getDirectURL(),
    category: post.category,
    readTime: post.readTime,
    author: post.author,
    isPublished: post.isPublished,
    // Backend `createdAt` is a nanosecond bigint (IC Timestamp). Convert to
    // milliseconds since epoch (JS Date unit) by dividing by 1e6 — otherwise
    // `new Date(Number(createdAt))` receives ~1.7e18 and returns Invalid,
    // which throws `RangeError: Invalid time value` from toLocaleDateString.
    createdAt: Number(post.createdAt) / 1_000_000,
  };
}

/** Query key for the published blog posts list (paginated). */
export const BLOG_QUERY_KEY = ["blog", "posts"] as const;

/** Query key for the admin all-posts list (unpaginated, includes drafts). */
export const BLOG_ADMIN_QUERY_KEY = ["blog", "admin", "posts"] as const;

/** Query key prefix for a single post by slug. */
export const BLOG_SLUG_QUERY_KEY = ["blog", "slug"] as const;

/**
 * Query key prefix for published posts filtered by category (paginated).
 * Used by `usePublishedPostsByCategory` so each (category, offset, limit)
 * tuple caches independently across the /blog and /real-british-history
 * hubs.
 */
export const BLOG_CATEGORY_QUERY_KEY = ["blog", "posts", "category"] as const;
