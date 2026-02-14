"use client";

import React, { useState } from "react";

async function readJsonSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resposta não-JSON (status ${res.status}). Início: ${text.slice(0, 80)}`);
  }
  return res.json();
}

export function ResetDbPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onReset() {
    setError("");
    setOk("");

    const confirmed = confirm(
      "Isso vai apagar configs, stats, owners, transcripts e uso mensal. (Planos/assinaturas podem ser mantidos).\n\nTem certeza?"
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await readJsonSafe(res).catch(() => ({}));
      if (!res.ok) throw new Error(String((data as any)?.error || "Falha ao limpar"));
      setOk("Database limpa!");
      setTimeout(() => location.reload(), 600);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Manutenção</h2>
          <p className="text-white/60 text-sm">
            Limpa dados do painel (servidores/configs/stats). Use só quando você quiser “zerar” tudo.
          </p>
        </div>

        <button
          onClick={onReset}
          disabled={loading}
          className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Limpando..." : "Limpar database"}
        </button>
      </div>

      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}
    </div>
  );
}
