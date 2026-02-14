export function getAdminIds(): string[] {
  const raw = process.env.ADMIN_DISCORD_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminDiscordId(userId: string | null | undefined) {
  if (!userId) return false;
  return getAdminIds().includes(String(userId));
}
