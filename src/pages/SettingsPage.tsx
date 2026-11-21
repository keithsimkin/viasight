import { PageHeader } from '../components/PageHeader'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { usePotholesContext } from '../context/PotholesProvider'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { items, refresh } = usePotholesContext()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Settings"
        subtitle="Account, Supabase connection, and data refresh"
      />
      <div className="vs-scroll flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <section className="rounded-2xl border border-[var(--vs-line)] bg-white p-5">
            <h2 className="mb-1 text-[14px] font-semibold text-slate-900">Account</h2>
            <dl className="mt-3 space-y-3 text-[13px]">
              <div className="flex justify-between gap-4 border-b border-[var(--vs-line)] pb-3">
                <dt className="text-slate-400">Signed in as</dt>
                <dd className="font-semibold text-slate-900">{user?.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">User id</dt>
                <dd className="truncate font-mono text-[12px] text-slate-600">
                  {user?.id}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-4 rounded-lg border border-[var(--vs-line)] px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </section>

          <section className="rounded-2xl border border-[var(--vs-line)] bg-white p-5">
            <h2 className="mb-1 text-[14px] font-semibold text-slate-900">
              Supabase
            </h2>
            <dl className="mt-3 space-y-3 text-[13px]">
              <div className="flex justify-between gap-4 border-b border-[var(--vs-line)] pb-3">
                <dt className="text-slate-400">Status</dt>
                <dd className="font-semibold text-slate-900">
                  {isSupabaseConfigured ? 'Connected' : 'Missing env'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--vs-line)] pb-3">
                <dt className="text-slate-400">URL</dt>
                <dd className="truncate font-medium text-slate-700">
                  {import.meta.env.VITE_SUPABASE_URL ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Loaded potholes</dt>
                <dd className="font-semibold text-slate-900">{items.length}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white"
            >
              Refresh data
            </button>
          </section>

          <section className="rounded-2xl border border-[var(--vs-line)] bg-white p-5">
            <h2 className="mb-1 text-[14px] font-semibold text-slate-900">
              Mapbox
            </h2>
            <p className="text-[13px] text-slate-500">
              Light basemap for Overview and Live map. Falls back to OpenStreetMap
              if unset.
            </p>
            <p className="mt-3 text-[13px] font-medium text-slate-700">
              Token: {import.meta.env.VITE_MAPBOX_TOKEN ? 'Set' : 'Not set (OSM)'}
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--vs-line)] bg-white p-5">
            <h2 className="mb-1 text-[14px] font-semibold text-slate-900">
              Roboflow
            </h2>
            <p className="text-[13px] text-slate-500">
              Optional. Without a key, Detect uses mock boxes and still saves to
              Supabase.
            </p>
            <p className="mt-3 text-[13px] font-medium text-slate-700">
              API key:{' '}
              {import.meta.env.VITE_ROBOFLOW_API_KEY ? 'Set' : 'Not set (mock)'}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
