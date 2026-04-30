import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PaperPlaneTilt, PencilSimple, Pause, Play, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  useSuperAdminWorkspace,
  useResendAdminInvite,
  useUpdateWorkspace,
  useSuspendWorkspace,
  useReactivateWorkspace,
} from '../api'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select'
import { formatDate } from '../../../lib/formatters'
import type { WorkspaceStatut, WorkspaceType } from '../types'

const statutColors: Record<WorkspaceStatut, string> = {
  actif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspendu: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-amber-50 text-amber-700 border-amber-200',
}

export function SuperAdminWorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: ws, isLoading } = useSuperAdminWorkspace(id)
  const resendInvite = useResendAdminInvite()
  const suspendMut = useSuspendWorkspace()
  const reactivateMut = useReactivateWorkspace()

  const [editOpen, setEditOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  if (isLoading || !ws) {
    return <div className="px-8 py-6 max-w-5xl mx-auto"><Skeleton className="h-64 rounded-2xl" /></div>
  }

  async function handleResend() {
    try {
      const r = await resendInvite.mutateAsync(id!)
      toast.success(`Invitation renvoyée à ${r.email}`)
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  async function handleSuspend() {
    if (suspendReason.trim().length < 3) {
      toast.error('Motif requis (3 caractères min.)')
      return
    }
    try {
      await suspendMut.mutateAsync({ id: id!, reason: suspendReason.trim() })
      toast.success('Workspace suspendu')
      setSuspendOpen(false)
      setSuspendReason('')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  async function handleReactivate() {
    try {
      await reactivateMut.mutateAsync(id!)
      toast.success('Workspace réactivé')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  return (
    <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
      <Link to="/super-admin/workspaces" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Retour à la liste
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{ws.nom}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{ws.type_workspace.replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`${statutColors[ws.statut] ?? ''} capitalize`}>{ws.statut}</Badge>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
            <PencilSimple size={14} /> Éditer
          </Button>
          {ws.statut === 'suspendu' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              disabled={reactivateMut.isPending}
              className="gap-1.5 text-emerald-700 hover:text-emerald-700"
            >
              <Play size={14} weight="fill" /> Réactiver
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSuspendOpen(true)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Pause size={14} weight="fill" /> Suspendre
            </Button>
          )}
        </div>
      </div>

      {ws.statut === 'suspendu' && ws.suspended_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-950/40 dark:border-red-800/60">
          <div className="flex items-start gap-3">
            <Warning className="h-5 w-5 text-red-600 shrink-0 mt-0.5" weight="fill" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Workspace suspendu</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5 whitespace-pre-wrap">{ws.suspended_reason}</p>
              {ws.suspended_at && (
                <p className="text-[11px] text-red-700/70 dark:text-red-300/70 mt-1">
                  Le {formatDate(ws.suspended_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <Badge variant="outline" className="capitalize text-[11px]">{m.role}</Badge>
                  {!m.est_actif && <Badge variant="secondary" className="text-[11px]">Inactif</Badge>}
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
                <Badge variant="outline" className="capitalize text-[11px]">{inv.role}</Badge>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Aucune invitation en attente</p>}
      </section>

      {/* Edit identity dialog */}
      <EditWorkspaceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        workspace={ws}
      />

      {/* Suspend dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre {ws.nom}</DialogTitle>
            <DialogDescription>
              L'admin du workspace verra le motif au prochain login. Les utilisateurs ne pourront pas accéder
              à leurs données tant que la suspension est active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Motif de suspension <span className="text-destructive">*</span></Label>
            <Textarea
              id="suspend-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Ex : impayé facture mars 2026, suspicion d'abus, demande client…"
              rows={4}
              maxLength={500}
            />
            <p className="text-[11px] text-muted-foreground">{suspendReason.length} / 500 · 3 caractères min.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspendReason.trim().length < 3 || suspendMut.isPending}
            >
              <Pause size={14} weight="fill" /> Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Edit identity dialog ─── */
function EditWorkspaceDialog({
  open, onOpenChange, workspace,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspace: { id: string; nom: string; type_workspace: WorkspaceType; siret: string | null; email: string | null; telephone: string | null; adresse: string | null; code_postal: string | null; ville: string | null }
}) {
  const update = useUpdateWorkspace()
  const [nom, setNom] = useState(workspace.nom)
  const [type, setType] = useState<WorkspaceType>(workspace.type_workspace)
  const [siret, setSiret] = useState(workspace.siret ?? '')
  const [email, setEmail] = useState(workspace.email ?? '')
  const [tel, setTel] = useState(workspace.telephone ?? '')
  const [adresse, setAdresse] = useState(workspace.adresse ?? '')
  const [cp, setCp] = useState(workspace.code_postal ?? '')
  const [ville, setVille] = useState(workspace.ville ?? '')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) {
      toast.error('Nom requis')
      return
    }
    try {
      await update.mutateAsync({
        id: workspace.id,
        nom: nom.trim(),
        type_workspace: type,
        siret: siret.trim() || null,
        email: email.trim() || null,
        telephone: tel.trim() || null,
        adresse: adresse.trim() || null,
        code_postal: cp.trim() || null,
        ville: ville.trim() || null,
      })
      toast.success('Workspace mis à jour')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Éditer le workspace</DialogTitle>
            <DialogDescription>
              Mise à jour de l'identité. Le statut se gère via les boutons Suspendre / Réactiver.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="nom">Nom <span className="text-destructive">*</span></Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={255} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkspaceType)}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="societe_edl">Société EDL</SelectItem>
                  <SelectItem value="bailleur">Bailleur</SelectItem>
                  <SelectItem value="agence">Agence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" value={siret} onChange={(e) => setSiret(e.target.value)} maxLength={14} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tel">Téléphone</Label>
              <Input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} maxLength={20} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp">Code postal</Label>
              <Input id="cp" value={cp} onChange={(e) => setCp(e.target.value)} maxLength={10} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} maxLength={500} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} maxLength={255} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={update.isPending}>Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
