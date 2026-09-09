/**
 * Shrink a picked photo in the browser before it is uploaded.
 *
 * A photo straight off a phone is 4000px wide and several megabytes. Nothing
 * on the site is displayed larger than about 1600px, so uploading the original
 * only makes every visitor wait — and makes scrolling stutter while the
 * browser decodes it. This resizes on a canvas first; the file that reaches
 * Supabase is typically 200–400 KB.
 *
 * Anything it cannot handle (an odd format, a browser without canvas) is
 * returned untouched, so an upload never fails because of this step.
 */
const MAX_EDGE = 1800;
const QUALITY = 0.82;

/* A thumbnail is what almost every visitor actually sees: the picture that
   flies out under the cursor, the grid inside a pop-up, a strip of photos.
   640px is plenty for all of those and lands around 60 KB. */
export const THUMB_EDGE = 640;
export const THUMB_QUALITY = 0.72;

export async function shrinkImage(file, { maxEdge = MAX_EDGE, quality = QUALITY, force = false } = {}) {
  if (typeof window === "undefined" || !file || !file.type?.startsWith("image/")) return file;
  // GIFs may be animated — resizing would flatten them to one frame.
  if (file.type === "image/gif") return file;
  if (!force && file.size < 320 * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;
    if (!force && blob.size >= file.size) return file;

    const name = (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch (_) {
    return file;
  }
}

/**
 * A small copy of the same picture, for grids and hover previews.
 * Returns null if the browser cannot make one — callers then simply use the
 * full-size file, which still works, just weighs more.
 */
export async function makeThumb(file) {
  if (!file || file.type === "image/gif") return null;
  const thumb = await shrinkImage(file, {
    maxEdge: THUMB_EDGE,
    quality: THUMB_QUALITY,
    force: true,
  });
  return thumb === file ? null : thumb;
}
