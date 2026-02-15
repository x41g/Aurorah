import { prisma } from "@/lib/prisma";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired";

export type PlanEntitlements = {
  key: string;
  name: string;
  active: boolean;
  maxGuilds: number;
  maxTicketsPerMonth: number | null;
  dashboardEnabled: boolean;
  paymentsEnabled: boolean;
  safePayEnabled: boolean;
  aiEnabled: boolean;
  analyticsEnabled: boolean;
  prioritySupport: boolean;
};

export type GuildEntitlements = {
  guildId: string;
  whitelistEnabled: boolean;
  whitelisted: boolean;
  ownerId: string | null;
  subscriptionActive: boolean;
  status: SubscriptionStatus | null;
  plan: PlanEntitlements | null;
  canUseDashboard: boolean;
  canEditConfig: boolean;
  canUseAI: boolean;
  canUsePayments: boolean;
  canUseSafePay: boolean;
  canUseAnalytics: boolean;
  reason: string | null;
};

function isSubActive(status: unknown, expiresAt: Date | null) {
  const s = String(status || "").toLowerCase();
  if (s !== "active") return false;
  if (!expiresAt) return true;
  return expiresAt.getTime() > Date.now();
}

export async function getWhitelistState() {
  const wl = await prisma.whitelist.findUnique({ where: { id: "singleton" } });
  const enabled = Boolean(wl?.enabled);
  const guildIds = Array.isArray(wl?.guildIds) ? (wl!.guildIds as any).map(String) : [];
  return { enabled, guildIds };
}

export async function getGuildOwnerId(guildId: string): Promise<string | null> {
  const row = await prisma.guildOwner.findUnique({ where: { guildId: String(guildId) } });
  return row?.ownerId ? String(row.ownerId) : null;
}

export async function getActiveSubscriptionByUserId(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId: String(userId) },
    include: { plan: true },
  });
  if (!sub) return null;
  const active = isSubActive(sub.status, sub.expiresAt);
  return {
    active,
    status: (String(sub.status || "active").toLowerCase() as SubscriptionStatus) || "active",
    sub,
    plan: sub.plan,
  };
}

export async function getGuildEntitlements(guildId: string): Promise<GuildEntitlements> {
  const gid = String(guildId);
  const wl = await getWhitelistState();
  const whitelisted = !wl.enabled || wl.guildIds.includes(gid);

  const ownerId = await getGuildOwnerId(gid);
  const subInfo = ownerId ? await getActiveSubscriptionByUserId(ownerId) : null;

  const plan = subInfo?.plan
    ? {
        key: String(subInfo.plan.key),
        name: String(subInfo.plan.name),
        active: Boolean(subInfo.plan.active),
        maxGuilds: Number(subInfo.plan.maxGuilds || 1),
        maxTicketsPerMonth: subInfo.plan.maxTicketsPerMonth == null ? null : Number(subInfo.plan.maxTicketsPerMonth),
        dashboardEnabled: Boolean(subInfo.plan.dashboardEnabled),
        paymentsEnabled: Boolean(subInfo.plan.paymentsEnabled),
        safePayEnabled: Boolean(subInfo.plan.safePayEnabled),
        aiEnabled: Boolean(subInfo.plan.aiEnabled),
        analyticsEnabled: Boolean(subInfo.plan.analyticsEnabled),
        prioritySupport: Boolean(subInfo.plan.prioritySupport),
      }
    : null;

  const subscriptionActive = Boolean(subInfo?.active);
  const canUseDashboard = whitelisted;

  // Regra: sem assinatura ativa => somente leitura (stats). Com assinatura ativa, dashboardEnabled libera edição.
  const canEditConfig = whitelisted && subscriptionActive && Boolean(plan?.dashboardEnabled);
  const canUseAI = whitelisted && subscriptionActive && Boolean(plan?.aiEnabled);
  const canUsePayments = whitelisted && subscriptionActive && Boolean(plan?.paymentsEnabled);
  const canUseSafePay = whitelisted && subscriptionActive && Boolean(plan?.safePayEnabled);
  const canUseAnalytics = whitelisted && subscriptionActive && Boolean(plan?.analyticsEnabled);

  let reason: string | null = null;
  if (!whitelisted) reason = "guild_not_whitelisted";
  else if (!ownerId) reason = "owner_unknown";
  else if (!subscriptionActive) reason = "no_active_subscription";
  else if (subscriptionActive && !plan?.dashboardEnabled) reason = "plan_no_dashboard";

  return {
    guildId: gid,
    whitelistEnabled: wl.enabled,
    whitelisted,
    ownerId,
    subscriptionActive,
    status: subInfo?.status ?? null,
    plan,
    canUseDashboard,
    canEditConfig,
    canUseAI,
    canUsePayments,
    canUseSafePay,
    canUseAnalytics,
    reason,
  };
}
