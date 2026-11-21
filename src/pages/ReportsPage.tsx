import { PageHeader } from '../components/PageHeader'
import { usePotholesContext } from '../context/PotholesProvider'

export function ReportsPage() {
  const { items, loading, error } = usePotholesContext()
  const high = items.filter((p) => p.severity === 'high').length
  const medium = items.filter((p) => p.severity === 'medium').length
  const low = items.filter((p) => p.severity === 'low').length
  const verified = items.filter((p) => p.status === 'verified').length
  const avg =
    items.length === 0
      ? 0
      : items.reduce((s, p) => s + p.confidence, 0) / items.length

  const cards = [
    { label: 'Total detections', value: String(items.length) },
    { label: 'High severity', value: String(high) },
    { label: 'Verified', value: String(verified) },
    { label: 'Avg confidence', value: `${Math.round(avg * 100)}%` },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Reports"
        subtitle="Rollups from live Supabase potholes"
      />
      <div className="vs-scroll flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-[14px] text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-[14px] text-red-600">{error}</p>
        ) : (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl border border-[var(--vs-line)] bg-white p-4"
                >
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                    {c.label}
                  </p>
                  <p className="mt-2 text-[28px] font-semibold tracking-tight text-slate-900">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-[var(--vs-line)] bg-white p-5">
              <h2 className="mb-4 text-[14px] font-semibold text-slate-900">
                Severity mix
              </h2>
              <div className="space-y-3">
                <Bar label="High" count={high} total={items.length || 1} color="bg-red-500" />
                <Bar label="Medium" count={medium} total={items.length || 1} color="bg-amber-500" />
                <Bar label="Low" count={low} total={items.length || 1} color="bg-emerald-500" />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function Bar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = Math.round((count / total) * 100)
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12px]">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-400">
          {count} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
