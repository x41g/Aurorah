'use client'

import { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'

type Props = {
  id: string
  claimed: number
  closed: number
}

export function StaffRow({ id, claimed, closed }: Props) {
  const [name, setName] = useState('Staff')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/discord/users/${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setName(d?.name || 'Staff')
        setAvatar(d?.avatarUrl || null)
      })
      .catch(() => {})
  }, [id])

  async function copyId() {
    await navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-3 min-w-0">
        {avatar ? (
          <img src={avatar} className="h-10 w-10 rounded-2xl border border-white/10 object-cover" alt="" />
        ) : (
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10" />
        )}

        <div className="min-w-0">
          <div className="font-semibold truncate">{name}</div>

          <button onClick={copyId} className="flex items-center gap-2 text-xs text-white/60 hover:text-violet-300 transition">
            <Copy size={14} />
            {copied ? 'Copiado!' : 'Copiar ID'}
          </button>
        </div>
      </div>

      <div className="text-sm sm:text-right">
        <div>Assumidos: <b className="tabular-nums">{claimed}</b></div>
        <div>Fechados: <b className="tabular-nums">{closed}</b></div>
      </div>
    </div>
  )
}
