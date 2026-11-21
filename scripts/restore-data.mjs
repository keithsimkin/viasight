/**
 * Assumes schema already applied. Upserts datasets + potholes with service role.
 * Usage: SUPABASE_SERVICE_KEY_FILE=... node scripts/restore-data.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const root = path.resolve(import.meta.dirname, '..')
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const url = env.VITE_SUPABASE_URL
const serviceKey = fs.readFileSync(process.env.SUPABASE_SERVICE_KEY_FILE, 'utf8').trim()
const datasets = JSON.parse(
  fs.readFileSync(path.join(root, '.tmp-db-backup', 'datasets.json'), 'utf8'),
)
const potholes = JSON.parse(
  fs.readFileSync(path.join(root, '.tmp-db-backup', 'potholes.json'), 'utf8'),
)

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const needed = new Set(potholes.map((p) => p.dataset_id).filter(Boolean))
  const byId = new Map(datasets.map((d) => [d.id, d]))
  const datasetRows = [...needed].map((id) => {
    const existing = byId.get(id)
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        description: existing.description,
        record_count: existing.record_count ?? 0,
        is_default: Boolean(existing.is_default),
      }
    }
    return {
      id,
      name: `Dataset ${id.slice(0, 8)}`,
      description: 'Restored placeholder',
      record_count: 0,
      is_default: false,
    }
  })

  console.log(`Upserting ${datasetRows.length} datasets…`)
  for (const batch of chunk(datasetRows, 50)) {
    const { error } = await admin.from('datasets').upsert(batch, { onConflict: 'id' })
    if (error) throw error
  }

  const clean = potholes.map((p) => ({
    id: p.id,
    pothole_id: p.pothole_id,
    dataset_id: p.dataset_id,
    latitude: p.latitude,
    longitude: p.longitude,
    width_m: p.width_m,
    length_m: p.length_m,
    depth_m: p.depth_m,
    confidence: p.confidence,
    severity: p.severity,
    status: p.status ?? 'detected',
    detection_timestamp: p.detection_timestamp,
    detection_method: p.detection_method,
    photo_url: p.photo_url,
    photo_path: p.photo_path,
    location_description: p.location_description,
    road_name: p.road_name,
    district: p.district,
    assigned_to: p.assigned_to,
    repair_priority: p.repair_priority,
    estimated_repair_cost: p.estimated_repair_cost,
    repair_notes: p.repair_notes,
    repaired_at: p.repaired_at,
    repaired_by: p.repaired_by,
    verified_at: p.verified_at,
    verified_by: p.verified_by,
    rejection_reason: p.rejection_reason,
    metadata: p.metadata ?? {},
    created_at: p.created_at,
    updated_at: p.updated_at,
    area_sqm: p.area_sqm,
  }))

  console.log(`Upserting ${clean.length} potholes…`)
  for (const [i, batch] of chunk(clean, 80).entries()) {
    const { error } = await admin.from('potholes').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error('batch', i, error)
      throw error
    }
    process.stdout.write('.')
  }
  console.log('')

  const email = 'demo@viasight.app'
  const password = 'ViaSightDemo2026!'
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listed.error) throw listed.error
  let user = listed.data.users.find((u) => u.email === email)
  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'ViaSight Demo', role: 'ops' },
    })
    if (created.error) throw created.error
    user = created.data.user
    console.log('Created demo user', user.id)
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    })
    if (updated.error) throw updated.error
    console.log('Updated demo user', user.id)
  }

  const { count, error } = await admin
    .from('potholes')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  console.log('Done. potholes =', count)
  console.log(`Sign in with ${email} / ${password}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
