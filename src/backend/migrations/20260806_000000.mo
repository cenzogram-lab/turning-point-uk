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

  // Previous actor signature (matches the NewActor of 20260803_013500.mo).
  type OldActor = {
    accessControlState : AccessControlState;
  };

  // New actor signature — adds gallery stable state.
  type NewActor = {
    accessControlState : AccessControlState;
    galleryItems : List.List<GalleryItem>;
    galleryState : GalleryState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      galleryItems = List.empty();
      galleryState = {
        var nextId = 0;
      };
    };
  };
};
