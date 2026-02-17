import { prisma } from '@/lib/prisma'

function fmtTs(ts?: number | null) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : []
}

export default async function StatusPage() {
  const now = Date.now()

  let botLastHeartbeatAt: number | null = null
  let guildCount = 0
  let statsLastUpdateAt: number | null = null
  let configLastUpdateAt: number | null = null

  try {
    const [botState, latestStats, latestConfig] = await Promise.all([
      prisma.botState.findUnique({ where: { id: 'singleton' } }),
      prisma.guildStats.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      prisma.guildConfig.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
    ])
    botLastHeartbeatAt = botState?.updatedAt ? botState.updatedAt.getTime() : null
    guildCount = asArray(botState?.guildIds).length
    statsLastUpdateAt = latestStats?.updatedAt ? latestStats.updatedAt.getTime() : null
    configLastUpdateAt = latestConfig?.updatedAt ? latestConfig.updatedAt.getTime() : null
  } catch {
    // keep fallback values
  }

  const botOnline = !!botLastHeartbeatAt && now - botLastHeartbeatAt <= 3 * 60 * 1000

  const cards = [
    {
      name: 'Site',
      status: 'operational',
      hint: `Verificado em ${fmtTs(now)}`,
    },
    {
      name: 'Bot Sync',
      status: botOnline ? 'operational' : 'degraded',
      hint: `Heartbeat: ${fmtTs(botLastHeartbeatAt)} | Guilds: ${guildCount}`,
    },
    {
      name: 'Pipeline de Estatisticas',
      status: statsLastUpdateAt ? 'operational' : 'unknown',
      hint: `Ultima atualizacao: ${fmtTs(statsLastUpdateAt)}`,
    },
    {
      name: 'Pipeline de Config',
      status: configLastUpdateAt ? 'operational' : 'unknown',
      hint: `Ultima atualizacao: ${fmtTs(configLastUpdateAt)}`,
    },
  ] as const

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black gradient-text">Status Aurora</h1>
        <p className="mt-2 text-white/70">Estado atual dos servicos em tempo real (America/Sao_Paulo).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <section key={c.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{c.name}</h2>
              <span
                className={[
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border',
                  c.status === 'operational'
                    ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
                    : c.status === 'degraded'
                      ? 'bg-amber-500/15 border-amber-400/35 text-amber-200'
                      : 'bg-white/10 border-white/20 text-white/80',
                ].join(' ')}
              >
                {c.status === 'operational' ? 'Operacional' : c.status === 'degraded' ? 'Instavel' : 'Sem dados'}
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">{c.hint}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
