import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/blog";
import BlogLib "../lib/blog";
import AdminWhitelist "../lib/AdminWhitelist";

mixin (
  blogPosts : List.List<Types.BlogPost>,
  blogState : Types.BlogState,
  adminWhitelist : [Principal],
) {
  // Query: return published posts ordered by createdAt descending, paginated
  // by offset+limit, with the total count of published posts.
  // Public read — any visitor (incl. anonymous) can browse published posts.
  public query func listPublishedPosts(offset : Nat, limit : Nat) : async BlogLib.PublishedPostsPage {
    BlogLib.listPublishedPosts(blogPosts, offset, limit);
  };

  // Query: return published posts (isPublished==true) whose category equals
  // the given category, ordered by createdAt descending, paginated by
  // offset+limit, with the total count of matching published posts. Public
  // read — powers the /blog (category=="Blog") and /real-british-history
  // (category=="Real British History") hub pages without client-side filtering.
  public query func listPublishedPostsByCategory(category : Text, offset : Nat, limit : Nat) : async BlogLib.PublishedPostsPage {
    BlogLib.listPublishedPostsByCategory(blogPosts, category, offset, limit);
  };

  // Query: return a single published post by slug. Returns null for draft
  // or nonexistent slugs. Public read.
  public query func getPostBySlug(slug : Text) : async ?Types.BlogPost {
    BlogLib.getPostBySlug(blogPosts, slug);
  };

  // Query: return sitemap entries (slug, category, lastmod) for every
  // published post, ordered by createdAt descending. Public read — powers
  // the runtime /sitemap.xml generation so dynamic /post/$slug,
  // /blog/$slug, and /real-british-history/$slug routes are included.
  // Drafts and unpublished posts are excluded.
  public query func getPostSlugs() : async [BlogLib.PostSitemapEntry] {
    BlogLib.listPostSitemapEntries(blogPosts);
  };

  // Query: admin-only. Return all posts (published + draft) ordered by
  // createdAt descending, for the admin dashboard.
  public query ({ caller }) func listAllPosts() : async [Types.BlogPost] {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can list all posts");
    };
    BlogLib.listAllPosts(blogPosts);
  };

  // Update: admin-only. Create a new blog post. The canister generates id
  // and createdAt. Traps if a post with the same slug already exists.
  public shared ({ caller }) func createBlogPost(input : Types.CreateBlogPostInput) : async Types.BlogPost {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can create blog posts");
    };
    BlogLib.createPost(
      blogPosts,
      blogState,
      input,
      Time.now(),
    );
  };

  // Update: admin-only. Edit an existing post's fields. Returns the updated
  // post, or null if no post matches the id. Traps on slug collision.
  public shared ({ caller }) func updateBlogPost(id : Types.BlogPostId, input : Types.UpdateBlogPostInput) : async ?Types.BlogPost {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can update blog posts");
    };
    BlogLib.updatePost(blogPosts, id, input);
  };

  // Update: admin-only. Delete a blog post by id. Returns true if removed.
  public shared ({ caller }) func deleteBlogPost(id : Types.BlogPostId) : async Bool {
    if (not AdminWhitelist.isAdmin(adminWhitelist, caller)) {
      Runtime.trap("Unauthorized: only admins can delete blog posts");
    };
    BlogLib.deletePost(blogPosts, id);
  };
};
