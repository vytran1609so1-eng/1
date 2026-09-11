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

/**
 * The sections, in the order the portfolio should print them.
 *
 * Two orders, and the manual one always wins:
 *
 *  · If `settings.categoryOrder` lists section ids — set with the ↑ ↓ buttons
 *    in /admin → Sections — that is the order, full stop. Anything not listed
 *    follows behind, so adding a new section never makes it disappear.
 *
 *  · With no manual order, sections fall in behind their keyword, which is how
 *    the portfolio has always grouped itself.
 *
 * The manual order exists because grouping by keyword cannot express "Work
 * Experience belongs directly under Academic" when the two sit under different
 * keywords — and sometimes that is exactly the order the reader needs.
 */
export function orderedCategories(settings) {
  const cats = settings.categories || [];
  const manual = (settings.categoryOrder || []).filter((id) =>
    cats.some((c) => c.id === id)
  );

  if (manual.length) {
    const listed = manual.map((id) => cats.find((c) => c.id === id));
    const rest = cats.filter((c) => !manual.includes(c.id));
    return [...listed, ...rest];
  }

  const order = (settings.keywords || []).map((k) => k.id);
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

/**
 * Put a list of activities in the order Vy chose in /admin.
 *
 * `settings.entryOrder` holds, per section, the ids she arranged by hand.
 * Anything she has not touched keeps the old behaviour — newest first — and
 * sits below the arranged ones. A section she has never reordered therefore
 * looks exactly as it always did.
 */
export function sortEntries(entries, settings) {
  const order = settings?.entryOrder || {};
  const rankOf = (e) => {
    const list = order[e.category];
    if (!Array.isArray(list)) return Infinity;
    const i = list.indexOf(e.dbId ?? e.id);
    return i === -1 ? Infinity : i;
  };

  return [...(entries || [])].sort((a, b) => {
    const ra = rankOf(a);
    const rb = rankOf(b);
    if (ra !== rb) return ra - rb;
    return (b.sortDate || "").localeCompare(a.sortDate || "");
  });
}

/**
 * ============================================================================
 *  WHICH KEYWORDS AN ACTIVITY BELONGS TO
 * ============================================================================
 *  Originally an activity inherited its keyword from its section: everything
 *  filed under "Leadership" appeared on the Leadership page, and there was no
 *  way to say that one particular piece of work belonged under two headings.
 *
 *  Now an activity can be assigned directly, in /admin → Activities, and those
 *  choices live in `settings.entryKeywords`:
 *
 *      { "<activity id>": ["excellence", "leadership"] }
 *
 *  The fallback is what makes this safe to introduce: an activity that has
 *  never been ticked is not orphaned — it keeps inheriting from its section,
 *  exactly as before. So the site looks identical until the first tick, and
 *  each activity can be moved over one at a time.
 *
 *  An empty array is a real answer, not a missing one: it means "show this
 *  nowhere", and is kept as such.
 * ========================================================================= */
export function keywordsForEntry(entry, settings) {
  const chosen = (settings?.entryKeywords || {})[entry?.id];
  if (Array.isArray(chosen)) return chosen;

  const section = (settings?.categories || []).find((c) => c.id === entry?.category);
  return section?.keyword ? [section.keyword] : [];
}

/** The activities shown on one keyword page, in the site's usual order. */
export function entriesForKeyword(entries, settings, keywordId) {
  return (entries || []).filter(
    (entry) =>
      entry.inPortfolio !== false && keywordsForEntry(entry, settings).includes(keywordId)
  );
}
