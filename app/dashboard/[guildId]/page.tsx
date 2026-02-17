import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canManageGuild } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import type { GuildConfig, GuildStats } from "@/lib/types";
import { getBotGuildIds } from "@/lib/botPresence";
import { isAdminDiscordId } from "@/lib/admin";
import { GuildDashboardClient } from "@/components/dashboard/GuildDashboardClient";

export default async function GuildPage({
  params,
  searchParams,
}: {
  params: { guildId: string };
  searchParams: { tab?: string };
}) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) redirect("/login");

  const access = await canManageGuild(params.guildId);
  if (!access.ok) redirect("/dashboard");

  const botGuildIds = await getBotGuildIds();
  const botInGuild = botGuildIds.includes(String(params.guildId));
  if (!botInGuild) redirect("/dashboard");

  const tab = String(searchParams.tab || "panel").toLowerCase();

  const [cfgRow, statsRow] = await Promise.all([
    prisma.guildConfig.findUnique({ where: { guildId: String(params.guildId) } }),
    prisma.guildStats.findUnique({ where: { guildId: String(params.guildId) } }),
  ]);

  const cfg = ((cfgRow?.data as any) || {}) as GuildConfig;

  const stats: GuildStats = {
    guildId: String(params.guildId),
    updatedAt: statsRow?.updatedAt ? statsRow.updatedAt.getTime() : 0,
    todayKey: statsRow?.todayKey || undefined,
    ticketsCreatedToday: statsRow?.ticketsCreatedToday ?? 0,
    ticketsClosedToday: statsRow?.ticketsClosedToday ?? 0,
    staff: (statsRow?.staff as any) || undefined,
  };

  const userId = session.user?.id ?? null;
  const isAdmin = isAdminDiscordId(userId);
  const entitlements = (access as any).entitlements || null;

  return (
    <GuildDashboardClient
      guildId={params.guildId}
      guildName={access.guild.name}
      isAdmin={isAdmin}
      entitlements={entitlements}
      cfg={cfg}
      stats={stats}
      userName={session.user?.name}
      userImage={session.user?.image}
      initialTab={tab}
    />
  );
}

