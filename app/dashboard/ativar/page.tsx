import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, hasManageGuild } from "@/lib/discord";
import { getBotGuildIds } from "@/lib/botPresence";
import { Topbar } from "@/components/dashboard/Topbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { LicenseRedeemPanel } from "@/components/dashboard/LicenseRedeemPanel";
import { isAdminDiscordId } from "@/lib/admin";
import { hasActiveSubscription } from "@/lib/subscriptionAccess";

export default async function DashboardActivatePage() {
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
  const activeSub = await hasActiveSubscription(userId);

  if (activeSub) redirect("/dashboard");

  return (
    <div className="dashboard-shell">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
        <Sidebar isAdmin={isAdmin} hasActiveSubscription={false} />
        <div className="min-w-0">
          <Topbar title="Ativar assinatura" userName={session.user?.name} userImage={session.user?.image} />
          <LicenseRedeemPanel
            guilds={eligible.map((g) => ({ id: String(g.id), name: String(g.name || g.id) }))}
            redirectOnSuccess
          />
        </div>
      </div>
    </div>
  );
}
