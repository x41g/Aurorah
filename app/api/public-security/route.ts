import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const turnstileSiteKey = String(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || ""
  ).trim();

  return NextResponse.json({
    ok: true,
    turnstileSiteKey,
  });
}

