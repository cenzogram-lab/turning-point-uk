import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type BlogPostId = Nat;

  // Stored blog post. The cover image is held off-chain as an ExternalBlob
  // reference (see extension-object-storage); never use Text for the image.
  public type BlogPost = {
    id : BlogPostId;
    slug : Text;
    title : Text;
    excerpt : Text;
    content : Text;
    coverImage : Storage.ExternalBlob;
    category : Text;
    readTime : Text;
    author : Text;
    isPublished : Bool;
    createdAt : Common.Timestamp;
  };

  // Mutable counter record shared across mixins so increments propagate.
  public type BlogState = {
    var nextId : Nat;
  };

  // Input for creating a new blog post. The canister assigns id and createdAt.
  public type CreateBlogPostInput = {
    slug : Text;
    title : Text;
    excerpt : Text;
    content : Text;
    coverImage : Storage.ExternalBlob;
    category : Text;
    readTime : Text;
    author : Text;
    isPublished : Bool;
  };

  // Input for updating an existing blog post. All fields replace the
  // existing values; id and createdAt are preserved by the canister.
  public type UpdateBlogPostInput = {
    slug : Text;
    title : Text;
    excerpt : Text;
    content : Text;
    coverImage : Storage.ExternalBlob;
    category : Text;
    readTime : Text;
    author : Text;
    isPublished : Bool;
  };

  // Sitemap entry for a published post. The frontend merges these with the
  // static routes to generate /sitemap.xml at runtime. `lastmod` is the
  // post's createdAt timestamp (nanoseconds since epoch) — there is no
  // separate updatedAt field on BlogPost, so createdAt is the most recent
  // known modification time.
  public type PostSitemapEntry = {
    slug : Text;
    category : Text;
    lastmod : Common.Timestamp;
  };
};
