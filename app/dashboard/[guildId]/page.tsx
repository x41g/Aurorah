import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canManageGuild } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import type { GuildConfig, GuildStats } from "@/lib/types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { GuildSettings } from "@/components/dashboard/GuildSettings";
import { getBotGuildIds } from "@/lib/botPresence";
import { isAdminDiscordId } from "@/lib/admin";

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

  const tab = (searchParams.tab || "config").toLowerCase();

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

  return (
    <div className="flex gap-6">
      <Sidebar guildId={params.guildId} isAdmin={isAdmin} />
      <div className="flex-1 min-w-0">
        <Topbar title={access.guild.name} userName={session.user?.name} />

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Tickets criados hoje" value={String(stats.ticketsCreatedToday ?? 0)} hint={stats.todayKey ? `Dia: ${stats.todayKey}` : undefined} />
          <StatCard label="Tickets fechados hoje" value={String(stats.ticketsClosedToday ?? 0)} />
          <StatCard label="Atualizado" value={stats.updatedAt ? new Date(stats.updatedAt).toLocaleTimeString('pt-BR') : '—'} />
        </div>

        {tab === "tickets" || tab === "staff" ? (
          <div className="card">
            <h2 className="text-xl font-bold mb-2">{tab === "tickets" ? "Estatísticas de Tickets" : "Estatísticas de Staff"}</h2>
            <p className="text-white/60 mb-4">
              O bot envia métricas automaticamente. Para resultados completos, mantenha o bot online.
            </p>

            {tab === "staff" ? (
              <div className="space-y-3">
                {stats.staff && Object.keys(stats.staff).length ? (
                  Object.entries(stats.staff).map(([id, s]) => (
                    <div key={id} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-sm text-white/70">Staff ID: {id}</div>
                      <div className="text-sm">
                        <span className="mr-4">Assumidos: <b>{s.claimed ?? 0}</b></span>
                        <span>Fechados: <b>{s.closed ?? 0}</b></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/60">Sem dados de staff ainda.</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-white/60">
                No momento, os contadores básicos estão no topo. Você pode expandir com SLA e tempo médio depois.
              </div>
            )}
          </div>
        ) : (
          <GuildSettings guildId={params.guildId} initial={cfg} />
        )}
      </div>
    </div>
  );
}
