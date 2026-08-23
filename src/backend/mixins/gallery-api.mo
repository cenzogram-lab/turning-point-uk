import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/gallery";
import Common "../types/common";
import GalleryLib "../lib/gallery";
import AdminWhitelist "../lib/AdminWhitelist";

mixin (
  galleryItems : List.List<Types.GalleryItem>,
  galleryState : Types.GalleryState,
  adminWhitelist : [Principal],
) {
  // Query: return all gallery items ordered by createdAt descending.
  // Public read — any visitor (incl. anonymous) can browse the gallery.
  public query func getGalleryItems() : async [Types.GalleryItem] {
    GalleryLib.listItems(galleryItems);
  };

  // Update: admin-only. Create a new gallery item from an uploaded image
  // reference plus title/description and optional eventDate/category. The
  // canister generates id and createdAt. category defaults to
  // "Uncategorized" when empty.
  public shared ({ caller }) func createGalleryItem(
    image : Storage.ExternalBlob,
    title : Text,
    description : Text,
    eventDate : ?Common.Timestamp,
    category : Text,
  ) : async Types.GalleryItem {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can create gallery items");
    };
    GalleryLib.createItem(
      galleryItems,
      galleryState,
      image,
      title,
      description,
      eventDate,
      category,
      Time.now(),
    );
  };

  // Update: admin-only. Edit an existing item's title, description,
  // eventDate, and category. The image remains immutable. eventDate is set
  // to the provided value (null clears it). category is updated when
  // non-empty; an empty category preserves the existing value.
  public shared ({ caller }) func updateGalleryItem(
    id : Types.GalleryItemId,
    title : Text,
    description : Text,
    eventDate : ?Common.Timestamp,
    category : Text,
  ) : async ?Types.GalleryItem {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can update gallery items");
    };
    GalleryLib.updateItem(galleryItems, id, title, description, eventDate, category);
  };

  // Update: admin-only. Delete a gallery item by id.
  public shared ({ caller }) func deleteGalleryItem(id : Types.GalleryItemId) : async Bool {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can delete gallery items");
    };
    GalleryLib.deleteItem(galleryItems, id);
  };
};
