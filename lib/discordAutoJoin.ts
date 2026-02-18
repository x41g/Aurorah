type AutoJoinParams = {
  userId: string;
  userAccessToken: string;
};

function env(name: string, fallback = "") {
  return String(process.env[name] || fallback || "").trim();
}

export async function ensureSupportGuildMembership(params: AutoJoinParams): Promise<void> {
  const guildId = env("SUPPORT_GUILD_ID", env("DISCORD_SUPPORT_GUILD_ID"));
  const botToken = env("DISCORD_BOT_TOKEN");
  const userId = String(params?.userId || "").trim();
  const accessToken = String(params?.userAccessToken || "").trim();

  if (!guildId || !botToken || !userId || !accessToken) return;

  const url = `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: accessToken,
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!res) return;
  if (res.status === 201 || res.status === 204 || res.ok) return;
}

