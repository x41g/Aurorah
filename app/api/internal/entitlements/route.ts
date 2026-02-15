import { NextResponse } from "next/server";
import { getGuildEntitlements } from "@/lib/entitlements";

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

    const ent = await getGuildEntitlements(guildId);
    return NextResponse.json({ ok: true, entitlements: ent });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ error: msg === "unauthorized" ? "unauthorized" : "server_error" }, { status: msg === "unauthorized" ? 401 : 500 });
  }
}
