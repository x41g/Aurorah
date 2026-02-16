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

type DiscordUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  action: null | (() => void | Promise<void>);
};

export function SubscriptionsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [userMap, setUserMap] = useState<Record<string, DiscordUser>>({});
  const [q, setQ] = useState("");

  const [newUserId, setNewUserId] = useState("");
  const [newPlanKey, setNewPlanKey] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("active");

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "Confirmar",
    message: "Deseja continuar?",
    action: null,
  });

  const activePlans = useMemo(() => plans.filter((p) => p.active), [plans]);

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

      const plansData: Plan[] = Array.isArray(pData?.plans) ? (pData.plans as Plan[]) : [];
      const subsData: Subscription[] = Array.isArray(sData?.subscriptions) ? (sData.subscriptions as Subscription[]) : [];
      setPlans(plansData);
      setSubs(subsData);

        const userIds: string[] = [...new Set(subsData.map((s: Subscription) => String(s.userId)).filter(Boolean))];
      if (userIds.length === 0) {
        setUserMap({});
      } else {
        const results = await Promise.allSettled(
          userIds.map(async (userId) => {
            const res = await fetch(`/api/discord/users/${encodeURIComponent(String(userId))}`, { cache: "no-store" });
            if (!res.ok) return null;
            const u = (await res.json().catch(() => null)) as DiscordUser | null;
            return u;
          })
        );
        const nextMap: Record<string, DiscordUser> = {};
        for (const r of results) {
          if (r.status === "fulfilled" && r.value?.id) nextMap[String(r.value.id)] = r.value;
        }
        setUserMap(nextMap);
      }
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

  function askConfirm(title: string, message: string, action: () => void | Promise<void>) {
    setConfirmState({ open: true, title, message, action });
  }

  async function runConfirm() {
    const action = confirmState.action;
    setConfirmState((s) => ({ ...s, open: false, action: null }));
    if (!action) return;
    await action();
  }

  async function saveSub(userId: string, planKey: string, status: string) {
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planKey, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar");
      setOk("Salvo com sucesso.");
      setTimeout(() => setOk(""), 1400);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function deleteSub(userId: string) {
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/admin/subscriptions?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao remover");
      setOk("Assinatura removida.");
      setTimeout(() => setOk(""), 1400);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function copyUserId(id: string) {
    try {
      await navigator.clipboard.writeText(String(id));
      setOk("User ID copiado.");
      setTimeout(() => setOk(""), 1200);
    } catch {
      setError("Falha ao copiar ID.");
      setTimeout(() => setError(""), 1200);
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Assinaturas</h2>
          <p className="text-white/60 text-sm">
            Gerencie assinatura por <b>User ID</b> (dono do servidor). Recursos e limites seguem o plano ativo.
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

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60">Planos ativos</div>
          <div className="text-lg font-semibold">{activePlans.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60">Assinaturas listadas</div>
          <div className="text-lg font-semibold">{subs.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60">Busca atual</div>
          <div className="text-sm font-semibold truncate">{q || "Todas"}</div>
        </div>
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

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold">Adicionar ou atualizar assinatura</div>
        <p className="text-xs text-white/60 mt-1">
          Informe o <b>User ID</b> do dono. Se ja existir assinatura, ela sera atualizada.
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_220px_180px_180px] gap-2">
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
              askConfirm("Confirmar atualizacao", `Aplicar plano ${pk} para o usuario ${uid}?`, async () => {
                await saveSub(uid, pk, newStatus);
                setNewUserId("");
              });
            }}
            disabled={saving || loading || activePlans.length === 0}
          >
            Confirmar
          </button>
        </div>
      </div>

      {loading ? <div className="mt-4 text-sm text-white/60">Carregando...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      <div className="mt-5 space-y-3">
        {subs.map((s) => {
          const u = userMap[String(s.userId)];
          return (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0 flex items-center gap-3">
                  <img
                    src={u?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png"}
                    alt={u?.name || s.userId}
                    className="h-11 w-11 rounded-full border border-white/15 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{u?.name || "Usuario"}</div>
                    <div className="text-xs text-white/70 flex items-center gap-2">
                      <span className="truncate">ID: {s.userId}</span>
                      <button
                        type="button"
                        onClick={() => copyUserId(s.userId)}
                        className="px-2 py-0.5 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 transition"
                      >
                        Copiar ID
                      </button>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      Plano atual: <b>{s.plan?.name || s.planKey}</b> • Status: <b>{s.status}</b>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <select
                    value={s.planKey}
                    className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                    onChange={(e) => {
                      const nextPlan = e.target.value;
                      askConfirm("Confirmar mudanca de plano", `Trocar plano de ${s.userId} para ${nextPlan}?`, () =>
                        saveSub(s.userId, nextPlan, s.status)
                      );
                    }}
                    disabled={saving}
                  >
                    {activePlans.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name} ({p.key})
                      </option>
                    ))}
                  </select>

                  <select
                    value={s.status}
                    className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      askConfirm("Confirmar mudanca de status", `Alterar status de ${s.userId} para ${nextStatus}?`, () =>
                        saveSub(s.userId, s.planKey, nextStatus)
                      );
                    }}
                    disabled={saving}
                  >
                    <option value="active">active</option>
                    <option value="past_due">past_due</option>
                    <option value="canceled">canceled</option>
                    <option value="expired">expired</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      askConfirm("Remover assinatura", `Deseja remover a assinatura do usuario ${s.userId}?`, () =>
                        deleteSub(s.userId)
                      )
                    }
                    className="h-10 px-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold"
                    disabled={saving}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && subs.length === 0 ? <div className="text-sm text-white/60">Nenhuma assinatura encontrada.</div> : null}
      </div>

      {confirmState.open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151622] p-5 shadow-2xl">
            <div className="text-lg font-semibold">{confirmState.title}</div>
            <p className="mt-2 text-sm text-white/70">{confirmState.message}</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmState((s) => ({ ...s, open: false, action: null }))}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
              >
                Nao
              </button>
              <button
                type="button"
                onClick={() => void runConfirm()}
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
