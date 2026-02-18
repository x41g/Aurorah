import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readMaintenanceState } from "@/lib/siteMaintenance";

export const runtime = "nodejs";

export async function GET() {
  const row = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const maintenance = readMaintenanceState(row?.guildIds);
  return NextResponse.json({ ok: true, maintenance });
}

