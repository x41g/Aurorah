'use client'

import { signOut } from 'next-auth/react'
import { useTheme } from '@/app/providers'
import { Moon, Sun, LogOut, Heart } from 'lucide-react'
import { useState } from 'react'

type Props = {
  title: string
  userName?: string | null
  userImage?: string | null
}

export function Topbar({ title, userName, userImage }: Props) {
  const { theme, toggleTheme } = useTheme()
  const [imgOk, setImgOk] = useState(true)
  const initial = userName?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight gradient-text sm:text-2xl">{title}</h1>
        <p className="text-sm font-medium text-white/70">Centro de controle do seu servidor Aurora.</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          title="Alternar tema"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur md:flex">
          {userImage && imgOk ? (
            <img
              src={userImage}
              alt="Avatar"
              className="h-9 w-9 rounded-full border border-white/10 object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-300 font-semibold text-slate-900">
              {initial}
            </div>
          )}

          <div className="text-sm leading-tight">
            <div className="font-medium">{userName || 'Conta'}</div>
            <div className="text-xs text-white/50">Discord</div>
          </div>
        </div>

        <a
          href="https://top.gg/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-fuchsia-300/30 bg-fuchsia-400/10 px-2 text-sm transition hover:bg-fuchsia-400/20 sm:px-3"
          title="Apoiar o bot no Top.gg"
        >
          <Heart size={16} />
          <span className="hidden lg:inline">Apoiar</span>
        </a>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-red-500/30 hover:bg-red-500/20"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}
