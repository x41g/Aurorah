import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function assertAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.BOT_API_SECRET || "";
  if (!expected) throw new Error("BOT_API_SECRET missing");
  if (auth !== `Bearer ${expected}`) {
    throw new Error("unauthorized");
  }
}

export async function POST(req: Request) {
  try {
    assertAuth(req);

    const body = await req.json();
    const {
      guildSlug,
      userId,
      shortcode,
      html,
      passHash,
      expireAt,
    }: {
      guildSlug?: string;
      userId?: string;
      shortcode?: string;
      html?: string;
      passHash?: string;
      expireAt?: number;
    } = body || {};

    if (!guildSlug || !userId || !shortcode || !html || !passHash || !expireAt) {
      return Response.json({ error: "bad_request" }, { status: 400 });
    }

    const slug = `${guildSlug}-${userId}-${shortcode}`;

    await prisma.transcript.upsert({
      where: { slug },
      create: {
        slug,
        guildSlug,
        userId: String(userId),
        shortcode,
        html,
        passHash,
        expireAt: new Date(Number(expireAt)),
      },
      update: {
        html,
        passHash,
        expireAt: new Date(Number(expireAt)),
      },
    });

    const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://auroxegroup.shop").replace(/\/$/, "");
    const url = `${base}/transcript/${slug}`;

    return Response.json({ ok: true, slug, url }, { status: 200 });
  } catch (err: any) {
    console.error("[internal/transcript] error:", err);
    const msg = String(err?.message || err);
    if (msg === "unauthorized") {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "server_error", detail: msg }, { status: 500 });
  }
}
