'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { GuildConfig } from '@/lib/types'
import { Tooltip } from '@/components/ui/Tooltip'
import { Check, X } from 'lucide-react'

type EntitlementsLike = {
  canEditConfig?: boolean
  canUseAI?: boolean
  canUsePayments?: boolean
  canUseSafePay?: boolean
} | null

type Props = {
  guildId: string
  initial: GuildConfig
  tab?: string
  entitlements?: EntitlementsLike
}

const KNOWN_BANKS = ['inter', 'picpay', 'nubank', '99pay', 'pagseguro']
const SAFE_PAY_BANK_META: Record<string, { label: string; logoUrl: string }> = {
  inter: { label: 'Inter', logoUrl: 'https://logo.clearbit.com/inter.co' },
  picpay: { label: 'PicPay', logoUrl: 'https://logo.clearbit.com/picpay.com' },
  nubank: { label: 'Nubank', logoUrl: 'https://logo.clearbit.com/nubank.com.br' },
  '99pay': { label: '99Pay', logoUrl: 'https://logo.clearbit.com/99app.com' },
  pagseguro: { label: 'PagSeguro', logoUrl: 'https://logo.clearbit.com/pagbank.com.br' },
}
const AI_MODELS = [
  "openai/gpt-oss-120b",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
]
const PIX_TYPES = ["Email", "Telefone", "CPF", "CNPJ", "Aleatoria"]
const TICKET_FUNCTIONS_PLACEHOLDER = `[
  {
    "name": "Suporte",
    "preDescription": "Preciso de ajuda com um pedido",
    "emoji": "🎫"
  },
  {
    "name": "Financeiro",
    "preDescription": "Assuntos de pagamento e reembolso",
    "emoji": "💳"
  }
]`
const TICKET_FORMS_PLACEHOLDER = `{
  "Suporte": {
    "enabled": true,
    "title": "Form de suporte",
    "questions": [
      { "id": "pedido", "label": "Numero do pedido", "style": "SHORT" },
      { "id": "detalhes", "label": "Descreva o problema", "style": "PARAGRAPH" }
    ]
  }
}`
const TRIGGERS_PLACEHOLDER = `[
  {
    "enabled": true,
    "matchType": "equals",
    "trigger": "+vip",
    "responseType": "content",
    "content": "Ola {client.user}, seu VIP foi ativado no ticket {ticket.channel}!"
  },
  {
    "enabled": true,
    "matchType": "startsWith",
    "trigger": "+plano",
    "responseType": "embed",
    "embed": {
      "title": "Plano VIP",
      "description": "{author.user}, confira os detalhes com a equipe.",
      "color": "#C084FC"
    }
  }
]`

function asArray(v: string) {
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function safeJsonParse<T>(txt: string, fallback: T): T {
  try {
    const parsed = JSON.parse(txt)
    return parsed as T
  } catch {
    return fallback
  }
}

function defaultFunctionsFromCfg(cfg: GuildConfig) {
  if (Array.isArray(cfg.ticketFunctions)) return cfg.ticketFunctions
  return []
}

function defaultFormsFromCfg(cfg: GuildConfig) {
  if (cfg.ticketForms && typeof cfg.ticketForms === 'object') return cfg.ticketForms
  return {}
}

function previewMacros(input: string) {
  return String(input || '')
    .replaceAll('{client.user}', '@AuroraBot')
    .replaceAll('{client.mention}', '@AuroraBot')
    .replaceAll('{client.id}', '123456789012345678')
    .replaceAll('{ticket.owner.user}', '@AuroraBot')
    .replaceAll('{ticket.owner.id}', '123456789012345678')
    .replaceAll('{author.user}', '@Cliente')
    .replaceAll('{ticket.channel}', '#ticket-2041')
    .replaceAll('{ticket.id}', 'ticket-2041')
}

type TicketFunctionDraft = {
  name: string
  preDescription: string
  emoji: string
}

type TicketFormQuestionDraft = {
  id: string
  label: string
  style: 'SHORT' | 'PARAGRAPH'
}

type TicketFormDraft = {
  enabled: boolean
  title: string
  questions: TicketFormQuestionDraft[]
}

type TriggerDraft = {
  enabled: boolean
  matchType: 'equals' | 'startsWith' | 'includes'
  trigger: string
  responseType: 'content' | 'embed'
  content: string
  embedTitle: string
  embedDescription: string
  embedColor: string
}

function normalizeFunctions(input: any): TicketFunctionDraft[] {
  if (!Array.isArray(input)) return []
  return input.map((f) => ({
    name: String(f?.name || '').trim(),
    preDescription: String(f?.preDescription || '').trim(),
    emoji: String(f?.emoji || '').trim(),
  }))
}

function normalizeForms(input: any): Record<string, TicketFormDraft> {
  if (!input || typeof input !== 'object') return {}
  const out: Record<string, TicketFormDraft> = {}
  for (const [category, raw] of Object.entries(input)) {
    const r: any = raw || {}
    out[String(category)] = {
      enabled: Boolean(r.enabled ?? true),
      title: String(r.title || ''),
      questions: Array.isArray(r.questions)
        ? r.questions.map((q: any, i: number) => ({
            id: String(q?.id || `q${i + 1}`),
            label: String(q?.label || ''),
            style: String(q?.style || 'SHORT').toUpperCase() === 'PARAGRAPH' ? 'PARAGRAPH' : 'SHORT',
          }))
        : [],
    }
  }
  return out
}

function normalizeTriggers(input: any): TriggerDraft[] {
  if (!Array.isArray(input)) return []
  return input.map((t) => ({
    enabled: Boolean(t?.enabled ?? true),
    matchType:
      String(t?.matchType || 'equals') === 'startsWith'
        ? 'startsWith'
        : String(t?.matchType || 'equals') === 'includes'
          ? 'includes'
          : 'equals',
    trigger: String(t?.trigger || '').trim(),
    responseType: String(t?.responseType || 'content') === 'embed' ? 'embed' : 'content',
    content: String(t?.content || ''),
    embedTitle: String(t?.embed?.title || ''),
    embedDescription: String(t?.embed?.description || ''),
    embedColor: String(t?.embed?.color || '#C084FC'),
  }))
}

function defaultTriggersJsonText() {
  return JSON.stringify(safeJsonParse<any[]>(TRIGGERS_PLACEHOLDER, []), null, 2)
}

export function GuildSettings({ guildId, initial, tab = 'panel', entitlements = null }: Props) {
  const [saving, setSaving] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const didInitAutosave = useRef(false)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressNextAutosaveRef = useRef(false)
  const clientIdRef = useRef(`dash-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const [remoteSyncMsg, setRemoteSyncMsg] = useState<string | null>(null)

  const canEdit = Boolean(entitlements?.canEditConfig)
  const canUseAI = Boolean(entitlements?.canUseAI)
  const canUsePayments = Boolean(entitlements?.canUsePayments)
  const canUseSafePay = Boolean(entitlements?.canUseSafePay)

  const [staffRoleId, setStaffRoleId] = useState(initial.staffRoleId ?? '')
  const [ticketCategoryId, setTicketCategoryId] = useState(initial.ticketCategoryId ?? '')
  const [logsChannelId, setLogsChannelId] = useState(initial.logsChannelId ?? '')
  const [panelChannelId, setPanelChannelId] = useState(initial.panelChannelId ?? '')
  const [slaChannelId, setSlaChannelId] = useState(initial.slaChannelId ?? '')
  const [feedbackChannelId, setFeedbackChannelId] = useState(initial.feedbackChannelId ?? '')

  const [transcriptEnabled, setTranscriptEnabled] = useState(Boolean(initial.transcriptEnabled ?? true))
  const [transcriptTtlDays, setTranscriptTtlDays] = useState(String(initial.transcriptTtlDays ?? 30))
  const [allowOpenRoleIds, setAllowOpenRoleIds] = useState((initial.allowOpenRoleIds ?? []).join(', '))
  const [maxOpenTicketsPerUser, setMaxOpenTicketsPerUser] = useState(String(initial.maxOpenTicketsPerUser ?? 1))
  const [cooldownSeconds, setCooldownSeconds] = useState(String(initial.cooldownSeconds ?? 0))

  const [ticketSystemEnabled, setTicketSystemEnabled] = useState(Boolean(initial.ticketSystemEnabled ?? true))
  const [ticketOpenMode, setTicketOpenMode] = useState<'buttons' | 'select'>(initial.ticketOpenMode === 'select' ? 'select' : 'buttons')
  const [ticketCreateMode, setTicketCreateMode] = useState<'category' | 'thread'>(initial.ticketCreateMode === 'thread' ? 'thread' : 'category')
  const [ticketButtonEmoji, setTicketButtonEmoji] = useState(initial.ticketButtonEmoji ?? '??')
  const [ticketButtonStyle, setTicketButtonStyle] = useState(String(initial.ticketButtonStyle ?? 1))
  const [ticketAppearanceMode, setTicketAppearanceMode] = useState<'embed' | 'content'>(initial.ticketAppearanceMode === 'content' ? 'content' : 'embed')
  const [ticketEmbedTitle, setTicketEmbedTitle] = useState(initial.ticketEmbedTitle ?? 'Sistema de Tickets')
  const [ticketEmbedDescription, setTicketEmbedDescription] = useState(initial.ticketEmbedDescription ?? 'Clique abaixo para abrir seu atendimento.')
  const [ticketEmbedColor, setTicketEmbedColor] = useState(initial.ticketEmbedColor ?? '#4800ff')
  const [ticketEmbedBannerUrl, setTicketEmbedBannerUrl] = useState(initial.ticketEmbedBannerUrl ?? '')
  const [ticketEmbedThumbUrl, setTicketEmbedThumbUrl] = useState(initial.ticketEmbedThumbUrl ?? '')
  const [ticketContentText, setTicketContentText] = useState(initial.ticketContentText ?? 'Olá! Clique abaixo para abrir ticket.')

  const [ticketFunctionsText, setTicketFunctionsText] = useState(JSON.stringify(defaultFunctionsFromCfg(initial), null, 2))
  const [ticketFormsText, setTicketFormsText] = useState(JSON.stringify(defaultFormsFromCfg(initial), null, 2))
  const [customTriggersText, setCustomTriggersText] = useState(
    Array.isArray(initial.customTriggers) && initial.customTriggers.length > 0
      ? JSON.stringify(initial.customTriggers, null, 2)
      : defaultTriggersJsonText()
  )

  const [aiEnabled, setAiEnabled] = useState(Boolean(initial.aiEnabled ?? false))
  const [aiModel, setAiModel] = useState(initial.aiModel ?? 'openai/gpt-oss-120b')
  const [aiPrompt, setAiPrompt] = useState(initial.aiPrompt ?? '')
  const [aiStripMentions, setAiStripMentions] = useState(initial.aiPromptSecurity?.stripMentions ?? true)
  const [aiStripLinks, setAiStripLinks] = useState(initial.aiPromptSecurity?.stripLinks ?? true)
  const [aiBlockJailbreakHints, setAiBlockJailbreakHints] = useState(initial.aiPromptSecurity?.blockJailbreakHints ?? true)

  const [paymentAutoEnabled, setPaymentAutoEnabled] = useState(Boolean(initial.paymentAutoEnabled ?? false))
  const [paymentAccessToken, setPaymentAccessToken] = useState(initial.paymentAccessToken ?? '')
  const [paymentSemiEnabled, setPaymentSemiEnabled] = useState(Boolean(initial.paymentSemiEnabled ?? false))
  const [paymentSemiKey, setPaymentSemiKey] = useState(initial.paymentSemiKey ?? '')
  const [paymentSemiType, setPaymentSemiType] = useState(initial.paymentSemiType ?? 'Email')
  const [paymentSemiApproverRoleId, setPaymentSemiApproverRoleId] = useState(initial.paymentSemiApproverRoleId ?? '')

  const [safePayEnabled, setSafePayEnabled] = useState(Boolean(initial.safePayEnabled ?? false))
  const [safePayBanksOff, setSafePayBanksOff] = useState<string[]>(Array.isArray(initial.safePayBanksOff) ? initial.safePayBanksOff : [])

  const [featureRenameTicket, setFeatureRenameTicket] = useState(Boolean(initial.featureRenameTicket ?? false))
  const [featureNotifyUser, setFeatureNotifyUser] = useState(Boolean(initial.featureNotifyUser ?? false))
  const [featureAddUser, setFeatureAddUser] = useState(Boolean(initial.featureAddUser ?? false))
  const [featureRemoveUser, setFeatureRemoveUser] = useState(Boolean(initial.featureRemoveUser ?? false))

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [showFunctionsModal, setShowFunctionsModal] = useState(false)
  const [showFormsModal, setShowFormsModal] = useState(false)
  const [showTriggersModal, setShowTriggersModal] = useState(false)
  const [functionDraft, setFunctionDraft] = useState<TicketFunctionDraft[]>([])
  const [formsDraft, setFormsDraft] = useState<Record<string, TicketFormDraft>>({})
  const [selectedFormCategory, setSelectedFormCategory] = useState('')
  const [triggerDraft, setTriggerDraft] = useState<TriggerDraft[]>([])

  function applyConfigToForm(cfg: GuildConfig) {
    setStaffRoleId(cfg.staffRoleId ?? '')
    setTicketCategoryId(cfg.ticketCategoryId ?? '')
    setLogsChannelId(cfg.logsChannelId ?? '')
    setPanelChannelId(cfg.panelChannelId ?? '')
    setSlaChannelId(cfg.slaChannelId ?? '')
    setFeedbackChannelId(cfg.feedbackChannelId ?? '')

    setTranscriptEnabled(Boolean(cfg.transcriptEnabled ?? true))
    setTranscriptTtlDays(String(cfg.transcriptTtlDays ?? 30))
    setAllowOpenRoleIds((cfg.allowOpenRoleIds ?? []).join(', '))
    setMaxOpenTicketsPerUser(String(cfg.maxOpenTicketsPerUser ?? 1))
    setCooldownSeconds(String(cfg.cooldownSeconds ?? 0))

    setTicketSystemEnabled(Boolean(cfg.ticketSystemEnabled ?? true))
    setTicketOpenMode(cfg.ticketOpenMode === 'select' ? 'select' : 'buttons')
    setTicketCreateMode(cfg.ticketCreateMode === 'thread' ? 'thread' : 'category')
    setTicketButtonEmoji(cfg.ticketButtonEmoji ?? '??')
    setTicketButtonStyle(String(cfg.ticketButtonStyle ?? 1))
    setTicketAppearanceMode(cfg.ticketAppearanceMode === 'content' ? 'content' : 'embed')
    setTicketEmbedTitle(cfg.ticketEmbedTitle ?? 'Sistema de Tickets')
    setTicketEmbedDescription(cfg.ticketEmbedDescription ?? 'Clique abaixo para abrir seu atendimento.')
    setTicketEmbedColor(cfg.ticketEmbedColor ?? '#4800ff')
    setTicketEmbedBannerUrl(cfg.ticketEmbedBannerUrl ?? '')
    setTicketEmbedThumbUrl(cfg.ticketEmbedThumbUrl ?? '')
    setTicketContentText(cfg.ticketContentText ?? 'Olá! Clique abaixo para abrir ticket.')
    setTicketFunctionsText(JSON.stringify(defaultFunctionsFromCfg(cfg), null, 2))
    setTicketFormsText(JSON.stringify(defaultFormsFromCfg(cfg), null, 2))
    setCustomTriggersText(
      Array.isArray(cfg.customTriggers) && cfg.customTriggers.length > 0
        ? JSON.stringify(cfg.customTriggers, null, 2)
        : defaultTriggersJsonText()
    )

    setAiEnabled(Boolean(cfg.aiEnabled ?? false))
    setAiModel(cfg.aiModel ?? 'openai/gpt-oss-120b')
    setAiPrompt(cfg.aiPrompt ?? '')
    setAiStripMentions(cfg.aiPromptSecurity?.stripMentions ?? true)
    setAiStripLinks(cfg.aiPromptSecurity?.stripLinks ?? true)
    setAiBlockJailbreakHints(cfg.aiPromptSecurity?.blockJailbreakHints ?? true)

    setPaymentAutoEnabled(Boolean(cfg.paymentAutoEnabled ?? false))
    setPaymentAccessToken(cfg.paymentAccessToken ?? '')
    setPaymentSemiEnabled(Boolean(cfg.paymentSemiEnabled ?? false))
    setPaymentSemiKey(cfg.paymentSemiKey ?? '')
    setPaymentSemiType(cfg.paymentSemiType ?? 'Email')
    setPaymentSemiApproverRoleId(cfg.paymentSemiApproverRoleId ?? '')

    setSafePayEnabled(Boolean(cfg.safePayEnabled ?? false))
    setSafePayBanksOff(Array.isArray(cfg.safePayBanksOff) ? cfg.safePayBanksOff : [])

    setFeatureRenameTicket(Boolean(cfg.featureRenameTicket ?? false))
    setFeatureNotifyUser(Boolean(cfg.featureNotifyUser ?? false))
    setFeatureAddUser(Boolean(cfg.featureAddUser ?? false))
    setFeatureRemoveUser(Boolean(cfg.featureRemoveUser ?? false))
  }

  useEffect(() => {
    fetch(`/api/discord/guilds/${guildId}/roles`)
      .then((r) => r.json())
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]))

    fetch(`/api/discord/guilds/${guildId}/channels`)
      .then((r) => r.json())
      .then((data) => setChannels(Array.isArray(data) ? data : []))
      .catch(() => setChannels([]))
  }, [guildId])

  useEffect(() => {
    const source = new EventSource(`/api/guild-config/${guildId}/events`)
    let msgTimer: ReturnType<typeof setTimeout> | null = null

    const onConfig = async (ev: MessageEvent) => {
      const data = safeJsonParse<{ clientId?: string | null }>(String(ev.data || '{}'), {})
      if (data.clientId && data.clientId === clientIdRef.current) return

      const r = await fetch(`/api/guild-config/${guildId}`, { cache: 'no-store' }).catch(() => null)
      if (!r || !r.ok) return
      const json = (await r.json().catch(() => null)) as { config?: GuildConfig } | null
      if (!json?.config) return

      suppressNextAutosaveRef.current = true
      applyConfigToForm(json.config)
      setRemoteSyncMsg('Atualizado ao vivo por outra sessão.')
      if (msgTimer) clearTimeout(msgTimer)
      msgTimer = setTimeout(() => setRemoteSyncMsg(null), 2000)
    }
    const onConfigEvent: EventListener = (ev) => {
      void onConfig(ev as MessageEvent)
    }

    source.addEventListener('config', onConfigEvent)
    source.onerror = () => {
      // reconnection is automatic in EventSource
    }

    return () => {
      source.removeEventListener('config', onConfigEvent)
      source.close()
      if (msgTimer) clearTimeout(msgTimer)
    }
  }, [guildId])

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))
  const categoryOptions = channels.filter((c) => c.type === 4).map((c) => ({ value: c.id, label: c.name }))
  const textChannelOptions = channels.filter((c) => c.type === 0).map((c) => ({ value: c.id, label: c.name }))

  const parsedTicketFunctions = useMemo(
    () => safeJsonParse<GuildConfig['ticketFunctions']>(ticketFunctionsText, []),
    [ticketFunctionsText]
  )
  const parsedTicketForms = useMemo(
    () => safeJsonParse<GuildConfig['ticketForms']>(ticketFormsText, {}),
    [ticketFormsText]
  )
  const parsedCustomTriggers = useMemo(
    () => safeJsonParse<GuildConfig['customTriggers']>(customTriggersText, []),
    [customTriggersText]
  )

  function openFunctionsConfigurator() {
    setFunctionDraft(normalizeFunctions(parsedTicketFunctions))
    setShowFunctionsModal(true)
  }

  function saveFunctionsConfigurator() {
    const cleaned = functionDraft
      .map((f) => ({
        name: String(f.name || '').trim(),
        preDescription: String(f.preDescription || '').trim(),
        emoji: String(f.emoji || '').trim() || undefined,
      }))
      .filter((f) => f.name.length > 0)
    setTicketFunctionsText(JSON.stringify(cleaned, null, 2))
    setShowFunctionsModal(false)
  }

  function openFormsConfigurator() {
    const normalized = normalizeForms(parsedTicketForms)
    setFormsDraft(normalized)
    const firstCategory = Object.keys(normalized)[0] || normalizeFunctions(parsedTicketFunctions)[0]?.name || ''
    setSelectedFormCategory(firstCategory)
    setShowFormsModal(true)
  }

  function saveFormsConfigurator() {
    const out: Record<string, any> = {}
    for (const [k, form] of Object.entries(formsDraft)) {
      const category = String(k || '').trim()
      if (!category) continue
      const questions = (form.questions || [])
        .map((q, i) => ({
          id: `q${i + 1}`,
          label: String(q.label || '').trim(),
          style: q.style === 'PARAGRAPH' ? 'PARAGRAPH' : 'SHORT',
        }))
        .filter((q) => q.label.length > 0)
      out[category] = {
        enabled: Boolean(form.enabled),
        title: String(form.title || '').trim() || `Formulario - ${category}`,
        questions,
      }
    }
    setTicketFormsText(JSON.stringify(out, null, 2))
    setShowFormsModal(false)
  }

  function openTriggersConfigurator() {
    setTriggerDraft(normalizeTriggers(parsedCustomTriggers))
    setShowTriggersModal(true)
  }

  function saveTriggersConfigurator() {
    const out = triggerDraft
      .map((t) => {
        const base: any = {
          enabled: Boolean(t.enabled),
          matchType: t.matchType,
          trigger: String(t.trigger || '').trim(),
          responseType: t.responseType,
        }
        if (t.responseType === 'embed') {
          base.embed = {
            title: String(t.embedTitle || '').trim(),
            description: String(t.embedDescription || '').trim(),
            color: String(t.embedColor || '#C084FC').trim() || '#C084FC',
          }
        } else {
          base.content = String(t.content || '')
        }
        return base
      })
      .filter((t) => t.trigger.length > 0)
    setCustomTriggersText(out.length > 0 ? JSON.stringify(out, null, 2) : defaultTriggersJsonText())
    setShowTriggersModal(false)
  }

  const preview = useMemo(() => {
    const cfg: GuildConfig = {
      staffRoleId: staffRoleId || undefined,
      ticketCategoryId: ticketCategoryId || undefined,
      logsChannelId: logsChannelId || undefined,
      panelChannelId: panelChannelId || undefined,
      slaChannelId: slaChannelId || undefined,
      feedbackChannelId: feedbackChannelId || undefined,

      transcriptEnabled,
      transcriptTtlDays: Number(transcriptTtlDays || 0) || undefined,
      allowOpenRoleIds: asArray(allowOpenRoleIds),
      maxOpenTicketsPerUser: Number(maxOpenTicketsPerUser || 0) || undefined,
      cooldownSeconds: Number(cooldownSeconds || 0) || undefined,

      ticketSystemEnabled,
      ticketOpenMode,
      ticketCreateMode,
      ticketButtonEmoji: ticketButtonEmoji || undefined,
      ticketButtonStyle: Number(ticketButtonStyle || 1),
      ticketAppearanceMode,
      ticketEmbedTitle: ticketEmbedTitle || undefined,
      ticketEmbedDescription: ticketEmbedDescription || undefined,
      ticketEmbedColor: ticketEmbedColor || undefined,
      ticketEmbedBannerUrl: ticketEmbedBannerUrl || undefined,
      ticketEmbedThumbUrl: ticketEmbedThumbUrl || undefined,
      ticketContentText: ticketContentText || undefined,
      ticketFunctions: Array.isArray(parsedTicketFunctions) ? parsedTicketFunctions : [],
      ticketForms: parsedTicketForms && typeof parsedTicketForms === 'object' ? parsedTicketForms : {},
      customTriggers: Array.isArray(parsedCustomTriggers) ? parsedCustomTriggers : [],

      aiEnabled,
      aiModel: aiModel || undefined,
      aiPrompt: aiPrompt || undefined,
      aiPromptSecurity: {
        stripMentions: aiStripMentions,
        stripLinks: aiStripLinks,
        blockJailbreakHints: aiBlockJailbreakHints,
      },

      paymentAutoEnabled,
      paymentAccessToken: paymentAccessToken || undefined,
      paymentSemiEnabled,
      paymentSemiKey: paymentSemiKey || undefined,
      paymentSemiType: paymentSemiType || undefined,
      paymentSemiApproverRoleId: paymentSemiApproverRoleId || undefined,

      safePayEnabled,
      safePayBanksOff,

      featureRenameTicket,
      featureNotifyUser,
      featureAddUser,
      featureRemoveUser,
    }
    return cfg
  }, [
    staffRoleId,
    ticketCategoryId,
    logsChannelId,
    panelChannelId,
    slaChannelId,
    feedbackChannelId,
    transcriptEnabled,
    transcriptTtlDays,
    allowOpenRoleIds,
    maxOpenTicketsPerUser,
    cooldownSeconds,
    ticketSystemEnabled,
    ticketOpenMode,
    ticketCreateMode,
    ticketButtonEmoji,
    ticketButtonStyle,
    ticketAppearanceMode,
    ticketEmbedTitle,
    ticketEmbedDescription,
    ticketEmbedColor,
    ticketEmbedBannerUrl,
    ticketEmbedThumbUrl,
    ticketContentText,
    parsedTicketFunctions,
    parsedTicketForms,
    parsedCustomTriggers,
    aiEnabled,
    aiModel,
    aiPrompt,
    aiStripMentions,
    aiStripLinks,
    aiBlockJailbreakHints,
    paymentAutoEnabled,
    paymentAccessToken,
    paymentSemiEnabled,
    paymentSemiKey,
    paymentSemiType,
    paymentSemiApproverRoleId,
    safePayEnabled,
    safePayBanksOff,
    featureRenameTicket,
    featureNotifyUser,
    featureAddUser,
    featureRemoveUser,
  ])

  const ticketTabLocked = !canEdit && tab === 'tickets'
  const triggerTabLocked = !canEdit && tab === 'triggers'
  const aiTabLocked = !canUseAI && tab === 'ai'
  const paymentTabLocked = !canUsePayments && tab === 'payments'
  const safePayTabLocked = !canUseSafePay && tab === 'safepay'
  const tabLabel = tab === 'tickets' ? 'Tickets' : tab === 'triggers' ? 'Triggers' : tab === 'ai' ? 'IA' : tab === 'payments' ? 'Pagamentos' : tab === 'safepay' ? 'SafePay' : 'Painel'

  const canAutoSave =
    tab === 'ai'
      ? canUseAI
      : tab === 'payments'
        ? canUsePayments
        : tab === 'safepay'
          ? canUseSafePay
          : canEdit

  async function save(mode: 'manual' | 'auto' = 'manual') {
    if (mode === 'manual') {
      setSaving(true)
      setOk(null)
      setErr(null)
    } else {
      setAutosaveStatus('saving')
    }
    try {
      const r = await fetch(`/api/guild-config/${guildId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-dashboard-client-id': clientIdRef.current,
        },
        body: JSON.stringify(preview),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({} as any))
        if (mode === 'manual') {
          if (data?.error === 'subscription_required') {
            setErr('Assinatura necessaria: este plano permite somente leitura de estatisticas.')
          } else if (data?.error === 'prompt_blocked_by_policy') {
            setErr('Prompt bloqueado pela politica de seguranca.')
          } else if (data?.error === 'prompt_too_long') {
            setErr('Prompt muito longo (maximo 4000 caracteres).')
          } else {
            setErr('Falha ao salvar. Verifique suas permissoes e tente novamente.')
          }
        } else {
          setAutosaveStatus('error')
        }
        return
      }
      if (mode === 'manual') setOk('Salvo com sucesso.')
      setAutosaveStatus('saved')
    } catch {
      if (mode === 'manual') setErr('Falha de rede.')
      setAutosaveStatus('error')
    } finally {
      if (mode === 'manual') setSaving(false)
    }
  }

  useEffect(() => {
    if (!canAutoSave || saving) return
    if (suppressNextAutosaveRef.current) {
      suppressNextAutosaveRef.current = false
      return
    }
    if (!didInitAutosave.current) {
      didInitAutosave.current = true
      return
    }

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      void save('auto')
    }, 900)

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [preview, canAutoSave, saving])

  function toggleBank(bank: string) {
    setSafePayBanksOff((prev) => (prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]))
  }

  return (
    <div className="card p-5 sm:p-6 fx-fade-in">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-fuchsia-200">
          Aba ativa: {tabLabel}
        </span>
        <span className="text-xs text-white/60">Atualizacao em tempo real entre sessoes habilitada</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-1 gradient-text">Configuracao V5</h2>
      <p className="text-white/70 mb-6">Acoes bloqueadas pelo plano aparecem desativadas automaticamente.</p>

      {ticketTabLocked ? <LockMsg text="Seu plano atual não libera edição de Tickets." /> : null}
      {triggerTabLocked ? <LockMsg text="Seu plano atual não libera edição de Triggers." /> : null}
      {aiTabLocked ? <LockMsg text="Seu plano atual não libera configuração de IA." /> : null}
      {paymentTabLocked ? <LockMsg text="Seu plano atual não libera configuração de pagamentos." /> : null}
      {safePayTabLocked ? <LockMsg text="Seu plano atual não libera configuração de SafePay." /> : null}

      {tab === 'tickets' ? (
        <fieldset disabled={!canEdit || saving} className="space-y-4 disabled:opacity-60 fx-stagger">
          <Section title="Sistema">
            <Toggle label="Sistema de ticket" value={ticketSystemEnabled} onChange={setTicketSystemEnabled} />
            <Reveal show={ticketSystemEnabled}>
              <div className="space-y-3">
                <SelectField
                  label="Modo de abertura"
                  value={ticketOpenMode}
                  onChange={(v) => setTicketOpenMode(v === 'select' ? 'select' : 'buttons')}
                  options={[
                    { value: 'buttons', label: 'Botao' },
                    { value: 'select', label: 'Select de opcoes' },
                  ]}
                  placeholder="Escolha o modo de abertura"
                />
                <SelectField
                  label="Modo de criacao"
                  value={ticketCreateMode}
                  onChange={(v) => setTicketCreateMode(v === 'thread' ? 'thread' : 'category')}
                  options={[
                    { value: 'category', label: 'Categoria (canal)' },
                    { value: 'thread', label: 'Topico (thread)' },
                  ]}
                  placeholder="Escolha o modo de criacao"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Emoji do botão" value={ticketButtonEmoji} onChange={setTicketButtonEmoji} />
                  <Field
                    label="Style do botao (1-4)"
                    value={ticketButtonStyle}
                    onChange={setTicketButtonStyle}
                    hint="1=Azul (Primary), 2=Cinza (Secondary), 3=Verde (Success), 4=Vermelho (Danger)."
                  />
                </div>
              </div>
            </Reveal>
          </Section>

          <Reveal show={ticketSystemEnabled}>
            <Section title="Aparencia">
              <Toggle
                label="Usar modo content (desligado = embed)"
                value={ticketAppearanceMode === 'content'}
                onChange={(v) => setTicketAppearanceMode(v ? 'content' : 'embed')}
              />
              <Reveal show={ticketAppearanceMode === 'embed'}>
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Titulo" value={ticketEmbedTitle} onChange={setTicketEmbedTitle} />
                  <Field label="Cor" value={ticketEmbedColor} onChange={setTicketEmbedColor} />
                  <Field label="Banner URL" value={ticketEmbedBannerUrl} onChange={setTicketEmbedBannerUrl} />
                  <Field label="Miniatura URL" value={ticketEmbedThumbUrl} onChange={setTicketEmbedThumbUrl} />
                  <Field label="Descricao" value={ticketEmbedDescription} onChange={setTicketEmbedDescription} className="md:col-span-2" />
                </div>
              </Reveal>
              <Reveal show={ticketAppearanceMode === 'content'}>
                <TextAreaField
                  label="Conteudo"
                  value={ticketContentText}
                  onChange={setTicketContentText}
                  placeholder={"Ex.: Atendimento VIP\nDescreva seu pedido com detalhes para agilizar o suporte."}
                />
              </Reveal>
            </Section>
          </Reveal>

          <Reveal show={ticketSystemEnabled}>
            <Section title="Funcoes">
              <div className="grid md:grid-cols-2 gap-3">
                <Toggle label="Renomear Ticket" value={featureRenameTicket} onChange={setFeatureRenameTicket} />
                <Toggle label="Notificar Usuario" value={featureNotifyUser} onChange={setFeatureNotifyUser} />
                <Toggle label="Adicionar Usuario" value={featureAddUser} onChange={setFeatureAddUser} />
                <Toggle label="Remover Usuario" value={featureRemoveUser} onChange={setFeatureRemoveUser} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-white/85">Categorias do ticket</div>
                  <button type="button" className="btn-secondary px-3 py-1.5 text-xs rounded-xl" onClick={openFunctionsConfigurator}>
                    Configurar por modal
                  </button>
                </div>
                <p className="text-xs text-white/60 mt-2">Use o modal para adicionar nome, descricao curta e emoji sem editar JSON manualmente.</p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-white/70">Modo avancado (JSON)</summary>
                  <div className="mt-3">
                    <JsonField
                      label="Categorias do ticket (JSON)"
                      value={ticketFunctionsText}
                      onChange={setTicketFunctionsText}
                      hint='Exemplo: [{"name":"Suporte","preDescription":"Preciso de ajuda","emoji":"??"}]'
                      placeholder={TICKET_FUNCTIONS_PLACEHOLDER}
                    />
                  </div>
                </details>
              </div>
            </Section>
          </Reveal>

          <Reveal show={ticketSystemEnabled}>
            <Section title="Formularios">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-white/85">Formularios por categoria</div>
                  <button type="button" className="btn-secondary px-3 py-1.5 text-xs rounded-xl" onClick={openFormsConfigurator}>
                    Configurar por modal
                  </button>
                </div>
                <p className="text-xs text-white/60 mt-2">Configure perguntas sem mexer com chaves JSON.</p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-white/70">Modo avancado (JSON)</summary>
                  <div className="mt-3">
                    <JsonField
                      label="Formularios por categoria (JSON)"
                      value={ticketFormsText}
                      onChange={setTicketFormsText}
                      hint='Exemplo: {"Suporte":{"enabled":true,"title":"Form","questions":[{"id":"q1","label":"Qual seu problema?","style":"SHORT"}]}}'
                      placeholder={TICKET_FORMS_PLACEHOLDER}
                    />
                  </div>
                </details>
              </div>
            </Section>
          </Reveal>

          <Reveal show={ticketSystemEnabled}>
            <Section title="Preview">
              {ticketAppearanceMode === 'embed' ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60 mb-2">Embed preview</div>
                  <div className="rounded-xl border border-white/20 p-4" style={{ borderLeftColor: ticketEmbedColor || '#4800ff', borderLeftWidth: 4 }}>
                    <div className="font-semibold">{ticketEmbedTitle || 'Sem titulo'}</div>
                    <div className="text-sm text-white/70 mt-2">{ticketEmbedDescription || 'Sem descricao'}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 whitespace-pre-line">{ticketContentText || 'Sem content.'}</div>
              )}
            </Section>
          </Reveal>
        </fieldset>
      ) : tab === 'triggers' ? (
        <fieldset disabled={!canEdit || saving} className="space-y-4 disabled:opacity-60 fx-stagger">
          <Section title="Sistema de Triggers">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm text-white/70 max-w-2xl">
                Configure palavras/comandos como <code>+vip</code> para resposta automatica dentro do ticket.
              </p>
              <a
                href="/docs"
                className="btn-secondary shrink-0 px-3 py-1.5 text-xs rounded-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ajuda / Docs
              </a>
            </div>
            <JsonField
              label="Triggers (JSON)"
              value={customTriggersText}
              onChange={setCustomTriggersText}
              hint='Campos práticos: enabled, matchType, trigger, responseType, content/embed.'
              placeholder={TRIGGERS_PLACEHOLDER}
            />
            <div className="flex justify-end">
              <button type="button" className="btn-secondary px-3 py-1.5 text-xs rounded-xl" onClick={openTriggersConfigurator}>
                Configurar Triggers por modal
              </button>
            </div>
          </Section>

          <Section title="Preview de Resposta">
            <div className="space-y-3">
              {Array.isArray(parsedCustomTriggers) && parsedCustomTriggers.length ? (
                parsedCustomTriggers.slice(0, 3).map((t: any, i: number) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/60 mb-1">
                      Trigger: <code>{String(t?.trigger || '')}</code> | Match: <code>{String(t?.matchType || 'equals')}</code>
                    </div>
                    <div className="text-xs text-fuchsia-200/80 mb-2">
                      Simulacao de entrada: <code>{String(t?.trigger || '')}</code>
                    </div>
                    {String(t?.responseType || 'content') === 'embed' ? (
                      <div className="rounded-lg border border-white/15 p-3">
                        <div className="font-semibold">{previewMacros(String(t?.embed?.title || 'Sem titulo'))}</div>
                        <div className="text-sm text-white/75 mt-1 whitespace-pre-line">{previewMacros(String(t?.embed?.description || 'Sem descricao'))}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-white/85 whitespace-pre-line">{previewMacros(String(t?.content || 'Sem conteudo'))}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60">Sem triggers configurados.</div>
              )}
            </div>
          </Section>
        </fieldset>
      ) : tab === 'ai' ? (
        <fieldset disabled={!canUseAI || saving} className="space-y-4 disabled:opacity-60 fx-stagger">
          <Section title="IA">
            <Toggle label="IA habilitada" value={aiEnabled} onChange={setAiEnabled} />
            <Reveal show={aiEnabled}>
              <div className="space-y-3">
                <SelectField
                  label="Modelo"
                  value={aiModel}
                  onChange={setAiModel}
                  options={AI_MODELS.map((m) => ({ value: m, label: m }))}
                  placeholder="Selecione um modelo"
                />
                <JsonField label="Prompt da IA" value={aiPrompt} onChange={setAiPrompt} hint="Prompt com validações de segurança no backend." />
              </div>
            </Reveal>
          </Section>
          <Reveal show={aiEnabled}>
            <Section title="Seguranca de Prompt">
              <Toggle label="Remover menções" value={aiStripMentions} onChange={setAiStripMentions} />
              <Toggle label="Remover links" value={aiStripLinks} onChange={setAiStripLinks} />
              <Toggle label="Bloquear hints de jailbreak" value={aiBlockJailbreakHints} onChange={setAiBlockJailbreakHints} />
            </Section>
          </Reveal>
        </fieldset>
      ) : tab === 'payments' ? (
        <fieldset disabled={!canUsePayments || saving} className="space-y-4 disabled:opacity-60 fx-stagger">
          <Section title="Automatico">
            <Toggle label="Pagamento automatico" value={paymentAutoEnabled} onChange={setPaymentAutoEnabled} />
            <Reveal show={paymentAutoEnabled}>
              <Field label="Access token MercadoPago" value={paymentAccessToken} onChange={setPaymentAccessToken} />
            </Reveal>
          </Section>
          <Section title="Semi-auto">
            <Toggle label="Semi-automatico" value={paymentSemiEnabled} onChange={setPaymentSemiEnabled} />
            <Reveal show={paymentSemiEnabled}>
              <div className="space-y-3">
                <Field label="Chave PIX" value={paymentSemiKey} onChange={setPaymentSemiKey} />
                <SelectField
                  label="Tipo da chave"
                  value={paymentSemiType}
                  onChange={setPaymentSemiType}
                  options={PIX_TYPES.map((t) => ({ value: t, label: t }))}
                  placeholder="Selecione o tipo"
                />
                <SelectField
                  label="Cargo aprovador"
                  value={paymentSemiApproverRoleId}
                  onChange={setPaymentSemiApproverRoleId}
                  options={roleOptions}
                  placeholder="Selecione um cargo"
                />
              </div>
            </Reveal>
          </Section>
        </fieldset>
      ) : tab === 'safepay' ? (
        <fieldset disabled={!canUseSafePay || saving} className="space-y-4 disabled:opacity-60 fx-stagger">
          <Section title="SafePay">
            <Toggle label="SafePay habilitado" value={safePayEnabled} onChange={setSafePayEnabled} />
            <Reveal show={safePayEnabled}>
              <div className="mt-2 mb-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white/80">
                V = liberado para uso | X = bloqueado no SafePay
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {KNOWN_BANKS.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => toggleBank(bank)}
                    aria-pressed={!safePayBanksOff.includes(bank)}
                    className="min-h-14 rounded-xl border border-white/10 px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-3 bg-white/5 hover:bg-white/[0.08] transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={SAFE_PAY_BANK_META[bank]?.logoUrl || 'https://logo.clearbit.com/discord.com'}
                        alt={`Logo ${SAFE_PAY_BANK_META[bank]?.label || bank}`}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-md object-contain bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-sm sm:text-base font-semibold text-white/90 truncate">{SAFE_PAY_BANK_META[bank]?.label || bank}</span>
                    </div>
                    <span
                      className={[
                        'inline-flex items-center justify-center h-8 min-w-12 px-2 rounded-lg text-xs sm:text-sm font-semibold border whitespace-nowrap',
                        safePayBanksOff.includes(bank) ? 'bg-red-500/20 border-red-400/40 text-red-200' : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200',
                      ].join(' ')}
                    >
                      {safePayBanksOff.includes(bank) ? 'X Bloq.' : 'V Livre'}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          </Section>
        </fieldset>
      ) : (
        <fieldset disabled={!canEdit || saving} className="grid md:grid-cols-2 gap-4 disabled:opacity-60 fx-stagger">
          <SelectField label="Cargo Staff" value={staffRoleId} onChange={setStaffRoleId} options={roleOptions} placeholder="Selecione um cargo" />
          <SelectField label="Categoria de Tickets" value={ticketCategoryId} onChange={setTicketCategoryId} options={categoryOptions} placeholder="Selecione uma categoria" />
          <SelectField label="Canal de Logs" value={logsChannelId} onChange={setLogsChannelId} options={textChannelOptions} placeholder="Selecione um canal" />
          <SelectField label="Canal do Painel" value={panelChannelId} onChange={setPanelChannelId} options={textChannelOptions} placeholder="Selecione um canal" />
          <SelectField label="Canal SLA" value={slaChannelId} onChange={setSlaChannelId} options={textChannelOptions} placeholder="Selecione um canal" />
          <SelectField label="Canal de Avaliacao" value={feedbackChannelId} onChange={setFeedbackChannelId} options={textChannelOptions} placeholder="Selecione um canal" />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Transcripts</div>
                <div className="text-xs text-white/60">Link privado com senha e expiração.</div>
              </div>
              <button
                type="button"
                className={['px-4 py-2 rounded-2xl border transition', transcriptEnabled ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/10'].join(' ')}
                onClick={() => setTranscriptEnabled((v) => !v)}
              >
                {transcriptEnabled ? 'Ativo' : 'Desativado'}
              </button>
            </div>
            <Reveal show={transcriptEnabled}>
              <div className="space-y-3 mt-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Expiração (dias)" value={transcriptTtlDays} onChange={setTranscriptTtlDays} />
                  <Field label="Max. tickets por usuário" value={maxOpenTicketsPerUser} onChange={setMaxOpenTicketsPerUser} />
                  <Field label="Cooldown (segundos)" value={cooldownSeconds} onChange={setCooldownSeconds} />
                </div>
                <Field label="Cargos que podem abrir (IDs separados por vírgula)" value={allowOpenRoleIds} onChange={setAllowOpenRoleIds} />
              </div>
            </Reveal>
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-6 rounded-2xl border border-white/10 bg-white/5 p-3">
        {(saving || autosaveStatus === 'error') ? (
          <button type="button" className="btn-primary px-6 py-3 rounded-2xl disabled:opacity-60 fx-hover-lift fx-shimmer" onClick={() => void save('manual')} disabled={saving || (tab === 'ai' && !canUseAI) || ((tab === 'payments') && !canUsePayments) || ((tab === 'safepay') && !canUseSafePay) || ((tab === 'tickets' || tab === 'panel') && !canEdit)}>
            {saving ? 'Salvando...' : 'Salvar agora'}
          </button>
        ) : null}

        {ok ? <span className="text-sm text-emerald-300">{ok}</span> : null}
        {err ? <span className="text-sm text-red-300">{err}</span> : null}
        {!ok && !err && autosaveStatus === 'saving' ? <span className="text-sm text-white/60">Atualizando em tempo real...</span> : null}
        {!ok && !err && autosaveStatus === 'saved' ? <span className="text-sm text-emerald-300">Atualizado em tempo real.</span> : null}
        {!ok && !err && autosaveStatus === 'error' ? <span className="text-sm text-amber-300">Falha no auto-update. Use Salvar.</span> : null}
        {remoteSyncMsg ? <span className="text-sm text-fuchsia-300">{remoteSyncMsg}</span> : null}
      </div>

      <div className="mt-6">
        <details className="text-sm text-white/75 rounded-2xl border border-white/10 bg-white/5 p-3">
          <summary className="cursor-pointer select-none">Preview do JSON final</summary>
          <pre className="mt-3 p-4 rounded-2xl bg-black/50 border border-white/10 overflow-auto text-xs">{JSON.stringify(preview, null, 2)}</pre>
        </details>
      </div>

      {showFunctionsModal ? (
        <ModalShell title="Categorias do Ticket" onClose={() => setShowFunctionsModal(false)} onSave={saveFunctionsConfigurator}>
          <div className="space-y-2">
            {functionDraft.map((f, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
                <div className="grid sm:grid-cols-3 gap-2">
                  <Field label="Nome" placeholder="Ex.: Suporte" value={f.name} onChange={(v) => setFunctionDraft((p) => p.map((x, i) => (i === idx ? { ...x, name: v } : x)))} />
                  <Field label="Descricao curta" placeholder="Ex.: Dúvidas gerais e ajuda" value={f.preDescription} onChange={(v) => setFunctionDraft((p) => p.map((x, i) => (i === idx ? { ...x, preDescription: v } : x)))} />
                  <Field label="Emoji" placeholder="Ex.: 🎫 ou 1470501482573857032" value={f.emoji} onChange={(v) => setFunctionDraft((p) => p.map((x, i) => (i === idx ? { ...x, emoji: v } : x)))} />
                </div>
                <div className="flex justify-end">
                  <button type="button" className="btn-secondary px-3 py-1.5 text-xs rounded-xl" onClick={() => setFunctionDraft((p) => p.filter((_, i) => i !== idx))}>
                    Remover
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs rounded-xl"
              onClick={() => setFunctionDraft((p) => [...p, { name: '', preDescription: '', emoji: '' }])}
            >
              Adicionar categoria
            </button>
          </div>
        </ModalShell>
      ) : null}

      {showFormsModal ? (
        <ModalShell title="Formularios do Ticket" onClose={() => setShowFormsModal(false)} onSave={saveFormsConfigurator}>
          <div className="space-y-3">
            <SelectField
              label="Categoria"
              value={selectedFormCategory}
              onChange={setSelectedFormCategory}
              options={normalizeFunctions(parsedTicketFunctions)
                .filter((f) => f.name.trim().length > 0)
                .map((f) => ({ value: f.name, label: f.name }))}
              placeholder="Selecione uma categoria"
            />
            {selectedFormCategory ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-3">
                <Toggle
                  label="Formulario ativo"
                  value={Boolean(formsDraft[selectedFormCategory]?.enabled ?? true)}
                  onChange={(v) =>
                    setFormsDraft((prev) => ({
                      ...prev,
                      [selectedFormCategory]: {
                        enabled: v,
                        title: prev[selectedFormCategory]?.title || `Formulario - ${selectedFormCategory}`,
                        questions: prev[selectedFormCategory]?.questions || [],
                      },
                    }))
                  }
                />
                <Field
                  label="Titulo do formulario"
                  placeholder={`Ex.: Formulário de ${selectedFormCategory || 'suporte'}`}
                  value={formsDraft[selectedFormCategory]?.title || ''}
                  onChange={(v) =>
                    setFormsDraft((prev) => ({
                      ...prev,
                      [selectedFormCategory]: {
                        enabled: prev[selectedFormCategory]?.enabled ?? true,
                        title: v,
                        questions: prev[selectedFormCategory]?.questions || [],
                      },
                    }))
                  }
                />
                <div className="space-y-2">
                  {(formsDraft[selectedFormCategory]?.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="rounded-lg border border-white/10 bg-black/20 p-2">
                      <div className="grid sm:grid-cols-3 gap-2">
                        <Field
                          label={`Pergunta ${qIdx + 1}`}
                          placeholder={qIdx === 0 ? 'Ex.: Qual é o número do pedido?' : 'Ex.: Descreva seu problema'}
                          value={q.label}
                          onChange={(v) =>
                            setFormsDraft((prev) => {
                              const current = prev[selectedFormCategory] || { enabled: true, title: '', questions: [] }
                              const next = [...(current.questions || [])]
                              next[qIdx] = { ...next[qIdx], label: v }
                              return { ...prev, [selectedFormCategory]: { ...current, questions: next } }
                            })
                          }
                        />
                        <SelectField
                          label="Estilo"
                          value={q.style}
                          onChange={(v) =>
                            setFormsDraft((prev) => {
                              const current = prev[selectedFormCategory] || { enabled: true, title: '', questions: [] }
                              const next = [...(current.questions || [])]
                              next[qIdx] = { ...next[qIdx], style: v === 'PARAGRAPH' ? 'PARAGRAPH' : 'SHORT' }
                              return { ...prev, [selectedFormCategory]: { ...current, questions: next } }
                            })
                          }
                          options={[
                            { value: 'SHORT', label: 'Curta' },
                            { value: 'PARAGRAPH', label: 'Longa' },
                          ]}
                          placeholder="Selecione"
                        />
                        <div className="flex items-end">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-1.5 text-xs rounded-xl"
                            onClick={() =>
                              setFormsDraft((prev) => {
                                const current = prev[selectedFormCategory] || { enabled: true, title: '', questions: [] }
                                return {
                                  ...prev,
                                  [selectedFormCategory]: { ...current, questions: current.questions.filter((_, i) => i !== qIdx) },
                                }
                              })
                            }
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs rounded-xl"
                    onClick={() =>
                      setFormsDraft((prev) => {
                        const current = prev[selectedFormCategory] || { enabled: true, title: `Formulario - ${selectedFormCategory}`, questions: [] }
                        return {
                          ...prev,
                          [selectedFormCategory]: {
                            ...current,
                            questions: [...current.questions, { id: `q${current.questions.length + 1}`, label: '', style: 'SHORT' }],
                          },
                        }
                      })
                    }
                  >
                    Adicionar pergunta
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/70">Crie uma categoria primeiro no modal de categorias.</div>
            )}
          </div>
        </ModalShell>
      ) : null}

      {showTriggersModal ? (
        <ModalShell title="Configurador de Triggers" onClose={() => setShowTriggersModal(false)} onSave={saveTriggersConfigurator}>
          <div className="space-y-2">
            {triggerDraft.map((t, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
                <Toggle label="Ativo" value={t.enabled} onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, enabled: v } : x)))} />
                <div className="grid sm:grid-cols-2 gap-2">
                  <SelectField
                    label="Match"
                    value={t.matchType}
                    onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, matchType: (v as any) || 'equals' } : x)))}
                    options={[
                      { value: 'equals', label: 'Igual' },
                      { value: 'startsWith', label: 'Comeca com' },
                      { value: 'includes', label: 'Contem' },
                    ]}
                    placeholder="Selecione"
                  />
                  <SelectField
                    label="Resposta"
                    value={t.responseType}
                    onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, responseType: v === 'embed' ? 'embed' : 'content' } : x)))}
                    options={[
                      { value: 'content', label: 'Texto' },
                      { value: 'embed', label: 'Embed' },
                    ]}
                    placeholder="Selecione"
                  />
                </div>
                <Field label="Comando gatilho" placeholder="Ex.: +vip" value={t.trigger} onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, trigger: v } : x)))} />
                {t.responseType === 'embed' ? (
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Field label="Titulo da embed" placeholder="Ex.: Plano VIP" value={t.embedTitle} onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, embedTitle: v } : x)))} />
                    <Field label="Cor da embed" placeholder="Ex.: #C084FC" value={t.embedColor} onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, embedColor: v } : x)))} />
                    <TextAreaField label="Descricao da embed" placeholder={"Ex.: {author.user}, confira os detalhes com a equipe.\nVoce pode quebrar linha aqui."} value={t.embedDescription} onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, embedDescription: v } : x)))} className="sm:col-span-2" />
                  </div>
                ) : (
                  <TextAreaField label="Mensagem de resposta" placeholder={"Ex.: Ola {client.user}, seu VIP foi ativado!\nUse quebra de linha para separar titulo e texto sem embed."} value={t.content} onChange={(v) => setTriggerDraft((p) => p.map((x, i) => (i === idx ? { ...x, content: v } : x)))} />
                )}
                <div className="flex justify-end">
                  <button type="button" className="btn-secondary px-3 py-1.5 text-xs rounded-xl" onClick={() => setTriggerDraft((p) => p.filter((_, i) => i !== idx))}>
                    Remover trigger
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs rounded-xl"
              onClick={() =>
                setTriggerDraft((p) => [
                  ...p,
                  { enabled: true, matchType: 'equals', trigger: '', responseType: 'content', content: '', embedTitle: '', embedDescription: '', embedColor: '#C084FC' },
                ])
              }
            >
              Adicionar trigger
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  )
}

function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className={['grid transition-all duration-300 ease-out', show ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'].join(' ')}>
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

function LockMsg({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{text}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 sm:p-5 fx-hover-lift">
      <h3 className="font-semibold mb-3 text-fuchsia-100 tracking-wide">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ModalShell({
  title,
  children,
  onClose,
  onSave,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  onSave: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[88vh] overflow-auto rounded-2xl border border-white/10 bg-[#0b0f1d] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h4 className="text-base sm:text-lg font-semibold">{title}</h4>
          <button type="button" className="btn-secondary px-3 py-1.5 text-xs rounded-xl" onClick={onClose}>
            Fechar
          </button>
        </div>
        {children}
        <div className="mt-4 flex justify-end">
          <button type="button" className="btn-primary px-4 py-2 rounded-xl" onClick={onSave}>
            Salvar configuracao
          </button>
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 bg-black/20">
      <span className="text-sm text-white/90">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={[
          'px-3 py-1 rounded-full border text-xs font-semibold transition fx-hover-lift min-w-10 text-center',
          value ? 'bg-emerald-500/20 border-emerald-300/50 text-emerald-100' : 'bg-red-500/15 border-red-300/35 text-red-100',
        ].join(' ')}
      >
        <span className="inline-flex items-center justify-center gap-1">
          {value ? <Check size={13} /> : <X size={13} />}
          <span>{value ? 'V' : 'X'}</span>
        </span>
      </button>
    </div>
  )
}

function Field({ label, value, onChange, hint, placeholder, className = '' }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}>
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/65">
        {label}
        {hint ? <Tooltip text={hint} /> : null}
      </label>
      <input className="mt-2 w-full rounded-xl bg-black/45 border border-white/10 px-4 py-3 outline-none focus:border-fuchsia-300/40 fx-focus-ring" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextAreaField({ label, value, onChange, hint, placeholder, className = '' }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}>
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/65">
        {label}
        {hint ? <Tooltip text={hint} /> : null}
      </label>
      <textarea
        className="mt-2 w-full min-h-[108px] rounded-xl bg-black/45 border border-white/10 px-4 py-3 outline-none focus:border-fuchsia-300/40 fx-focus-ring"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function JsonField({ label, value, onChange, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/65">
        {label}
        {hint ? <Tooltip text={hint} /> : null}
      </label>
      <textarea
        className="mt-2 w-full min-h-[140px] rounded-xl bg-black/45 border border-white/10 px-4 py-3 outline-none focus:border-fuchsia-300/40 font-mono text-xs fx-focus-ring"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; placeholder: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <label className="text-[11px] uppercase tracking-wider text-white/65">{label}</label>
      <select className="mt-2 w-full rounded-xl bg-black/45 border border-white/10 px-4 py-3 outline-none focus:border-fuchsia-300/40 fx-focus-ring" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

