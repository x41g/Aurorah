"use client";

import React, { useEffect, useMemo, useState } from "react";

type State = {
  enabled: boolean;
  guildIds: string[];
};

function normalizeId(v: string) {
  return String(v || "").trim();
}

export function WhitelistPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");

  const ids = useMemo(() => {
    const lines = text
      .split(/\r?\n/)
      .map(normalizeId)
      .filter(Boolean);
    // unique preserve order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of lines) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  }, [text]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/whitelist", { cache: "no-store" });
        const data = (await res.json()) as State | { error: string };
        if (!res.ok) throw new Error((data as any)?.error || "failed");
        if (cancelled) return;
        const d = data as State;
        setEnabled(Boolean(d.enabled));
        setText(Array.isArray(d.guildIds) ? d.guildIds.join("\n") : "");
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setError("");
    setOk("");
    try {
      setSaving(true);
      const res = await fetch("/api/admin/whitelist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, guildIds: ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || "Falha ao salvar");
      setOk("Salvo!");
      setTimeout(() => setOk(""), 2000);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Whitelist</h2>
          <p className="text-white/60 text-sm">
            Quando ativada, o bot só funciona nos servidores listados. Coloque 1 Guild ID por linha.
          </p>
        </div>

        <button
          disabled={loading || saving}
          onClick={save}
          className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4"
            disabled={loading || saving}
          />
          Ativar whitelist
        </label>

        <span className="text-xs text-white/50">({ids.length} servidores)</span>
      </div>

      <div className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="123456789012345678\n987654321098765432"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-white/20"
          disabled={loading || saving}
        />
      </div>

      {loading ? <div className="mt-3 text-sm text-white/60">Carregando...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}
    </div>
  );
}
