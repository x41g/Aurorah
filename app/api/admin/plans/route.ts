import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return session;
}

export async function GET() {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const plans = await prisma.plan.findMany({
    orderBy: [{ active: "desc" }, { priceCents: "asc" }],
  });
  return NextResponse.json({ plans });
}

export async function PUT(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const key = String(body?.key || "").toUpperCase();
  if (!key) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const exists = await prisma.plan.findUnique({ where: { key }, select: { key: true } }).catch(() => null);
  const planKey = (exists?.key || null) as string | null;
  if (!planKey) return NextResponse.json({ error: "invalid_plan_key" }, { status: 400 });

  const data = {
    key: planKey,
    name: String(body?.name || planKey),
    description: String(body?.description || ""),
    priceCents: Number.isFinite(Number(body?.priceCents)) ? Number(body.priceCents) : 0,
    active: Boolean(body?.active),
    maxGuilds: Number.isFinite(Number(body?.maxGuilds)) ? Number(body.maxGuilds) : 1,
    maxTicketsPerMonth:
      body?.maxTicketsPerMonth === null || body?.maxTicketsPerMonth === ""
        ? null
        : Number.isFinite(Number(body?.maxTicketsPerMonth))
          ? Number(body.maxTicketsPerMonth)
          : null,

    dashboardEnabled: Boolean(body?.dashboardEnabled),
    paymentsEnabled: Boolean(body?.paymentsEnabled),
    safePayEnabled: Boolean(body?.safePayEnabled),
    aiEnabled: Boolean(body?.aiEnabled),
    analyticsEnabled: Boolean(body?.analyticsEnabled),
    prioritySupport: Boolean(body?.prioritySupport),
  };

  const plan = await prisma.plan.upsert({
    where: { key: planKey },
    create: data,
    update: data,
  });

  return NextResponse.json({ ok: true, plan });
}
