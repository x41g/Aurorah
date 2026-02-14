import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { guildId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "missing bot token" }, { status: 500 });

  const res = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/roles`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "failed roles" }, { status: 500 });

  const roles = (await res.json()) as any[];
  // remove @everyone e ordena
  const out = roles
    .filter((r) => r?.name !== "@everyone")
    .map((r) => ({ id: String(r.id), name: String(r.name) }));

  return NextResponse.json(out);
}