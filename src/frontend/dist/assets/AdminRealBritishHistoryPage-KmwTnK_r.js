import { a as useEntranceAnimation, j as jsxRuntimeExports, q as useAllBlogPosts, s as useCreateBlogPost, t as useUpdateBlogPost, v as useDeleteBlogPost, r as reactExports, S as Section } from "./index-BK-5O9Rg.js";
import { u as useBlogUpload, A as ACCEPTED_COVER_EXTENSIONS } from "./useBlogUpload-gMvQx8SI.js";
const CATEGORY_RBH = "Real British History";
function AdminRealBritishHistoryPage() {
  const containerRef = useEntranceAnimation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, { containerRef });
}
const EMPTY_DRAFT = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: CATEGORY_RBH,
  readTime: "",
  author: "",
  isPublished: false
};
function AdminDashboard({ containerRef }) {
  var _a;
  const { posts: allPosts, loading, error } = useAllBlogPosts();
  const posts = allPosts.filter((p) => p.category === CATEGORY_RBH);
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();
  const upload = useBlogUpload();
  const fileInputRef = reactExports.useRef(null);
  const [isDragActive, setIsDragActive] = reactExports.useState(false);
  const [intakeError, setIntakeError] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(EMPTY_DRAFT);
  const [slugTouched, setSlugTouched] = reactExports.useState(false);
  const [stagedCoverName, setStagedCoverName] = reactExports.useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = reactExports.useState(null);
  const [saveError, setSaveError] = reactExports.useState(null);
  const [savedFlash, setSavedFlash] = reactExports.useState(false);
  const slugify = reactExports.useCallback((value) => {
    return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }, []);
  const patchDraft = reactExports.useCallback((patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);
  const onTitleChange = reactExports.useCallback(
    (value) => {
      patchDraft({ title: value });
      if (!slugTouched) {
        patchDraft({ slug: slugify(value) });
      }
    },
    [patchDraft, slugTouched, slugify]
  );
  const onSlugChange = reactExports.useCallback(
    (value) => {
      setSlugTouched(true);
      patchDraft({ slug: slugify(value) });
    },
    [patchDraft, slugify]
  );
  const intakeCover = reactExports.useCallback(
    (file) => {
      if (!file) return;
      setIntakeError(null);
      if (upload.selectFile(file)) {
        setStagedCoverName(file.name);
      } else {
        setIntakeError(upload.error ?? "Unsupported file type.");
      }
    },
    [upload]
  );
  const onDrop = reactExports.useCallback(
    (e) => {
      var _a2;
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      intakeCover((_a2 = e.dataTransfer.files) == null ? void 0 : _a2[0]);
    },
    [intakeCover]
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
      var _a2;
      intakeCover((_a2 = e.target.files) == null ? void 0 : _a2[0]);
      e.target.value = "";
    },
    [intakeCover]
  );
  const openFilePicker = reactExports.useCallback(() => {
    var _a2;
    (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
  }, []);
  const clearCover = reactExports.useCallback(() => {
    upload.reset();
    setStagedCoverName(null);
    setIntakeError(null);
    patchDraft({ coverImageUrl: "" });
  }, [upload, patchDraft]);
  const handleEdit = reactExports.useCallback(
    (post) => {
      setDraft({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        // Category is always RBH in this dashboard — force it on edit so
        // a post that was somehow recategorized elsewhere snaps back to
        // RBH when edited here (the composer dropdown is locked to RBH).
        category: CATEGORY_RBH,
        readTime: post.readTime,
        author: post.author,
        isPublished: post.isPublished
      });
      setSlugTouched(true);
      setStagedCoverName(null);
      setSaveError(null);
      setSavedFlash(false);
      upload.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [upload]
  );
  const handleCancelEdit = reactExports.useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setSlugTouched(false);
    setStagedCoverName(null);
    setSaveError(null);
    setSavedFlash(false);
    upload.reset();
  }, [upload]);
  const isEditing = draft.id !== null;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const handleSave = reactExports.useCallback(async () => {
    setSaveError(null);
    if (!draft.title.trim() || !draft.slug.trim()) {
      setSaveError("Title and slug are required.");
      return;
    }
    if (!draft.category) {
      setSaveError("Category is required.");
      return;
    }
    try {
      let coverImageUrl = draft.coverImageUrl;
      if (upload.file) {
        coverImageUrl = await upload.upload();
      }
      if (!coverImageUrl) {
        setSaveError("A cover image is required.");
        return;
      }
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: draft.id,
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt,
          content: draft.content,
          coverImageUrl,
          category: CATEGORY_RBH,
          readTime: draft.readTime,
          author: draft.author,
          isPublished: draft.isPublished
        });
      } else {
        await createMutation.mutateAsync({
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt,
          content: draft.content,
          coverImageUrl,
          category: CATEGORY_RBH,
          readTime: draft.readTime,
          author: draft.author,
          isPublished: draft.isPublished
        });
      }
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2500);
      if (!isEditing) {
        setDraft(EMPTY_DRAFT);
        setSlugTouched(false);
      }
      setStagedCoverName(null);
      upload.reset();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save the post. Please try again."
      );
    }
  }, [draft, upload, isEditing, createMutation, updateMutation]);
  const handleDelete = reactExports.useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
        setConfirmDeleteId(null);
        if (draft.id === id) {
          handleCancelEdit();
        }
      } catch {
        setConfirmDeleteId(null);
      }
    },
    [deleteMutation, draft.id, handleCancelEdit]
  );
  const isDirty = draft.title.trim() !== "" || draft.slug.trim() !== "" || draft.content.trim() !== "" || draft.coverImageUrl !== "" || stagedCoverName !== null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, "data-ocid": "admin.rbh.dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Section,
      {
        variant: "center",
        noSnap: true,
        background: "background",
        className: "min-h-[60dvh] items-center justify-center !justify-items-center pt-8",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 pb-16 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-eyebrow entrance-left", children: "Admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-headline entrance-left", "data-entrance-delay": "80", children: "Historic Preservation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "max-w-xl text-sm text-muted-foreground entrance-right",
              "data-entrance-delay": "160",
              children: "Compose and manage historic-preservation articles for the Real British History hub. New posts are automatically categorised as “Real British History”."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ArticleComposer,
            {
              draft,
              isEditing,
              isSaving,
              isDirty,
              savedFlash,
              saveError,
              intakeError,
              isDragActive,
              stagedCoverName,
              stagedCoverFile: upload.file,
              uploadProgress: upload.progress,
              uploadError: upload.error,
              fileInputRef,
              onTitleChange,
              onSlugChange,
              onFieldChange: patchDraft,
              onTogglePublished: (next) => patchDraft({ isPublished: next }),
              onDrop,
              onDragOver,
              onDragLeave,
              onFileInputChange,
              openFilePicker,
              onClearCover: clearCover,
              onSave: handleSave,
              onCancelEdit: handleCancelEdit
            }
          )
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl uppercase tracking-wide text-foreground", children: "Manage Historic Articles" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-eyebrow", children: [
              posts.length,
              " post",
              posts.length === 1 ? "" : "s"
            ] })
          ] }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": "admin.rbh.loading_state",
              className: "flex items-center justify-center py-24 text-sm text-muted-foreground",
              children: "Loading posts…"
            }
          ) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "admin.rbh.error_state",
              className: "flex flex-col items-center gap-4 py-24 text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Failed to load historic articles." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => window.location.reload(),
                    "data-ocid": "admin.rbh.retry_button",
                    className: "btn-outline-invert",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Retry" })
                  }
                )
              ]
            }
          ) : posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": "admin.rbh.empty_state",
              className: "flex flex-col items-center gap-4 py-24 text-center",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No historic articles yet. Compose your first article above." })
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            PostsTable,
            {
              posts,
              confirmDeleteId,
              deletingId: deleteMutation.isPending ? deleteMutation.variables ?? null : null,
              editingId: draft.id,
              savingId: updateMutation.isPending ? ((_a = updateMutation.variables) == null ? void 0 : _a.id) ?? null : null,
              onEdit: handleEdit,
              onDelete: (id) => setConfirmDeleteId(id),
              onConfirmDelete: handleDelete,
              onCancelDelete: () => setConfirmDeleteId(null)
            }
          )
        ] })
      }
    )
  ] });
}
function ArticleComposer({
  draft,
  isEditing,
  isSaving,
  isDirty,
  savedFlash,
  saveError,
  intakeError,
  isDragActive,
  stagedCoverName,
  stagedCoverFile,
  uploadProgress,
  uploadError,
  fileInputRef,
  onTitleChange,
  onSlugChange,
  onFieldChange,
  onTogglePublished,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInputChange,
  openFilePicker,
  onClearCover,
  onSave,
  onCancelEdit
}) {
  const hasCover = Boolean(draft.coverImageUrl) || stagedCoverName !== null;
  const showProgress = typeof uploadProgress === "number" && uploadProgress < 100;
  const pct = showProgress ? Math.max(0, Math.min(100, Math.round(uploadProgress))) : 0;
  const stagedCoverUrl = reactExports.useMemo(() => {
    if (!stagedCoverFile) return "";
    return URL.createObjectURL(stagedCoverFile);
  }, [stagedCoverFile]);
  reactExports.useEffect(() => {
    if (!stagedCoverUrl) return;
    return () => {
      URL.revokeObjectURL(stagedCoverUrl);
    };
  }, [stagedCoverUrl]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "admin.rbh.composer",
      className: "blog-admin-composer entrance-left w-full max-w-3xl text-left",
      "data-entrance-delay": "240",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-eyebrow", children: isEditing ? "Edit Article" : "New Article" }),
          isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onCancelEdit,
              disabled: isSaving,
              "data-ocid": "admin.rbh.cancel_edit_button",
              className: "text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60",
              children: "Cancel edit"
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-title", className: "composer-label", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "rbh-title",
              type: "text",
              value: draft.title,
              onChange: (e) => onTitleChange(e.target.value),
              placeholder: "Article headline",
              "data-ocid": "admin.rbh.title_input",
              className: "admin-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-slug", className: "composer-label", children: "Slug" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "rbh-slug",
              type: "text",
              value: draft.slug,
              onChange: (e) => onSlugChange(e.target.value),
              placeholder: "url-safe-slug",
              "data-ocid": "admin.rbh.slug_input",
              className: "admin-input font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-category", className: "composer-label", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: "rbh-category",
                value: CATEGORY_RBH,
                disabled: true,
                "data-ocid": "admin.rbh.category_select",
                className: "admin-select",
                "aria-readonly": "true",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: CATEGORY_RBH, children: "Real British History" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] text-muted-foreground", children: "Locked — every post here is categorised as Real British History." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-readtime", className: "composer-label", children: "Read Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "rbh-readtime",
                type: "text",
                value: draft.readTime,
                onChange: (e) => onFieldChange({ readTime: e.target.value }),
                placeholder: "6 min read",
                "data-ocid": "admin.rbh.readtime_input",
                className: "admin-input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-author", className: "composer-label", children: "Author" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "rbh-author",
                type: "text",
                value: draft.author,
                onChange: (e) => onFieldChange({ author: e.target.value }),
                placeholder: "Byline",
                "data-ocid": "admin.rbh.author_input",
                className: "admin-input"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-excerpt", className: "composer-label", children: "Excerpt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "rbh-excerpt",
              value: draft.excerpt,
              onChange: (e) => onFieldChange({ excerpt: e.target.value }),
              placeholder: "Short summary / standfirst shown on cards",
              rows: 2,
              "data-ocid": "admin.rbh.excerpt_input",
              className: "admin-input resize-y"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "composer-label", children: "Cover Image" }),
          hasCover ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "admin.rbh.cover_preview",
              className: "flex flex-col gap-3 border border-border bg-[oklch(var(--upload-zone))] p-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video w-full overflow-hidden bg-image-fallback", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: draft.coverImageUrl || stagedCoverUrl,
                    alt: stagedCoverName ?? "Cover preview",
                    className: "h-full w-full object-cover"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "truncate text-xs text-muted-foreground",
                      title: stagedCoverName ?? "Current cover",
                      children: stagedCoverName ?? "Current cover image"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: openFilePicker,
                        disabled: isSaving,
                        "data-ocid": "admin.rbh.replace_cover_button",
                        className: "text-xs text-primary underline-offset-4 transition-smooth hover:underline disabled:cursor-not-allowed disabled:opacity-60",
                        children: "Replace"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: onClearCover,
                        disabled: isSaving,
                        "data-ocid": "admin.rbh.clear_cover_button",
                        className: "text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60",
                        children: "Remove"
                      }
                    )
                  ] })
                ] }),
                showProgress ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    "data-ocid": "admin.rbh.cover_progress",
                    role: "progressbar",
                    tabIndex: 0,
                    "aria-valuenow": pct,
                    "aria-valuemin": 0,
                    "aria-valuemax": 100,
                    "aria-label": "Cover upload progress",
                    className: "h-1 w-full overflow-hidden rounded-full bg-card",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "h-full rounded-full bg-primary transition-[width] duration-200 ease-out",
                        style: { width: `${pct}%` }
                      }
                    )
                  }
                ) : null
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "admin.rbh.dropzone",
              className: `upload-dropzone w-full ${isDragActive ? "is-active" : ""}`,
              onDrop,
              onDragOver,
              onDragLeave,
              onClick: openFilePicker,
              disabled: isSaving,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-eyebrow", children: "Upload" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg uppercase tracking-wide text-foreground", children: "Drag & drop cover image" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "JPG, PNG, AVIF, or WebP — up to 15 MB" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    "aria-hidden": "true",
                    "data-ocid": "admin.rbh.select_cover_button",
                    className: "btn-primary-square group mt-2",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Select Cover" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: fileInputRef,
                    type: "file",
                    accept: ACCEPTED_COVER_EXTENSIONS,
                    onChange: onFileInputChange,
                    className: "hidden",
                    "aria-label": "Select a cover image file"
                  }
                )
              ]
            }
          ),
          intakeError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              role: "alert",
              "data-ocid": "admin.rbh.intake_error",
              className: "text-xs text-destructive",
              children: intakeError
            }
          ) : null,
          uploadError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              role: "alert",
              "data-ocid": "admin.rbh.upload_error",
              className: "text-xs text-destructive",
              children: uploadError
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rbh-content", className: "composer-label", children: "Content (Markdown)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "rbh-content",
              value: draft.content,
              onChange: (e) => onFieldChange({ content: e.target.value }),
              placeholder: "Write the article body in Markdown…",
              rows: 12,
              "data-ocid": "admin.rbh.content_input",
              className: "admin-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "composer-field-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "composer-label", children: "Publish Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                role: "switch",
                "aria-checked": draft.isPublished,
                "aria-label": "Toggle published status",
                "data-ocid": "admin.rbh.publish_toggle",
                onClick: () => onTogglePublished(!draft.isPublished),
                className: "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-border bg-[oklch(var(--upload-zone))] transition-smooth focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[oklch(var(--primary))]",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-block h-4 w-4 transform rounded-full transition-transform ${draft.isPublished ? "translate-x-6 bg-[oklch(var(--status-published))]" : "translate-x-1 bg-[oklch(var(--status-draft))]"}`
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `publish-status-badge ${draft.isPublished ? "is-published" : "is-draft"}`,
                "data-ocid": "admin.rbh.publish_status_badge",
                children: draft.isPublished ? "Published" : "Draft"
              }
            )
          ] })
        ] }),
        savedFlash ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "output",
          {
            "data-ocid": "admin.rbh.saved_confirmation",
            className: "text-xs text-primary",
            children: isEditing ? "Updated." : "Created."
          }
        ) : null,
        saveError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            role: "alert",
            "data-ocid": "admin.rbh.save_error",
            className: "text-xs text-destructive",
            children: saveError
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onSave,
            disabled: isSaving || !isDirty,
            "data-ocid": "admin.rbh.save_button",
            className: "btn-primary-square group disabled:cursor-not-allowed disabled:opacity-60",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isSaving ? "Saving…" : isEditing ? "Update Post" : "Create Post" })
          }
        ) })
      ]
    }
  );
}
function PostsTable({
  posts,
  confirmDeleteId,
  deletingId,
  editingId,
  savingId,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "admin.rbh.table",
      className: "overflow-x-auto border border-border",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-[oklch(var(--upload-zone))]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-4 py-3 text-eyebrow text-[0.65rem]", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "hidden px-4 py-3 text-eyebrow text-[0.65rem] md:table-cell",
              children: "Author"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-4 py-3 text-eyebrow text-[0.65rem]", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "hidden px-4 py-3 text-eyebrow text-[0.65rem] lg:table-cell",
              children: "Created"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "px-4 py-3 text-right text-eyebrow text-[0.65rem]",
              children: "Actions"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: posts.map((post, index) => {
          const confirming = confirmDeleteId === post.id;
          const isDeleting = deletingId === post.id;
          const isEditingRow = editingId === post.id;
          const isSavingRow = savingId === post.id;
          const created = new Date(post.createdAt);
          const createdLabel = Number.isNaN(created.getTime()) ? "-" : created.toLocaleDateString(void 0, {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              "data-ocid": `admin.rbh.row.${index}`,
              className: "border-b border-border/60 transition-smooth last:border-b-0 hover:bg-[oklch(var(--admin-card-hover))]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "truncate text-sm text-foreground",
                      title: post.title,
                      children: post.title || "Untitled"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: "truncate font-mono text-[0.65rem] text-muted-foreground",
                      title: post.slug,
                      children: [
                        "/",
                        post.slug
                      ]
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "hidden px-4 py-3 md:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: post.author || "-" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `publish-status-badge ${post.isPublished ? "is-published" : "is-draft"}`,
                    "data-ocid": `admin.rbh.row.status.${index}`,
                    children: post.isPublished ? "Published" : "Draft"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "hidden px-4 py-3 lg:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: createdLabel }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: confirming ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => onConfirmDelete(post.id),
                      disabled: isDeleting,
                      "data-ocid": `admin.rbh.confirm_delete_button.${index}`,
                      className: "bg-destructive-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                      children: isDeleting ? "Deleting…" : "Confirm"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: onCancelDelete,
                      disabled: isDeleting,
                      "data-ocid": `admin.rbh.cancel_delete_button.${index}`,
                      className: "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-smooth hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
                      children: "Cancel"
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => onEdit(post),
                      disabled: isSavingRow,
                      "data-ocid": `admin.rbh.edit_button.${index}`,
                      className: "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 transition-smooth hover:underline disabled:cursor-not-allowed disabled:opacity-60",
                      children: isEditingRow && isSavingRow ? "Saving…" : "Edit"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => onDelete(post.id),
                      disabled: isDeleting,
                      "data-ocid": `admin.rbh.delete_button.${index}`,
                      className: "bg-destructive-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                      children: "Delete"
                    }
                  )
                ] }) })
              ]
            },
            post.id
          );
        }) })
      ] })
    }
  );
}
export {
  AdminRealBritishHistoryPage,
  AdminRealBritishHistoryPage as default
};
