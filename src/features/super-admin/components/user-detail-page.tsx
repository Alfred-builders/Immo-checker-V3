import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useSuperAdminUser, useUpdateUserSuperAdmin } from '../api'
import { useAuth } from '../../../hooks/use-auth'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'
import { formatDate } from '../../../lib/formatters'

export function SuperAdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const { data: u, isLoading } = useSuperAdminUser(id)
  const updateSuperAdmin = useUpdateUserSuperAdmin()

  if (isLoading || !u) {
    return <div className="px-8 py-6 max-w-4xl mx-auto"><Skeleton className="h-48 rounded-2xl" /></div>
  }

  const isSelf = u.id === currentUser?.id

  async function handleToggleSuperAdmin() {
    try {
      await updateSuperAdmin.mutateAsync({ id: id!, is_super_admin: !u!.is_super_admin })
      toast.success(u!.is_super_admin ? 'Droits super-admin retirés' : 'Droits super-admin accordés')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <Link to="/super-admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Retour à la liste
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{u.prenom} {u.nom}</h1>
            {u.is_super_admin && (
              <Badge className="bg-red-50 text-red-700 border-red-200">
                <ShieldCheck size={12} weight="fill" className="mr-1" /> Super-admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{u.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleToggleSuperAdmin}
          disabled={isSelf && u.is_super_admin || updateSuperAdmin.isPending}
          className={u.is_super_admin ? 'text-destructive hover:text-destructive' : ''}
        >
          {u.is_super_admin ? 'Retirer super-admin' : 'Promouvoir super-admin'}
        </Button>
      </div>

      {isSelf && u.is_super_admin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          Vous ne pouvez pas retirer vos propres droits super-admin. Demandez à un autre super-admin de le faire.
        </div>
      )}

      <section className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Informations</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Téléphone</div><div className="text-foreground font-medium">{u.tel || '—'}</div>
          <div className="text-muted-foreground">Dernière connexion</div><div className="text-foreground font-medium">{u.last_login_at ? formatDate(u.last_login_at) : '—'}</div>
          <div className="text-muted-foreground">Créé le</div><div className="text-foreground font-medium">{formatDate(u.created_at)}</div>
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Workspaces ({u.memberships?.length ?? 0})</h2>
        {u.memberships?.length ? (
          <div className="divide-y divide-border/40">
            {u.memberships.map((m) => (
              <Link
                key={m.workspace_id}
                to={`/super-admin/workspaces/${m.workspace_id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:bg-accent/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="font-medium text-foreground">{m.workspace_nom}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.type_workspace.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[11px]">{m.role}</Badge>
                  {!m.est_actif && <Badge variant="secondary" className="text-[11px]">Inactif</Badge>}
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Aucun workspace</p>}
      </section>
    </div>
  )
}
