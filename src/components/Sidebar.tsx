import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Camera,
  CircleAlert,
  Wrench,
  FileText,
  Settings,
  Search,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

const NAV = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Overview', to: '/' },
      { icon: Map, label: 'Live map', to: '/map' },
      { icon: Camera, label: 'Detect', to: '/detect' },
      { icon: CircleAlert, label: 'Events', to: '/events' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: Wrench, label: 'Repairs', to: '/repairs' },
      { icon: FileText, label: 'Reports', to: '/reports' },
    ],
  },
]

type Props = {
  collapsed: boolean
  onToggle: () => void
  eventsCount?: number
}

export function Sidebar({ collapsed, onToggle, eventsCount }: Props) {
  const { user, signOut } = useAuth()
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Operator'
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-[var(--vs-line)] bg-[var(--vs-sidebar)] transition-[width] duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[232px]'
      }`}
    >
      <div className={`pt-5 pb-3 ${collapsed ? 'px-2' : 'px-4'}`}>
        <div
          className={`mb-4 flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[13px] font-bold text-emerald-400">
            V
          </div>
          {!collapsed ? (
            <span className="text-[17px] font-semibold tracking-tight text-slate-900">
              ViaSight
            </span>
          ) : null}
        </div>

        {!collapsed ? (
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-2 rounded-lg border border-[var(--vs-line)] bg-slate-50 px-3 py-2 text-left text-[13px] text-slate-400"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>
        ) : (
          <button
            type="button"
            className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--vs-line)] text-slate-400"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 ${
            collapsed ? 'mx-auto justify-center' : 'w-full'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse
            </>
          )}
        </button>
      </div>

      <nav className={`vs-scroll flex-1 overflow-y-auto pb-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {NAV.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed ? (
              <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const badge =
                  item.to === '/events' && eventsCount
                    ? String(eventsCount > 99 ? '99+' : eventsCount)
                    : undefined
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex w-full items-center rounded-lg text-[13px] font-medium transition-colors ${
                          collapsed
                            ? 'justify-center px-0 py-2.5'
                            : 'gap-2.5 px-2.5 py-2'
                        } ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="h-4 w-4 shrink-0 opacity-80" />
                          {!collapsed ? (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {badge ? (
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                    isActive
                                      ? 'bg-white/15 text-white'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {badge}
                                </span>
                              ) : null}
                            </>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`border-t border-[var(--vs-line)] ${collapsed ? 'p-2' : 'p-3'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[12px] font-bold text-emerald-700">
              {initials}
            </div>
            <NavLink
              to="/settings"
              className="rounded p-1 text-slate-400 hover:bg-slate-50"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </NavLink>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded p-1 text-slate-400 hover:bg-slate-50"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[12px] font-bold text-emerald-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <NavLink
              to="/settings"
              className="rounded p-1 text-slate-400 hover:bg-slate-50"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </NavLink>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded p-1 text-slate-400 hover:bg-slate-50"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
