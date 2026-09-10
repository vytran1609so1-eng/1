import { NextResponse } from "next/server";
import { getSupabase, isConfigured, authorized, POSTS_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Postgres says this when section 7 of supabase/schema.sql has never been run. */
const missingTable = (message) =>
  /relation .*page_views.* does not exist|could not find the table/i.test(String(message));

const DAY = 24 * 60 * 60 * 1000;

/**
 * The numbers behind /admin → Lượt xem.
 *
 * The tallying happens here rather than in the database because Postgres
 * grouping is not something supabase-js can express directly, and because at
 * the size of a personal site — tens of thousands of rows at most — reading
 * the columns and counting them in one pass is both simpler and faster than
 * several round trips. Only `path` and `created_at` are read, so even a large
 * table stays a small response.
 */
export async function GET(request) {
  if (!isConfigured())
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  if (!authorized(request))
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const { data, error } = await getSupabase()
    .from("page_views")
    .select("path, created_at")
    .order("created_at", { ascending: false })
    .limit(100000);

  if (error)
    return NextResponse.json(
      { ok: false, reason: missingTable(error.message) ? "no_table" : error.message },
      { status: 500 }
    );

  const rows = data || [];
  const now = Date.now();
  const since7 = now - 7 * DAY;
  const since30 = now - 30 * DAY;

  const byPath = new Map();
  let last7 = 0;
  let last30 = 0;
  /* Views per day for the last 30 days, oldest first — enough for a small bar
     chart without sending 100,000 timestamps to the browser. */
  const perDay = new Map();

  for (const row of rows) {
    const at = new Date(row.created_at).getTime();
    const path = row.path || "/";

    const entry = byPath.get(path) || { path, total: 0, last7: 0, last30: 0 };
    entry.total += 1;
    if (at >= since7) entry.last7 += 1;
    if (at >= since30) entry.last30 += 1;
    byPath.set(path, entry);

    if (at >= since7) last7 += 1;
    if (at >= since30) {
      last30 += 1;
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      perDay.set(day, (perDay.get(day) || 0) + 1);
    }
  }

  /* The titles, so the blog table reads as posts rather than as addresses. */
  let posts = [];
  try {
    const { data: postRows } = await getSupabase()
      .from(POSTS_TABLE)
      .select("slug, title, published")
      .limit(300);
    posts = postRows || [];
  } catch (_) {}

  const pages = [...byPath.values()].sort((a, b) => b.total - a.total);

  return NextResponse.json({
    ok: true,
    total: rows.length,
    last7,
    last30,
    firstSeen: rows.length ? rows[rows.length - 1].created_at : null,
    pages,
    posts,
    perDay: [...perDay.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  });
}

/** Wipe the log — for clearing out the views you generated yourself while
 *  building the site, so the real numbers start from a clean slate. */
export async function DELETE(request) {
  if (!isConfigured())
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  if (!authorized(request))
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const { error } = await getSupabase().from("page_views").delete().gt("id", 0);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
