import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!user || !user.is_super_admin) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
