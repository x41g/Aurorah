import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizeSubscriptionStatus } from "@/lib/subscriptions";

export type LicenseKeyStatus = "active" | "disabled" | "exhausted" | "expired";

function licenseSecret() {
  return String(process.env.LICENSE_KEY_SECRET || process.env.BOT_API_SECRET || "aurora-license-secret").trim();
}

export function normalizeLicenseCode(input: unknown) {
  return String(input || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function hashLicenseCode(code: string) {
  const normalized = normalizeLicenseCode(code);
  return crypto.createHash("sha256").update(`${licenseSecret()}:${normalized}`).digest("hex");
}

function randomChars(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function generateLicenseCode() {
  for (let i = 0; i < 20; i += 1) {
    const code = `AUR-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`;
    const codeHash = hashLicenseCode(code);
    const exists = await prisma.licenseKey.findUnique({ where: { codeHash }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error("license_code_generation_failed");
}

function addDays(base: Date, days: number) {
  const out = new Date(base.getTime());
  out.setUTCDate(out.getUTCDate() + Math.max(1, days));
  return out;
}

function daysValue(input: unknown, fallback: number) {
  const n = Number(input);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

function actValue(input: unknown, fallback: number) {
  const n = Number(input);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

export function sanitizeLicenseCreateInput(input: any) {
  return {
    planKey: String(input?.planKey || "").trim().toUpperCase(),
    durationDays: daysValue(input?.durationDays, 30),
    maxActivations: actValue(input?.maxActivations, 1),
    expiresAt: input?.expiresAt ? new Date(String(input.expiresAt)) : null,
    note: input?.note ? String(input.note).slice(0, 500) : null,
    count: Math.min(50, Math.max(1, Math.floor(Number(input?.count || 1) || 1))),
  };
}

type ActivateInput = {
  code: string;
  userId: string;
  guildId?: string | null;
};

export async function activateLicenseKey(input: ActivateInput) {
  const code = String(input.code || "").trim();
  const userId = String(input.userId || "").trim();
  const guildId = input.guildId ? String(input.guildId).trim() : null;
  if (!code || !userId) throw new Error("bad_request");

  const codeHash = hashLicenseCode(code);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const key = await tx.licenseKey.findUnique({
      where: { codeHash },
      include: { plan: true },
    });
    if (!key) throw new Error("license_not_found");

    const currentStatus = String(key.status || "active").toLowerCase() as LicenseKeyStatus;
    if (currentStatus === "disabled") throw new Error("license_disabled");
    if (currentStatus === "exhausted") throw new Error("license_exhausted");
    if (currentStatus === "expired") throw new Error("license_expired");
    if (key.expiresAt && key.expiresAt.getTime() <= now.getTime()) {
      await tx.licenseKey.update({
        where: { id: key.id },
        data: { status: "expired" },
      });
      throw new Error("license_expired");
    }
    if (key.usedCount >= key.maxActivations) {
      await tx.licenseKey.update({
        where: { id: key.id },
        data: { status: "exhausted" },
      });
      throw new Error("license_exhausted");
    }

    const existingActivation = await tx.licenseActivation.findFirst({
      where: {
        keyId: key.id,
        userId,
        guildId,
      },
    });
    if (existingActivation) {
      return {
        ok: true as const,
        alreadyActivated: true,
        activation: existingActivation,
        key: {
          id: key.id,
          planKey: key.planKey,
          durationDays: key.durationDays,
          maxActivations: key.maxActivations,
          usedCount: key.usedCount,
          status: key.status,
        },
      };
    }

    const startsAt = now;
    const activationExpiresAt = addDays(now, key.durationDays);
    const activation = await tx.licenseActivation.create({
      data: {
        keyId: key.id,
        userId,
        guildId,
        startsAt,
        expiresAt: activationExpiresAt,
      },
    });

    const currentSub = await tx.subscription.findUnique({ where: { userId } });
    const base = currentSub?.expiresAt && currentSub.expiresAt.getTime() > now.getTime() ? currentSub.expiresAt : now;
    const newSubExpiresAt = addDays(base, key.durationDays);
    const newSubStatus = normalizeSubscriptionStatus("active");
    const statusChanged = String(currentSub?.status || "").toLowerCase() !== newSubStatus;

    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planKey: key.planKey,
        status: newSubStatus,
        startedAt: now,
        renewAt: newSubExpiresAt,
        expiresAt: newSubExpiresAt,
        canceledAt: null,
        cancelAtPeriodEnd: false,
        endedAt: null,
        statusReason: "license_key_activation",
        lastStatusChangeAt: now,
      },
      update: {
        planKey: key.planKey,
        status: newSubStatus,
        renewAt: newSubExpiresAt,
        expiresAt: newSubExpiresAt,
        canceledAt: null,
        cancelAtPeriodEnd: false,
        endedAt: null,
        statusReason: "license_key_activation",
        lastStatusChangeAt: statusChanged ? now : currentSub?.lastStatusChangeAt || now,
      },
    });

    const usedCount = key.usedCount + 1;
    const nextStatus = usedCount >= key.maxActivations ? "exhausted" : "active";
    const nextKey = await tx.licenseKey.update({
      where: { id: key.id },
      data: {
        usedCount,
        status: nextStatus,
      },
    });

    return {
      ok: true as const,
      alreadyActivated: false,
      activation,
      key: {
        id: nextKey.id,
        planKey: nextKey.planKey,
        durationDays: nextKey.durationDays,
        maxActivations: nextKey.maxActivations,
        usedCount: nextKey.usedCount,
        status: nextKey.status,
      },
      subscription: {
        userId,
        planKey: key.planKey,
        expiresAt: newSubExpiresAt.toISOString(),
      },
    };
  });
}
