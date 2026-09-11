import { NextResponse } from "next/server";
import { getSupabase, isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Record one measurement.
 *
 * Six things are recorded, and between them they answer the questions worth
 * asking about a portfolio: is anyone reading it, how far do they get, which
 * activity did they care enough to open, and did any of it end in them
 * reaching for the contact details.
 *
 *   view     a page was opened
 *   section  a section came into view — how far down the page people get
 *   entry    an activity was opened
 *   link     a contact link was clicked
 *   depth    how far down the page the reader reached, in percent
 *   read     how many seconds were spent on a blog post
 *
 * Still nothing about the reader: no IP address, no browser, no cookie, no
 * visitor id. Two views by the same person are indistinguishable from two
 * views by two people, and that is on purpose.
 *
 * The reply is always 200. If the table has not been created yet, or the
 * database is briefly unreachable, the visitor must never see an error because
 * a counter failed.
 */
const KINDS = new Set(["view", "section", "entry", "link", "depth", "read"]);

/** Postgres for a column the table has not got yet, and which column it was. */
function missingColumn(message) {
  const text = String(message ?? "");
  const found =
    text.match(/could not find the '([^']+)' column/i) ||
    text.match(/column "([^"]+)" of relation/i);
  return found ? found[1] : null;
}

export async function POST(request) {
  if (!isConfigured()) return NextResponse.json({ ok: true, counted: false });

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return NextResponse.json({ ok: true, counted: false });
  }

  const path = String(payload?.path ?? "").trim();
  const kind = String(payload?.kind ?? "view").trim();

  /* Only real pages of this site, and never the admin: an address has to start
     with "/", must not be a full URL someone else typed in, and is capped so
     the table cannot be filled with rubbish. */
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 300)
    return NextResponse.json({ ok: true, counted: false });
  if (path.startsWith("/admin") || path.startsWith("/api"))
    return NextResponse.json({ ok: true, counted: false });
  if (!KINDS.has(kind)) return NextResponse.json({ ok: true, counted: false });

  const label = String(payload?.label ?? "").trim().slice(0, 160) || null;

  /* A percentage or a number of seconds. Anything else is discarded rather
     than stored, so one broken browser cannot skew an average. */
  let value = null;
  if (Number.isFinite(+payload?.value)) {
    value = Math.round(+payload.value);
    if (value < 0 || value > 100000) value = null;
  }

  const row = { path, kind, label, value };

  try {
    const supabase = getSupabase();
    let { error } = await supabase.from("page_views").insert(row);

    /* The three columns beyond `path` were added after the table first
       shipped. If this database still has the older table, drop whichever
       column it is missing and record what we can — a plain page view is far
       better than nothing while the one-line ALTER goes unrun. */
    for (let attempt = 0; error && attempt < 3; attempt += 1) {
      const column = missingColumn(error.message);
      if (!column || !(column in row)) break;
      delete row[column];
      ({ error } = await supabase.from("page_views").insert(row));
    }
  } catch (_) {
    /* Never let a counter break a page. */
  }

  return NextResponse.json({ ok: true, counted: true });
}
