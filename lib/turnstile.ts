export function isTurnstileEnabled(): boolean {
  return Boolean(String(process.env.TURNSTILE_SECRET_KEY || "").trim());
}

export async function verifyTurnstileToken(params: {
  token: string;
  remoteIp?: string | null;
}): Promise<{ ok: boolean; errors: string[] }> {
  const secret = String(process.env.TURNSTILE_SECRET_KEY || "").trim();
  if (!secret) return { ok: true, errors: [] };

  const token = String(params.token || "").trim();
  if (!token) return { ok: false, errors: ["missing-token"] };

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (params.remoteIp) form.set("remoteip", String(params.remoteIp));

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    return {
      ok: Boolean(data?.success),
      errors: Array.isArray(data?.["error-codes"]) ? data["error-codes"] : [],
    };
  } catch {
    return { ok: false, errors: ["verify-failed"] };
  }
}

