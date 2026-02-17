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
    {
    id: 'v5.0.1',
    version: '5.0.1',
    date: '2026-02-18',
    title: 'Aurora V5',
    items: [
      'Novo sistema de Perfis de Painel (multi-painel) no bot e dashboard.',
      'Agora você pode criar, renomear, excluir e selecionar painéis de ticket individuais.',
      'Cada painel tem configuração própria (funções, formulários, aparência, modo de abertura e botão).',
      'Sincronização bidirecional bot <-> site para perfis de painel (com painel ativo salvo).',
      'Limite de painéis por plano aplicado com teto técnico de 10.',
      'Workspace Ticket no bot com seletor de painel ativo.',
      'Dashboard com gerenciamento visual de perfis de painel.',
      'Auto-save e atualização em tempo real entre sessões mantidos com perfis.',
      'Correções de sincronização com dashboard (401/timeout e propagação de config).',
      'Ajustes em permissões por assinatura (bloqueio de edição por plano).',
      'Melhorias em placeholders, UX de configuração e fluxo de tickets.',
      'Ajustada persistência de configs para não perder mudanças ao alternar painéis.',
      'Ajustado pipeline de build/tipagem do site com novos campos de painel.',
      'Ajustes de payload e normalização de dados de ticket/profile no backend.',
    ],
  },
]

export const LATEST_CHANGELOG_ID = CHANGELOG_ENTRIES[0]?.id || 'v0'
export const CHANGELOG_SEEN_STORAGE_KEY = 'aurora:changelog:lastSeen'
