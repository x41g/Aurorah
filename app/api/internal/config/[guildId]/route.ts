import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";
import { prisma } from "@/lib/prisma";
import type { GuildConfig } from "@/lib/types";
import { publishGuildConfig } from "@/lib/guildConfigEvents";

export async function GET(req: Request, { params }: { params: { guildId: string } }) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const row = await prisma.guildConfig.findUnique({ where: { guildId: String(params.guildId) } });
  const cfg = (row?.data as any) || {};
  return NextResponse.json({
    config: cfg as GuildConfig,
    updatedAt: row?.updatedAt ? new Date(row.updatedAt).getTime() : 0,
  });
}

export async function PUT(req: Request, { params }: { params: { guildId: string } }) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as GuildConfig | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const guildId = String(params.guildId);
  const saved = await prisma.guildConfig.upsert({
    where: { guildId },
    create: { guildId, data: body as any },
    update: { data: body as any },
  });

  publishGuildConfig({
    guildId,
    updatedAt: new Date(saved.updatedAt).getTime(),
    clientId: "bot-sync",
  });

  return NextResponse.json({ ok: true });
}
