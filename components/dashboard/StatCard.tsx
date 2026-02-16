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
    <div className="card p-5 fx-hover-lift fx-fade-in">
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
      <div className="text-3xl font-bold mt-2 gradient-text">{value}</div>
      {hint ? <div className="text-xs text-white/60 mt-2">{hint}</div> : null}
    </div>
  )
}
