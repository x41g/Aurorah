import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertInternalAuth } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!assertInternalAuth(req)) throw new Error("unauthorized");
    const { searchParams } = new URL(req.url);
    const guildId = String(searchParams.get("guildId") || "").trim();
    const channelId = String(searchParams.get("channelId") || "").trim();
    if (!guildId || !channelId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const mem = await prisma.ticketAIMemory.findFirst({
      where: { guildId, channelId },
    });

    const msgs = await prisma.ticketAiMessage.findMany({
      where: { guildId, channelId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      summary: mem?.summary ?? "",
      messages: msgs.reverse(),
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ error: msg === "unauthorized" ? "unauthorized" : "server_error" }, { status: msg === "unauthorized" ? 401 : 500 });
  }
}
