export function assertInternalAuth(req: Request) {
  const secret = process.env.BOT_API_SECRET ?? "";
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = req.headers.get("x-bot-secret") || "";
  if (!secret || (token !== secret && alt !== secret)) {
    return false;
  }
  return true;
}
