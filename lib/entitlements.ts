import { prisma } from "@/lib/prisma";

type Entitlements = {
  whitelistEnabled: boolean;
  isWhitelisted: boolean;
  ownerId: string | null;

  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  expiresAt: number | null;
  planKey: string | null;
  plan: any | null;
};

function isSubActive(status: unknown) {
  return String(status || "").toLowerCase() === "active";
}

async function resolveGuildOwnerId(guildId: string): Promise<string | null> {
  const gid = String(guildId || "").trim();
  if (!gid) return null;

  // 1) DB cache
  const existing = await prisma.guildOwner.findUnique({ where: { guildId: gid } });
  if (existing?.ownerId) return String(existing.ownerId);

  // 2) Discord API (bot precisa estar no servidor)
  const botToken = (process.env.DISCORD_BOT_TOKEN || "").trim();
  if (!botToken) return null;

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(gid)}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const d = (await res.json().catch(() => null)) as any;
    const ownerId = d?.owner_id ? String(d.owner_id) : null;
    if (!ownerId) return null;

    await prisma.guildOwner.upsert({
      where: { guildId: gid },
      create: { guildId: gid, ownerId },
      update: { ownerId },
    });

    return ownerId;
  } catch {
    return null;
  }
}

/**
 * Regras:
 * - Whitelist DESATIVADA => não bloqueia nada por assinatura.
 * - Whitelist ATIVA => recursos podem travar se o dono do servidor não tiver assinatura ativa.
 */
export async function getEntitlementsForGuild(guildId: string): Promise<Entitlements> {
  const gid = String(guildId || "").trim();

  const wl = await prisma.whitelist.findUnique({ where: { id: "singleton" } });
  const whitelistEnabled = Boolean(wl?.enabled);
  const wlIds = Array.isArray(wl?.guildIds) ? (wl!.guildIds as any).map(String) : [];
  const isWhitelisted = wlIds.includes(gid);

  const ownerId = await resolveGuildOwnerId(gid);

  const sub = ownerId
    ? await prisma.subscription.findUnique({ where: { userId: ownerId }, include: { plan: true } })
    : null;

  const expiresAt = sub?.expiresAt ? sub.expiresAt.getTime() : null;
  const notExpired = expiresAt == null ? true : expiresAt > Date.now();
  const active = Boolean(sub && isSubActive(sub.status) && notExpired);

  return {
    whitelistEnabled,
    isWhitelisted,
    ownerId,

    hasActiveSubscription: whitelistEnabled ? active : true,
    subscriptionStatus: sub?.status ? String(sub.status) : null,
    expiresAt,
    planKey: (sub as any)?.planKey ? String((sub as any).planKey) : null,
    plan: (sub as any)?.plan ?? null,
  };
}
