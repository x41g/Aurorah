import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertInternalAuth } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!assertInternalAuth(req)) throw new Error("unauthorized");

    const row = await prisma.whitelist.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({
      enabled: Boolean(row?.enabled),
      guildIds: Array.isArray(row?.guildIds) ? (row!.guildIds as any).map(String) : [],
      updatedAt: row?.updatedAt ? row.updatedAt.getTime() : 0,
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    const code = msg === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
