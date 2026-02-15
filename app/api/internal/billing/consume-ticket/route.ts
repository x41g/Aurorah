import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSubscriptionByUserId, getWhitelistState } from "@/lib/entitlements";

export const runtime = "nodejs";

function assertAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.BOT_API_SECRET || "";
  if (!expected) throw new Error("BOT_API_SECRET missing");
  if (auth !== `Bearer ${expected}`) throw new Error("unauthorized");
}

function monthKeyUTC(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function POST(req: Request) {
  try {
    assertAuth(req);
    const body = await req.json().catch(() => null);

    const guildId = String(body?.guildId || "").trim();
    const ownerId = String(body?.ownerId || "").trim();
    if (!guildId || !ownerId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const wl = await getWhitelistState();
    if (wl.enabled && !wl.guildIds.includes(guildId)) {
      return NextResponse.json({ ok: false, error: "guild_not_whitelisted" }, { status: 403 });
    }

    const subInfo = await getActiveSubscriptionByUserId(ownerId);
    if (!subInfo?.active) {
      return NextResponse.json({ ok: false, error: "no_active_subscription" }, { status: 403 });
    }

    const plan = subInfo.plan;
    const limit = plan.maxTicketsPerMonth == null ? null : Number(plan.maxTicketsPerMonth);

    const mk = monthKeyUTC();

    // registra consumo
    const row = await prisma.usageMonthly.upsert({
      where: { userId_monthKey: { userId: ownerId, monthKey: mk } },
      create: { userId: ownerId, monthKey: mk, tickets: 0 },
      update: {},
    });

    if (limit != null && row.tickets >= limit) {
      return NextResponse.json({ ok: false, error: "ticket_limit_reached", monthKey: mk, used: row.tickets, limit }, { status: 403 });
    }

    const updated = await prisma.usageMonthly.update({
      where: { id: row.id },
      data: { tickets: { increment: 1 } },
    });

    return NextResponse.json({ ok: true, monthKey: mk, used: updated.tickets, limit });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ error: msg === "unauthorized" ? "unauthorized" : "server_error" }, { status: msg === "unauthorized" ? 401 : 500 });
  }
}
