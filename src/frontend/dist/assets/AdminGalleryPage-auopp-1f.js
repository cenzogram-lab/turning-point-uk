import { u as useActor, r as reactExports, E as ExternalBlob, c as createActor, a as useEntranceAnimation, j as jsxRuntimeExports, b as useGalleryItems, d as useCreateGalleryItem, e as useUpdateGalleryItem, f as useDeleteGalleryItem, D as DEFAULT_GALLERY_CATEGORY, S as Section, g as getFallbackImageUrl } from "./index-Bit4PJ4S.js";
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp"
];
const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.avif,.webp";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
function validateImageFile(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(
    file.type
  )) {
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
function useGalleryUpload() {
  const { actor, isFetching } = useActor(createActor);
  const [file, setFile] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const selectFile = reactExports.useCallback((next) => {
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
  const reset = reactExports.useCallback(() => {
    setFile(null);
    setError(null);
    setProgress(null);
    setUploading(false);
  }, []);
  const upload = reactExports.useCallback(
    async (overrideFile) => {
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
          fileToUpload.name
        ).withUploadProgress((pct) => setProgress(pct));
        const imageUrl = blob.getDirectURL();
        setProgress(100);
        return imageUrl;
      } finally {
        setUploading(false);
      }
    },
    [actor, isFetching, file]
  );
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
const GALLERY_CATEGORIES = [
  DEFAULT_GALLERY_CATEGORY,
  "Campus Events",
  "Direct Action",
  "Rallies",
  "Education Watch"
];
function dateInputToMs(value) {
  if (!value) return void 0;
  const ms = Date.parse(`${value}T00:00:00`);
  return Number.isNaN(ms) ? void 0 : ms;
}
function msToDateInput(ms) {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function formatEventDate(ms) {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(void 0, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function AdminGalleryPage() {
  const containerRef = useEntranceAnimation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, { containerRef });
}
function AdminDashboard({ containerRef }) {
  const { items, loading, error } = useGalleryItems();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();
  const upload = useGalleryUpload();
  const fileInputRef = reactExports.useRef(null);
  const [isDragActive, setIsDragActive] = reactExports.useState(false);
  const [intakeError, setIntakeError] = reactExports.useState(null);
  const [queue, setQueue] = reactExports.useState([]);
  const nextIdRef = reactExports.useRef(0);
  const queueRef = reactExports.useRef([]);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const processingRef = reactExports.useRef(false);
  const [batchEventDate, setBatchEventDate] = reactExports.useState("");
  const [batchCategory, setBatchCategory] = reactExports.useState(
    DEFAULT_GALLERY_CATEGORY
  );
  reactExports.useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  const batchEventDateRef = reactExports.useRef(batchEventDate);
  const batchCategoryRef = reactExports.useRef(batchCategory);
  reactExports.useEffect(() => {
    batchEventDateRef.current = batchEventDate;
  }, [batchEventDate]);
  reactExports.useEffect(() => {
    batchCategoryRef.current = batchCategory;
  }, [batchCategory]);
  const intakeFiles = reactExports.useCallback(
    (fileList) => {
      if (!fileList || fileList.length === 0) return;
      setIntakeError(null);
      const accepted = [];
      for (const file of Array.from(fileList)) {
        if (upload.selectFile(file)) {
          accepted.push({
            id: nextIdRef.current++,
            file,
            status: "queued",
            progress: null,
            error: null
          });
        } else {
          setIntakeError(upload.error ?? "Unsupported file type.");
        }
      }
      upload.reset();
      if (accepted.length > 0) {
        setQueue((prev) => [...prev, ...accepted]);
      }
    },
    [upload]
  );
  const onDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      intakeFiles(e.dataTransfer.files);
    },
    [intakeFiles]
  );
  const onDragOver = reactExports.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);
  const onDragLeave = reactExports.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);
  const onFileInputChange = reactExports.useCallback(
    (e) => {
      intakeFiles(e.target.files);
      e.target.value = "";
    },
    [intakeFiles]
  );
  const openFilePicker = reactExports.useCallback(() => {
    var _a;
    (_a = fileInputRef.current) == null ? void 0 : _a.click();
  }, []);
  const patchFile = reactExports.useCallback((id, patch) => {
    setQueue(
      (prev) => prev.map((qf) => qf.id === id ? { ...qf, ...patch } : qf)
    );
  }, []);
  const removeFromQueue = reactExports.useCallback((id) => {
    setQueue((prev) => prev.filter((qf) => qf.id !== id));
  }, []);
  const clearCompleted = reactExports.useCallback(() => {
    setQueue((prev) => prev.filter((qf) => qf.status !== "done"));
  }, []);
  const clearAll = reactExports.useCallback(() => {
    setQueue([]);
    setIntakeError(null);
    upload.reset();
  }, [upload]);
  const processQueue = reactExports.useCallback(async () => {
    if (processingRef.current) return;
    const pending = queueRef.current.filter((qf) => qf.status === "queued");
    if (pending.length === 0) return;
    processingRef.current = true;
    setIsProcessing(true);
    for (const qf of pending) {
      const current = queueRef.current.find((x) => x.id === qf.id);
      if (!current || current.status !== "queued") continue;
      patchFile(qf.id, {
        status: "uploading",
        progress: 0,
        error: null
      });
      let progressUnsub = null;
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
        upload.selectFile(qf.file);
        const imageUrl = await upload.upload(qf.file);
        const eventDateMs = dateInputToMs(batchEventDateRef.current);
        await createMutation.mutateAsync({
          imageUrl,
          title: qf.file.name.replace(/\.[^.]+$/, ""),
          description: "",
          ...eventDateMs !== void 0 ? { eventDate: eventDateMs } : {},
          category: batchCategoryRef.current || DEFAULT_GALLERY_CATEGORY
        });
        patchFile(qf.id, {
          status: "done",
          progress: 100,
          error: null
        });
      } catch (err) {
        patchFile(qf.id, {
          status: "failed",
          progress: null,
          error: err instanceof Error ? err.message : "Upload failed. Please try again."
        });
      } finally {
        if (progressUnsub) progressUnsub();
        upload.reset();
      }
    }
    processingRef.current = false;
    setIsProcessing(false);
    setQueue((prev) => prev.filter((qf) => qf.status !== "done"));
  }, [upload, createMutation, patchFile]);
  const handleUploadClick = reactExports.useCallback(() => {
    void processQueue();
  }, [processQueue]);
  const handleRetryFile = reactExports.useCallback(
    (id) => {
      patchFile(id, { status: "queued", progress: null, error: null });
      window.setTimeout(() => void processQueue(), 0);
    },
    [patchFile, processQueue]
  );
  const hasQueued = queue.some((qf) => qf.status === "queued");
  const hasFailed = queue.some((qf) => qf.status === "failed");
  const hasUploading = queue.some((qf) => qf.status === "uploading");
  const [editDrafts, setEditDrafts] = reactExports.useState({});
  const [savedIds, setSavedIds] = reactExports.useState({});
  const [confirmDeleteId, setConfirmDeleteId] = reactExports.useState(null);
  const getDraft = reactExports.useCallback(
    (item) => editDrafts[item.id] ?? {
      title: item.title,
      description: item.description,
      eventDate: msToDateInput(item.eventDate),
      category: item.category || DEFAULT_GALLERY_CATEGORY
    },
    [editDrafts]
  );
  const setDraft = reactExports.useCallback(
    (id, patch) => {
      setEditDrafts((prev) => {
        const current = prev[id] ?? (() => {
          const item = items.find((it) => it.id === id);
          return {
            title: (item == null ? void 0 : item.title) ?? "",
            description: (item == null ? void 0 : item.description) ?? "",
            eventDate: msToDateInput(item == null ? void 0 : item.eventDate),
            category: (item == null ? void 0 : item.category) || DEFAULT_GALLERY_CATEGORY
          };
        })();
        return { ...prev, [id]: { ...current, ...patch } };
      });
      setSavedIds((prev) => ({ ...prev, [id]: false }));
    },
    [items]
  );
  const handleSave = reactExports.useCallback(
    async (item) => {
      const draft = getDraft(item);
      const eventDateMs = dateInputToMs(draft.eventDate);
      try {
        await updateMutation.mutateAsync({
          id: item.id,
          title: draft.title,
          description: draft.description,
          ...eventDateMs !== void 0 ? { eventDate: eventDateMs } : {},
          category: draft.category || DEFAULT_GALLERY_CATEGORY
        });
        setSavedIds((prev) => ({ ...prev, [item.id]: true }));
        window.setTimeout(() => {
          setSavedIds((prev) => ({ ...prev, [item.id]: false }));
        }, 2500);
      } catch {
        setSavedIds((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [getDraft, updateMutation]
  );
  const handleDelete = reactExports.useCallback(
    async (id) => {
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
    [deleteMutation]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, "data-ocid": "admin.gallery.dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Section,
      {
        variant: "center",
        noSnap: true,
        background: "background",
        className: "min-h-[60dvh] items-center justify-center !justify-items-center pt-8",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 pb-16 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-eyebrow entrance-left", children: "Admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-headline entrance-left", "data-entrance-delay": "80", children: "Gallery Dashboard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "max-w-xl text-sm text-muted-foreground entrance-right",
              "data-entrance-delay": "160",
              children: "Upload new images and manage titles, descriptions, and ordering for the public gallery."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "admin.gallery.dropzone",
              className: `upload-dropzone entrance-left w-full max-w-2xl ${isDragActive ? "is-active" : ""}`,
              onDrop,
              onDragOver,
              onDragLeave,
              onClick: openFilePicker,
              disabled: isProcessing,
              "data-entrance-delay": "240",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-eyebrow", children: "Upload" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg uppercase tracking-wide text-foreground", children: "Drag & drop images here" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "JPG, PNG, AVIF, or WebP — up to 15 MB each" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    "aria-hidden": "true",
                    "data-ocid": "admin.gallery.select_files_button",
                    className: "btn-primary-square group mt-2",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Select Files" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: fileInputRef,
                    type: "file",
                    accept: ACCEPTED_IMAGE_EXTENSIONS,
                    multiple: true,
                    onChange: onFileInputChange,
                    className: "hidden",
                    "aria-label": "Select image files to upload"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "admin.gallery.batch_meta",
              className: "grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "batch-event-date",
                      className: "text-eyebrow text-[0.65rem]",
                      children: "Batch Event Date"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "batch-event-date",
                      type: "date",
                      value: batchEventDate,
                      onChange: (e) => setBatchEventDate(e.target.value),
                      disabled: isProcessing,
                      "data-ocid": "admin.gallery.batch_event_date_input",
                      className: "admin-date"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] text-muted-foreground", children: "Optional — applied to every image in this batch." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "batch-category",
                      className: "text-eyebrow text-[0.65rem]",
                      children: "Batch Category"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      id: "batch-category",
                      value: batchCategory,
                      onChange: (e) => setBatchCategory(e.target.value),
                      disabled: isProcessing,
                      "data-ocid": "admin.gallery.batch_category_select",
                      className: "admin-select",
                      children: GALLERY_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat))
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] text-muted-foreground", children: "Applied to every image in this batch." })
                ] })
              ]
            }
          ),
          queue.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            PendingQueue,
            {
              queue,
              isProcessing,
              hasQueued,
              hasFailed,
              hasUploading,
              onUpload: handleUploadClick,
              onRemove: removeFromQueue,
              onRetry: handleRetryFile,
              onClearCompleted: clearCompleted,
              onClearAll: clearAll
            }
          ) : null,
          intakeError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              role: "alert",
              "data-ocid": "admin.gallery.intake_error",
              className: "max-w-2xl text-sm text-destructive",
              children: intakeError
            }
          ) : null,
          createMutation.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              role: "alert",
              "data-ocid": "admin.gallery.create_error",
              className: "max-w-2xl text-sm text-destructive",
              children: "Failed to save the uploaded image. Please try again."
            }
          ) : null
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Section,
      {
        noSnap: true,
        background: "background",
        className: "min-h-[60dvh] !justify-start pb-24 pt-8",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-7xl px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl uppercase tracking-wide text-foreground", children: "Manage Images" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-eyebrow", children: [
              items.length,
              " item",
              items.length === 1 ? "" : "s"
            ] })
          ] }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": "admin.gallery.loading_state",
              className: "flex items-center justify-center py-24 text-sm text-muted-foreground",
              children: "Loading gallery…"
            }
          ) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "admin.gallery.error_state",
              className: "flex flex-col items-center gap-4 py-24 text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Failed to load gallery items." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => window.location.reload(),
                    "data-ocid": "admin.gallery.retry_button",
                    className: "btn-outline-invert",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Retry" })
                  }
                )
              ]
            }
          ) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": "admin.gallery.empty_state",
              className: "flex flex-col items-center gap-4 py-24 text-center",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No images yet. Upload your first image above." })
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: items.map((item, index) => {
            var _a, _b;
            const draft = getDraft(item);
            const isDirty = draft.title !== item.title || draft.description !== item.description || draft.eventDate !== msToDateInput(item.eventDate) || draft.category !== (item.category || DEFAULT_GALLERY_CATEGORY);
            const justSaved = savedIds[item.id] === true;
            const isSaving = updateMutation.isPending && ((_a = updateMutation.variables) == null ? void 0 : _a.id) === item.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.id;
            const confirming = confirmDeleteId === item.id;
            const saveError = updateMutation.isError && ((_b = updateMutation.variables) == null ? void 0 : _b.id) === item.id;
            const deleteError = deleteMutation.isError && deleteMutation.variables === item.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              AdminCard,
              {
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
                onTitleChange: (v) => setDraft(item.id, { title: v }),
                onDescriptionChange: (v) => setDraft(item.id, { description: v }),
                onEventDateChange: (v) => setDraft(item.id, { eventDate: v }),
                onCategoryChange: (v) => setDraft(item.id, { category: v }),
                onSave: () => handleSave(item),
                onDelete: () => setConfirmDeleteId(item.id),
                onConfirmDelete: () => handleDelete(item.id),
                onCancelDelete: () => setConfirmDeleteId(null)
              },
              item.id
            );
          }) })
        ] })
      }
    )
  ] });
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
  onClearAll
}) {
  const queuedCount = queue.filter((qf) => qf.status === "queued").length;
  const doneCount = queue.filter((qf) => qf.status === "done").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "admin.gallery.pending_uploads",
      className: "flex w-full max-w-2xl flex-col gap-3 text-left",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-eyebrow", children: [
            queue.length,
            " file",
            queue.length === 1 ? "" : "s",
            " in queue",
            queuedCount > 0 ? ` · ${queuedCount} pending` : "",
            doneCount > 0 ? ` · ${doneCount} done` : ""
          ] }),
          queue.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onClearAll,
              disabled: isProcessing,
              "data-ocid": "admin.gallery.clear_queue_button",
              className: "text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60",
              children: "Clear all"
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-2", children: queue.map((qf) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          PendingRow,
          {
            queued: qf,
            onRemove,
            onRetry
          },
          qf.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onUpload,
              disabled: isProcessing || !hasQueued,
              "data-ocid": "admin.gallery.upload_button",
              className: "btn-primary-square group disabled:cursor-not-allowed disabled:opacity-60",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hasUploading ? "Uploading…" : hasFailed ? "Retry queue" : "Upload & Add to Gallery" })
            }
          ),
          doneCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onClearCompleted,
              disabled: isProcessing,
              "data-ocid": "admin.gallery.clear_completed_button",
              className: "btn-outline-invert !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-60",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Clear completed" })
            }
          ) : null
        ] })
      ]
    }
  );
}
function PendingRow({ queued, onRemove, onRetry }) {
  const { id, file, status, progress, error } = queued;
  const sizeKb = (file.size / 1024).toFixed(0);
  const statusLabel = status === "queued" ? "Queued" : status === "uploading" ? "Uploading" : status === "done" ? "Done" : "Failed";
  const statusClass = status === "done" ? "text-primary" : status === "failed" ? "text-destructive" : status === "uploading" ? "text-foreground" : "text-muted-foreground";
  const showProgress = status === "uploading" && typeof progress === "number";
  const pct = showProgress ? Math.max(0, Math.min(100, Math.round(progress))) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "li",
    {
      "data-ocid": `admin.gallery.pending_item.${id}`,
      className: "flex flex-col gap-2 border-b border-border/60 pb-2 last:border-b-0",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm text-foreground", title: file.name, children: file.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              sizeKb,
              " KB"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `font-mono text-[0.65rem] uppercase tracking-wider ${statusClass}`,
              children: statusLabel
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            status === "failed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onRetry(id),
                "data-ocid": `admin.gallery.pending_retry_button.${id}`,
                className: "text-xs text-primary underline-offset-4 transition-smooth hover:underline",
                children: "Retry"
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onRemove(id),
                disabled: status === "uploading",
                "aria-label": `Remove ${file.name} from queue`,
                "data-ocid": `admin.gallery.pending_remove_button.${id}`,
                className: "text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60",
                children: "Remove"
              }
            )
          ] })
        ] }),
        showProgress ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "data-ocid": `admin.gallery.pending_progress.${id}`,
            role: "progressbar",
            tabIndex: 0,
            "aria-valuenow": pct,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-label": `Upload progress for ${file.name}`,
            className: "h-1 w-full overflow-hidden rounded-full bg-card",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full rounded-full bg-primary transition-[width] duration-200 ease-out",
                style: { width: `${pct}%` }
              }
            )
          }
        ) : null,
        status === "failed" && error ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            role: "alert",
            "data-ocid": `admin.gallery.pending_error.${id}`,
            className: "text-xs text-destructive",
            children: error
          }
        ) : null,
        status === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "output",
          {
            "data-ocid": `admin.gallery.pending_success.${id}`,
            className: "text-xs text-primary",
            children: "Uploaded — added to gallery."
          }
        ) : null
      ]
    }
  );
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
  onCancelDelete
}) {
  const cardRef = reactExports.useRef(null);
  const [imageFailed, setImageFailed] = reactExports.useState(false);
  const handleImageError = reactExports.useCallback(
    (e) => {
      const failedUrl = item.imageUrl;
      console.error(
        `[admin.gallery] image failed to load — id=${item.id} title="${item.title}" url=${failedUrl}`
      );
      const fallback = getFallbackImageUrl(item);
      const el = e.currentTarget;
      if (el.src !== fallback) {
        el.src = fallback;
      }
      setImageFailed(true);
    },
    [item]
  );
  reactExports.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
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
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      ref: cardRef,
      "data-ocid": `admin.gallery.card.${index}`,
      className: "admin-card fade-in-up flex flex-col",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video w-full overflow-hidden bg-image-fallback", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: item.imageUrl,
              alt: draft.title || item.title || "Gallery image",
              loading: "lazy",
              onError: handleImageError,
              className: "h-full w-full rounded-t-xl object-cover"
            }
          ),
          imageFailed ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center",
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-semibold uppercase tracking-wide text-foreground/90 line-clamp-2", children: draft.title || item.title || "Untitled" })
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "data-ocid": `admin.gallery.category_tag.${index}`,
                className: "admin-meta-tag",
                title: `Category: ${item.category || DEFAULT_GALLERY_CATEGORY}`,
                children: item.category || DEFAULT_GALLERY_CATEGORY
              }
            ),
            typeof item.eventDate === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "data-ocid": `admin.gallery.event_date_tag.${index}`,
                className: "admin-meta-tag",
                title: `Event date: ${formatEventDate(item.eventDate)}`,
                children: formatEventDate(item.eventDate)
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: `title-${item.id}`,
                className: "text-eyebrow text-[0.65rem]",
                children: "Photo Title"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: `title-${item.id}`,
                type: "text",
                value: draft.title,
                onChange: (e) => onTitleChange(e.target.value),
                placeholder: "Untitled",
                "data-ocid": `admin.gallery.title_input.${index}`,
                className: "admin-input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: `desc-${item.id}`,
                className: "text-eyebrow text-[0.65rem]",
                children: "Description"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: `desc-${item.id}`,
                value: draft.description,
                onChange: (e) => onDescriptionChange(e.target.value),
                placeholder: "Add a caption or description…",
                rows: 3,
                "data-ocid": `admin.gallery.description_input.${index}`,
                className: "admin-input resize-y"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: `event-date-${item.id}`,
                className: "text-eyebrow text-[0.65rem]",
                children: "Event Date"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: `event-date-${item.id}`,
                type: "date",
                value: draft.eventDate,
                onChange: (e) => onEventDateChange(e.target.value),
                "data-ocid": `admin.gallery.event_date_input.${index}`,
                className: "admin-date"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: `category-${item.id}`,
                className: "text-eyebrow text-[0.65rem]",
                children: "Category"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: `category-${item.id}`,
                value: draft.category,
                onChange: (e) => onCategoryChange(e.target.value),
                "data-ocid": `admin.gallery.category_select.${index}`,
                className: "admin-select",
                children: GALLERY_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat))
              }
            )
          ] }),
          justSaved ? (
            // biome-ignore lint/a11y/useSemanticElements: role=status on a <p> conveys a polite live region for the saved confirmation
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                role: "status",
                "data-ocid": `admin.gallery.saved_confirmation.${index}`,
                className: "text-xs text-primary",
                children: "Saved."
              }
            )
          ) : null,
          saveError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              role: "alert",
              "data-ocid": `admin.gallery.save_error.${index}`,
              className: "text-xs text-destructive",
              children: "Save failed. Please try again."
            }
          ) : null,
          deleteError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              role: "alert",
              "data-ocid": `admin.gallery.delete_error.${index}`,
              className: "text-xs text-destructive",
              children: "Delete failed. Please try again."
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex items-center gap-3", children: confirming ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onConfirmDelete,
                disabled: isDeleting,
                "data-ocid": `admin.gallery.confirm_delete_button.${index}`,
                className: "bg-destructive-soft flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                children: isDeleting ? "Deleting…" : "Confirm Delete"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onCancelDelete,
                disabled: isDeleting,
                "data-ocid": `admin.gallery.cancel_delete_button.${index}`,
                className: "btn-outline-invert flex-1 !px-4 !py-2 !text-xs",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cancel" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onDelete,
                "data-ocid": `admin.gallery.delete_button.${index}`,
                className: "bg-destructive-soft flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80",
                children: "Delete Photo"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onSave,
                disabled: isSaving || !isDirty,
                "data-ocid": `admin.gallery.save_button.${index}`,
                className: "btn-primary-square group flex-1 !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-60",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isSaving ? "Saving…" : "Save" })
              }
            )
          ] }) })
        ] })
      ]
    }
  );
}
export {
  AdminGalleryPage,
  AdminGalleryPage as default
};
