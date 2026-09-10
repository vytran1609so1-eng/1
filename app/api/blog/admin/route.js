import { NextResponse } from "next/server";
import { getSupabase, isConfigured, authorized, POSTS_TABLE } from "@/lib/supabase";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Postgres says this when supabase/schema.sql has never been run. */
const missingTable = (message) =>
  /relation .*blog_posts.* does not exist|could not find the table/i.test(String(message));

/**
 * A column the table does not have — what happens when the site has been
 * updated but the one-line `alter table … add column` was never run. The
 * message names the column, e.g.
 *   Could not find the 'cover_caption' column of 'blog_posts' in the schema cache
 *   column "cover_caption" of relation "blog_posts" does not exist
 * We pull the name out so the save can drop that one field and go through
 * anyway: losing a caption is much better than losing the whole post.
 */
function missingColumn(message) {
  const text = String(message ?? "");
  const found =
    text.match(/could not find the '([^']+)' column/i) ||
    text.match(/column "([^"]+)" of relation/i) ||
    text.match(/column ([a-z_]+) does not exist/i);
  return found ? found[1] : null;
}

/**
 * Run a write, and if the database turns out to be missing a column, drop that
 * column and try again. Bounded to a few attempts so a genuine failure still
 * surfaces. Returns the columns that had to be dropped, so the admin can say
 * which one-line SQL brings the feature back.
 */
async function writeTolerantly(run, data) {
  const payload = { ...data };
  const dropped = [];

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await run(payload);
    if (!result.error) return { ...result, dropped };

    const column = missingColumn(result.error.message);
    if (!column || !(column in payload)) return { ...result, dropped };

    delete payload[column];
    dropped.push(column);
  }

  return { data: null, error: { message: "too_many_missing_columns" }, dropped };
}

/** Turn a Supabase error into something the admin can act on. */
const reasonFor = (error) =>
  missingTable(error.message)
    ? "no_table"
    : /duplicate|unique/i.test(error.message)
    ? "slug_taken"
    : error.message;

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

  const { data: row, error, dropped } = await writeTolerantly(
    (fields) => getSupabase().from(POSTS_TABLE).insert(fields).select().single(),
    data
  );

  if (error)
    return NextResponse.json({ ok: false, reason: reasonFor(error) }, { status: 500 });

  return NextResponse.json({ ok: true, post: row, dropped });
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

  const { error, dropped } = await writeTolerantly(
    (fields) => getSupabase().from(POSTS_TABLE).update(fields).eq("id", id),
    data
  );

  if (error)
    return NextResponse.json({ ok: false, reason: reasonFor(error) }, { status: 500 });

  return NextResponse.json({ ok: true, dropped });
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
