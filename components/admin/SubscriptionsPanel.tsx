"use client";

import React, { useEffect, useMemo, useState } from "react";

type Plan = {
  key: string;
  name: string;
  active: boolean;
  maxGuilds: number;
  maxTicketsPerMonth: number | null;
  dashboardEnabled: boolean;
  paymentsEnabled: boolean;
  safePayEnabled: boolean;
  aiEnabled: boolean;
  analyticsEnabled: boolean;
  prioritySupport: boolean;
};

type Subscription = {
  id: string;
  userId: string;
  planKey: string;
  status: string;
  renewAt: string | null;
  expiresAt: string | null;
  plan: Plan;
  updatedAt: string;
};

export function SubscriptionsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [q, setQ] = useState("");

  const [newUserId, setNewUserId] = useState("");
  const [newPlanKey, setNewPlanKey] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("active");

  const activePlans = useMemo(() => plans.filter((p) => p.active), [plans]);

  
  
async function readJsonSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resposta não-JSON (status ${res.status}). Início: ${text.slice(0, 60)}`);
  }
  return res.json();
}

  async function load() {
    setError("");
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/admin/plans", { cache: "no-store" }),
        fetch(`/api/admin/subscriptions?q=${encodeURIComponent(q)}`, { cache: "no-store" }),
      ]);

      const pData = await pRes.json();
      const sData = await sRes.json();

      if (!pRes.ok) throw new Error(pData?.error || "Falha ao carregar planos");
      if (!sRes.ok) throw new Error(sData?.error || "Falha ao carregar assinaturas");

      setPlans(Array.isArray(pData?.plans) ? pData.plans : []);
      setSubs(Array.isArray(sData?.subscriptions) ? sData.subscriptions : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSub(userId: string, planKey: string, status: string) {
    setSaving(true);
    setError("");
    setOk("");
    try {
      // payload separado para evitar erros de escopo e facilitar debugar
      const payload = { userId, planKey, status };
      const res = await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar");

      setOk("Salvo!");
      setTimeout(() => setOk(""), 1200);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function deleteSub(userId: string) {
    if (!confirm(`Remover assinatura do User ID ${userId}?`)) return;
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/admin/subscriptions?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao remover");
      setOk("Removido!");
      setTimeout(() => setOk(""), 1200);
      await load();
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
          <h2 className="text-xl font-bold">Assinaturas</h2>
          <p className="text-white/60 text-sm">
            Atribua plano por <b>User ID</b> (dono do servidor). O bot vai respeitar limites e recursos do plano.
          </p>
        </div>

        <button
          className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          onClick={() => load()}
          disabled={loading || saving}
        >
          Atualizar
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrar por User ID..."
          className="w-full sm:max-w-md rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
        />
        <button
          className="h-11 px-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition"
          onClick={() => load()}
          disabled={loading || saving}
        >
          Buscar
        </button>
      </div>

      {/* ADD / UPDATE */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold">Adicionar / atualizar assinatura</div>
        <p className="text-xs text-white/60 mt-1">
          Informe o <b>User ID</b> do dono do servidor. Se já existir, será atualizado.
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_220px_180px_160px] gap-2">
          <input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="User ID (Discord)"
            className="h-11 rounded-2xl bg-black/40 border border-white/10 px-4 outline-none focus:border-white/25"
          />

          <select
            value={newPlanKey || (activePlans[0]?.key ?? "")}
            onChange={(e) => setNewPlanKey(e.target.value)}
            className="h-11 rounded-2xl bg-black/40 border border-white/10 px-3 outline-none"
          >
            {activePlans.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>

          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="h-11 rounded-2xl bg-black/40 border border-white/10 px-3 outline-none"
          >
            <option value="active">active</option>
            <option value="past_due">past_due</option>
            <option value="canceled">canceled</option>
            <option value="expired">expired</option>
          </select>

          <button
            className="h-11 px-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-60"
            onClick={() => {
              const uid = String(newUserId || "").trim();
              const pk = (newPlanKey || activePlans[0]?.key || "").trim();
              if (!uid || !pk) return;
              saveSub(uid, pk, newStatus);
              setNewUserId("");
            }}
            disabled={saving || loading || activePlans.length === 0}
          >
            Salvar
          </button>
        </div>
      </div>

      {loading ? <div className="mt-4 text-sm text-white/60">Carregando...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      <div className="mt-5 space-y-3">
        {subs.map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  User ID: <span className="text-white/80">{s.userId}</span>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  Plano atual: <b>{s.plan?.name || s.planKey}</b> • Status: <b>{s.status}</b>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <select
                  defaultValue={s.planKey}
                  className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                  onChange={(e) => saveSub(s.userId, e.target.value, s.status)}
                  disabled={saving}
                >
                  {activePlans.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>

                <select
                  defaultValue={s.status}
                  className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                  onChange={(e) => saveSub(s.userId, s.planKey, e.target.value)}
                  disabled={saving}
                >
                  <option value="active">active</option>
                  <option value="past_due">past_due</option>
                  <option value="canceled">canceled</option>
                </select>

                <button
                  type="button"
                  onClick={() => deleteSub(s.userId)}
                  className="h-10 px-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold"
                  disabled={saving}
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && subs.length === 0 ? (
          <div className="text-sm text-white/60">Nenhuma assinatura encontrada.</div>
        ) : null}
      </div>
    </div>
  );
}