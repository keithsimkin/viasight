import { useOutletContext } from 'react-router-dom'
import type { usePanelState } from './usePanelState'

export type PanelControls = ReturnType<typeof usePanelState>

export function useOutletPanels() {
  return useOutletContext<PanelControls>()
}
