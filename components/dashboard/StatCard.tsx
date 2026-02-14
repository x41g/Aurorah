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
    <div className="card p-5">
      <div className="text-sm text-white/60">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      {hint ? <div className="text-xs text-white/50 mt-2">{hint}</div> : null}
    </div>
  )
}
