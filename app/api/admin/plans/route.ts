import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { PlanKey } from "@prisma/client";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return { session, userId: String(userId) };
}

export async function GET() {
  const ok = await assertAdmin();
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const plans = await prisma.plan.findMany({
    orderBy: [{ active: "desc" }, { priceCents: "asc" }, { key: "asc" }],
  });

  return NextResponse.json({
    plans: plans.map((p) => ({
      key: p.key,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      active: p.active,
      maxGuilds: p.maxGuilds,
      maxTicketsPerMonth: p.maxTicketsPerMonth,
      dashboardEnabled: p.dashboardEnabled,
      paymentsEnabled: p.paymentsEnabled,
      safePayEnabled: p.safePayEnabled,
      aiEnabled: p.aiEnabled,
      analyticsEnabled: p.analyticsEnabled,
      prioritySupport: p.prioritySupport,
      createdAt: p.createdAt.getTime(),
      updatedAt: p.updatedAt.getTime(),
    })),
  });
}

export async function PUT(req: Request) {
  const ok = await assertAdmin();
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as any;
  if (!body?.key) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const key = String(body.key) as PlanKey;

  const updated = await prisma.plan.update({
    where: { key },
    data: {
      name: typeof body.name === "string" ? body.name : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      priceCents: Number.isFinite(Number(body.priceCents)) ? Number(body.priceCents) : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
      maxGuilds: Number.isFinite(Number(body.maxGuilds)) ? Number(body.maxGuilds) : undefined,
      maxTicketsPerMonth:
        body.maxTicketsPerMonth == null || body.maxTicketsPerMonth === ""
          ? null
          : Number.isFinite(Number(body.maxTicketsPerMonth))
            ? Number(body.maxTicketsPerMonth)
            : undefined,
      dashboardEnabled: typeof body.dashboardEnabled === "boolean" ? body.dashboardEnabled : undefined,
      paymentsEnabled: typeof body.paymentsEnabled === "boolean" ? body.paymentsEnabled : undefined,
      safePayEnabled: typeof body.safePayEnabled === "boolean" ? body.safePayEnabled : undefined,
      aiEnabled: typeof body.aiEnabled === "boolean" ? body.aiEnabled : undefined,
      analyticsEnabled: typeof body.analyticsEnabled === "boolean" ? body.analyticsEnabled : undefined,
      prioritySupport: typeof body.prioritySupport === "boolean" ? body.prioritySupport : undefined,
    },
  });

  return NextResponse.json({ ok: true, plan: { key: updated.key, updatedAt: updated.updatedAt.getTime() } });
}
