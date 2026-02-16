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
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onReset() {
    setError("");
    setOk("");

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
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
          className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Limpando..." : "Limpar database"}
        </button>
      </div>

      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151622] p-5 shadow-2xl">
            <div className="text-lg font-semibold">Confirmar limpeza</div>
            <p className="mt-2 text-sm text-white/70">
              Isso vai apagar configs, stats, owners, transcripts e uso mensal. Planos/assinaturas podem ser mantidos.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  void onReset();
                }}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
