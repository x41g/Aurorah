type PlanLike = {
  key?: string | null;
  name?: string | null;
};

const PLAN_DISPLAY_BY_KEY: Record<string, string> = {
  starter: "Essencial",
  pro: "Prime",
  enterprise: "Elite",
};

export function planDisplayName(plan?: PlanLike | null): string {
  const key = String(plan?.key || "").trim().toLowerCase();
  if (key && PLAN_DISPLAY_BY_KEY[key]) return PLAN_DISPLAY_BY_KEY[key];

  const name = String(plan?.name || "").trim();
  if (name) return name;

  return key ? key.toUpperCase() : "-";
}

