import { NextResponse } from "next/server";
import {
  getSupabase,
  isConfigured,
  authorized,
  ENTRIES_TABLE,
  SETTINGS_TABLE,
} from "@/lib/supabase";
import { seedEntries } from "@/lib/seed-entries";
import { defaultSettings } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID = new Set(defaultSettings.categories.map((c) => c.id));

/**
 * Identity of an activity for duplicate-detection: same section, same title,
 * same period. The period is part of it on purpose — running the same
 * competition in two different years is two activities, not a duplicate.
 */
const norm = (v) => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const dupKey = (category, title, period) =>
  `${norm(category)}::${norm(title)}::${norm(period)}`;

const guard = (request) => {
  if (!isConfigured())
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  if (!authorized(request))
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  return null;
};

/** Trim and validate what the admin form sends. */
function clean(body, { allowAnyCategory = false } = {}) {
  const title = String(body?.title ?? "").trim();
  const category = String(body?.category ?? "").trim();
  if (!title) return { error: "missing_title" };
  if (!category || (!allowAnyCategory && !VALID.has(category)))
    return { error: "bad_category" };

  const arr = (v) =>
    Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 30) : [];

  const links = Array.isArray(body?.links)
    ? body.links
        .filter((l) => l && String(l.url || "").trim())
        .map((l) => ({
          label: String(l.label || "Link").trim().slice(0, 80),
          url: String(l.url).trim().slice(0, 500),
        }))
        .slice(0, 10)
    : [];

  return {
    data: {
      title: title.slice(0, 200),
      category,
      role: String(body?.role ?? "").trim().slice(0, 200) || null,
      period: String(body?.period ?? "").trim().slice(0, 120) || null,
      sort_date: String(body?.sort_date ?? "").trim() || null,
      summary: String(body?.summary ?? "").trim().slice(0, 400) || null,
      body: String(body?.body ?? "").trim().slice(0, 6000) || null,
      highlights: arr(body?.highlights),
      images: arr(body?.images),
      photo_slots: arr(body?.photo_slots),
      links,
      in_portfolio: body?.in_portfolio === undefined ? true : Boolean(body.in_portfolio),
      published: body?.published === undefined ? true : Boolean(body.published),
    },
  };
}

/* Everything, published or not ------------------------------------------- */
export async function GET(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const { data, error } = await getSupabase()
    .from(ENTRIES_TABLE)
    .select("*")
    .order("sort_date", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entries: data ?? [] });
}

/* Create — or import the CV entries in one go ---------------------------- */
export async function POST(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const payload = await request.json();

  /* ---- remove duplicate activities, keeping the oldest copy of each ---- */
  if (payload?.action === "dedupe") {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(ENTRIES_TABLE)
      .select("id, title, category, period, created_at")
      .limit(2000);
    if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });

    const seen = new Map();
    const doomed = [];
    for (const row of [...(data ?? [])].sort((a, b) =>
      String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")) ||
      String(a.id).localeCompare(String(b.id))
    )) {
      const key = dupKey(row.category, row.title, row.period);
      if (seen.has(key)) doomed.push(row.id);
      else seen.set(key, row.id);
    }

    if (doomed.length) {
      // delete in batches so a very long id list never blows the URL length
      for (let i = 0; i < doomed.length; i += 100) {
        const { error: delError } = await supabase
          .from(ENTRIES_TABLE)
          .delete()
          .in("id", doomed.slice(i, i + 100));
        if (delError)
          return NextResponse.json({ ok: false, reason: delError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, removed: doomed.length, kept: seen.size });
  }

  /* ---- one-click import of the 13 entries that came off the CV ---- */
  if (payload?.action === "import_seed") {
    const supabase = getSupabase();

    // Idempotency: never insert an activity that is already stored. Pressing
    // the button twice (or a retried request) is a no-op instead of a copy.
    const { data: existing, error: readError } = await supabase
      .from(ENTRIES_TABLE)
      .select("title, category, period")
      .limit(2000);
    if (readError)
      return NextResponse.json({ ok: false, reason: readError.message }, { status: 500 });

    const have = new Set(
      (existing ?? []).map((r) => dupKey(r.category, r.title, r.period))
    );

    const rows = seedEntries
      .filter((e) => !have.has(dupKey(e.category, e.title, e.period)))
      .map((e) => ({
        title: e.title,
        category: e.category,
        role: e.role || null,
        period: e.period || null,
        sort_date: e.sortDate || null,
        summary: e.summary || null,
        body: e.body || null,
        highlights: e.highlights || [],
        images: [],
        photo_slots: e.photos || [],
        links: e.links || [],
        in_portfolio: e.inPortfolio !== false,
        published: true,
      }));

    if (rows.length) {
      const { error } = await supabase.from(ENTRIES_TABLE).insert(rows);
      if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
    }

    // flip the flag so the site stops reading the seed file
    const { data: cur } = await supabase
      .from(SETTINGS_TABLE)
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    const next = { ...(cur?.data || {}), seedImported: true };
    await supabase
      .from(SETTINGS_TABLE)
      .upsert({ id: "main", data: next, updated_at: new Date().toISOString() });

    return NextResponse.json({
      ok: true,
      imported: rows.length,
      skipped: seedEntries.length - rows.length,
    });
  }

  /* ---- normal create ---- */
  const { data, error: bad } = clean(payload);
  if (bad) return NextResponse.json({ ok: false, reason: bad }, { status: 400 });

  const { data: row, error } = await getSupabase()
    .from(ENTRIES_TABLE)
    .insert(data)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entry: row });
}

/* Update ----------------------------------------------------------------- */
export async function PATCH(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const payload = await request.json();
  const id = payload?.id;
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  // Toggle-only calls: { id, published } or { id, in_portfolio }
  const keys = Object.keys(payload).filter((k) => k !== "id");
  if (keys.length === 1 && ["published", "in_portfolio"].includes(keys[0])) {
    const { error } = await getSupabase()
      .from(ENTRIES_TABLE)
      .update({ [keys[0]]: Boolean(payload[keys[0]]) })
      .eq("id", id);
    if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data, error: bad } = clean(payload);
  if (bad) return NextResponse.json({ ok: false, reason: bad }, { status: 400 });

  const { error } = await getSupabase().from(ENTRIES_TABLE).update(data).eq("id", id);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/* Delete ----------------------------------------------------------------- */
export async function DELETE(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  const { error } = await getSupabase().from(ENTRIES_TABLE).delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
