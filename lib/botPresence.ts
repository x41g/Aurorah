import { prisma } from "@/lib/prisma";

export async function getBotGuildIds(): Promise<string[]> {
  const row = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const guildIds = (row?.guildIds as any)?.guildIds ?? row?.guildIds;
  if (Array.isArray(guildIds)) return guildIds.map(String);
  // backward compat if stored as { guildIds: [...] }
  if (guildIds && typeof guildIds === "object" && Array.isArray(guildIds.guildIds)) {
    return guildIds.guildIds.map(String);
  }
  return [];
}
