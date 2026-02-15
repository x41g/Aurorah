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
  return NextResponse.json({ config: cfg as GuildConfig, entitlements: (access as any).entitlements || null });
}

export async function PUT(req: Request, { params }: { params: { guildId: string } }) {
  const { guildId } = params;
  const access = await canManageGuild(guildId);
  if (!access.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ent = (access as any).entitlements;
  if (ent && !ent.canEditConfig) {
    return NextResponse.json({ error: "subscription_required", entitlements: ent }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as GuildConfig | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const defaultTtl = Number(process.env.TRANSCRIPT_TTL_DAYS || 30);
const current = await prisma.guildConfig.findUnique({ where: { guildId: String(guildId) } });
const currentCfg = (current?.data as any) || {};

const transcriptEnabled =
  body.transcriptEnabled === undefined ? Boolean(currentCfg.transcriptEnabled) : Boolean(body.transcriptEnabled);

  // objeto final que realmente vai pro banco
  const finalCfg: GuildConfig = {
  staffRoleId: body.staffRoleId ? String(body.staffRoleId) : undefined,
  ticketCategoryId: body.ticketCategoryId ? String(body.ticketCategoryId) : undefined,
  logsChannelId: body.logsChannelId ? String(body.logsChannelId) : undefined,
  panelChannelId: body.panelChannelId ? String(body.panelChannelId) : undefined,

  transcriptEnabled,
  transcriptTtlDays:
    body.transcriptTtlDays == null || body.transcriptTtlDays === ("" as any)
      ? defaultTtl
      : Number(body.transcriptTtlDays) || defaultTtl,

  allowOpenRoleIds: Array.isArray(body.allowOpenRoleIds)
    ? body.allowOpenRoleIds.map(String).filter(Boolean)
    : undefined,

  maxOpenTicketsPerUser:
    Number.isFinite(Number(body.maxOpenTicketsPerUser)) ? Number(body.maxOpenTicketsPerUser) : undefined,

  cooldownSeconds:
    Number.isFinite(Number(body.cooldownSeconds)) ? Number(body.cooldownSeconds) : undefined,
};

  await prisma.guildConfig.upsert({
    where: { guildId: String(guildId) },
    create: { guildId: String(guildId), data: finalCfg as any },
    update: { data: finalCfg as any },
  });

  // se desativou transcript, invalida todos do servidor imediatamente
if (finalCfg.transcriptEnabled === false) {
  await prisma.transcript.updateMany({
    where: { guildId: String(guildId) },
    data: { expireAt: new Date(), html: "" },
  });
}
  return NextResponse.json({ ok: true });
}
