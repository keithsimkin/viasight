import { PageHeader } from '../components/PageHeader'
import { usePotholesContext } from '../context/PotholesProvider'
import {
  confidencePct,
  relativeTime,
  severityTone,
  statusLabel,
  statusTone,
} from '../lib/format'

export function EventsPage() {
  const { items, loading, error } = usePotholesContext()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Events"
        subtitle="Live detection feed from Supabase"
        actions={
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-600">
            {loading ? '…' : `${items.length} events`}
          </span>
        }
      />
      <div className="vs-scroll flex-1 overflow-y-auto p-6">
        {error ? (
          <p className="text-[14px] text-red-600">{error}</p>
        ) : (
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--vs-line)] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[var(--vs-line)] bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 200).map((p) => {
                  const tone = severityTone(p.severity)
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--vs-line)] last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {p.code}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.road}
                        <span className="text-slate-400"> · {p.area}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${statusTone(p.status)}`}
                        >
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tone.badge}`}
                        >
                          {p.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {confidencePct(p.confidence)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {relativeTime(p.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
