"use client";

import React, { useEffect, useMemo } from "react";
import Script from "next/script";

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

type Props = {
  onTokenChange: (token: string) => void;
  className?: string;
};

export function TurnstileBox({ onTokenChange, className }: Props) {
  const siteKey = String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();
  const callbackId = useMemo(() => `turnstile_ok_${Math.random().toString(36).slice(2, 10)}`, []);
  const expiredId = useMemo(() => `turnstile_exp_${Math.random().toString(36).slice(2, 10)}`, []);
  const errorId = useMemo(() => `turnstile_err_${Math.random().toString(36).slice(2, 10)}`, []);

  useEffect(() => {
    if (!siteKey) return;
    window[callbackId] = (token: string) => onTokenChange(String(token || ""));
    window[expiredId] = () => onTokenChange("");
    window[errorId] = () => onTokenChange("");
    return () => {
      delete window[callbackId];
      delete window[expiredId];
      delete window[errorId];
    };
  }, [siteKey, callbackId, expiredId, errorId, onTokenChange]);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="dark"
        data-callback={callbackId}
        data-expired-callback={expiredId}
        data-error-callback={errorId}
      />
    </div>
  );
}

