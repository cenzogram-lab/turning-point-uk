import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface NavEntry {
    href: string;
    text: string;
    children: Array<NavEntry>;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface PostSitemapEntry {
    slug: string;
    category: string;
    lastmod: Timestamp;
}
export interface CreateBlogPostInput {
    title: string;
    content: string;
    isPublished: boolean;
    slug: string;
    author: string;
    readTime: string;
    coverImage: ExternalBlob;
    excerpt: string;
    category: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface Cell {
    value: Value;
    name: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface HeroVideoConfig {
    slots: Array<HeroVideoSlot>;
}
export interface BlogPost {
    id: BlogPostId;
    title: string;
    content: string;
    isPublished: boolean;
    createdAt: Timestamp;
    slug: string;
    author: string;
    readTime: string;
    coverImage: ExternalBlob;
    excerpt: string;
    category: string;
}
export interface PublishedPostsPage {
    total: bigint;
    posts: Array<BlogPost>;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface UpdateBlogPostInput {
    title: string;
    content: string;
    isPublished: boolean;
    slug: string;
    author: string;
    readTime: string;
    coverImage: ExternalBlob;
    excerpt: string;
    category: string;
}
export interface HttpHeader {
    value: string;
    name: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface NavConfig {
    entries: Array<NavEntry>;
}
export type GalleryItemId = bigint;
export type BlogPostId = bigint;
export interface HeroVideoSlot {
    key: string;
    posterUrl: string;
    videoUrl: string;
}
export interface GalleryItem {
    id: GalleryItemId;
    title: string;
    createdAt: Timestamp;
    description: string;
    category: string;
    image: ExternalBlob;
    eventDate?: Timestamp;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(principal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBlogPost(input: CreateBlogPostInput): Promise<BlogPost>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createGalleryItem(image: ExternalBlob, title: string, description: string, eventDate: Timestamp | null, category: string): Promise<GalleryItem>;
    deleteBlogPost(id: BlogPostId): Promise<boolean>;
    deleteGalleryItem(id: GalleryItemId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getCallerUserRole(): Promise<UserRole>;
    getGalleryItems(): Promise<Array<GalleryItem>>;
    getHeroVideoConfig(): Promise<HeroVideoConfig>;
    getNavConfig(): Promise<NavConfig>;
    getPostBySlug(slug: string): Promise<BlogPost | null>;
    getPostSlugs(): Promise<Array<PostSitemapEntry>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    isAdmin(caller: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listAllPosts(): Promise<Array<BlogPost>>;
    listPublishedPosts(offset: bigint, limit: bigint): Promise<PublishedPostsPage>;
    listPublishedPostsByCategory(category: string, offset: bigint, limit: bigint): Promise<PublishedPostsPage>;
    schema(): Promise<string>;
    setHeroVideoConfig(config: HeroVideoConfig): Promise<HeroVideoConfig>;
    setNavConfig(config: NavConfig): Promise<NavConfig>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBlogPost(id: BlogPostId, input: UpdateBlogPostInput): Promise<BlogPost | null>;
    updateGalleryItem(id: GalleryItemId, title: string, description: string, eventDate: Timestamp | null, category: string): Promise<GalleryItem | null>;
}
