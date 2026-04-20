import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import type { Role } from '../../hooks/use-auth'

interface RequireRoleProps {
  roles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RequireRole({ roles, children, fallback, redirectTo = '/app/dashboard' }: RequireRoleProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!user || !roles.includes(user.role)) {
    if (fallback) return <>{fallback}</>
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
