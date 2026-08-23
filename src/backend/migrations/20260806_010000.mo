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

  // Gallery item as stored in stable state. The image is a Blob
  // (Storage.ExternalBlob is a type alias for Blob), which is a shared
  // (serializable) type and therefore safe to persist directly.
  type GalleryItem = {
    id : Nat;
    image : Blob;
    title : Text;
    description : Text;
    createdAt : Int;
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

  // Previous actor signature (matches the NewActor of 20260806_000000.mo).
  type OldActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
  };

  // New actor signature — adds blog stable state.
  type NewActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
    blogPosts : List.List<BlogPost>;
    blogState : BlogState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      galleryItems = old.galleryItems;
      galleryState = old.galleryState;
      blogPosts = List.empty();
      blogState = {
        var nextId = 0;
      };
    };
  };
};
