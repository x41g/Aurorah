import { prisma } from "@/lib/prisma";
import { DEFAULT_MAINTENANCE_MESSAGE, readMaintenanceState } from "@/lib/siteMaintenance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MaintenancePage() {
  const row = await prisma.botState.findUnique({ where: { id: "singleton" } });
  const maintenance = readMaintenanceState(row?.guildIds);
  const message = maintenance?.message || DEFAULT_MAINTENANCE_MESSAGE;

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
        <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">{message}</p>

        <div className="mt-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2">
          <img src="/aurora_manutencao.png" alt="Aurora manutencao" className="h-auto w-full rounded-xl object-cover" />
        </div>

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

