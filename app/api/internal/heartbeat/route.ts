import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";
import { prisma } from "@/lib/prisma";

type Payload = {
  guildIds?: string[];
  // payload novo
  guilds?: Array<{ id: string; ownerId?: string | null }>;
};

export async function POST(req: Request) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const guilds = Array.isArray(body.guilds)
    ? body.guilds
        .map((g: any) => ({ id: String(g?.id || "").trim(), ownerId: g?.ownerId ? String(g.ownerId).trim() : null }))
        .filter((g: any) => g.id)
    : [];

  const guildIds = (Array.isArray(body.guildIds) ? body.guildIds.map(String) : []).map((s) => String(s).trim()).filter(Boolean);
  const mergedIds = guilds.length ? guilds.map((g) => g.id) : guildIds;
  if (!mergedIds.length) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  await prisma.botState.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", guildIds: mergedIds },
    update: { guildIds: mergedIds },
  });

  if (guilds.length) {
    for (const g of guilds) {
      if (!g.ownerId) continue;
      await prisma.guildOwner.upsert({
        where: { guildId: g.id },
        create: { guildId: g.id, ownerId: String(g.ownerId) },
        update: { ownerId: String(g.ownerId) },
      });
    }
  }

  return NextResponse.json({ ok: true, count: mergedIds.length });
}
