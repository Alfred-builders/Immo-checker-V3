import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { SquaresFour, ClipboardText, BuildingOffice, Buildings, UsersThree, Gear, SignOut, CaretRight, PushPin, CaretUpDown, Check, ArrowLeft, List, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { BellDropdown } from '../features/notifications/components/bell-dropdown'
import { GlobalSearchBar } from '../features/search/components/global-search-bar'
import { Sheet, SheetContent, SheetTitle } from '../components/ui/sheet'

const SIDEBAR_COLLAPSED_W = 64
const SIDEBAR_EXPANDED_W = 240
const ICON_PL = 'pl-[22px]'

const navigation = [
  {
    group: 'Opérationnel',
    items: [
      { label: 'Tableau de bord', icon: SquaresFour, href: '/app/dashboard', disabled: false },
      { label: 'Missions', icon: ClipboardText, href: '/app/missions', disabled: false },
    ],
  },
  {
    group: 'Référentiel',
    items: [
      { label: 'Parc immobilier', icon: BuildingOffice, href: '/app/patrimoine', disabled: false },
      { label: 'Tiers', icon: UsersThree, href: '/app/tiers', disabled: false },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Paramètres', icon: Gear, href: '/app/parametres', disabled: false },
    ],
  },
]

function NavItem({ to, icon: Icon, label, disabled, expanded }: { to: string; icon: React.ElementType; label: string; disabled?: boolean; expanded: boolean }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  if (disabled) {
    return (
      <div className={`flex items-center gap-3 py-2 mx-2 px-3 rounded-lg text-muted-foreground/35 cursor-not-allowed`}>
        <Icon size={18} className="shrink-0" />
        {expanded && (
          <>
            <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>
            <span className="ml-auto text-[11px] font-medium bg-muted/60 px-2 py-0.5 rounded-full text-muted-foreground/40">Bientôt</span>
          </>
        )}
      </div>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 py-2 mx-2 px-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {expanded && (
        <span className="text-[13px] whitespace-nowrap">{label}</span>
      )}
    </Link>
  )
}

function useBreadcrumbs() {
  const location = useLocation()
  const state = location.state as Record<string, any> | null

  if (state?.breadcrumbs && Array.isArray(state.breadcrumbs)) {
    return state.breadcrumbs as { label: string; href?: string }[]
  }

  const path = location.pathname
  const topLevelMap: Record<string, string> = {
    '/app/patrimoine': 'Parc immobilier',
    '/app/tiers': 'Tiers',
    '/app/parametres': 'Paramètres',
    '/app/dashboard': 'Tableau de bord',
    '/app/missions': 'Missions',
  }

  if (topLevelMap[path]) return [{ label: topLevelMap[path] }]

  if (path.startsWith('/app/patrimoine/batiments/'))
    return [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: '...' }]
  if (path.startsWith('/app/patrimoine/lots/'))
    return [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: '...' }]
  if (path.startsWith('/app/tiers/') && path !== '/app/tiers')
    return [{ label: 'Tiers', href: '/app/tiers' }, { label: '...' }]
  if (path.startsWith('/app/missions/') && path !== '/app/missions')
    return [{ label: 'Missions', href: '/app/missions' }, { label: '...' }]
  if (path.startsWith('/app/parametres/templates/') && path !== '/app/parametres/templates')
    return [{ label: 'Paramètres', href: '/app/parametres' }, { label: 'Templates', href: '/app/parametres/templates' }, { label: '...' }]
  if (path === '/app/parametres/templates')
    return [{ label: 'Paramètres', href: '/app/parametres' }, { label: 'Templates' }]
  if (path === '/app/parametres/catalogue')
    return [{ label: 'Paramètres', href: '/app/parametres' }, { label: 'Catalogue' }]
  if (path === '/app/parametres/criteres')
    return [{ label: 'Paramètres', href: '/app/parametres' }, { label: 'Critères' }]

  return []
}

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, workspace, logout } = useAuth()
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const expanded = pinned || hovered
  const breadcrumbs = useBreadcrumbs()

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (workspace?.couleur_primaire) {
      document.documentElement.style.setProperty('--primary', workspace.couleur_primaire)
      document.documentElement.style.setProperty('--ring', workspace.couleur_primaire)
    }
    // Apply background color
    if (workspace?.couleur_fond) {
      document.documentElement.style.setProperty('--background', workspace.couleur_fond)
    }
    // Apply background style
    const style = workspace?.fond_style || 'gradient'
    document.body.setAttribute('data-fond', style)
    return () => {
      document.documentElement.style.removeProperty('--primary')
      document.documentElement.style.removeProperty('--ring')
      document.documentElement.style.removeProperty('--background')
      document.body.removeAttribute('data-fond')
    }
  }, [workspace?.couleur_primaire, workspace?.couleur_fond, workspace?.fond_style])

  const isDetailPage = /\/app\/(patrimoine\/(batiments|lots)\/|tiers\/[^/]|missions\/[^/]|parametres\/templates\/[^/])/.test(location.pathname)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : '?'
  const sidebarWidth = expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop only */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: sidebarWidth }}
        className="fixed left-0 top-0 bottom-0 bg-card border-r border-border/50 hidden md:flex flex-col z-30 transition-[width] duration-200 ease-in-out overflow-hidden group/sidebar"
      >
        <div className={`h-14 flex items-center ${ICON_PL} pr-3 border-b border-border/50 shrink-0`}>
          <Link to="/app/dashboard" className="flex items-center gap-3 group">
            {workspace?.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.nom}
                className="w-8 h-8 rounded-xl object-cover shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: '#2d526c' }}>
                <Buildings size={18} weight="fill" className="text-white" />
              </div>
            )}
            {expanded && <span className="text-[15px] font-semibold tracking-tight text-foreground whitespace-nowrap">{workspace?.nom || 'ImmoChecker'}</span>}
          </Link>
          {expanded && (
            <div
              onClick={() => setPinned(!pinned)}
              title={pinned ? 'Détacher la sidebar' : 'Épingler la sidebar'}
              className={`ml-auto cursor-pointer transition-all duration-150 shrink-0 ${
                pinned
                  ? 'text-primary'
                  : 'text-muted-foreground/30 hover:text-muted-foreground/60'
              }`}
            >
              <PushPin size={13} weight={pinned ? 'fill' : 'regular'} className={pinned ? '' : '-rotate-45'} />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-5">
          {navigation.map((group) => (
            <section key={group.group}>
              <div className={`${ICON_PL} mb-1.5 h-4 flex items-center`}>
                {expanded && (
                  <h3 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider whitespace-nowrap">{group.group}</h3>
                )}
              </div>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <NavItem key={item.href} to={item.href} icon={item.icon} label={item.label} disabled={item.disabled} expanded={expanded} />
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className={`border-t border-border/50 py-3 ${ICON_PL} pr-3 space-y-2`}>
          <WorkspaceSwitcher expanded={expanded} />
          <Link
            to="/app/profil"
            title="Mon profil"
            className="flex items-center gap-3 px-1 py-1 -mx-1 rounded-md hover:bg-accent/50 transition-colors"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={`${user.prenom} ${user.nom}`} className="w-8 h-8 rounded-xl object-cover shrink-0 transition-transform hover:scale-105 border border-border/40" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center text-primary font-semibold text-[11px] shrink-0 transition-transform hover:scale-105">{initials}</div>
            )}
            {expanded && (
              <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-foreground truncate">{user?.prenom} {user?.nom}</p></div>
            )}
          </Link>
          {expanded && (
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-1 py-1.5 text-[12px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors">
              <SignOut size={14} /><span>Déconnexion</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[260px] p-0 bg-card md:hidden">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <MobileSidebarContent
            user={user}
            workspace={workspace}
            initials={initials}
            onLogout={handleLogout}
            onClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        className="min-h-screen transition-[margin-left] duration-200 ease-in-out flex flex-col ml-0 md:ml-[var(--sidebar-width)]"
      >
        {/* Header */}
        <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between px-3 md:px-6 shrink-0 sticky top-0 z-20 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 rounded-md flex items-center justify-center text-foreground hover:bg-accent transition-colors md:hidden shrink-0"
              title="Menu"
              aria-label="Ouvrir le menu"
            >
              <List size={20} weight="regular" />
            </button>
            {isDetailPage && (
              <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0" title="Retour">
                <ArrowLeft size={16} />
              </button>
            )}
            <nav className="flex items-center gap-1.5 text-[13px] min-w-0 overflow-hidden">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <CaretRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                  {i < breadcrumbs.length - 1 && b.href ? (
                    <Link to={b.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">{b.label}</Link>
                  ) : (
                    <span className="text-foreground font-medium truncate">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden sm:block">
              <GlobalSearchBar />
            </div>
            <BellDropdown />
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

/* ── Mobile Sidebar Content ── */
function MobileSidebarContent({
  user,
  workspace,
  initials,
  onLogout,
  onClose,
}: {
  user: any
  workspace: any
  initials: string
  onLogout: () => void
  onClose: () => void
}) {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center pl-4 pr-3 border-b border-border/50 shrink-0">
        <Link to="/app/dashboard" onClick={onClose} className="flex items-center gap-3 group flex-1 min-w-0">
          {workspace?.logo_url ? (
            <img
              src={workspace.logo_url}
              alt={workspace.nom}
              className="w-8 h-8 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#2d526c' }}>
              <Buildings size={18} weight="fill" className="text-white" />
            </div>
          )}
          <span className="text-[15px] font-semibold tracking-tight text-foreground truncate">
            {workspace?.nom || 'ImmoChecker'}
          </span>
        </Link>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5">
        {navigation.map((group) => (
          <section key={group.group}>
            <div className="px-4 mb-1.5">
              <h3 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">{group.group}</h3>
            </div>
            <div className="flex flex-col">
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.href)
                if (item.disabled) {
                  return (
                    <div key={item.href} className="flex items-center gap-3 py-2.5 mx-2 px-3 rounded-lg text-muted-foreground/35 cursor-not-allowed">
                      <item.icon size={18} className="shrink-0" />
                      <span className="text-[14px] font-medium">{item.label}</span>
                      <span className="ml-auto text-[11px] font-medium bg-muted/60 px-2 py-0.5 rounded-full text-muted-foreground/40">Bientôt</span>
                    </div>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 py-2.5 mx-2 px-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    }`}
                  >
                    <item.icon size={18} className="shrink-0" />
                    <span className="text-[14px]">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* Footer — user + actions */}
      <div className="border-t border-border/50 py-3 px-3 space-y-2">
        <Link
          to="/app/profil"
          onClick={onClose}
          className="flex items-center gap-3 px-1 py-1 rounded-md hover:bg-accent/50 transition-colors"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={`${user.prenom} ${user.nom}`} className="w-8 h-8 rounded-xl object-cover shrink-0 border border-border/40" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center text-primary font-semibold text-[11px] shrink-0">{initials}</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{user?.prenom} {user?.nom}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={() => { onClose(); onLogout() }}
          className="w-full flex items-center gap-2 px-2 py-2 text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
        >
          <SignOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

/* ── Workspace Switcher ── */
interface WsItem { id: string; nom: string; type_workspace: string; logo_url: string | null; role: string }

function WorkspaceSwitcher({ expanded }: { expanded: boolean }) {
  const { workspace, switchWorkspace } = useAuth()
  const [open, setOpen] = useState(false)
  const { data: workspaces } = useQuery<WsItem[]>({ queryKey: ['workspaces'], queryFn: () => api<WsItem[]>('/auth/me/workspaces'), staleTime: 5 * 60 * 1000 })

  if (!workspaces || workspaces.length <= 1) {
    if (!expanded) return null
    return <div className="flex items-center gap-2 px-1 py-1"><span className="text-[11px] text-muted-foreground truncate">{workspace?.nom}</span></div>
  }

  async function handleSwitch(wsId: string) {
    setOpen(false)
    if (wsId !== workspace?.id) { await switchWorkspace(wsId); window.location.reload() }
  }

  if (!expanded) {
    return <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-md bg-accent/50 flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors" title={workspace?.nom}><CaretUpDown size={14} /></button>
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left">
        <span className="text-[12px] font-medium text-foreground truncate flex-1">{workspace?.nom}</span>
        <CaretUpDown size={12} className="text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border/60 rounded-lg shadow-elevation-overlay overflow-hidden z-40">
          {workspaces.map((ws) => (
            <button key={ws.id} onClick={() => handleSwitch(ws.id)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors text-[12px]">
              <span className="flex-1 truncate font-medium text-foreground">{ws.nom}</span>
              {ws.id === workspace?.id && <Check size={14} className="text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
