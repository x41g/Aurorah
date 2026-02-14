import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const plans = await prisma.plan.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ plans });
}

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.key) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const key = String(body.key);

  // atualização controlada (sem bagunça)
  const updated = await prisma.plan.update({
    where: { key: key as any },
    data: {
      active: Boolean(body.active),

      priceCents: Number(body.priceCents ?? 0) || 0,
      maxGuilds: Number(body.maxGuilds ?? 1) || 1,
      maxTicketsPerMonth:
        body.maxTicketsPerMonth == null || body.maxTicketsPerMonth === ""
          ? null
          : Number(body.maxTicketsPerMonth),

      dashboardEnabled: Boolean(body.dashboardEnabled),
      paymentsEnabled: Boolean(body.paymentsEnabled),
      safePayEnabled: Boolean(body.safePayEnabled),
      aiEnabled: Boolean(body.aiEnabled),
      analyticsEnabled: Boolean(body.analyticsEnabled),
      prioritySupport: Boolean(body.prioritySupport),
    },
  });

  return NextResponse.json({ ok: true, plan: updated });
}
