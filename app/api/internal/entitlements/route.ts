import { NextResponse } from "next/server";
import { getEntitlementsForGuild } from "@/lib/entitlements";

export const runtime = "nodejs";

function assertAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.BOT_API_SECRET || "";
  if (!expected) throw new Error("BOT_API_SECRET missing");
  if (auth !== `Bearer ${expected}`) throw new Error("unauthorized");
}

export async function GET(req: Request) {
  try {
    assertAuth(req);
    const { searchParams } = new URL(req.url);
    const guildId = String(searchParams.get("guildId") || "").trim();
    if (!guildId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const ent = await getEntitlementsForGuild(guildId);
    return NextResponse.json({ ok: true, guildId, entitlements: ent });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg === "unauthorized") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
