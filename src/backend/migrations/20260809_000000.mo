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

  // Gallery item as stored in the previous stable signature. The image is a
  // Blob (Storage.ExternalBlob is a type alias for Blob), which is a shared
  // (serializable) type and therefore safe to persist directly.
  type OldGalleryItem = {
    id : Nat;
    image : Blob;
    title : Text;
    description : Text;
    createdAt : Int;
  };

  // Gallery item after this migration: adds eventDate (optional, left
  // unset/null) and category (defaults to "Uncategorized").
  type NewGalleryItem = {
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

  // Blog post as stored in stable state. The cover image is a Blob
  // (Storage.ExternalBlob is a type alias for Blob), which is a shared
  // (serializable) type and therefore safe to persist directly.
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

  // Previous actor signature (matches the NewActor of 20260806_010000.mo).
  type OldActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<OldGalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
  };

  // New actor signature — gallery items gain eventDate and category fields.
  type NewActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<NewGalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
  };

  public func migration(old : OldActor) : NewActor {
    // Rebuild each gallery item with the new fields: eventDate left unset
    // (null) and category defaulted to "Uncategorized".
    let migratedItems = List.empty<NewGalleryItem>();
    for (item in old.galleryItems.values()) {
      migratedItems.add({
        id = item.id;
        image = item.image;
        title = item.title;
        description = item.description;
        createdAt = item.createdAt;
        eventDate = null;
        category = "Uncategorized";
      });
    };
    {
      accessControlState = old.accessControlState;
      galleryItems = migratedItems;
      galleryState = old.galleryState;
      blogPosts = old.blogPosts;
      blogState = old.blogState;
    };
  };
};
