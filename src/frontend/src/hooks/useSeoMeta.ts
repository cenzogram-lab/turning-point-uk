import { useEffect } from "react";

/**
 * useSeoMeta — reusable hook that dynamically updates `document.title`
 * and injects/updates `<meta>` tags (description, Open Graph, Twitter
 * Card), a `<link rel="canonical">` tag, and `<script type="application/ld+json">`
 * JSON-LD blocks into the document `<head>`, cleaning up on unmount.
 *
 * Pass `null` or `undefined` for any field to skip it (a previously
 * injected tag for that field is removed). Pass an empty string to set
 * an empty value. The hook is idempotent: re-runs update existing tags
 * in place rather than duplicating them.
 *
 * On unmount, every tag this hook injected is removed and the title is
 * restored to the value it had before the hook mounted (so navigating
 * away from an article page restores the app-wide title set by the
 * Layout / index route).
 *
 * Usage:
 *   useSeoMeta({
 *     title: "Why free speech on campus is non-negotiable",
 *     description: "Universities were built to test ideas in the open...",
 *     image: "https://.../cover.webp",
 *     url: "https://.../blog/why-free-speech-on-campus-is-non-negotiable",
 *     canonical: "https://.../blog/why-free-speech-on-campus-is-non-negotiable",
 *     jsonLd: [{ "@type": "BlogPosting", ... }],
 *   });
 */

export interface SeoMetaInput {
  /** Document title (typically "<Article title> — <App name>"). */
  title?: string | null;
  /** Meta description / og:description / twitter:description. */
  description?: string | null;
  /** Social preview image URL (og:image / twitter:image). */
  image?: string | null;
  /** Canonical URL (og:url). */
  url?: string | null;
  /** Site name shown in og:site_name. */
  siteName?: string | null;
  /** Twitter card type. Default: "summary_large_image" (the site always has an OG image). */
  twitterCard?: "summary" | "summary_large_image" | "player" | "app" | null;
  /** Absolute canonical URL for `<link rel="canonical">`. */
  canonical?: string | null;
  /** JSON-LD objects to inject as `<script type="application/ld+json">` blocks. */
  jsonLd?: object[] | null;
}

const OWNED_ATTR = "data-oc-seo";
const JSONLD_ATTR_PREFIX = "data-oc-seo-jsonld-";

interface TagSpec {
  selector: string;
  getAttrs: (value: string) => Record<string, string>;
}

const TAG_SPECS: { key: keyof SeoMetaInput; spec: TagSpec }[] = [
  {
    key: "description",
    spec: {
      selector: 'meta[name="description"]',
      getAttrs: (v) => ({ name: "description", content: v }),
    },
  },
  {
    key: "description",
    spec: {
      selector: 'meta[property="og:description"]',
      getAttrs: (v) => ({ property: "og:description", content: v }),
    },
  },
  {
    key: "description",
    spec: {
      selector: 'meta[name="twitter:description"]',
      getAttrs: (v) => ({ name: "twitter:description", content: v }),
    },
  },
  {
    key: "title",
    spec: {
      selector: 'meta[property="og:title"]',
      getAttrs: (v) => ({ property: "og:title", content: v }),
    },
  },
  {
    key: "title",
    spec: {
      selector: 'meta[name="twitter:title"]',
      getAttrs: (v) => ({ name: "twitter:title", content: v }),
    },
  },
  {
    key: "image",
    spec: {
      selector: 'meta[property="og:image"]',
      getAttrs: (v) => ({ property: "og:image", content: v }),
    },
  },
  {
    key: "image",
    spec: {
      selector: 'meta[name="twitter:image"]',
      getAttrs: (v) => ({ name: "twitter:image", content: v }),
    },
  },
  {
    key: "url",
    spec: {
      selector: 'meta[property="og:url"]',
      getAttrs: (v) => ({ property: "og:url", content: v }),
    },
  },
  {
    key: "siteName",
    spec: {
      selector: 'meta[property="og:site_name"]',
      getAttrs: (v) => ({ property: "og:site_name", content: v }),
    },
  },
  {
    key: "twitterCard",
    spec: {
      selector: 'meta[name="twitter:card"]',
      getAttrs: (v) => ({ name: "twitter:card", content: v }),
    },
  },
];

function upsertTag(spec: TagSpec, value: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(spec.selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(OWNED_ATTR, "true");
    document.head.appendChild(el);
  } else if (!el.hasAttribute(OWNED_ATTR)) {
    // Adopt an existing platform-authored tag so we update rather than duplicate.
    el.setAttribute(OWNED_ATTR, "true");
  }
  for (const [k, v] of Object.entries(spec.getAttrs(value))) {
    el.setAttribute(k, v);
  }
}

function removeTag(selector: string): void {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el?.hasAttribute(OWNED_ATTR)) {
    el.remove();
  }
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!el) {
    el = document.createElement("link");
    el.setAttribute(OWNED_ATTR, "true");
    document.head.appendChild(el);
  } else if (!el.hasAttribute(OWNED_ATTR)) {
    el.setAttribute(OWNED_ATTR, "true");
  }
  el.setAttribute("rel", "canonical");
  el.setAttribute("href", href);
}

function removeCanonical(): void {
  const el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (el?.hasAttribute(OWNED_ATTR)) {
    el.remove();
  }
}

function findJsonLdByIndex(index: number): HTMLScriptElement | null {
  // Avoid querySelector with the hyphen-digit attribute name entirely —
  // `script[data-oc-seo-jsonld-0]` and quoted variants throw SyntaxError in
  // some browser engines, aborting the effect after meta/canonical are set
  // but before JSON-LD is injected. Iterate the ld+json scripts and match by
  // getAttribute instead, which is universally safe.
  const scripts = document.head.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  );
  const id = `${JSONLD_ATTR_PREFIX}${index}`;
  for (const s of scripts) {
    if (s.getAttribute(id) === "true") return s;
  }
  return null;
}

function upsertJsonLd(index: number, obj: object): void {
  const id = `${JSONLD_ATTR_PREFIX}${index}`;
  let el = findJsonLdByIndex(index);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute(OWNED_ATTR, "true");
    el.setAttribute(id, "true");
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  } else if (!el.hasAttribute(OWNED_ATTR)) {
    el.setAttribute(OWNED_ATTR, "true");
  }
  el.textContent = JSON.stringify(obj);
}

function removeJsonLd(index: number): void {
  const el = findJsonLdByIndex(index);
  if (el?.hasAttribute(OWNED_ATTR)) {
    el.remove();
  }
}

export function useSeoMeta(meta: SeoMetaInput): void {
  const {
    title,
    description,
    image,
    url,
    siteName,
    twitterCard,
    canonical,
    jsonLd,
  } = meta;

  // Serialize JSON-LD once per render so the effect can depend on a stable
  // primitive string rather than the array reference (avoids re-running on
  // every render when callers pass a new array literal with the same content).
  const jsonLdSerialized = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    // Snapshot the title so we can restore it on unmount.
    const previousTitle = document.title;

    if (title) {
      document.title = title;
      upsertTag(
        {
          selector: 'meta[property="og:title"]',
          getAttrs: (v) => ({ property: "og:title", content: v }),
        },
        title,
      );
      upsertTag(
        {
          selector: 'meta[name="twitter:title"]',
          getAttrs: (v) => ({ name: "twitter:title", content: v }),
        },
        title,
      );
    }

    if (description) {
      upsertTag(
        {
          selector: 'meta[name="description"]',
          getAttrs: (v) => ({ name: "description", content: v }),
        },
        description,
      );
      upsertTag(
        {
          selector: 'meta[property="og:description"]',
          getAttrs: (v) => ({ property: "og:description", content: v }),
        },
        description,
      );
      upsertTag(
        {
          selector: 'meta[name="twitter:description"]',
          getAttrs: (v) => ({ name: "twitter:description", content: v }),
        },
        description,
      );
    }

    if (image) {
      upsertTag(
        {
          selector: 'meta[property="og:image"]',
          getAttrs: (v) => ({ property: "og:image", content: v }),
        },
        image,
      );
      upsertTag(
        {
          selector: 'meta[name="twitter:image"]',
          getAttrs: (v) => ({ name: "twitter:image", content: v }),
        },
        image,
      );
    }

    if (url) {
      upsertTag(
        {
          selector: 'meta[property="og:url"]',
          getAttrs: (v) => ({ property: "og:url", content: v }),
        },
        url,
      );
    }

    if (siteName) {
      upsertTag(
        {
          selector: 'meta[property="og:site_name"]',
          getAttrs: (v) => ({ property: "og:site_name", content: v }),
        },
        siteName,
      );
    }

    // The site always provides an OG image (absolute-URL default), so every
    // page gets summary_large_image even when the caller omits `image`.
    const card = twitterCard ?? "summary_large_image";
    upsertTag(
      {
        selector: 'meta[name="twitter:card"]',
        getAttrs: (v) => ({ name: "twitter:card", content: v }),
      },
      card,
    );

    if (canonical) {
      upsertCanonical(canonical);
    }

    if (jsonLdSerialized) {
      const parsed = JSON.parse(jsonLdSerialized) as object[];
      parsed.forEach((obj, index) => upsertJsonLd(index, obj));
    }

    return () => {
      // Restore the title and remove every tag this hook owned.
      document.title = previousTitle;
      for (const { spec } of TAG_SPECS) {
        removeTag(spec.selector);
      }
      removeCanonical();
      // Remove every JSON-LD block this hook could have created. We
      // iterate by index rather than querying all owned scripts so the
      // cleanup is bounded and predictable.
      if (jsonLdSerialized) {
        const count = (JSON.parse(jsonLdSerialized) as object[]).length;
        for (let i = 0; i < count; i++) {
          removeJsonLd(i);
        }
      }
    };
    // Re-run when any provided field changes. jsonLd is compared by value
    // via its serialized form so a new array with the same content does not
    // re-trigger the effect.
  }, [
    title,
    description,
    image,
    url,
    siteName,
    twitterCard,
    canonical,
    jsonLdSerialized,
  ]);
}
