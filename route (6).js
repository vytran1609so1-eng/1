import { NextResponse } from "next/server";
import { secretKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Tells the admin page which pieces of configuration are still missing.
 * Returns booleans only — never a URL, never a key, never the password — so it
 * is safe to call before anyone has logged in (which is the point: without
 * ADMIN_PASSWORD there is no way to log in yet).
 */
export async function GET() {
  return NextResponse.json({
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    serviceKey: Boolean(secretKey()),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
  });
}
