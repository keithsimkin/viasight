import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { usePanelState } from '../hooks/usePanelState'
import { PotholesProvider, usePotholesContext } from '../context/PotholesProvider'

function ShellInner() {
  const panels = usePanelState()
  const { items } = usePotholesContext()

  return (
    <div className="flex h-full min-h-0 bg-[var(--vs-bg)]">
      <Sidebar
        collapsed={panels.sidebarCollapsed}
        onToggle={() => panels.toggle('sidebarCollapsed')}
        eventsCount={items.length}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet context={panels} />
      </div>
    </div>
  )
}

export function AppShell() {
  return (
    <PotholesProvider>
      <ShellInner />
    </PotholesProvider>
  )
}
