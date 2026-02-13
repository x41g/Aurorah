import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function assertCronAuth(req: Request) {
  const expected = process.env.CRON_SECRET || "";
  if (!expected) throw new Error("CRON_SECRET missing");
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${expected}`) throw new Error("unauthorized");
}

export async function GET(req: Request) {
  try {
    assertCronAuth(req);

    const now = new Date();
    const result = await prisma.transcript.deleteMany({
      where: { expireAt: { lt: now } },
    });

    return Response.json({ ok: true, deleted: result.count }, { status: 200 });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg === "unauthorized") return Response.json({ error: "unauthorized" }, { status: 401 });
    return Response.json({ error: "server_error", detail: msg }, { status: 500 });
  }
}
