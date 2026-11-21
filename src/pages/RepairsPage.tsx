import { PageHeader } from '../components/PageHeader'
import { usePotholesContext } from '../context/PotholesProvider'
import { severityTone } from '../lib/format'

export function RepairsPage() {
  const { items, loading, error } = usePotholesContext()
  const queue = items
    .filter((p) => p.severity !== 'low' || p.status === 'assigned' || p.status === 'in_progress')
    .slice(0, 24)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Repairs"
        subtitle="Priority queue from live detections (confidence + severity)"
      />
      <div className="vs-scroll flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-[14px] text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-[14px] text-red-600">{error}</p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {queue.map((p, i) => {
              const tone = severityTone(p.severity)
              const stage =
                p.status === 'in_progress'
                  ? 'In progress'
                  : p.status === 'assigned'
                    ? 'Assigned'
                    : p.status === 'repaired'
                      ? 'Repaired'
                      : 'Queued'
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-[var(--vs-line)] bg-white p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">
                        {p.code}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        {p.road} · {p.area}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tone.badge}`}
                    >
                      {p.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${Math.round(p.confidence * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-slate-600">{stage}</span>
                    <span className="text-slate-400">
                      Confidence {Math.round(p.confidence * 100)}% · Priority{' '}
                      {Math.min(10, Math.max(1, Math.round(p.confidence * 10)))}
                    </span>
                  </div>
                  {i === 0 && queue.length === 0 ? null : null}
                </article>
              )
            })}
            {queue.length === 0 ? (
              <p className="text-[14px] text-slate-500">No repair candidates.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
