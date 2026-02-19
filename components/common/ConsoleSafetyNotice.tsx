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
      "%cÁREA DESIGNADA PARA DESENVOLVEDORES.\nPARE POR AQUI.",
      "font-size:26px;font-weight:900;color:#f87171;text-shadow:0 0 18px rgba(248,113,113,.35);"
    );
    console.log(
      "%cSe você não é um desenvolvedor, é melhor fechar este console, sumir e seguir com tua vida.",
      "font-size:13px;color:#e5e7eb;background:#111827;padding:8px 10px;border-radius:8px;"
    );
    console.log("%cGatinho da seguranca:\n" + art, "font-size:13px;color:#93c5fd;");
  }, []);

  return null;
}

