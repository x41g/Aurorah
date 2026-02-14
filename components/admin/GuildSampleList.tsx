'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Copy } from 'lucide-react'
import type { GuildStats } from '@/lib/types'

type GuildInfo = {
  id: string
  name: string
  iconUrl?: string | null
}

async function fetchGuildInfo(guildId: string): Promise<GuildInfo> {
  const r = await fetch(`/api/discord/guilds/${guildId}/info`, { cache: 'no-store' })
  if (!r.ok) return { id: guildId, name: 'Servidor', iconUrl: null }
  const d = await r.json()
  return {
    id: guildId,
    name: String(d?.name || 'Servidor'),
    iconUrl: d?.iconUrl ? String(d.iconUrl) : null,
  }
}

function fmtDate(ms?: number) {
  if (!ms) return '—'
  try {
    return new Date(ms).toLocaleString('pt-BR')
  } catch {
    return '—'
  }
}

export function GuildSampleList({ stats }: { stats: GuildStats[] }) {
  const ids = useMemo(() => stats.map((s) => String(s.guildId)), [stats])
  const [info, setInfo] = useState<Record<string, GuildInfo>>({})
  const [ok, setOk] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const entries = await Promise.all(ids.map((id) => fetchGuildInfo(id)))
      if (cancelled) return
      const map: Record<string, GuildInfo> = {}
      for (const g of entries) map[g.id] = g
      setInfo(map)
    })()

    return () => {
      cancelled = true
    }
  }, [ids])

  function copyId(id: string) {
    navigator.clipboard?.writeText(id)
    setOk('Copiado!')
    setTimeout(() => setOk(''), 1200)
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Guilds (amostra)</h2>
          <p className="text-white/60">Lista rápida para conferir se o bot está sincronizando.</p>
        </div>
        {ok ? <div className="text-sm text-emerald-200">{ok}</div> : null}
      </div>

      <div className="mt-4 space-y-3">
        {stats.map((s, idx) => {
          const g = info[s.guildId] || { id: s.guildId, name: 'Carregando...', iconUrl: null }

          return (
            <motion.div
              key={s.guildId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition"
            >
              {/* LEFT: avatar + name + id */}
              <div className="flex items-center gap-3 min-w-0">
                {g.iconUrl ? (
                  <img
                    src={g.iconUrl}
                    alt=""
                    className="h-11 w-11 rounded-2xl border border-white/10 object-cover shrink-0"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 shrink-0" />
                )}

                <div className="min-w-0">
                  <div className="font-semibold truncate">{g.name}</div>

                  <div className="text-xs text-white/60 flex items-center gap-2">
                    <span className="truncate">{s.guildId}</span>

                    <button
                      type="button"
                      onClick={() => copyId(String(s.guildId))}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      title="Copiar ID"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="text-xs text-white/45 mt-1">
                    Atualizado: {fmtDate(s.updatedAt)}
                  </div>
                </div>
              </div>

              {/* RIGHT: stats */}
              <div className="text-sm sm:text-right">
                <div>
                  Hoje: <b className="tabular-nums">{s.ticketsCreatedToday ?? 0}</b> criados
                </div>
                <div>
                  Fechados: <b className="tabular-nums">{s.ticketsClosedToday ?? 0}</b>
                </div>
              </div>
            </motion.div>
          )
        })}

        {!stats.length ? <div className="text-sm text-white/60">Sem dados ainda.</div> : null}
      </div>
    </div>
  )
}