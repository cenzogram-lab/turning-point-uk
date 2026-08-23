import type { PostSitemapEntry } from "@/backend";
import { SITE_BASE_URL } from "./seo";

/**
 * Sitemap builder for Turning Point UK.
 *
 * Generates a complete sitemap.xml document listing every public static
 * route (the 16 public pages plus the secondary legal/Patreon/MBGA pages)
 * and every dynamic blog/Real British History article route served by the
 * backend's `getPostSlugs()` query.
 *
 * The static route list mirrors the routes registered in App.tsx and the
 * PAGE_SEO map in lib/seo.ts. When a route is added or removed, update
 * STATIC_ROUTES here to match (the centralized config keeps it
 * maintainable). The dynamic entries are fetched at runtime from the
 * backend so the sitemap regenerates automatically when posts are added,
 * updated, or unpublished — no rebuild required.
 *
 * `lastmod` for dynamic entries is derived from the backend's nanosecond
 * Timestamp (BigInt) by dividing by 1_000_000 to get milliseconds, then
 * formatting as an ISO date (YYYY-MM-DD) per the sitemap protocol.
 */

interface StaticRoute {
  path: string;
  priority: string;
  lastmod: string;
}

/**
 * Static public routes — mirrors the routes registered in App.tsx and the
 * PAGE_SEO keys in lib/seo.ts. Priorities follow common conventions:
 * homepage 1.0, primary hub pages 0.8, secondary/action pages 0.6.
 */
const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", priority: "1.0", lastmod: "2026-08-15" },
  { path: "/about", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/activism", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/become-an-activist", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/activism-kit", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/education-watch", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/university-societies", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/petition", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/join-us", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/events", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/merchandise", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/gallery", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/blog", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/real-british-history", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/contact", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/donate", priority: "0.8", lastmod: "2026-08-15" },
  { path: "/patreon", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/mbga", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/privacy-policy", priority: "0.6", lastmod: "2026-08-15" },
  { path: "/terms-and-conditions", priority: "0.6", lastmod: "2026-08-15" },
];

/**
 * Format a backend nanosecond Timestamp as an ISO date string (YYYY-MM-DD)
 * for use as a sitemap <lastmod> element. Returns "1970-01-01" if the
 * timestamp is invalid (NaN) so the XML stays well-formed.
 */
function formatLastmod(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  if (Number.isNaN(ms)) return "1970-01-01";
  return new Date(ms).toISOString().split("T")[0];
}

/**
 * Build a complete sitemap.xml document from the static route list and the
 * dynamic post slug entries returned by the backend's `getPostSlugs()`.
 *
 * Every <url> entry contains <loc> (absolute URL via SITE_BASE_URL),
 * <lastmod> (ISO date), and <priority> (0.0–1.0). Dynamic post entries
 * use the canonical /post/$slug route so each article has a single
 * canonical URL in the sitemap regardless of which hub alias a reader
 * might use to reach it.
 */
export function buildSitemapXml(postSlugs: PostSitemapEntry[]): string {
  const staticEntries = STATIC_ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${SITE_BASE_URL}${r.path}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <priority>${r.priority}</priority>\n  </url>`,
  ).join("\n");

  const dynamicEntries = postSlugs
    .map((entry) => {
      const lastmod = formatLastmod(entry.lastmod);
      return `  <url>\n    <loc>${SITE_BASE_URL}/post/${entry.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.6</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${dynamicEntries}\n</urlset>`;
}
