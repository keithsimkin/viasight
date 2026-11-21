import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { Pothole, Severity } from '../types'
import { confidencePct, severityLabel } from '../lib/format'

type Props = {
  items: Pothole[]
  selectedId: string
  onSelect: (id: string) => void
}

const SEVERITY_COLOR: Record<Severity, string> = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#16a34a',
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

function markerIcon(severity: Severity, selected: boolean) {
  const color = SEVERITY_COLOR[severity]
  const size = selected ? 18 : 14
  return L.divIcon({
    className: '',
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
    html: `<div class="${selected ? 'vs-marker-pulse' : ''}" style="position:relative;width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center;color:${color}">
      <span style="width:${size}px;height:${size}px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(15,23,42,.35)"></span>
    </div>`,
  })
}

function FlyToSelected({ item }: { item: Pothole | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!item) return
    map.flyTo([item.lat, item.lng], Math.max(map.getZoom(), 14), {
      duration: 0.65,
    })
  }, [item, map])
  return null
}

export function PotholeMap({ items, selectedId, onSelect }: Props) {
  const selected = useMemo(
    () => items.find((p) => p.id === selectedId),
    [items, selectedId],
  )

  const tile = MAPBOX_TOKEN
    ? {
        url: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 512,
        zoomOffset: -1,
      }
    : {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 256,
        zoomOffset: 0,
      }

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[0.3476, 32.5825]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution={tile.attribution}
          url={tile.url}
          tileSize={tile.tileSize}
          zoomOffset={tile.zoomOffset}
        />
        <FlyToSelected item={selected} />
        {items.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={markerIcon(p.severity, p.id === selectedId)}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Popup>
              <div className="min-w-[140px] font-[family-name:var(--font-sans)]">
                <p className="m-0 text-[13px] font-bold">{p.code}</p>
                <p className="m-0 mt-0.5 text-[12px] text-slate-500">
                  {p.road} · {confidencePct(p.confidence)}
                </p>
                <p className="m-0 mt-1 text-[11px] font-semibold uppercase">
                  {severityLabel(p.severity)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute top-4 left-4 z-[500] rounded-lg border border-[var(--vs-line)] bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          Coverage
        </p>
        <p className="text-[13px] font-bold text-slate-900">Kampala, Uganda</p>
        <p className="text-[10px] font-medium text-slate-400">
          {MAPBOX_TOKEN ? 'Mapbox light' : 'OpenStreetMap'}
        </p>
      </div>
    </div>
  )
}
