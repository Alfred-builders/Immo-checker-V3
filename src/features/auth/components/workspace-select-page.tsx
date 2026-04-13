import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/use-auth'
import { Card } from '../../../components/ui/card'

import { useState } from 'react'

interface Workspace {
  id: string
  nom: string
  type_workspace: string
  logo_url: string | null
  role: string
}

export function WorkspaceSelectPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { switchWorkspace } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const state = location.state as { workspaces: Workspace[]; user: { id: string } } | undefined
  const workspaces = state?.workspaces ?? []
  const userId = state?.user?.id

  if (!workspaces.length) {
    navigate('/login')
    return null
  }

  async function handleSelect(ws: Workspace) {
    setLoading(ws.id)
    try {
      await switchWorkspace(ws.id, userId)
      navigate('/app/dashboard')
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">ImmoChecker</h1>
          <p className="text-muted-foreground mt-2">Choisissez votre workspace</p>
        </div>
        <div className="grid gap-3">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              role="button"
              tabIndex={0}
              aria-label={`Workspace ${ws.nom}`}
              className={`p-4 cursor-pointer rounded-2xl border-border/60 transition-all duration-200 hover:border-primary/40 hover:shadow-elevation-raised-hover hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
                loading === ws.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => handleSelect(ws)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(ws) } }}
            >
              <div className="flex items-center gap-4">
                {ws.logo_url ? (
                  <img src={ws.logo_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-foreground">{ws.nom}</p>
                  <p className="text-sm text-muted-foreground capitalize">{ws.type_workspace.replace('_', ' ')}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground font-medium capitalize">
                  {ws.role}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
