'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, BarChart3, Shield } from 'lucide-react'

type Item = { href: string; label: string; icon: React.ReactNode }

function cls(active: boolean) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 transition',
    active ? 'bg-white/10 border border-white/15' : 'hover:bg-white/5 border border-transparent',
  ].join(' ')
}

export function Sidebar({ guildId, isAdmin }: { guildId?: string; isAdmin?: boolean }) {
  const pathname = usePathname()

  const items: Item[] = guildId
    ? [
        { href: `/dashboard/${guildId}`, label: 'Config', icon: <Settings size={18} /> },
        { href: `/dashboard/${guildId}?tab=tickets`, label: 'Tickets', icon: <BarChart3 size={18} /> },
        { href: `/dashboard/${guildId}?tab=staff`, label: 'Staff', icon: <BarChart3 size={18} /> },
      ]
    : [{ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }]

  return (
    <aside className="w-[280px] shrink-0">
      <div className="card sticky top-6 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10" />
          <div>
            <div className="font-bold leading-tight">Painel</div>
            <div className="text-xs text-white/60 leading-tight">Tickets</div>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((it) => {
            const active = pathname === it.href
            return (
              <Link key={it.href} href={it.href} className={cls(active)}>
                {it.icon}
                <span className="font-medium">{it.label}</span>
              </Link>
            )
          })}

          {isAdmin ? (
            <Link href="/admin" className={cls(pathname.startsWith('/admin'))}>
              <Shield size={18} />
              <span className="font-medium">Admin</span>
            </Link>
          ) : null}
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
