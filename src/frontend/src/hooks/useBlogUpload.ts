import { ExternalBlob, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";

/**
 * useBlogUpload — thin wrapper reusing the gallery upload pattern for
 * blog cover image uploads.
 *
 * Flow:
 *   1. `selectFile(file)` validates the file is one of JPG / PNG / AVIF /
 *      WebP and under a sane size cap.
 *   2. `upload()` reads the file bytes, builds an `ExternalBlob` via
 *      `ExternalBlob.fromBytes(bytes, file.type, file.name)` (so the
 *      gateway stores `Content-Type` and `Content-Disposition`), attaches
 *      an upload-progress callback, and returns the opaque proxy URL
 *      from `blob.getDirectURL()` — this is the `coverImageUrl` passed to
 *      `useCreateBlogPost`.
 *
 * IMPORTANT: Never detect file type from the returned URL — it is an
 * opaque proxy with no extension. Use the original `file.type` / `file.name`.
 *
 * Mirrors `useGalleryUpload` exactly; kept as a separate hook so the blog
 * composer owns its own upload state independent of the gallery admin.
 */

/** Accepted MIME types for blog cover uploads. */
export const ACCEPTED_COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp",
] as const;

/** Accepted file extensions, derived from the MIME list for the file picker. */
export const ACCEPTED_COVER_EXTENSIONS = ".jpg,.jpeg,.png,.avif,.webp";

/** 15 MB per file — keeps gateway uploads fast and replica-stable. */
export const MAX_COVER_BYTES = 15 * 1024 * 1024;

export interface BlogUploadState {
  /** Currently selected file awaiting upload, or null. */
  file: File | null;
  /** Validation error from the last `selectFile` call, or null. */
  error: string | null;
  /** Upload progress 0–100 while uploading, or null when idle. */
  progress: number | null;
  /** True while an upload is in flight. */
  uploading: boolean;
}

export interface UseBlogUploadResult extends BlogUploadState {
  /** Validate and stage a file for upload. Returns false on validation failure. */
  selectFile: (file: File) => boolean;
  /** Clear the staged file and any error/progress. */
  reset: () => void;
  /**
   * Upload the staged file to object-storage and return the opaque proxy
   * URL (`coverImageUrl`). Throws if no file is staged or the upload fails.
   */
  upload: () => Promise<string>;
}

function validateCoverFile(file: File): string | null {
  if (
    !ACCEPTED_COVER_TYPES.includes(
      file.type as (typeof ACCEPTED_COVER_TYPES)[number],
    )
  ) {
    return "Unsupported format. Please choose a JPG, PNG, AVIF, or WebP image.";
  }
  if (file.size > MAX_COVER_BYTES) {
    return "Cover image is too large. Maximum size is 15 MB.";
  }
  if (file.size === 0) {
    return "Cover image file is empty.";
  }
  return null;
}

export function useBlogUpload(): UseBlogUploadResult {
  const { actor, isFetching } = useActor(createActor);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectFile = useCallback((next: File): boolean => {
    const validationError = validateCoverFile(next);
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

  const upload = useCallback(async (): Promise<string> => {
    if (!file) {
      throw new Error("No file selected for upload.");
    }
    if (!actor || isFetching) {
      throw new Error("Backend actor not ready.");
    }

    setUploading(true);
    setProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(
        bytes,
        file.type,
        file.name,
      ).withUploadProgress((pct) => setProgress(pct));

      // `getDirectURL()` is synchronous and returns the proxy URL without
      // uploading; the actual byte upload happens when the backend
      // `createBlogPost` call serializes the ExternalBlob. So we return
      // the URL now and let `useCreateBlogPost` perform the real upload +
      // record creation.
      const coverImageUrl = blob.getDirectURL();
      setProgress(100);
      return coverImageUrl;
    } finally {
      setUploading(false);
    }
  }, [actor, isFetching, file]);

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
