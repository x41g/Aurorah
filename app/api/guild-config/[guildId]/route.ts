import { NextResponse } from "next/server";
import { canManageGuild } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import type { GuildConfig } from "@/lib/types";
import {
  defaultPromptSecurityPolicy,
  sanitizePrompt,
  validatePromptSecurity,
} from "@/lib/promptSecurity";

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

  const aiPolicy = {
    ...defaultPromptSecurityPolicy,
    ...(body.aiPromptSecurity || {}),
  };

  const rawPrompt = String(body.aiPrompt || "");
  const sanitizedPrompt = sanitizePrompt(rawPrompt, aiPolicy);
  const promptValidation = validatePromptSecurity(sanitizedPrompt, aiPolicy);
  if (!promptValidation.ok) {
    return NextResponse.json({ error: promptValidation.error }, { status: 400 });
  }

  const finalCfg: GuildConfig = {
    staffRoleId: body.staffRoleId ? String(body.staffRoleId) : undefined,
    ticketCategoryId: body.ticketCategoryId ? String(body.ticketCategoryId) : undefined,
    logsChannelId: body.logsChannelId ? String(body.logsChannelId) : undefined,
    panelChannelId: body.panelChannelId ? String(body.panelChannelId) : undefined,
    panelImageUrl: body.panelImageUrl ? String(body.panelImageUrl) : undefined,

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

    ticketSystemEnabled: body.ticketSystemEnabled === undefined ? undefined : Boolean(body.ticketSystemEnabled),
    ticketOpenMode: body.ticketOpenMode === "select" ? "select" : "buttons",
    ticketCreateMode: body.ticketCreateMode === "thread" ? "thread" : "category",
    ticketButtonEmoji: body.ticketButtonEmoji ? String(body.ticketButtonEmoji) : undefined,
    ticketButtonStyle: Number.isFinite(Number(body.ticketButtonStyle))
      ? Number(body.ticketButtonStyle)
      : undefined,
    ticketAppearanceMode: body.ticketAppearanceMode === "content" ? "content" : "embed",
    ticketEmbedTitle: body.ticketEmbedTitle ? String(body.ticketEmbedTitle) : undefined,
    ticketEmbedDescription: body.ticketEmbedDescription ? String(body.ticketEmbedDescription) : undefined,
    ticketEmbedColor: body.ticketEmbedColor ? String(body.ticketEmbedColor) : undefined,
    ticketEmbedBannerUrl: body.ticketEmbedBannerUrl ? String(body.ticketEmbedBannerUrl) : undefined,
    ticketEmbedThumbUrl: body.ticketEmbedThumbUrl ? String(body.ticketEmbedThumbUrl) : undefined,
    ticketContentText: body.ticketContentText ? String(body.ticketContentText) : undefined,
    ticketFunctions: Array.isArray(body.ticketFunctions)
      ? body.ticketFunctions.map((f: any) => ({
          name: String(f?.name || "").trim(),
          preDescription: f?.preDescription ? String(f.preDescription) : "",
          description: f?.description ? String(f.description) : "",
          emoji: f?.emoji ? String(f.emoji) : "",
          enabled: f?.enabled !== false,
        })).filter((f: any) => Boolean(f.name)).slice(0, 25)
      : undefined,
    ticketForms:
      body.ticketForms && typeof body.ticketForms === "object"
        ? (body.ticketForms as GuildConfig["ticketForms"])
        : undefined,

    aiEnabled: body.aiEnabled === undefined ? undefined : Boolean(body.aiEnabled),
    aiModel: body.aiModel ? String(body.aiModel) : undefined,
    aiPrompt: sanitizedPrompt || undefined,
    aiPromptSecurity: aiPolicy,

    paymentAutoEnabled: body.paymentAutoEnabled === undefined ? undefined : Boolean(body.paymentAutoEnabled),
    paymentAccessToken: body.paymentAccessToken ? String(body.paymentAccessToken) : undefined,
    safePayEnabled: body.safePayEnabled === undefined ? undefined : Boolean(body.safePayEnabled),
    safePayBanksOff: Array.isArray(body.safePayBanksOff) ? body.safePayBanksOff.map(String).slice(0, 10) : undefined,
    paymentSemiEnabled: body.paymentSemiEnabled === undefined ? undefined : Boolean(body.paymentSemiEnabled),
    paymentSemiKey: body.paymentSemiKey ? String(body.paymentSemiKey) : undefined,
    paymentSemiType: body.paymentSemiType ? String(body.paymentSemiType) : undefined,
    paymentSemiApproverRoleId: body.paymentSemiApproverRoleId ? String(body.paymentSemiApproverRoleId) : undefined,

    featureRenameTicket: body.featureRenameTicket === undefined ? undefined : Boolean(body.featureRenameTicket),
    featureNotifyUser: body.featureNotifyUser === undefined ? undefined : Boolean(body.featureNotifyUser),
    featureAddUser: body.featureAddUser === undefined ? undefined : Boolean(body.featureAddUser),
    featureRemoveUser: body.featureRemoveUser === undefined ? undefined : Boolean(body.featureRemoveUser),
  };

  // Enforce plan capabilities on the backend as well.
  if (!ent?.canUseAI) {
    finalCfg.aiEnabled = false;
    finalCfg.aiModel = undefined;
    finalCfg.aiPrompt = undefined;
  }
  if (!ent?.canUsePayments) {
    finalCfg.paymentAutoEnabled = false;
    finalCfg.paymentAccessToken = undefined;
    finalCfg.paymentSemiEnabled = false;
    finalCfg.paymentSemiKey = undefined;
    finalCfg.paymentSemiType = undefined;
    finalCfg.paymentSemiApproverRoleId = undefined;
  }
  if (!ent?.canUseSafePay) {
    finalCfg.safePayEnabled = false;
    finalCfg.safePayBanksOff = [];
  }

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
