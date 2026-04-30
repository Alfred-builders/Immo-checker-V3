import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ShieldCheck, Power, LockKey, SignOut, Warning,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  useSuperAdminUser,
  useUpdateUserSuperAdmin,
  useToggleUserActive,
  useForcePasswordReset,
  useRevokeUserSessions,
} from '../api'
import { useAuth } from '../../../hooks/use-auth'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import { formatDate } from '../../../lib/formatters'

type ConfirmKey = 'deactivate' | 'reactivate' | 'force_reset' | 'revoke_sessions' | null

export function SuperAdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const { data: u, isLoading } = useSuperAdminUser(id)
  const updateSuperAdmin = useUpdateUserSuperAdmin()
  const toggleActive = useToggleUserActive()
  const forceReset = useForcePasswordReset()
  const revokeSessions = useRevokeUserSessions()

  const [confirm, setConfirm] = useState<ConfirmKey>(null)

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

  async function runConfirmedAction() {
    if (!id || !confirm) return
    try {
      if (confirm === 'deactivate' || confirm === 'reactivate') {
        await toggleActive.mutateAsync({ id, est_actif: confirm === 'reactivate' })
        toast.success(confirm === 'reactivate' ? 'Compte réactivé' : 'Compte désactivé · sessions révoquées')
      } else if (confirm === 'force_reset') {
        const r = await forceReset.mutateAsync(id)
        toast.success(`Email de réinitialisation envoyé à ${r.email}`)
      } else if (confirm === 'revoke_sessions') {
        const r = await revokeSessions.mutateAsync(id)
        toast.success(`${r.revoked} session${r.revoked > 1 ? 's' : ''} révoquée${r.revoked > 1 ? 's' : ''}`)
      }
      setConfirm(null)
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <Link to="/super-admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Retour à la liste
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{u.prenom} {u.nom}</h1>
            {u.is_super_admin && (
              <Badge className="bg-red-50 text-red-700 border-red-200">
                <ShieldCheck size={12} weight="fill" className="mr-1" /> Super-admin
              </Badge>
            )}
            {!u.est_actif && (
              <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                Désactivé
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{u.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleToggleSuperAdmin}
          disabled={(isSelf && u.is_super_admin) || updateSuperAdmin.isPending}
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

      {!u.est_actif && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-950/40 dark:border-red-800/60">
          <div className="flex items-start gap-3">
            <Warning className="h-5 w-5 text-red-600 shrink-0 mt-0.5" weight="fill" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Compte désactivé</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                L'utilisateur ne peut plus se connecter. Toutes ses sessions ont été révoquées.
                {u.deactivated_at && ` Désactivé le ${formatDate(u.deactivated_at)}.`}
              </p>
            </div>
          </div>
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

      {/* ─── Actions super-admin ─── */}
      <section className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Actions</h2>
        <p className="text-[11px] text-muted-foreground mb-4">Toutes les actions sont tracées dans le journal d'audit.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionTile
            icon={<Power size={16} weight="fill" className={u.est_actif ? 'text-destructive' : 'text-emerald-600'} />}
            title={u.est_actif ? 'Désactiver le compte' : 'Réactiver le compte'}
            description={u.est_actif ? 'Bloque le login global et révoque toutes les sessions actives.' : 'Permet à nouveau la connexion.'}
            disabled={isSelf && u.est_actif}
            onClick={() => setConfirm(u.est_actif ? 'deactivate' : 'reactivate')}
            destructive={u.est_actif}
          />
          <ActionTile
            icon={<LockKey size={16} weight="fill" className="text-violet-600" />}
            title="Forcer reset MDP"
            description="Envoie un email avec un lien de réinitialisation valable 1h."
            disabled={!u.est_actif}
            onClick={() => setConfirm('force_reset')}
          />
          <ActionTile
            icon={<SignOut size={16} weight="fill" className="text-amber-600" />}
            title="Révoquer les sessions"
            description="Force la déconnexion de tous les appareils. L'utilisateur devra se reconnecter."
            disabled={!u.est_actif}
            onClick={() => setConfirm('revoke_sessions')}
          />
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

      {/* ─── Confirmation dialog ─── */}
      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === 'deactivate' && 'Désactiver le compte ?'}
              {confirm === 'reactivate' && 'Réactiver le compte ?'}
              {confirm === 'force_reset' && 'Forcer la réinitialisation du mot de passe ?'}
              {confirm === 'revoke_sessions' && 'Révoquer toutes les sessions ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === 'deactivate' && (
                <>L'utilisateur <strong>{u.email}</strong> ne pourra plus se connecter et toutes ses sessions actives seront immédiatement révoquées.</>
              )}
              {confirm === 'reactivate' && (
                <>L'utilisateur <strong>{u.email}</strong> pourra à nouveau se connecter.</>
              )}
              {confirm === 'force_reset' && (
                <>Un email avec un lien de réinitialisation valable 1h sera envoyé à <strong>{u.email}</strong>. Le mot de passe actuel reste valide jusqu'à utilisation du lien.</>
              )}
              {confirm === 'revoke_sessions' && (
                <>Tous les refresh tokens de <strong>{u.email}</strong> seront supprimés. L'utilisateur sera déconnecté de tous ses appareils dans les 2 heures (au prochain renouvellement de token).</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={runConfirmedAction}
              className={
                confirm === 'deactivate' || confirm === 'revoke_sessions'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ActionTile({ icon, title, description, onClick, disabled, destructive }: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'group text-left rounded-xl border p-3 transition-all',
        disabled
          ? 'opacity-40 cursor-not-allowed bg-muted/20 border-border/30'
          : 'bg-card hover:bg-muted/30 border-border/40 hover:border-border/60 shadow-elevation-raised hover:shadow-elevation-raised-hover',
        destructive && !disabled ? 'hover:border-destructive/40' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{description}</p>
    </button>
  )
}
