import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="flex items-end justify-between gap-4 border-b border-[var(--vs-line)] bg-white px-6 py-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
