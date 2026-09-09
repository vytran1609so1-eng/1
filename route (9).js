import { NextResponse } from "next/server";
import { getSupabase, isConfigured, authorized, SETTINGS_TABLE } from "@/lib/supabase";
import { mergeSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* Read the merged settings (public — used by the admin form to prefill). */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, settings: mergeSettings(null) });
  }
  const { data, error } = await getSupabase()
    .from(SETTINGS_TABLE)
    .select("data")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { configured: true, settings: mergeSettings(null), error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ configured: true, settings: mergeSettings(data?.data) });
}

/* Save settings — the whole object, written by /admin. */
export async function PUT(request) {
  if (!isConfigured())
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  if (!authorized(request))
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  // `resolvedImages` is computed at read time — never store it
  const { resolvedImages, ...clean } = payload?.settings ?? {};

  const { error } = await getSupabase()
    .from(SETTINGS_TABLE)
    .upsert({ id: "main", data: clean, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
