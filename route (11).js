import { NextResponse } from "next/server";
import { getSupabase, isConfigured, ENTRIES_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* Published portfolio entries, newest first. */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(ENTRIES_TABLE)
    .select(
      "*"
    )
    .eq("published", true)
    .order("sort_date", { ascending: false, nullsFirst: false })
    .limit(300);

  if (error) {
    return NextResponse.json(
      { configured: true, entries: [], error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ configured: true, entries: data ?? [] });
}
