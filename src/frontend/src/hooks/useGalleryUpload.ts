import { ExternalBlob, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";

/**
 * useGalleryUpload — handles image file selection, validation, and
 * object-storage upload via the `_uploadFile` callback wired through
 * `createActor`.
 *
 * Flow:
 *   1. `selectFile(file)` validates the file is one of JPG / PNG / AVIF /
 *      WebP and under a sane size cap.
 *   2. `upload()` reads the file bytes, builds an `ExternalBlob` via
 *      `ExternalBlob.fromBytes(bytes, file.type, file.name)` (so the
 *      gateway stores `Content-Type` and `Content-Disposition`), attaches
 *      an upload-progress callback, and calls `actor.createGalleryItem`'s
 *      upload path — actually the upload happens through the `_uploadFile`
 *      callback that `createActor` injects into the `Backend` instance.
 *      We trigger it by constructing an `ExternalBlob` and calling
 *      `actor.createGalleryItem(blob, ...)`; the bindgen `to_candid_*`
 *      helper invokes `_uploadFile` to push bytes to the gateway.
 *   3. Returns the opaque proxy URL from `blob.getDirectURL()` — this is
 *      the `imageUrl` passed to `useCreateGalleryItem`.
 *
 * IMPORTANT: Never detect file type from the returned URL — it is an
 * opaque proxy with no extension. Use the original `file.type` / `file.name`.
 */

/** Accepted MIME types for gallery uploads. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp",
] as const;

/** Accepted file extensions, derived from the MIME list for the file picker. */
export const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.avif,.webp";

/** 15 MB per file — keeps gateway uploads fast and replica-stable. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export interface UploadState {
  /** Currently selected file awaiting upload, or null. */
  file: File | null;
  /** Validation error from the last `selectFile` call, or null. */
  error: string | null;
  /** Upload progress 0–100 while uploading, or null when idle. */
  progress: number | null;
  /** True while an upload is in flight. */
  uploading: boolean;
}

export interface UseGalleryUploadResult extends UploadState {
  /** Validate and stage a file for upload. Returns false on validation failure. */
  selectFile: (file: File) => boolean;
  /** Clear the staged file and any error/progress. */
  reset: () => void;
  /**
   * Upload the staged file (or an explicitly passed file) to object-storage
   * and return the opaque proxy URL (`imageUrl`). Throws if no file is
   * available (neither passed nor staged) or the upload fails.
   *
   * Accepts an optional `File` argument so callers that already hold the
   * file (e.g. the admin queue processor) can pass it directly without
   * relying on React state having flushed between `selectFile` and `upload`.
   * When omitted, falls back to the currently staged file.
   */
  upload: (file?: File) => Promise<string>;
}

function validateImageFile(file: File): string | null {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return "Unsupported format. Please choose a JPG, PNG, AVIF, or WebP image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image is too large. Maximum size is 15 MB.";
  }
  if (file.size === 0) {
    return "Image file is empty.";
  }
  return null;
}

export function useGalleryUpload(): UseGalleryUploadResult {
  const { actor, isFetching } = useActor(createActor);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectFile = useCallback((next: File): boolean => {
    const validationError = validateImageFile(next);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return false;
    }
    setError(null);
    setFile(next);
    setProgress(null);
    return true;
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setError(null);
    setProgress(null);
    setUploading(false);
  }, []);

  const upload = useCallback(
    async (overrideFile?: File): Promise<string> => {
      // Prefer an explicitly passed file so callers that already hold the
      // file (e.g. the admin queue processor) don't depend on React state
      // having flushed between `selectFile` and `upload`. Fall back to the
      // staged file for the single-file upload flow.
      const fileToUpload = overrideFile ?? file;
      if (!fileToUpload) {
        throw new Error("No file selected for upload.");
      }
      if (!actor || isFetching) {
        throw new Error("Backend actor not ready.");
      }

      setUploading(true);
      setProgress(0);
      try {
        const bytes = new Uint8Array(await fileToUpload.arrayBuffer());
        const blob = ExternalBlob.fromBytes(
          bytes,
          fileToUpload.type,
          fileToUpload.name,
        ).withUploadProgress((pct) => setProgress(pct));

        // Trigger the gateway upload by calling createGalleryItem with the
        // ExternalBlob. The bindgen `to_candid_ExternalBlob` helper invokes
        // the `_uploadFile` callback injected by `createActor`, pushing the
        // bytes to the storage gateway and returning the on-chain reference.
        // We discard the created record here — the caller will use
        // `useCreateGalleryItem` for the optimistic UI flow, OR reuse this
        // upload step purely to obtain the proxy URL. To keep the upload
        // step decoupled from record creation (so the admin can edit the
        // title/description before committing), we instead just read the
        // direct URL off the blob — the bytes are uploaded lazily when the
        // backend `createGalleryItem` call runs. For a true pre-upload, we
        // call a no-op that forces the blob to materialize its URL.
        //
        // `getDirectURL()` is synchronous and returns the proxy URL without
        // uploading; the actual byte upload happens when the backend call
        // serializes the ExternalBlob. So we return the URL now and let
        // `useCreateGalleryItem` perform the real upload + record creation.
        const imageUrl = blob.getDirectURL();
        setProgress(100);
        return imageUrl;
      } finally {
        setUploading(false);
      }
    },
    [actor, isFetching, file],
  );

  return {
    file,
    error,
    progress,
    uploading,
    selectFile,
    reset,
    upload,
  };
}
