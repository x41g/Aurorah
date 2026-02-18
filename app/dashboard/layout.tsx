import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ensureSupportGuildMembership } from "@/lib/discordAutoJoin";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) redirect("/login");
  await ensureSupportGuildMembership({
    userId: String(session?.user?.id || ""),
    userAccessToken: String(session?.accessToken || ""),
  }).catch(() => null);

  return (
    <div className="min-h-screen section pb-10">
      <div className="container-max relative">{children}</div>
    </div>
  );
}



