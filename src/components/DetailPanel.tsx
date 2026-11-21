import type { ReactNode } from 'react'
import {
  MapPin,
  Gauge,
  ShieldAlert,
  Phone,
  Image as ImageIcon,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import type { Pothole } from '../types'
import {
  confidencePct,
  relativeTime,
  severityTone,
  statusLabel,
  statusTone,
} from '../lib/format'

type Props = {
  pothole: Pothole | undefined
  collapsed: boolean
  onToggle: () => void
}

const TABS = ['Overview', 'Detect', 'Events', 'History'] as const

export function DetailPanel({ pothole, collapsed, onToggle }: Props) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-4 right-4 z-[600] inline-flex items-center gap-2 rounded-xl border border-[var(--vs-line)] bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-md hover:bg-slate-50"
        aria-label="Show detail panel"
      >
        <PanelRightOpen className="h-4 w-4" />
        {pothole ? pothole.code : 'Details'}
      </button>
    )
  }

  if (!pothole) {
    return (
      <aside className="absolute top-4 right-4 bottom-4 z-[600] flex w-[340px] flex-col items-center justify-center rounded-2xl border border-[var(--vs-line)] bg-white/95 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"
          aria-label="Hide detail panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        <ImageIcon className="mb-2 h-8 w-8 text-slate-300" />
        <p className="text-[13px] text-slate-400">Select a detection</p>
      </aside>
    )
  }

  const tone = severityTone(pothole.severity)

  return (
    <aside className="vs-fade-up absolute top-4 right-4 bottom-4 z-[600] flex w-[340px] flex-col overflow-hidden rounded-2xl border border-[var(--vs-line)] bg-white shadow-xl">
      <header className="border-b border-[var(--vs-line)] px-4 pt-4 pb-3">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              Detection
            </p>
            <h2 className="text-[18px] font-semibold tracking-tight text-slate-900">
              {pothole.code}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-bold ${statusTone(pothole.status)}`}
            >
              {statusLabel(pothole.status)}
            </span>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label="Hide detail panel"
              title="Hide panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold ${
                i === 0
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="vs-scroll flex-1 space-y-4 overflow-y-auto p-4">
        <section>
          <h3 className="mb-2 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
            Location
          </h3>
          <dl className="space-y-2 text-[13px]">
            <Row
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Road"
              value={`${pothole.road}, ${pothole.area}`}
            />
            <Row
              label="Coords"
              value={`${pothole.lat.toFixed(4)}, ${pothole.lng.toFixed(4)}`}
            />
            <Row
              icon={<Gauge className="h-3.5 w-3.5" />}
              label="Confidence"
              value={
                <span className="inline-flex items-center gap-2">
                  {confidencePct(pothole.confidence)}
                  <span className="text-[11px] font-medium text-emerald-600">
                    +{Math.round((pothole.confidence - 0.7) * 100)}%
                  </span>
                </span>
              }
            />
            <Row
              label="Severity"
              value={
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${tone.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  {pothole.severity.toUpperCase()}
                </span>
              }
            />
            <Row label="Seen" value={relativeTime(pothole.createdAt)} />
          </dl>
        </section>

        <section className="rounded-xl border border-[var(--vs-line)] p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                {pothole.reporter
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  {pothole.reporter}
                </p>
                <p className="text-[11px] text-slate-400">Source</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--vs-line)] px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Phone className="h-3 w-3" />
              Dispatch
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Confidence" value={confidencePct(pothole.confidence)} />
            <Stat
              label="Risk"
              value={`${Math.round(pothole.confidence * 100)}`}
              unit="/100"
            />
            <Stat label="Alerts" value={String(pothole.alerts.length)} />
          </div>

          {pothole.alerts.length > 0 ? (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold text-slate-400">
                Alerts by dispatch
              </p>
              <ul className="space-y-1">
                {pothole.alerts.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-[12px] font-medium text-amber-700"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
              Road camera
            </h3>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              AI BOXES
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--vs-line)] bg-slate-900">
            <img
              src={pothole.photoDataUrl}
              alt={`Detection ${pothole.code}`}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="flex gap-1.5 overflow-x-auto bg-slate-950 p-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded-md border ${
                    i === 0
                      ? 'border-emerald-400'
                      : 'border-transparent opacity-60'
                  }`}
                >
                  <img
                    src={pothole.photoDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${20 + i * 20}% 50%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </aside>
  )
}

function Row({
  label,
  value,
  icon,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-1.5 text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="text-[18px] font-semibold tracking-tight text-slate-900">
        {value}
        {unit ? (
          <span className="text-[11px] font-semibold text-slate-400">{unit}</span>
        ) : null}
      </p>
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
    </div>
  )
}
