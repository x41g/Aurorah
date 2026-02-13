import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";
import { prisma } from "@/lib/prisma";
import type { GuildConfig } from "@/lib/types";

export async function GET(req: Request, { params }: { params: { guildId: string } }) {
  if (!assertInternalAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const row = await prisma.guildConfig.findUnique({ where: { guildId: String(params.guildId) } });
  const cfg = (row?.data as any) || {};
  return NextResponse.json(cfg as GuildConfig);
}
