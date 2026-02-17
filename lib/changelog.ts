export type ChangelogEntry = {
  id: string
  version: string
  date: string
  title: string
  items: string[]
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'v5.0.0',
    version: '5.0.0',
    date: '2026-02-17',
    title: 'Aurora V5',
    items: [
      'Novo dashboard com configuracoes avancadas de tickets, triggers, IA e pagamentos.',
      'Sistema de planos com bloqueios por recurso e visualizacao em modo leitura quando necessario.',
      'SafePay com configuracao visual por banco e status rapido por botao.',
      'Sincronizacao bot-site em tempo real com melhorias de estabilidade e auto update.',
      'Correcao de textos, placeholders e experiencia mobile no painel.',
    ],
  },
]

export const LATEST_CHANGELOG_ID = CHANGELOG_ENTRIES[0]?.id || 'v0'
export const CHANGELOG_SEEN_STORAGE_KEY = 'aurora:changelog:lastSeen'
