import type { GalleryItem as BackendGalleryItem } from "@/backend";

/**
 * Default category for gallery items that do not specify one. Matches the
 * backend default ('Uncategorized') and the user preference to default
 * migrated gallery items to 'Uncategorized'.
 */
export const DEFAULT_GALLERY_CATEGORY = "Uncategorized";

/**
 * GalleryItem — frontend domain type for a gallery image record.
 *
 * Mirrors the backend `GalleryItem` candid type but uses plain JS `number`
 * for the id, createdAt, and eventDate (the backend returns `bigint`; the
 * frontend normalizes via `toGalleryItem` so consumers can use ordinary
 * numbers in JSX keys, comparisons, and form inputs without sprinkling
 * `Number()` at every call site).
 *
 * The `imageUrl` field is the opaque object-storage proxy URL produced by
 * `ExternalBlob.getDirectURL()` — never inspect it for a file extension.
 * Use `mimeType` / `filename` for type detection instead.
 *
 * `eventDate` is an optional nanosecond timestamp marking when the depicted
 * event occurred (distinct from `createdAt`, which is when the record was
 * stored). It is normalized to a JS number (milliseconds since epoch) for
 * the same reason as `createdAt`. It may be `undefined` when the backend
 * omits it (the candid field is `?Timestamp`).
 *
 * `category` is a free-form Text label (e.g. 'Campus Events',
 * 'Direct Action', 'Rallies', 'Education Watch', or 'Uncategorized').
 * The backend defaults an empty create to 'Uncategorized' and preserves
 * the existing value on update when empty.
 */
export interface GalleryItem {
  /** Backend record id (normalized from bigint to number). */
  id: number;
  /** Opaque object-storage proxy URL from `ExternalBlob.getDirectURL()`. */
  imageUrl: string;
  /** Display title. */
  title: string;
  /** Long-form description / caption. */
  description: string;
  /** Creation timestamp in milliseconds since epoch (normalized from bigint). */
  createdAt: number;
  /**
   * Optional event timestamp in milliseconds since epoch (normalized from
   * the backend nanosecond bigint). `undefined` when the backend omits it.
   */
  eventDate?: number;
  /** Free-form category label; defaults to 'Uncategorized' when empty. */
  category: string;
}

/**
 * Input payload for creating a new gallery item. The `imageUrl` is the
 * result of an object-storage upload (`useGalleryUpload`). `eventDate` is
 * an optional millisecond timestamp; `category` defaults to 'Uncategorized'
 * when omitted or empty.
 */
export interface CreateGalleryItemInput {
  imageUrl: string;
  title: string;
  description: string;
  /** Optional event timestamp in ms since epoch. Omit for no event date. */
  eventDate?: number;
  /** Category label; defaults to 'Uncategorized' when omitted or empty. */
  category?: string;
}

/**
 * Input payload for updating an existing gallery item. Image is not
 * editable here — only title, description, eventDate, and category
 * (matches the backend `updateGalleryItem(id, title, description,
 * eventDate, category)` signature).
 *
 * `eventDate` is three-valued to match the backend `?Timestamp` semantics:
 *   - `number`  → set the event date to this millisecond timestamp
 *   - `null`    → explicitly clear the existing event date
 *   - `undefined` (omitted) → preserve the existing event date. The hook
 *     reads the current value from the gallery query cache and passes it
 *     through, because the backend `updateItem` overwrites `eventDate`
 *     unconditionally (null clears it; there is no native "preserve").
 *
 * `category` is two-valued: an empty string preserves the existing backend
 * value (the backend handles that); a non-empty string sets it.
 */
export interface UpdateGalleryItemInput {
  id: number;
  title: string;
  description: string;
  /**
   * Event timestamp in ms since epoch. `number` sets it, `null` clears it,
   * `undefined` (omitted) preserves the existing value.
   */
  eventDate?: number | null;
  /** Category label; empty string preserves the existing backend value. */
  category?: string;
}

/**
 * Normalizes a backend `GalleryItem` (bigint id/createdAt/eventDate,
 * ExternalBlob image) into the frontend `GalleryItem` (number
 * id/createdAt/eventDate, string imageUrl). The backend `image` field is
 * an `ExternalBlob` instance whose `getDirectURL()` returns the opaque
 * proxy URL for inline display.
 *
 * `eventDate` is normalized from the optional backend nanosecond bigint to
 * a JS millisecond number when present, else left `undefined`. `category`
 * falls back to 'Uncategorized' when the backend returns an empty string
 * (defensive — the backend already defaults, but this guarantees the
 * frontend contract).
 */
export function toGalleryItem(item: BackendGalleryItem): GalleryItem {
  return {
    id: Number(item.id),
    imageUrl: item.image.getDirectURL(),
    title: item.title,
    description: item.description,
    // Backend `createdAt` is a nanosecond bigint (IC Timestamp). Convert to
    // milliseconds since epoch (JS Date unit) by dividing by 1e6 — otherwise
    // `new Date(Number(createdAt))` receives ~1.7e18 and returns Invalid,
    // which throws `RangeError: Invalid time value` from toLocaleDateString.
    createdAt: Number(item.createdAt) / 1_000_000,
    // `eventDate` is likewise a nanosecond bigint when present; apply the
    // same /1e6 conversion so consumers receive a JS millisecond timestamp.
    eventDate:
      typeof item.eventDate === "bigint"
        ? Number(item.eventDate) / 1_000_000
        : undefined,
    category: item.category || DEFAULT_GALLERY_CATEGORY,
  };
}

/** Query key for the gallery items list. Shared by queries + mutations. */
export const GALLERY_QUERY_KEY = ["gallery", "items"] as const;
