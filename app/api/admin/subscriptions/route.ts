import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { PlanKey, SubscriptionStatus } from "@prisma/client";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return { session, userId: String(userId) };
}

function toDateOrNull(v: any) {
  if (v == null || v === "") return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function GET(req: Request) {
  const ok = await assertAdmin();
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const q = String(url.searchParams.get("q") || "").trim();

  const rows = await prisma.subscription.findMany({
    where: q ? { userId: { contains: q } } : undefined,
    include: { plan: true },
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({
    subscriptions: rows.map((s) => ({
      id: s.id,
      userId: s.userId,
      planKey: s.planKey,
      status: s.status,
      renewAt: s.renewAt ? s.renewAt.getTime() : null,
      expiresAt: s.expiresAt ? s.expiresAt.getTime() : null,
      createdAt: s.createdAt.getTime(),
      updatedAt: s.updatedAt.getTime(),
      plan: s.plan
        ? {
            key: s.plan.key,
            name: s.plan.name,
            maxGuilds: s.plan.maxGuilds,
            maxTicketsPerMonth: s.plan.maxTicketsPerMonth,
            dashboardEnabled: s.plan.dashboardEnabled,
            paymentsEnabled: s.plan.paymentsEnabled,
            safePayEnabled: s.plan.safePayEnabled,
            aiEnabled: s.plan.aiEnabled,
            analyticsEnabled: s.plan.analyticsEnabled,
            prioritySupport: s.plan.prioritySupport,
          }
        : null,
    })),
  });
}

export async function PUT(req: Request) {
  const ok = await assertAdmin();
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as any;
  const userId = String(body?.userId || "").trim();
  const planKey = String(body?.planKey || "").trim() as PlanKey;

  if (!userId || !planKey) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) return NextResponse.json({ error: "plan_not_found" }, { status: 404 });

  const status = String(body?.status || "active").trim() as SubscriptionStatus;

  const renewAt = toDateOrNull(body?.renewAt);
  const expiresAt = toDateOrNull(body?.expiresAt);

  const sub = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planKey,
      status,
      renewAt,
      expiresAt,
    },
    update: {
      planKey,
      status,
      renewAt,
      expiresAt,
    },
    include: { plan: true },
  });

  return NextResponse.json({ ok: true, subscription: { id: sub.id, userId: sub.userId, updatedAt: sub.updatedAt.getTime() } });
}
