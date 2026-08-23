import { ExternalBlob, createActor } from "@/backend";
import {
  BLOG_ADMIN_QUERY_KEY,
  BLOG_QUERY_KEY,
  type BlogPost,
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
  toBlogPost,
} from "@/types/blog";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * useBlogMutations — create / update / delete blog posts with
 * optimistic updates against the shared blog query caches.
 *
 * Each mutation:
 *   1. Cances in-flight blog queries (so no refetch overwrites the
 *      optimistic patch).
 *   2. Snapshots the current cache for rollback on error.
 *   3. Applies the optimistic change immediately.
 *   4. On success, replaces the optimistic entry with the server-confirmed
 *      record (re-normalized from the backend `ExternalBlob` response).
 *   5. On error, rolls back to the snapshot and re-throws so the UI can
 *      surface the failure (toast / inline error).
 *
 * `createBlogPost` takes the opaque object-storage proxy URL
 * (`coverImageUrl`) from `useBlogUpload` and rehydrates it into an
 * `ExternalBlob` via `ExternalBlob.fromURL()` before calling the backend
 * — the backend `createBlogPost(input)` expects an `ExternalBlob` in
 * `input.coverImage`, not a string.
 *
 * Mirrors `useGalleryMutations` but with slug-based records and the
 * paginated + admin + slug query caches.
 */

/**
 * Invalidate every blog list cache (paginated published pages + admin
 * all-posts) after a create/update/delete so the lists re-fetch with
 * the new state. Slug-keyed single-post queries are also invalidated
 * since a slug or content change affects the article page.
 */
function invalidateAllBlogCaches(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: BLOG_ADMIN_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ["blog", "slug"] });
}

export function useCreateBlogPost() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    BlogPost,
    Error,
    CreateBlogPostInput,
    { previous: BlogPost[] | undefined }
  >({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend actor not ready");
      const coverImage = ExternalBlob.fromURL(input.coverImageUrl);
      const created = await actor.createBlogPost({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        coverImage,
        category: input.category,
        readTime: input.readTime,
        author: input.author,
        isPublished: input.isPublished,
      });
      return toBlogPost(created);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: BLOG_ADMIN_QUERY_KEY });
      const previous =
        queryClient.getQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY);
      const optimistic: BlogPost = {
        id: Number.MAX_SAFE_INTEGER,
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        coverImageUrl: input.coverImageUrl,
        category: input.category,
        readTime: input.readTime,
        author: input.author,
        isPublished: input.isPublished,
        createdAt: Date.now(),
      };
      queryClient.setQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY, (old = []) => [
        optimistic,
        ...old,
      ]);
      return { previous };
    },
    onSuccess: (created) => {
      queryClient.setQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY, (old = []) => {
        // Replace the optimistic placeholder (max-id) with the real record.
        const without = old.filter((it) => it.id !== Number.MAX_SAFE_INTEGER);
        return [created, ...without];
      });
      invalidateAllBlogCaches(queryClient);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(BLOG_ADMIN_QUERY_KEY, ctx.previous);
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    BlogPost | null,
    Error,
    UpdateBlogPostInput,
    { previous: BlogPost[] | undefined }
  >({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend actor not ready");
      const { id, coverImageUrl, ...rest } = input;
      const coverImage = ExternalBlob.fromURL(coverImageUrl);
      const updated = await actor.updateBlogPost(BigInt(id), {
        ...rest,
        coverImage,
      });
      return updated ? toBlogPost(updated) : null;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: BLOG_ADMIN_QUERY_KEY });
      const previous =
        queryClient.getQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY);
      queryClient.setQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY, (old = []) =>
        old.map((it) =>
          it.id === input.id
            ? {
                ...it,
                slug: input.slug,
                title: input.title,
                excerpt: input.excerpt,
                content: input.content,
                coverImageUrl: input.coverImageUrl,
                category: input.category,
                readTime: input.readTime,
                author: input.author,
                isPublished: input.isPublished,
              }
            : it,
        ),
      );
      return { previous };
    },
    onSuccess: () => {
      invalidateAllBlogCaches(queryClient);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(BLOG_ADMIN_QUERY_KEY, ctx.previous);
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    number,
    { previous: BlogPost[] | undefined }
  >({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.deleteBlogPost(BigInt(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: BLOG_ADMIN_QUERY_KEY });
      const previous =
        queryClient.getQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY);
      queryClient.setQueryData<BlogPost[]>(BLOG_ADMIN_QUERY_KEY, (old = []) =>
        old.filter((it) => it.id !== id),
      );
      return { previous };
    },
    onSuccess: () => {
      invalidateAllBlogCaches(queryClient);
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(BLOG_ADMIN_QUERY_KEY, ctx.previous);
    },
  });
}
