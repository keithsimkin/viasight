import type { Severity, PotholeStatus } from '../types'

export function severityLabel(s: Severity): string {
  return s.toUpperCase()
}

export function statusLabel(s: PotholeStatus): string {
  return s.replace(/_/g, ' ').toUpperCase()
}

export function confidencePct(n: number): string {
  return `${Math.round(n * 100)}%`
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function severityTone(s: Severity): {
  badge: string
  dot: string
  soft: string
} {
  if (s === 'high') {
    return {
      badge: 'bg-[var(--vs-red-soft)] text-[var(--vs-red)]',
      dot: 'bg-[var(--vs-red)]',
      soft: 'text-[var(--vs-red)]',
    }
  }
  if (s === 'medium') {
    return {
      badge: 'bg-[var(--vs-amber-soft)] text-[var(--vs-amber)]',
      dot: 'bg-[var(--vs-amber)]',
      soft: 'text-[var(--vs-amber)]',
    }
  }
  return {
    badge: 'bg-[var(--vs-green-soft)] text-[var(--vs-green)]',
    dot: 'bg-[var(--vs-green)]',
    soft: 'text-[var(--vs-green)]',
  }
}

export function statusTone(s: PotholeStatus): string {
  if (s === 'detected') return 'bg-[var(--vs-green-soft)] text-[var(--vs-green)]'
  if (s === 'verified' || s === 'repaired') return 'bg-slate-100 text-slate-600'
  if (s === 'rejected') return 'bg-[var(--vs-red-soft)] text-[var(--vs-red)]'
  return 'bg-[var(--vs-amber-soft)] text-[var(--vs-amber)]'
}
