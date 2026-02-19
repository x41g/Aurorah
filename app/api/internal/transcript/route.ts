import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!assertInternalAuth(req)) throw new Error("unauthorized");

    const body = await req.json();

    const {
      guildId,
      guildSlug,
      userId,
      shortcode,
      html,
      passHash,
      ttlDays,
    }: {
      guildId?: string;
      guildSlug?: string;
      userId?: string;
      shortcode?: string;
      html?: string;
      passHash?: string;
      ttlDays?: number;
    } = body || {};

    if (!guildId || !guildSlug || !userId || !shortcode || !html || !passHash) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    // ✅ TTL vem do body OU do env OU default 30
    const envDefault = Number(process.env.TRANSCRIPT_TTL_DAYS || 30);
    const ttl = Number(ttlDays ?? envDefault) || envDefault;

    // ✅ Prisma DateTime precisa de Date (não number)
    const expireAt = new Date(Date.now() + Math.max(1, ttl) * 24 * 60 * 60 * 1000);

    const slug = `${guildSlug}-${userId}-${shortcode}`;

    await prisma.transcript.upsert({
      where: { slug },
      create: {
        slug,
        guildId: String(guildId),
        guildSlug: String(guildSlug),
        userId: String(userId),
        shortcode: String(shortcode),
        html: String(html),
        passHash: String(passHash),
        expireAt,
      },
      update: {
        guildId: String(guildId),
        guildSlug: String(guildSlug),
        html: String(html),
        passHash: String(passHash),
        expireAt,
      },
    });

    const rawBase =
      String(process.env.TRANSCRIPT_PUBLIC_BASE_URL || "").trim() ||
      String(process.env.NEXT_PUBLIC_BASE_URL || "").trim();
    const reqOrigin = new URL(req.url).origin;

    // Evita base quebrada (ex.: URL de imagem/path). Usa sempre origin.
    const base = rawBase ? new URL(rawBase).origin : reqOrigin;
    const url = `${base}/transcript/${slug}`;

    return NextResponse.json(
  { ok: true, slug, url, expireAt: expireAt.toISOString(), expireAtMs: expireAt.getTime() },
  { status: 200 }
);
  } catch (err: any) {
    console.error("[internal/transcript] error:", err);
    const msg = String(err?.message || err);
    if (msg === "unauthorized") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "server_error", detail: msg }, { status: 500 });
  }
}
