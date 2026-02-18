import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertInternalAuth } from "@/lib/internalAuth";
import { evaluateSubscriptionState, normalizeSubscriptionStatus } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const rows = await prisma.subscription.findMany({
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        renewAt: true,
        expiresAt: true,
        canceledAt: true,
        endedAt: true,
        lastStatusChangeAt: true,
      },
      take: 5000,
      orderBy: { updatedAt: "desc" },
    });

    const activeUserIds = new Set<string>();
    const now = new Date();
    for (const sub of rows) {
      const evaluated = evaluateSubscriptionState({
        id: sub.id,
        status: sub.status,
        startedAt: sub.startedAt,
        renewAt: sub.renewAt,
        expiresAt: sub.expiresAt,
        canceledAt: sub.canceledAt,
        endedAt: sub.endedAt,
        lastStatusChangeAt: sub.lastStatusChangeAt,
      }, now);

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

      const effectiveStatus = normalizeSubscriptionStatus(evaluated.status);
      if (evaluated.active && ["active", "trialing", "past_due", "scheduled"].includes(effectiveStatus)) {
        activeUserIds.add(String(sub.userId));
      }
    }

    return NextResponse.json({ ok: true, userIds: Array.from(activeUserIds) });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e || "server_error") }, { status: 500 });
  }
}

