import { NextResponse } from "next/server";
import { canManageGuild } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import type { GuildConfig } from "@/lib/types";

const empty: GuildConfig = {};

export async function GET(_: Request, { params }: { params: { guildId: string } }) {
  const { guildId } = params;
  const access = await canManageGuild(guildId);
  if (!access.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const row = await prisma.guildConfig.findUnique({ where: { guildId: String(guildId) } });
  const cfg = (row?.data as any) || empty;
  return NextResponse.json(cfg as GuildConfig);
}

export async function PUT(req: Request, { params }: { params: { guildId: string } }) {
  const { guildId } = params;
  const access = await canManageGuild(guildId);
  if (!access.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as GuildConfig | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const next: GuildConfig = {
    staffRoleId: body.staffRoleId || undefined,
    ticketCategoryId: body.ticketCategoryId || undefined,
    logsChannelId: body.logsChannelId || undefined,
    panelChannelId: body.panelChannelId || undefined,
    transcriptEnabled: Boolean(body.transcriptEnabled),
    transcriptTtlDays: Number.isFinite(Number(body.transcriptTtlDays)) ? Number(body.transcriptTtlDays) : undefined,
    allowOpenRoleIds: Array.isArray(body.allowOpenRoleIds) ? body.allowOpenRoleIds.map(String) : undefined,
    maxOpenTicketsPerUser: Number.isFinite(Number(body.maxOpenTicketsPerUser)) ? Number(body.maxOpenTicketsPerUser) : undefined,
    cooldownSeconds: Number.isFinite(Number(body.cooldownSeconds)) ? Number(body.cooldownSeconds) : undefined,
  };

  await prisma.guildConfig.upsert({
    where: { guildId: String(guildId) },
    create: { guildId: String(guildId), data: next as any },
    update: { data: next as any },
  });
  return NextResponse.json({ ok: true });
}
