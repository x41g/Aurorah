'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  Sparkles,
  Wallet,
  Shield,
  BarChart3,
  Home,
  CreditCard,
  Menu,
  X,
  Bell,
  Activity,
} from 'lucide-react'
import { CHANGELOG_SEEN_STORAGE_KEY, LATEST_CHANGELOG_ID } from '@/lib/changelog'

type Item = {
  href: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
  disabledHint?: string
  badge?: boolean
}

type EntitlementsLike = {
  canEditConfig?: boolean
  canUseAI?: boolean
  canUsePayments?: boolean
  canUseSafePay?: boolean
} | null

function getTabFromHref(href: string) {
  const query = href.split('?')[1] || ''
  const value = new URLSearchParams(query).get('tab')
  return (value || 'panel').toLowerCase()
}

function cls(active: boolean, disabled = false) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 border',
    active
      ? 'bg-fuchsia-400/16 border-fuchsia-300/50 shadow-lg shadow-fuchsia-400/15'
      : 'border-transparent hover:bg-white/6',
    disabled ? 'opacity-45 pointer-events-none' : '',
  ].join(' ')
}

function sectionTitle(text: string) {
  return <div className="mt-4 mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45 px-2 font-medium">{text}</div>
}

export function Sidebar({
  isAdmin,
  guildId,
  entitlements,
  activeTab,
  onTabChange,
}: {
  isAdmin?: boolean
  guildId?: string
  entitlements?: EntitlementsLike
  activeTab?: string
  onTabChange?: (tab: string) => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const sp = useSearchParams()
  const currentTab = (activeTab || sp.get('tab') || 'panel').toLowerCase()

  const [guildName, setGuildName] = useState<string>('')
  const [guildIconUrl, setGuildIconUrl] = useState<string>('')
  const [hasUnreadChangelog, setHasUnreadChangelog] = useState(false)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem(CHANGELOG_SEEN_STORAGE_KEY) || ''
    setHasUnreadChangelog(seen !== LATEST_CHANGELOG_ID)
  }, [])

  function isItemActive(href: string) {
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    const hrefTab = new URLSearchParams(query || '').get('tab')
    const normalized = (hrefTab || 'panel').toLowerCase()
    return normalized === currentTab
  }

  const logoSrc = guildIconUrl || defaultLogo
  const subtitle = guildName ? guildName : 'Aurora V5'

  const canEditConfig = Boolean(entitlements?.canEditConfig)
  const canUseAI = Boolean(entitlements?.canUseAI)
  const canUsePayments = Boolean(entitlements?.canUsePayments)
  const canUseSafePay = Boolean(entitlements?.canUseSafePay)

  const mainItems: Item[] = useMemo(() => {
    if (!guildId) {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { href: '/status', label: 'Status', icon: <Activity size={18} /> },
        { href: '/changelog', label: 'Novidades', icon: <Bell size={18} />, badge: hasUnreadChangelog },
      ]
    }

    return [
      { href: `/dashboard/${guildId}?tab=panel`, label: 'Painel', icon: <LayoutDashboard size={18} /> },
      { href: `/dashboard/${guildId}?tab=tickets`, label: 'Tickets', icon: <Bot size={18} />, disabled: !canEditConfig, disabledHint: 'Exige dashboard editavel no plano.' },
      { href: `/dashboard/${guildId}?tab=triggers`, label: 'Triggers', icon: <Bot size={18} />, disabled: !canEditConfig, disabledHint: 'Exige dashboard editavel no plano.' },
      { href: `/dashboard/${guildId}?tab=ai`, label: 'IA', icon: <Sparkles size={18} />, disabled: !canUseAI, disabledHint: 'Seu plano atual nao inclui IA.' },
      { href: `/dashboard/${guildId}?tab=payments`, label: 'Pagamentos', icon: <Wallet size={18} />, disabled: !canUsePayments, disabledHint: 'Seu plano atual nao inclui pagamentos.' },
      { href: `/dashboard/${guildId}?tab=safepay`, label: 'SafePay', icon: <Shield size={18} />, disabled: !canUseSafePay, disabledHint: 'Seu plano atual nao inclui SafePay.' },
      { href: `/dashboard/${guildId}?tab=stats`, label: 'Estatisticas', icon: <BarChart3 size={18} /> },
      { href: `/dashboard/${guildId}?tab=staff`, label: 'Staff', icon: <BarChart3 size={18} /> },
      { href: '/docs', label: 'Docs', icon: <CreditCard size={18} /> },
      { href: '/status', label: 'Status', icon: <Activity size={18} /> },
      { href: '/changelog', label: 'Novidades', icon: <Bell size={18} />, badge: hasUnreadChangelog },
    ]
  }, [guildId, canEditConfig, canUseAI, canUsePayments, canUseSafePay, hasUnreadChangelog])

  const adminItems: Item[] = useMemo(() => {
    if (!isAdmin) return []
    return [
      { href: '/admin', label: 'Admin', icon: <Shield size={18} /> },
      { href: '/admin/assinaturas', label: 'Assinaturas', icon: <CreditCard size={18} /> },
    ]
  }, [isAdmin])

  const content = (
    <>
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

        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight truncate">Painel</div>
          <div className="text-xs text-white/60 leading-tight truncate">{subtitle}</div>
        </div>

        <Link href="/" title="Home" className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center justify-center transition">
          <Home size={16} />
        </Link>
      </div>

      <nav className="space-y-2">
        {sectionTitle(guildId ? 'Servidor' : 'Geral')}
        {mainItems.map((it) => {
          const active = it.href.includes('?') ? isItemActive(it.href) : pathname === it.href
          const isGuildTab = Boolean(guildId && it.href.startsWith(`/dashboard/${guildId}?tab=`))
          const tabName = isGuildTab ? getTabFromHref(it.href) : ''
          if (isGuildTab && onTabChange) {
            return (
              <div key={it.href} title={it.disabled ? it.disabledHint : ''}>
                <button
                  type="button"
                  disabled={Boolean(it.disabled)}
                  className={`${cls(active, it.disabled)} fx-hover-lift w-full text-left`}
                  onClick={() => {
                    onTabChange(tabName)
                    setMobileOpen(false)
                  }}
                >
                  {it.icon}
                  <span className="font-medium tracking-[0.01em]">{it.label}</span>
                  {it.badge ? <span className="ml-auto h-2.5 w-2.5 rounded-full bg-fuchsia-300" /> : null}
                </button>
              </div>
            )
          }
          return (
            <div key={it.href} title={it.disabled ? it.disabledHint : ''}>
              <Link
                href={it.disabled ? '#' : it.href}
                className={`${cls(active, it.disabled)} fx-hover-lift`}
                onClick={() => {
                  if (it.href === '/changelog' && typeof window !== 'undefined') {
                    window.localStorage.setItem(CHANGELOG_SEEN_STORAGE_KEY, LATEST_CHANGELOG_ID)
                    setHasUnreadChangelog(false)
                  }
                  setMobileOpen(false)
                }}
              >
                {it.icon}
                <span className="font-medium tracking-[0.01em]">{it.label}</span>
                {it.badge ? <span className="ml-auto h-2.5 w-2.5 rounded-full bg-fuchsia-300" /> : null}
              </Link>
            </div>
          )
        })}

        {adminItems.length ? sectionTitle('Administracao') : null}
        {adminItems.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link key={it.href} href={it.href} className={`${cls(active)} fx-hover-lift`} onClick={() => setMobileOpen(false)}>
              {it.icon}
              <span className="font-medium tracking-[0.01em]">{it.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      <div className="lg:hidden mb-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2"
        >
          <Menu size={16} />
          <span className="text-sm font-medium">Menu</span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60">
          <div className="absolute left-0 top-0 h-full w-[90%] max-w-[360px] p-3">
            <div className="card h-full overflow-auto p-4 fx-fade-in">
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
              {content}
            </div>
          </div>
        </div>
      ) : null}

      <aside className="hidden lg:block w-[280px] shrink-0">
        <div className="card sticky top-6 p-4 fx-fade-in">
          {content}
        </div>
      </aside>
    </>
  )
}

