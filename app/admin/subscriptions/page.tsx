import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { SubscriptionsPanel } from "@/components/admin/SubscriptionsPanel";

export default async function AdminSubscriptionsPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) redirect("/login");

  const userId = session.user?.id ?? null;
  if (!isAdminDiscordId(userId)) redirect("/403");

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <Sidebar isAdmin={true} />
          </div>

          <main className="min-w-0">
            <Topbar title="Assinaturas" userName={session.user?.name} userImage={session.user?.image} />
            <div className="mt-6">
              <SubscriptionsPanel />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}