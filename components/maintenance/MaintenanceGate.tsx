"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type MaintenanceState = {
  enabled: boolean;
  message: string;
  updatedAt: number | null;
};

function shouldBypass(pathname: string) {
  if (!pathname) return false;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/403")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<MaintenanceState | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/maintenance", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const m = data?.maintenance || {};
        setState({
          enabled: Boolean(m.enabled),
          message: String(m.message || "Estamos em manutencao para melhorias. Voltamos em breve."),
          updatedAt: Number.isFinite(Number(m.updatedAt)) ? Number(m.updatedAt) : null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({ enabled: false, message: "", updatedAt: null });
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const blocked = useMemo(() => {
    if (!state?.enabled) return false;
    return !shouldBypass(String(pathname || ""));
  }, [state, pathname]);

  if (!blocked) return <>{children}</>;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="absolute inset-0 aura-grid-bg opacity-60" />
      <div className="pointer-events-none absolute -top-24 left-[6%] h-[24rem] w-[24rem] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-[8%] h-[25rem] w-[25rem] rounded-full bg-emerald-400/20 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-cyan-100">
          Modo manutencao
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Estamos lapidando a plataforma
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">{state?.message}</p>

        <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Status</div>
            <div className="mt-1 text-sm font-semibold text-cyan-100">Atualizando recursos</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Objetivo</div>
            <div className="mt-1 text-sm font-semibold text-emerald-100">Mais estabilidade</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Previsao</div>
            <div className="mt-1 text-sm font-semibold text-white">Em breve</div>
          </div>
        </div>
      </section>
    </main>
  );
}

