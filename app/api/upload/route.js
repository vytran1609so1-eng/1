import { NextResponse } from "next/server";
import { getSupabase, isConfigured, authorized, IMAGE_BUCKET } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** Upload one image into Supabase Storage and return its public URL. */
export async function POST(request) {
  if (!isConfigured())
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  if (!authorized(request))
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  let form;
  try {
    form = await request.formData();
  } catch (_) {
    return NextResponse.json({ ok: false, reason: "bad_form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, reason: "no_file" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ ok: false, reason: "bad_type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, reason: "too_large" }, { status: 400 });
  }

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");

  /* The caller may ask for a specific object name. That is how the small
     preview copy gets stored right next to its full-size original, as
     "<original>-thumb.jpg", so the site can work out one URL from the other
     without storing a second column anywhere. */
  const asked = String(form.get("name") ?? "").trim();
  const safe = asked.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 120);
  const name = /^[a-zA-Z0-9]/.test(safe)
    ? safe
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;

  const supabase = getSupabase();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(name, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: Boolean(asked),
  });

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(name);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
