import { useEffect, useMemo, useState } from 'react'
import { PotholeMap } from '../components/PotholeMap'
import { DetailPanel } from '../components/DetailPanel'
import { useOutletPanels } from '../hooks/useOutletPanels'
import { PageHeader } from '../components/PageHeader'
import { usePotholesContext } from '../context/PotholesProvider'

export function LiveMapPage() {
  const panels = useOutletPanels()
  const { items, loading, error } = usePotholesContext()
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    panels.set({ listCollapsed: true, detailCollapsed: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId && items[0]) setSelectedId(items[0].id)
  }, [items, selectedId])

  const selected = useMemo(
    () => items.find((p) => p.id === selectedId),
    [items, selectedId],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Live map"
        subtitle={
          loading
            ? 'Loading…'
            : error
              ? error
              : `${items.length} potholes from Supabase · Kampala`
        }
      />
      <div className="relative min-h-0 flex-1">
        {!loading && !error ? (
          <>
            <PotholeMap
              items={items}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                panels.set({ detailCollapsed: false })
              }}
            />
            <DetailPanel
              pothole={selected}
              collapsed={panels.detailCollapsed}
              onToggle={() => panels.toggle('detailCollapsed')}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[14px] text-slate-500">
            {loading ? 'Loading map…' : error}
          </div>
        )}
      </div>
    </div>
  )
}
