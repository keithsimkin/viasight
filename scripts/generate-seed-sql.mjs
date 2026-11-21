import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const schema = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8')
const datasets = JSON.parse(
  fs.readFileSync(path.join(root, '.tmp-db-backup', 'datasets.json'), 'utf8'),
)
const potholes = JSON.parse(
  fs.readFileSync(path.join(root, '.tmp-db-backup', 'potholes.json'), 'utf8'),
)

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL'
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (typeof v === 'object') {
    return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
  }
  return `'${String(v).replace(/'/g, "''")}'`
}

const needed = new Set(potholes.map((p) => p.dataset_id).filter(Boolean))
const byId = new Map(datasets.map((d) => [d.id, d]))
const datasetRows = [...needed].map((id) => {
  const existing = byId.get(id)
  if (existing) return existing
  return {
    id,
    name: `Dataset ${id.slice(0, 8)}`,
    description: 'Restored placeholder',
    record_count: 0,
    is_default: false,
  }
})

const parts = [schema, '', '-- seed datasets', '']
for (const d of datasetRows) {
  parts.push(
    `insert into public.datasets (id, name, description, record_count, is_default) values (${sqlStr(d.id)}, ${sqlStr(d.name)}, ${sqlStr(d.description ?? null)}, ${sqlStr(d.record_count ?? 0)}, ${sqlStr(Boolean(d.is_default))}) on conflict (id) do update set name = excluded.name, record_count = excluded.record_count;`,
  )
}

parts.push('', '-- seed potholes', '')
const cols = [
  'id',
  'pothole_id',
  'dataset_id',
  'latitude',
  'longitude',
  'width_m',
  'length_m',
  'depth_m',
  'confidence',
  'severity',
  'status',
  'detection_timestamp',
  'detection_method',
  'photo_url',
  'photo_path',
  'location_description',
  'road_name',
  'district',
  'assigned_to',
  'repair_priority',
  'estimated_repair_cost',
  'repair_notes',
  'repaired_at',
  'repaired_by',
  'verified_at',
  'verified_by',
  'rejection_reason',
  'metadata',
  'created_at',
  'updated_at',
  'area_sqm',
]

for (const p of potholes) {
  const vals = cols.map((c) => sqlStr(p[c] ?? null)).join(', ')
  parts.push(
    `insert into public.potholes (${cols.join(', ')}) values (${vals}) on conflict (id) do update set confidence = excluded.confidence, severity = excluded.severity, status = excluded.status, latitude = excluded.latitude, longitude = excluded.longitude, road_name = excluded.road_name, district = excluded.district, updated_at = now();`,
  )
}

const out = path.join(root, 'supabase', 'seed-from-backup.sql')
fs.writeFileSync(out, parts.join('\n'))
console.log('wrote', out, 'bytes', fs.statSync(out).size)
