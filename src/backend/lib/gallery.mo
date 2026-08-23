import List "mo:core/List";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/gallery";
import Common "../types/common";

module {
  public type GalleryItem = Types.GalleryItem;
  public type GalleryItemId = Types.GalleryItemId;

  // Default category for items without an explicit category.
  let defaultCategory : Text = "Uncategorized";

  // Normalize a category value: empty text falls back to "Uncategorized".
  func normalizeCategory(category : Text) : Text {
    if (category == "") { defaultCategory } else { category };
  };

  // Return all gallery items ordered by createdAt descending.
  public func listItems(items : List.List<Types.GalleryItem>) : [Types.GalleryItem] {
    let snapshot = items.toArray();
    let sorted = snapshot.sort(func(a : Types.GalleryItem, b : Types.GalleryItem) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
    sorted;
  };

  // Find a single item by id.
  public func getItem(items : List.List<Types.GalleryItem>, id : Types.GalleryItemId) : ?Types.GalleryItem {
    items.find(func(item : Types.GalleryItem) : Bool { item.id == id });
  };

  // Create a new item, assigning the next id and the current timestamp.
  // eventDate is optional; category defaults to "Uncategorized" when empty.
  public func createItem(
    items : List.List<Types.GalleryItem>,
    state : Types.GalleryState,
    image : Storage.ExternalBlob,
    title : Text,
    description : Text,
    eventDate : ?Common.Timestamp,
    category : Text,
    createdAt : Common.Timestamp,
  ) : Types.GalleryItem {
    let id = state.nextId;
    state.nextId := state.nextId + 1;
    let item : Types.GalleryItem = {
      id;
      image;
      title;
      description;
      createdAt;
      eventDate;
      category = normalizeCategory(category);
    };
    items.add(item);
    item;
  };

  // Edit an existing item's title, description, eventDate, and category.
  // The image remains immutable on update. eventDate is set to the provided
  // value (null clears it). category is updated when non-empty; an empty
  // category preserves the existing value. Returns the updated item, or
  // null if no item matches the id.
  public func updateItem(
    items : List.List<Types.GalleryItem>,
    id : Types.GalleryItemId,
    title : Text,
    description : Text,
    eventDate : ?Common.Timestamp,
    category : Text,
  ) : ?Types.GalleryItem {
    switch (items.find(func(item : Types.GalleryItem) : Bool { item.id == id })) {
      case (?found) {
        let newCategory = if (category == "") { found.category } else { normalizeCategory(category) };
        let updated : Types.GalleryItem = {
          id = found.id;
          image = found.image;
          title;
          description;
          createdAt = found.createdAt;
          eventDate;
          category = newCategory;
        };
        let snapshot = items.toArray();
        items.clear();
        for (item in snapshot.values()) {
          if (item.id == id) {
            items.add(updated);
          } else {
            items.add(item);
          };
        };
        ?updated;
      };
      case null { null };
    };
  };

  // Delete an item by id. Returns true if an item was removed.
  public func deleteItem(items : List.List<Types.GalleryItem>, id : Types.GalleryItemId) : Bool {
    var removed = false;
    let snapshot = items.toArray();
    items.clear();
    for (item in snapshot.values()) {
      if (item.id == id) {
        removed := true;
      } else {
        items.add(item);
      };
    };
    removed;
  };
};
