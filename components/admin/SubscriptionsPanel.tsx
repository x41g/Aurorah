"use client";

import React, { useEffect, useMemo, useState } from "react";
import { planDisplayName } from "@/lib/planNames";

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
  startedAt: string | null;
  renewAt: string | null;
  expiresAt: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  endedAt: string | null;
  statusReason: string | null;
  computedStatus?: string;
  isActive?: boolean;
  plan: Plan;
  updatedAt: string;
};

type SubscriptionDraft = {
  planKey: string;
  status: string;
  startedAt: string;
  renewAt: string;
  expiresAt: string;
  canceledAt: string;
  endedAt: string;
  cancelAtPeriodEnd: boolean;
  statusReason: string;
};

type SaveSubPayload = {
  userId: string;
  planKey: string;
  status: string;
  startedAt?: string;
  renewAt?: string;
  expiresAt?: string;
  canceledAt?: string;
  endedAt?: string;
  cancelAtPeriodEnd?: boolean;
  statusReason?: string;
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

const STATUS_OPTIONS = ["scheduled", "trialing", "active", "past_due", "canceled", "expired"] as const;

function subscriptionStatusLabel(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (s === "scheduled") return "Agendada";
  if (s === "trialing") return "Em teste";
  if (s === "active") return "Ativa";
  if (s === "past_due") return "Em atraso";
  if (s === "canceled") return "Cancelada";
  if (s === "expired") return "Expirada";
  return s || "-";
}

function isoToLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function localInputToIso(localValue: string) {
  const raw = String(localValue || "").trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

function toDraft(s: Subscription): SubscriptionDraft {
  return {
    planKey: s.planKey,
    status: s.status,
    startedAt: isoToLocalInput(s.startedAt),
    renewAt: isoToLocalInput(s.renewAt),
    expiresAt: isoToLocalInput(s.expiresAt),
    canceledAt: isoToLocalInput(s.canceledAt),
    endedAt: isoToLocalInput(s.endedAt),
    cancelAtPeriodEnd: Boolean(s.cancelAtPeriodEnd),
    statusReason: String(s.statusReason || ""),
  };
}

function draftToPayload(userId: string, d: SubscriptionDraft): SaveSubPayload {
  return {
    userId,
    planKey: d.planKey,
    status: d.status,
    startedAt: localInputToIso(d.startedAt),
    renewAt: localInputToIso(d.renewAt),
    expiresAt: localInputToIso(d.expiresAt),
    canceledAt: localInputToIso(d.canceledAt),
    endedAt: localInputToIso(d.endedAt),
    cancelAtPeriodEnd: d.cancelAtPeriodEnd,
    statusReason: d.statusReason.trim(),
  };
}

export function SubscriptionsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [drafts, setDrafts] = useState<Record<string, SubscriptionDraft>>({});
  const [userMap, setUserMap] = useState<Record<string, DiscordUser>>({});
  const [q, setQ] = useState("");

  const [newUserId, setNewUserId] = useState("");
  const [newPlanKey, setNewPlanKey] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("active");
  const [newStartedAt, setNewStartedAt] = useState("");
  const [newRenewAt, setNewRenewAt] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newCanceledAt, setNewCanceledAt] = useState("");
  const [newEndedAt, setNewEndedAt] = useState("");
  const [newStatusReason, setNewStatusReason] = useState("");
  const [newCancelAtPeriodEnd, setNewCancelAtPeriodEnd] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

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

      const nextDrafts: Record<string, SubscriptionDraft> = {};
      for (const s of subsData) nextDrafts[s.id] = toDraft(s);
      setDrafts(nextDrafts);

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

  function patchDraft(id: string, patch: Partial<SubscriptionDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          planKey: "",
          status: "active",
          startedAt: "",
          renewAt: "",
          expiresAt: "",
          canceledAt: "",
          endedAt: "",
          cancelAtPeriodEnd: false,
          statusReason: "",
        }),
        ...patch,
      },
    }));
  }

  async function saveSub(payload: SaveSubPayload) {
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      const removed = data?.removed || {};
      const msg = `Assinatura removida. Sub: ${Number(removed?.subscriptions || 0)} | Ativacoes: ${Number(removed?.activations || 0)} | Keys: ${Number(removed?.keys || 0)}.`;
      setOk(msg);
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
            Gestao completa de ciclo com foco em operacao limpa e rapida.
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
        <p className="text-xs text-white/60 mt-1">Informe User ID do dono. Se existir, atualiza.</p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
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
                {planDisplayName(p)} ({p.key})
              </option>
            ))}
          </select>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="h-11 rounded-2xl bg-black/40 border border-white/10 px-3 outline-none">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {subscriptionStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-2">
          <DateField label="Inicio" value={newStartedAt} onChange={setNewStartedAt} />
          <DateField label="Renova em" value={newRenewAt} onChange={setNewRenewAt} />
          <DateField label="Expira em" value={newExpiresAt} onChange={setNewExpiresAt} />
          <DateField label="Cancelada em" value={newCanceledAt} onChange={setNewCanceledAt} />
          <DateField label="Encerrada em" value={newEndedAt} onChange={setNewEndedAt} />
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-center">
          <input
            value={newStatusReason}
            onChange={(e) => setNewStatusReason(e.target.value)}
            placeholder="Motivo/status interno (opcional)"
            className="h-11 rounded-2xl bg-black/40 border border-white/10 px-4 outline-none focus:border-white/25"
          />
          <label className="inline-flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={newCancelAtPeriodEnd} onChange={(e) => setNewCancelAtPeriodEnd(e.target.checked)} />
            Cancelar no fim do periodo
          </label>
          <button
            className="h-11 px-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-60"
            onClick={() => {
              const uid = String(newUserId || "").trim();
              const pk = (newPlanKey || activePlans[0]?.key || "").trim();
              if (!uid || !pk) return;
              askConfirm("Confirmar atualizacao", `Aplicar plano ${pk} para o usuario ${uid}?`, async () => {
                await saveSub({
                  userId: uid,
                  planKey: pk,
                  status: newStatus,
                  startedAt: localInputToIso(newStartedAt),
                  renewAt: localInputToIso(newRenewAt),
                  expiresAt: localInputToIso(newExpiresAt),
                  canceledAt: localInputToIso(newCanceledAt),
                  endedAt: localInputToIso(newEndedAt),
                  cancelAtPeriodEnd: newCancelAtPeriodEnd,
                  statusReason: newStatusReason.trim(),
                });
                setNewUserId("");
                setNewStatus("active");
                setNewStartedAt("");
                setNewRenewAt("");
                setNewExpiresAt("");
                setNewCanceledAt("");
                setNewEndedAt("");
                setNewCancelAtPeriodEnd(false);
                setNewStatusReason("");
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

      <div className="mt-5 space-y-4">
        {subs.map((s) => {
          const u = userMap[String(s.userId)];
          const d = drafts[s.id] || toDraft(s);
          const shownStatus = s.computedStatus || s.status;
          const activatedByKey = String(s.statusReason || "").toLowerCase().includes("license_key_activation");
          const expanded = expandedSubId === s.id;
          const saveCurrent = () =>
            askConfirm("Salvar assinatura", `Salvar ciclo da assinatura de ${s.userId}?`, () =>
              saveSub(draftToPayload(s.userId, d))
            );
          return (
            <div
              key={s.id}
              className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-4 lg:p-5"
            >
              {activatedByKey ? (
                <div className="absolute right-3 top-3 rounded-full border border-fuchsia-300/40 bg-fuchsia-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-100">
                  Ativado por key
                </div>
              ) : null}
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex items-start gap-3">
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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
                        Plano: <b>{planDisplayName({ key: s.planKey, name: s.plan?.name })}</b>
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
                        Salvo: <b>{subscriptionStatusLabel(s.status)}</b>
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
                        Efetivo: <b>{subscriptionStatusLabel(shownStatus)}</b>
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 ${s.isActive ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : "border-amber-300/35 bg-amber-300/10 text-amber-100"}`}>
                        {s.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mt-1 leading-relaxed">
                      Inicio: <b>{formatDateTime(s.startedAt)}</b> | Renova: <b>{formatDateTime(s.renewAt)}</b> | Expira: <b>{formatDateTime(s.expiresAt)}</b>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setExpandedSubId(expanded ? null : s.id)}
                    className="h-10 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition text-sm font-semibold w-full sm:w-auto"
                  >
                    {expanded ? "Fechar edicao" : "Editar ciclo"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      askConfirm("Remover assinatura", `Deseja remover a assinatura do usuario ${s.userId}?`, () => deleteSub(s.userId))
                    }
                    className="h-10 px-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold w-full sm:w-auto"
                    disabled={saving}
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                <select
                  value={d.planKey}
                  className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                  onChange={(e) => patchDraft(s.id, { planKey: e.target.value })}
                  disabled={saving}
                >
                  {activePlans.map((p) => (
                    <option key={p.key} value={p.key}>
                      {planDisplayName(p)} ({p.key})
                    </option>
                  ))}
                </select>

                <select
                  value={d.status}
                  className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                  onChange={(e) => patchDraft(s.id, { status: e.target.value })}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((statusOpt) => (
                    <option key={statusOpt} value={statusOpt}>
                      {subscriptionStatusLabel(statusOpt)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={saveCurrent}
                  className="h-10 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-sm font-semibold w-full md:w-auto"
                  disabled={saving}
                >
                  Salvar
                </button>
              </div>

              {expanded ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
                  <div className="text-xs text-white/60 uppercase tracking-[0.12em]">Edicao avancada</div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                    <DateField label="Inicio" value={d.startedAt} onChange={(v) => patchDraft(s.id, { startedAt: v })} />
                    <DateField label="Renova" value={d.renewAt} onChange={(v) => patchDraft(s.id, { renewAt: v })} />
                    <DateField label="Expira" value={d.expiresAt} onChange={(v) => patchDraft(s.id, { expiresAt: v })} />
                    <DateField label="Cancelada" value={d.canceledAt} onChange={(v) => patchDraft(s.id, { canceledAt: v })} />
                    <DateField label="Encerrada" value={d.endedAt} onChange={(v) => patchDraft(s.id, { endedAt: v })} />
                    <label className="h-10 inline-flex items-center gap-2 text-sm text-white/80 px-3 rounded-xl border border-white/10 bg-black/40">
                      <input
                        type="checkbox"
                        checked={d.cancelAtPeriodEnd}
                        onChange={(e) => patchDraft(s.id, { cancelAtPeriodEnd: e.target.checked })}
                      />
                      Cancelar no fim do periodo
                    </label>
                  </div>
                  <input
                    value={d.statusReason}
                    onChange={(e) => patchDraft(s.id, { statusReason: e.target.value })}
                    placeholder="Motivo/status interno"
                    className="h-10 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={saveCurrent}
                      className="h-10 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-sm font-semibold w-full sm:w-auto"
                      disabled={saving}
                    >
                      Salvar ciclo completo
                    </button>
                  </div>
                </div>
              ) : null}
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

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-white/60">{label}</span>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none"
      />
    </label>
  );
}
