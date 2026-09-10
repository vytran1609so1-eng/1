import { NextResponse } from "next/server";
import { getSupabase, isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Record one page view.
 *
 * Called by the browser once per page. It stores the address of the page and
 * the time, and nothing else — no IP address, no browser, no cookie, no
 * visitor id. That is a deliberate limit, not an oversight: it means the
 * numbers can say how often a page was read but can never say who read it.
 *
 * The reply is always 200. A counter is the least important thing on the site,
 * so if the table has not been created yet, or the database is briefly
 * unreachable, the visitor must never see an error because of it.
 */
export async function POST(request) {
  if (!isConfigured()) return NextResponse.json({ ok: true, counted: false });

  let path = "";
  try {
    ({ path } = await request.json());
  } catch (_) {
    return NextResponse.json({ ok: true, counted: false });
  }

  path = String(path ?? "").trim();

  /* Only real pages of this site, and never the admin: a view has to start
     with "/", must not be a full URL someone else typed in, and is capped so
     the table cannot be filled with rubbish. */
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 300)
    return NextResponse.json({ ok: true, counted: false });
  if (path.startsWith("/admin") || path.startsWith("/api"))
    return NextResponse.json({ ok: true, counted: false });

  try {
    await getSupabase().from("page_views").insert({ path });
  } catch (_) {
    /* Never let a counter break a page. */
  }

  return NextResponse.json({ ok: true, counted: true });
}
