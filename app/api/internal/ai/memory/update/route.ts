import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertInternalAuth } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!assertInternalAuth(req)) throw new Error("unauthorized");
    const body = await req.json().catch(() => null);

    const guildId = String(body?.guildId || "").trim();
    const channelId = String(body?.channelId || "").trim();
    const authorId = String(body?.authorId || "").trim();
    const role = String(body?.role || "").trim(); // user | assistant | staff
    const content = String(body?.content || "");
    const summary = body?.summary != null ? String(body.summary) : null;

    if (!guildId || !channelId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    if (role && authorId && content) {
      await prisma.ticketAiMessage.create({
        data: { guildId, channelId, authorId, role, content },
      });
    }

    if (summary !== null) {
      // No schema atual, o model é TicketAIMemory (caps AI) e o unique é channelId.
      await prisma.ticketAIMemory.upsert({
        where: { channelId },
        create: { guildId, channelId, summary },
        update: { summary },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ error: msg === "unauthorized" ? "unauthorized" : "server_error" }, { status: msg === "unauthorized" ? 401 : 500 });
  }
}
