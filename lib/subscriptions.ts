export const SUBSCRIPTION_STATUSES = [
  "scheduled",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
] as const;

export type SubscriptionLifecycleStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type SubscriptionLike = {
  id: string;
  status: string | null;
  startedAt?: Date | null;
  renewAt?: Date | null;
  expiresAt?: Date | null;
  canceledAt?: Date | null;
  endedAt?: Date | null;
  lastStatusChangeAt?: Date | null;
};

export function normalizeSubscriptionStatus(input: unknown, fallback: SubscriptionLifecycleStatus = "active"): SubscriptionLifecycleStatus {
  const raw = String(input || "").trim().toLowerCase();
  return (SUBSCRIPTION_STATUSES as readonly string[]).includes(raw) ? (raw as SubscriptionLifecycleStatus) : fallback;
}

function isValidDate(d: Date | null | undefined) {
  return Boolean(d && !Number.isNaN(d.getTime()));
}

export function parseOptionalDateInput(input: unknown): { ok: true; value: Date | null | undefined } | { ok: false } {
  if (input === undefined) return { ok: true, value: undefined };
  if (input === null || input === "") return { ok: true, value: null };
  const d = new Date(String(input));
  if (!isValidDate(d)) return { ok: false };
  return { ok: true, value: d };
}

export function evaluateSubscriptionState(sub: SubscriptionLike, now = new Date()) {
  const nowTs = now.getTime();
  const startedAtTs = isValidDate(sub.startedAt ?? null) ? (sub.startedAt as Date).getTime() : null;
  const expiresAtTs = isValidDate(sub.expiresAt ?? null) ? (sub.expiresAt as Date).getTime() : null;

  const current = normalizeSubscriptionStatus(sub.status, "active");
  let next: SubscriptionLifecycleStatus = current;

  if (expiresAtTs != null && expiresAtTs <= nowTs) {
    next = "expired";
  } else if (startedAtTs != null && startedAtTs > nowTs && (current === "active" || current === "trialing")) {
    next = "scheduled";
  } else if (current === "scheduled" && (startedAtTs == null || startedAtTs <= nowTs)) {
    next = "active";
  }

  const graceDays = Math.max(0, Number(process.env.SUBSCRIPTION_PAST_DUE_GRACE_DAYS || 0) || 0);
  const graceMs = graceDays * 24 * 60 * 60 * 1000;

  let active = false;
  if (next === "active" || next === "trialing") {
    active = startedAtTs == null || startedAtTs <= nowTs;
  } else if (next === "past_due") {
    active = expiresAtTs != null && expiresAtTs + graceMs > nowTs;
  } else if (next === "canceled") {
    active = expiresAtTs != null && expiresAtTs > nowTs;
  } else {
    active = false;
  }

  const changed = next !== current;
  const patch: Partial<SubscriptionLike> = {};
  if (changed) {
    patch.status = next;
    patch.lastStatusChangeAt = now;
    if (next === "expired" && !isValidDate(sub.endedAt ?? null)) patch.endedAt = now;
  }

  return {
    status: next,
    active,
    shouldPersist: changed,
    patch,
  };
}
