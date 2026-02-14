import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // ✅ app router
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;

  if (!session?.user) {
    return { ok: false as const, status: 401, error: "unauthorized" };
  }
  if (!isAdminDiscordId(userId)) {
    return { ok: false as const, status: 403, error: "forbidden" };
  }
  return { ok: true as const, session };
}

export async function GET() {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const row = await prisma.whitelist.findUnique({ where: { id: "singleton" } });

    return NextResponse.json(
      {
        enabled: Boolean(row?.enabled),
        guildIds: Array.isArray(row?.guildIds) ? (row!.guildIds as any).map(String) : [],
        updatedAt: row?.updatedAt ? row.updatedAt.getTime() : 0,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const enabled = Boolean(body.enabled);
    const guildIds = Array.isArray(body.guildIds) ? body.guildIds.map(String).filter(Boolean) : [];

    await prisma.whitelist.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", enabled, guildIds: guildIds as any },
      update: { enabled, guildIds: guildIds as any },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
