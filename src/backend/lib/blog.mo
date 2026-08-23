import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Types "../types/blog";
import Common "../types/common";

module {
  public type BlogPost = Types.BlogPost;
  public type BlogPostId = Types.BlogPostId;
  public type CreateBlogPostInput = Types.CreateBlogPostInput;
  public type UpdateBlogPostInput = Types.UpdateBlogPostInput;
  public type PostSitemapEntry = Types.PostSitemapEntry;

  // Paginated result for published posts.
  public type PublishedPostsPage = {
    posts : [Types.BlogPost];
    total : Nat;
  };

  // Return all published posts ordered by createdAt descending, paginated
  // by offset+limit, with the total count of published posts.
  public func listPublishedPosts(
    posts : List.List<Types.BlogPost>,
    offset : Nat,
    limit : Nat,
  ) : PublishedPostsPage {
    let snapshot = posts.toArray();
    let published = snapshot.filter(func(post : Types.BlogPost) : Bool { post.isPublished });
    let sorted = published.sort(func(a : Types.BlogPost, b : Types.BlogPost) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
    let total = sorted.size();
    let page = if (offset >= total) {
      [];
    } else {
      let end = if (offset + limit > total) { total } else { offset + limit };
      sorted.sliceToArray(offset, end);
    };
    { posts = page; total };
  };

  // Return published posts (isPublished==true) whose category equals the
  // given category, ordered by createdAt descending, paginated by
  // offset+limit, with the total count of matching published posts. Mirrors
  // listPublishedPosts exactly, adding only the category equality predicate.
  public func listPublishedPostsByCategory(
    posts : List.List<Types.BlogPost>,
    category : Text,
    offset : Nat,
    limit : Nat,
  ) : PublishedPostsPage {
    let snapshot = posts.toArray();
    let matching = snapshot.filter(func(post : Types.BlogPost) : Bool {
      post.isPublished and post.category == category;
    });
    let sorted = matching.sort(func(a : Types.BlogPost, b : Types.BlogPost) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
    let total = sorted.size();
    let page = if (offset >= total) {
      [];
    } else {
      let end = if (offset + limit > total) { total } else { offset + limit };
      sorted.sliceToArray(offset, end);
    };
    { posts = page; total };
  };

  // Find a single published post by slug. Returns null for draft or
  // nonexistent slugs.
  public func getPostBySlug(posts : List.List<Types.BlogPost>, slug : Text) : ?Types.BlogPost {
    posts.find(func(post : Types.BlogPost) : Bool { post.slug == slug and post.isPublished });
  };

  // Return all posts (published + draft) ordered by createdAt descending,
  // for the admin dashboard.
  public func listAllPosts(posts : List.List<Types.BlogPost>) : [Types.BlogPost] {
    let snapshot = posts.toArray();
    let sorted = snapshot.sort(func(a : Types.BlogPost, b : Types.BlogPost) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
    sorted;
  };

  // Create a new post, assigning the next id and the current timestamp.
  // Traps if a post with the same slug already exists.
  public func createPost(
    posts : List.List<Types.BlogPost>,
    state : Types.BlogState,
    input : Types.CreateBlogPostInput,
    createdAt : Common.Timestamp,
  ) : Types.BlogPost {
    if (posts.find(func(post : Types.BlogPost) : Bool { post.slug == input.slug }) != null) {
      Runtime.trap("A post with this slug already exists");
    };
    let id = state.nextId;
    state.nextId := state.nextId + 1;
    let post : Types.BlogPost = {
      id;
      slug = input.slug;
      title = input.title;
      excerpt = input.excerpt;
      content = input.content;
      coverImage = input.coverImage;
      category = input.category;
      readTime = input.readTime;
      author = input.author;
      isPublished = input.isPublished;
      createdAt;
    };
    posts.add(post);
    post;
  };

  // Update an existing post's fields. Returns the updated post, or null if
  // no post matches the id. Traps if the new slug collides with another post.
  public func updatePost(
    posts : List.List<Types.BlogPost>,
    id : Types.BlogPostId,
    input : Types.UpdateBlogPostInput,
  ) : ?Types.BlogPost {
    switch (posts.find(func(post : Types.BlogPost) : Bool { post.id == id })) {
      case (?found) {
        if (
          posts.find(func(post : Types.BlogPost) : Bool {
            post.id != id and post.slug == input.slug;
          }) != null
        ) {
          Runtime.trap("A different post with this slug already exists");
        };
        let updated : Types.BlogPost = {
          id = found.id;
          slug = input.slug;
          title = input.title;
          excerpt = input.excerpt;
          content = input.content;
          coverImage = input.coverImage;
          category = input.category;
          readTime = input.readTime;
          author = input.author;
          isPublished = input.isPublished;
          createdAt = found.createdAt;
        };
        let snapshot = posts.toArray();
        posts.clear();
        for (post in snapshot.values()) {
          if (post.id == id) {
            posts.add(updated);
          } else {
            posts.add(post);
          };
        };
        ?updated;
      };
      case null { null };
    };
  };

  // Delete a post by id. Returns true if a post was removed.
  public func deletePost(posts : List.List<Types.BlogPost>, id : Types.BlogPostId) : Bool {
    var removed = false;
    let snapshot = posts.toArray();
    posts.clear();
    for (post in snapshot.values()) {
      if (post.id == id) {
        removed := true;
      } else {
        posts.add(post);
      };
    };
    removed;
  };

  // Return sitemap entries for every published post (isPublished==true),
  // each carrying slug, category, and lastmod (createdAt — BlogPost has no
  // updatedAt field, so createdAt is the most recent known modification
  // time). Ordered by createdAt descending to mirror listPublishedPosts.
  // Drafts and unpublished posts are excluded so they never appear in the
  // public sitemap.
  public func listPostSitemapEntries(posts : List.List<Types.BlogPost>) : [Types.PostSitemapEntry] {
    let snapshot = posts.toArray();
    let published = snapshot.filter(func(post : Types.BlogPost) : Bool { post.isPublished });
    let sorted = published.sort(func(a : Types.BlogPost, b : Types.BlogPost) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
    sorted.map(func(post : Types.BlogPost) : Types.PostSitemapEntry {
      {
        slug = post.slug;
        category = post.category;
        lastmod = post.createdAt;
      };
    });
  };
};
