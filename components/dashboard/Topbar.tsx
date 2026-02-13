'use client'

import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/app/providers'
import { Moon, Sun, LogOut } from 'lucide-react'

type Props = {
  title: string
  userName?: string | null
  userImage?: string | null
}

export function Topbar({ title, userName, userImage }: Props) {
  const { theme, toggleTheme } = useTheme()

  const initial = userName?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-white/60 text-sm">
          Configurações e estatísticas do seu servidor.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* THEME */}
        <button
          onClick={toggleTheme}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* USER CARD */}
        <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          
          {/* AVATAR */}
          {userImage ? (
            <Image
              src={userImage}
              alt="Avatar"
              width={36}
              height={36}
              className="rounded-full border border-white/10"
            />
          ) : (
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-violet-500/80 font-semibold">
              {initial}
            </div>
          )}

          <div className="text-sm leading-tight">
            <div className="font-semibold">{userName || 'Conta'}</div>
            <div className="text-white/50 text-xs">Discord</div>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 transition"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}