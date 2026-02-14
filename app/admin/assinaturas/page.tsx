import { Topbar } from "@/components/dashboard/Topbar";
import { SubscriptionsPanel } from "@/components/admin/SubscriptionsPanel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AssinaturasPage() {
  const session = (await getServerSession(authOptions as any)) as any;

  return (
    <>
      <Topbar title="Assinaturas" userName={session?.user?.name} userImage={session?.user?.image} />
      <div className="mt-6">
        <SubscriptionsPanel />
      </div>
    </>
  );
}
