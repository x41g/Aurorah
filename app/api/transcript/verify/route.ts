import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { slug, password }: { slug?: string; password?: string } = await req.json();

    const pw = String(password || "").trim();
    const s = String(slug || "").trim();
    if (!s || !pw) return Response.json({ error: "bad_request" }, { status: 400 });

    const row = await prisma.transcript.findUnique({ where: { slug: s } });
    if (!row) return Response.json({ error: "not_found" }, { status: 404 });

    if (row.expireAt && Date.now() > row.expireAt.getTime()) {
      return Response.json({ error: "expired" }, { status: 410 });
    }

    const secret = String(process.env.TRANSCRIPT_HASH_SECRET || "").trim();
    if (!secret) throw new Error("TRANSCRIPT_HASH_SECRET missing");

    const expectedHash = String(row.passHash || "");
    const inputHashPipe = sha256(`${pw}|${secret}`);
    const inputHashColon = sha256(`${pw}:${secret}`);

    if (!expectedHash || (inputHashPipe !== expectedHash && inputHashColon !== expectedHash)) {
      return Response.json({ error: "wrong_password" }, { status: 401 });
    }

    return Response.json({ ok: true, html: row.html }, { status: 200 });
  } catch (err: any) {
    console.error("[transcript/verify] error:", err);
    return Response.json(
      { error: "server_error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
