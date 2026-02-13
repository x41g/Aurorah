'use client'

import { signOut } from 'next-auth/react'
import { useTheme } from '@/app/providers'
import { Moon, Sun, LogOut } from 'lucide-react'

export function Topbar({ title, userName }: { title: string; userName?: string | null }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-white/60 text-sm">Configurações e estatísticas do seu servidor.</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-secondary px-4 py-2 rounded-2xl"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/5">
          <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10" />
          <div className="text-sm">
            <div className="font-semibold leading-tight">{userName || 'Conta'}</div>
            <div className="text-white/50 leading-tight">Discord</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="btn-secondary px-4 py-2 rounded-2xl"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}
