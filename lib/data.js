import "server-only";
import { cache } from "react";
import { getSupabase, isConfigured, ENTRIES_TABLE, SETTINGS_TABLE } from "./supabase";
import { mergeSettings } from "./settings";
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

  return list.sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || ""));
}
