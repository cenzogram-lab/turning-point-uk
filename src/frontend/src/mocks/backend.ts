import type { Principal } from "@icp-sdk/core/principal";
import { ExternalBlob } from "@caffeineai/object-storage";
import type {
  backendInterface,
  BlogPost,
  CreateBlogPostInput,
  GalleryItem,
  HeroVideoConfig,
  HeroVideoSlot,
  NavConfig,
  NavEntry,
  PostSitemapEntry,
  PublishedPostsPage,
  ShoppingItem,
  StripeConfiguration,
  StripeSessionStatus,
  TransformationInput,
  TransformationOutput,
  UpdateBlogPostInput,
  UserRole,
  _ImmutableObjectStorageCreateCertificateResult,
  _ImmutableObjectStorageRefillResult,
} from "../backend";

/**
 * Mock backend used by `VITE_USE_MOCK=true pnpm dev` for frontend-only
 * iteration and visual QA. Returns benign defaults so the UI renders without
 * a live canister.
 *
 * The gallery methods maintain an in-memory list seeded with a few sample
 * records so the admin gallery page has something to render. Each sample
 * record's `image` is an `ExternalBlob` rehydrated from a placeholder URL
 * via `ExternalBlob.fromURL()` — the same path the real upload flow uses,
 * so `toGalleryItem(item).imageUrl` resolves to a displayable proxy URL.
 */

// Mixed-orientation sample photos across the four user-specified gallery
// categories so the masonry layout (variable-height columns), the category
// filter buttons, and the per-tile skeleton can all be visually verified.
// Portrait, square, and landscape crops are interleaved so the masonry
// columns pack with visibly different heights — not a uniform grid.
const SAMPLE_GALLERY: Array<{
  url: string;
  title: string;
  description: string;
  category: string;
  eventDate: bigint;
}> = [
  {
    url: "/assets/gallery/home-600x450-019fd7d4-3d0d-772f-8898-dde66fbf2fa0.webp",
    title: "Rally on the steps",
    description:
      "Thousands gathered on the cathedral steps for the spring rally, banners high against a slate sky.",
    category: "Rallies",
    eventDate: BigInt(Date.now() - 14 * 86_400_000),
  },
  {
    url: "/assets/gallery/ucl-optimized-scaled-019fd7d4-3d50-7571-ae99-8bb8fea3a572.webp",
    title: "Campus lecture hall",
    description:
      "A packed lecture hall during the campus speaker series - every seat taken, aisles lined with standing listeners.",
    category: "Campus Events",
    eventDate: BigInt(Date.now() - 7 * 86_400_000),
  },
  {
    url: "/assets/gallery/coventry-1-019fd7d4-3e58-77cc-bac6-f8fa7f6cb5f9.webp",
    title: "Direct action on the high street",
    description:
      "Volunteers handing out leaflets and collecting signatures on the high street on a bright Saturday morning.",
    category: "Direct Action",
    eventDate: BigInt(Date.now() - 3 * 86_400_000),
  },
  {
    url: "/assets/gallery/southampton1-1-019fd7d4-3e64-705d-84b4-d337f1afea84.jpg",
    title: "Education watch panel",
    description:
      "The education watch panel discussion mid-evening, three speakers framed against the projection screen.",
    category: "Education Watch",
    eventDate: BigInt(Date.now() - 21 * 86_400_000),
  },
  {
    url: "/assets/gallery/winchester1-1-019fd7d4-3e79-763f-a5ea-c1edd1060d05.jpg",
    title: "Banner wave at dusk",
    description:
      "A long banner held high against the setting sun, silhouettes of the crowd stretching into the distance.",
    category: "Rallies",
    eventDate: BigInt(Date.now() - 30 * 86_400_000),
  },
  {
    url: "/assets/gallery/york-1-019fd7d4-3e5d-73ba-b570-20a72e039619.webp",
    title: "Society freshers' stall",
    description:
      "The university society freshers' fair stall, sign-up sheets and leaflets fanned across the table.",
    category: "Campus Events",
    eventDate: BigInt(Date.now() - 10 * 86_400_000),
  },
  {
    url: "/assets/gallery/keele1-optimized-scaled-019fd7d4-3fb1-7691-8081-a85bc7ed82f6.webp",
    title: "Doorstep campaign route",
    description:
      "Activists walking the doorstep route with clipboards and literature, knocking on every door on the street.",
    category: "Direct Action",
    eventDate: BigInt(Date.now() - 5 * 86_400_000),
  },
  {
    url: "/assets/gallery/birmingham1-1-scaled-019fd7d4-4044-7494-94bb-bd25d683cb8f.webp",
    title: "Curriculum review workshop",
    description:
      "A round-table workshop on the curriculum review, notebooks open and the whiteboard dense with notes.",
    category: "Education Watch",
    eventDate: BigInt(Date.now() - 45 * 86_400_000),
  },
];

function seedGalleryItems(): GalleryItem[] {
  const now = BigInt(Date.now());
  return SAMPLE_GALLERY.map((entry, index) => ({
    id: BigInt(index + 1),
    title: entry.title,
    description: entry.description,
    createdAt: now - BigInt(index) * 86_400_000n,
    image: ExternalBlob.fromURL(entry.url),
    category: entry.category,
    eventDate: entry.eventDate,
  }));
}

// In-memory mutable store backing the mock gallery CRUD methods.
let galleryItems: GalleryItem[] = seedGalleryItems();
let nextGalleryId = BigInt(galleryItems.length + 1);

// ── Blog mock store ──────────────────────────────────────────────────
// Seed a couple of sample posts so the admin blog table and the public
// blog hub have something to render during frontend-only development.
// Each post's `coverImage` is an ExternalBlob rehydrated from a placeholder
// URL via `ExternalBlob.fromURL()` — the same path the real upload flow
// uses, so `toBlogPost(post).coverImageUrl` resolves to a displayable URL.
const SAMPLE_COVER_URLS = [
  "/assets/generated/cover-free-speech.dim_1280x720.webp",
  "/assets/generated/cover-society.dim_1280x720.webp",
  "/assets/generated/cover-education-watch.dim_1280x720.webp",
];

const SAMPLE_CATEGORIES = ["Blog", "Blog", "Real British History"];

function seedBlogPosts(): BlogPost[] {
  const now = BigInt(Date.now());
  return SAMPLE_COVER_URLS.map((url, index) => ({
    id: BigInt(index + 1),
    title: `Sample article ${index + 1}`,
    slug: `sample-article-${index + 1}`,
    excerpt:
      "A sample blog post rendered from the mock backend during frontend-only development.",
    content:
      "# Sample article\n\nThis is sample Markdown content rendered from the mock backend during frontend-only development.",
    coverImage: ExternalBlob.fromURL(url),
    category: SAMPLE_CATEGORIES[index],
    readTime: "6 min read",
    author: "Editorial",
    isPublished: true,
    createdAt: now - BigInt(index) * 86_400_000n,
  }));
}

let blogPosts: BlogPost[] = seedBlogPosts();
let nextBlogId = BigInt(blogPosts.length + 1);

// ── Site config mock store (nav + hero videos) ──────────────────────
// Seed the nav and hero-video configs with the same values the production
// backend seeds (see contracts.navSeed / contracts.heroVideoSeed) so the
// navbar and heroes render the known-default structure during frontend-only
// development. The mock store is mutable so a future admin UI (out of scope
// here) could call setNavConfig / setHeroVideoConfig and see the change.

const SEED_NAV_ENTRIES: NavEntry[] = [
  {
    text: "About",
    href: "/about",
    children: [
      { text: "Gallery", href: "/gallery", children: [] },
      { text: "Blog", href: "/blog", children: [] },
    ],
  },
  {
    text: "Activism",
    href: "/activism",
    children: [
      {
        text: "Become An Activist",
        href: "/become-an-activist",
        children: [],
      },
      { text: "Activism Kit", href: "/activism-kit", children: [] },
      { text: "Education Watch", href: "/education-watch", children: [] },
      {
        text: "University Societies",
        href: "/university-societies",
        children: [],
      },
      { text: "Petition", href: "/petition", children: [] },
    ],
  },
  {
    text: "Join",
    href: "",
    children: [
      { text: "Join Us", href: "/join-us", children: [] },
      { text: "Patreon", href: "/patreon", children: [] },
    ],
  },
  { text: "Events", href: "/events", children: [] },
  { text: "Merchandise", href: "/merchandise", children: [] },
  { text: "Blog", href: "/blog", children: [] },
  {
    text: "Real British History",
    href: "/real-british-history",
    children: [],
  },
  { text: "Contact", href: "/contact", children: [] },
];

// Poster/fallback images removed universally — every hero renders its HTML5
// background video with no static image fallback, so posterUrl is always "".
const SEED_HERO_VIDEO_SLOTS: HeroVideoSlot[] = [
  {
    key: "flag-waving",
    videoUrl:
      "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER/0806%283%29.mp4",
    posterUrl: "",
  },
  {
    key: "mascot-walk",
    videoUrl:
      "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER/mcointpuk.mp4",
    posterUrl: "",
  },
  {
    key: "newspaper-ad",
    videoUrl:
      "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER/0803%284%29.mp4",
    posterUrl: "",
  },
  {
    key: "historic-london",
    videoUrl:
      "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER/0806%281%29.mp4",
    posterUrl: "",
  },
  {
    key: "education-crowd",
    videoUrl:
      "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER/hf_20260806_184005_968d6943-9d45-4c67-9926-2d826067622e.mp4",
    posterUrl: "",
  },
  {
    key: "merch-display",
    videoUrl:
      "https://file.garden/aoCNkzJZYxDjRiWz/TPUK%20BACKGROUND%20HER/0806.mp4",
    posterUrl: "",
  },
];

let navConfig: NavConfig = { entries: SEED_NAV_ENTRIES };
let heroVideoConfig: HeroVideoConfig = { slots: SEED_HERO_VIDEO_SLOTS };

export const mockBackend: backendInterface = {
  // --- Object-storage gateway lifecycle (no-ops for the mock) ---
  _immutableObjectStorageBlobsAreLive: async (
    _hashes: Array<Uint8Array>,
  ): Promise<Array<boolean>> => {
    return [];
  },
  _immutableObjectStorageBlobsToDelete: async (): Promise<Array<Uint8Array>> => {
    return [];
  },
  _immutableObjectStorageConfirmBlobDeletion: async (
    _blobs: Array<Uint8Array>,
  ): Promise<void> => {
    return;
  },
  _immutableObjectStorageCreateCertificate: async (
    _blobHash: string,
  ): Promise<_ImmutableObjectStorageCreateCertificateResult> => {
    return { method: "", blob_hash: "" };
  },
  _immutableObjectStorageRefillCashier: async (
    _refillInformation,
  ): Promise<_ImmutableObjectStorageRefillResult> => {
    return {};
  },
  _immutableObjectStorageUpdateGatewayPrincipals: async (): Promise<void> => {
    return;
  },

  // --- Access control / auth ---
  _initialize_access_control: async (): Promise<void> => {
    return;
  },
  _internet_identity_sign_in_finish: async () => ({
    __kind__: "ok" as const,
    ok: null,
  }),
  _internet_identity_sign_in_start: async () => new Uint8Array(),
  assignCallerUserRole: async (_user: Principal, _role: UserRole): Promise<void> => {
    return;
  },
  addAdmin: async (_principal: Principal): Promise<void> => {
    // Mock no-op — the in-memory mock has no admin whitelist to mutate.
    return;
  },

  // --- OQL ---
  execute: async (_qJson: string) => {
    return { hasMore: false, rows: [] };
  },
  getCallerUserRole: async () => "guest" as UserRole,
  isCallerAdmin: async () => false,
  // Mock-mode isAdmin — the in-memory mock has no admin whitelist to
  // consult, so it reports false for every caller. The real backend is
  // the source of truth for admin authorization; this stub only exists
  // so the mock satisfies the `backendInterface` type during
  // frontend-only development.
  isAdmin: async (_caller: Principal): Promise<boolean> => {
    return false;
  },
  schema: async () => '{"entities":[]}',

  // --- Gallery CRUD ---
  getGalleryItems: async (): Promise<Array<GalleryItem>> => {
    // Return shallow copies so callers cannot mutate the in-memory store.
    // Construct explicitly because `image` is an ExternalBlob class instance
    // which TypeScript does not allow spreading.
    return galleryItems.map((it) => ({
      id: it.id,
      title: it.title,
      createdAt: it.createdAt,
      description: it.description,
      category: it.category,
      image: it.image,
      ...(it.eventDate !== undefined ? { eventDate: it.eventDate } : {}),
    }));
  },
  createGalleryItem: async (
    image: ExternalBlob,
    title: string,
    description: string,
    eventDate: bigint | null,
    category: string,
  ): Promise<GalleryItem> => {
    // Empty category defaults to 'Uncategorized' on create (matches backend
    // behavior and the user preference for migrated gallery items).
    const resolvedCategory = category || "Uncategorized";
    const item: GalleryItem = {
      id: nextGalleryId,
      title,
      description,
      createdAt: BigInt(Date.now()),
      image,
      category: resolvedCategory,
      ...(eventDate !== null ? { eventDate } : {}),
    };
    nextGalleryId += 1n;
    galleryItems = [item, ...galleryItems];
    return {
      id: item.id,
      title: item.title,
      createdAt: item.createdAt,
      description: item.description,
      category: item.category,
      image: item.image,
      ...(item.eventDate !== undefined ? { eventDate: item.eventDate } : {}),
    };
  },
  updateGalleryItem: async (
    id: bigint,
    title: string,
    description: string,
    eventDate: bigint | null,
    category: string,
  ): Promise<GalleryItem | null> => {
    const existing = galleryItems.find((it) => it.id === id);
    if (!existing) {
      return null;
    }
    // Empty category on update preserves the existing value (matches backend
    // behavior — empty string is treated as "no change requested").
    const resolvedCategory = category || existing.category;
    const updated: GalleryItem = {
      id: existing.id,
      title,
      createdAt: existing.createdAt,
      description,
      category: resolvedCategory,
      image: existing.image,
      ...(eventDate !== null ? { eventDate } : {}),
    };
    galleryItems = galleryItems.map((it) => (it.id === id ? updated : it));
    return {
      id: updated.id,
      title: updated.title,
      createdAt: updated.createdAt,
      description: updated.description,
      category: updated.category,
      image: updated.image,
      ...(updated.eventDate !== undefined
        ? { eventDate: updated.eventDate }
        : {}),
    };
  },
  deleteGalleryItem: async (id: bigint): Promise<boolean> => {
    const before = galleryItems.length;
    galleryItems = galleryItems.filter((it) => it.id !== id);
    return galleryItems.length < before;
  },

  // --- Blog CRUD ---
  listAllPosts: async (): Promise<Array<BlogPost>> => {
    // Return shallow copies so callers cannot mutate the in-memory store.
    return blogPosts.map((p) => ({ ...p, coverImage: p.coverImage }));
  },
  listPublishedPosts: async (
    offset: bigint,
    limit: bigint,
  ): Promise<PublishedPostsPage> => {
    const published = blogPosts.filter((p) => p.isPublished);
    const start = Number(offset);
    const end = start + Number(limit);
    const page = published.slice(start, end);
    return {
      total: BigInt(published.length),
      posts: page.map((p) => ({ ...p, coverImage: p.coverImage })),
    };
  },
  listPublishedPostsByCategory: async (
    category: string,
    offset: bigint,
    limit: bigint,
  ): Promise<PublishedPostsPage> => {
    const filtered = blogPosts.filter(
      (p) => p.isPublished && p.category === category,
    );
    const start = Number(offset);
    const end = start + Number(limit);
    const page = filtered.slice(start, end);
    return {
      total: BigInt(filtered.length),
      posts: page.map((p) => ({ ...p, coverImage: p.coverImage })),
    };
  },
  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    const found = blogPosts.find((p) => p.slug === slug);
    return found ? { ...found, coverImage: found.coverImage } : null;
  },
  getPostSlugs: async (): Promise<Array<PostSitemapEntry>> => {
    // Return slug + category + lastmod (createdAt nanosecond Timestamp) for
    // every published post so the sitemap page can build dynamic <url>
    // entries. Mirrors the backend query shape — lastmod is the post's
    // createdAt Timestamp (nanoseconds since epoch).
    return blogPosts
      .filter((p) => p.isPublished)
      .map((p) => ({
        slug: p.slug,
        category: p.category,
        lastmod: p.createdAt,
      }));
  },
  createBlogPost: async (input: CreateBlogPostInput): Promise<BlogPost> => {
    const post: BlogPost = {
      id: nextBlogId,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      category: input.category,
      readTime: input.readTime,
      author: input.author,
      isPublished: input.isPublished,
      createdAt: BigInt(Date.now()),
    };
    nextBlogId += 1n;
    blogPosts = [post, ...blogPosts];
    return { ...post, coverImage: post.coverImage };
  },
  updateBlogPost: async (
    id: bigint,
    input: UpdateBlogPostInput,
  ): Promise<BlogPost | null> => {
    const existing = blogPosts.find((p) => p.id === id);
    if (!existing) return null;
    const updated: BlogPost = {
      id: existing.id,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      category: input.category,
      readTime: input.readTime,
      author: input.author,
      isPublished: input.isPublished,
      createdAt: existing.createdAt,
    };
    blogPosts = blogPosts.map((p) => (p.id === id ? updated : p));
    return { ...updated, coverImage: updated.coverImage };
  },
  deleteBlogPost: async (id: bigint): Promise<boolean> => {
    const before = blogPosts.length;
    blogPosts = blogPosts.filter((p) => p.id !== id);
    return blogPosts.length < before;
  },

  // --- Site config (nav + hero videos) ---
  getNavConfig: async (): Promise<NavConfig> => {
    // Return a shallow copy of the entries array plus fresh child arrays so
    // callers cannot mutate the in-memory store via the returned reference.
    return {
      entries: navConfig.entries.map((entry) => ({
        text: entry.text,
        href: entry.href,
        children: entry.children.map((child) => ({
          text: child.text,
          href: child.href,
          children: child.children.map((grandchild) => ({
            text: grandchild.text,
            href: grandchild.href,
            children: [],
          })),
        })),
      })),
    };
  },
  setNavConfig: async (config: NavConfig): Promise<NavConfig> => {
    navConfig = {
      entries: config.entries.map((entry) => ({
        text: entry.text,
        href: entry.href,
        children: entry.children.map((child) => ({
          text: child.text,
          href: child.href,
          children: child.children.map((grandchild) => ({
            text: grandchild.text,
            href: grandchild.href,
            children: [],
          })),
        })),
      })),
    };
    return navConfig;
  },
  getHeroVideoConfig: async (): Promise<HeroVideoConfig> => {
    // Return a shallow copy of the slots array so callers cannot mutate the
    // in-memory store via the returned reference.
    return {
      slots: heroVideoConfig.slots.map((slot) => ({
        key: slot.key,
        videoUrl: slot.videoUrl,
        posterUrl: slot.posterUrl,
      })),
    };
  },
  setHeroVideoConfig: async (config: HeroVideoConfig): Promise<HeroVideoConfig> => {
    heroVideoConfig = {
      slots: config.slots.map((slot) => ({
        key: slot.key,
        videoUrl: slot.videoUrl,
        posterUrl: slot.posterUrl,
      })),
    };
    return heroVideoConfig;
  },

  // --- Stripe (mock-mode stubs) ---
  // Mock-mode fallbacks for the Stripe extension methods so
  // `VITE_USE_MOCK=true pnpm dev` does not crash when the checkout
  // pages or the Stripe setup panel call the actor. These return safe
  // defaults: configuration reports as unset, session creation throws
  // a clear mock-mode error, and session status reports as failed so
  // the success page renders its recovery path instead of spinning.
  isStripeConfigured: async (): Promise<boolean> => {
    return false;
  },
  setStripeConfiguration: async (
    _config: StripeConfiguration,
  ): Promise<void> => {
    // No-op in mock mode — there is no canister to persist the key.
    return;
  },
  createCheckoutSession: async (
    _items: Array<ShoppingItem>,
    _successUrl: string,
    _cancelUrl: string,
  ): Promise<string> => {
    throw new Error(
      "Stripe checkout is not available in mock mode. Run with a live backend to create a checkout session.",
    );
  },
  getStripeSessionStatus: async (
    _sessionId: string,
  ): Promise<StripeSessionStatus> => {
    return {
      __kind__: "failed",
      failed: { error: "Stripe session status unavailable in mock mode." },
    };
  },
  transform: async (
    input: TransformationInput,
  ): Promise<TransformationOutput> => {
    // Identity pass-through — the mock does not transform HTTP responses.
    return {
      status: input.response.status,
      body: input.response.body,
      headers: input.response.headers,
    };
  },
};
