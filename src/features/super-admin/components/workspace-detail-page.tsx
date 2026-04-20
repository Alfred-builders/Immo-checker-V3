import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useSuperAdminWorkspace, useUpdateWorkspaceStatut, useResendAdminInvite } from '../api'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { formatDate } from '../../../lib/formatters'
import type { WorkspaceStatut } from '../types'

const statutColors: Record<WorkspaceStatut, string> = {
  actif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspendu: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-amber-50 text-amber-700 border-amber-200',
}

export function SuperAdminWorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: ws, isLoading } = useSuperAdminWorkspace(id)
  const updateStatut = useUpdateWorkspaceStatut()
  const resendInvite = useResendAdminInvite()

  if (isLoading || !ws) {
    return <div className="px-8 py-6 max-w-5xl mx-auto"><Skeleton className="h-64 rounded-2xl" /></div>
  }

  async function handleStatutChange(v: string) {
    try {
      await updateStatut.mutateAsync({ id: id!, statut: v as WorkspaceStatut })
      toast.success(`Workspace ${v === 'actif' ? 'réactivé' : v === 'suspendu' ? 'suspendu' : 'en trial'}`)
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  async function handleResend() {
    try {
      const r = await resendInvite.mutateAsync(id!)
      toast.success(`Invitation renvoyée à ${r.email}`)
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  return (
    <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
      <Link to="/super-admin/workspaces" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Retour à la liste
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{ws.nom}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{ws.type_workspace.replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statutColors[ws.statut] ?? ''} capitalize`}>{ws.statut}</Badge>
          <Select value={ws.statut} onValueChange={handleStatutChange}>
            <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="suspendu">Suspendre</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Membres actifs', value: ws.members_count },
          { label: 'Bâtiments', value: ws.batiments_count },
          { label: 'Lots', value: ws.lots_count },
          { label: 'EDL signés', value: ws.edl_signed_count },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border/40 shadow-elevation-raised p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Identité</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">SIRET</div><div className="text-foreground font-medium">{ws.siret || '—'}</div>
          <div className="text-muted-foreground">Email</div><div className="text-foreground font-medium">{ws.email || '—'}</div>
          <div className="text-muted-foreground">Téléphone</div><div className="text-foreground font-medium">{ws.telephone || '—'}</div>
          <div className="text-muted-foreground">Adresse</div><div className="text-foreground font-medium">{ws.adresse || '—'}</div>
          <div className="text-muted-foreground">Ville</div><div className="text-foreground font-medium">{[ws.code_postal, ws.ville].filter(Boolean).join(' ') || '—'}</div>
          <div className="text-muted-foreground">Créé le</div><div className="text-foreground font-medium">{formatDate(ws.created_at)}</div>
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Membres ({ws.members?.length ?? 0})</h2>
        {ws.members?.length ? (
          <div className="divide-y divide-border/40">
            {ws.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-foreground">{m.prenom} {m.nom}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px]">{m.role}</Badge>
                  {!m.est_actif && <Badge variant="secondary" className="text-[10px]">Inactif</Badge>}
                  <span className="text-[11px] text-muted-foreground">
                    {m.last_login_at ? `Connect. ${formatDate(m.last_login_at)}` : 'Jamais connecté'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Aucun membre</p>}
      </section>

      <section className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Invitations en attente ({ws.pending_invitations?.length ?? 0})</h2>
          {ws.pending_invitations?.some((i) => i.role === 'admin') && (
            <Button variant="outline" size="sm" onClick={handleResend} disabled={resendInvite.isPending}>
              <PaperPlaneTilt size={14} /> Renvoyer invitation admin
            </Button>
          )}
        </div>
        {ws.pending_invitations?.length ? (
          <div className="divide-y divide-border/40">
            {ws.pending_invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="text-foreground font-medium">{inv.email}</p>
                  <p className="text-[11px] text-muted-foreground">Expire le {formatDate(inv.expires_at)}</p>
                </div>
                <Badge variant="outline" className="capitalize text-[10px]">{inv.role}</Badge>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Aucune invitation en attente</p>}
      </section>
    </div>
  )
}
