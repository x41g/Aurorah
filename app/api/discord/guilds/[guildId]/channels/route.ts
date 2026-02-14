import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { guildId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "missing bot token" }, { status: 500 });

  const res = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "failed channels" }, { status: 500 });

  const ch = (await res.json()) as any[];

  const out = ch.map((c) => ({
    id: String(c.id),
    name: String(c.name),
    type: Number(c.type),
    parentId: c.parent_id ? String(c.parent_id) : null,
  }));

  return NextResponse.json(out);
}
