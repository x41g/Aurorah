'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Shield,
  CreditCard,
  Trash2,
} from 'lucide-react'

type Item = { href: string; label: string; icon: React.ReactNode }

function cls(active: boolean) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 border',
    active
      ? 'bg-violet-500/15 border-violet-400/40 shadow-lg shadow-violet-500/10'
      : 'border-transparent hover:bg-white/5',
  ].join(' ')
}

function sectionTitle(text: string) {
  return <div className="mt-4 mb-2 text-[11px] uppercase tracking-wider text-white/40 px-2">{text}</div>
}

export function Sidebar({ isAdmin, guildId }: { isAdmin?: boolean; guildId?: string }) {
  const pathname = usePathname()
  const sp = useSearchParams()
  const currentTab = (sp.get('tab') || 'config').toLowerCase()

  const [guildName, setGuildName] = useState<string>('')
  const [guildIconUrl, setGuildIconUrl] = useState<string>('')

  const defaultLogo = (process.env.NEXT_PUBLIC_PANEL_LOGO_URL || '').trim()

  useEffect(() => {
    let cancelled = false

    if (!guildId) {
      setGuildName('')
      setGuildIconUrl('')
      return
    }

    fetch(`/api/discord/guilds/${guildId}/info`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setGuildName(String(d?.name || ''))
        setGuildIconUrl(String(d?.iconUrl || ''))
      })
      .catch(() => {
        if (cancelled) return
        setGuildName('')
        setGuildIconUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [guildId])

  // ✅ “ativo” entende ?tab=
  function isItemActive(href: string) {
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    const hrefTab = new URLSearchParams(query || '').get('tab')
    const normalized = (hrefTab || 'config').toLowerCase()
    return normalized === currentTab
  }

  const logoSrc = guildIconUrl || defaultLogo
  const subtitle = guildName ? guildName : 'Tickets'

  // ✅ itens “principais” sempre estáveis (nunca somem)
  const mainItems: Item[] = useMemo(() => {
    // dentro de uma guild
    if (guildId) {
      return [
        { href: `/dashboard/${guildId}`, label: 'Config', icon: <Settings size={18} /> },
        { href: `/dashboard/${guildId}?tab=tickets`, label: 'Tickets', icon: <BarChart3 size={18} /> },
        { href: `/dashboard/${guildId}?tab=staff`, label: 'Staff', icon: <BarChart3 size={18} /> },
      ]
    }

    // dashboard raiz
    return [{ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }]
  }, [guildId])

  // ✅ admin links (aparecem junto, sem duplicar os outros)
  const adminItems: Item[] = useMemo(() => {
    if (!isAdmin) return []
    return [
      { href: '/admin', label: 'Admin', icon: <Shield size={18} /> },
      { href: '/admin/assinaturas', label: 'Assinaturas', icon: <CreditCard size={18} /> },
      // futuro:
      // { href: '/admin/planos', label: 'Planos', icon: <Tag size={18} /> },
      // { href: '/admin/limpar', label: 'Limpar DB', icon: <Trash2 size={18} /> },
    ]
  }, [isAdmin])

  return (
    <aside className="w-[280px] shrink-0">
      <div className="card sticky top-6 p-4">
        <div className="flex items-center gap-3 mb-2">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo"
              className="h-10 w-10 rounded-2xl border border-white/10 object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10" />
          )}

          <div className="min-w-0">
            <div className="font-bold leading-tight truncate">Painel</div>
            <div className="text-xs text-white/60 leading-tight truncate">{subtitle}</div>
          </div>
        </div>

        <nav className="space-y-2">
          {sectionTitle(guildId ? 'Servidor' : 'Geral')}
          {mainItems.map((it) => {
            const active = it.href.includes('?') ? isItemActive(it.href) : pathname === it.href
            return (
              <Link key={it.href} href={it.href} className={cls(active)}>
                {it.icon}
                <span className="font-medium">{it.label}</span>
              </Link>
            )
          })}

          {adminItems.length ? sectionTitle('Administração') : null}
          {adminItems.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/')
            return (
              <Link key={it.href} href={it.href} className={cls(active)}>
                {it.icon}
                <span className="font-medium">{it.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/10">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition">
            Voltar para a landing
          </Link>
        </div>
      </div>
    </aside>
  )
}
