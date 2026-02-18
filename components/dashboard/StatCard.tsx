export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-violet-500/12 via-fuchsia-500/6 to-transparent p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-300/30 hover:shadow-[0_18px_45px_rgba(168,85,247,0.18)]">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-fuchsia-400/10 blur-2xl" />
      <div className="relative text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">{label}</div>
      <div className="relative mt-2 text-2xl font-semibold sm:text-[1.75rem] gradient-text">{value}</div>
      {hint ? <div className="relative mt-2 text-xs font-medium text-white/65">{hint}</div> : null}
    </div>
  )
}
