import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Payload = {
  enabled?: boolean;
  guildIds?: string[];
};

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return { ok: false as const };
  return { ok: true as const };
}

export async function GET() {
  const admin = await assertAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const row = await prisma.whitelist.findUnique({ where: { id: "singleton" } });
  const enabled = Boolean(row?.enabled);
  const guildIds = Array.isArray(row?.guildIds) ? (row!.guildIds as any).map(String) : [];
  return NextResponse.json({ enabled, guildIds });
}

export async function PUT(req: Request) {
  const admin = await assertAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const enabled = Boolean(body.enabled);
  const guildIds = Array.isArray(body.guildIds) ? body.guildIds.map(String).filter(Boolean) : [];

  await prisma.whitelist.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", enabled, guildIds },
    update: { enabled, guildIds },
  });

  return NextResponse.json({ ok: true });
}
