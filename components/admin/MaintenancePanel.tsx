"use client";

import React, { useState } from "react";

type Props = {
  initialEnabled: boolean;
  initialMessage: string;
};

export function MaintenancePanel({ initialEnabled, initialMessage }: Props) {
  const [enabled, setEnabled] = useState(Boolean(initialEnabled));
  const [message, setMessage] = useState(String(initialMessage || ""));
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function save(nextEnabled: boolean) {
    setLoading(true);
    setOk("");
    setError("");
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: nextEnabled,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(String(data?.error || "Falha ao salvar manutencao"));
      }
      setEnabled(Boolean(data?.maintenance?.enabled));
      setMessage(String(data?.maintenance?.message || message));
      setOk(Boolean(data?.maintenance?.enabled) ? "Modo manutencao ativado." : "Modo manutencao desativado.");
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Modo manutencao</h2>
          <p className="text-sm text-white/65">
            Quando ativado, paginas publicas exibem a tela de manutencao com visual premium.
          </p>
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold border",
            enabled
              ? "border-amber-300/40 bg-amber-400/15 text-amber-100"
              : "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
          ].join(" ")}
        >
          {enabled ? "ATIVO" : "INATIVO"}
        </span>
      </div>

      <div className="mt-4">
        <label className="text-xs text-white/65">Mensagem exibida na pagina</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={240}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none focus:border-cyan-300/50"
          placeholder="Estamos em manutencao para aplicar melhorias..."
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void save(true)}
          disabled={loading}
          className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Ativar manutencao"}
        </button>
        <button
          type="button"
          onClick={() => void save(false)}
          disabled={loading}
          className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Desativar manutencao"}
        </button>
      </div>

      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
    </div>
  );
}

