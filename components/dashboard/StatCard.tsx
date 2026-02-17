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
    <div className="card p-5 fx-hover-lift fx-fade-in rounded-2xl">
      <div className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</div>
      <div className="text-2xl sm:text-[1.75rem] font-semibold mt-2 gradient-text">{value}</div>
      {hint ? <div className="text-xs text-white/60 mt-2 font-medium">{hint}</div> : null}
    </div>
  )
}
