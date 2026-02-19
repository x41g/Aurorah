"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TurnstileBox } from "@/components/common/TurnstileBox";

type GuildOption = {
  id: string;
  name: string;
};

export function LicenseRedeemPanel({
  guilds,
  redirectOnSuccess = false,
}: {
  guilds: GuildOption[];
  redirectOnSuccess?: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [guildId, setGuildId] = useState(guilds[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/licenses/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: String(code || "").trim(),
          guildId: guildId || undefined,
          captchaToken: captchaToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao ativar key");
      const expiresAt = String(data?.result?.subscription?.expiresAt || "");
      setOk(
        expiresAt
          ? `Key ativada com sucesso. Assinatura valida ate ${new Date(expiresAt).toLocaleString("pt-BR")}.`
          : "Key ativada com sucesso."
      );
      setCode("");
      router.refresh();
      if (redirectOnSuccess) {
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 350);
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg === "license_not_found") setError("Key invalida.");
      else if (msg === "license_disabled") setError("Key desativada.");
      else if (msg === "license_exhausted") setError("Key sem ativacoes disponiveis.");
      else if (msg === "license_expired") setError("Key expirada.");
      else if (msg === "captcha_required") setError("Complete o captcha para continuar.");
      else if (msg === "captcha_failed") setError("Captcha invalido ou expirado. Tente novamente.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-2">Ativar assinatura por key</h2>
      <p className="text-white/60 text-sm mb-3">Cole sua key e selecione um servidor para vincular o uso.</p>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px_auto] gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="AUR-XXXX-XXXX-XXXX-XXXX"
          className="h-11 rounded-2xl bg-black/40 border border-white/10 px-4 outline-none focus:border-white/25 font-mono"
        />
        <select
          value={guildId}
          onChange={(e) => setGuildId(e.target.value)}
          className="h-11 rounded-2xl bg-black/40 border border-white/10 px-3 outline-none"
        >
          <option value="">Sem vinculo de servidor</option>
          {guilds.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => submit()}
          disabled={loading || !String(code).trim() || (captchaRequired && !captchaToken)}
          className="h-11 px-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-60"
        >
          {loading ? "Ativando..." : "Ativar"}
        </button>
      </div>
      <div className="mt-3">
        <TurnstileBox onTokenChange={setCaptchaToken} onRequirementChange={setCaptchaRequired} />
      </div>
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
    </div>
  );
}
