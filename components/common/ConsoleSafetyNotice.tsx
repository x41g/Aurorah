"use client";

import { useEffect } from "react";

export function ConsoleSafetyNotice() {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__auroraConsoleNoticeShown) return;
    if (typeof window !== "undefined") (window as any).__auroraConsoleNoticeShown = true;

    const art = String.raw`
 / \_/ \
(  o.o  )
 / > ^ < \
`;

    console.log(
      "%cAviso de seguranca",
      "font-size:24px;font-weight:900;color:#f87171;text-shadow:0 0 18px rgba(248,113,113,.35);"
    );
    console.log(
      "%cNunca cole comandos aqui se alguem te pediu por chat/DM. Isso pode roubar sua conta e dados.",
      "font-size:13px;color:#e5e7eb;background:#111827;padding:8px 10px;border-radius:8px;"
    );
    console.log("%cGatinho da seguranca:\n" + art, "font-size:13px;color:#93c5fd;line-height:1.4;");
  }, []);

  return null;
}

