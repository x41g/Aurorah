import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const channelId = String(searchParams.get("channelId") || "").trim();
    if (!guildId || !channelId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const mem = await prisma.ticketAiMemory.findUnique({
      where: { guildId_channelId: { guildId, channelId } },
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
