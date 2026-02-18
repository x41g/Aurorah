"use client";

import { useState } from "react";

type GuildOption = {
  id: string;
  name: string;
};

export function LicenseRedeemPanel({ guilds }: { guilds: GuildOption[] }) {
  const [code, setCode] = useState("");
  const [guildId, setGuildId] = useState(guilds[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao ativar key");
      const expiresAt = String(data?.result?.subscription?.expiresAt || "");
      setOk(expiresAt ? `Key ativada com sucesso. Assinatura válida até ${new Date(expiresAt).toLocaleString("pt-BR")}.` : "Key ativada com sucesso.");
      setCode("");
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg === "license_not_found") setError("Key inválida.");
      else if (msg === "license_disabled") setError("Key desativada.");
      else if (msg === "license_exhausted") setError("Key sem ativações disponíveis.");
      else if (msg === "license_expired") setError("Key expirada.");
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
          <option value="">Sem vínculo de servidor</option>
          {guilds.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => submit()}
          disabled={loading || !String(code).trim()}
          className="h-11 px-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-60"
        >
          {loading ? "Ativando..." : "Ativar"}
        </button>
      </div>
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
    </div>
  );
}

