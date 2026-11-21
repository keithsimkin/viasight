import { AlertTriangle, Gauge, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { Pothole } from '../types'
import {
  confidencePct,
  relativeTime,
  severityTone,
  statusLabel,
  statusTone,
} from '../lib/format'

type Props = {
  items: Pothole[]
  selectedId: string
  onSelect: (id: string) => void
  collapsed: boolean
  onToggle: () => void
}

export function PotholeList({
  items,
  selectedId,
  onSelect,
  collapsed,
  onToggle,
}: Props) {
  if (collapsed) {
    return (
      <div className="flex h-full w-10 shrink-0 flex-col items-center border-r border-[var(--vs-line)] bg-white py-3">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Show detections list"
          title="Show detections"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <span
          className="mt-3 text-[10px] font-semibold tracking-wide text-slate-400"
          style={{ writingMode: 'vertical-rl' }}
        >
          {items.length} detections
        </span>
      </div>
    )
  }

  return (
    <section className="flex h-full w-[300px] shrink-0 flex-col border-r border-[var(--vs-line)] bg-white">
      <header className="border-b border-[var(--vs-line)] px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[15px] font-semibold text-slate-900">
                Detections
              </h2>
              <span className="text-[12px] font-medium text-slate-400">
                {items.length}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-400">
              Kampala · Supabase live
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Hide detections list"
            title="Hide list"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="vs-scroll flex-1 space-y-2 overflow-y-auto p-3">
        {items.map((p, i) => {
          const selected = p.id === selectedId
          const tone = severityTone(p.severity)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`vs-fade-up w-full rounded-xl border p-3 text-left transition-all ${
                selected
                  ? 'border-slate-900 bg-slate-50 shadow-sm'
                  : 'border-[var(--vs-line)] bg-white hover:border-slate-300'
              }`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                    {p.code}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {p.road} · {p.area}
                  </p>
                </div>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${statusTone(p.status)}`}
                >
                  {statusLabel(p.status)}
                </span>
              </div>

              <div className="mb-2 flex items-center gap-3 text-[12px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  {confidencePct(p.confidence)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tone.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  {p.severity.toUpperCase()}
                </span>
                <span className="ml-auto text-slate-400">
                  {relativeTime(p.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12px] text-slate-400">{p.reporter}</p>
                {p.alerts.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {p.alerts[0]}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-300">
                    ON SCHEDULE
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
