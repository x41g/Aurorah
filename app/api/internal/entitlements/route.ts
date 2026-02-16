import { NextResponse } from "next/server";
import { getGuildEntitlements } from "@/lib/entitlements";
import { assertInternalAuth } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!assertInternalAuth(req)) throw new Error("unauthorized");
    const { searchParams } = new URL(req.url);
    const guildId = String(searchParams.get("guildId") || "").trim();
    const ownerId = String(searchParams.get("ownerId") || "").trim();
    if (!guildId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    if (ownerId) {
      const { prisma } = await import("@/lib/prisma");
      await prisma.guildOwner.upsert({
        where: { guildId },
        create: { guildId, ownerId },
        update: { ownerId },
      });
    }

    const ent = await getGuildEntitlements(guildId);
    return NextResponse.json({ ok: true, entitlements: ent });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ error: msg === "unauthorized" ? "unauthorized" : "server_error" }, { status: msg === "unauthorized" ? 401 : 500 });
  }
}
