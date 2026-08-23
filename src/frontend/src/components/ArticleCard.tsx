import { BLOG_COVER_FALLBACK } from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import type { BlogPost } from "@/types/blog";
import { Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";

/**
 * ArticleCard — reusable vertical preview card for hub grids.
 *
 * Renders a 16:9 cover image (with a graceful fallback when no cover image
 * exists), a per-category pill, a 2-line title, author + readTime metadata,
 * and a primary red CTA button. The entire card AND the button navigate to
 * the article's reading route.
 *
 * The reading route is chosen by `post.category` so the URL bar preserves
 * the hub prefix the reader clicked from:
 *   - "Real British History" → /real-british-history/$slug (CTA: READ STORY)
 *   - any other category      → /blog/$slug                 (CTA: READ ARTICLE)
 * A post whose category does not match either hub falls back to the
 * canonical /post/$slug route.
 *
 * Used by both hub pages (/blog grid below the featured hero, and
 * /real-british-history uniform grid) so the two hubs share a single
 * card aesthetic. The category pill color is selected by `post.category`:
 *   - "Blog"               → .category-pill.is-blog (red --primary)
 *   - "Real British History" → .category-pill.is-rbh (azure --category-rbh)
 *
 * Styling lives in index.css as the .article-card / .article-card-cover /
 * .article-card-body / .article-card-title / .article-card-meta /
 * .category-pill / .read-article-button utilities (per the design contract).
 */

/** Category labels that map to a dedicated pill variant / route / CTA. */
const CATEGORY_RBH = "Real British History";
const CATEGORY_BLOG = "Blog";

/**
 * Returns the category-pill modifier class for a post's category.
 * Falls back to the red .is-blog variant for any unrecognized category so
 * the pill always has a visible color.
 */
function pillClassForCategory(category: string): string {
  if (category === CATEGORY_RBH) return "category-pill is-rbh";
  return "category-pill is-blog";
}

/**
 * Returns the TanStack Router `to` route value for a post's reading link,
 * chosen by `post.category` so the URL bar preserves the hub prefix:
 *   - "Real British History" → /real-british-history/$slug
 *   - "Blog"                 → /blog/$slug
 *   - any other category      → /post/$slug (canonical fallback)
 */
function articleRouteForCategory(category: string): string {
  if (category === CATEGORY_RBH) return ROUTES.realBritishHistoryArticle;
  if (category === CATEGORY_BLOG) return ROUTES.blogArticle;
  return ROUTES.post;
}

/**
 * Returns the CTA button label for a post's category, per the user
 * preference: 'READ STORY' for Real British History posts, 'READ ARTICLE'
 * for blog posts (and any other category).
 */
function ctaLabelForCategory(category: string): string {
  if (category === CATEGORY_RBH) return "Read Story";
  return "Read Article";
}

export interface ArticleCardProps {
  /** The blog post to render. */
  post: BlogPost;
  /**
   * Optional stable index for the data-ocid marker and entrance stagger.
   * Hubs pass the card's position in the grid so deterministic tests can
   * target cards by numeric position.
   */
  index?: number;
  /** Optional base delay (ms) for the entrance animation stagger. */
  baseDelay?: number;
}

export function ArticleCard({
  post,
  index = 0,
  baseDelay = 0,
}: ArticleCardProps) {
  const stagger = Math.min(baseDelay + index * 60, 480);
  const hasCover = Boolean(post.coverImageUrl);
  // Reading route chosen by post.category so the URL bar preserves the hub
  // prefix the reader clicked from (RBH → /real-british-history/$slug,
  // Blog → /blog/$slug, else canonical /post/$slug).
  const articleRoute = articleRouteForCategory(post.category);
  const ctaLabel = ctaLabelForCategory(post.category);
  // Cover source: the post's own cover when present, otherwise the bundled
  // fallback asset so every card renders a real image (never a blank box).
  const coverSrc = hasCover ? post.coverImageUrl : BLOG_COVER_FALLBACK;
  // Tracks whether the cover <img> failed to load so we can swap it to the
  // bundled fallback asset instead of leaving a broken-image icon visible.
  // A broken proxy URL (empty-string check passed but bytes never resolve)
  // triggers onError; we swap the src once and stop, so the card always
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
      to={articleRoute}
      params={{ slug: post.slug }}
      data-ocid={`article_card.item.${index}`}
      aria-label={`${ctaLabel}: ${post.title}`}
      className="article-card entrance-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      data-entrance-delay={String(stagger)}
    >
      {/* Cover image — 16:9, object-cover. When coverImageUrl is empty OR
          when the cover URL fails to load, the <img> swaps to the bundled
          BLOG_COVER_FALLBACK asset so the card always renders a real photo
          (never a broken-image icon or a blank "No cover" box). The alt
          text stays the post title throughout. */}
      <div className="article-card-cover">
        <img
          src={coverSrc}
          alt={post.title}
          loading="lazy"
          decoding="async"
          onError={handleCoverError}
        />
      </div>

      <div className="article-card-body">
        {/* Category pill — per-category color. */}
        <span className={pillClassForCategory(post.category)}>
          {post.category}
        </span>

        {/* Title — bright white, Oswald 700 uppercase, line-clamp-2. */}
        <h3 className="article-card-title">{post.title}</h3>

        {/* Author + readTime on one line, separated by a dot. */}
        <div className="article-card-meta">
          <span>By {post.author}</span>
          <span className="meta-dot" aria-hidden="true" />
          <span>{post.readTime}</span>
        </div>

        {/* CTA button — solid red, full-width, navigates to the article's
            reading route. The parent <Link> already navigates on a click
            anywhere on the card; the button is a visible primary CTA that
            also routes to the same destination. Label is category-aware
            per the user preference: 'Read Story' for RBH, 'Read Article'
            otherwise. */}
        <span
          className="read-article-button"
          data-ocid={`article_card.read_button.${index}`}
        >
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}

export default ArticleCard;
