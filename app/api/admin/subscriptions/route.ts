import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { PlanKey } from "@prisma/client";

export const runtime = "nodejs";

type SubStatus = "active" | "canceled" | "expired" | "past_due";

function normalizeStatus(input: unknown): SubStatus {
  const raw = String(input || "active").toLowerCase();
  return (["active", "canceled", "expired", "past_due"] as const).includes(raw as any) ? (raw as SubStatus) : "active";
}

function normalizePlanKey(input: unknown): PlanKey | null {
  const raw = String(input || "").toUpperCase();
  return (["STARTER", "PRO"] as const).includes(raw as any) ? (raw as PlanKey) : null;
}

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return session;
}

export async function GET(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const subs = await prisma.subscription.findMany({
    where: q ? { userId: { contains: q } } : undefined,
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ subscriptions: subs });
}

export async function PUT(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);

  const targetUserId = String(body?.userId || "").trim();
  const planKey = normalizePlanKey(body?.planKey);
  if (!targetUserId || !planKey) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const status = normalizeStatus(body?.status);

  const sub = await prisma.subscription.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
      planKey,
      status,
      renewAt: body?.renewAt ? new Date(body.renewAt) : null,
      expiresAt: body?.expiresAt ? new Date(body.expiresAt) : null,
    },
    update: {
      planKey,
      status,
      renewAt: body?.renewAt === "" ? null : body?.renewAt ? new Date(body.renewAt) : undefined,
      expiresAt: body?.expiresAt === "" ? null : body?.expiresAt ? new Date(body.expiresAt) : undefined,
    },
    include: { plan: true },
  });

  return NextResponse.json({ ok: true, subscription: sub });
}
