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
    <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 fx-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">{title}</h1>
        <p className="text-white/70 text-sm">Configuracoes e estatisticas do seu servidor.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition fx-hover-lift"
          title="Alternar tema"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          {userImage && imgOk ? (
            <img
              src={userImage}
              alt="Avatar"
              className="h-9 w-9 rounded-full border border-white/10 object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-cyan-400 text-slate-900 font-semibold">
              {initial}
            </div>
          )}

          <div className="text-sm leading-tight">
            <div className="font-semibold">{userName || 'Conta'}</div>
            <div className="text-white/50 text-xs">Discord</div>
          </div>
        </div>

        <a
          href="https://top.gg/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 hover:bg-cyan-400/20 transition text-sm fx-hover-lift fx-shimmer"
          title="Apoiar o bot no Top.gg"
        >
          <Heart size={16} />
          <span className="hidden lg:inline">Apoiar</span>
        </a>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 transition fx-hover-lift"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}
