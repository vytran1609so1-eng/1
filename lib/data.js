import "server-only";
import { cache } from "react";
import { getSupabase, isConfigured, ENTRIES_TABLE, SETTINGS_TABLE, POSTS_TABLE } from "./supabase";
import { mergeSettings, sortEntries } from "./settings";
import { seedEntries } from "./seed-entries";

/**
 * Server-side data loading. Pages call these directly so the first paint
 * already has the real content — no flash of defaults, no client fetch.
 */

export const getSettings = cache(async function getSettings() {
  if (!isConfigured()) return mergeSettings(null);
  try {
    const { data, error } = await getSupabase()
      .from(SETTINGS_TABLE)
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    if (error) return mergeSettings(null);
    return mergeSettings(data?.data);
  } catch (_) {
    return mergeSettings(null);
  }
});

/** Turn a database row into the same shape the seed entries use. */
export function fromRow(row) {
  return {
    id: row.id,
    dbId: row.id,
    category: row.category,
    title: row.title,
    role: row.role || "",
    period: row.period || "",
    sortDate: row.sort_date || row.created_at?.slice(0, 10) || "",
    summary: row.summary || "",
    body: row.body || "",
    highlights: row.highlights || [],
    photos: row.photo_slots || [],
    imageUrls: row.images || [],
    links: row.links || [],
    inPortfolio: row.in_portfolio !== false,
    published: row.published !== false,
  };
}

/**
 * Every publicly visible activity, newest first.
 * Before you press "Import CV entries" in /admin the seed file is the source;
 * afterwards the database is, and the seed file is ignored.
 */
export async function getEntries(settings) {
  let rows = [];

  if (isConfigured()) {
    try {
      const { data, error } = await getSupabase()
        .from(ENTRIES_TABLE)
        .select("*")
        .eq("published", true)
        .order("sort_date", { ascending: false, nullsFirst: false })
        .limit(500);
      if (!error && data) rows = data.map(fromRow);
    } catch (_) {}
  }

  /**
   * The seed file is a fallback, never an addition: the moment the database
   * holds a single activity, it is the only source. Mixing the two is what
   * used to show every activity twice.
   */
  const list =
    rows.length > 0
      ? rows
      : seedEntries.map((e) => ({ ...e, inPortfolio: e.inPortfolio !== false }));

  return sortEntries(list, settings);
}

/* ==========================================================================
 *  BLOG
 * ======================================================================== */

/** Turn a database row into the shape the blog pages read. */
export function fromPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category || "",
    excerpt: row.excerpt || "",
    body: row.body || "",
    cover: row.cover || "",
    coverX: row.cover_x ?? 50,
    coverY: row.cover_y ?? 50,
    coverZoom: row.cover_zoom ?? 1,
    date: row.published_at || row.created_at?.slice(0, 10) || "",
    published: row.published !== false,
    featured: Boolean(row.featured),
    /** Rough reading time, the way a magazine prints it. */
    minutes: Math.max(1, Math.round(String(row.body || "").split(/\s+/).length / 200)),
  };
}

/** Every published post, newest first. */
export async function getPosts() {
  if (!isConfigured()) return [];
  try {
    const { data, error } = await getSupabase()
      .from(POSTS_TABLE)
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(300);
    if (error || !data) return [];
    return data.map(fromPost);
  } catch (_) {
    return [];
  }
}

/** One post by its address. Returns null when there is nothing to show. */
export async function getPost(slug) {
  if (!isConfigured() || !slug) return null;
  try {
    const { data, error } = await getSupabase()
      .from(POSTS_TABLE)
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error || !data) return null;
    return fromPost(data);
  } catch (_) {
    return null;
  }
}
