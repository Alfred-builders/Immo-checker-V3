import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth'
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
import { DashboardPage } from './features/dashboard/components/dashboard-page'
import { ShadcnDashboard } from './features/dashboard/components/shadcn-dashboard'
import VibesSelection from './vibes-selection'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

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
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/patrimoine" element={<PatrimoinePage />} />
        <Route path="/app/patrimoine/batiments/:id" element={<BuildingDetailPage />} />
        <Route path="/app/patrimoine/lots/:id" element={<LotDetailPage />} />
        <Route path="/app/tiers" element={<TiersPage />} />
        <Route path="/app/tiers/:id" element={<TiersDetailPage />} />
        <Route path="/app/parametres" element={<SettingsPage />} />
        <Route path="/app/parametres/templates" element={<TemplatesPage />} />
        <Route path="/app/parametres/templates/:id" element={<TemplateDetailPage />} />
        <Route path="/app/parametres/catalogue" element={<CataloguePage />} />
        <Route path="/app/parametres/criteres" element={<CriteresPage />} />
        <Route path="/app/missions" element={<MissionsPage />} />
        <Route path="/app/missions/:id" element={<MissionDetailPage />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
