import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readGuildIds } from "@/lib/siteMaintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [botState, transcriptCount] = await Promise.all([
      prisma.botState.findUnique({ where: { id: "singleton" } }),
      prisma.transcript.count(),
    ]);

    const activeServers = readGuildIds(botState?.guildIds).length;

    return NextResponse.json(
      {
        ok: true,
        stats: {
          activeServers,
          processedTickets: Number(transcriptCount || 0),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        stats: {
          activeServers: 0,
          processedTickets: 0,
        },
        error: String((e as any)?.message || e || "landing_stats_error"),
      },
      { status: 500 }
    );
  }
}

