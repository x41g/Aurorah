import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;

  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const confirm = String(body?.confirm || "").trim();
  if (confirm !== "EU CONFIRMO") {
    return NextResponse.json({ error: "confirm_required" }, { status: 400 });
  }

  // ⚠️ Limpa TUDO relacionado a servidores (configs/estatísticas/transcripts/owners/uso)
  await prisma.guildStats.deleteMany({});
  await prisma.guildConfig.deleteMany({});
  await prisma.guildOwner.deleteMany({});
  await prisma.usageMonthly.deleteMany({});
  await prisma.transcript.deleteMany({});
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