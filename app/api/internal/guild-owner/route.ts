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
    const ownerId = String(body?.ownerId || "").trim();
    if (!guildId || !ownerId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    await prisma.guildOwner.upsert({
      where: { guildId },
      create: { guildId, ownerId },
      update: { ownerId },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json(
      { error: msg === "unauthorized" ? "unauthorized" : "server_error" },
      { status: msg === "unauthorized" ? 401 : 500 }
    );
  }
}
