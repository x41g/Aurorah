import { prisma } from "@/lib/prisma";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired";

export type PlanEntitlements = {
  key: string;
  name: string;
  active: boolean;
  maxGuilds: number;
  maxTicketsPerMonth: number | null;
  maxTicketPanels: number;
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
  usedTicketsThisMonth: number;
  ticketsLimitThisMonth: number | null;
  ticketsRemainingThisMonth: number | null;
  ownerGuildsCount: number;
  ownerGuildsLimit: number | null;
};

function monthKeyUTC(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function isSubActive(status: unknown, expiresAt: Date | null) {
  const now = Date.now();
  const s = String(status || "").toLowerCase();
  if (s === "active") {
    if (!expiresAt) return true;
    return expiresAt.getTime() > now;
  }
  if (s === "past_due") {
    if (!expiresAt) return false;
    const graceDays = Math.max(0, Number(process.env.SUBSCRIPTION_PAST_DUE_GRACE_DAYS || 0) || 0);
    return expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000 > now;
  }
  return false;
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

  if (sub.expiresAt && sub.expiresAt.getTime() <= Date.now() && String(sub.status || "").toLowerCase() !== "expired") {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "expired" },
    }).catch(() => null);
    sub.status = "expired";
  }

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
        maxTicketPanels: Math.min(10, Math.max(1, Number(subInfo.plan.maxTicketPanels || 1))),
        dashboardEnabled: Boolean(subInfo.plan.dashboardEnabled),
        paymentsEnabled: Boolean(subInfo.plan.paymentsEnabled),
        safePayEnabled: Boolean(subInfo.plan.safePayEnabled),
        aiEnabled: Boolean(subInfo.plan.aiEnabled),
        analyticsEnabled: Boolean(subInfo.plan.analyticsEnabled),
        prioritySupport: Boolean(subInfo.plan.prioritySupport),
      }
    : null;

  const ownerGuildRows = ownerId
    ? await prisma.guildOwner.findMany({
        where: { ownerId: String(ownerId) },
        select: { guildId: true },
        orderBy: { guildId: "asc" },
      })
    : [];
  const ownerGuildIds = ownerGuildRows.map((r) => String(r.guildId));
  const ownerGuildsCount = ownerGuildIds.length;
  const ownerGuildsLimit = plan ? Math.max(1, Number(plan.maxGuilds || 1)) : null;
  const withinGuildLimit = ownerGuildsLimit == null ? true : ownerGuildIds.slice(0, ownerGuildsLimit).includes(gid);

  const usage = ownerId
    ? await prisma.usageMonthly.findUnique({
        where: { userId_monthKey: { userId: String(ownerId), monthKey: monthKeyUTC() } },
      })
    : null;
  const usedTicketsThisMonth = Number(usage?.tickets || 0);
  const ticketsLimitThisMonth = plan?.maxTicketsPerMonth == null ? null : Number(plan.maxTicketsPerMonth);
  const ticketsRemainingThisMonth = ticketsLimitThisMonth == null ? null : Math.max(0, ticketsLimitThisMonth - usedTicketsThisMonth);

  const subscriptionActive = Boolean(subInfo?.active);
  const canUseDashboard = whitelisted;

  // Sem assinatura ativa: somente leitura de dashboard.
  const canEditConfig = whitelisted && subscriptionActive && withinGuildLimit && Boolean(plan?.dashboardEnabled);
  const canUseAI = whitelisted && subscriptionActive && withinGuildLimit && Boolean(plan?.aiEnabled);
  const canUsePayments = whitelisted && subscriptionActive && withinGuildLimit && Boolean(plan?.paymentsEnabled);
  const canUseSafePay = whitelisted && subscriptionActive && withinGuildLimit && Boolean(plan?.safePayEnabled);
  const canUseAnalytics = whitelisted && subscriptionActive && withinGuildLimit && Boolean(plan?.analyticsEnabled);

  let reason: string | null = null;
  if (!whitelisted) reason = "guild_not_whitelisted";
  else if (!ownerId) reason = "owner_unknown";
  else if (!subscriptionActive) reason = "no_active_subscription";
  else if (!withinGuildLimit) reason = "max_guilds_reached";
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
    usedTicketsThisMonth,
    ticketsLimitThisMonth,
    ticketsRemainingThisMonth,
    ownerGuildsCount,
    ownerGuildsLimit,
  };
}

