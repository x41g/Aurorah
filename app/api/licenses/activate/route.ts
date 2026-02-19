import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, hasManageGuild } from "@/lib/discord";
import { prisma } from "@/lib/prisma";
import { activateLicenseKey } from "@/lib/licenseKeys";
import { getClientIp } from "@/lib/requestSecurity";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const code = String(body?.code || "").trim();
  const guildId = body?.guildId ? String(body.guildId).trim() : "";
  const captchaToken = String(body?.captchaToken || "").trim();
  if (!code) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  if (isTurnstileEnabled()) {
    if (!captchaToken) {
      return NextResponse.json({ error: "captcha_required" }, { status: 400 });
    }
    const ip = getClientIp(req);
    const captcha = await verifyTurnstileToken({ token: captchaToken, remoteIp: ip });
    if (!captcha.ok) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
    }
  }

  let selectedGuildId: string | null = null;
  if (guildId) {
    const guilds = await fetchUserGuilds(session.accessToken);
    const selected = guilds.find((g) => String(g.id) === guildId);
    if (!selected || !hasManageGuild(selected)) {
      return NextResponse.json({ error: "guild_forbidden" }, { status: 403 });
    }
    selectedGuildId = String(selected.id);

    // Se for dono real, atualiza ownership para o sistema de assinatura.
    if ((selected as any)?.owner === true) {
      await prisma.guildOwner
        .upsert({
          where: { guildId: selectedGuildId },
          create: { guildId: selectedGuildId, ownerId: String(session.user.id) },
          update: { ownerId: String(session.user.id) },
        })
        .catch(() => null);
    }
  }

  try {
    const result = await activateLicenseKey({
      code,
      userId: String(session.user.id),
      guildId: selectedGuildId,
    });

    if (selectedGuildId) {
      const current = await prisma.whitelist.findUnique({ where: { id: "singleton" } });
      const currentIds = Array.isArray(current?.guildIds) ? (current!.guildIds as any[]).map(String).filter(Boolean) : [];
      const nextIds = currentIds.includes(selectedGuildId) ? currentIds : [...currentIds, selectedGuildId];
      await prisma.whitelist.upsert({
        where: { id: "singleton" },
        create: {
          id: "singleton",
          enabled: Boolean(current?.enabled ?? false),
          guildIds: nextIds as any,
        },
        update: {
          guildIds: nextIds as any,
        },
      });
    }

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    const msg = String(e?.message || e || "activation_error");
    const known = new Set([
      "bad_request",
      "captcha_required",
      "captcha_failed",
      "license_not_found",
      "license_disabled",
      "license_exhausted",
      "license_expired",
    ]);
    return NextResponse.json({ error: known.has(msg) ? msg : "activation_error" }, { status: known.has(msg) ? 400 : 500 });
  }
}
