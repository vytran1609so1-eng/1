import { NextResponse } from "next/server";
import { getSupabase, isConfigured, authorized, POSTS_TABLE } from "@/lib/supabase";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Postgres says this when supabase/schema.sql has never been run. */
const missingTable = (message) =>
  /relation .*blog_posts.* does not exist|could not find the table/i.test(String(message));

const guard = (request) => {
  if (!isConfigured())
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  if (!authorized(request))
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  return null;
};

/** Trim and validate what the blog form sends. */
function clean(body) {
  const title = String(body?.title ?? "").trim();
  if (!title) return { error: "missing_title" };

  const slug = slugify(body?.slug || title) || `bai-viet-${Date.now()}`;

  return {
    data: {
      title: title.slice(0, 200),
      slug,
      category: String(body?.category ?? "").trim().slice(0, 60) || null,
      excerpt: String(body?.excerpt ?? "").trim().slice(0, 400) || null,
      body: String(body?.body ?? "").slice(0, 80000) || null,
      cover: String(body?.cover ?? "").trim().slice(0, 500) || null,
      cover_caption: String(body?.cover_caption ?? "").trim().slice(0, 300) || null,
      cover_x: Number.isFinite(+body?.cover_x) ? Math.round(+body.cover_x) : 50,
      cover_y: Number.isFinite(+body?.cover_y) ? Math.round(+body.cover_y) : 50,
      cover_zoom: Number.isFinite(+body?.cover_zoom) ? +body.cover_zoom : 1,
      published_at: String(body?.published_at ?? "").trim() || null,
      published: body?.published === undefined ? true : Boolean(body.published),
      featured: Boolean(body?.featured),
      updated_at: new Date().toISOString(),
    },
  };
}

/* Everything, drafts included ------------------------------------------- */
export async function GET(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const { data, error } = await getSupabase()
    .from(POSTS_TABLE)
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (error)
    return NextResponse.json(
      { ok: false, reason: missingTable(error.message) ? "no_table" : error.message },
      { status: 500 }
    );
  return NextResponse.json({ ok: true, posts: data ?? [] });
}

/* Create ----------------------------------------------------------------- */
export async function POST(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const payload = await request.json();
  const { data, error: bad } = clean(payload);
  if (bad) return NextResponse.json({ ok: false, reason: bad }, { status: 400 });

  const { data: row, error } = await getSupabase()
    .from(POSTS_TABLE)
    .insert(data)
    .select()
    .single();

  if (error) {
    // The two mistakes worth explaining properly rather than in Postgres-speak.
    const reason = missingTable(error.message)
      ? "no_table"
      : /duplicate|unique/i.test(error.message)
      ? "slug_taken"
      : error.message;
    return NextResponse.json({ ok: false, reason }, { status: 500 });
  }
  return NextResponse.json({ ok: true, post: row });
}

/* Update ----------------------------------------------------------------- */
export async function PATCH(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const payload = await request.json();
  const id = payload?.id;
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  // Toggle-only calls: { id, published } or { id, featured }
  const keys = Object.keys(payload).filter((k) => k !== "id");
  if (keys.length === 1 && ["published", "featured"].includes(keys[0])) {
    const { error } = await getSupabase()
      .from(POSTS_TABLE)
      .update({ [keys[0]]: Boolean(payload[keys[0]]), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data, error: bad } = clean(payload);
  if (bad) return NextResponse.json({ ok: false, reason: bad }, { status: 400 });

  const { error } = await getSupabase().from(POSTS_TABLE).update(data).eq("id", id);
  if (error) {
    const reason = missingTable(error.message)
      ? "no_table"
      : /duplicate|unique/i.test(error.message)
      ? "slug_taken"
      : error.message;
    return NextResponse.json({ ok: false, reason }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/* Delete ----------------------------------------------------------------- */
export async function DELETE(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  const { error } = await getSupabase().from(POSTS_TABLE).delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
