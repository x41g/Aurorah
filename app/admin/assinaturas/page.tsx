import { Topbar } from "@/components/dashboard/Topbar";
import { SubscriptionsPanel } from "@/components/admin/SubscriptionsPanel";
import { PlansPanel } from "@/components/admin/PlansPanel";
import { LicenseKeysPanel } from "@/components/admin/LicenseKeysPanel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AssinaturasPage() {
  const session = (await getServerSession(authOptions as any)) as any;

  return (
    <>
      <Topbar title="Assinaturas" userName={session?.user?.name} userImage={session?.user?.image} />
      <div className="mt-6">
        <SubscriptionsPanel />
        <PlansPanel />
        <LicenseKeysPanel />
      </div>
    </>
  );
}
