import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MAINTENANCE_MESSAGE,
  buildBotStatePayload,
  readGuildIds,
  readMaintenanceState,
} from "@/lib/siteMaintenance";

export const runtime = "nodejs";

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const row = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const maintenance = readMaintenanceState(row?.guildIds);
  return NextResponse.json({ ok: true, maintenance });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const enabled = Boolean(body?.enabled);
  const message = String(body?.message || DEFAULT_MAINTENANCE_MESSAGE).trim().slice(0, 240);

  const row = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const guildIds = readGuildIds(row?.guildIds);
  const nextPayload = buildBotStatePayload(guildIds, {
    enabled,
    message: message || DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: Date.now(),
  });

  await prisma.botState.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", guildIds: nextPayload as any },
    update: { guildIds: nextPayload as any },
  });

  return NextResponse.json({ ok: true, maintenance: nextPayload.maintenance });
}

