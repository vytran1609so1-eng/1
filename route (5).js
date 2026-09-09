import { NextResponse } from "next/server";
import { getSupabase, isConfigured, GUESTBOOK_TABLE as TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_NAME = 60;
const MAX_RELATION = 80;
const MAX_MESSAGE = 900;

/* Đọc các lời nhắn đã được duyệt ------------------------------------------- */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, entries: [] });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, name, relation, message, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json(
      { configured: true, entries: [], error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ configured: true, entries: data ?? [] });
}

/* Gửi lời nhắn mới (mặc định chưa duyệt) ----------------------------------- */
export async function POST(request) {
  if (!isConfigured()) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  // Bẫy bot: trường ẩn, người thật sẽ không bao giờ điền
  if (body?.website) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const name = String(body?.name ?? "").trim();
  const relation = String(body?.relation ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || !message) {
    return NextResponse.json({ ok: false, reason: "missing" }, { status: 400 });
  }
  if (
    name.length > MAX_NAME ||
    relation.length > MAX_RELATION ||
    message.length > MAX_MESSAGE
  ) {
    return NextResponse.json({ ok: false, reason: "too_long" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from(TABLE).insert({
    name,
    relation: relation || null,
    message,
    approved: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
