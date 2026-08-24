import { Hero } from "@/components/Hero";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { VIDEO_HISTORIC_LONDON, VIDEO_NEWSPAPER_AD } from "@/lib/assets";
import { BLOG_COVER_FALLBACK } from "@/lib/assets";
import { ROUTES } from "@/lib/routes";
import { OG_IMAGE_URL, SITE_BASE_URL, buildBreadcrumbJsonLd } from "@/lib/seo";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Link2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Category string for Real British History posts. Matches the value used by
 * the backend, the seed data, ArticleCard, AdminBlogPage, and
 * RealBritishHistoryPage. Declared locally (same pattern as the other files)
 * so the back link can be category-aware without a shared constant.
 */
const CATEGORY_RBH = "Real British History";

/**
 * The three alias prefixes PostArticlePage can be reached through. Each maps
 * to a hub (Blog or Real British History) or the canonical /post/ arrival.
 * Detected from the current pathname via TanStack Router's useLocation.
 */
type ArticleAlias = "blog" | "rbh" | "post";

/**
 * Detects which alias route the reader arrived through by inspecting the
 * current pathname prefix. `/blog/` → blog alias, `/real-british-history/`
 * → rbh alias, anything else (including `/post/`) → canonical post arrival.
 */
function detectAlias(pathname: string): ArticleAlias {
  if (pathname.startsWith("/blog/")) return "blog";
  if (pathname.startsWith("/real-british-history/")) return "rbh";
  return "post";
}

/**
 * Picks the hero background video slot key for the article page based on the
 * arrival alias. When the reader arrived via a hub alias, that hub's slot
 * wins. When the reader arrived via the canonical /post/ route directly,
 * the article's own category decides (Blog → newspaper, RBH → historic,
 * anything else → newspaper as a sensible default so the hero always has a
 * video plate rather than a flat placeholder). Returns a slot-key string
 * that the caller resolves through useHeroVideoConfig().getSlot(key) so the
 * video/poster URLs come from the backend-driven config (with the baked-in
 * DEFAULT_HERO_VIDEO_SLOT_MAP fallback) instead of static URL constants.
 */
function pickHeroVideoSlotKey(
  alias: ArticleAlias,
  category: string | undefined,
): string {
  if (alias === "blog") return "newspaper-ad";
  if (alias === "rbh") return "historic-london";
  // Canonical /post/ arrival — fall back to the article's category.
  if (category === CATEGORY_RBH) return "historic-london";
  // Blog category and any other category default to the newspaper video so
  // the hero always renders a real background video plate.
  return "newspaper-ad";
}

/**
 * Resolves the back-link target route and label for the article page based
 * on the arrival alias. Hub aliases pin to their own hub; the canonical
 * /post/ arrival falls back to the article's category (RBH → History, else
 * → Blog) so a directly-shared link still points the reader back to the
 * right hub.
 */
function resolveBackLink(
  alias: ArticleAlias,
  category: string | undefined,
): { to: string; label: string } {
  if (alias === "blog") {
    return { to: ROUTES.blog, label: "Back to Blog" };
  }
  if (alias === "rbh") {
    return { to: ROUTES.realBritishHistory, label: "Back to History" };
  }
  // Canonical /post/ arrival — category-based fallback.
  if (category === CATEGORY_RBH) {
    return { to: ROUTES.realBritishHistory, label: "Back to History" };
  }
  return { to: ROUTES.blog, label: "Back to Blog" };
}

/**
 * PostArticlePage — the canonical dynamic /post/$slug article reading page.
 *
 * Mirrors the existing cinematic full-width cover (.cinematic-cover), narrow
 * .article-reading-column, MarkdownRenderer body, useSeoMeta, 404 panel, and
 * scroll-to-top behavior. It is registered at THREE alias routes in App.tsx
 * (/post/$slug, /blog/$slug, /real-british-history/$slug) and detects which
 * alias the reader arrived through by reading the current pathname so it can
 * pick the right hero background video and back-link label without duplicating
 * any page logic.
 *
 * A full-viewport Hero with the alias-selected background video renders at
 * the top of the page (newspaper video for the blog alias, historic video for
 * the RBH alias, category-driven for the canonical /post/ arrival), matching
 * the visual style of the hub pages.
 *
 * Social share buttons (X/Twitter, Facebook, copy-link) render at the end of
 * the article using simple anchor links with share URLs — no external SDKs.
 *
 * States:
 *  - loading    → branded loading screen (matches the rest of the app)
 *  - not-found  → 404 panel with a back link to /blog
 *  - error      → same 404 panel (a missing slug is the common cause)
 *  - ready      → hero + cinematic cover + reading column + share buttons
 *
 * The slug param is read with `useParams({ strict: false })` because the
 * route is registered as a flat child of the root route.
 */
/**
 * HERO_VIDEO_BY_SLOT — in-code mapping from the article hero slot key to its
 * hosted background video. Embedded directly here (not fetched from the
 * backend config) so the article hero always renders the intended footage.
 */
const HERO_VIDEO_BY_SLOT: Record<string, string> = {
  "newspaper-ad": VIDEO_NEWSPAPER_AD,
  "historic-london": VIDEO_HISTORIC_LONDON,
};

export function PostArticlePage() {
  const { slug } = useParams({ strict: false });
  const safeSlug = typeof slug === "string" ? slug : "";
  const location = useLocation();
  const alias = detectAlias(location.pathname);

  const { post, loading, error } = useBlogPostBySlug(safeSlug);
  const containerRef = useEntranceAnimation<HTMLDivElement>();

  // Tracks whether the cinematic cover <img> failed to load so we can swap it
  // to the bundled BLOG_COVER_FALLBACK asset instead of leaving a broken
  // image or a blank "No cover" box. The cover scrim still renders over the
  // fallback image so the reading column transition stays continuous.
  const [coverFailed, setCoverFailed] = useState(false);
  const handleCoverError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (coverFailed) return; // already swapped to the bundled fallback
      e.currentTarget.src = BLOG_COVER_FALLBACK;
      setCoverFailed(true);
    },
    [coverFailed],
  );

  // Copy-link share button state — flips to a "Copied" confirmation for a
  // few seconds after the reader copies the canonical article URL.
  const [copied, setCopied] = useState(false);

  // Canonical share URL — always the /post/$slug route so a shared link
  // resolves to the canonical reading page regardless of which hub alias
  // the reader arrived through. Computed unconditionally (before the
  // early returns) so all hooks run on every render; falls back to the
  // safeSlug when post is null so the URL is still well-formed on the
  // not-found path (the share buttons are not rendered there, but the
  // hook dependency must be stable).
  const shareSlug = post?.slug ?? safeSlug;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/post/${shareSlug}`
      : `/post/${shareSlug}`;
  const shareText = post
    ? `${post.title} — Turning Point UK`
    : "Turning Point UK";
  const xShareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl,
  )}`;

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Legacy fallback for browsers without the async clipboard API.
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // If clipboard write fails (permissions, secure context), fall back to
      // selecting the share URL in the address bar by opening it in a new
      // tab is NOT appropriate here — just leave the button silent so the
      // reader can still copy manually from the address bar.
    }
  }, [shareUrl]);

  // SEO / OpenGraph meta — only inject once we have a real post so the
  // cleanup on unmount restores the app-wide title set by the Layout.
  // Pass null (not undefined) when the post is absent so useSeoMeta skips
  // injection and cleanup restores the app-wide title on unmount.
  // canonical pins to the absolute SITE_BASE_URL /post/$slug so the
  // canonical URL is stable regardless of which hub alias the reader
  // arrived through. jsonLd injects a BreadcrumbList whose middle step
  // is category-aware: Real British History posts sit under Home → Real
  // British History → Article; all other categories sit under Home → Blog
  // → Article. Built inline from {name, path} pairs so the trail mirrors
  // the visual nav hierarchy.
  useSeoMeta({
    title: post ? `${post.title} — Turning Point UK` : null,
    description: post?.excerpt ?? null,
    image: post?.coverImageUrl?.startsWith("http")
      ? post.coverImageUrl
      : OG_IMAGE_URL,
    url: post ? `${SITE_BASE_URL}/post/${post.slug}` : null,
    canonical: post ? `${SITE_BASE_URL}/post/${post.slug}` : null,
    siteName: "Turning Point UK",
    twitterCard: "summary_large_image",
    jsonLd: post
      ? [
          buildBreadcrumbJsonLd(
            post.category === CATEGORY_RBH
              ? [
                  { name: "Home", path: "/" },
                  {
                    name: "Real British History",
                    path: "/real-british-history",
                  },
                  { name: post.title, path: `/post/${post.slug}` },
                ]
              : [
                  { name: "Home", path: "/" },
                  { name: "Blog", path: "/blog" },
                  { name: post.title, path: `/post/${post.slug}` },
                ],
          ),
        ]
      : null,
  });

  // Scroll to top on slug change so a reader landing on an article from a
  // hub (or via a shared link) starts at the cover, not mid-article.
  // safeSlug is intentionally a dependency: scroll-to-top must re-run on
  // every navigation between articles, and safeSlug is the derived value
  // that actually changes when the route param changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: safeSlug drives scroll restoration on article navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [safeSlug]);

  if (loading) {
    return (
      <div
        data-ocid="post_article.loading_state"
        className="flex min-h-[60vh] w-full items-center justify-center px-6 py-24"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <span
            className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"
            aria-hidden="true"
          />
          <p className="text-eyebrow text-foreground/70">Loading article…</p>
        </div>
      </div>
    );
  }

  // A missing slug, a fetch error, or a null post after loading all mean the
  // reader hit a URL that does not map to a published article → 404.
  if (!safeSlug || error || !post) {
    return (
      <div
        ref={containerRef}
        data-ocid="post_article.not_found_state"
        className="flex min-h-[70vh] w-full items-center justify-center px-6 py-24"
      >
        <div className="flex max-w-xl flex-col items-center gap-6 text-center">
          <span
            className="entrance-left text-eyebrow text-primary"
            data-entrance-delay="0"
          >
            404 - ARTICLE NOT FOUND
          </span>
          <h1
            className="entrance-left text-headline text-foreground"
            data-entrance-delay="80"
          >
            This page has slipped the archive
          </h1>
          <p
            className="entrance-left font-body text-base font-light leading-relaxed text-muted-foreground"
            data-entrance-delay="160"
          >
            The article you were looking for may have been moved, unpublished,
            or the link you followed may be broken. Head back to the blog to
            find what you are after.
          </p>
          <Link
            to={ROUTES.blog}
            data-ocid="post_article.back_to_blog_not_found"
            className="btn-primary-square entrance-left"
            data-entrance-delay="240"
          >
            Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  // Defensive date formatting — even with the root-cause fix in toBlogPost
  // (Number(createdAt) / 1e6), a malformed or out-of-range timestamp would
  // make `new Date(...).toLocaleDateString(...)` throw `RangeError: Invalid
  // time value` and crash the whole article page. Mirror the admin pages'
  // Number.isNaN guard so a bad date renders an em-dash fallback instead.
  const createdDate = new Date(post.createdAt);
  const formattedDate = Number.isNaN(createdDate.getTime())
    ? "-"
    : createdDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  const createdIso = Number.isNaN(createdDate.getTime())
    ? undefined
    : createdDate.toISOString();

  // Resolve the hero video / poster slot for the article page. The slot key
  // is chosen from the arrival alias (blog alias → newspaper-ad, RBH alias →
  // historic-london, canonical /post/ arrival → category-driven) and then
  const heroSlotKey = post
    ? pickHeroVideoSlotKey(alias, post.category)
    : "newspaper-ad";
  const heroVideo = HERO_VIDEO_BY_SLOT[heroSlotKey] ?? VIDEO_NEWSPAPER_AD;
  const backLink = post
    ? resolveBackLink(alias, post.category)
    : { to: ROUTES.blog, label: "Back to Blog" };

  return (
    <div ref={containerRef} className="w-full">
      {/* Hero — full-viewport background video hero at the top of the
          article page. The video is selected from the arrival alias (blog
          alias → newspaper video, RBH alias → historic video, canonical
          /post/ arrival → category-driven). Matches the visual style of
          the hub pages so the article opens with the same cinematic plate. */}
      <Hero
        eyebrow={post.category}
        headline={post.title}
        sub={post.excerpt}
        videoLabel={`${post.category} article hero video`}
        videoSrc={heroVideo}
      />

      {/* Cinematic full-width cover — the article's coverImageUrl displayed
          massively. The .cinematic-cover utility breaks out of the layout
          width to span the full viewport. If the cover URL fails to load,
          onError swaps the <img> to the bundled BLOG_COVER_FALLBACK asset so
          the cover always renders a real photo (never a broken-image icon or
          a blank "No cover" box), with the scrim still on top. */}
      <figure className="cinematic-cover" data-ocid="post_article.cover">
        <img
          src={post.coverImageUrl || BLOG_COVER_FALLBACK}
          alt={post.title}
          loading="eager"
          decoding="async"
          onError={handleCoverError}
        />
        <div className="cinematic-cover-scrim" aria-hidden="true" />
      </figure>

      {/* Reading column — narrow max-w-3xl mx-auto. Back link sits at the
          top so a reader can leave before scrolling the whole article. */}
      <article
        className="article-reading-column"
        data-ocid="post_article.article"
      >
        <Link
          to={backLink.to}
          data-ocid="post_article.back_to_hub_top"
          className="entrance-left mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-primary"
          data-entrance-delay="0"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLink.label}
        </Link>

        {/* Category eyebrow */}
        <span
          className="entrance-left category-badge mb-5"
          data-entrance-delay="60"
        >
          {post.category}
        </span>

        {/* Headline — bright white per the deep-blue theme */}
        <h2
          className="entrance-left font-display text-3xl font-bold uppercase leading-[1.05] tracking-[-0.02em] text-foreground sm:text-4xl md:text-5xl"
          data-entrance-delay="120"
        >
          {post.title}
        </h2>

        {/* Author + date + read-time metadata */}
        <div
          className="entrance-left mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-6 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
          data-entrance-delay="180"
        >
          <span className="text-foreground/85">By {post.author}</span>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <time dateTime={createdIso}>{formattedDate}</time>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span>{post.readTime}</span>
        </div>

        {/* Standfirst / excerpt — slightly brighter than body for emphasis */}
        <p
          className="entrance-right mt-8 font-body text-lg font-light leading-relaxed text-foreground/85"
          data-entrance-delay="240"
        >
          {post.excerpt}
        </p>

        {/* Markdown body — rendered into .markdown-content for bright white
            headings and soft blue-tinted grey body text. */}
        <div
          className="entrance-right mt-10"
          data-entrance-delay="320"
          data-ocid="post_article.content"
        >
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Social share buttons — X/Twitter, Facebook, and a copy-link
            button. Simple anchor links with share URLs (no external SDKs).
            Styled with the existing design tokens via .article-share-* CSS
            classes in index.css. */}
        <div
          className="entrance-left mt-12 border-t border-border pt-8"
          data-entrance-delay="0"
          data-ocid="post_article.share"
        >
          <span className="text-eyebrow mb-4 block">Share this article</span>
          <div className="article-share-row">
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="post_article.share_x"
              className="article-share-button"
              aria-label="Share on X (Twitter)"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Post on X</span>
            </a>
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="post_article.share_facebook"
              className="article-share-button"
              aria-label="Share on Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Share on Facebook</span>
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              data-ocid="post_article.share_copy_link"
              className="article-share-button article-share-copy"
              aria-label="Copy article link"
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{copied ? "Link copied" : "Copy link"}</span>
            </button>
          </div>
        </div>

        {/* Bottom back link — mirrors the top so a reader who finishes the
            article can return without scrolling all the way up. Uses the
            alias-aware back link so the label and target match the arrival. */}
        <div className="mt-16 border-t border-border pt-8">
          <Link
            to={backLink.to}
            data-ocid="post_article.back_to_hub_bottom"
            className="btn-outline-invert entrance-left"
            data-entrance-delay="0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLink.label}
          </Link>
        </div>
      </article>
    </div>
  );
}

export default PostArticlePage;
