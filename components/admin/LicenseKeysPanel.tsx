"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { planDisplayName } from "@/lib/planNames";

type Plan = { key: string; name: string; active: boolean };
type LicenseKeyRow = {
  id: string;
  codePrefix: string;
  codeLast4: string;
  planKey: string;
  durationDays: number;
  maxActivations: number;
  usedCount: number;
  status: string;
  expiresAt: string | null;
  note: string | null;
  createdAt: string;
  _count?: { activations?: number };
  plan?: Plan;
};

function licenseStatusLabel(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "Ativa";
  if (s === "disabled") return "Desativada";
  if (s === "exhausted") return "Esgotada";
  if (s === "expired") return "Expirada";
  return s || "-";
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string) {
  const t = String(local || "").trim();
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export function LicenseKeysPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [rows, setRows] = useState<LicenseKeyRow[]>([]);
  const [createdCodes, setCreatedCodes] = useState<string[]>([]);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [planKey, setPlanKey] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [maxActivations, setMaxActivations] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [count, setCount] = useState("1");

  const activePlans = useMemo(() => plans.filter((p) => p.active), [plans]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [pRes, kRes] = await Promise.all([
        fetch("/api/admin/plans", { cache: "no-store" }),
        fetch(`/api/admin/license-keys?q=${encodeURIComponent(q)}&status=${encodeURIComponent(statusFilter)}`, { cache: "no-store" }),
      ]);
      const pData = await pRes.json().catch(() => ({}));
      const kData = await kRes.json().catch(() => ({}));
      if (!pRes.ok) throw new Error(pData?.error || "Falha ao carregar planos");
      if (!kRes.ok) throw new Error(kData?.error || "Falha ao carregar keys");
      setPlans(Array.isArray(pData?.plans) ? (pData.plans as Plan[]) : []);
      setRows(Array.isArray(kData?.keys) ? (kData.keys as LicenseKeyRow[]) : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createKeys() {
    setSaving(true);
    setError("");
    setOk("");
    setCreatedCodes([]);
    try {
      const res = await fetch("/api/admin/license-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          planKey: planKey || activePlans[0]?.key || "",
          durationDays: Number(durationDays || 30) || 30,
          maxActivations: Number(maxActivations || 1) || 1,
          expiresAt: toIso(expiresAt),
          note: note.trim(),
          count: Number(count || 1) || 1,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao criar keys");
      const created = Array.isArray(data?.created) ? data.created : [];
      const codes = created.map((x: any) => String(x?.code || "")).filter(Boolean);
      setCreatedCodes(codes);
      setOk(`${codes.length} key(s) criada(s).`);
      setTimeout(() => setOk(""), 1800);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function patchKey(id: string, payload: { status?: string; expiresAt?: string; note?: string }) {
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/license-keys", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          ...payload,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao atualizar key");
      setOk("Key atualizada.");
      setTimeout(() => setOk(""), 1200);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setOk("Copiado para a area de transferencia.");
      setTimeout(() => setOk(""), 1200);
    } catch {
      setError("Falha ao copiar.");
      setTimeout(() => setError(""), 1200);
    }
  }

  return (
    <div className="card mt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">License Keys</h2>
          <p className="text-white/60 text-sm">Gere, revogue e acompanhe ativações por key.</p>
        </div>
        <button className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition" onClick={() => load()} disabled={loading || saving}>
          Atualizar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por sufixo/plano/nota" className="h-11 rounded-xl bg-black/40 border border-white/10 px-3 outline-none md:col-span-2" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl bg-black/40 border border-white/10 px-3 outline-none">
          <option value="">todos status</option>
          <option value="active">{licenseStatusLabel("active")}</option>
          <option value="disabled">{licenseStatusLabel("disabled")}</option>
          <option value="exhausted">{licenseStatusLabel("exhausted")}</option>
          <option value="expired">{licenseStatusLabel("expired")}</option>
        </select>
        <div className="md:col-span-2">
          <button className="h-11 px-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition w-full" onClick={() => load()} disabled={loading || saving}>
            Buscar
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold">Gerar novas keys</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
          <div>
            <div className="mb-1 text-xs text-white/60">Plano</div>
            <select value={planKey || activePlans[0]?.key || ""} onChange={(e) => setPlanKey(e.target.value)} className="h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none">
              {activePlans.map((p) => (
                <option key={p.key} value={p.key}>
                  {planDisplayName(p)} ({p.key})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-xs text-white/60">Duração (dias)</div>
            <input value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="Ex: 30" className="h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
          </div>
          <div>
            <div className="mb-1 text-xs text-white/60">Máx. ativações</div>
            <input value={maxActivations} onChange={(e) => setMaxActivations(e.target.value)} placeholder="Ex: 1" className="h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
          </div>
          <div>
            <div className="mb-1 text-xs text-white/60">Expira em (opcional)</div>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
          </div>
          <div>
            <div className="mb-1 text-xs text-white/60">Quantidade</div>
            <input value={count} onChange={(e) => setCount(e.target.value)} placeholder="1-50" className="h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
          </div>
          <div>
            <div className="mb-1 text-xs text-white/60">Ação</div>
            <button className="h-11 w-full px-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-60" onClick={() => createKeys()} disabled={saving || loading || activePlans.length === 0}>
              Gerar
            </button>
          </div>
        </div>
        <div className="mt-2">
          <div className="mb-1 text-xs text-white/60">Nota interna (opcional)</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: campanha janeiro / parceiro X" className="h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
        </div>
        {createdCodes.length > 0 ? (
          <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            <div className="font-semibold text-emerald-200 mb-2">Keys geradas (copie agora):</div>
            <div className="space-y-1">
              {createdCodes.map((c) => (
                <div key={c} className="font-mono text-emerald-100 flex items-center justify-between gap-2">
                  <span className="truncate">{c}</span>
                  <button
                    type="button"
                    onClick={() => copyText(c)}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-emerald-200/30 bg-emerald-200/10 hover:bg-emerald-200/20 transition"
                    aria-label={`Copiar key ${c}`}
                    title="Copiar"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {loading ? <div className="mt-4 text-sm text-white/60">Carregando...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      <div className="mt-5 space-y-3">
        {rows.map((k) => (
          <LicenseRow key={k.id} row={k} busy={saving} onSave={patchKey} />
        ))}
        {!loading && rows.length === 0 ? <div className="text-sm text-white/60">Nenhuma key encontrada.</div> : null}
      </div>
    </div>
  );
}

function LicenseRow({
  row,
  busy,
  onSave,
}: {
  row: LicenseKeyRow;
  busy: boolean;
  onSave: (id: string, payload: { status?: string; expiresAt?: string; note?: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState(String(row.status || "active"));
  const [expiresAt, setExpiresAt] = useState(toLocalInput(row.expiresAt));
  const [note, setNote] = useState(String(row.note || ""));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-white/80">
        Key: <b>{row.codePrefix}...{row.codeLast4}</b> | Plano: <b>{planDisplayName({ key: row.planKey, name: row.plan?.name })}</b> | Status: <b>{licenseStatusLabel(row.status)}</b> | Uso: <b>{row.usedCount}/{row.maxActivations}</b> | Ativações: <b>{Number(row._count?.activations || 0)}</b>
      </div>
      <div className="text-xs text-white/60 mt-1">Criada em {new Date(row.createdAt).toLocaleString("pt-BR")}</div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none">
          <option value="active">{licenseStatusLabel("active")}</option>
          <option value="disabled">{licenseStatusLabel("disabled")}</option>
          <option value="exhausted">{licenseStatusLabel("exhausted")}</option>
          <option value="expired">{licenseStatusLabel("expired")}</option>
        </select>
        <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota interna" className="h-10 rounded-xl bg-black/40 border border-white/10 px-3 outline-none" />
        <button
          type="button"
          onClick={() => onSave(row.id, { status, expiresAt: toIso(expiresAt), note })}
          className="h-10 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-sm font-semibold"
          disabled={busy}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}



