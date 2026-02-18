import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, hasManageGuild } from "@/lib/discord";
import { getBotGuildIds } from "@/lib/botPresence";
import { GuildCard } from "@/components/dashboard/GuildCard";
import { Topbar } from "@/components/dashboard/Topbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { isAdminDiscordId } from "@/lib/admin";
import { LicenseRedeemPanel } from "@/components/dashboard/LicenseRedeemPanel";

export default async function DashboardHome() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) redirect("/login");

  const userId = session.user?.id ?? null;
  const isAdmin = isAdminDiscordId(userId);

  const [guilds, botGuildIds] = await Promise.all([
    fetchUserGuilds(session.accessToken),
    getBotGuildIds(),
  ]);

  const manageable = guilds.filter(hasManageGuild);
  const eligible = manageable.filter((g) => botGuildIds.includes(String(g.id)));

  if (eligible.length === 0) redirect("/no-servers");

  return (
    <div className="dashboard-shell">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
        <Sidebar isAdmin={isAdmin} />
        <div className="min-w-0">
          <Topbar title="Seus servidores" userName={session.user?.name} userImage={session.user?.image} />
          <LicenseRedeemPanel guilds={eligible.map((g) => ({ id: String(g.id), name: String(g.name || g.id) }))} />
          <div className="dashboard-stagger grid gap-4">
            {eligible.map((g) => (
              <GuildCard key={g.id} guild={g} botInGuild={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
