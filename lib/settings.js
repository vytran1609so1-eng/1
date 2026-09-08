import { defaultSettings } from "./content";
import { DEFAULT_IMAGES } from "./images";

/**
 * Merge whatever is stored in the database on top of the defaults in
 * lib/content.js. Arrays are replaced wholesale (a saved list of categories
 * replaces the default list); objects are merged key by key at every depth, so
 * a partial save never wipes fields the admin form did not touch.
 */
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Recursive merge: objects key by key at any depth, arrays replaced whole. */
function deepMerge(base, next) {
  if (next === undefined || next === null) return base;
  if (Array.isArray(base)) return Array.isArray(next) ? next : base;
  if (!isPlainObject(base) || !isPlainObject(next)) return next;

  const out = { ...base };
  for (const key of Object.keys(next)) {
    out[key] = key in base ? deepMerge(base[key], next[key]) : next[key];
  }
  return out;
}

export function mergeSettings(saved) {
  if (!saved || typeof saved !== "object") return withImages(defaultSettings);
  return withImages(deepMerge(defaultSettings, saved));
}

/** Fold the uploaded image overrides onto the slot defaults from lib/images.js */
function withImages(settings) {
  const images = { ...DEFAULT_IMAGES };
  Object.entries(settings.images || {}).forEach(([k, v]) => {
    if (!v) return;
    images[k] = { ...(images[k] || { x: 50, y: 50, zoom: 1 }), ...v };
  });
  return { ...settings, resolvedImages: images };
}

/** Categories in display order: assigned to a keyword first, then the rest. */
export function orderedCategories(settings) {
  const order = (settings.keywords || []).map((k) => k.id);
  const cats = settings.categories || [];
  const rank = (c) => {
    const i = order.indexOf(c.keyword);
    return i === -1 ? order.length + 1 : i;
  };
  return [...cats].sort((a, b) => rank(a) - rank(b));
}

/** The categories that belong to one keyword. */
export function categoriesForKeyword(settings, keywordId) {
  return (settings.categories || []).filter((c) => c.keyword === keywordId);
}

/** Categories with no keyword — shown at the bottom of the portfolio. */
export function unassignedCategories(settings) {
  const order = (settings.keywords || []).map((k) => k.id);
  return (settings.categories || []).filter((c) => !order.includes(c.keyword));
}
