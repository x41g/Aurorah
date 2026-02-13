import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { guildId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "missing bot token" }, { status: 500 });

  const res = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "failed guild" }, { status: 500 });

  const g: any = await res.json();

  const iconUrl = g.icon
    ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
    : null;

  return NextResponse.json({
    id: String(g.id),
    name: String(g.name || "Servidor"),
    iconUrl,
  });
}
