import { createContext, useContext, type ReactNode } from 'react'
import { usePotholes } from '../hooks/usePotholes'
import type { Pothole } from '../types'

type Value = {
  items: Pothole[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const PotholesContext = createContext<Value | null>(null)

export function PotholesProvider({ children }: { children: ReactNode }) {
  const value = usePotholes()
  return (
    <PotholesContext.Provider value={value}>{children}</PotholesContext.Provider>
  )
}

export function usePotholesContext() {
  const ctx = useContext(PotholesContext)
  if (!ctx) throw new Error('usePotholesContext requires PotholesProvider')
  return ctx
}
