export type DbSeverity = 'low' | 'moderate' | 'high' | 'patch'
export type DbStatus =
  | 'detected'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'repaired'
  | 'rejected'

export type DbPothole = {
  id: string
  pothole_id: number
  dataset_id: string
  latitude: number
  longitude: number
  width_m: number
  length_m: number
  depth_m: number | null
  confidence: number
  severity: DbSeverity | null
  status: DbStatus
  detection_timestamp: string
  detection_method: string | null
  photo_url: string | null
  photo_path: string | null
  location_description: string | null
  road_name: string | null
  district: string | null
  assigned_to: string | null
  repair_priority: number | null
  estimated_repair_cost: number | null
  repair_notes: string | null
  repaired_at: string | null
  repaired_by: string | null
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
  area_sqm: number | null
}

export type Database = {
  public: {
    Tables: {
      potholes: {
        Row: DbPothole
        Insert: Partial<DbPothole> &
          Pick<
            DbPothole,
            | 'pothole_id'
            | 'latitude'
            | 'longitude'
            | 'width_m'
            | 'length_m'
            | 'confidence'
            | 'detection_timestamp'
          >
        Update: Partial<DbPothole>
        Relationships: []
      }
      datasets: {
        Row: {
          id: string
          name: string
          description: string | null
          record_count: number | null
          last_updated: string | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          record_count?: number | null
          is_default?: boolean | null
        }
        Update: Partial<Database['public']['Tables']['datasets']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
