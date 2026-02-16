type GuildConfigEvent = {
  guildId: string
  updatedAt: number
  clientId?: string | null
}

type Listener = (event: GuildConfigEvent) => void

type Store = Map<string, Set<Listener>>

declare global {
  // eslint-disable-next-line no-var
  var __guildConfigEventsStore__: Store | undefined
}

function getStore(): Store {
  if (!global.__guildConfigEventsStore__) {
    global.__guildConfigEventsStore__ = new Map()
  }
  return global.__guildConfigEventsStore__
}

export function subscribeGuildConfig(guildId: string, listener: Listener) {
  const store = getStore()
  const key = String(guildId)
  const listeners = store.get(key) || new Set<Listener>()
  listeners.add(listener)
  store.set(key, listeners)

  return () => {
    const set = store.get(key)
    if (!set) return
    set.delete(listener)
    if (set.size === 0) store.delete(key)
  }
}

export function publishGuildConfig(event: GuildConfigEvent) {
  const store = getStore()
  const listeners = store.get(String(event.guildId))
  if (!listeners || listeners.size === 0) return
  for (const listener of listeners) {
    try {
      listener(event)
    } catch {
      // ignore listener errors
    }
  }
}

