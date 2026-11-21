import { useCallback, useEffect, useState } from 'react'

type PanelState = {
  sidebarCollapsed: boolean
  listCollapsed: boolean
  detailCollapsed: boolean
}

const KEY = 'viasight.panels'
const DEFAULTS: PanelState = {
  sidebarCollapsed: false,
  listCollapsed: false,
  detailCollapsed: false,
}

function read(): PanelState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function usePanelState() {
  const [state, setState] = useState<PanelState>(read)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const toggle = useCallback((key: keyof PanelState) => {
    setState((s) => ({ ...s, [key]: !s[key] }))
  }, [])

  const set = useCallback((patch: Partial<PanelState>) => {
    setState((s) => ({ ...s, ...patch }))
  }, [])

  return { ...state, toggle, set }
}
