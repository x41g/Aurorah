import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";

export const runtime = "nodejs";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return session;
}

async function fetchDiscordUser(id: string) {
  const token = process.env.DISCORD_BOT_TOKEN || "";
  if (!token) return null;
  const r = await fetch(`https://discord.com/api/v10/users/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const u = await r.json().catch(() => null);
  if (!u?.id) return null;
  const avatar = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
    : "";
  return {
    id: String(u.id),
    username: String(u.username || ""),
    globalName: u.global_name ? String(u.global_name) : "",
    avatar,
  };
}

export async function GET(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const idsRaw = String(searchParams.get("ids") || "").trim();
  const ids = idsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  const out: Record<string, any> = {};
  for (const id of ids) {
    out[id] = await fetchDiscordUser(id);
  }

  return NextResponse.json({ users: out });
}
