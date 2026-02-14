import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function assertAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.BOT_API_SECRET || "";
  if (!expected) throw new Error("BOT_API_SECRET missing");
  if (auth !== `Bearer ${expected}`) throw new Error("unauthorized");
}

export async function GET(req: Request) {
  try {
    assertAuth(req);

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
