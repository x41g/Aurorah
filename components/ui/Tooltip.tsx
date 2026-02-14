'use client'

import { Info } from 'lucide-react'

export function Tooltip({ text }: { text: string }) {
  return (
    <div className="relative inline-flex items-center group">
      <Info size={14} className="text-white/40 hover:text-violet-300 cursor-pointer transition" />
      <div
        className="
          absolute left-1/2 top-full mt-2 -translate-x-1/2
          w-64 p-3 rounded-xl
          bg-[#0B0B12] border border-white/10
          text-xs text-white/70
          opacity-0 pointer-events-none
          group-hover:opacity-100
          transition
          shadow-xl z-50
        "
      >
        {text}
      </div>
    </div>
  )
}