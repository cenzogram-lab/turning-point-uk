import { u as useActor, r as reactExports, E as ExternalBlob, c as createActor } from "./index-D0j-3k0D.js";
const ACCEPTED_COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp"
];
const ACCEPTED_COVER_EXTENSIONS = ".jpg,.jpeg,.png,.avif,.webp";
const MAX_COVER_BYTES = 15 * 1024 * 1024;
function validateCoverFile(file) {
  if (!ACCEPTED_COVER_TYPES.includes(
    file.type
  )) {
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
function useBlogUpload() {
  const { actor, isFetching } = useActor(createActor);
  const [file, setFile] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const selectFile = reactExports.useCallback((next) => {
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
  const reset = reactExports.useCallback(() => {
    setFile(null);
    setError(null);
    setProgress(null);
    setUploading(false);
  }, []);
  const upload = reactExports.useCallback(async () => {
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
        file.name
      ).withUploadProgress((pct) => setProgress(pct));
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
    upload
  };
}
export {
  ACCEPTED_COVER_EXTENSIONS as A,
  useBlogUpload as u
};
