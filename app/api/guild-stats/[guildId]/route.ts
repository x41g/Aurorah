import { NextResponse } from "next/server";
import { canManageGuild } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import type { GuildStats } from "@/lib/types";

export async function GET(_: Request, { params }: { params: { guildId: string } }) {
  const { guildId } = params;
  const access = await canManageGuild(guildId);
  if (!access.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const row = await prisma.guildStats.findUnique({ where: { guildId: String(guildId) } });

  const stats: GuildStats = {
    guildId: String(guildId),
    updatedAt: row?.updatedAt ? row.updatedAt.getTime() : 0,
    todayKey: row?.todayKey || undefined,
    ticketsCreatedToday: row?.ticketsCreatedToday ?? 0,
    ticketsClosedToday: row?.ticketsClosedToday ?? 0,
    staff: (row?.staff as any) || undefined,
  };

  return NextResponse.json(stats);
}
