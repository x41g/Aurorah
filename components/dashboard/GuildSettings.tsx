'use client'

import { useEffect, useMemo, useState } from 'react'
import type { GuildConfig } from '@/lib/types'
import { Tooltip } from '@/components/ui/Tooltip'

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

export function GuildSettings({ guildId, initial, tab = 'panel', entitlements = null }: Props) {
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const canEdit = Boolean(entitlements?.canEditConfig)
  const canUseAI = Boolean(entitlements?.canUseAI)
  const canUsePayments = Boolean(entitlements?.canUsePayments)
  const canUseSafePay = Boolean(entitlements?.canUseSafePay)

  const [staffRoleId, setStaffRoleId] = useState(initial.staffRoleId ?? '')
  const [ticketCategoryId, setTicketCategoryId] = useState(initial.ticketCategoryId ?? '')
  const [logsChannelId, setLogsChannelId] = useState(initial.logsChannelId ?? '')
  const [panelChannelId, setPanelChannelId] = useState(initial.panelChannelId ?? '')

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

  const preview = useMemo(() => {
    const cfg: GuildConfig = {
      staffRoleId: staffRoleId || undefined,
      ticketCategoryId: ticketCategoryId || undefined,
      logsChannelId: logsChannelId || undefined,
      panelChannelId: panelChannelId || undefined,

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
  const aiTabLocked = !canUseAI && tab === 'ai'
  const paymentTabLocked = !canUsePayments && tab === 'payments'
  const safePayTabLocked = !canUseSafePay && tab === 'safepay'

  async function save() {
    setSaving(true)
    setOk(null)
    setErr(null)
    try {
      const r = await fetch(`/api/guild-config/${guildId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(preview),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({} as any))
        if (data?.error === 'subscription_required') {
          setErr('Assinatura necessaria: este plano permite somente leitura de estatisticas.')
        } else if (data?.error === 'prompt_blocked_by_policy') {
          setErr('Prompt bloqueado pela politica de seguranca.')
        } else if (data?.error === 'prompt_too_long') {
          setErr('Prompt muito longo (maximo 4000 caracteres).')
        } else {
          setErr('Falha ao salvar. Verifique suas permissoes e tente novamente.')
        }
        return
      }
      setOk('Salvo com sucesso.')
    } catch {
      setErr('Falha de rede.')
    } finally {
      setSaving(false)
    }
  }

  function toggleBank(bank: string) {
    setSafePayBanksOff((prev) => (prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]))
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-2">Configuração V5</h2>
      <p className="text-white/60 mb-6">As ações do plano ficam inativas quando o benefício não está liberado.</p>

      {ticketTabLocked ? <LockMsg text="Seu plano atual não libera edição de Tickets." /> : null}
      {aiTabLocked ? <LockMsg text="Seu plano atual não libera configuração de IA." /> : null}
      {paymentTabLocked ? <LockMsg text="Seu plano atual não libera configuração de pagamentos." /> : null}
      {safePayTabLocked ? <LockMsg text="Seu plano atual não libera configuração de SafePay." /> : null}

      {tab === 'tickets' ? (
        <fieldset disabled={!canEdit || saving} className="space-y-4 disabled:opacity-60">
          <Section title="Sistema">
            <Toggle label="Sistema de ticket" value={ticketSystemEnabled} onChange={setTicketSystemEnabled} />
            <Toggle label="Modo de abertura (Select)" value={ticketOpenMode === 'select'} onChange={(v) => setTicketOpenMode(v ? 'select' : 'buttons')} />
            <Toggle label="Modo de criação (Tópico)" value={ticketCreateMode === 'thread'} onChange={(v) => setTicketCreateMode(v ? 'thread' : 'category')} />
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Emoji do botão" value={ticketButtonEmoji} onChange={setTicketButtonEmoji} />
              <Field label="Style do botão (1-4)" value={ticketButtonStyle} onChange={setTicketButtonStyle} />
            </div>
          </Section>

          <Section title="Aparencia">
            <Toggle
              label="Usar modo content (desligado = embed)"
              value={ticketAppearanceMode === 'content'}
              onChange={(v) => setTicketAppearanceMode(v ? 'content' : 'embed')}
            />
            {ticketAppearanceMode === 'embed' ? (
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Titulo" value={ticketEmbedTitle} onChange={setTicketEmbedTitle} />
                <Field label="Cor" value={ticketEmbedColor} onChange={setTicketEmbedColor} />
                <Field label="Banner URL" value={ticketEmbedBannerUrl} onChange={setTicketEmbedBannerUrl} />
                <Field label="Miniatura URL" value={ticketEmbedThumbUrl} onChange={setTicketEmbedThumbUrl} />
                <Field label="Descricao" value={ticketEmbedDescription} onChange={setTicketEmbedDescription} className="md:col-span-2" />
              </div>
            ) : (
              <Field label="Conteudo" value={ticketContentText} onChange={setTicketContentText} />
            )}
          </Section>

          <Section title="Funcoes">
            <div className="grid md:grid-cols-2 gap-3">
              <Toggle label="Renomear Ticket" value={featureRenameTicket} onChange={setFeatureRenameTicket} />
              <Toggle label="Notificar Usuario" value={featureNotifyUser} onChange={setFeatureNotifyUser} />
              <Toggle label="Adicionar Usuario" value={featureAddUser} onChange={setFeatureAddUser} />
              <Toggle label="Remover Usuario" value={featureRemoveUser} onChange={setFeatureRemoveUser} />
            </div>
            <JsonField
              label="Categorias do ticket (JSON)"
              value={ticketFunctionsText}
              onChange={setTicketFunctionsText}
              hint='Exemplo: [{"name":"Suporte","preDescription":"Preciso de ajuda","emoji":"??"}]'
            />
          </Section>

          <Section title="Formularios">
            <JsonField
              label="Formularios por categoria (JSON)"
              value={ticketFormsText}
              onChange={setTicketFormsText}
              hint='Exemplo: {"Suporte":{"enabled":true,"title":"Form","questions":[{"id":"q1","label":"Qual seu problema?","style":"SHORT"}]}}'
            />
          </Section>

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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">{ticketContentText || 'Sem content.'}</div>
            )}
          </Section>
        </fieldset>
      ) : tab === 'ai' ? (
        <fieldset disabled={!canUseAI || saving} className="space-y-4 disabled:opacity-60">
          <Section title="IA">
            <Toggle label="IA habilitada" value={aiEnabled} onChange={setAiEnabled} />
            <Field label="Modelo" value={aiModel} onChange={setAiModel} />
            <JsonField label="Prompt da IA" value={aiPrompt} onChange={setAiPrompt} hint="Prompt com validações de segurança no backend." />
          </Section>
          <Section title="Seguranca de Prompt">
            <Toggle label="Remover menções" value={aiStripMentions} onChange={setAiStripMentions} />
            <Toggle label="Remover links" value={aiStripLinks} onChange={setAiStripLinks} />
            <Toggle label="Bloquear hints de jailbreak" value={aiBlockJailbreakHints} onChange={setAiBlockJailbreakHints} />
          </Section>
        </fieldset>
      ) : tab === 'payments' ? (
        <fieldset disabled={!canUsePayments || saving} className="space-y-4 disabled:opacity-60">
          <Section title="Automatico">
            <Toggle label="Pagamento automatico" value={paymentAutoEnabled} onChange={setPaymentAutoEnabled} />
            <Field label="Access token MercadoPago" value={paymentAccessToken} onChange={setPaymentAccessToken} />
          </Section>
          <Section title="Semi-auto">
            <Toggle label="Semi-automatico" value={paymentSemiEnabled} onChange={setPaymentSemiEnabled} />
            <Field label="Chave PIX" value={paymentSemiKey} onChange={setPaymentSemiKey} />
            <Field label="Tipo da chave" value={paymentSemiType} onChange={setPaymentSemiType} />
            <SelectField
              label="Cargo aprovador"
              value={paymentSemiApproverRoleId}
              onChange={setPaymentSemiApproverRoleId}
              options={roleOptions}
              placeholder="Selecione um cargo"
            />
          </Section>
        </fieldset>
      ) : tab === 'safepay' ? (
        <fieldset disabled={!canUseSafePay || saving} className="space-y-4 disabled:opacity-60">
          <Section title="SafePay">
            <Toggle label="SafePay habilitado" value={safePayEnabled} onChange={setSafePayEnabled} />
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              {KNOWN_BANKS.map((bank) => (
                <label key={bank} className="rounded-xl border border-white/10 px-3 py-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={safePayBanksOff.includes(bank)}
                    onChange={() => toggleBank(bank)}
                    className="accent-violet-400"
                  />
                  <span className="text-sm">{bank}</span>
                </label>
              ))}
            </div>
          </Section>
        </fieldset>
      ) : (
        <fieldset disabled={!canEdit || saving} className="grid md:grid-cols-2 gap-4 disabled:opacity-60">
          <SelectField label="Cargo Staff" value={staffRoleId} onChange={setStaffRoleId} options={roleOptions} placeholder="Selecione um cargo" />
          <SelectField label="Categoria de Tickets" value={ticketCategoryId} onChange={setTicketCategoryId} options={categoryOptions} placeholder="Selecione uma categoria" />
          <SelectField label="Canal de Logs" value={logsChannelId} onChange={setLogsChannelId} options={textChannelOptions} placeholder="Selecione um canal" />
          <SelectField label="Canal do Painel" value={panelChannelId} onChange={setPanelChannelId} options={textChannelOptions} placeholder="Selecione um canal" />

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
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <Field label="Expiração (dias)" value={transcriptTtlDays} onChange={setTranscriptTtlDays} />
              <Field label="Max. tickets por usuário" value={maxOpenTicketsPerUser} onChange={setMaxOpenTicketsPerUser} />
              <Field label="Cooldown (segundos)" value={cooldownSeconds} onChange={setCooldownSeconds} />
            </div>
            <Field label="Cargos que podem abrir (IDs separados por vírgula)" value={allowOpenRoleIds} onChange={setAllowOpenRoleIds} className="mt-3" />
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button type="button" className="btn-primary px-6 py-3 rounded-2xl disabled:opacity-60" onClick={save} disabled={saving || (tab === 'ai' && !canUseAI) || ((tab === 'payments') && !canUsePayments) || ((tab === 'safepay') && !canUseSafePay) || ((tab === 'tickets' || tab === 'panel') && !canEdit)}>
          {saving ? 'Salvando...' : 'Salvar'}
        </button>

        {ok ? <span className="text-sm text-emerald-300">{ok}</span> : null}
        {err ? <span className="text-sm text-red-300">{err}</span> : null}
      </div>

      <div className="mt-6">
        <details className="text-sm text-white/70">
          <summary className="cursor-pointer select-none">Preview do JSON final</summary>
          <pre className="mt-3 p-4 rounded-2xl bg-black/50 border border-white/10 overflow-auto text-xs">{JSON.stringify(preview, null, 2)}</pre>
        </details>
      </div>
    </div>
  )
}

function LockMsg({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{text}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={['px-3 py-1 rounded-lg border text-sm', value ? 'bg-emerald-500/20 border-emerald-400/40' : 'bg-white/5 border-white/10'].join(' ')}>
        {value ? 'Sim' : 'Nao'}
      </button>
    </div>
  )
}

function Field({ label, value, onChange, hint, className = '' }: { label: string; value: string; onChange: (v: string) => void; hint?: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>
      <label className="flex items-center gap-2 text-xs text-white/60">
        {label}
        {hint ? <Tooltip text={hint} /> : null}
      </label>
      <input className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function JsonField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <label className="flex items-center gap-2 text-xs text-white/60">
        {label}
        {hint ? <Tooltip text={hint} /> : null}
      </label>
      <textarea
        className="mt-2 w-full min-h-[140px] rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25 font-mono text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; placeholder: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <label className="text-xs text-white/60">{label}</label>
      <select className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25" value={value} onChange={(e) => onChange(e.target.value)}>
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

