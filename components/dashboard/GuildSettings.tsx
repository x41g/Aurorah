'use client'

import { useMemo, useState } from 'react'
import type { GuildConfig } from '@/lib/types'



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
        <Field label="Cargo Staff (Role ID)" value={staffRoleId} onChange={setStaffRoleId} />
        <Field label="Categoria de Tickets (Category ID)" value={ticketCategoryId} onChange={setTicketCategoryId} />
        <Field label="Canal de Logs (Channel ID)" value={logsChannelId} onChange={setLogsChannelId} />
        <Field label="Canal do Painel (Channel ID)" value={panelChannelId} onChange={setPanelChannelId} />

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
          label="Roles que podem abrir ticket (Role IDs, separados por vírgula)"
          value={allowOpenRoleIds}
          onChange={setAllowOpenRoleIds}
        />
        <Field label="Máx tickets abertos por usuário" value={maxOpenTicketsPerUser} onChange={setMaxOpenTicketsPerUser} />
        <Field label="Cooldown (segundos) por usuário" value={cooldownSeconds} onChange={setCooldownSeconds} />
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

    </div>
    
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <label className="text-xs text-white/60">{label}</label>
      <input
        className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
