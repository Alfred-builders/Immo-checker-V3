import { Routes, Route, Navigate } from 'react-router-dom'
import { Component, useEffect, type ReactNode, type ErrorInfo } from 'react'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { RequireRole } from './components/shared/require-role'
import { AuthLayout } from './layouts/auth-layout'
import { MainLayout } from './layouts/main-layout'
import { LoginPage } from './features/auth/components/login-page'
import { RegisterPage } from './features/auth/components/register-page'
import { ForgotPasswordPage } from './features/auth/components/forgot-password-page'
import { ResetPasswordPage } from './features/auth/components/reset-password-page'
import { WorkspaceSelectPage } from './features/auth/components/workspace-select-page'
import { PatrimoinePage } from './features/patrimoine/components/patrimoine-page'
import { BuildingDetailPage } from './features/patrimoine/components/building-detail-page'
import { LotDetailPage } from './features/patrimoine/components/lot-detail-page'
import { SettingsPage } from './features/admin/components/settings-page'
import { TiersPage } from './features/tiers/components/tiers-page'
import { TiersDetailPage } from './features/tiers/components/tiers-detail-page'
import { TemplatesPage } from './features/templates/components/templates-page'
import { TemplateDetailPage } from './features/templates/components/template-detail-page'
import { CataloguePage } from './features/templates/components/catalogue-page'
import { CriteresPage } from './features/templates/components/criteres-page'
import { MissionsPage } from './features/missions/components/missions-page'
import { MissionDetailPage } from './features/missions/components/mission-detail-page'
import { ProfilePage } from './features/auth/components/profile-page'
import { NotificationsPage } from './features/notifications/components/notifications-page'
import { DashboardPage } from './features/dashboard/components/dashboard-page'
import { ShadcnDashboard } from './features/dashboard/components/shadcn-dashboard'
import VibesSelection from './vibes-selection'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Bloquer les techniciens du back-office webapp — réservé à l'app tablette
  if (user?.role === 'technicien') {
    return <Navigate to="/login?reason=technicien_webapp" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/:token" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/workspace-select" element={<WorkspaceSelectPage />} />
      <Route path="/vibes" element={<VibesSelection />} />
      <Route path="/shadcn-dashboard" element={<ShadcnDashboard />} />

      {/* Protected routes */}
      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route path="/app/dashboard" element={<PageErrorBoundary><DashboardPage /></PageErrorBoundary>} />
        <Route path="/app/patrimoine" element={<PatrimoinePage />} />
        <Route path="/app/patrimoine/batiments/:id" element={<BuildingDetailPage />} />
        <Route path="/app/patrimoine/lots/:id" element={<LotDetailPage />} />
        <Route path="/app/tiers" element={<TiersPage />} />
        <Route path="/app/tiers/:id" element={<TiersDetailPage />} />
        <Route path="/app/parametres" element={<RequireRole roles={['admin', 'gestionnaire']}><SettingsPage /></RequireRole>} />
        <Route path="/app/parametres/templates" element={<RequireRole roles={['admin', 'gestionnaire']}><TemplatesPage /></RequireRole>} />
        <Route path="/app/parametres/templates/:id" element={<RequireRole roles={['admin', 'gestionnaire']}><TemplateDetailPage /></RequireRole>} />
        <Route path="/app/parametres/catalogue" element={<RequireRole roles={['admin', 'gestionnaire']}><CataloguePage /></RequireRole>} />
        <Route path="/app/parametres/criteres" element={<RequireRole roles={['admin', 'gestionnaire']}><CriteresPage /></RequireRole>} />
        <Route path="/app/profil" element={<ProfilePage />} />
        <Route path="/app/notifications" element={<NotificationsPage />} />
        <Route path="/app/missions" element={<MissionsPage />} />
        <Route path="/app/missions/:id" element={<MissionDetailPage />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

class PageErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Page crash:', error, info) }
  render() {
    if (this.state.error) return (
      <div className="px-8 py-20 text-center">
        <p className="text-sm font-semibold text-destructive mb-2">Cette page a rencontre une erreur</p>
        <p className="text-xs text-muted-foreground mb-4">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })} className="text-xs text-primary hover:underline">Reessayer</button>
      </div>
    )
    return this.props.children
  }
}

export function App() {
  useEffect(() => {
    const timers = new Map<EventTarget, ReturnType<typeof setTimeout>>()

    const handleScroll = (e: Event) => {
      const target = e.target
      if (!target || !(target instanceof Element)) return
      target.classList.add('is-scrolling')
      const existing = timers.get(target)
      if (existing) clearTimeout(existing)
      const timer = setTimeout(() => {
        target.classList.remove('is-scrolling')
        timers.delete(target)
      }, 800)
      timers.set(target, timer)
    }

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
