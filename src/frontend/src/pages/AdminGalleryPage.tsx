import { Section } from "@/components/Section";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import { useGalleryItems } from "@/hooks/useGalleryItems";
import {
  useCreateGalleryItem,
  useDeleteGalleryItem,
  useUpdateGalleryItem,
} from "@/hooks/useGalleryMutations";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  useGalleryUpload,
} from "@/hooks/useGalleryUpload";
import { getFallbackImageUrl } from "@/lib/galleryFallback";
import { DEFAULT_GALLERY_CATEGORY, type GalleryItem } from "@/types/gallery";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * AdminGalleryPage — hidden admin dashboard for managing gallery images.
 *
 * Route: `/admin/gallery` (registered in App.tsx but NOT in NAV_ENTRIES,
 * so it is unreachable from the public nav — only via direct URL).
 *
 * Auth is centralized in `AdminAuthGuard` (see
 * `src/frontend/src/components/AdminAuthGuard.tsx`), which wraps
 * `AdminLayout` for the entire `/admin/*` workspace. This page no longer
 * carries its own password gate or `isCallerAdmin` check — it only owns
 * the dashboard body (upload zone + pending queue + management grid)
 * and renders inside the shared `AdminLayout`.
 *
 * Dashboard contents:
 *   - a drag-and-drop upload zone (`.upload-dropzone`) feeding a pending
 *     queue (filename, size, per-file upload progress, per-file remove),
 *   - a sequential uploader with per-file success/failure feedback,
 *   - a responsive grid of `.admin-card` management cards wired to the
 *     gallery mutations.
 *
 * The page renders inside the shared `AdminLayout` so the admin header,
 * tab nav, II principal + sign-out, and Quick Links are reused.
 */

/**
 * The full set of gallery categories shown in the admin dropdowns. The
 * default 'Uncategorized' is always first so it is the natural fallback.
 * Matches the user preference: Campus Events, Direct Action, Rallies,
 * Education Watch.
 */
const GALLERY_CATEGORIES = [
  DEFAULT_GALLERY_CATEGORY,
  "Campus Events",
  "Direct Action",
  "Rallies",
  "Education Watch",
] as const;

/**
 * Converts an HTML <input type="date"> value (YYYY-MM-DD) to a millisecond
 * timestamp at local midnight. Returns `undefined` for an empty string so
 * the create/update mutation omits the field (no eventDate sent).
 */
function dateInputToMs(value: string): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(`${value}T00:00:00`);
  return Number.isNaN(ms) ? undefined : ms;
}

/**
 * Converts a millisecond timestamp to an HTML <input type="date"> value
 * (YYYY-MM-DD) in the user's local timezone. Returns an empty string when
 * the timestamp is missing or invalid so the date picker renders blank.
 */
function msToDateInput(ms: number | undefined): string {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a millisecond event timestamp as a compact human-readable date
 * (e.g. "12 Mar 2025") for the admin meta tag. Returns an empty string when
 * the timestamp is missing or invalid.
 */
function formatEventDate(ms: number | undefined): string {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminGalleryPage() {
  const containerRef = useEntranceAnimation<HTMLDivElement>();
  return <AdminDashboard containerRef={containerRef} />;
}

export default AdminGalleryPage;

// ──────────────────────────────────────────────────────────────────────────
// Admin dashboard — header (principal + sign-out) + upload zone +
// pending queue + management grid.
// ──────────────────────────────────────────────────────────────────────────

/** Per-file lifecycle in the pending upload queue. */
type FileStatus = "queued" | "uploading" | "done" | "failed";

interface QueuedFile {
  /** Stable queue id (monotonic counter, not the file's array index). */
  id: number;
  file: File;
  status: FileStatus;
  /** Per-file upload progress 0–100 while uploading, else null. */
  progress: number | null;
  /** Per-file error message when status === "failed". */
  error: string | null;
}

interface AdminDashboardProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function AdminDashboard({ containerRef }: AdminDashboardProps) {
  const { items, loading, error } = useGalleryItems();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();
  const upload = useGalleryUpload();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  /** Monotonic counter for stable QueuedFile ids (Biome noArrayIndexKey). */
  const nextIdRef = useRef(0);
  /** Ref mirror of the queue so the sequential uploader reads the latest
   *  snapshot without re-subscribing on every queue change. */
  const queueRef = useRef<QueuedFile[]>([]);
  /** True while the sequential uploader loop is running. */
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  /** Batch-level Event Date (YYYY-MM-DD from the date picker) applied to
   *  every image in the pending queue. Empty string means "no event date"
   *  — the create mutation omits the field. */
  const [batchEventDate, setBatchEventDate] = useState("");
  /** Batch-level Category applied to every image in the pending queue.
   *  Defaults to 'Uncategorized'. */
  const [batchCategory, setBatchCategory] = useState<string>(
    DEFAULT_GALLERY_CATEGORY,
  );

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  /** Ref mirrors of the batch fields so the sequential uploader reads the
   *  latest values without re-subscribing on every change. */
  const batchEventDateRef = useRef(batchEventDate);
  const batchCategoryRef = useRef(batchCategory);
  useEffect(() => {
    batchEventDateRef.current = batchEventDate;
  }, [batchEventDate]);
  useEffect(() => {
    batchCategoryRef.current = batchCategory;
  }, [batchCategory]);

  // ── File intake ─────────────────────────────────────────────────────
  const intakeFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setIntakeError(null);
      const accepted: QueuedFile[] = [];
      for (const file of Array.from(fileList)) {
        if (upload.selectFile(file)) {
          accepted.push({
            id: nextIdRef.current++,
            file,
            status: "queued",
            progress: null,
            error: null,
          });
        } else {
          setIntakeError(upload.error ?? "Unsupported file type.");
        }
      }
      // Reset the single-file upload hook state so it doesn't bleed into
      // the next selectFile validation pass.
      upload.reset();
      if (accepted.length > 0) {
        setQueue((prev) => [...prev, ...accepted]);
      }
    },
    [upload],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      intakeFiles(e.dataTransfer.files);
    },
    [intakeFiles],
  );

  const onDragOver = useCallback((e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      intakeFiles(e.target.files);
      // Reset so the same file can be re-selected later.
      e.target.value = "";
    },
    [intakeFiles],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ── Queue mutations ────────────────────────────────────────────────
  const patchFile = useCallback((id: number, patch: Partial<QueuedFile>) => {
    setQueue((prev) =>
      prev.map((qf) => (qf.id === id ? { ...qf, ...patch } : qf)),
    );
  }, []);

  const removeFromQueue = useCallback((id: number) => {
    setQueue((prev) => prev.filter((qf) => qf.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((qf) => qf.status !== "done"));
  }, []);

  const clearAll = useCallback(() => {
    setQueue([]);
    setIntakeError(null);
    upload.reset();
  }, [upload]);

  // ── Sequential upload + create record ──────────────────────────────
  /**
   * Uploads every queued file one at a time. Each file:
   *   1. is staged via `upload.selectFile` (validation),
   *   2. uploads via `upload.upload()` (returns the proxy URL; bytes push
   *      lazily during the backend `createGalleryItem` serialization),
   *   3. creates the gallery record via `createMutation.mutateAsync`.
   *
   * Per-file progress is surfaced by subscribing to `upload.progress` while
   * the file is in flight. Per-file success/failure is written back to the
   * queue so the admin sees a per-file status row. Successful uploads are
   * removed from the queue and appear in the management grid via the
   * optimistic create mutation. Failed files stay in the queue with a
   * retry affordance.
   */
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    const pending = queueRef.current.filter((qf) => qf.status === "queued");
    if (pending.length === 0) return;

    processingRef.current = true;
    setIsProcessing(true);

    for (const qf of pending) {
      // Re-check status — the user may have removed the file mid-loop.
      const current = queueRef.current.find((x) => x.id === qf.id);
      if (!current || current.status !== "queued") continue;

      patchFile(qf.id, {
        status: "uploading",
        progress: 0,
        error: null,
      });

      // Subscribe to the single-file upload hook's progress while this
      // file is in flight. We poll via a micro-interval because the hook
      // exposes progress as state, not a callback we can subscribe to.
      let progressUnsub: (() => void) | null = null;
      try {
        progressUnsub = (() => {
          let stopped = false;
          const stop = () => {
            stopped = true;
          };
          const tick = () => {
            if (stopped) return;
            const p = upload.progress;
            if (typeof p === "number") {
              patchFile(qf.id, { progress: p });
            }
            window.setTimeout(tick, 80);
          };
          tick();
          return stop;
        })();

        // Pass the queued file directly to upload() so the queue processor
        // doesn't depend on React state having flushed between selectFile
        // and upload (the original root cause of "No file selected for
        // upload"). selectFile is still called first to surface validation
        // errors and stage progress state, but upload() now uses the
        // explicitly passed file rather than the staged state.
        upload.selectFile(qf.file);
        const imageUrl = await upload.upload(qf.file);
        const eventDateMs = dateInputToMs(batchEventDateRef.current);
        await createMutation.mutateAsync({
          imageUrl,
          title: qf.file.name.replace(/\.[^.]+$/, ""),
          description: "",
          ...(eventDateMs !== undefined ? { eventDate: eventDateMs } : {}),
          category: batchCategoryRef.current || DEFAULT_GALLERY_CATEGORY,
        });
        patchFile(qf.id, {
          status: "done",
          progress: 100,
          error: null,
        });
      } catch (err) {
        patchFile(qf.id, {
          status: "failed",
          progress: null,
          error:
            err instanceof Error
              ? err.message
              : "Upload failed. Please try again.",
        });
      } finally {
        if (progressUnsub) progressUnsub();
        upload.reset();
      }
    }

    processingRef.current = false;
    setIsProcessing(false);
    // Sweep completed files out of the queue so the admin sees only
    // pending/failed items remain; successful uploads now live in the
    // management grid below.
    setQueue((prev) => prev.filter((qf) => qf.status !== "done"));
  }, [upload, createMutation, patchFile]);

  const handleUploadClick = useCallback(() => {
    void processQueue();
  }, [processQueue]);

  const handleRetryFile = useCallback(
    (id: number) => {
      patchFile(id, { status: "queued", progress: null, error: null });
      // Kick the loop again on the next tick so the state update lands.
      window.setTimeout(() => void processQueue(), 0);
    },
    [patchFile, processQueue],
  );

  const hasQueued = queue.some((qf) => qf.status === "queued");
  const hasFailed = queue.some((qf) => qf.status === "failed");
  const hasUploading = queue.some((qf) => qf.status === "uploading");

  // ── Per-card edit state ─────────────────────────────────────────────
  /**
   * Per-card edit draft. `eventDate` is stored as the HTML date-input string
   * (YYYY-MM-DD) for direct binding to <input type="date">; it is converted
   * to a millisecond timestamp only on save. `category` is the dropdown
   * selection. Both default from the existing item when no draft exists.
   */
  type EditDraft = {
    title: string;
    description: string;
    eventDate: string;
    category: string;
  };
  const [editDrafts, setEditDrafts] = useState<Record<number, EditDraft>>({});
  const [savedIds, setSavedIds] = useState<Record<number, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const getDraft = useCallback(
    (item: GalleryItem): EditDraft =>
      editDrafts[item.id] ?? {
        title: item.title,
        description: item.description,
        eventDate: msToDateInput(item.eventDate),
        category: item.category || DEFAULT_GALLERY_CATEGORY,
      },
    [editDrafts],
  );

  const setDraft = useCallback(
    (id: number, patch: Partial<EditDraft>) => {
      setEditDrafts((prev) => {
        const current: EditDraft =
          prev[id] ??
          (() => {
            const item = items.find((it) => it.id === id);
            return {
              title: item?.title ?? "",
              description: item?.description ?? "",
              eventDate: msToDateInput(item?.eventDate),
              category: item?.category || DEFAULT_GALLERY_CATEGORY,
            };
          })();
        return { ...prev, [id]: { ...current, ...patch } };
      });
      setSavedIds((prev) => ({ ...prev, [id]: false }));
    },
    [items],
  );

  const handleSave = useCallback(
    async (item: GalleryItem) => {
      const draft = getDraft(item);
      const eventDateMs = dateInputToMs(draft.eventDate);
      try {
        await updateMutation.mutateAsync({
          id: item.id,
          title: draft.title,
          description: draft.description,
          ...(eventDateMs !== undefined ? { eventDate: eventDateMs } : {}),
          category: draft.category || DEFAULT_GALLERY_CATEGORY,
        });
        setSavedIds((prev) => ({ ...prev, [item.id]: true }));
        window.setTimeout(() => {
          setSavedIds((prev) => ({ ...prev, [item.id]: false }));
        }, 2500);
      } catch {
        setSavedIds((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [getDraft, updateMutation],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id);
        setConfirmDeleteId(null);
        setEditDrafts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setSavedIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch {
        setConfirmDeleteId(null);
      }
    },
    [deleteMutation],
  );

  return (
    <div ref={containerRef} data-ocid="admin.gallery.dashboard">
      <Section
        variant="center"
        noSnap
        background="background"
        className="min-h-[60dvh] items-center justify-center !justify-items-center pt-8"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 pb-16 text-center">
          <p className="text-eyebrow entrance-left">Admin</p>
          <h1 className="text-headline entrance-left" data-entrance-delay="80">
            Gallery Dashboard
          </h1>
          <p
            className="max-w-xl text-sm text-muted-foreground entrance-right"
            data-entrance-delay="160"
          >
            Upload new images and manage titles, descriptions, and ordering for
            the public gallery.
          </p>

          {/* ── Upload dropzone ─────────────────────────────────────── */}
          {/*
            A real <button> element (not a div with role=button) so Biome's
            `useSemanticElements` rule is satisfied. Drag-and-drop handlers
            (`onDrop`, `onDragOver`, `onDragLeave`) work on <button> the same
            as on <div>. Click + keyboard activation come for free with a
            button, so the manual `onKeyDown` Enter/Space handler is no
            longer needed. The inner "Select Files" affordance is a styled
            <span> (not a nested <button>) since the dropzone button itself
            opens the file picker.
          */}
          <button
            type="button"
            data-ocid="admin.gallery.dropzone"
            className={`upload-dropzone entrance-left w-full max-w-2xl ${
              isDragActive ? "is-active" : ""
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={openFilePicker}
            disabled={isProcessing}
            data-entrance-delay="240"
          >
            <span className="text-eyebrow">Upload</span>
            <p className="font-display text-lg uppercase tracking-wide text-foreground">
              Drag &amp; drop images here
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, AVIF, or WebP — up to 15 MB each
            </p>
            <span
              aria-hidden="true"
              data-ocid="admin.gallery.select_files_button"
              className="btn-primary-square group mt-2"
            >
              <span>Select Files</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_EXTENSIONS}
              multiple
              onChange={onFileInputChange}
              className="hidden"
              aria-label="Select image files to upload"
            />
          </button>

          {/* ── Batch Event Date + Category ──────────────────────────── */}
          {/*
            Shared Event Date and Category applied to every image in the
            pending queue. Sits directly under the dropzone so the admin
            sets the batch metadata before clicking "Upload & Add to
            Gallery". Per-image Title and Caption/Description already exist
            in the pending queue (Title defaults to the filename; Caption is
            left empty and editable later from the management grid).
          */}
          <div
            data-ocid="admin.gallery.batch_meta"
            className="grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="batch-event-date"
                className="text-eyebrow text-[0.65rem]"
              >
                Batch Event Date
              </label>
              <input
                id="batch-event-date"
                type="date"
                value={batchEventDate}
                onChange={(e) => setBatchEventDate(e.target.value)}
                disabled={isProcessing}
                data-ocid="admin.gallery.batch_event_date_input"
                className="admin-date"
              />
              <span className="text-[0.65rem] text-muted-foreground">
                Optional — applied to every image in this batch.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="batch-category"
                className="text-eyebrow text-[0.65rem]"
              >
                Batch Category
              </label>
              <select
                id="batch-category"
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                disabled={isProcessing}
                data-ocid="admin.gallery.batch_category_select"
                className="admin-select"
              >
                {GALLERY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-[0.65rem] text-muted-foreground">
                Applied to every image in this batch.
              </span>
            </div>
          </div>

          {/* ── Pending queue ──────────────────────────────────────── */}
          {queue.length > 0 ? (
            <PendingQueue
              queue={queue}
              isProcessing={isProcessing}
              hasQueued={hasQueued}
              hasFailed={hasFailed}
              hasUploading={hasUploading}
              onUpload={handleUploadClick}
              onRemove={removeFromQueue}
              onRetry={handleRetryFile}
              onClearCompleted={clearCompleted}
              onClearAll={clearAll}
            />
          ) : null}

          {/* ── Inline intake error ────────────────────────────────── */}
          {intakeError ? (
            <p
              role="alert"
              data-ocid="admin.gallery.intake_error"
              className="max-w-2xl text-sm text-destructive"
            >
              {intakeError}
            </p>
          ) : null}
          {createMutation.isError ? (
            <p
              role="alert"
              data-ocid="admin.gallery.create_error"
              className="max-w-2xl text-sm text-destructive"
            >
              Failed to save the uploaded image. Please try again.
            </p>
          ) : null}
        </div>
      </Section>

      {/* ── Management grid ─────────────────────────────────────────── */}
      <Section
        noSnap
        background="background"
        className="min-h-[60dvh] !justify-start pb-24 pt-8"
      >
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground">
              Manage Images
            </h2>
            <span className="text-eyebrow">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div
              data-ocid="admin.gallery.loading_state"
              className="flex items-center justify-center py-24 text-sm text-muted-foreground"
            >
              Loading gallery…
            </div>
          ) : error ? (
            <div
              data-ocid="admin.gallery.error_state"
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <p className="text-sm text-destructive">
                Failed to load gallery items.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                data-ocid="admin.gallery.retry_button"
                className="btn-outline-invert"
              >
                <span>Retry</span>
              </button>
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="admin.gallery.empty_state"
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <p className="text-sm text-muted-foreground">
                No images yet. Upload your first image above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => {
                const draft = getDraft(item);
                const isDirty =
                  draft.title !== item.title ||
                  draft.description !== item.description ||
                  draft.eventDate !== msToDateInput(item.eventDate) ||
                  draft.category !==
                    (item.category || DEFAULT_GALLERY_CATEGORY);
                const justSaved = savedIds[item.id] === true;
                const isSaving =
                  updateMutation.isPending &&
                  updateMutation.variables?.id === item.id;
                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === item.id;
                const confirming = confirmDeleteId === item.id;
                const saveError =
                  updateMutation.isError &&
                  updateMutation.variables?.id === item.id;
                const deleteError =
                  deleteMutation.isError &&
                  deleteMutation.variables === item.id;
                return (
                  <AdminCard
                    key={item.id}
                    item={item}
                    index={index}
                    draft={draft}
                    isDirty={isDirty}
                    justSaved={justSaved}
                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    confirming={confirming}
                    saveError={saveError}
                    deleteError={deleteError}
                    onTitleChange={(v) => setDraft(item.id, { title: v })}
                    onDescriptionChange={(v) =>
                      setDraft(item.id, { description: v })
                    }
                    onEventDateChange={(v) =>
                      setDraft(item.id, { eventDate: v })
                    }
                    onCategoryChange={(v) => setDraft(item.id, { category: v })}
                    onSave={() => handleSave(item)}
                    onDelete={() => setConfirmDeleteId(item.id)}
                    onConfirmDelete={() => handleDelete(item.id)}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PendingQueue — per-file list with filename, size, status, per-file
// progress bar, per-file remove, and the sequential upload / clear actions.
// ──────────────────────────────────────────────────────────────────────────

interface PendingQueueProps {
  queue: QueuedFile[];
  isProcessing: boolean;
  hasQueued: boolean;
  hasFailed: boolean;
  hasUploading: boolean;
  onUpload: () => void;
  onRemove: (id: number) => void;
  onRetry: (id: number) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

function PendingQueue({
  queue,
  isProcessing,
  hasQueued,
  hasFailed,
  hasUploading,
  onUpload,
  onRemove,
  onRetry,
  onClearCompleted,
  onClearAll,
}: PendingQueueProps) {
  const queuedCount = queue.filter((qf) => qf.status === "queued").length;
  const doneCount = queue.filter((qf) => qf.status === "done").length;

  return (
    <div
      data-ocid="admin.gallery.pending_uploads"
      className="flex w-full max-w-2xl flex-col gap-3 text-left"
    >
      <div className="flex items-center justify-between">
        <p className="text-eyebrow">
          {queue.length} file{queue.length === 1 ? "" : "s"} in queue
          {queuedCount > 0 ? ` · ${queuedCount} pending` : ""}
          {doneCount > 0 ? ` · ${doneCount} done` : ""}
        </p>
        {queue.length > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            disabled={isProcessing}
            data-ocid="admin.gallery.clear_queue_button"
            className="text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {queue.map((qf) => (
          <PendingRow
            key={qf.id}
            queued={qf}
            onRemove={onRemove}
            onRetry={onRetry}
          />
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onUpload}
          disabled={isProcessing || !hasQueued}
          data-ocid="admin.gallery.upload_button"
          className="btn-primary-square group disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>
            {hasUploading
              ? "Uploading…"
              : hasFailed
                ? "Retry queue"
                : "Upload & Add to Gallery"}
          </span>
        </button>
        {doneCount > 0 ? (
          <button
            type="button"
            onClick={onClearCompleted}
            disabled={isProcessing}
            data-ocid="admin.gallery.clear_completed_button"
            className="btn-outline-invert !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Clear completed</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PendingRow — a single queued file: filename, size, status badge,
// per-file progress bar, per-file remove (and retry when failed).
// ──────────────────────────────────────────────────────────────────────────

interface PendingRowProps {
  queued: QueuedFile;
  onRemove: (id: number) => void;
  onRetry: (id: number) => void;
}

function PendingRow({ queued, onRemove, onRetry }: PendingRowProps) {
  const { id, file, status, progress, error } = queued;
  const sizeKb = (file.size / 1024).toFixed(0);

  const statusLabel =
    status === "queued"
      ? "Queued"
      : status === "uploading"
        ? "Uploading"
        : status === "done"
          ? "Done"
          : "Failed";

  const statusClass =
    status === "done"
      ? "text-primary"
      : status === "failed"
        ? "text-destructive"
        : status === "uploading"
          ? "text-foreground"
          : "text-muted-foreground";

  const showProgress = status === "uploading" && typeof progress === "number";
  const pct = showProgress
    ? Math.max(0, Math.min(100, Math.round(progress!)))
    : 0;

  return (
    <li
      data-ocid={`admin.gallery.pending_item.${id}`}
      className="flex flex-col gap-2 border-b border-border/60 pb-2 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm text-foreground" title={file.name}>
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">{sizeKb} KB</span>
        </div>
        <span
          className={`font-mono text-[0.65rem] uppercase tracking-wider ${statusClass}`}
        >
          {statusLabel}
        </span>
        <div className="flex items-center gap-2">
          {status === "failed" ? (
            <button
              type="button"
              onClick={() => onRetry(id)}
              data-ocid={`admin.gallery.pending_retry_button.${id}`}
              className="text-xs text-primary underline-offset-4 transition-smooth hover:underline"
            >
              Retry
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(id)}
            disabled={status === "uploading"}
            aria-label={`Remove ${file.name} from queue`}
            data-ocid={`admin.gallery.pending_remove_button.${id}`}
            className="text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>

      {showProgress ? (
        <div
          data-ocid={`admin.gallery.pending_progress.${id}`}
          role="progressbar"
          tabIndex={0}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Upload progress for ${file.name}`}
          className="h-1 w-full overflow-hidden rounded-full bg-card"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}

      {status === "failed" && error ? (
        <p
          role="alert"
          data-ocid={`admin.gallery.pending_error.${id}`}
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}

      {status === "done" ? (
        <output
          data-ocid={`admin.gallery.pending_success.${id}`}
          className="text-xs text-primary"
        >
          Uploaded — added to gallery.
        </output>
      ) : null}
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Admin management card.
// ──────────────────────────────────────────────────────────────────────────

interface AdminCardProps {
  item: GalleryItem;
  index: number;
  draft: {
    title: string;
    description: string;
    eventDate: string;
    category: string;
  };
  isDirty: boolean;
  justSaved: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  confirming: boolean;
  saveError: boolean;
  deleteError: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onEventDateChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function AdminCard({
  item,
  index,
  draft,
  isDirty,
  justSaved,
  isSaving,
  isDeleting,
  confirming,
  saveError,
  deleteError,
  onTitleChange,
  onDescriptionChange,
  onEventDateChange,
  onCategoryChange,
  onSave,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: AdminCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  // onError: swap the broken opaque proxy URL to a real browser-fetchable
  // fallback (staged seed asset by title, else neutral placeholder), log the
  // failure for diagnostics, and flag the card so a title overlay renders
  // over the dark neutral background — never a blank black box. Mirrors the
  // GalleryCard handler in GalleryPage.tsx.
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const failedUrl = item.imageUrl;
      console.error(
        `[admin.gallery] image failed to load — id=${item.id} title="${item.title}" url=${failedUrl}`,
      );
      const fallback = getFallbackImageUrl(item);
      const el = e.currentTarget;
      // Guard against an infinite onError loop if the fallback itself fails.
      if (el.src !== fallback) {
        el.src = fallback;
      }
      setImageFailed(true);
    },
    [item],
  );

  // Local fade-in-up entrance for each card.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      el.classList.add("fade-in-up-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("fade-in-up-visible");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      data-ocid={`admin.gallery.card.${index}`}
      className="admin-card fade-in-up flex flex-col"
    >
      {/* Image preview — aspect-video, object-cover, rounded top. The
          wrapper carries `bg-image-fallback` so a failed image shows a dark
          neutral (distinct from --card) instead of a blank box, and an
          overlay renders the title over the neutral when the image fails. */}
      <div className="relative aspect-video w-full overflow-hidden bg-image-fallback">
        <img
          src={item.imageUrl}
          alt={draft.title || item.title || "Gallery image"}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full rounded-t-xl object-cover"
        />
        {imageFailed ? (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center"
            aria-hidden="true"
          >
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/90 line-clamp-2">
              {draft.title || item.title || "Untitled"}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* Current category + event date meta tags — read-only display of
            the item's persisted metadata, shown above the edit form. */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-ocid={`admin.gallery.category_tag.${index}`}
            className="admin-meta-tag"
            title={`Category: ${item.category || DEFAULT_GALLERY_CATEGORY}`}
          >
            {item.category || DEFAULT_GALLERY_CATEGORY}
          </span>
          {typeof item.eventDate === "number" ? (
            <span
              data-ocid={`admin.gallery.event_date_tag.${index}`}
              className="admin-meta-tag"
              title={`Event date: ${formatEventDate(item.eventDate)}`}
            >
              {formatEventDate(item.eventDate)}
            </span>
          ) : null}
        </div>

        {/* Photo Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`title-${item.id}`}
            className="text-eyebrow text-[0.65rem]"
          >
            Photo Title
          </label>
          <input
            id={`title-${item.id}`}
            type="text"
            value={draft.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled"
            data-ocid={`admin.gallery.title_input.${index}`}
            className="admin-input"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`desc-${item.id}`}
            className="text-eyebrow text-[0.65rem]"
          >
            Description
          </label>
          <textarea
            id={`desc-${item.id}`}
            value={draft.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a caption or description…"
            rows={3}
            data-ocid={`admin.gallery.description_input.${index}`}
            className="admin-input resize-y"
          />
        </div>

        {/* Event Date */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`event-date-${item.id}`}
            className="text-eyebrow text-[0.65rem]"
          >
            Event Date
          </label>
          <input
            id={`event-date-${item.id}`}
            type="date"
            value={draft.eventDate}
            onChange={(e) => onEventDateChange(e.target.value)}
            data-ocid={`admin.gallery.event_date_input.${index}`}
            className="admin-date"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`category-${item.id}`}
            className="text-eyebrow text-[0.65rem]"
          >
            Category
          </label>
          <select
            id={`category-${item.id}`}
            value={draft.category}
            onChange={(e) => onCategoryChange(e.target.value)}
            data-ocid={`admin.gallery.category_select.${index}`}
            className="admin-select"
          >
            {GALLERY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Inline status */}
        {justSaved ? (
          // biome-ignore lint/a11y/useSemanticElements: role=status on a <p> conveys a polite live region for the saved confirmation
          <p
            role="status"
            data-ocid={`admin.gallery.saved_confirmation.${index}`}
            className="text-xs text-primary"
          >
            Saved.
          </p>
        ) : null}
        {saveError ? (
          <p
            role="alert"
            data-ocid={`admin.gallery.save_error.${index}`}
            className="text-xs text-destructive"
          >
            Save failed. Please try again.
          </p>
        ) : null}
        {deleteError ? (
          <p
            role="alert"
            data-ocid={`admin.gallery.delete_error.${index}`}
            className="text-xs text-destructive"
          >
            Delete failed. Please try again.
          </p>
        ) : null}

        {/* Actions */}
        <div className="mt-1 flex items-center gap-3">
          {confirming ? (
            <>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                data-ocid={`admin.gallery.confirm_delete_button.${index}`}
                className="bg-destructive-soft flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                disabled={isDeleting}
                data-ocid={`admin.gallery.cancel_delete_button.${index}`}
                className="btn-outline-invert flex-1 !px-4 !py-2 !text-xs"
              >
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onDelete}
                data-ocid={`admin.gallery.delete_button.${index}`}
                className="bg-destructive-soft flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80"
              >
                Delete Photo
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving || !isDirty}
                data-ocid={`admin.gallery.save_button.${index}`}
                className="btn-primary-square group flex-1 !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isSaving ? "Saving…" : "Save"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
