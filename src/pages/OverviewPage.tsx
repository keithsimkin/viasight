import { useEffect, useMemo, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { PotholeList } from '../components/PotholeList'
import { PotholeMap } from '../components/PotholeMap'
import { DetailPanel } from '../components/DetailPanel'
import { useOutletPanels } from '../hooks/useOutletPanels'
import { usePotholesContext } from '../context/PotholesProvider'

export function OverviewPage() {
  const panels = useOutletPanels()
  const { items, loading, error } = usePotholesContext()
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    if (!selectedId && items[0]) setSelectedId(items[0].id)
  }, [items, selectedId])

  const selected = useMemo(
    () => items.find((p) => p.id === selectedId),
    [items, selectedId],
  )

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-[14px] text-slate-500">
        Loading potholes from Supabase…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[14px] text-red-600">
        Failed to load potholes: {error}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      <PotholeList
        items={items}
        selectedId={selectedId}
        onSelect={setSelectedId}
        collapsed={panels.listCollapsed}
        onToggle={() => panels.toggle('listCollapsed')}
      />
      <main className="relative min-w-0 flex-1">
        <PotholeMap
          items={items}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id)
            if (panels.detailCollapsed) panels.set({ detailCollapsed: false })
          }}
        />
        <button
          type="button"
          onClick={() =>
            panels.set({
              listCollapsed: true,
              detailCollapsed: true,
              sidebarCollapsed: true,
            })
          }
          className="absolute bottom-4 left-4 z-[500] inline-flex items-center gap-1.5 rounded-lg border border-[var(--vs-line)] bg-white/95 px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm backdrop-blur hover:bg-white"
          title="Focus map — collapse all panels"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Focus map
        </button>
        <DetailPanel
          pothole={selected}
          collapsed={panels.detailCollapsed}
          onToggle={() => panels.toggle('detailCollapsed')}
        />
      </main>
    </div>
  )
}
