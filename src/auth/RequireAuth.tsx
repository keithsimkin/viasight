import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--vs-bg)] text-[14px] text-slate-500">
        Loading session…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return children
}
