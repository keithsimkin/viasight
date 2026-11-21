import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function SignInPage() {
  const { session, loading, signIn } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('demo@viasight.app')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signIn(email.trim(), password)
    if (result.error) setError(result.error)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--vs-bg)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--vs-line)] bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-[15px] font-bold text-emerald-400">
            V
          </div>
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              ViaSight
            </h1>
            <p className="text-[13px] text-slate-500">Sign in to continue</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-slate-500">
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--vs-line)] bg-slate-50 px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-slate-500">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--vs-line)] bg-slate-50 px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-[12px] leading-relaxed text-slate-400">
          Use your ViaSight operator account from Supabase Auth.
        </p>
      </div>
    </div>
  )
}
