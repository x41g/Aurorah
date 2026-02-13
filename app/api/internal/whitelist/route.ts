import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const row = await prisma.whitelist.findUnique({ where: { id: "singleton" } });
  const enabled = Boolean(row?.enabled);
  const guildIds = Array.isArray(row?.guildIds) ? (row!.guildIds as any).map(String) : [];

  return NextResponse.json({ enabled, guildIds });
}
