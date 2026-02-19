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
  const [error, setError] = useState("");

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
    if (!containerRef.current) return;
    if (!window.turnstile?.render) return;

    if (widgetIdRef.current) return;
    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onTokenChange(String(token || "")),
        "expired-callback": () => onTokenChange(""),
        "error-callback": () => {
          onTokenChange("");
          setError("Captcha expirou ou falhou. Atualize a pagina.");
        },
      });
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
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
      {error ? (
        <div className="mt-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>
      ) : null}
    </div>
  );
}
