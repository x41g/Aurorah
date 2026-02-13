import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";
import { prisma } from "@/lib/prisma";

type Payload = { guildIds: string[] };

export async function POST(req: Request) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body || !Array.isArray(body.guildIds)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const guildIds = body.guildIds.map(String).filter(Boolean);

  await prisma.botState.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", guildIds },
    update: { guildIds },
  });

  return NextResponse.json({ ok: true, count: guildIds.length });
}
