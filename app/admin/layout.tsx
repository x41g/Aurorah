import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) redirect("/login");
  const userId = session.user?.id ?? null;
  if (!isAdminDiscordId(userId)) redirect("/403");

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <Sidebar isAdmin={true} />
          </div>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
