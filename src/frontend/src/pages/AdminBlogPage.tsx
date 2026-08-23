import { Section } from "@/components/Section";
import {
  useCreateBlogPost,
  useDeleteBlogPost,
  useUpdateBlogPost,
} from "@/hooks/useBlogMutations";
import { useAllBlogPosts } from "@/hooks/useBlogPosts";
import {
  ACCEPTED_COVER_EXTENSIONS,
  useBlogUpload,
} from "@/hooks/useBlogUpload";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";
import type { BlogPost } from "@/types/blog";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * AdminBlogPage — hidden admin dashboard for managing blog posts.
 *
 * Route: `/admin/blog` (registered in App.tsx but NOT in NAV_ENTRIES,
 * so it is unreachable from the public nav — only via direct URL).
 *
 * Auth is centralized in `AdminAuthGuard` (see
 * `src/frontend/src/components/AdminAuthGuard.tsx`), which wraps
 * `AdminLayout` for the entire `/admin/*` workspace. This page no longer
 * carries its own password gate or `isCallerAdmin` check — it only owns
 * the dashboard body (article composer + management table) and renders
 * inside the shared `AdminLayout`.
 *
 * Dashboard contents:
 *   - a dark-themed article composer (`.blog-admin-composer`) with
 *     title/slug/category/read-time/author inputs, a drag-and-drop cover
 *     image upload zone (`.upload-dropzone`), a Markdown content
 *     textarea, a Draft/Published toggle, and a Save/Create button.
 *   - a management table listing ALL posts (published + draft) with Edit
 *     and Delete actions per row.
 *
 * The page renders inside the shared `AdminLayout` so the admin header,
 * tab nav, II principal + sign-out, and Quick Links are reused.
 */

export function AdminBlogPage() {
  const containerRef = useEntranceAnimation<HTMLDivElement>();
  return <AdminDashboard containerRef={containerRef} />;
}

export default AdminBlogPage;

// ──────────────────────────────────────────────────────────────────────────
// Admin dashboard — header (principal + sign-out) + article composer +
// management table.
// ──────────────────────────────────────────────────────────────────────────

/**
 * The two valid category values for a BlogPost. The admin composer exposes
 * these as a strict <select> dropdown — free-text entry is not possible.
 * The selected value determines which hub page the published article
 * appears on (/blog or /real-british-history).
 */
const CATEGORY_BLOG = "Blog";
const CATEGORY_RBH = "Real British History";
const VALID_CATEGORIES: readonly string[] = [CATEGORY_BLOG, CATEGORY_RBH];

/**
 * Normalizes a legacy free-text category (e.g. "Commentary",
 * "Movement Update", "Investigation") to one of the two valid dropdown
 * values. Returns the matching valid value when the legacy category
 * already matches, otherwise returns "" so the composer can prompt the
 * admin to pick one (saving is blocked until they do).
 */
function normalizeCategory(category: string): string {
  if (VALID_CATEGORIES.includes(category)) return category;
  return "";
}

/** Empty composer draft — used when creating a new post. */
const EMPTY_DRAFT: ComposerDraft = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: CATEGORY_BLOG,
  readTime: "",
  author: "",
  isPublished: false,
};

interface ComposerDraft {
  /** null when creating a new post; the post id when editing. */
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  readTime: string;
  author: string;
  isPublished: boolean;
}

interface AdminDashboardProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function AdminDashboard({ containerRef }: AdminDashboardProps) {
  const { posts, loading, error } = useAllBlogPosts();
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();
  const upload = useBlogUpload();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComposerDraft>(EMPTY_DRAFT);
  /** True once the user has manually edited the slug (stop auto-suggest). */
  const [slugTouched, setSlugTouched] = useState(false);
  /** Filename of the currently staged cover, for the dropzone preview. */
  const [stagedCoverName, setStagedCoverName] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  // ── Slug auto-suggest from title ────────────────────────────────────
  const slugify = useCallback((value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  // ── Composer field setters ──────────────────────────────────────────
  const patchDraft = useCallback((patch: Partial<ComposerDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const onTitleChange = useCallback(
    (value: string) => {
      patchDraft({ title: value });
      if (!slugTouched) {
        patchDraft({ slug: slugify(value) });
      }
    },
    [patchDraft, slugTouched, slugify],
  );

  const onSlugChange = useCallback(
    (value: string) => {
      setSlugTouched(true);
      patchDraft({ slug: slugify(value) });
    },
    [patchDraft, slugify],
  );

  // ── Cover image intake (drag/drop + file picker) ────────────────────
  const intakeCover = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      setIntakeError(null);
      if (upload.selectFile(file)) {
        setStagedCoverName(file.name);
      } else {
        setIntakeError(upload.error ?? "Unsupported file type.");
      }
    },
    [upload],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      intakeCover(e.dataTransfer.files?.[0]);
    },
    [intakeCover],
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
      intakeCover(e.target.files?.[0]);
      e.target.value = "";
    },
    [intakeCover],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearCover = useCallback(() => {
    upload.reset();
    setStagedCoverName(null);
    setIntakeError(null);
    patchDraft({ coverImageUrl: "" });
  }, [upload, patchDraft]);

  // ── Edit action: load a post into the composer ──────────────────────
  const handleEdit = useCallback(
    (post: BlogPost) => {
      setDraft({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        // Normalize legacy free-text categories to "" when they don't match
        // one of the two valid dropdown values. The composer then shows a
        // "Select a category" placeholder and blocks Save until the admin
        // picks one — saving always writes a valid value.
        category: normalizeCategory(post.category),
        readTime: post.readTime,
        author: post.author,
        isPublished: post.isPublished,
      });
      setSlugTouched(true);
      setStagedCoverName(null);
      setSaveError(null);
      setSavedFlash(false);
      upload.reset();
      // Scroll the composer into view so the admin sees the loaded draft.
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [upload],
  );

  const handleCancelEdit = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setSlugTouched(false);
    setStagedCoverName(null);
    setSaveError(null);
    setSavedFlash(false);
    upload.reset();
  }, [upload]);

  // ── Save / Create ───────────────────────────────────────────────────
  const isEditing = draft.id !== null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = useCallback(async () => {
    setSaveError(null);

    // Basic required-field guard — slug and title are mandatory.
    if (!draft.title.trim() || !draft.slug.trim()) {
      setSaveError("Title and slug are required.");
      return;
    }

    // Category is required — the dropdown must have one of the two valid
    // values selected before the post can be saved/published.
    if (!VALID_CATEGORIES.includes(draft.category)) {
      setSaveError("Please select a category.");
      return;
    }

    try {
      // If a new cover file was staged, upload it to object-storage and
      // use the returned proxy URL. Otherwise reuse the existing
      // coverImageUrl (for edits without a cover change).
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
          id: draft.id as number,
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt,
          content: draft.content,
          coverImageUrl,
          category: draft.category,
          readTime: draft.readTime,
          author: draft.author,
          isPublished: draft.isPublished,
        });
      } else {
        await createMutation.mutateAsync({
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt,
          content: draft.content,
          coverImageUrl,
          category: draft.category,
          readTime: draft.readTime,
          author: draft.author,
          isPublished: draft.isPublished,
        });
      }

      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2500);
      // Reset the composer after a successful create; keep it populated
      // after an edit so the admin can continue tweaking if needed.
      if (!isEditing) {
        setDraft(EMPTY_DRAFT);
        setSlugTouched(false);
      }
      setStagedCoverName(null);
      upload.reset();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to save the post. Please try again.",
      );
    }
  }, [draft, upload, isEditing, createMutation, updateMutation]);

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id);
        setConfirmDeleteId(null);
        // If the deleted post was loaded in the composer, clear it.
        if (draft.id === id) {
          handleCancelEdit();
        }
      } catch {
        setConfirmDeleteId(null);
      }
    },
    [deleteMutation, draft.id, handleCancelEdit],
  );

  const isDirty =
    draft.title.trim() !== "" ||
    draft.slug.trim() !== "" ||
    draft.content.trim() !== "" ||
    draft.coverImageUrl !== "" ||
    stagedCoverName !== null;

  return (
    <div ref={containerRef} data-ocid="admin.blog.dashboard">
      <Section
        variant="center"
        noSnap
        background="background"
        className="min-h-[60dvh] items-center justify-center !justify-items-center pt-8"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 pb-16 text-center">
          <p className="text-eyebrow entrance-left">Admin</p>
          <h1 className="text-headline entrance-left" data-entrance-delay="80">
            Blog Dashboard
          </h1>
          <p
            className="max-w-xl text-sm text-muted-foreground entrance-right"
            data-entrance-delay="160"
          >
            Compose new articles and manage titles, covers, categories, and
            publish status for the public blog.
          </p>

          {/* ── Article composer ─────────────────────────────────────── */}
          <ArticleComposer
            draft={draft}
            isEditing={isEditing}
            isSaving={isSaving}
            isDirty={isDirty}
            savedFlash={savedFlash}
            saveError={saveError}
            intakeError={intakeError}
            isDragActive={isDragActive}
            stagedCoverName={stagedCoverName}
            stagedCoverFile={upload.file}
            uploadProgress={upload.progress}
            uploadError={upload.error}
            fileInputRef={fileInputRef}
            categoryInvalid={!VALID_CATEGORIES.includes(draft.category)}
            onTitleChange={onTitleChange}
            onSlugChange={onSlugChange}
            onFieldChange={patchDraft}
            onTogglePublished={(next) => patchDraft({ isPublished: next })}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onFileInputChange={onFileInputChange}
            openFilePicker={openFilePicker}
            onClearCover={clearCover}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </Section>

      {/* ── Management table ─────────────────────────────────────────── */}
      <Section
        noSnap
        background="background"
        className="min-h-[60dvh] !justify-start pb-24 pt-8"
      >
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground">
              Manage Posts
            </h2>
            <span className="text-eyebrow">
              {posts.length} post{posts.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div
              data-ocid="admin.blog.loading_state"
              className="flex items-center justify-center py-24 text-sm text-muted-foreground"
            >
              Loading posts…
            </div>
          ) : error ? (
            <div
              data-ocid="admin.blog.error_state"
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <p className="text-sm text-destructive">
                Failed to load blog posts.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                data-ocid="admin.blog.retry_button"
                className="btn-outline-invert"
              >
                <span>Retry</span>
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div
              data-ocid="admin.blog.empty_state"
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <p className="text-sm text-muted-foreground">
                No posts yet. Compose your first article above.
              </p>
            </div>
          ) : (
            <PostsTable
              posts={posts}
              confirmDeleteId={confirmDeleteId}
              deletingId={
                deleteMutation.isPending
                  ? (deleteMutation.variables ?? null)
                  : null
              }
              editingId={draft.id}
              savingId={
                updateMutation.isPending
                  ? (updateMutation.variables?.id ?? null)
                  : null
              }
              onEdit={handleEdit}
              onDelete={(id) => setConfirmDeleteId(id)}
              onConfirmDelete={handleDelete}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
          )}
        </div>
      </Section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ArticleComposer — the dark-themed publishing form. Wraps title/slug/
// category/read-time/author inputs, a drag-and-drop cover upload zone, a
// Markdown content textarea, a Draft/Published toggle, and the Save/Create
// button.
// ──────────────────────────────────────────────────────────────────────────

interface ArticleComposerProps {
  draft: ComposerDraft;
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  savedFlash: boolean;
  saveError: string | null;
  intakeError: string | null;
  isDragActive: boolean;
  stagedCoverName: string | null;
  stagedCoverFile: File | null;
  uploadProgress: number | null;
  uploadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  categoryInvalid: boolean;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onFieldChange: (patch: Partial<ComposerDraft>) => void;
  onTogglePublished: (next: boolean) => void;
  onDrop: (e: DragEvent<HTMLButtonElement>) => void;
  onDragOver: (e: DragEvent<HTMLButtonElement>) => void;
  onDragLeave: (e: DragEvent<HTMLButtonElement>) => void;
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  openFilePicker: () => void;
  onClearCover: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
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
  categoryInvalid,
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
  onCancelEdit,
}: ArticleComposerProps) {
  const hasCover = Boolean(draft.coverImageUrl) || stagedCoverName !== null;
  const showProgress =
    typeof uploadProgress === "number" && uploadProgress < 100;
  const pct = showProgress
    ? Math.max(0, Math.min(100, Math.round(uploadProgress!)))
    : 0;

  // Object URL for the staged cover File. Recomputed only when the staged
  // File changes; revoked on cleanup so we never leak blob URLs across
  // re-stages or unmount. Falls back to the persisted coverImageUrl when
  // no new file is staged (edit flow without a cover change).
  const stagedCoverUrl = useMemo(() => {
    if (!stagedCoverFile) return "";
    return URL.createObjectURL(stagedCoverFile);
  }, [stagedCoverFile]);

  useEffect(() => {
    if (!stagedCoverUrl) return;
    return () => {
      URL.revokeObjectURL(stagedCoverUrl);
    };
  }, [stagedCoverUrl]);

  return (
    <div
      data-ocid="admin.blog.composer"
      className="blog-admin-composer entrance-left w-full max-w-3xl text-left"
      data-entrance-delay="240"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-eyebrow">
          {isEditing ? "Edit Article" : "New Article"}
        </p>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSaving}
            data-ocid="admin.blog.cancel_edit_button"
            className="text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      {/* ── Title ──────────────────────────────────────────────────── */}
      <div className="composer-field-group">
        <label htmlFor="blog-title" className="composer-label">
          Title
        </label>
        <input
          id="blog-title"
          type="text"
          value={draft.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Article headline"
          data-ocid="admin.blog.title_input"
          className="admin-input"
        />
      </div>

      {/* ── Slug ───────────────────────────────────────────────────── */}
      <div className="composer-field-group">
        <label htmlFor="blog-slug" className="composer-label">
          Slug
        </label>
        <input
          id="blog-slug"
          type="text"
          value={draft.slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="url-safe-slug"
          data-ocid="admin.blog.slug_input"
          className="admin-input font-mono"
        />
      </div>

      {/* ── Category + Read Time + Author (responsive row) ─────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="composer-field-group">
          <label htmlFor="blog-category" className="composer-label">
            Category
          </label>
          <select
            id="blog-category"
            value={draft.category}
            onChange={(e) => onFieldChange({ category: e.target.value })}
            data-ocid="admin.blog.category_select"
            className="admin-input"
            aria-invalid={categoryInvalid}
            aria-required="true"
          >
            {/* Placeholder — shown when no valid category is selected
                (new posts default to "Blog"; legacy free-text categories
                normalize to "" on edit so the admin must pick one). */}
            <option value="" disabled>
              Select a category
            </option>
            <option value={CATEGORY_BLOG}>Blog</option>
            <option value={CATEGORY_RBH}>Real British History</option>
          </select>
          {categoryInvalid ? (
            <p
              role="alert"
              data-ocid="admin.blog.category_error"
              className="text-xs text-destructive"
            >
              Please select a category.
            </p>
          ) : null}
        </div>
        <div className="composer-field-group">
          <label htmlFor="blog-readtime" className="composer-label">
            Read Time
          </label>
          <input
            id="blog-readtime"
            type="text"
            value={draft.readTime}
            onChange={(e) => onFieldChange({ readTime: e.target.value })}
            placeholder="6 min read"
            data-ocid="admin.blog.readtime_input"
            className="admin-input"
          />
        </div>
        <div className="composer-field-group">
          <label htmlFor="blog-author" className="composer-label">
            Author
          </label>
          <input
            id="blog-author"
            type="text"
            value={draft.author}
            onChange={(e) => onFieldChange({ author: e.target.value })}
            placeholder="Byline"
            data-ocid="admin.blog.author_input"
            className="admin-input"
          />
        </div>
      </div>

      {/* ── Excerpt ────────────────────────────────────────────────── */}
      <div className="composer-field-group">
        <label htmlFor="blog-excerpt" className="composer-label">
          Excerpt
        </label>
        <textarea
          id="blog-excerpt"
          value={draft.excerpt}
          onChange={(e) => onFieldChange({ excerpt: e.target.value })}
          placeholder="Short summary / standfirst shown on cards"
          rows={2}
          data-ocid="admin.blog.excerpt_input"
          className="admin-input resize-y"
        />
      </div>

      {/* ── Cover image upload zone ───────────────────────────────── */}
      <div className="composer-field-group">
        <span className="composer-label">Cover Image</span>
        {hasCover ? (
          <div
            data-ocid="admin.blog.cover_preview"
            className="flex flex-col gap-3 border border-border bg-[oklch(var(--upload-zone))] p-3"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-image-fallback">
              <img
                src={draft.coverImageUrl || stagedCoverUrl}
                alt={stagedCoverName ?? "Cover preview"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span
                className="truncate text-xs text-muted-foreground"
                title={stagedCoverName ?? "Current cover"}
              >
                {stagedCoverName ?? "Current cover image"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isSaving}
                  data-ocid="admin.blog.replace_cover_button"
                  className="text-xs text-primary underline-offset-4 transition-smooth hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onClearCover}
                  disabled={isSaving}
                  data-ocid="admin.blog.clear_cover_button"
                  className="text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
            {showProgress ? (
              <div
                data-ocid="admin.blog.cover_progress"
                role="progressbar"
                tabIndex={0}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Cover upload progress"
                className="h-1 w-full overflow-hidden rounded-full bg-card"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            data-ocid="admin.blog.dropzone"
            className={`upload-dropzone w-full ${
              isDragActive ? "is-active" : ""
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={openFilePicker}
            disabled={isSaving}
          >
            <span className="text-eyebrow">Upload</span>
            <p className="font-display text-lg uppercase tracking-wide text-foreground">
              Drag &amp; drop cover image
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, AVIF, or WebP — up to 15 MB
            </p>
            <span
              aria-hidden="true"
              data-ocid="admin.blog.select_cover_button"
              className="btn-primary-square group mt-2"
            >
              <span>Select Cover</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_COVER_EXTENSIONS}
              onChange={onFileInputChange}
              className="hidden"
              aria-label="Select a cover image file"
            />
          </button>
        )}
        {intakeError ? (
          <p
            role="alert"
            data-ocid="admin.blog.intake_error"
            className="text-xs text-destructive"
          >
            {intakeError}
          </p>
        ) : null}
        {uploadError ? (
          <p
            role="alert"
            data-ocid="admin.blog.upload_error"
            className="text-xs text-destructive"
          >
            {uploadError}
          </p>
        ) : null}
      </div>

      {/* ── Markdown content textarea ─────────────────────────────── */}
      <div className="composer-field-group">
        <label htmlFor="blog-content" className="composer-label">
          Content (Markdown)
        </label>
        <textarea
          id="blog-content"
          value={draft.content}
          onChange={(e) => onFieldChange({ content: e.target.value })}
          placeholder="Write the article body in Markdown…"
          rows={12}
          data-ocid="admin.blog.content_input"
          className="admin-input"
        />
      </div>

      {/* ── Draft / Published toggle ───────────────────────────────── */}
      <div className="composer-field-group">
        <span className="composer-label">Publish Status</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            role="switch"
            aria-checked={draft.isPublished}
            aria-label="Toggle published status"
            data-ocid="admin.blog.publish_toggle"
            onClick={() => onTogglePublished(!draft.isPublished)}
            className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-border bg-[oklch(var(--upload-zone))] transition-smooth focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[oklch(var(--primary))]"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                draft.isPublished
                  ? "translate-x-6 bg-[oklch(var(--status-published))]"
                  : "translate-x-1 bg-[oklch(var(--status-draft))]"
              }`}
            />
          </button>
          <span
            className={`publish-status-badge ${
              draft.isPublished ? "is-published" : "is-draft"
            }`}
            data-ocid="admin.blog.publish_status_badge"
          >
            {draft.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* ── Inline status ──────────────────────────────────────────── */}
      {savedFlash ? (
        <output
          data-ocid="admin.blog.saved_confirmation"
          className="text-xs text-primary"
        >
          {isEditing ? "Updated." : "Created."}
        </output>
      ) : null}
      {saveError ? (
        <p
          role="alert"
          data-ocid="admin.blog.save_error"
          className="text-xs text-destructive"
        >
          {saveError}
        </p>
      ) : null}

      {/* ── Save / Create button ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          data-ocid="admin.blog.save_button"
          className="btn-primary-square group disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>
            {isSaving ? "Saving…" : isEditing ? "Update Post" : "Create Post"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PostsTable — management table listing ALL posts (published + draft) with
// title, category, author, publish status badge, createdAt, and Edit +
// Delete actions per row.
// ──────────────────────────────────────────────────────────────────────────

interface PostsTableProps {
  posts: BlogPost[];
  confirmDeleteId: number | null;
  deletingId: number | null;
  editingId: number | null;
  savingId: number | null;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: number) => void;
  onConfirmDelete: (id: number) => void;
  onCancelDelete: () => void;
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
  onCancelDelete,
}: PostsTableProps) {
  return (
    <div
      data-ocid="admin.blog.table"
      className="overflow-x-auto border border-border"
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-[oklch(var(--upload-zone))]">
            <th scope="col" className="px-4 py-3 text-eyebrow text-[0.65rem]">
              Title
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-eyebrow text-[0.65rem] md:table-cell"
            >
              Category
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-eyebrow text-[0.65rem] md:table-cell"
            >
              Author
            </th>
            <th scope="col" className="px-4 py-3 text-eyebrow text-[0.65rem]">
              Status
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-eyebrow text-[0.65rem] lg:table-cell"
            >
              Created
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-eyebrow text-[0.65rem]"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => {
            const confirming = confirmDeleteId === post.id;
            const isDeleting = deletingId === post.id;
            const isEditingRow = editingId === post.id;
            const isSavingRow = savingId === post.id;
            const created = new Date(post.createdAt);
            const createdLabel = Number.isNaN(created.getTime())
              ? "-"
              : created.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
            return (
              <tr
                key={post.id}
                data-ocid={`admin.blog.row.${index}`}
                className="border-b border-border/60 transition-smooth last:border-b-0 hover:bg-[oklch(var(--admin-card-hover))]"
              >
                <td className="px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className="truncate text-sm text-foreground"
                      title={post.title}
                    >
                      {post.title || "Untitled"}
                    </span>
                    <span
                      className="truncate font-mono text-[0.65rem] text-muted-foreground"
                      title={post.slug}
                    >
                      /{post.slug}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {post.category || "-"}
                  </span>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {post.author || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`publish-status-badge ${
                      post.isPublished ? "is-published" : "is-draft"
                    }`}
                    data-ocid={`admin.blog.row.status.${index}`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <span className="font-mono text-xs text-muted-foreground">
                    {createdLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {confirming ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onConfirmDelete(post.id)}
                        disabled={isDeleting}
                        data-ocid={`admin.blog.confirm_delete_button.${index}`}
                        className="bg-destructive-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelDelete}
                        disabled={isDeleting}
                        data-ocid={`admin.blog.cancel_delete_button.${index}`}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-smooth hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(post)}
                        disabled={isSavingRow}
                        data-ocid={`admin.blog.edit_button.${index}`}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 transition-smooth hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isEditingRow && isSavingRow ? "Saving…" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(post.id)}
                        disabled={isDeleting}
                        data-ocid={`admin.blog.delete_button.${index}`}
                        className="bg-destructive-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-smooth hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
