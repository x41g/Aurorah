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
  const [confirmText, setConfirmText] = useState("");

  async function onReset() {
    setError("");
    setOk("");

    if (confirmText.trim() !== "EU CONFIRMO") {
      setError('Digite exatamente "EU CONFIRMO" para continuar.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText.trim() }),
      });
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

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Digite: EU CONFIRMO'
            className="h-10 w-full sm:w-[200px] rounded-xl bg-black/40 border border-white/10 px-3 outline-none focus:border-white/25"
            disabled={loading}
          />
          <button
            onClick={onReset}
            disabled={loading}
            className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Limpando..." : "Limpar database"}
          </button>
        </div>
      </div>

      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}
    </div>
  );
}
