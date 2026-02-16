import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertInternalAuth } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!assertInternalAuth(req)) throw new Error("unauthorized");
    const { searchParams } = new URL(req.url);
    const guildId = String(searchParams.get("guildId") || "").trim();
    if (!guildId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const cfg = await prisma.guildAiConfig.findUnique({ where: { guildId } });
    return NextResponse.json({ config: cfg ?? null });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ error: msg === "unauthorized" ? "unauthorized" : "server_error" }, { status: msg === "unauthorized" ? 401 : 500 });
  }
}
