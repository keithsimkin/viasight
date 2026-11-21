export type Severity = 'low' | 'medium' | 'high'
export type PotholeStatus =
  | 'detected'
  | 'verified'
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'repaired'
  | 'rejected'

export type Pothole = {
  id: string
  code: string
  road: string
  area: string
  lat: number
  lng: number
  confidence: number
  severity: Severity
  status: PotholeStatus
  photoDataUrl: string
  createdAt: string
  alerts: string[]
  reporter: string
  widthM?: number
  lengthM?: number
  depthM?: number | null
  rawSeverity?: string | null
}
