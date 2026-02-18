import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { evaluateSubscriptionState, normalizeSubscriptionStatus, parseOptionalDateInput } from "@/lib/subscriptions";

export const runtime = "nodejs";

type SubStatus = "scheduled" | "trialing" | "active" | "past_due" | "canceled" | "expired";

function normalizeStatus(input: unknown): SubStatus {
  return normalizeSubscriptionStatus(input, "active");
}

async function normalizePlanKey(input: unknown): Promise<string | null> {
  const raw = String(input || "").toUpperCase();
  if (!raw) return null;
  const exists = await prisma.plan.findUnique({ where: { key: raw }, select: { key: true } }).catch(() => null);
  return exists?.key ? String(exists.key) : null;
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

  const subscriptions = subs.map((sub) => {
    const evaluated = evaluateSubscriptionState({
      id: sub.id,
      status: sub.status,
      startedAt: sub.startedAt,
      renewAt: sub.renewAt,
      expiresAt: sub.expiresAt,
      canceledAt: sub.canceledAt,
      endedAt: sub.endedAt,
      lastStatusChangeAt: sub.lastStatusChangeAt,
    });
    return {
      ...sub,
      computedStatus: evaluated.status,
      isActive: evaluated.active,
    };
  });

  return NextResponse.json({ subscriptions });
}

export async function PUT(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);

  const targetUserId = String(body?.userId || "").trim();
  const planKey = await normalizePlanKey(body?.planKey);
  if (!targetUserId || !planKey) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const status = normalizeStatus(body?.status);
  const startedAtParsed = parseOptionalDateInput(body?.startedAt);
  const renewAtParsed = parseOptionalDateInput(body?.renewAt);
  const expiresAtParsed = parseOptionalDateInput(body?.expiresAt);
  const canceledAtParsed = parseOptionalDateInput(body?.canceledAt);
  const endedAtParsed = parseOptionalDateInput(body?.endedAt);
  if (!startedAtParsed.ok || !renewAtParsed.ok || !expiresAtParsed.ok || !canceledAtParsed.ok || !endedAtParsed.ok) {
    return NextResponse.json({ error: "bad_request_invalid_date" }, { status: 400 });
  }

  let startedAtValue = startedAtParsed.value;
  let renewAtValue = renewAtParsed.value;
  let expiresAtValue = expiresAtParsed.value;
  let canceledAtValue = canceledAtParsed.value;
  let endedAtValue = endedAtParsed.value;
  let cancelAtPeriodEndValue = typeof body?.cancelAtPeriodEnd === "boolean" ? body.cancelAtPeriodEnd : undefined;
  const statusReasonValue = body?.statusReason === undefined ? undefined : body?.statusReason === null || body?.statusReason === "" ? null : String(body.statusReason);

  const statusRaw = body?.status;
  if (statusRaw !== undefined) {
    if ((status === "active" || status === "trialing" || status === "past_due" || status === "scheduled") && body?.canceledAt === undefined) {
      canceledAtValue = null;
      if (cancelAtPeriodEndValue === undefined) cancelAtPeriodEndValue = false;
    }
    if (status === "canceled" && body?.canceledAt === undefined) canceledAtValue = new Date();
    if (status === "expired" && body?.endedAt === undefined) endedAtValue = new Date();
  }

  if ((status === "active" || status === "trialing" || status === "past_due" || status === "scheduled") && startedAtValue === undefined) {
    startedAtValue = new Date();
  }

  const sub = await prisma.subscription.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
      planKey,
      status,
      startedAt: startedAtValue === undefined ? null : startedAtValue,
      renewAt: renewAtValue === undefined ? null : renewAtValue,
      expiresAt: expiresAtValue === undefined ? null : expiresAtValue,
      canceledAt: canceledAtValue === undefined ? null : canceledAtValue,
      cancelAtPeriodEnd: cancelAtPeriodEndValue ?? false,
      endedAt: endedAtValue === undefined ? null : endedAtValue,
      statusReason: statusReasonValue === undefined ? null : statusReasonValue,
      lastStatusChangeAt: new Date(),
    },
    update: {
      planKey,
      status,
      startedAt: startedAtValue,
      renewAt: renewAtValue,
      expiresAt: expiresAtValue,
      canceledAt: canceledAtValue,
      cancelAtPeriodEnd: cancelAtPeriodEndValue,
      endedAt: endedAtValue,
      statusReason: statusReasonValue,
      lastStatusChangeAt: new Date(),
    },
    include: { plan: true },
  });

  const evaluated = evaluateSubscriptionState({
    id: sub.id,
    status: sub.status,
    startedAt: sub.startedAt,
    renewAt: sub.renewAt,
    expiresAt: sub.expiresAt,
    canceledAt: sub.canceledAt,
    endedAt: sub.endedAt,
    lastStatusChangeAt: sub.lastStatusChangeAt,
  });
  if (evaluated.shouldPersist) {
    await prisma.subscription
      .update({
        where: { id: sub.id },
        data: {
          status: evaluated.patch.status ?? undefined,
          endedAt: evaluated.patch.endedAt,
          lastStatusChangeAt: evaluated.patch.lastStatusChangeAt,
        },
      })
      .catch(() => null);
  }

  return NextResponse.json({
    ok: true,
    subscription: {
      ...sub,
      computedStatus: evaluated.status,
      isActive: evaluated.active,
    },
  });
}

export async function DELETE(req: Request) {
  const session = await assertAdmin()
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const userId = String(searchParams.get("userId") || "").trim()
  if (!userId) return NextResponse.json({ error: "bad_request" }, { status: 400 })

  await prisma.subscription.delete({ where: { userId } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
