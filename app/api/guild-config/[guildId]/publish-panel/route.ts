import { NextResponse } from "next/server";
import { canManageGuild } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { publishGuildConfig } from "@/lib/guildConfigEvents";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { guildId: string } }) {
  const guildId = String(params?.guildId || "").trim();
  if (!guildId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const access = await canManageGuild(guildId);
  if (!access.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ent = (access as any).entitlements;
  if (ent && !ent.canEditConfig) {
    return NextResponse.json({ error: "subscription_required", entitlements: ent }, { status: 403 });
  }

  const row = await prisma.guildConfig.findUnique({ where: { guildId } });
  const cfg = (row?.data as any) || {};
  const requestedAt = Date.now();

  const nextCfg = {
    ...cfg,
    ticketPublishRequestAt: requestedAt,
  };

  await prisma.guildConfig.upsert({
    where: { guildId },
    create: { guildId, data: nextCfg as any },
    update: { data: nextCfg as any },
  });

  publishGuildConfig({
    guildId,
    updatedAt: requestedAt,
  });

  return NextResponse.json({ ok: true, requestedAt });
}

