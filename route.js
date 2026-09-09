import { NextResponse } from "next/server";
import { getSupabase, isConfigured, authorized, GUESTBOOK_TABLE as TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* Xem toàn bộ lời nhắn, kể cả chưa duyệt ----------------------------------- */
export async function GET(request) {
  if (!isConfigured()) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, name, relation, message, approved, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, entries: data ?? [] });
}

/* Duyệt / bỏ duyệt --------------------------------------------------------- */
export async function PATCH(request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }
  const { id, approved } = await request.json();
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase
    .from(TABLE)
    .update({ approved: Boolean(approved) })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/* Xoá vĩnh viễn ------------------------------------------------------------ */
export async function DELETE(request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
