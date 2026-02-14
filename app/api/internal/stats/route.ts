import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";
import { prisma } from "@/lib/prisma";
import type { GuildStats } from "@/lib/types";

export async function POST(req: Request) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as GuildStats | null;
  if (!body?.guildId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const stats: GuildStats = {
    guildId: String(body.guildId),
    updatedAt: Date.now(),
    todayKey: body.todayKey,
    ticketsCreatedToday: Number(body.ticketsCreatedToday ?? 0),
    ticketsClosedToday: Number(body.ticketsClosedToday ?? 0),
    staff: body.staff && typeof body.staff === "object" ? body.staff : undefined,
  };

  await prisma.guildStats.upsert({
    where: { guildId: stats.guildId },
    create: {
      guildId: stats.guildId,
      todayKey: stats.todayKey || null,
      ticketsCreatedToday: Number(stats.ticketsCreatedToday ?? 0),
      ticketsClosedToday: Number(stats.ticketsClosedToday ?? 0),
      staff: stats.staff ?? undefined,
    },
    update: {
      todayKey: stats.todayKey || null,
      ticketsCreatedToday: Number(stats.ticketsCreatedToday ?? 0),
      ticketsClosedToday: Number(stats.ticketsClosedToday ?? 0),
      staff: stats.staff ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
