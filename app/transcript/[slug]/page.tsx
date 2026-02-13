"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { HiMiniLockOpen } from "react-icons/hi2";

type VerifyOk = { ok: true; html: string };
type VerifyErr =
  | { error: "wrong_password" }
  | { error: "expired" }
  | { error: "bad_request" }
  | { error: "server_error"; detail?: string }
  | { error: string; detail?: string };

type Status = "locked" | "unlocking" | "unlocked" | "error";

function cx(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

function parseSlug(slug: string) {
  // slug = guildSlug-userId-shortcode
  const parts = (slug || "").split("-");
  if (parts.length < 3) return { guildSlug: slug, userId: "", shortcode: "" };
  const shortcode = parts.pop()!;
  const userId = parts.pop()!;
  const guildSlug = parts.join("-");
  return { guildSlug, userId, shortcode };
}

export default function TranscriptPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const info = useMemo(() => parseSlug(slug), [slug]);

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("locked");
  const [message, setMessage] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [shake, setShake] = useState(false);

  // (opcional) lembrar a última senha digitada nesse navegador pra esse slug
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`Aurora_transcript_pw:${slug}`);
      if (saved) setPassword(saved);
    } catch {}
  }, [slug]);

  function setNiceError(err: VerifyErr, httpStatus?: number) {
    const code = (err as any)?.error;

    if (httpStatus === 401 || code === "wrong_password") {
      setMessage("Senha incorreta. Consulte o suporte do servidor se você não recebeu a senha.");
      return;
    }
    if (httpStatus === 410 || code === "expired") {
      setMessage("Este transcript expirou e não está mais disponível.");
      return;
    }

    setMessage("Erro ao carregar o transcript. Tente novamente em alguns segundos.");
  }

  async function unlock() {
    if (!password.trim()) {
      setMessage("Digite a senha para desbloquear.");
      setShake(true);
      setTimeout(() => setShake(false), 550);
      return;
    }

    setStatus("unlocking");
    setMessage("");

    try {
      const res = await fetch("/api/transcript/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = (await res.json()) as VerifyOk | VerifyErr;

      if (!res.ok) {
        setStatus("error");
        setNiceError(data as VerifyErr, res.status);
        setShake(true);
        setTimeout(() => setShake(false), 550);
        return;
      }

      // ok
      const ok = data as VerifyOk;

      try {
        sessionStorage.setItem(`Aurora_transcript_pw:${slug}`, password);
      } catch {}

      // micro “unlock feel”
      await new Promise((r) => setTimeout(r, 450));

      setHtml(ok.html);
      setStatus("unlocked");
    } catch (e) {
      setStatus("error");
      setMessage("Falha de conexão. Verifique sua internet e tente novamente.");
      setShake(true);
      setTimeout(() => setShake(false), 550);
    }
  }

  function reset() {
    setStatus("locked");
    setMessage("");
    setHtml("");
  }

  const titleGuild = info.guildSlug
    ? info.guildSlug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
    : "Servidor";

  return (
    <div className="min-h-screen bg-[#2c0c3b] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-2xl" />
        <div className="absolute bottom-[-240px] right-[-240px] h-[520px] w-[520px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(118, 56, 56, 0.36),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition"
          >
            <span className="opacity-80 group-hover:opacity-100"><BsArrowLeft /></span>
            Voltar
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-white/50">
              {status === "unlocked" ? "Desbloqueado" : "Protegido por senha"}
            </span>
            <span
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur",
                status === "unlocked"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-purple-400/30 bg-purple-400/10 text-purple-200"
              )}
            >
              <span
                className={cx(
                  "h-2 w-2 rounded-full",
                  status === "unlocked" ? "bg-emerald-400" : "bg-purple-400"
                )}
              />
              {status === "unlocked" ? "Desbloqueado" : "Privado"}
            </span>
          </div>
        </div>

        {/* Main card */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Transcript Privado
                </h1>
                <p className="mt-1 text-sm text-white/60">
                  Acesso protegido. Somente quem possui a senha pode visualizar este atendimento.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2">
                <div className="text-xs text-white/50">Servidor</div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-white/90">{titleGuild}</span>
                </div>
              </div>
            </div>

            {/* Small meta row */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                slug: <span className="ml-1 text-white/90">{slug}</span>
              </span>
              {info.userId && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  user: <span className="ml-1 text-white/90">{info.userId}</span>
                </span>
              )}
              {info.shortcode && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  code: <span className="ml-1 text-white/90">{info.shortcode}</span>
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-7">
            {status !== "unlocked" ? (
              <div className="grid gap-6 md:grid-cols-[380px_1fr] items-start">
                {/* Lock panel */}
                <div
                  className={cx(
                    "rounded-2xl border border-white/10 bg-black/25 p-5 sm:p-6 shadow-xl",
                    shake && "animate-[shake_0.55s_ease-in-out]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/zl54n5em.png"
                      alt="Bot"
                      className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-white/90">Aurora</div>
                      <div className="text-xs text-white/60">Acesso seguro ao transcript</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs text-white/60">Senha</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") unlock();
                      }}
                      type="password"
                      placeholder="Digite a senha recebida…"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition"
                    />

                    {message && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                        {message}
                      </div>
                    )}

                    <button
                      onClick={unlock}
                      disabled={status === "unlocking"}
                      className={cx(
                        "mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium transition",
                        status === "unlocking"
                          ? "bg-white/10 text-white/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_rgba(124,58,237,0.25)]"
                      )}
                    >
                      {status === "unlocking" ? "Desbloqueando..." : `Desbloquear`}
                    </button>

                    <div className="mt-3 text-xs text-white/50 leading-relaxed">
                      Dica: se a senha não funcionar, peça ao suporte do servidor para reenviar.
                    </div>
                  </div>
                </div>

                {/* Preview / explanation panel */}
                <div className="rounded-2xl border border-white/10 bg-black/15 p-5 sm:p-6">
                  <div className="text-sm font-medium text-white/85">O que você vai ver</div>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">
                    Assim que desbloquear, o transcript será carregado com o layout original do Discord,
                    preservando embeds, menções e estrutura do atendimento.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
                    <div className="text-xs text-white/60">Segurança</div>
                    <ul className="mt-2 space-y-2 text-sm text-white/70">
                      <li className="flex gap-2">
                        <span className="text-purple-300">•</span> Protegido por senha única
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-300">•</span> Pode expirar automaticamente (TTL)
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-300">•</span> Conteúdo exibido em iframe isolado
                      </li>
                    </ul>
                  </div>

                  {status === "error" && (
                    <button
                      onClick={reset}
                      className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>

                {/* keyframes for shake */}
                <style jsx global>{`
                  @keyframes shake {
                    0% { transform: translateX(0); }
                    15% { transform: translateX(-8px); }
                    30% { transform: translateX(8px); }
                    45% { transform: translateX(-6px); }
                    60% { transform: translateX(6px); }
                    75% { transform: translateX(-3px); }
                    100% { transform: translateX(0); }
                  }
                `}</style>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                      <HiMiniLockOpen /> Acesso liberado
                    </span>
                    <span className="text-sm text-white/50">
                      Você pode rolar e visualizar o atendimento completo.
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Recarregar
                    </button>
                    <button
                      onClick={reset}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Bloquear
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                  <iframe
                    title="Transcript"
                    className="w-full h-[78vh] bg-black"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={html}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/40">
          Protegido por senha • Aurora Transcripts
        </div>
      </div>
    </div>
  );
}