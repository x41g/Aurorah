import { prisma } from "@/lib/prisma";
import { evaluateSubscriptionState, normalizeSubscriptionStatus } from "@/lib/subscriptions";

export async function hasActiveSubscription(userId: string | null | undefined): Promise<boolean> {
  const uid = String(userId || "").trim();
  if (!uid) return false;

  const sub = await prisma.subscription.findUnique({
    where: { userId: uid },
    select: {
      id: true,
      status: true,
      startedAt: true,
      renewAt: true,
      expiresAt: true,
      canceledAt: true,
      endedAt: true,
      lastStatusChangeAt: true,
    },
  });
  if (!sub) return false;

  const evaluated = evaluateSubscriptionState({
    id: sub.id,
    status: normalizeSubscriptionStatus(sub.status, "active"),
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
        where: { userId: uid },
        data: {
          status: evaluated.patch.status ?? undefined,
          endedAt: evaluated.patch.endedAt,
          lastStatusChangeAt: evaluated.patch.lastStatusChangeAt,
        },
      })
      .catch(() => null);
  }

  return Boolean(evaluated.active);
}

