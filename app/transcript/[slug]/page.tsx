"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Lock, ShieldCheck, Unlock } from "lucide-react";
import { TurnstileBox } from "@/components/common/TurnstileBox";

type VerifyOk = { ok: true; html: string };
type VerifyErr =
  | { error: "wrong_password" }
  | { error: "expired" }
  | { error: "not_found" }
  | { error: "empty_transcript" }
  | { error: "bad_request" }
  | { error: "captcha_required" }
  | { error: "captcha_failed" }
  | { error: "too_many_requests" }
  | { error: "too_many_attempts" }
  | { error: "server_error"; detail?: string }
  | { error: string; detail?: string };

type Status = "locked" | "unlocking" | "unlocked" | "error";

function cx(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

function parseSlug(slug: string) {
  const parts = String(slug || "").split("-");
  if (parts.length < 3) return { guildSlug: slug, userId: "", shortcode: "" };
  const shortcode = parts.pop() || "";
  const userId = parts.pop() || "";
  const guildSlug = parts.join("-");
  return { guildSlug, userId, shortcode };
}

function prettyGuild(guildSlug: string) {
  return String(guildSlug || "Servidor")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function TranscriptPage({ params }: { params: { slug: string } }) {
  const slug = String(params?.slug || "");
  const info = useMemo(() => parseSlug(slug), [slug]);

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("locked");
  const [message, setMessage] = useState("");
  const [html, setHtml] = useState("");
  const [shake, setShake] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`Aurora_transcript_pw:${slug}`);
      if (saved) setPassword(saved);
    } catch {
      // ignore
    }
  }, [slug]);

  function pulseError(msg: string) {
    setStatus("error");
    setMessage(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function setNiceError(err: VerifyErr, httpStatus?: number) {
    const code = String((err as any)?.error || "");
    const detail = String((err as any)?.detail || "");

    if (httpStatus === 401 || code === "wrong_password") {
      pulseError("Senha incorreta. Confira a senha enviada no fechamento do ticket.");
      return;
    }
    if (httpStatus === 410 || code === "expired") {
      pulseError("Este transcript expirou e nao esta mais disponivel.");
      return;
    }
    if (httpStatus === 404 || code === "not_found" || code === "empty_transcript") {
      pulseError("Transcript nao encontrado. Verifique se o link esta correto.");
      return;
    }
    if (httpStatus === 400 || code === "bad_request") {
      pulseError("Dados invalidos. Reabra o link e tente novamente.");
      return;
    }
    if (code === "captcha_required") {
      pulseError("Complete o captcha para continuar.");
      return;
    }
    if (code === "captcha_failed") {
      pulseError("Captcha invalido ou expirado. Tente novamente.");
      return;
    }
    if (httpStatus === 429 || code === "too_many_requests" || code === "too_many_attempts") {
      pulseError("Muitas tentativas seguidas. Aguarde alguns segundos e tente de novo.");
      return;
    }

    if (code === "server_error" && detail.toLowerCase().includes("transcript_hash_secret")) {
      pulseError("Falha de configuracao no servidor de transcript. Avise a administracao.");
      return;
    }

    pulseError("Erro ao carregar o transcript. Tente novamente em alguns segundos.");
  }

  async function unlock() {
    if (!password.trim()) {
      pulseError("Digite a senha para desbloquear.");
      return;
    }
    if (captchaRequired && !captchaToken) {
      pulseError("Complete o captcha antes de desbloquear.");
      return;
    }
    setStatus("unlocking");
    setMessage("");

    try {
      const res = await fetch("/api/transcript/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password, captchaToken: captchaToken || undefined }),
      });

      let data: VerifyOk | VerifyErr;
      try {
        data = (await res.json()) as VerifyOk | VerifyErr;
      } catch {
        pulseError("Resposta invalida do servidor de transcript.");
        return;
      }

      if (!res.ok) {
        setNiceError(data as VerifyErr, res.status);
        return;
      }

      const ok = data as VerifyOk;
      try {
        sessionStorage.setItem(`Aurora_transcript_pw:${slug}`, password);
      } catch {
        // ignore
      }

      await new Promise((r) => setTimeout(r, 300));
      setHtml(ok.html);
      setStatus("unlocked");
    } catch {
      pulseError("Falha de conexao. Verifique a internet e tente novamente.");
    }
  }

  function copySlug() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(slug).catch(() => null);
  }

  function reset() {
    setStatus("locked");
    setMessage("");
    setHtml("");
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="aura-grid-bg fixed inset-0 pointer-events-none" />
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-[8%] h-[22rem] w-[22rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-9rem] right-[10%] h-[24rem] w-[24rem] rounded-full bg-violet-500/18 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <span
            className={cx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur",
              status === "unlocked"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200"
            )}
          >
            {status === "unlocked" ? <Unlock size={12} /> : <Lock size={12} />}
            {status === "unlocked" ? "Desbloqueado" : "Privado"}
          </span>
        </div>

        <div className="aura-panel mt-6 overflow-hidden rounded-3xl border border-white/10">
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Transcript protegido</h1>
                <p className="mt-1 text-sm text-white/65">Somente quem possui a senha pode visualizar o atendimento.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/85">
                {prettyGuild(info.guildSlug)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-3 py-1">
                slug: <span className="text-white/90">{slug}</span>
              </span>
              <button
                type="button"
                onClick={copySlug}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-3 py-1 transition hover:bg-white/10"
              >
                <Copy size={12} /> copiar slug
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {status !== "unlocked" ? (
              <div className="grid items-start gap-6 md:grid-cols-[360px_1fr]">
                <div className={cx("rounded-2xl border border-white/10 bg-black/25 p-5 sm:p-6", shake && "animate-[shake_0.5s_ease-in-out]")}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-fuchsia-400/10">
                      <ShieldCheck size={18} className="text-fuchsia-200" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90">Aurora Security</div>
                      <div className="text-xs text-white/60">Validacao de senha do transcript</div>
                    </div>
                  </div>

                  <label className="text-xs text-white/60">Senha de acesso</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") unlock();
                    }}
                    type="password"
                    placeholder="Ex: guild-ABCD1234"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
                  />

                  {message ? <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">{message}</div> : null}
                  <div className="mt-3">
                    <TurnstileBox onTokenChange={setCaptchaToken} onRequirementChange={setCaptchaRequired} />
                  </div>

                  <button
                    onClick={unlock}
                    disabled={status === "unlocking" || (captchaRequired && !captchaToken)}
                    className={cx(
                      "mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium transition",
                      status === "unlocking" || (captchaRequired && !captchaToken)
                        ? "cursor-not-allowed bg-white/10 text-white/50"
                        : "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white hover:from-fuchsia-400 hover:to-violet-400"
                    )}
                  >
                    {status === "unlocking" ? "Desbloqueando..." : "Desbloquear transcript"}
                  </button>

                  <div className="mt-3 text-xs leading-relaxed text-white/55">
                    Dica: cole a senha exatamente como foi enviada no fechamento do ticket.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-5 sm:p-6">
                  <div className="text-sm font-medium text-white/90">O que sera exibido</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    O historico completo do atendimento, incluindo mensagens, embeds e ordem original da conversa.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
                    <div className="text-xs text-white/60">Checklist de acesso</div>
                    <ul className="mt-2 space-y-2 text-sm text-white/75">
                      <li>1. Link correto do transcript</li>
                      <li>2. Senha enviada ao fechar o ticket</li>
                      <li>3. Transcript dentro do prazo de expiracao</li>
                    </ul>
                  </div>

                  {status === "error" ? (
                    <button
                      onClick={reset}
                      className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      Tentar novamente
                    </button>
                  ) : null}
                </div>

                <style jsx global>{`
                  @keyframes shake {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-7px); }
                    40% { transform: translateX(7px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                    100% { transform: translateX(0); }
                  }
                `}</style>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                    <Unlock size={14} /> Acesso liberado
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      Recarregar
                    </button>
                    <button
                      onClick={reset}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      Bloquear
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                  <iframe
                    title="Transcript"
                    className="h-[78vh] w-full bg-black"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={html}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/45">Aurora Transcript Security</div>
      </div>
    </div>
  );
}
