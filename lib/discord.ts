export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions: string; // stringified int
};

export function hasManageGuild(guild: DiscordGuild) {
  const perms = BigInt(guild.permissions || "0");
  const MANAGE_GUILD = 0x20n;
  const ADMINISTRATOR = 0x8n;
  return (perms & MANAGE_GUILD) !== 0n || (perms & ADMINISTRATOR) !== 0n;
}

export function guildIconUrl(guild: DiscordGuild) {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const r = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!r.ok) return [];
  return (await r.json()) as DiscordGuild[];
}
