import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './layout/AppShell'
import { OverviewPage } from './pages/OverviewPage'
import { LiveMapPage } from './pages/LiveMapPage'
import { DetectPage } from './pages/DetectPage'
import { EventsPage } from './pages/EventsPage'
import { RepairsPage } from './pages/RepairsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SignInPage } from './pages/SignInPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="map" element={<LiveMapPage />} />
            <Route path="detect" element={<DetectPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="repairs" element={<RepairsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
