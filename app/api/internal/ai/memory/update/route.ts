import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function assertAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.BOT_API_SECRET || "";
  if (!expected) throw new Error("BOT_API_SECRET missing");
  if (auth !== `Bearer ${expected}`) throw new Error("unauthorized");
}

export async function POST(req: Request) {
  try {
    assertAuth(req);
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
      await prisma.ticketAIMemory.upsert({
        where: { channelId },
        create: { guildId, channelId, summary },
        update: { summary },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json(
      { error: msg === "unauthorized" ? "unauthorized" : "server_error" },
      { status: msg === "unauthorized" ? 401 : 500 }
    );
  }
}
