import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old stable field types (inlined — no project imports).
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type GalleryItem = {
    id : Nat;
    image : Blob;
    title : Text;
    description : Text;
    createdAt : Int;
    eventDate : ?Int;
    category : Text;
  };

  type GalleryState = {
    var nextId : Nat;
  };

  type BlogPost = {
    id : Nat;
    slug : Text;
    title : Text;
    excerpt : Text;
    content : Text;
    coverImage : Blob;
    category : Text;
    readTime : Text;
    author : Text;
    isPublished : Bool;
    createdAt : Int;
  };

  type BlogState = {
    var nextId : Nat;
  };

  type NavEntry = {
    text : Text;
    href : Text;
    children : [NavEntry];
  };

  type NavConfig = {
    entries : [NavEntry];
  };

  type HeroVideoSlot = {
    key : Text;
    videoUrl : Text;
    posterUrl : Text;
  };

  type HeroVideoConfig = {
    slots : [HeroVideoSlot];
  };

  type SiteConfigState = {
    var navConfig : NavConfig;
    var heroVideoConfig : HeroVideoConfig;
  };

  // Stripe configuration (inlined — no project imports).
  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  type StripeState = {
    var configuration : ?StripeConfiguration;
  };

  // Previous actor signature (matches the NewActor of 20260815_000000.mo).
  type OldActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
    siteConfigState : SiteConfigState;
  };

  // New actor signature — adds stripeState seeded with no configuration so
  // isStripeConfigured() returns false until an admin configures it.
  type NewActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
    siteConfigState : SiteConfigState;
    stripeState : StripeState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      galleryItems = old.galleryItems;
      galleryState = old.galleryState;
      blogPosts = old.blogPosts;
      blogState = old.blogState;
      siteConfigState = old.siteConfigState;
      stripeState = {
        var configuration = null : ?StripeConfiguration;
      };
    };
  };
};
