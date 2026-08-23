import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import OQL "mo:caffeineai-oql";
import OQLEntity "mo:caffeineai-oql/Entity";
import Expose "mo:caffeineai-oql/Expose";
import Stripe "mo:caffeineai-stripe/stripe";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "types/gallery";
import BlogTypes "types/blog";
import SiteConfigTypes "types/site-config";
import StripeTypes "types/stripe";
import StripeLib "lib/stripe";
import AdminWhitelist "lib/AdminWhitelist";
import GalleryApi "mixins/gallery-api";
import BlogApi "mixins/blog-api";
import SiteConfigApi "mixins/site-config-api";

actor {
  // Authorization state (existing) — initialized by the migration chain.
  // Kept intact: the MixinAuthorization include and the II sign-in flow
  // depend on it. The adminWhitelist below is an ADDITIONAL, stricter gate
  // layered on top — it is the authoritative admin check, independent of the
  // AccessControl bootstrap race (adminAssigned / userRoles).
  let accessControlState : AccessControl.AccessControlState;

  // Admin whitelist — the DETERMINISTIC admin gate. Seeded by the migration
  // chain (20260819_000001.mo) with the sole authorized II principal so the
  // authorized user is always admin regardless of who called
  // _initialize_access_control first. Mutable at runtime via addAdmin so
  // additional principals can be appended during handover. Every admin-only
  // method (setStripeConfiguration, addAdmin, and the blog/gallery/site-config
  // mutating methods + listAllPosts) checks membership via the isAdmin helper
  // below instead of AccessControl.isAdmin.
  var adminWhitelist : [Principal];

  // Gallery stable state — initialized by the migration chain.
  let galleryItems : List.List<Types.GalleryItem>;
  let galleryState : Types.GalleryState;

  // Blog stable state — initialized by the migration chain.
  let blogPosts : List.List<BlogTypes.BlogPost>;
  let blogState : BlogTypes.BlogState;

  // Site config stable state (nav + hero video config) — initialized by the
  // migration chain with the current NAV_ENTRIES content and the 6 local
  // hero video slots so the live site is unchanged.
  let siteConfigState : SiteConfigTypes.SiteConfigState;

  // Stripe stable state — initialized by the migration chain with no
  // configuration so isStripeConfigured() returns false until an admin
  // configures it via setStripeConfiguration.
  let stripeState : StripeTypes.StripeState;

  // Deterministic admin check — membership in adminWhitelist. Implemented in
  // lib/AdminWhitelist.mo (a shared module) so the blog/gallery/site-config
  // mixins can call it too: a `func` declared in the actor body is NOT visible
  // inside an `include`d mixin (separate scope), so the check must live in a
  // module-level function that takes the whitelist and the caller. Independent
  // of the AccessControl bootstrap state so the authorized principal is
  // always admin regardless of who called _initialize_access_control first.

  // Existing authorization mixin (kept intact).
  include MixinAuthorization(accessControlState, null);

  // Object-storage platform mixin — provides the certified-blob gateway
  // endpoints required for image uploads/downloads.
  include MixinObjectStorage();

  // Gallery domain API (admin-guarded mutations, public read query).
  include GalleryApi(galleryItems, galleryState, adminWhitelist);

  // Blog domain API (admin-guarded mutations, public read queries).
  include BlogApi(blogPosts, blogState, adminWhitelist);

  // Site config domain API (public read queries, admin-guarded updates via
  // the admin whitelist) so nav and hero video config can be edited
  // without redeploying.
  include SiteConfigApi(siteConfigState, adminWhitelist);

  // Stripe integration — the 5 functions below are declared DIRECTLY in the
  // actor body (not via a mixin include) because caffeineai-stripe@0.1.3 lint
  // rules require createCheckoutSession, getStripeSessionStatus, transform,
  // isStripeConfigured, and setStripeConfiguration to appear in the actor
  // body itself. They call StripeLib.* (domain helpers in lib/stripe.mo) and
  // Stripe.* (the caffeineai-stripe platform module) directly, taking
  // accessControlState and stripeState from the actor's own stable fields.
  // No webhooks — getStripeSessionStatus polls Stripe on demand.

  // Query: return whether Stripe has been configured. Public read so the
  // frontend can decide whether to show the admin setup panel.
  public query func isStripeConfigured() : async Bool {
    StripeLib.isConfigured(stripeState);
  };

  // Update: admin-only. Replace the Stripe configuration (secret key +
  // allowed countries). Traps if the caller is not in the admin whitelist.
  public shared ({ caller }) func setStripeConfiguration(config : StripeTypes.StripeConfiguration) : async () {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can configure Stripe");
    };
    ignore StripeLib.setConfiguration(stripeState, config);
  };

  // Query: return whether the given principal is authorized as admin. This is
  // the frontend's source of truth for admin authorization. Bootstrap-aware:
  // when the whitelist is empty (no admin has initialized the canister yet),
  // any principal is authorized so the first signed-in user can claim the
  // admin panel.
  public query func isAdmin(caller : Principal) : async Bool {
    AdminWhitelist.isAdmin(adminWhitelist, caller);
  };

  // Update: append a principal to the admin whitelist so additional admins can
  // be added during handover. Gated behind the same whitelist check. When the
  // whitelist is empty (bootstrap), the bootstrap-aware gate lets the first
  // caller through, so they can self-claim and persist themselves as admin.
  // No removeAdmin — the user did not request it and it risks locking out the
  // sole admin.
  public shared ({ caller }) func addAdmin(principal : Principal) : async () {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can add admins");
    };
    adminWhitelist := adminWhitelist.concat([principal]);
  };

  // Update: create a Stripe checkout session for the supplied items and
  // return the Stripe JSON reply (which includes the session `url` the
  // frontend redirects to). `successUrl` and `cancelUrl` are built by the
  // frontend from the current site origin as /checkout/success and
  // /checkout/cancel. Traps if Stripe has not been configured.
  public shared ({ caller }) func createCheckoutSession(items : [StripeTypes.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    let configuration = StripeLib.getConfiguration(stripeState);
    await Stripe.createCheckoutSession(configuration, caller, items, successUrl, cancelUrl, transform);
  };

  // Update: poll Stripe via HTTP outcall for the status of a checkout session.
  // Returns #completed (with response + userPrincipal) or #failed (with
  // error). No webhooks — the canister polls on demand. This MUST be an
  // update method (not a query) because getSessionStatus performs an HTTP
  // outcall, which requires an update context; a query method cannot await
  // an inter-canister HTTP call.
  public func getStripeSessionStatus(sessionId : Text) : async StripeTypes.StripeSessionStatus {
    let configuration = StripeLib.getConfiguration(stripeState);
    await Stripe.getSessionStatus(configuration, sessionId, transform);
  };

  // Query: HTTP outcall transform callback. The IC invokes this query to
  // strip headers from the response before delivering it to the canister.
  // Required by caffeineai-stripe / caffeineai-http-outcalls for every
  // outbound HTTP request.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // OQL exposure — gallery items are public-readable so the Data Intelligence
  // agent and any visitor can query them. Manual mode because the image field
  // is a Blob (non-primitive); only the queryable scalar fields are projected.
  // Blog posts are public-readable; the cover image (Blob) is excluded and
  // only scalar fields are projected. The blogPost source closure filters at
  // the row level so drafts (isPublished == false) NEVER enter the OQL
  // iterator — draft titles/excerpts/content/slugs/authors cannot leak via
  // the public execute() endpoint.
  //
  // Nav entries and hero video slots are public-readable so the Data
  // Intelligence agent and any visitor can query them. Manual mode over the
  // siteConfigState arrays; each row is a flat all-primitive record.
  include Expose({
    entities = [
      OQLEntity.manual<Types.GalleryItem>(
        "galleryItem",
        func() = galleryItems.values(),
        "GalleryItem",
        "id",
      )
        .payload("id", func(item : Types.GalleryItem) : Nat = item.id, OQL.NatValue._toRow)
        .payload("title", func(item : Types.GalleryItem) : Text = item.title, OQL.TextValue._toRow)
        .payload("description", func(item : Types.GalleryItem) : Text = item.description, OQL.TextValue._toRow)
        .payload("createdAt", func(item : Types.GalleryItem) : Int = item.createdAt, OQL.IntValue._toRow)
        .payload("eventDate", func(item : Types.GalleryItem) : Int = switch (item.eventDate) { case (?d) d; case null 0 }, OQL.IntValue._toRow)
        .payload("category", func(item : Types.GalleryItem) : Text = item.category, OQL.TextValue._toRow)
        .public_()
        .build() : OQLEntity.Decl,
      OQLEntity.manual<BlogTypes.BlogPost>(
        "blogPost",
        func() = blogPosts.values().filter(
          func(post : BlogTypes.BlogPost) : Bool = post.isPublished,
        ),
        "BlogPost",
        "id",
      )
        .payload("id", func(post : BlogTypes.BlogPost) : Nat = post.id, OQL.NatValue._toRow)
        .payload("slug", func(post : BlogTypes.BlogPost) : Text = post.slug, OQL.TextValue._toRow)
        .payload("title", func(post : BlogTypes.BlogPost) : Text = post.title, OQL.TextValue._toRow)
        .payload("excerpt", func(post : BlogTypes.BlogPost) : Text = post.excerpt, OQL.TextValue._toRow)
        .payload("content", func(post : BlogTypes.BlogPost) : Text = post.content, OQL.TextValue._toRow)
        .payload("category", func(post : BlogTypes.BlogPost) : Text = post.category, OQL.TextValue._toRow)
        .payload("readTime", func(post : BlogTypes.BlogPost) : Text = post.readTime, OQL.TextValue._toRow)
        .payload("author", func(post : BlogTypes.BlogPost) : Text = post.author, OQL.TextValue._toRow)
        .payload("isPublished", func(post : BlogTypes.BlogPost) : Bool = post.isPublished, OQL.BoolValue._toRow)
        .payload("createdAt", func(post : BlogTypes.BlogPost) : Int = post.createdAt, OQL.IntValue._toRow)
        .public_()
        .build() : OQLEntity.Decl,
      // Nav entries — public-readable. The primary key is the entry's href
      // (unique within the nav tree). Manual mode over the entries array.
      OQLEntity.manual<SiteConfigTypes.NavEntry>(
        "navEntry",
        func() = siteConfigState.navConfig.entries.values(),
        "NavEntry",
        "href",
      )
        .payload("text", func(entry : SiteConfigTypes.NavEntry) : Text = entry.text, OQL.TextValue._toRow)
        .payload("href", func(entry : SiteConfigTypes.NavEntry) : Text = entry.href, OQL.TextValue._toRow)
        .public_()
        .build() : OQLEntity.Decl,
      // Hero video slots — public-readable. The primary key is the slot's
      // stable `key` (e.g. "flag-waving"). Manual mode over the slots array.
      OQLEntity.manual<SiteConfigTypes.HeroVideoSlot>(
        "heroVideoSlot",
        func() = siteConfigState.heroVideoConfig.slots.values(),
        "HeroVideoSlot",
        "key",
      )
        .payload("key", func(slot : SiteConfigTypes.HeroVideoSlot) : Text = slot.key, OQL.TextValue._toRow)
        .payload("videoUrl", func(slot : SiteConfigTypes.HeroVideoSlot) : Text = slot.videoUrl, OQL.TextValue._toRow)
        .payload("posterUrl", func(slot : SiteConfigTypes.HeroVideoSlot) : Text = slot.posterUrl, OQL.TextValue._toRow)
        .public_()
        .build() : OQLEntity.Decl,
    ];
  });
};
