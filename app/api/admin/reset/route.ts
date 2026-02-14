import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;

  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // ⚠️ Ajuste o que você considera “limpar”
  await prisma.guildStats.deleteMany({});
  await prisma.guildConfig.deleteMany({});
  await prisma.botState.update({
    where: { id: "singleton" },
    data: { guildIds: [] as any },
  });

  // whitelist opcional: eu recomendo manter, mas se quiser limpar também:
  // await prisma.whitelist.update({ where: { id: "singleton" }, data: { enabled: false, guildIds: [] as any } });

  // subscriptions/planos: normalmente NÃO se apaga em “limpar servidores”
  // mas se você quiser reset total, também dá.

  return NextResponse.json({ ok: true });
}