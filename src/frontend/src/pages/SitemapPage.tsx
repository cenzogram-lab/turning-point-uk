import { createActor } from "@/backend";
import type { PostSitemapEntry } from "@/backend";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { SITE_BASE_URL, buildBreadcrumbJsonLd } from "@/lib/seo";
import { buildSitemapXml } from "@/lib/sitemap";
import { mockBackend } from "@/mocks/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * SitemapPage — renders the live sitemap.xml at /sitemap.
 *
 * Fetches the dynamic post slug entries from the backend via
 * `getPostSlugs()` (the same actor pattern used by useBlogPosts: real
 * actor when available, mockBackend fallback when VITE_USE_MOCK=true),
 * combines them with the static route list inside buildSitemapXml, and
 * renders the resulting XML document in a <pre> tag so it is both
 * human-readable and copy-pasteable.
 *
 * The page sets document.title to "Sitemap | Turning Point UK" via
 * useSeoMeta so crawlers and browser tabs see a meaningful title. The
 * XML body is the source of truth — the <pre> tag is a presentational
 * wrapper, not a transformation.
 *
 * States:
 *  - loading → spinner + "Generating sitemap…" message
 *  - error   → error panel with retry hint
 *  - ready   → <pre> with the full sitemap.xml document
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** Sitemap query key — single, stable key since the sitemap has no params. */
const SITEMAP_QUERY_KEY = ["sitemap", "post-slugs"] as const;

/**
 * Resolves the effective backend actor for the sitemap query. Returns the
 * real actor when available; otherwise falls back to `mockBackend` in mock
 * mode so the sitemap renders seeded sample posts during frontend-only
 * development. Returns `null` in production when the actor is not yet
 * ready. Mirrors the resolveActor helper in useBlogPosts.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

export function SitemapPage() {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<PostSitemapEntry[]>({
    queryKey: SITEMAP_QUERY_KEY,
    queryFn: async () => {
      if (!resolvedActor) return [];
      return resolvedActor.getPostSlugs();
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  const postSlugs = query.data ?? [];
  const xml = buildSitemapXml(postSlugs);

  useSeoMeta({
    title: "Sitemap | Turning Point UK",
    description:
      "Complete sitemap of Turning Point UK — every public page and article listed for search engines and visitors.",
    siteName: "Turning Point UK",
    canonical: `${SITE_BASE_URL}/sitemap`,
    url: `${SITE_BASE_URL}/sitemap`,
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Sitemap", path: "/sitemap" },
      ]),
    ],
  });

  if (isFetching || query.isLoading) {
    return (
      <div
        data-ocid="sitemap.loading_state"
        className="flex min-h-[60vh] w-full items-center justify-center px-6 py-24"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <span
            className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"
            aria-hidden="true"
          />
          <p className="text-eyebrow text-foreground/70">Generating sitemap…</p>
        </div>
      </div>
    );
  }

  if (query.error) {
    return (
      <div
        data-ocid="sitemap.error_state"
        className="flex min-h-[60vh] w-full items-center justify-center px-6 py-24"
      >
        <div className="flex max-w-xl flex-col items-center gap-4 text-center">
          <span className="text-eyebrow text-primary">ERROR</span>
          <h1 className="text-headline text-foreground">
            Sitemap could not be generated
          </h1>
          <p className="font-body text-base font-light leading-relaxed text-muted-foreground">
            The backend query for post slugs failed. Try refreshing the page —
            if the problem persists, the sitemap will regenerate automatically
            once the backend is reachable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="sitemap.page"
      className="mx-auto w-full max-w-4xl px-6 py-16"
    >
      <header className="mb-8">
        <span className="text-eyebrow text-primary">SITEMAP.XML</span>
        <h1 className="mt-3 text-headline text-foreground">Sitemap</h1>
        <p className="mt-4 font-body text-base font-light leading-relaxed text-muted-foreground">
          Complete list of every public page and article on Turning Point UK.
          Served live at{" "}
          <code className="font-mono text-foreground">/sitemap</code> for search
          engines and visitors.
        </p>
      </header>
      <pre
        data-ocid="sitemap.xml_output"
        className="overflow-x-auto rounded-lg border border-border bg-card p-6 font-mono text-xs leading-relaxed text-foreground/90 shadow-subtle"
        aria-label="Sitemap XML document"
      >
        {xml}
      </pre>
    </div>
  );
}

export default SitemapPage;
