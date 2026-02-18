import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp, isSameOriginRequest } from "@/lib/requestSecurity";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

const ALLOWED_TARGETS = new Set([
  "guildConfig",
  "guildStats",
  "guildOwners",
  "transcripts",
  "usageMonthly",
  "aiData",
  "subscriptions",
  "licenses",
  "botState",
  "whitelist",
]);

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  const ip = getClientIp(req);

  const rate = consumeRateLimit(`admin-reset:${ip}`, 8, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const captchaToken = String(body?.captchaToken || "").trim();
  if (isTurnstileEnabled()) {
    if (!captchaToken) {
      return NextResponse.json({ error: "captcha_required" }, { status: 400 });
    }
    const captcha = await verifyTurnstileToken({ token: captchaToken, remoteIp: ip });
    if (!captcha.ok) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
    }
  }

  const rawTargets = Array.isArray(body?.targets) ? body.targets : [];
  const targets = rawTargets
    .map((t: unknown) => String(t || "").trim())
    .filter((t: string) => ALLOWED_TARGETS.has(t));

  if (!targets.length) {
    return NextResponse.json({ error: "no_targets" }, { status: 400 });
  }

  const result: Record<string, number | string> = {};
  const userAgent = req.headers.get("user-agent") || null;

  if (targets.includes("guildConfig")) {
    const r = await prisma.guildConfig.deleteMany({});
    result.guildConfig = r.count;
  }

  if (targets.includes("guildStats")) {
    const r = await prisma.guildStats.deleteMany({});
    result.guildStats = r.count;
  }

  if (targets.includes("guildOwners")) {
    const r = await prisma.guildOwner.deleteMany({});
    result.guildOwners = r.count;
  }

  if (targets.includes("transcripts")) {
    const r = await prisma.transcript.deleteMany({});
    result.transcripts = r.count;
  }

  if (targets.includes("usageMonthly")) {
    const r = await prisma.usageMonthly.deleteMany({});
    result.usageMonthly = r.count;
  }

  if (targets.includes("aiData")) {
    const p = prisma as any;
    const [r1, r2, r3, r4] = await Promise.all([
      p.ticketAiMessage?.deleteMany?.({}) ?? Promise.resolve({ count: 0 }),
      p.ticketAIMessage?.deleteMany?.({}) ?? Promise.resolve({ count: 0 }),
      p.ticketAIMemory?.deleteMany?.({}) ?? Promise.resolve({ count: 0 }),
      p.guildAIConfig?.deleteMany?.({}) ?? Promise.resolve({ count: 0 }),
    ]);
    result.aiData = Number(r1?.count || 0) + Number(r2?.count || 0) + Number(r3?.count || 0) + Number(r4?.count || 0);
  }

  if (targets.includes("subscriptions")) {
    const r = await prisma.subscription.deleteMany({});
    result.subscriptions = r.count;
  }

  if (targets.includes("licenses")) {
    const r1 = await prisma.licenseActivation.deleteMany({});
    const r2 = await prisma.licenseKey.deleteMany({});
    result.licenses = Number(r1.count || 0) + Number(r2.count || 0);
  }

  if (targets.includes("botState")) {
    await prisma.botState.upsert({
      where: { id: "singleton" },
      update: { guildIds: [] as any },
      create: { id: "singleton", guildIds: [] as any },
    });
    result.botState = "reset";
  }

  if (targets.includes("whitelist")) {
    await prisma.whitelist.upsert({
      where: { id: "singleton" },
      update: { enabled: false, guildIds: [] as any },
      create: { id: "singleton", enabled: false, guildIds: [] as any },
    });
    result.whitelist = "reset";
  }

  const p = prisma as any;
  try {
    await p.adminResetAudit?.create?.({
      data: {
        adminId: String(userId || "unknown"),
        targets,
        result,
        ip: ip ? String(ip) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
      },
    });
  } catch (err) {
    // Nao bloqueia o reset se a tabela de auditoria ainda nao existir.
    console.warn("[admin/reset] falha ao gravar auditoria:", err);
  }

  return NextResponse.json({ ok: true, targets, result });
}
