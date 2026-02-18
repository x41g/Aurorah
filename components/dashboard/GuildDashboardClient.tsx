'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GuildConfig, GuildStats } from '@/lib/types'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { StatCard } from '@/components/dashboard/StatCard'
import { GuildSettings } from '@/components/dashboard/GuildSettings'
import { StaffRow } from '@/components/dashboard/StaffRow'

type Props = {
  guildId: string
  guildName: string
  isAdmin: boolean
  entitlements: any
  cfg: GuildConfig
  stats: GuildStats
  userName?: string | null
  userImage?: string | null
  initialTab: string
}

function readTabFromUrl() {
  if (typeof window === 'undefined') return 'panel'
  const tab = new URLSearchParams(window.location.search).get('tab') || 'panel'
  return String(tab).toLowerCase()
}

export function GuildDashboardClient({
  guildId,
  guildName,
  isAdmin,
  entitlements,
  cfg,
  stats,
  userName,
  userImage,
  initialTab,
}: Props) {
  const [tab, setTab] = useState((initialTab || 'panel').toLowerCase())

  useEffect(() => {
    const onPop = () => setTab(readTabFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function onTabChange(nextTab: string) {
    const next = (nextTab || 'panel').toLowerCase()
    setTab(next)
    if (typeof window !== 'undefined') {
      const url = `/dashboard/${guildId}?tab=${encodeURIComponent(next)}`
      window.history.replaceState({}, '', url)
    }
  }

  const created = Number(stats.ticketsCreatedToday ?? 0)
  const closed = Number(stats.ticketsClosedToday ?? 0)
  const net = created - closed
  const openedTodayStillOpen = Math.max(net, 0)
  const hasCarryOverClose = closed > created
  const closeRate = created > 0 ? Math.round((closed / created) * 100) : 0

  return (
    <div className="dashboard-shell">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
        <Sidebar guildId={guildId} isAdmin={isAdmin} entitlements={entitlements} activeTab={tab} onTabChange={onTabChange} />
        <div className="min-w-0">
          <Topbar title={guildName} userName={userName} userImage={userImage} />

          <div className="dashboard-stagger grid md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Tickets criados hoje" value={String(created)} hint={stats.todayKey ? `Dia: ${stats.todayKey}` : undefined} />
            <StatCard label="Tickets fechados hoje" value={String(closed)} />
            <StatCard label="Abertos de hoje" value={String(openedTodayStillOpen)} hint="Criados hoje e ainda nao fechados" />
            <StatCard
              label="Atualizado (Horario de Brasilia)"
              value={
                stats.updatedAt
                  ? new Date(stats.updatedAt).toLocaleTimeString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                    })
                  : '-'
              }
            />
          </div>

          {hasCarryOverClose ? (
            <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
              Hoje foram fechados tickets abertos em dias anteriores. Isso e esperado.
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(1px)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {tab === 'stats' ? (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-2">Estatisticas de Tickets</h2>
                  <p className="text-white/60 mb-4">O bot envia metricas automaticamente. Para resultados completos, mantenha o bot online.</p>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Criados hoje" value={String(created)} />
                    <StatCard label="Fechados hoje" value={String(closed)} />
                    <StatCard label="Abertos de hoje" value={String(openedTodayStillOpen)} hint="Criados hoje e ainda nao fechados" />
                    <StatCard label="Taxa de fechamento" value={`${closeRate}%`} hint="Fechados / Criados no dia" />
                  </div>
                </div>
              ) : tab === 'staff' ? (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-2">Estatisticas de Staff</h2>
                  <p className="text-white/60 mb-4">Ranking e contadores por staff (assumidos/fechados).</p>
                  <div className="space-y-3">
                    {stats.staff && Object.keys(stats.staff).length ? (
                      Object.entries(stats.staff).map(([id, s]) => (
                        <StaffRow key={id} id={id} claimed={Number((s as any)?.claimed ?? 0)} closed={Number((s as any)?.closed ?? 0)} />
                      ))
                    ) : (
                      <div className="text-sm text-white/60">Sem dados de staff ainda.</div>
                    )}
                  </div>
                </div>
              ) : (
                <GuildSettings guildId={guildId} initial={cfg} tab={tab} entitlements={entitlements} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
