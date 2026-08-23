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

  // Gallery item as stored in the previous stable signature.
  type GalleryItem = {
    id : Nat;
    image : Blob;
    title : Text;
    description : Text;
    createdAt : Int;
    eventDate : ?Int;
    category : Text;
  };

  // Mutable counter record shared across mixins.
  type GalleryState = {
    var nextId : Nat;
  };

  // Blog post as stored in stable state.
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

  // Mutable counter record shared across mixins.
  type BlogState = {
    var nextId : Nat;
  };

  // Site config types (inlined — no project imports).
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

  // Previous actor signature (matches the NewActor of 20260809_000000.mo).
  type OldActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
  };

  // New actor signature — adds siteConfigState seeded with the current
  // NAV_ENTRIES content and the 6 local hero video slots so the live site
  // is unchanged.
  type NewActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
    siteConfigState : SiteConfigState;
  };

  // The initial navigation structure — the existing 3 dropdowns + standalone
  // links. Seeded so the live site is unchanged.
  func initialNavConfig() : NavConfig {
    {
      entries = [
        {
          text = "About";
          href = "#";
          children = [
            { text = "Gallery"; href = "/gallery"; children = [] : [NavEntry] },
            { text = "Blog"; href = "/blog"; children = [] : [NavEntry] },
          ];
        },
        {
          text = "Activism";
          href = "#";
          children = [
            { text = "Become An Activist"; href = "/become-an-activist"; children = [] : [NavEntry] },
            { text = "Activism Kit"; href = "/activism-kit"; children = [] : [NavEntry] },
            { text = "Education Watch"; href = "/education-watch"; children = [] : [NavEntry] },
            { text = "University Societies"; href = "/university-societies"; children = [] : [NavEntry] },
            { text = "Petition"; href = "/petition"; children = [] : [NavEntry] },
          ];
        },
        {
          text = "Join";
          href = "#";
          children = [
            { text = "Join Us"; href = "/join-us"; children = [] : [NavEntry] },
            { text = "Patreon"; href = "/patreon"; children = [] : [NavEntry] },
          ];
        },
        { text = "Events"; href = "/events"; children = [] : [NavEntry] },
        { text = "Merchandise"; href = "/merchandise"; children = [] : [NavEntry] },
        { text = "Blog"; href = "/blog"; children = [] : [NavEntry] },
        { text = "Real British History"; href = "/real-british-history"; children = [] : [NavEntry] },
        { text = "Contact"; href = "/contact"; children = [] : [NavEntry] },
      ];
    };
  };

  // The initial hero video config — the 6 hero slots keyed by their stable
  // identifiers, each with its local-hosted video URL and poster image URL.
  // Seeded so the live site is unchanged.
  func initialHeroVideoConfig() : HeroVideoConfig {
    {
      slots = [
        { key = "flag-waving"; videoUrl = "/videos/flag-waving.mp4"; posterUrl = "/assets/generated/poster-flag-waving.dim_1280x720.jpg" },
        { key = "mascot-walk"; videoUrl = "/videos/mascot-walk.mp4"; posterUrl = "/assets/generated/poster-mascot-walk.dim_1280x720.jpg" },
        { key = "newspaper-ad"; videoUrl = "/videos/newspaper-ad.mp4"; posterUrl = "/assets/generated/poster-newspaper-ad.dim_1280x720.jpg" },
        { key = "historic-london"; videoUrl = "/videos/historic-london.mp4"; posterUrl = "/assets/generated/poster-historic-london.dim_1280x720.jpg" },
        { key = "education-crowd"; videoUrl = "/videos/education-crowd.mp4"; posterUrl = "/assets/generated/poster-education-crowd.dim_1280x720.jpg" },
        { key = "merch-display"; videoUrl = "/videos/merch-display.mp4"; posterUrl = "/assets/generated/poster-merch-display.dim_1280x720.jpg" },
      ];
    };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      galleryItems = old.galleryItems;
      galleryState = old.galleryState;
      blogPosts = old.blogPosts;
      blogState = old.blogState;
      siteConfigState = {
        var navConfig = initialNavConfig();
        var heroVideoConfig = initialHeroVideoConfig();
      };
    };
  };
};
