import { CHANGELOG_ENTRIES } from '@/lib/changelog'

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black gradient-text">Novidades e Atualizacoes</h1>
        <p className="mt-2 text-white/70">Historico das melhorias do bot e dashboard.</p>
      </div>

      <div className="space-y-4">
        {CHANGELOG_ENTRIES.map((entry) => (
          <section key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-300/15 px-2.5 py-1 text-xs font-semibold text-fuchsia-100">
                V{entry.version}
              </span>
              <span className="text-xs text-white/60">{entry.date}</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">{entry.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {entry.items.map((item, idx) => (
                <li key={`${entry.id}-${idx}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
