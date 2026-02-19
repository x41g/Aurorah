import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readMaintenanceState } from "@/lib/siteMaintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const row = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const maintenance = readMaintenanceState(row?.guildIds);
  return NextResponse.json(
    { ok: true, maintenance },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
