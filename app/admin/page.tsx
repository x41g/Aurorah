import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import type { GuildStats } from "@/lib/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { WhitelistPanel } from "@/components/admin/WhitelistPanel";

type BotGuilds = { guildIds: string[]; updatedAt?: number };

export default async function AdminPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) redirect("/login");

  const userId = session.user?.id ?? null;
  if (!isAdminDiscordId(userId)) redirect("/403");

  const botRow = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const botGuilds: BotGuilds = {
    guildIds: Array.isArray(botRow?.guildIds) ? (botRow!.guildIds as any).map(String) : [],
    updatedAt: botRow?.updatedAt ? botRow.updatedAt.getTime() : 0,
  };

  const slice = (botGuilds.guildIds || []).slice(0, 25);
  const rows = await prisma.guildStats.findMany({
    where: { guildId: { in: slice.map(String) } },
  });
  const byId = new Map(rows.map((r) => [r.guildId, r]));
  const statsList: GuildStats[] = slice.map((id) => {
    const r = byId.get(String(id));
    return {
      guildId: String(id),
      updatedAt: r?.updatedAt ? r.updatedAt.getTime() : 0,
      todayKey: r?.todayKey || undefined,
      ticketsCreatedToday: r?.ticketsCreatedToday ?? 0,
      ticketsClosedToday: r?.ticketsClosedToday ?? 0,
      staff: (r?.staff as any) || undefined,
    };
  });

return (
  <div className="min-h-screen">
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar isAdmin={true} />
        </div>

        <main className="min-w-0">
          <Topbar title="Admin" userName={session.user?.name} />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard label="Guilds com bot (registradas)" value={String(botGuilds.guildIds?.length ?? 0)} />
            <StatCard label="Atualização" value={botGuilds.updatedAt ? new Date(botGuilds.updatedAt).toLocaleString("pt-BR") : "—"} />
            <StatCard label="Amostra" value={`${statsList.length} guilds`} hint="Exibindo até 25 para performance" />
          </div>

          <div className="mt-6 card">
            <h2 className="text-xl font-bold mb-2">Guilds (amostra)</h2>
            <p className="text-white/60 mb-4">Lista rápida para conferir se o bot está sincronizando.</p>

            <div className="space-y-3">
              {statsList.map((s) => (
                <div
                  key={s.guildId}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="min-w-0 text-sm">
                    <div className="font-semibold truncate">Guild ID: {s.guildId}</div>
                    <div className="text-white/60 text-xs">
                      Atualizado: {s.updatedAt ? new Date(s.updatedAt).toLocaleString("pt-BR") : "—"}
                    </div>
                  </div>

                  <div className="text-sm sm:text-right">
                    <div>
                      Hoje: <b className="tabular-nums">{s.ticketsCreatedToday ?? 0}</b> criados
                    </div>
                    <div>
                      Fechados: <b className="tabular-nums">{s.ticketsClosedToday ?? 0}</b>
                    </div>
                  </div>
                </div>
              ))}
              {!statsList.length ? <div className="text-sm text-white/60">Sem dados ainda.</div> : null}
            </div>
          </div>

          <div className="mt-6">
            <WhitelistPanel />
          </div>
        </main>
      </div>
    </div>
  </div>
);
}
