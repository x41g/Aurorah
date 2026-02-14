"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Trash2, Plus, Copy } from "lucide-react";

type State = {
  enabled: boolean;
  guildIds: string[];
};

type GuildInfo = {
  id: string;
  name: string;
  iconUrl?: string | null;
};

function normalizeId(v: string) {
  return String(v || "").trim();
}

async function fetchGuildInfo(guildId: string): Promise<GuildInfo> {
  const r = await fetch(`/api/discord/guilds/${guildId}/info`, { cache: "no-store" });
  if (!r.ok) return { id: guildId, name: "Servidor", iconUrl: null };
  const d = await r.json();
  return {
    id: guildId,
    name: String(d?.name || "Servidor"),
    iconUrl: d?.iconUrl ? String(d.iconUrl) : null,
  };
}

export function WhitelistPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  const [enabled, setEnabled] = useState(false);
  const [guildIds, setGuildIds] = useState<string[]>([]);
  const [guilds, setGuilds] = useState<Record<string, GuildInfo>>({});

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addValue, setAddValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/whitelist", { cache: "no-store" });
        const data = (await res.json()) as State | { error: string };
        if (!res.ok) throw new Error((data as any)?.error || "failed");

        if (cancelled) return;
        const s = data as State;

        const ids = Array.isArray(s.guildIds) ? s.guildIds.map(String) : [];
        setEnabled(Boolean(s.enabled));
        setGuildIds(ids);

        // load info
        const infos = await Promise.all(ids.map((id) => fetchGuildInfo(id)));
        if (cancelled) return;

        const map: Record<string, GuildInfo> = {};
        for (const g of infos) map[g.id] = g;
        setGuilds(map);
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

  const count = guildIds.length;

  async function save(nextIds: string[], nextEnabled = enabled) {
    setError("");
    setOk("");
    try {
      setSaving(true);
      const res = await fetch("/api/admin/whitelist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled, guildIds: nextIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || "Falha ao salvar");

      setOk("Salvo!");
      setTimeout(() => setOk(""), 1800);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(v: boolean) {
    setEnabled(v);
    await save(guildIds, v);
  }

  async function onRemove(id: string) {
    const next = guildIds.filter((x) => x !== id);
    setGuildIds(next);

    const copy = { ...guilds };
    delete copy[id];
    setGuilds(copy);

    await save(next, enabled);
  }

  async function onAdd() {
    const id = normalizeId(addValue);
    if (!id) return;

    if (guildIds.includes(id)) {
      setAddOpen(false);
      setAddValue("");
      return;
    }

    const next = [id, ...guildIds];
    setGuildIds(next);

    // otimista: já cria card “carregando”
    setGuilds((prev) => ({
      ...prev,
      [id]: { id, name: "Carregando...", iconUrl: null },
    }));

    setAddOpen(false);
    setAddValue("");

    // salva + busca info
    await save(next, enabled);
    const info = await fetchGuildInfo(id);
    setGuilds((prev) => ({ ...prev, [id]: info }));
  }

  function copyId(id: string) {
    navigator.clipboard?.writeText(id);
    setOk("Copiado!");
    setTimeout(() => setOk(""), 1200);
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Whitelist</h2>
          <p className="text-white/60 text-sm">
            Quando ativada, o bot só funciona nos servidores listados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={loading || saving}
            onClick={() => setAddOpen(true)}
            className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={loading || saving}
          onClick={() => onToggle(!enabled)}
          className={[
            "px-4 py-2 rounded-xl border transition text-sm font-semibold",
            enabled ? "bg-violet-500/20 border-violet-400/30 text-violet-100" : "bg-white/5 border-white/10 text-white/80",
          ].join(" ")}
        >
          {enabled ? "Whitelist ativa" : "Whitelist desativada"}
        </button>

        <span className="text-xs text-white/50">
          ({count} {count === 1 ? "servidor" : "servidores"})
        </span>
      </div>

      {/* LIST */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {guildIds.map((id) => {
          const g = guilds[id] || { id, name: "Servidor", iconUrl: null };

          return (
            <div key={id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {g.iconUrl ? (
                    <img
                      src={g.iconUrl}
                      alt=""
                      className="h-11 w-11 rounded-2xl border border-white/10 object-cover shrink-0"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <div className="font-semibold truncate">{g.name}</div>
                    <div className="text-xs text-white/60 flex items-center gap-2">
                      <span className="truncate">{id}</span>
                      <button
                        type="button"
                        onClick={() => copyId(id)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                        title="Copiar ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 3 pontinhos: aqui pode virar dropdown depois */}
                  <Link
                    href={`/dashboard/${id}`}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    title="Gerenciar"
                  >
                    <MoreHorizontal size={18} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onRemove(id)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/30 transition"
                    title="Remover da whitelist"
                    disabled={saving}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-white/50">
                {enabled ? "Ativo: bot funciona aqui" : "Whitelist desativada"}
              </div>
            </div>
          );
        })}

        {!loading && guildIds.length === 0 ? (
          <div className="text-sm text-white/60">
            Nenhum servidor na whitelist. Clique em <b>Adicionar</b>.
          </div>
        ) : null}
      </div>

      {loading ? <div className="mt-4 text-sm text-white/60">Carregando...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      {/* ADD MODAL */}
      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0D14] p-5">
            <div className="font-bold text-lg">Adicionar servidor</div>
            <p className="text-sm text-white/60 mt-1">
              Cole o <b>Guild ID</b> do servidor.
            </p>

            <input
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              className="mt-4 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
              placeholder="Ex: 1397332663127511221"
              inputMode="numeric"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                onClick={() => {
                  setAddOpen(false);
                  setAddValue("");
                }}
              >
                Cancelar
              </button>
              <button
                className="h-10 px-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition"
                onClick={onAdd}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
