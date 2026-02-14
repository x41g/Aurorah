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
import { StaffRow } from "@/components/dashboard/StaffRow";

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

  const tab = String(searchParams.tab || "config").toLowerCase();

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

  const created = Number(stats.ticketsCreatedToday ?? 0);
  const closed = Number(stats.ticketsClosedToday ?? 0);
  const closeRate = created > 0 ? Math.round((closed / created) * 100) : 0;

  const userId = session.user?.id ?? null;
  const isAdmin = isAdminDiscordId(userId);

  return (
    <div className="flex gap-6">
      <Sidebar guildId={params.guildId} isAdmin={isAdmin} />
      <div className="flex-1 min-w-0">
        <Topbar title={access.guild.name} userName={session.user?.name} userImage={session.user?.image} />

        {/* TOP STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Tickets criados hoje"
            value={String(created)}
            hint={stats.todayKey ? `Dia: ${stats.todayKey}` : undefined}
          />
          <StatCard label="Tickets fechados hoje" value={String(closed)} />
          <StatCard
            label="Atualizado"
            value={stats.updatedAt ? new Date(stats.updatedAt).toLocaleTimeString("pt-BR") : "—"}
          />
        </div>

        {/* TABS */}
        {tab === "tickets" ? (
          <div className="card">
            <h2 className="text-xl font-bold mb-2">Estatísticas de Tickets</h2>
            <p className="text-white/60 mb-4">
              O bot envia métricas automaticamente. Para resultados completos, mantenha o bot online.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Criados hoje" value={String(created)} />
              <StatCard label="Fechados hoje" value={String(closed)} />
              <StatCard label="Taxa de fechamento" value={`${closeRate}%`} hint="Fechados / Criados no dia" />
            </div>

            <div className="text-sm text-white/60">
              Próximos upgrades recomendados: tempo médio de resposta, tempo até fechar, tickets por hora e pico do dia.
            </div>
          </div>
        ) : tab === "staff" ? (
          <div className="card">
            <h2 className="text-xl font-bold mb-2">Estatísticas de Staff</h2>
            <p className="text-white/60 mb-4">
              Ranking e contadores por staff (assumidos/fechados).
            </p>

            <div className="space-y-3">
              {stats.staff && Object.keys(stats.staff).length ? (
                Object.entries(stats.staff).map(([id, s]) => (
                  <StaffRow
                    key={id}
                    id={id}
                    claimed={Number((s as any)?.claimed ?? 0)}
                    closed={Number((s as any)?.closed ?? 0)}
                  />
                ))
              ) : (
                <div className="text-sm text-white/60">Sem dados de staff ainda.</div>
              )}
            </div>
          </div>
        ) : (
          <GuildSettings guildId={params.guildId} initial={cfg} />
        )}
      </div>
    </div>
  );
}