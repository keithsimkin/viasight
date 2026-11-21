import fs from 'node:fs'
import pg from 'pg'

const password = fs.readFileSync(process.env.SUPABASE_DB_PASSWORD_FILE, 'utf8').trim()
const client = new pg.Client({
  connectionString: `postgresql://postgres.nnanwekmhkxcwxrbhtld:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
await client.query(`
  insert into public.datasets (id, name, description, is_default)
  values ('default', 'Default', 'ViaSight uploads', true)
  on conflict (id) do update set is_default = true
`)
await client.query(`drop policy if exists "Authenticated write datasets" on public.datasets`)
await client.query(`
  create policy "Authenticated write datasets"
  on public.datasets for all to authenticated
  using (true) with check (true)
`)
console.log('default dataset + datasets write RLS ok')
await client.end()
