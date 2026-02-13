import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, hasManageGuild } from "@/lib/discord";
import { getBotGuildIds } from "@/lib/botPresence";
import { GuildCard } from "@/components/dashboard/GuildCard";
import { Topbar } from "@/components/dashboard/Topbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { isAdminDiscordId } from "@/lib/admin";

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
    <div className="flex gap-6">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 min-w-0">
        <Topbar title="Seus servidores" userName={session.user?.name} />
        <div className="grid gap-4">
          {eligible.map((g) => (
            <GuildCard key={g.id} guild={g} botInGuild={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
