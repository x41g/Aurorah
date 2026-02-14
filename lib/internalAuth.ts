export function assertInternalAuth(req: Request) {
  const secret = process.env.BOT_API_SECRET ?? "";
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || token !== secret) {
    return false;
  }
  return true;
}
