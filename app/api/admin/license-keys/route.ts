import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { generateLicenseCode, hashLicenseCode, sanitizeLicenseCreateInput } from "@/lib/licenseKeys";

export const runtime = "nodejs";

async function assertAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id ?? null;
  if (!session?.user || !isAdminDiscordId(userId)) return null;
  return session;
}

function parseDateInput(input: unknown) {
  if (input === null || input === "" || input === undefined) return { ok: true as const, value: input === undefined ? undefined : null };
  const d = new Date(String(input));
  if (Number.isNaN(d.getTime())) return { ok: false as const };
  return { ok: true as const, value: d };
}

export async function GET(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get("q") || "").trim();
  const status = String(searchParams.get("status") || "").trim().toLowerCase();

  const keys = await prisma.licenseKey.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { codeLast4: { contains: q, mode: "insensitive" } },
              { codePrefix: { contains: q, mode: "insensitive" } },
              { planKey: { contains: q, mode: "insensitive" } },
              { note: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      plan: true,
      _count: { select: { activations: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 300,
  });

  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const input = sanitizeLicenseCreateInput(body);
  if (!input.planKey) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (input.expiresAt && Number.isNaN(input.expiresAt.getTime())) return NextResponse.json({ error: "bad_request_invalid_date" }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { key: input.planKey }, select: { key: true } });
  if (!plan) return NextResponse.json({ error: "plan_not_found" }, { status: 404 });

  const created = [];
  for (let i = 0; i < input.count; i += 1) {
    const code = await generateLicenseCode();
    const normalized = code.replace(/[^A-Z0-9]/g, "");
    const codeHash = hashLicenseCode(code);
    const row = await prisma.licenseKey.create({
      data: {
        codeHash,
        codePrefix: normalized.slice(0, 6),
        codeLast4: normalized.slice(-4),
        planKey: input.planKey,
        durationDays: input.durationDays,
        maxActivations: input.maxActivations,
        expiresAt: input.expiresAt,
        note: input.note,
        createdBy: String(session.user?.id || ""),
      },
      include: { plan: true, _count: { select: { activations: true } } },
    });
    created.push({ ...row, code });
  }

  return NextResponse.json({ ok: true, created });
}

export async function PUT(req: Request) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const id = String(body?.id || "").trim();
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const expires = parseDateInput(body?.expiresAt);
  if (!expires.ok) return NextResponse.json({ error: "bad_request_invalid_date" }, { status: 400 });

  const nextStatusRaw = body?.status === undefined ? undefined : String(body.status).toLowerCase();
  const allowed = ["active", "disabled", "exhausted", "expired"];
  const status = nextStatusRaw && allowed.includes(nextStatusRaw) ? nextStatusRaw : undefined;

  const note = body?.note === undefined ? undefined : body?.note === null || body?.note === "" ? null : String(body.note).slice(0, 500);

  const row = await prisma.licenseKey.update({
    where: { id },
    data: {
      status,
      note,
      expiresAt: expires.value as any,
      revokedAt: status === "disabled" ? new Date() : body?.status === undefined ? undefined : null,
    },
    include: { plan: true, _count: { select: { activations: true } } },
  });

  return NextResponse.json({ ok: true, key: row });
}

