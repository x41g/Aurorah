"use client";

import { useEffect, useState } from "react";

type Plan = {
  key: string;
  name: string;
  description: string;
  priceCents: number;
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

type ConfirmState = {
  open: boolean;
  planKey: string;
};

export function PlansPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [priceInput, setPriceInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, planKey: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/plans", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao carregar planos");
      const nextPlans = Array.isArray(data?.plans) ? (data.plans as Plan[]) : [];
      setPlans(nextPlans);
      const nextPriceInput: Record<string, string> = {};
      for (const p of nextPlans) {
        nextPriceInput[p.key] = centsToBrlInput(p.priceCents ?? 0);
      }
      setPriceInput(nextPriceInput);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function patchPlan(key: string, patch: Partial<Plan>) {
    setPlans((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  async function savePlan(key: string) {
    const plan = plans.find((p) => p.key === key);
    if (!plan) return;
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar plano");
      setOk(`Plano ${plan.key} atualizado.`);
      setTimeout(() => setOk(""), 1400);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card mt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Planos</h2>
          <p className="text-white/60 text-sm">
            Configure aqui o que cada plano libera, inclusive o limite mensal de tickets.
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

      {loading ? <div className="mt-4 text-sm text-white/60">Carregando planos...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      <div className="mt-4 space-y-4">
        {plans.map((p) => (
          <div key={p.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <Field label="Key" value={p.key} onChange={() => undefined} disabled />
              <Field label="Nome" value={p.name} onChange={(v) => patchPlan(p.key, { name: v })} />
              <Field
                label="Preco (R$)"
                value={priceInput[p.key] ?? centsToBrlInput(p.priceCents ?? 0)}
                onChange={(v) => {
                  setPriceInput((prev) => ({ ...prev, [p.key]: v }));
                  patchPlan(p.key, { priceCents: brlToCents(v) });
                }}
                placeholder="Ex: 10,50"
              />
              <Field
                label="Max servidores"
                value={String(p.maxGuilds ?? 1)}
                onChange={(v) => patchPlan(p.key, { maxGuilds: Number(v || 1) || 1 })}
              />
              <Field
                label="Max tickets/mes"
                value={p.maxTicketsPerMonth == null ? "" : String(p.maxTicketsPerMonth)}
                onChange={(v) =>
                  patchPlan(p.key, { maxTicketsPerMonth: String(v).trim() === "" ? null : Number(v || 0) || 0 })
                }
                placeholder="Vazio = ilimitado"
              />
              <Field
                label="Descricao"
                value={p.description || ""}
                onChange={(v) => patchPlan(p.key, { description: v })}
                className="md:col-span-2 xl:col-span-3"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 px-3 py-2 bg-black/30 sm:col-span-2 xl:col-span-3">
                <span className="text-xs text-white/60">Preview preço:</span>{" "}
                <span className="text-sm font-semibold">{formatBrl(p.priceCents ?? 0)}</span>
              </div>
              <Toggle label="Ativo" value={p.active} onChange={(v) => patchPlan(p.key, { active: v })} />
              <Toggle
                label="Dashboard editavel"
                value={p.dashboardEnabled}
                onChange={(v) => patchPlan(p.key, { dashboardEnabled: v })}
              />
              <Toggle
                label="Pagamentos"
                value={p.paymentsEnabled}
                onChange={(v) => patchPlan(p.key, { paymentsEnabled: v })}
              />
              <Toggle
                label="SafePay"
                value={p.safePayEnabled}
                onChange={(v) => patchPlan(p.key, { safePayEnabled: v })}
              />
              <Toggle label="IA" value={p.aiEnabled} onChange={(v) => patchPlan(p.key, { aiEnabled: v })} />
              <Toggle
                label="Analytics"
                value={p.analyticsEnabled}
                onChange={(v) => patchPlan(p.key, { analyticsEnabled: v })}
              />
              <Toggle
                label="Suporte prioritario"
                value={p.prioritySupport}
                onChange={(v) => patchPlan(p.key, { prioritySupport: v })}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirm({ open: true, planKey: p.key })}
                disabled={saving}
                className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-60"
              >
                Salvar {p.key}
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirm.open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151622] p-5 shadow-2xl">
            <div className="text-lg font-semibold">Confirmar alteracao</div>
            <p className="mt-2 text-sm text-white/70">
              Deseja salvar as alteracoes do plano <b>{confirm.planKey}</b>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm({ open: false, planKey: "" })}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
              >
                Nao
              </button>
              <button
                type="button"
                onClick={async () => {
                  const key = confirm.planKey;
                  setConfirm({ open: false, planKey: "" });
                  await savePlan(key);
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

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-black/30 p-3 ${className}`}>
      <div className="text-xs text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg bg-black/30 border border-white/10 px-3 outline-none focus:border-white/25 disabled:opacity-60"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="rounded-xl border border-white/10 px-3 py-2 flex items-center justify-between bg-black/30 hover:bg-black/40 transition"
    >
      <span className="text-sm">{label}</span>
      <span
        className={[
          "px-2 py-1 rounded-md border text-xs font-semibold",
          value ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200" : "bg-white/5 border-white/10 text-white/80",
        ].join(" ")}
      >
        {value ? "Sim" : "Nao"}
      </span>
    </button>
  );
}

function brlToCents(input: string): number {
  const raw = String(input || "").trim();
  if (!raw) return 0;
  const normalized = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

function centsToBrlInput(cents: number): string {
  const value = Number(cents || 0) / 100;
  return value.toFixed(2).replace(".", ",");
}

function formatBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((Number(cents || 0) || 0) / 100);
}
