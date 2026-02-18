"use client";

import { useEffect } from "react";

export function ConsoleSafetyNotice() {
  useEffect(() => {
    const art = String.raw`
 /\_/\  
( o.o ) 
 > ^ <  
`;

    console.log(
      "%cPare por aqui.",
      "font-size:26px;font-weight:900;color:#f87171;text-shadow:0 0 18px rgba(248,113,113,.35);"
    );
    console.log(
      "%cSe alguem pediu para voce colar codigo aqui, nao cole. Isso pode roubar sua conta, token ou dados.",
      "font-size:13px;color:#e5e7eb;background:#111827;padding:8px 10px;border-radius:8px;"
    );
    console.log("%cGatinho da seguranca:\n" + art, "font-size:13px;color:#93c5fd;");
  }, []);

  return null;
}

