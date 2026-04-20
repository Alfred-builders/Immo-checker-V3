import { useState } from 'react'
import { useAuditLog } from '../api'
import { Skeleton } from '../../../components/ui/skeleton'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { formatDate } from '../../../lib/formatters'

const actionLabels: Record<string, string> = {
  'workspace.created': 'Workspace créé',
  'workspace.suspended': 'Workspace suspendu',
  'workspace.reactivated': 'Workspace réactivé',
  'workspace.status_changed': 'Statut changé',
  'workspace.admin_invite_resent': 'Invitation admin renvoyée',
  'user.promoted_super_admin': 'User promu super-admin',
  'user.demoted_super_admin': 'Super-admin rétrogradé',
  'user.deactivated': 'User désactivé',
  'user.force_password_reset': 'Reset MDP forcé',
}

const actionColors: Record<string, string> = {
  'workspace.created': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'workspace.suspended': 'bg-red-50 text-red-700 border-red-200',
  'workspace.reactivated': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'user.promoted_super_admin': 'bg-red-50 text-red-700 border-red-200',
  'user.demoted_super_admin': 'bg-amber-50 text-amber-700 border-amber-200',
}

export function SuperAdminAuditLogPage() {
  const [targetType, setTargetType] = useState<string>('all')
  const { data, isLoading } = useAuditLog({ target_type: targetType !== 'all' ? targetType : undefined })
  const entries = data?.data ?? []

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Journal d'audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Toutes les actions super-admin sont tracées ici</p>
      </div>

      <div className="mb-4">
        <Select value={targetType} onValueChange={setTargetType}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les cibles</SelectItem>
            <SelectItem value="workspace">Workspaces</SelectItem>
            <SelectItem value="user">Utilisateurs</SelectItem>
            <SelectItem value="invitation">Invitations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-border/20">
            {[1,2,3,4].map(i => <div key={i} className="px-5 py-3"><Skeleton className="h-5" /></div>)}
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">Aucune entrée</div>
        )}

        {!isLoading && entries.map((e) => (
          <div key={e.id} className="grid grid-cols-[180px_1fr_200px] gap-4 px-5 py-3 border-b border-border/15 last:border-0 text-sm items-start">
            <div>
              <Badge className={`${actionColors[e.action] ?? 'bg-muted/50'} text-[10px]`}>
                {actionLabels[e.action] ?? e.action}
              </Badge>
              <p className="text-[11px] text-muted-foreground mt-1">{formatDate(e.created_at)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                <span className="capitalize">{e.target_type}</span> — <span className="font-mono text-[11px]">{e.target_id.slice(0, 8)}</span>
              </p>
              {e.metadata && Object.keys(e.metadata).length > 0 && (
                <pre className="text-[11px] bg-muted/30 rounded px-2 py-1 mt-1 overflow-x-auto">
                  {JSON.stringify(e.metadata, null, 2)}
                </pre>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Par <span className="text-foreground font-medium">{e.super_admin.prenom} {e.super_admin.nom}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
