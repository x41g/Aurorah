import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, hasManageGuild } from "@/lib/discord";
import { prisma } from "@/lib/prisma";
import { getGuildEntitlements } from "@/lib/entitlements";

export async function requireSession() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) return null;
  return session;
}

export async function canManageGuild(guildId: string) {
  const session = await requireSession();
  if (!session?.accessToken) return { ok: false as const, session: null };

  const guilds = await fetchUserGuilds(session.accessToken);
  const g = guilds.find((x) => String(x.id) === String(guildId));
  if (!g) return { ok: false as const, session };
  if (!hasManageGuild(g)) return { ok: false as const, session };

  // se o usuário for o dono, salva no DB para o sistema de assinaturas
  try {
    if ((g as any)?.owner && (session as any)?.user?.id) {
      await prisma.guildOwner.upsert({
        where: { guildId: String(guildId) },
        create: { guildId: String(guildId), ownerId: String((session as any).user.id) },
        update: { ownerId: String((session as any).user.id) },
      });
    }
  } catch {
    // noop
  }

  const entitlements = await getGuildEntitlements(String(guildId));
  if (!entitlements.canUseDashboard) {
    return { ok: false as const, session, guild: g, entitlements };
  }

  return { ok: true as const, session, guild: g, entitlements };
}
