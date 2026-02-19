"use client";

import React, { useState } from "react";
import { TurnstileBox } from "@/components/common/TurnstileBox";

type ResetTarget = {
  key: string;
  title: string;
  description: string;
};

const RESET_TARGETS: ResetTarget[] = [
  {
    key: "guildConfig",
    title: "Configs dos servidores",
    description: "Apaga configuracoes salvas de todos os servidores no dashboard.",
  },
  {
    key: "guildStats",
    title: "Estatisticas",
    description: "Zera contadores de tickets e metricas por servidor.",
  },
  {
    key: "guildOwners",
    title: "Donos dos servidores",
    description: "Remove o vinculo de dono (owner) salvo no banco.",
  },
  {
    key: "transcripts",
    title: "Transcripts",
    description: "Remove todos os transcripts salvos no site.",
  },
  {
    key: "usageMonthly",
    title: "Uso mensal",
    description: "Apaga o consumo mensal de tickets por usuario.",
  },
  {
    key: "aiData",
    title: "Historico de IA",
    description: "Apaga memoria e historico de mensagens de IA de tickets.",
  },
  {
    key: "subscriptions",
    title: "Assinaturas",
    description: "Remove assinaturas ativas/salvas dos usuarios.",
  },
  {
    key: "licenses",
    title: "Licencas e ativacoes",
    description: "Apaga keys/licencas e historico de ativacao.",
  },
  {
    key: "botState",
    title: "Estado global do bot",
    description: "Limpa cache global de servidores no estado do bot.",
  },
  {
    key: "whitelist",
    title: "Whitelist",
    description: "Reseta whitelist global (desativa e limpa servidores).",
  },
];

async function readJsonSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resposta nao-JSON (status ${res.status}). Inicio: ${text.slice(0, 80)}`);
  }
  return res.json();
}

export function ResetDbPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dangerText, setDangerText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileEnabled = Boolean(String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim());
  const [selectedTargets, setSelectedTargets] = useState<string[]>([
    "guildStats",
    "transcripts",
    "usageMonthly",
    "aiData",
  ]);

  function toggleTarget(key: string) {
    setSelectedTargets((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  }

  const allSelected = selectedTargets.length === RESET_TARGETS.length;

  function toggleAll() {
    if (allSelected) {
      setSelectedTargets([]);
      return;
    }
    setSelectedTargets(RESET_TARGETS.map((t) => t.key));
  }

  const hasDangerSelection =
    selectedTargets.includes("subscriptions") || selectedTargets.includes("licenses");
  const canConfirmDanger = !hasDangerSelection || dangerText.trim().toUpperCase() === "CONFIRMAR";
  const canSubmit = canConfirmDanger && (!turnstileEnabled || Boolean(captchaToken));

  async function onReset() {
    setError("");
    setOk("");

    if (!selectedTargets.length) {
      setError("Selecione pelo menos uma area para formatar.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targets: selectedTargets, captchaToken }),
      });
      const data = await readJsonSafe(res).catch(() => ({}));
      if (!res.ok) {
        const code = String((data as any)?.error || "");
        if (code === "captcha_required") throw new Error("Complete o captcha para continuar.");
        if (code === "captcha_failed") throw new Error("Captcha invalido ou expirado. Tente novamente.");
        if (code === "too_many_requests") throw new Error("Muitas tentativas. Aguarde e tente de novo.");
        throw new Error(code || "Falha ao limpar");
      }
      setOk("Formatacao concluida com sucesso.");
      setCaptchaToken("");
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
          <h2 className="text-xl font-bold">Manutencao</h2>
          <p className="text-white/60 text-sm">Escolha exatamente o que deseja formatar no banco.</p>
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={loading || !selectedTargets.length || (turnstileEnabled && !captchaToken)}
          className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Formatando..." : "Formatar selecionados"}
        </button>
      </div>

      {turnstileEnabled ? (
        <div className="mt-4">
          <TurnstileBox onTokenChange={setCaptchaToken} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleAll}
          className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs"
        >
          {allSelected ? "Desmarcar tudo" : "Selecionar tudo"}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {RESET_TARGETS.map((target) => {
          const checked = selectedTargets.includes(target.key);
          return (
            <label
              key={target.key}
              className={[
                "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition",
                checked ? "border-red-400/30 bg-red-500/10" : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={checked}
                onChange={() => toggleTarget(target.key)}
              />
              <div>
                <div className="font-semibold text-sm">{target.title}</div>
                <div className="text-xs text-white/65">{target.description}</div>
              </div>
            </label>
          );
        })}
      </div>

      {hasDangerSelection ? (
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          Atencao: voce selecionou dados criticos (Assinaturas/Licencas). Sera exigida confirmacao extra.
        </div>
      ) : null}

      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-3 text-sm text-emerald-200">{ok}</div> : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151622] p-5 shadow-2xl">
            <div className="text-lg font-semibold">Confirmar formatacao</div>
            <p className="mt-2 text-sm text-white/70">Isso vai apagar os dados selecionados abaixo:</p>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/75">
              {RESET_TARGETS.filter((t) => selectedTargets.includes(t.key))
                .map((t) => t.title)
                .join(" | ") || "Nenhum item selecionado"}
            </div>
            {hasDangerSelection ? (
              <div className="mt-3">
                <div className="text-xs text-amber-100 mb-1">
                  Para confirmar acao critica, digite <b>CONFIRMAR</b>.
                </div>
                <input
                  value={dangerText}
                  onChange={(e) => setDangerText(e.target.value)}
                  placeholder="Digite CONFIRMAR"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-amber-300/60"
                />
              </div>
            ) : null}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setDangerText("");
                }}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
              >
                Nao
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canSubmit) return;
                  setConfirmOpen(false);
                  setDangerText("");
                  void onReset();
                }}
                disabled={!canSubmit}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-60"
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
