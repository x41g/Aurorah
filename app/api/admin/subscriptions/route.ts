import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { PlanKey } from "@prisma/client";

export const runtime = "nodejs";

type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return session;
}

function normalizePlanKey(input: unknown): PlanKey | null {
  const raw = String(input || "").toUpperCase().trim();
  const allowed: PlanKey[] = ["STARTER", "PRO"]; // mantenha igual ao seu enum no schema
  return allowed.includes(raw as any) ? (raw as PlanKey) : null;
}

function normalizeStatus(input: unknown): SubscriptionStatus {
  const raw = String(input || "active").toLowerCase().trim();
  const allowed: SubscriptionStatus[] = ["active", "canceled", "expired", "past_due"];
  return allowed.includes(raw as any) ? (raw as SubscriptionStatus) : "active";
}

function parseDateOrNull(v: unknown): Date | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
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
  if (!targetUserId || !planKey) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const status = normalizeStatus(body?.status);
  const renewAt = parseDateOrNull(body?.renewAt);
  const expiresAt = parseDateOrNull(body?.expiresAt);

  const sub = await prisma.subscription.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
      planKey,          // PlanKey do Prisma
      status,           // string segura (seu schema usa String)
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

  return NextResponse.json({ ok: true, subscription: sub });
}
