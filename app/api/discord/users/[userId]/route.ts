import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "missing bot token" }, { status: 500 });

  const res = await fetch(`https://discord.com/api/v10/users/${params.userId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "failed" }, { status: 500 });

  const u: any = await res.json();
  const avatarUrl = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
    : null;

  return NextResponse.json({ id: String(u.id), name: u.global_name || u.username || "Staff", avatarUrl });
}