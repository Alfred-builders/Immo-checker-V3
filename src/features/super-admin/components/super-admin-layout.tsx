import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Buildings, UsersThree, ClipboardText, ChartLine, SignOut, ShieldWarning } from '@phosphor-icons/react'
import { useAuth } from '../../../hooks/use-auth'

const NAV = [
  { to: '/super-admin/dashboard', label: 'Tableau de bord', icon: ChartLine },
  { to: '/super-admin/workspaces', label: 'Workspaces', icon: Buildings },
  { to: '/super-admin/users', label: 'Utilisateurs', icon: UsersThree },
  { to: '/super-admin/audit-log', label: 'Journal d\'audit', icon: ClipboardText },
]

export function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    // Bg "white-blue" neutre (slate-50/slate-900) — cohérent avec l'app utilisateur
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <aside className="w-60 shrink-0 bg-card border-r border-border/50 flex flex-col">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-border/50">
          <div className="h-8 w-8 rounded-lg bg-destructive/15 flex items-center justify-center">
            <ShieldWarning size={16} className="text-destructive" weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">Super-admin</span>
            <span className="text-[10px] font-medium text-destructive/80 uppercase tracking-wider">mode élevé</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-2">
          {user && (
            <div className="px-3 py-2 rounded-lg bg-muted/30">
              <p className="text-xs font-medium text-foreground truncate">{user.prenom} {user.nom}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <SignOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col">
        <div className="h-10 bg-destructive/10 border-b border-destructive/20 px-6 flex items-center justify-center">
          <p className="text-[11px] font-semibold text-destructive uppercase tracking-wider">
            🔴 Zone Super-administrateur — accès réservé. Toutes les actions sont tracées.
          </p>
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
