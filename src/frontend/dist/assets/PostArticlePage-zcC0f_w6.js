import { h as createLucideIcon, r as reactExports, j as jsxRuntimeExports, i as useParams, k as useLocation, l as useBlogPostBySlug, a as useEntranceAnimation, m as useHeroVideoConfig, B as BLOG_COVER_FALLBACK, n as useSeoMeta, o as buildBreadcrumbJsonLd, p as SITE_BASE_URL, O as OG_IMAGE_URL, L as Link, R as ROUTES, H as Hero, A as ArrowLeft, C as Check } from "./index-BGG8i21F.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
const Link2 = createLucideIcon("link-2", __iconNode);
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderInline(escaped) {
  let out = escaped;
  const SENTINEL = "";
  const codeStash = [];
  out = out.replace(/`([^`]+)`/g, (_m, code) => {
    codeStash.push(`<code>${code}</code>`);
    return `${SENTINEL}${codeStash.length - 1}${SENTINEL}`;
  });
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text, href) => {
      const safeHref = sanitizeHref(href);
      if (!safeHref) return text;
      return `<a href="${safeHref}" rel="noopener noreferrer">${text}</a>`;
    }
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>");
  out = out.replace(/(^|[^_\w])_([^_]+)_/g, "$1<em>$2</em>");
  out = out.replace(
    /\uE000(\d+)\uE000/g,
    (_m, i) => codeStash[Number(i)] ?? ""
  );
  return out;
}
function sanitizeHref(href) {
  const trimmed = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return "";
}
function parseMarkdown(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let i = 0;
  let listType = null;
  let inCode = false;
  let codeBuffer = [];
  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      if (inCode) {
        html.push(
          `<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`
        );
        codeBuffer = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      i++;
      continue;
    }
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      closeList();
      html.push("<hr />");
      i++;
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      const level = Math.min(headingMatch[1].length, 4);
      const text2 = renderInline(escapeHtml(headingMatch[2].trim()));
      html.push(`<h${level}>${text2}</h${level}>`);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      closeList();
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const text2 = renderInline(escapeHtml(quoteLines.join(" ").trim()));
      html.push(`<blockquote>${text2}</blockquote>`);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      const text2 = renderInline(
        escapeHtml(line.replace(/^\s*[-*+]\s+/, "").trim())
      );
      html.push(`<li>${text2}</li>`);
      i++;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      const text2 = renderInline(
        escapeHtml(line.replace(/^\s*\d+\.\s+/, "").trim())
      );
      html.push(`<li>${text2}</li>`);
      i++;
      continue;
    }
    if (line.trim() === "") {
      closeList();
      i++;
      continue;
    }
    closeList();
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^```/.test(lines[i]) && !/^(#{1,6})\s+/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])) {
      paraLines.push(lines[i].trim());
      i++;
    }
    const text = renderInline(escapeHtml(paraLines.join(" ")));
    html.push(`<p>${text}</p>`);
  }
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
  }
  closeList();
  return html.join("\n");
}
function MarkdownRenderer({
  content,
  className
}) {
  const html = reactExports.useMemo(() => parseMarkdown(content ?? ""), [content]);
  const composed = className ? `markdown-content ${className}` : "markdown-content";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: composed,
      dangerouslySetInnerHTML: { __html: html }
    }
  );
}
const CATEGORY_RBH = "Real British History";
function detectAlias(pathname) {
  if (pathname.startsWith("/blog/")) return "blog";
  if (pathname.startsWith("/real-british-history/")) return "rbh";
  return "post";
}
function pickHeroVideoSlotKey(alias, category) {
  if (alias === "blog") return "newspaper-ad";
  if (alias === "rbh") return "historic-london";
  if (category === CATEGORY_RBH) return "historic-london";
  return "newspaper-ad";
}
function resolveBackLink(alias, category) {
  if (alias === "blog") {
    return { to: ROUTES.blog, label: "Back to Blog" };
  }
  if (alias === "rbh") {
    return { to: ROUTES.realBritishHistory, label: "Back to History" };
  }
  if (category === CATEGORY_RBH) {
    return { to: ROUTES.realBritishHistory, label: "Back to History" };
  }
  return { to: ROUTES.blog, label: "Back to Blog" };
}
function PostArticlePage() {
  var _a;
  const { slug } = useParams({ strict: false });
  const safeSlug = typeof slug === "string" ? slug : "";
  const location = useLocation();
  const alias = detectAlias(location.pathname);
  const { post, loading, error } = useBlogPostBySlug(safeSlug);
  const containerRef = useEntranceAnimation();
  const { getSlot } = useHeroVideoConfig();
  const [coverFailed, setCoverFailed] = reactExports.useState(false);
  const handleCoverError = reactExports.useCallback(
    (e) => {
      if (coverFailed) return;
      e.currentTarget.src = BLOG_COVER_FALLBACK;
      setCoverFailed(true);
    },
    [coverFailed]
  );
  const [copied, setCopied] = reactExports.useState(false);
  const shareSlug = (post == null ? void 0 : post.slug) ?? safeSlug;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${shareSlug}` : `/post/${shareSlug}`;
  const shareText = post ? `${post.title} — Turning Point UK` : "Turning Point UK";
  const xShareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;
  const handleCopyLink = reactExports.useCallback(async () => {
    var _a2;
    try {
      if ((_a2 = navigator == null ? void 0 : navigator.clipboard) == null ? void 0 : _a2.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
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
    }
  }, [shareUrl]);
  useSeoMeta({
    title: post ? `${post.title} — Turning Point UK` : null,
    description: (post == null ? void 0 : post.excerpt) ?? null,
    image: ((_a = post == null ? void 0 : post.coverImageUrl) == null ? void 0 : _a.startsWith("http")) ? post.coverImageUrl : OG_IMAGE_URL,
    url: post ? `${SITE_BASE_URL}/post/${post.slug}` : null,
    canonical: post ? `${SITE_BASE_URL}/post/${post.slug}` : null,
    siteName: "Turning Point UK",
    twitterCard: "summary_large_image",
    jsonLd: post ? [
      buildBreadcrumbJsonLd(
        post.category === CATEGORY_RBH ? [
          { name: "Home", path: "/" },
          {
            name: "Real British History",
            path: "/real-british-history"
          },
          { name: post.title, path: `/post/${post.slug}` }
        ] : [
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/post/${post.slug}` }
        ]
      )
    ] : null
  });
  reactExports.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [safeSlug]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "post_article.loading_state",
        className: "flex min-h-[60vh] w-full items-center justify-center px-6 py-24",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary",
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-eyebrow text-foreground/70", children: "Loading article…" })
        ] })
      }
    );
  }
  if (!safeSlug || error || !post) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        "data-ocid": "post_article.not_found_state",
        className: "flex min-h-[70vh] w-full items-center justify-center px-6 py-24",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-w-xl flex-col items-center gap-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "entrance-left text-eyebrow text-primary",
              "data-entrance-delay": "0",
              children: "404 - ARTICLE NOT FOUND"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h1",
            {
              className: "entrance-left text-headline text-foreground",
              "data-entrance-delay": "80",
              children: "This page has slipped the archive"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "entrance-left font-body text-base font-light leading-relaxed text-muted-foreground",
              "data-entrance-delay": "160",
              children: "The article you were looking for may have been moved, unpublished, or the link you followed may be broken. Head back to the blog to find what you are after."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: ROUTES.blog,
              "data-ocid": "post_article.back_to_blog_not_found",
              className: "btn-primary-square entrance-left",
              "data-entrance-delay": "240",
              children: "Back to the blog"
            }
          )
        ] })
      }
    );
  }
  const createdDate = new Date(post.createdAt);
  const formattedDate = Number.isNaN(createdDate.getTime()) ? "-" : createdDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const createdIso = Number.isNaN(createdDate.getTime()) ? void 0 : createdDate.toISOString();
  const heroSlotKey = post ? pickHeroVideoSlotKey(alias, post.category) : "newspaper-ad";
  const heroSlot = getSlot(heroSlotKey);
  const heroVideo = heroSlot == null ? void 0 : heroSlot.videoUrl;
  const backLink = post ? resolveBackLink(alias, post.category) : { to: ROUTES.blog, label: "Back to Blog" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Hero,
      {
        eyebrow: post.category,
        headline: post.title,
        sub: post.excerpt,
        videoLabel: `${post.category} article hero video`,
        videoSrc: heroVideo
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("figure", { className: "cinematic-cover", "data-ocid": "post_article.cover", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: post.coverImageUrl || BLOG_COVER_FALLBACK,
          alt: post.title,
          loading: "eager",
          decoding: "async",
          onError: handleCoverError
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cinematic-cover-scrim", "aria-hidden": "true" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "article",
      {
        className: "article-reading-column",
        "data-ocid": "post_article.article",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: backLink.to,
              "data-ocid": "post_article.back_to_hub_top",
              className: "entrance-left mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-primary",
              "data-entrance-delay": "0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5", "aria-hidden": "true" }),
                backLink.label
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "entrance-left category-badge mb-5",
              "data-entrance-delay": "60",
              children: post.category
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "entrance-left font-display text-3xl font-bold uppercase leading-[1.05] tracking-[-0.02em] text-foreground sm:text-4xl md:text-5xl",
              "data-entrance-delay": "120",
              children: post.title
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "entrance-left mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-6 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground",
              "data-entrance-delay": "180",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/85", children: [
                  "By ",
                  post.author
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "text-border", children: "·" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: createdIso, children: formattedDate }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "text-border", children: "·" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: post.readTime })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "entrance-right mt-8 font-body text-lg font-light leading-relaxed text-foreground/85",
              "data-entrance-delay": "240",
              children: post.excerpt
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "entrance-right mt-10",
              "data-entrance-delay": "320",
              "data-ocid": "post_article.content",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownRenderer, { content: post.content })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "entrance-left mt-12 border-t border-border pt-8",
              "data-entrance-delay": "0",
              "data-ocid": "post_article.share",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-eyebrow mb-4 block", children: "Share this article" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "article-share-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: xShareUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      "data-ocid": "post_article.share_x",
                      className: "article-share-button",
                      "aria-label": "Share on X (Twitter)",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "svg",
                          {
                            viewBox: "0 0 24 24",
                            "aria-hidden": "true",
                            className: "h-4 w-4",
                            fill: "currentColor",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Post on X" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: facebookShareUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      "data-ocid": "post_article.share_facebook",
                      className: "article-share-button",
                      "aria-label": "Share on Facebook",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "svg",
                          {
                            viewBox: "0 0 24 24",
                            "aria-hidden": "true",
                            className: "h-4 w-4",
                            fill: "currentColor",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share on Facebook" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: handleCopyLink,
                      "data-ocid": "post_article.share_copy_link",
                      className: "article-share-button article-share-copy",
                      "aria-label": "Copy article link",
                      children: [
                        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4", "aria-hidden": "true" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: copied ? "Link copied" : "Copy link" })
                      ]
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 border-t border-border pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: backLink.to,
              "data-ocid": "post_article.back_to_hub_bottom",
              className: "btn-outline-invert entrance-left",
              "data-entrance-delay": "0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": "true" }),
                backLink.label
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
export {
  PostArticlePage,
  PostArticlePage as default
};
