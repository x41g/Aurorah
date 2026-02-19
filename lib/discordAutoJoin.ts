type AutoJoinParams = {
  userId: string;
  userAccessToken: string;
};

type AutoJoinResult =
  | { ok: true; status: number }
  | { ok: false; status: number; reason: string };

function env(name: string, fallback = "") {
  return String(process.env[name] || fallback || "").trim();
}

export async function ensureSupportGuildMembership(params: AutoJoinParams): Promise<AutoJoinResult> {
  const guildId = env("SUPPORT_GUILD_ID", env("DISCORD_SUPPORT_GUILD_ID"));
  const botToken = env("DISCORD_BOT_TOKEN");
  const userId = String(params?.userId || "").trim();
  const accessToken = String(params?.userAccessToken || "").trim();

  if (!guildId || !botToken || !userId || !accessToken) {
    return { ok: false, status: 0, reason: "missing_env_or_input" };
  }

  const url = `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}`;
  const doRequest = () =>
    fetch(url, {
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

  let res = await doRequest();
  if (!res) return { ok: false, status: 0, reason: "network_error" };
  if (res.status === 201 || res.status === 204 || res.ok) return { ok: true, status: res.status };

  if (res.status === 429 || res.status >= 500) {
    await new Promise((r) => setTimeout(r, 750));
    res = await doRequest();
    if (!res) return { ok: false, status: 0, reason: "network_error_retry" };
    if (res.status === 201 || res.status === 204 || res.ok) return { ok: true, status: res.status };
  }

  return { ok: false, status: res.status, reason: "discord_rejected" };
}
