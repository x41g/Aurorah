import { GuildSampleList } from "@/components/admin/GuildSampleList";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/Topbar";
import type { GuildStats } from "@/lib/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { WhitelistPanel } from "@/components/admin/WhitelistPanel"; 
import { ResetDbPanel } from "@/components/admin/ResetDbPanel";

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

  
  const wl = await prisma.whitelist.findUnique({ where: { id: "singleton" } });

const wlEnabled = Boolean(wl?.enabled);
const wlIds = Array.isArray(wl?.guildIds) ? (wl.guildIds as any).map(String) : [];

const baseGuildIds = botGuilds.guildIds || [];
const filteredGuildIds = wlEnabled
  ? baseGuildIds.filter((id) => wlIds.includes(String(id)))
  : baseGuildIds;

const slice = filteredGuildIds.slice(0, 25);
const rows = await prisma.guildStats.findMany({
  where: { guildId: { in: slice.map(String) } },
});

type Row = (typeof rows)[number];

const byId = new Map<string, Row>(rows.map((r: Row) => [String(r.guildId), r]));

const statsList: GuildStats[] = slice.map((id) => {
  const r = byId.get(String(id));
  return {
    guildId: String(id),
    updatedAt: r?.updatedAt ? new Date(r.updatedAt).getTime() : 0,
    todayKey: r?.todayKey ?? undefined,
    ticketsCreatedToday: r?.ticketsCreatedToday ?? 0,
    ticketsClosedToday: r?.ticketsClosedToday ?? 0,
    staff: (r?.staff as any) ?? undefined,
  };
});
return (
  <>
          <Topbar
            title="Admin"
            userName={session.user?.name}
            userImage={session.user?.image}
          />


          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard label="Guilds com bot (registradas)" value={String(botGuilds.guildIds?.length ?? 0)} />
            <StatCard label="Atualização" value={botGuilds.updatedAt ? new Date(botGuilds.updatedAt).toLocaleString("pt-BR") : "—"} />
            <StatCard label="Amostra" value={`${statsList.length} guilds`} hint="Exibindo até 25 para performance" />
          </div>

          <div className="mt-6 card">
            <h2 className="text-xl font-bold mb-2">Guilds (amostra)</h2>
            <p className="text-white/60 mb-4">Lista rápida para conferir se o bot está sincronizando.</p>

            <div className="space-y-3">
            <div className="mt-6">
              <GuildSampleList stats={statsList} />
            </div>
              {!statsList.length ? <div className="text-sm text-white/60">Sem dados ainda.</div> : null}
            </div>
          </div>

          <div className="mt-6">
            <WhitelistPanel />
          </div>

          <div className="mt-6">
            <ResetDbPanel />
          </div>
  </>
);
}
