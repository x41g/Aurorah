"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

type Props = {
  onTokenChange: (token: string) => void;
  onRequirementChange?: (enabled: boolean) => void;
  className?: string;
};

export function TurnstileBox({ onTokenChange, onRequirementChange, className }: Props) {
  const staticSiteKey = String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState(staticSiteKey);
  const [scriptReady, setScriptReady] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  const looksLikeTurnstileSiteKey = (value: string) => /^0x[a-zA-Z0-9_-]{20,}$/.test(String(value || "").trim());

  useEffect(() => {
    let active = true;
    if (staticSiteKey) {
      setSiteKey(staticSiteKey);
      onRequirementChange?.(true);
      return;
    }

    fetch("/api/public-security", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const resolved = String(data?.turnstileSiteKey || "").trim();
        setSiteKey(resolved);
        onRequirementChange?.(Boolean(resolved));
      })
      .catch(() => {
        if (!active) return;
        setError("Nao foi possivel carregar o captcha.");
        onRequirementChange?.(false);
      });

    return () => {
      active = false;
    };
  }, [staticSiteKey, onRequirementChange]);

  useEffect(() => {
    if (!siteKey || !scriptReady) return;
    if (!looksLikeTurnstileSiteKey(siteKey)) {
      setError("Site key do Turnstile parece invalida. Use a chave que comeca com 0x...");
      return;
    }
    if (!containerRef.current) return;
    if (!window.turnstile?.render) return;

    if (widgetIdRef.current) return;
    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => {
          setRendered(true);
          onTokenChange(String(token || ""));
        },
        "expired-callback": () => {
          setRendered(true);
          onTokenChange("");
        },
        "error-callback": () => {
          onTokenChange("");
          setError("Captcha expirou ou falhou. Atualize a pagina.");
        },
      });
      setRendered(true);
      setError("");
    } catch {
      setError("Falha ao renderizar captcha. Confira a chave do Turnstile.");
    }

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // noop
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, scriptReady, onTokenChange]);

  useEffect(() => {
    if (!siteKey) return;
    if (scriptReady) return;
    const t = setTimeout(() => {
      setError("Captcha demorou para carregar. Verifique extensoes/rede ou tente novamente.");
    }, 20000);
    return () => clearTimeout(t);
  }, [siteKey, scriptReady]);

  const handleRetry = () => {
    onTokenChange("");
    setRendered(false);
    setError("");
    setScriptReady(false);
    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // noop
      }
    }
    widgetIdRef.current = null;
    setRetryNonce((v) => v + 1);
  };

  if (!siteKey && !error) {
    return (
      <div className={className}>
        <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Captcha desativado: configure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` ou `TURNSTILE_SITE_KEY`.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&retry=${retryNonce}`}
        strategy="afterInteractive"
        onLoad={() => {
          setError("");
          setScriptReady(true);
        }}
        onError={() => setError("Falha ao carregar script do Turnstile (rede/extensao/bloqueador).")}
      />
      <div className="min-h-[78px] rounded-xl border border-white/10 bg-black/20 p-2">
        <div ref={containerRef} />
        {!rendered && !error ? <div className="text-xs text-white/60">Carregando captcha...</div> : null}
      </div>
      {error ? (
        <div className="mt-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <div>{error}</div>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white transition hover:bg-white/20"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}
    </div>
  );
}
