import type { DbPothole, DbSeverity, DbStatus } from '../types/database'
import type { Pothole, PotholeStatus, Severity } from '../types'

function roadPhoto(seed: number, label: string): string {
  const hues = [35, 28, 42, 22, 48]
  const h = hues[Math.abs(seed) % hues.length]
  const cx = 40 + (Math.abs(seed) % 5) * 8
  const cy = 45 + (Math.abs(seed) % 4) * 6
  const rx = 18 + (Math.abs(seed) % 3) * 4
  const ry = 10 + (Math.abs(seed) % 3) * 3
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${h},12%,28%)"/>
      <stop offset="100%" stop-color="hsl(${h},10%,18%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <ellipse cx="${cx * 4}" cy="${cy * 3.5}" rx="${rx * 3}" ry="${ry * 2.5}" fill="#1a1a1a" opacity="0.85"/>
  <ellipse cx="${cx * 4 + 12}" cy="${cy * 3.5 + 4}" rx="${rx * 1.6}" ry="${ry * 1.2}" fill="#0d0d0d"/>
  <rect x="24" y="24" width="220" height="36" rx="8" fill="rgba(0,0,0,0.45)"/>
  <text x="36" y="48" fill="#fff" font-family="IBM Plex Sans,sans-serif" font-size="16" font-weight="600">${label.replace(/[<>&]/g, '')}</text>
  <rect x="${cx * 4 - rx * 3 - 8}" y="${cy * 3.5 - ry * 2.5 - 8}" width="${rx * 6 + 16}" height="${ry * 5 + 16}" fill="none" stroke="#22c55e" stroke-width="3" rx="4"/>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function mapDbSeverity(s: DbSeverity | string | null | undefined, confidence: number): Severity {
  if (s === 'high') return 'high'
  if (s === 'moderate' || s === 'medium') return 'medium'
  if (s === 'low' || s === 'patch') return 'low'
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.75) return 'medium'
  return 'low'
}

export function mapDbStatus(s: DbStatus | string | null | undefined): PotholeStatus {
  if (
    s === 'detected' ||
    s === 'verified' ||
    s === 'assigned' ||
    s === 'in_progress' ||
    s === 'repaired' ||
    s === 'rejected'
  ) {
    return s
  }
  if (s === 'queued') return 'queued'
  return 'detected'
}

export function severityFromConfidence(confidence: number): Severity {
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.75) return 'medium'
  return 'low'
}

export function dbSeverityFromConfidence(confidence: number): DbSeverity {
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.75) return 'moderate'
  return 'low'
}

export function mapDbPothole(row: DbPothole): Pothole {
  const road = row.road_name?.trim() || row.location_description?.trim() || 'Unnamed road'
  const area = row.district?.trim() || 'Kampala'
  const code = `PH-${row.pothole_id}`
  const alerts: string[] = []
  const severity = mapDbSeverity(row.severity, row.confidence)
  if (severity === 'high') alerts.push('HIGH SEVERITY')
  if ((row.depth_m ?? 0) >= 8) alerts.push('DEEP CRATER')
  if ((row.width_m ?? 0) >= 80) alerts.push('LANE HAZARD')

  return {
    id: row.id,
    code,
    road,
    area,
    lat: row.latitude,
    lng: row.longitude,
    confidence: row.confidence,
    severity,
    status: mapDbStatus(row.status),
    photoDataUrl: row.photo_url || roadPhoto(row.pothole_id, road.slice(0, 28)),
    createdAt: row.detection_timestamp || row.created_at || new Date().toISOString(),
    alerts,
    reporter: row.detection_method === 'ai_vision' ? 'AI vision' : row.detection_method || 'System',
    widthM: row.width_m,
    lengthM: row.length_m,
    depthM: row.depth_m,
    rawSeverity: row.severity,
  }
}
