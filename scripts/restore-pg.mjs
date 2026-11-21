import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'
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

const projectRef = new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0]
const password = fs.readFileSync(process.env.SUPABASE_DB_PASSWORD_FILE, 'utf8').trim()
const serviceKey = fs.readFileSync(process.env.SUPABASE_SERVICE_KEY_FILE, 'utf8').trim()
const schemaSql = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8')
const datasets = JSON.parse(
  fs.readFileSync(path.join(root, '.tmp-db-backup', 'datasets.json'), 'utf8'),
)
const potholes = JSON.parse(
  fs.readFileSync(path.join(root, '.tmp-db-backup', 'potholes.json'), 'utf8'),
)

const candidates = [
  {
    name: 'pooler-session',
    connectionString: `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  },
  {
    name: 'pooler-transaction',
    connectionString: `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  },
  {
    name: 'direct',
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  },
]

async function connect() {
  let lastErr
  for (const c of candidates) {
    const client = new pg.Client({
      connectionString: c.connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    })
    try {
      console.log('Trying', c.name, '…')
      await client.connect()
      const { rows } = await client.query('select current_database() as db, current_user as usr')
      console.log('Connected via', c.name, rows[0])
      return client
    } catch (err) {
      lastErr = err
      console.warn('Failed', c.name, err.message)
      try {
        await client.end()
      } catch {
        /* ignore */
      }
    }
  }
  throw lastErr
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const client = await connect()
  try {
    console.log('Applying schema…')
    await client.query(schemaSql)
    console.log('Schema applied')

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
    for (const d of datasetRows) {
      await client.query(
        `insert into public.datasets (id, name, description, record_count, is_default)
         values ($1,$2,$3,$4,$5)
         on conflict (id) do update set
           name = excluded.name,
           description = excluded.description,
           record_count = excluded.record_count,
           is_default = excluded.is_default,
           updated_at = now()`,
        [d.id, d.name, d.description, d.record_count, d.is_default],
      )
    }

    console.log(`Upserting ${potholes.length} potholes…`)
    let n = 0
    for (const batch of chunk(potholes, 50)) {
      await client.query('begin')
      try {
        for (const p of batch) {
          await client.query(
            `insert into public.potholes (
              id, pothole_id, dataset_id, latitude, longitude, width_m, length_m, depth_m,
              confidence, severity, status, detection_timestamp, detection_method,
              photo_url, photo_path, location_description, road_name, district,
              assigned_to, repair_priority, estimated_repair_cost, repair_notes,
              repaired_at, repaired_by, verified_at, verified_by, rejection_reason,
              metadata, created_at, updated_at, area_sqm
            ) values (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28::jsonb,$29,$30,$31
            )
            on conflict (id) do update set
              confidence = excluded.confidence,
              severity = excluded.severity,
              status = excluded.status,
              latitude = excluded.latitude,
              longitude = excluded.longitude,
              road_name = excluded.road_name,
              district = excluded.district,
              metadata = excluded.metadata,
              updated_at = now()`,
            [
              p.id,
              p.pothole_id,
              p.dataset_id,
              p.latitude,
              p.longitude,
              p.width_m,
              p.length_m,
              p.depth_m,
              p.confidence,
              p.severity,
              p.status ?? 'detected',
              p.detection_timestamp,
              p.detection_method,
              p.photo_url,
              p.photo_path,
              p.location_description,
              p.road_name,
              p.district,
              p.assigned_to,
              p.repair_priority,
              p.estimated_repair_cost,
              p.repair_notes,
              p.repaired_at,
              p.repaired_by,
              p.verified_at,
              p.verified_by,
              p.rejection_reason,
              JSON.stringify(p.metadata ?? {}),
              p.created_at,
              p.updated_at,
              p.area_sqm,
            ],
          )
        }
        await client.query('commit')
        n += batch.length
        process.stdout.write(`\r${n}/${potholes.length}`)
      } catch (err) {
        await client.query('rollback')
        throw err
      }
    }
    console.log('\nPotholes loaded')

    const admin = createClient(env.VITE_SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const email = 'demo@viasight.app'
    const passwordAuth = 'ViaSightDemo2026!'
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listed.error) throw listed.error
    const existing = listed.data.users.find((u) => u.email === email)
    if (!existing) {
      const created = await admin.auth.admin.createUser({
        email,
        password: passwordAuth,
        email_confirm: true,
        user_metadata: { full_name: 'ViaSight Demo', role: 'ops' },
      })
      if (created.error) throw created.error
      console.log('Created demo user', created.data.user.id)
    } else {
      const updated = await admin.auth.admin.updateUserById(existing.id, {
        password: passwordAuth,
        email_confirm: true,
      })
      if (updated.error) throw updated.error
      console.log('Updated demo user', existing.id)
    }

    const countRes = await client.query('select count(*)::int as n from public.potholes')
    console.log('Done. potholes =', countRes.rows[0].n)
    console.log(`Sign in: ${email} / ${passwordAuth}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
