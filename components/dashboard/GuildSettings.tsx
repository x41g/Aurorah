'use client'

import { useEffect, useMemo, useState } from 'react'
import type { GuildConfig } from '@/lib/types'
import { Tooltip } from '@/components/ui/Tooltip'


type Props = { guildId: string; initial: GuildConfig }

function asArray(v: string) {
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function GuildSettings({ guildId, initial }: Props) {
  const [panelImageUrl, setPanelImageUrl] = useState(initial.panelImageUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [staffRoleId, setStaffRoleId] = useState(initial.staffRoleId ?? '')
  const [ticketCategoryId, setTicketCategoryId] = useState(initial.ticketCategoryId ?? '')
  const [logsChannelId, setLogsChannelId] = useState(initial.logsChannelId ?? '')
  const [panelChannelId, setPanelChannelId] = useState(initial.panelChannelId ?? '')
  const [transcriptEnabled, setTranscriptEnabled] = useState(Boolean(initial.transcriptEnabled))
  const [transcriptTtlDays, setTranscriptTtlDays] = useState(String(initial.transcriptTtlDays ?? 30))
  const [allowOpenRoleIds, setAllowOpenRoleIds] = useState((initial.allowOpenRoleIds ?? []).join(', '))
  const [maxOpenTicketsPerUser, setMaxOpenTicketsPerUser] = useState(String(initial.maxOpenTicketsPerUser ?? 1))
  const [cooldownSeconds, setCooldownSeconds] = useState(String(initial.cooldownSeconds ?? 0))
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

const categoryOptions = channels
  .filter((c) => c.type === 4) // 4 = categoria
  .map((c) => ({ value: c.id, label: c.name }))

const textChannelOptions = channels
  .filter((c) => c.type === 0) // 0 = canal texto
  .map((c) => ({ value: c.id, label: c.name }))


  const preview = useMemo(() => {
    const cfg: GuildConfig = {
      panelImageUrl: panelImageUrl || undefined,
      staffRoleId: staffRoleId || undefined,
      ticketCategoryId: ticketCategoryId || undefined,
      logsChannelId: logsChannelId || undefined,
      panelChannelId: panelChannelId || undefined,
      transcriptEnabled,
      transcriptTtlDays: Number(transcriptTtlDays || 0) || undefined,
      allowOpenRoleIds: asArray(allowOpenRoleIds),
      maxOpenTicketsPerUser: Number(maxOpenTicketsPerUser || 0) || undefined,
      cooldownSeconds: Number(cooldownSeconds || 0) || undefined,
    }
    return cfg
  }, [
    allowOpenRoleIds,
    cooldownSeconds,
    logsChannelId,
    maxOpenTicketsPerUser,
    panelChannelId,
    staffRoleId,
    ticketCategoryId,
    transcriptEnabled,
    transcriptTtlDays,
  ])

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
        setErr('Falha ao salvar. Verifique suas permissões e tente novamente.')
        return
      }
      setOk('Salvo com sucesso.')
    } catch {
      setErr('Falha de rede.')
    } finally {
      setSaving(false)
    }
  }

<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
  <label className="text-xs text-white/60">Imagem do Painel (URL)</label>
  <input
    className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
    value={panelImageUrl}
    onChange={(e) => setPanelImageUrl(e.target.value)}
    placeholder="https://..."
  />
  <p className="mt-2 text-xs text-white/50">
    Dica: use PNG/JPG. Recomendado 512x512.
  </p>
</div>

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-2">Configurações</h2>
      <p className="text-white/60 mb-6">Cole IDs do Discord (canais, cargos e categorias).</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
  <label className="text-xs text-white/60">Cargo Staff</label>
  <select
    className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
    value={staffRoleId}
    onChange={(e) => setStaffRoleId(e.target.value)}
  >
    <option value="">Selecione um cargo</option>
    {roleOptions.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
  <label className="text-xs text-white/60">Categoria de Tickets</label>
  <select
    className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
    value={ticketCategoryId}
    onChange={(e) => setTicketCategoryId(e.target.value)}
  >
    <option value="">Selecione uma categoria</option>
    {categoryOptions.map((o) => (
      <option key={o.value} value={o.value}>
        📁 {o.label}
      </option>
    ))}
  </select>
</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs text-white/60">Canal de Logs (Channel ID)</label>
        <select
    className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
    value={logsChannelId}
    onChange={(e) => setLogsChannelId(e.target.value)}
  >
    <option value="">Selecione um canal</option>
    {textChannelOptions.map((o) => (
      <option key={o.value} value={o.value}>
        # {o.label}
      </option>
    ))}
  </select>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

  <label className="text-xs text-white/60">Canal do Painel</label>
  <select
    className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
    value={panelChannelId}
    onChange={(e) => setPanelChannelId(e.target.value)}
  >
    <option value="">Selecione um canal</option>
    {textChannelOptions.map((o) => (
      <option key={o.value} value={o.value}>
        # {o.label}
      </option>
    ))}
  </select>
</div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Transcripts</div>
              <div className="text-xs text-white/60">Salvar link de transcript no site</div>
            </div>
            <button
              type="button"
              className={['px-4 py-2 rounded-2xl border transition', transcriptEnabled ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/10'].join(
                ' '
              )}
              onClick={() => setTranscriptEnabled((v) => !v)}
            >
              {transcriptEnabled ? 'Ativo' : 'Desativado'}
            </button>
          </div>

          <div className="mt-4">
            <label className="text-xs text-white/60">Expiração (dias)</label>
            <input
              className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
              value={transcriptTtlDays}
              onChange={(e) => setTranscriptTtlDays(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        <Field
          label="Cargos que podem abrir ticket (separados por vírgula)"
          value={allowOpenRoleIds}
          onChange={setAllowOpenRoleIds}
          hint="Ex: 12345, 67890"
        />
        <Field label="Máximo de tickets abertos por usuário"
        value={maxOpenTicketsPerUser}
        onChange={setMaxOpenTicketsPerUser}
        hint="Quantos tickets um usuário pode ter aberto ao mesmo tempo?"
        />
        <Field label="Tempo de espera por usuário"
        value={cooldownSeconds}
         onChange={setCooldownSeconds}
          hint="Tempo de espera entre abertura de tickets por usuário (em segundos)"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button type="button" className="btn-primary px-6 py-3 rounded-2xl disabled:opacity-60" onClick={save} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </button>

        {ok ? <span className="text-sm text-emerald-300">{ok}</span> : null}
        {err ? <span className="text-sm text-red-300">{err}</span> : null}
      </div>

      <div className="mt-6">
        <details className="text-sm text-white/70">
          <summary className="cursor-pointer select-none">Preview do JSON</summary>
          <pre className="mt-3 p-4 rounded-2xl bg-black/50 border border-white/10 overflow-auto text-xs">{JSON.stringify(preview, null, 2)}</pre>
        </details>
      </div>

    </div>
    
  )
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <label className="flex items-center gap-2 text-xs text-white/60">
        {label}
        {hint ? <Tooltip text={hint} /> : null}
      </label>

      <input
        className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
