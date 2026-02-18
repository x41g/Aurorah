export type ChangelogEntry = {
  id: string
  version: string
  date: string
  title: string
  items: string[]
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'v5.2.0',
    version: '5.2.0',
    date: '2026-02-18',
    title: 'Assinaturas, Keys e Automacoes Discord',
    items: [
      'Sistema de assinatura expandido com ciclo completo: scheduled, trialing, active, past_due, canceled e expired.',
      'Assinaturas agora suportam datas de inicio, renovacao, expiracao, cancelamento e encerramento, com status efetivo calculado automaticamente.',
      'Painel admin de assinaturas refeito para editar o ciclo completo com mais controle operacional.',
      'Novo sistema de License Keys: geracao, ativacao, controle de uso, expiracao e revogacao.',
      'Nova tela no dashboard para ativar assinatura via key com vinculacao opcional de servidor.',
      'Novo painel admin para gerenciar keys, incluindo busca, status, validade e copia rapida.',
      'Novo endpoint interno para listar assinaturas ativas e suporte a automacoes no bot.',
      'Bot: adicionado scheduler de poke de assinatura (avisos automáticos quando faltar 7 e 3 dias para expirar).',
      'Bot: adicionado sincronizador de cargo por assinatura ativa no servidor de suporte (adiciona/remove automaticamente).',
      'Bot: deploy de comandos atualizado para suportar escopo global/guild/both e facilitar badge de slash commands.',
      'Bot: novo script de setup AutoMod no servidor de suporte (criacao/atualizacao de regras com modo idempotente).',
      'Correcao de estabilidade no handler de interactions para evitar crash em interacoes sem guild (DM/parcial).',
    ],
  },
  {
    id: 'v5.1.0',
    version: '5.1.0',
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
