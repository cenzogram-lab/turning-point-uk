import { ExternalBlob, createActor } from "@/backend";
import {
  type CreateGalleryItemInput,
  DEFAULT_GALLERY_CATEGORY,
  GALLERY_QUERY_KEY,
  type GalleryItem,
  type UpdateGalleryItemInput,
  toGalleryItem,
} from "@/types/gallery";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * useGalleryMutations — create / update / delete gallery items with
 * optimistic updates against the shared `GALLERY_QUERY_KEY` cache.
 *
 * Each mutation:
 *   1. Cancels in-flight gallery queries (so no refetch overwrites the
 *      optimistic patch).
 *   2. Snapshots the current cache for rollback on error.
 *   3. Applies the optimistic change immediately.
 *   4. On success, replaces the optimistic entry with the server-confirmed
 *      record (re-normalized from the backend `ExternalBlob` response).
 *   5. On error, rolls back to the snapshot and re-throws so the UI can
 *      surface the failure (toast / inline error).
 *
 * `createGalleryItem` takes the opaque object-storage proxy URL
 * (`imageUrl`) from `useGalleryUpload` and rehydrates it into an
 * `ExternalBlob` via `ExternalBlob.fromURL()` before calling the backend
 * — the backend `createGalleryItem(image, title, description, eventDate,
 * category)` expects an `ExternalBlob`, an optional nanosecond `Timestamp`,
 * and a `category` Text.
 *
 * Field conversion: the frontend `CreateGalleryItemInput.eventDate` and
 * `UpdateGalleryItemInput.eventDate` are millisecond numbers (or
 * `undefined`/`null` for update); the backend expects nanosecond `bigint`
 * or `null`.
 * `msToNs` converts. For create, an omitted/undefined `eventDate` is passed
 * as `null` (no existing value to preserve). For update, `eventDate` is
 * three-valued: `number` sets it, `null` explicitly clears it, and
 * `undefined` (omitted) preserves the existing value. The backend
 * `updateItem` overwrites `eventDate` unconditionally — `null` clears it,
 * there is no native "preserve" — so when the caller omits `eventDate` the
 * hook reads the current item from the `GALLERY_QUERY_KEY` cache and passes
 * its `eventDate` through (converted to ns), preventing silent data loss.
 * `category` defaults to 'Uncategorized' on create when omitted or empty;
 * on update an empty string is passed through so the backend preserves the
 * existing value.
 */

/** Converts a millisecond timestamp to a backend nanosecond bigint. */
function msToNs(ms: number): bigint {
  return BigInt(Math.trunc(ms)) * 1_000_000n;
}

export function useCreateGalleryItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    GalleryItem,
    Error,
    CreateGalleryItemInput,
    { previous: GalleryItem[] | undefined }
  >({
    mutationFn: async ({
      imageUrl,
      title,
      description,
      eventDate,
      category,
    }) => {
      if (!actor) throw new Error("Backend actor not ready");
      const image = ExternalBlob.fromURL(imageUrl);
      const eventDateNs =
        typeof eventDate === "number" ? msToNs(eventDate) : null;
      const resolvedCategory = category || DEFAULT_GALLERY_CATEGORY;
      const created = await actor.createGalleryItem(
        image,
        title,
        description,
        eventDateNs,
        resolvedCategory,
      );
      return toGalleryItem(created);
    },
    onMutate: async ({ imageUrl, title, description, eventDate, category }) => {
      await queryClient.cancelQueries({ queryKey: GALLERY_QUERY_KEY });
      const previous =
        queryClient.getQueryData<GalleryItem[]>(GALLERY_QUERY_KEY);
      const optimistic: GalleryItem = {
        id: Number.MAX_SAFE_INTEGER,
        imageUrl,
        title,
        description,
        createdAt: Date.now(),
        eventDate,
        category: category || DEFAULT_GALLERY_CATEGORY,
      };
      queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (old = []) => [
        optimistic,
        ...old,
      ]);
      return { previous };
    },
    onSuccess: (created) => {
      queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (old = []) => {
        // Replace the optimistic placeholder (max-id) with the real record.
        const without = old.filter((it) => it.id !== Number.MAX_SAFE_INTEGER);
        return [created, ...without];
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(GALLERY_QUERY_KEY, ctx.previous);
    },
  });
}

export function useUpdateGalleryItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    GalleryItem | null,
    Error,
    UpdateGalleryItemInput,
    { previous: GalleryItem[] | undefined }
  >({
    mutationFn: async ({ id, title, description, eventDate, category }) => {
      if (!actor) throw new Error("Backend actor not ready");
      // eventDate is three-valued: number sets, null clears, undefined
      // preserves. The backend updateItem overwrites eventDate
      // unconditionally (null clears it; there is no native "preserve"),
      // so when the caller omits eventDate we read the current item from
      // the gallery cache and pass its eventDate through to avoid silent
      // data loss.
      let eventDateNs: bigint | null;
      if (typeof eventDate === "number") {
        eventDateNs = msToNs(eventDate);
      } else if (eventDate === null) {
        eventDateNs = null;
      } else {
        const cached = queryClient
          .getQueryData<GalleryItem[]>(GALLERY_QUERY_KEY)
          ?.find((it) => it.id === id);
        eventDateNs =
          cached && typeof cached.eventDate === "number"
            ? msToNs(cached.eventDate)
            : null;
      }
      const resolvedCategory = category ?? "";
      const updated = await actor.updateGalleryItem(
        BigInt(id),
        title,
        description,
        eventDateNs,
        resolvedCategory,
      );
      return updated ? toGalleryItem(updated) : null;
    },
    onMutate: async ({ id, title, description, eventDate, category }) => {
      await queryClient.cancelQueries({ queryKey: GALLERY_QUERY_KEY });
      const previous =
        queryClient.getQueryData<GalleryItem[]>(GALLERY_QUERY_KEY);
      queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (old = []) =>
        old.map((it) =>
          it.id === id
            ? {
                ...it,
                title,
                description,
                // number sets, null clears (coerce to undefined for the
                // GalleryItem cache, which uses undefined for "no event
                // date"), undefined preserves (omit the key so the cached
                // eventDate is retained).
                ...(eventDate !== undefined
                  ? { eventDate: eventDate ?? undefined }
                  : {}),
                ...(category !== undefined ? { category } : {}),
              }
            : it,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(GALLERY_QUERY_KEY, ctx.previous);
    },
  });
}

export function useDeleteGalleryItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    number,
    { previous: GalleryItem[] | undefined }
  >({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.deleteGalleryItem(BigInt(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: GALLERY_QUERY_KEY });
      const previous =
        queryClient.getQueryData<GalleryItem[]>(GALLERY_QUERY_KEY);
      queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (old = []) =>
        old.filter((it) => it.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(GALLERY_QUERY_KEY, ctx.previous);
    },
  });
}
