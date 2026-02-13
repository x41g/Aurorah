import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, hasManageGuild } from "@/lib/discord";

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
  return { ok: true as const, session, guild: g };
}
