import Link from 'next/link'
import type { DiscordGuild } from '@/lib/discord'
import { guildIconUrl } from '@/lib/discord'

export function GuildCard({
  guild,
  botInGuild,
}: {
  guild: DiscordGuild
  botInGuild: boolean
}) {
  const icon = guildIconUrl(guild)

  return (
    <div className="card p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shrink-0">
          {icon ? <img src={icon} alt={guild.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate">{guild.name}</div>
          <div className="text-xs text-white/60">
            {botInGuild ? 'Bot ativo' : 'Bot não está no servidor'}
          </div>
        </div>
      </div>

      {botInGuild ? (
        <Link href={`/dashboard/${guild.id}`} className="btn-primary px-5 py-2 rounded-2xl">
          Abrir
        </Link>
      ) : (
        <span className="text-xs text-white/60">Sem acesso</span>
      )}
    </div>
  )
}
