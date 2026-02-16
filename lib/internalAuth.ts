function getAllowedSecrets(): string[] {
  const single = String(process.env.BOT_API_SECRET || "").trim();
  const csv = String(process.env.BOT_API_SECRETS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [single, ...csv].filter(Boolean);
  return Array.from(new Set(all));
}

export function assertInternalAuth(req: Request) {
  const allowed = getAllowedSecrets();
  if (!allowed.length) return false;

  const url = new URL(req.url);
  const queryToken = String(url.searchParams.get("botSecret") || "").trim();
  const header = req.headers.get("authorization") || "";
  const bearerToken = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const headerToken = String(req.headers.get("x-bot-secret") || "").trim();

  const hasMatch = [bearerToken, headerToken, queryToken].some((token) => token && allowed.includes(token));
  return hasMatch;
}
