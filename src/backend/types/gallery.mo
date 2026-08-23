import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type GalleryItemId = Nat;

  // Stored gallery item. The image is held off-chain as an ExternalBlob
  // reference (see extension-object-storage); never use Text for the image.
  // eventDate is an optional event date (nanoseconds since epoch), distinct
  // from the upload timestamp (createdAt). category is a Text string with
  // allowed values: "Campus Events", "Direct Action", "Rallies",
  // "Education Watch", "Uncategorized"; existing items default to
  // "Uncategorized" after migration.
  public type GalleryItem = {
    id : GalleryItemId;
    image : Storage.ExternalBlob;
    title : Text;
    description : Text;
    createdAt : Common.Timestamp;
    eventDate : ?Common.Timestamp;
    category : Text;
  };

  // Mutable counter record shared across mixins so increments propagate.
  public type GalleryState = {
    var nextId : Nat;
  };

  // Input for creating a new gallery item. eventDate is optional; category
  // is a Text string that defaults to "Uncategorized" when empty.
  public type CreateGalleryItemInput = {
    image : Storage.ExternalBlob;
    title : Text;
    description : Text;
    eventDate : ?Common.Timestamp;
    category : Text;
  };

  // Input for editing an existing gallery item. The image is immutable on
  // update. eventDate is optional; when null the existing value is
  // preserved. category is a Text string; when empty the existing value is
  // preserved.
  public type UpdateGalleryItemInput = {
    id : GalleryItemId;
    title : Text;
    description : Text;
    eventDate : ?Common.Timestamp;
    category : Text;
  };
};
