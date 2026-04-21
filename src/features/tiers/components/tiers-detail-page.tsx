import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Archive, ArrowCounterClockwise, PencilSimple, Warning, BuildingOffice, User, CaretUp, CaretDown, House, Briefcase, ClipboardText, Plus, X, MagnifyingGlass, FileText, IdentificationCard } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { Label } from 'src/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from 'src/components/ui/dialog'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ConfirmDialog } from '../../../components/shared/confirm-dialog'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { CreateLotModal } from '../../patrimoine/components/create-lot-modal'
import { useTiersDetail, useUpdateTiers, useTiersMissions, useTiersEdlHistory, useLinkOrganisation, useUnlinkOrganisation, useSearchTiers, useTiersLots } from '../api'
import { CreateTiersModal } from './create-tiers-modal'
import { api } from 'src/lib/api-client'
import { toast } from 'sonner'
import { formatDate } from '../../../lib/formatters'

/* ── Fonction labels ── */
const FONCTION_OPTIONS = [
  { value: 'gerant', label: 'Gérant' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'comptable', label: 'Comptable' },
  { value: 'contact_principal', label: 'Contact principal' },
  { value: 'autre', label: 'Autre' },
] as const

export function TiersDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [editing, setEditing] = useState(false)
  const { data: tiers, isLoading } = useTiersDetail(id)

  // Auto-set breadcrumbs when data loads (survives page refresh)
  useEffect(() => {
    if (tiers && !(location.state as any)?.breadcrumbs) {
      const name = tiers.type_personne === 'morale' ? tiers.raison_sociale : `${tiers.prenom || ''} ${tiers.nom || ''}`.trim()
      navigate(location.pathname, { replace: true, state: { breadcrumbs: [{ label: 'Tiers', href: '/app/tiers' }, { label: name || 'Fiche tiers' }] } })
    }
  }, [tiers?.id])
  const updateMutation = useUpdateTiers()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const [formData, setFormData] = useState({
    nom: '', prenom: '', raison_sociale: '', type_personne: 'physique' as string,
    email: '', tel: '', adresse: '', code_postal: '', ville: '',
    siren: '', date_naissance: '', representant_nom: '', notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (tiers) {
      setFormData({
        nom: tiers.nom || '', prenom: tiers.prenom || '', raison_sociale: tiers.raison_sociale || '',
        type_personne: tiers.type_personne, email: tiers.email || '', tel: tiers.tel || '',
        adresse: tiers.adresse || '', code_postal: tiers.code_postal || '', ville: tiers.ville || '',
        siren: tiers.siren || '', date_naissance: tiers.date_naissance || '',
        representant_nom: tiers.representant_nom || '', notes: tiers.notes || '',
      })
    }
  }, [tiers, editing])

  if (isLoading) {
    return (
      <div className="px-8 py-6 space-y-5">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    )
  }

  if (!tiers) return <div className="px-8 py-6"><p className="text-muted-foreground">Tiers introuvable</p></div>

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !tiers!.est_archive })
      toast.success(tiers!.est_archive ? 'Tiers restauré' : 'Tiers archivé')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  function handleCancel() {
    if (tiers) {
      setFormData({
        nom: tiers.nom || '', prenom: tiers.prenom || '', raison_sociale: tiers.raison_sociale || '',
        type_personne: tiers.type_personne, email: tiers.email || '', tel: tiers.tel || '',
        adresse: tiers.adresse || '', code_postal: tiers.code_postal || '', ville: tiers.ville || '',
        siren: tiers.siren || '', date_naissance: tiers.date_naissance || '',
        representant_nom: tiers.representant_nom || '', notes: tiers.notes || '',
      })
    }
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: tiers!.id,
        nom: formData.nom, prenom: formData.prenom || null,
        raison_sociale: formData.raison_sociale || null,
        email: formData.email || null, tel: formData.tel || null,
        adresse: formData.adresse || null, code_postal: formData.code_postal || null,
        ville: formData.ville || null, siren: formData.siren || null,
        date_naissance: formData.date_naissance || null,
        representant_nom: formData.representant_nom || null,
        notes: formData.notes || null,
      })
      toast.success('Tiers mis à jour')
      setTimeout(() => setEditing(false), 300)
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const displayName = tiers.type_personne === 'morale'
    ? tiers.raison_sociale || tiers.nom
    : `${tiers.prenom || ''} ${tiers.nom}`.trim()

  const lotsProprietaire = tiers.lots_proprietaire ?? []
  const lotsMandataire = tiers.lots_mandataire ?? []
  const organisations = tiers.organisations ?? []
  const membres = tiers.membres ?? []
  const totalLots = lotsProprietaire.length + lotsMandataire.length

  // Determine roles
  const roles: string[] = []
  if (lotsProprietaire.length > 0) roles.push('Propriétaire')
  if (lotsMandataire.length > 0) roles.push('Mandataire')
  if ((tiers as any).nb_edl_locataire > 0) roles.push('Locataire')
  if (roles.length === 0) roles.push(tiers.type_personne === 'morale' ? 'Organisation' : 'Personne')

  return (
    <div className="px-8 py-6 max-w-[1180px] mx-auto space-y-4">

      {/* ═══ HERO HEADER ═══ */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <div className="px-7 py-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-center">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${tiers.type_personne === 'morale' ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-primary/10'}`}>
                {tiers.type_personne === 'morale'
                  ? <BuildingOffice className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  : <User className="h-6 w-6 text-primary" />
                }
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${tiers.type_personne === 'morale' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-primary/10 text-primary'}`}>
                    {tiers.type_personne === 'morale' ? 'Personne morale' : 'Personne physique'}
                  </span>
                  {roles.map(r => (
                    <span key={r} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{r}</span>
                  ))}
                  {tiers.est_archive && <Badge variant="destructive" className="text-xs">Archivé</Badge>}
                </div>
                <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
                  {tiers.email && <span className="inline-flex items-center gap-1.5">📧 {tiers.email}</span>}
                  {tiers.tel && <span className="inline-flex items-center gap-1.5">📱 {tiers.tel}</span>}
                  {tiers.ville && <span className="inline-flex items-center gap-1.5">📍 {tiers.ville}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!tiers.est_archive && !editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}><PencilSimple className="h-3.5 w-3.5" /> Modifier</Button>
              )}
              <Button variant="outline" size="sm" className={tiers.est_archive ? '' : 'text-destructive hover:text-destructive'} onClick={() => setShowArchiveConfirm(true)}>
                {tiers.est_archive ? <><ArrowCounterClockwise className="h-3.5 w-3.5" /> Restaurer</> : <><Archive className="h-3.5 w-3.5" /> Archiver</>}
              </Button>
            </div>
          </div>
        </div>
        {tiers.est_archive && (
          <div className="border-t border-red-200 bg-red-50/60 px-7 py-3 flex items-center gap-3 dark:bg-red-950/30 dark:border-red-800">
            <Warning className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-xs text-red-800 dark:text-red-300">Ce tiers est archivé. Les modifications sont désactivées.</p>
          </div>
        )}
      </div>

      {/* ═══ ROW 1: 2-col — Informations | Contact & Adresse ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Informations générales */}
        <CardBlock title="Informations générales" icon={User}>
          {tiers.type_personne === 'physique' ? (
            <>
              <FieldRow label="Nom" editing={editing} value={tiers.nom}>
                <Input value={formData.nom} onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Prénom" editing={editing} value={tiers.prenom || '—'}>
                <Input value={formData.prenom} onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Date de naissance" editing={editing} value={tiers.date_naissance || '—'}>
                <Input type="date" value={formData.date_naissance} onChange={(e) => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))} onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} className="h-9 text-sm cursor-pointer" />
              </FieldRow>
              <FieldRow label="Notes" editing={editing} value={tiers.notes || '—'} last>
                <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} className="text-sm" />
              </FieldRow>
            </>
          ) : (
            <>
              <FieldRow label="Raison sociale" editing={editing} value={tiers.raison_sociale || '—'}>
                <Input value={formData.raison_sociale} onChange={(e) => setFormData(prev => ({ ...prev, raison_sociale: e.target.value }))} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Nom (contact)" editing={editing} value={tiers.nom}>
                <Input value={formData.nom} onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="SIREN" editing={editing} value={tiers.siren || '—'} mono>
                <Input value={formData.siren} onChange={(e) => setFormData(prev => ({ ...prev, siren: e.target.value }))} className="h-9 text-sm font-mono" />
              </FieldRow>
              <FieldRow label="Représentant" editing={editing} value={tiers.representant_nom || '—'}>
                <Input value={formData.representant_nom} onChange={(e) => setFormData(prev => ({ ...prev, representant_nom: e.target.value }))} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Notes" editing={editing} value={tiers.notes || '—'} last>
                <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} className="text-sm" />
              </FieldRow>
            </>
          )}
        </CardBlock>

        {/* Contact & Adresse */}
        <CardBlock title="Contact & Adresse" icon={IdentificationCard}>
          <FieldRow label="Email" editing={editing} value={tiers.email || '—'}>
            <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Téléphone" editing={editing} value={tiers.tel || '—'}>
            <Input value={formData.tel} onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Adresse" editing={editing} value={tiers.adresse || '—'}>
            <Input value={formData.adresse} onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Code postal" editing={editing} value={tiers.code_postal || '—'}>
            <Input value={formData.code_postal} onChange={(e) => setFormData(prev => ({ ...prev, code_postal: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Ville" editing={editing} value={tiers.ville || '—'} last>
            <Input value={formData.ville} onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
        </CardBlock>
      </div>

      {/* Lots table — propriétaire only */}
      <LotsTable
        lotsProprietaire={lotsProprietaire}
        tiersId={tiers.id}
        tiersName={displayName}
        isArchived={tiers.est_archive}
      />

      {/* Fix 2: US-809 — Lots en gestion (mandataire) */}
      <LotsMandataireSection tiersId={tiers.id} tiersName={displayName} />

      {/* Organisations liées (physique) / Membres (morale) */}
      {tiers.type_personne === 'physique' && (
        <OrganisationsSection tiersId={tiers.id} organisations={organisations} isArchived={tiers.est_archive} />
      )}
      {tiers.type_personne === 'morale' && (
        <MembresSection tiersId={tiers.id} membres={membres} isArchived={tiers.est_archive} />
      )}

      {/* US-806/807/809: Missions section */}
      <MissionsSection tiersId={tiers.id} />

      {/* Fix 3: US-807: EDL History (locataire) — improved */}
      <EdlHistorySection tiersId={tiers.id} />

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={tiers.est_archive ? 'Restaurer ce tiers ?' : 'Archiver ce tiers ?'}
        description={tiers.est_archive
          ? 'Le tiers redeviendra visible dans les listes et les recherches.'
          : 'Le tiers sera masqué des listes, recherches et pickers. Les lots et missions liés restent consultables.'}
        confirmLabel={tiers.est_archive ? 'Restaurer' : 'Archiver'}
        variant={tiers.est_archive ? 'default' : 'destructive'}
        onConfirm={handleArchive}
      />
    </div>
  )
}

/* ═══ CardBlock (same as lot detail) ═══ */
function CardBlock({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer">
        <Icon className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-[13px] font-bold text-foreground">{title}</span>
        <div className="ml-auto">{open ? <CaretUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <CaretDown className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  )
}

/* ═══ FieldRow (same as lot detail) ═══ */
function FieldRow({ label, value, editing, children, last, mono }: { label: string; value: React.ReactNode; editing: boolean; children: React.ReactNode; last?: boolean; mono?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? '' : 'border-b border-border/30'}`}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {editing ? <div className="w-56">{children}</div> : <span className={`text-[13px] font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</span>}
    </div>
  )
}

/* ── Fix 1: US-589 — Organisations section (for physique tiers) ── */
function OrganisationsSection({ tiersId, organisations, isArchived }: {
  tiersId: string
  organisations: Array<{ tiers_id: string; nom: string; raison_sociale?: string; fonction?: string; est_principal: boolean }>
  isArchived: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const unlinkMutation = useUnlinkOrganisation()

  async function handleUnlink(orgTiersId: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await unlinkMutation.mutateAsync({ tiersId, orgId: orgTiersId })
      toast.success('Organisation retirée')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2.5 px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer">
          <BuildingOffice className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-[13px] font-bold text-foreground">Organisations ({organisations.length})</span>
          <div className="flex items-center gap-2">
            {!isArchived && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={(e) => { e.stopPropagation(); setShowAddDialog(true) }}
              >
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            )}
            {open ? <CaretUp className="h-4 w-4 text-muted-foreground" /> : <CaretDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>
        {open && (
          <div className="border-t border-border/50">
            {organisations.length > 0 ? (
              <div className="divide-y divide-border/50">
                {organisations.map(org => (
                  <div key={org.tiers_id} className="flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/app/tiers/${org.tiers_id}`, { state: { breadcrumbs: [{ label: 'Tiers', href: '/app/tiers' }, { label: org.raison_sociale || org.nom || 'Tiers' }] } })}>
                    <div className="flex items-center gap-3">
                      <BuildingOffice className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-foreground">{org.raison_sociale || org.nom}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {org.fonction && <Badge variant="outline" className="text-xs capitalize">{org.fonction}</Badge>}
                      {org.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px]">Principal</Badge>}
                      {!isArchived && (
                        <button
                          className="ml-1 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => handleUnlink(org.tiers_id, e)}
                          title="Retirer l'association"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Aucune organisation liée
              </div>
            )}
          </div>
        )}
      </div>
      <AddOrganisationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        tiersId={tiersId}
        mode="organisation"
      />
    </>
  )
}

/* ── Fix 1: US-589 — Membres section (for morale tiers) ── */
function MembresSection({ tiersId, membres, isArchived }: {
  tiersId: string
  membres: Array<{ tiers_id: string; nom: string; prenom?: string; fonction?: string; est_principal: boolean }>
  isArchived: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const unlinkMutation = useUnlinkOrganisation()

  async function handleUnlink(membreTiersId: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      // For morale tiers, unlinking a membre means unlinking from the membre's perspective
      // The API works bidirectionally — we unlink the member from this organisation
      await unlinkMutation.mutateAsync({ tiersId: membreTiersId, orgId: tiersId })
      toast.success('Membre retiré')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2.5 px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer">
          <User className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-[13px] font-bold text-foreground">Membres ({membres.length})</span>
          <div className="flex items-center gap-2">
            {!isArchived && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={(e) => { e.stopPropagation(); setShowAddDialog(true) }}
              >
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            )}
            {open ? <CaretUp className="h-4 w-4 text-muted-foreground" /> : <CaretDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>
        {open && (
          <div className="border-t border-border/50">
            {membres.length > 0 ? (
              <div className="divide-y divide-border/50">
                {membres.map(m => (
                  <div key={m.tiers_id} className="flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/app/tiers/${m.tiers_id}`, { state: { breadcrumbs: [{ label: 'Tiers', href: '/app/tiers' }, { label: m.prenom ? `${m.prenom} ${m.nom}` : (m.nom || 'Tiers') }] } })}>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">{m.prenom ? `${m.prenom} ${m.nom}` : m.nom}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.fonction && <Badge variant="outline" className="text-xs capitalize">{m.fonction}</Badge>}
                      {m.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px]">Principal</Badge>}
                      {!isArchived && (
                        <button
                          className="ml-1 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => handleUnlink(m.tiers_id, e)}
                          title="Retirer le membre"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Aucun membre lié
              </div>
            )}
          </div>
        )}
      </div>
      <AddOrganisationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        tiersId={tiersId}
        mode="membre"
      />
    </>
  )
}

/* ── Fix 1: US-589 — Add Organisation/Membre Dialog ── */
function AddOrganisationDialog({ open, onOpenChange, tiersId, mode }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  tiersId: string
  mode: 'organisation' | 'membre'
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTiersId, setSelectedTiersId] = useState<string | null>(null)
  const [selectedTiersName, setSelectedTiersName] = useState('')
  const [fonction, setFonction] = useState('')
  const [estPrincipal, setEstPrincipal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showCreateTiers, setShowCreateTiers] = useState(false)

  const { data: searchResults } = useSearchTiers(searchQuery)
  const linkMutation = useLinkOrganisation()

  function reset() {
    setSearchQuery('')
    setSelectedTiersId(null)
    setSelectedTiersName('')
    setFonction('')
    setEstPrincipal(false)
    setShowResults(false)
  }

  function handleClose(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  function selectTiers(t: { id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; type_personne: string }) {
    setSelectedTiersId(t.id)
    setSelectedTiersName(
      t.type_personne === 'morale'
        ? t.raison_sociale || t.nom
        : `${t.prenom || ''} ${t.nom}`.trim()
    )
    setShowResults(false)
    setSearchQuery('')
  }

  async function handleSubmit() {
    if (!selectedTiersId) return
    setSubmitting(true)
    try {
      if (mode === 'organisation') {
        // physique tiers linking to an organisation (morale)
        await linkMutation.mutateAsync({
          tiersId,
          organisation_id: selectedTiersId,
          fonction: fonction || undefined,
          est_principal: estPrincipal,
        })
      } else {
        // morale tiers adding a membre (physique) — link from the membre's perspective
        await linkMutation.mutateAsync({
          tiersId: selectedTiersId,
          organisation_id: tiersId,
          fonction: fonction || undefined,
          est_principal: estPrincipal,
        })
      }
      toast.success(mode === 'organisation' ? 'Organisation ajoutée' : 'Membre ajouté')
      handleClose(false)
    } catch { toast.error('Erreur lors de l\'ajout') }
    finally { setSubmitting(false) }
  }

  const searchList = searchResults?.data?.filter(t => {
    if (t.id === tiersId) return false
    if (mode === 'organisation') return t.type_personne === 'morale'
    return t.type_personne === 'physique'
  }) ?? []

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {mode === 'organisation' ? 'Ajouter une organisation' : 'Ajouter un membre'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {mode === 'organisation'
              ? 'Recherchez une personne morale à associer.'
              : 'Recherchez une personne physique à associer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tiers search */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {mode === 'organisation' ? 'Organisation' : 'Membre'}
            </Label>
            {selectedTiersId ? (
              <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-foreground">{selectedTiersName}</span>
                <button
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { setSelectedTiersId(null); setSelectedTiersName('') }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true) }}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  className="pl-8 h-9 text-sm"
                />
                {showResults && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-elevation-overlay z-40 max-h-48 overflow-y-auto">
                    {searchList.length > 0 ? (
                      searchList.map(t => (
                        <button
                          key={t.id}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2"
                          onClick={() => selectTiers(t)}
                        >
                          {t.type_personne === 'morale'
                            ? <BuildingOffice className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            : <User className="h-3.5 w-3.5 text-primary shrink-0" />
                          }
                          <span className="truncate">
                            {t.type_personne === 'morale'
                              ? t.raison_sociale || t.nom
                              : `${t.prenom || ''} ${t.nom}`.trim()
                            }
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                        Aucun résultat
                      </div>
                    )}
                    <button
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-border/30"
                      onClick={() => { setShowResults(false); setShowCreateTiers(true) }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Créer {mode === 'organisation' ? 'une organisation' : 'un membre'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fonction */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Fonction</Label>
            <Select value={fonction} onValueChange={setFonction}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Sélectionner une fonction" />
              </SelectTrigger>
              <SelectContent>
                {FONCTION_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Est principal */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground">Contact principal</Label>
            <Switch checked={estPrincipal} onCheckedChange={setEstPrincipal} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!selectedTiersId || submitting}>
            {submitting ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <CreateTiersModal
      open={showCreateTiers}
      onOpenChange={setShowCreateTiers}
      defaultTypePersonne={mode === 'organisation' ? 'morale' : 'physique'}
      onCreated={async (newTiersId) => {
        setShowCreateTiers(false)
        try {
          const t = await api<any>(`/tiers/${newTiersId}`)
          const name = t.type_personne === 'morale'
            ? t.raison_sociale || t.nom
            : `${t.prenom || ''} ${t.nom}`.trim()
          setSelectedTiersId(newTiersId)
          setSelectedTiersName(name || 'Nouveau tiers')
        } catch {
          setSelectedTiersId(newTiersId)
          setSelectedTiersName('Nouveau tiers')
        }
      }}
    />
    </>
  )
}

/* ── Lots Table (propriétaire uniquement) ── */
function LotsTable({ lotsProprietaire, tiersId, tiersName, isArchived }: {
  lotsProprietaire: Array<{ id: string; designation: string; type_bien: string; batiment_designation: string; est_principal: boolean }>
  tiersId: string
  tiersName: string
  isArchived: boolean
}) {
  const navigate = useNavigate()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const lotCols = useResizableColumns({ designation: 200, batiment: 180, type: 120, principal: 100 })

  const allLots = lotsProprietaire.map(l => ({ ...l }))

  function goToLot(lotId: string, lotName: string) {
    navigate(`/app/patrimoine/lots/${lotId}`, {
      state: {
        breadcrumbs: [
          { label: 'Tiers', href: '/app/tiers' },
          { label: tiersName, href: `/app/tiers/${tiersId}` },
          { label: lotName },
        ],
      },
    })
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised">
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lots en propriété ({allLots.length})</h2>
          {!isArchived && (
            <Button size="sm" onClick={() => setShowCreateLot(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un lot
            </Button>
          )}
        </div>

        {/* Table header */}
        <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 select-none">
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.designation, minWidth: 40 }}>
            Désignation
            <ResizeHandle colId="designation" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.batiment, minWidth: 40 }}>
            Bâtiment
            <ResizeHandle colId="batiment" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.type, minWidth: 40 }}>
            Type
            <ResizeHandle colId="type" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="shrink-0" style={{ width: lotCols.colWidths.principal, minWidth: 40 }}>
            Principal
          </div>
        </div>

        {allLots.length > 0 ? (
          <div className="divide-y divide-border/30">
            {allLots.map(lot => (
              <div
                key={lot.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
                onClick={() => goToLot(lot.id, lot.designation)}
              >
                <div className="shrink-0 text-sm font-medium text-foreground truncate" style={{ width: lotCols.colWidths.designation }}>{lot.designation}</div>
                <div className="shrink-0 text-sm text-muted-foreground truncate" style={{ width: lotCols.colWidths.batiment }}>{lot.batiment_designation}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.type }}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs capitalize">{lot.type_bien.replace('_', ' ')}</Badge>
                </div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.principal }}>
                  {lot.est_principal && <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Principal</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
              <House className="h-6 w-6 text-muted-foreground" />
            </div>
            <p>Aucun lot lié</p>
          </div>
        )}
      </div>

      <CreateLotModal
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        onCreated={(lotId) => navigate(`/app/patrimoine/lots/${lotId}`)}
      />
    </>
  )
}

/* ── Fix 2: US-809 — Lots en gestion (mandataire) ── */
function LotsMandataireSection({ tiersId, tiersName }: { tiersId: string; tiersName: string }) {
  const { data: lotsData, isLoading } = useTiersLots(tiersId)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const mandataireLots = lotsData?.mandataire ?? []

  if (isLoading || mandataireLots.length === 0) return null

  function goToLot(lotId: string, lotName: string) {
    navigate(`/app/patrimoine/lots/${lotId}`, {
      state: {
        breadcrumbs: [
          { label: 'Tiers', href: '/app/tiers' },
          { label: tiersName, href: `/app/tiers/${tiersId}` },
          { label: lotName },
        ],
      },
    })
  }

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/50 transition-colors duration-200"
      >
        <h2 className="text-sm font-semibold text-foreground">Lots en gestion ({mandataireLots.length})</h2>
        {open ? <CaretUp className="h-4 w-4 text-muted-foreground" /> : <CaretDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/50">
          {/* Table header */}
          <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 bg-muted/30 select-none">
            <div className="flex-1 min-w-0">Désignation</div>
            <div className="w-44 shrink-0">Bâtiment</div>
            <div className="w-28 shrink-0">Type</div>
          </div>
          <div className="divide-y divide-border/30">
            {mandataireLots.map((lot: any) => (
              <div
                key={lot.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
                onClick={() => goToLot(lot.id, lot.designation)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lot.designation}</p>
                </div>
                <div className="w-44 shrink-0">
                  <p className="text-sm text-muted-foreground truncate">{lot.batiment_designation || '--'}</p>
                </div>
                <div className="w-28 shrink-0">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs capitalize">
                    {(lot.type_bien || '').replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── US-806/807/809: Missions linked to tiers ── */
const missionStatutColors: Record<string, string> = {
  planifiee: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  assignee: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  terminee: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  annulee: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
}
const missionStatutLabels: Record<string, string> = {
  planifiee: 'Planifiée', assignee: 'Assignée', terminee: 'Terminée', annulee: 'Annulée',
}

function MissionsSection({ tiersId }: { tiersId: string }) {
  const { data: missions, isLoading } = useTiersMissions(tiersId)
  const navigate = useNavigate()

  if (isLoading || !missions || missions.length === 0) return null

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold text-foreground">Missions ({missions.length})</h2>
      </div>
      <div className="divide-y divide-border/40">
        {missions.map((m: any) => (
          <div
            key={m.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer text-sm"
            onClick={() => navigate(`/app/missions/${m.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: m.reference || 'Mission' }] } })}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{m.reference}</p>
              <p className="text-xs text-muted-foreground">{m.lot?.designation}</p>
            </div>
            <div className="text-muted-foreground text-[13px]">
              {m.date_planifiee ? formatDate(m.date_planifiee) : '--'}
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${missionStatutColors[m.statut] || ''}`}>
              {missionStatutLabels[m.statut] || m.statut}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Fix 3: US-807: EDL History — improved with proper table layout and empty state ── */
function EdlHistorySection({ tiersId }: { tiersId: string }) {
  const { data: edls, isLoading } = useTiersEdlHistory(tiersId)

  if (isLoading) return null

  const sensColors: Record<string, string> = {
    entree: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    sortie: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  }
  const statutColors: Record<string, string> = {
    brouillon: 'bg-muted/50 text-muted-foreground',
    signe: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    infructueux: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  }

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold text-foreground">Historique EDL ({edls?.length ?? 0})</h2>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 bg-muted/30 select-none">
        <div className="flex-1 min-w-0">Lot</div>
        <div className="w-36 shrink-0">Bâtiment</div>
        <div className="w-20 shrink-0">Sens</div>
        <div className="w-24 shrink-0">Statut</div>
        <div className="w-28 shrink-0 text-right">Date</div>
      </div>

      {edls && edls.length > 0 ? (
        <div className="divide-y divide-border/30">
          {edls.map((edl: any) => (
            <div key={edl.id} className="flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{edl.lot?.designation || '--'}</p>
              </div>
              <div className="w-36 shrink-0">
                <p className="text-muted-foreground truncate text-[13px]">{edl.batiment?.designation || '--'}</p>
              </div>
              <div className="w-20 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize ${sensColors[edl.sens] || ''}`}>
                  {edl.sens}
                </span>
              </div>
              <div className="w-24 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize ${statutColors[edl.statut] || ''}`}>
                  {edl.statut}
                </span>
              </div>
              <div className="w-28 shrink-0 text-right text-muted-foreground text-[13px]">
                {edl.date_signature ? formatDate(edl.date_signature) : formatDate(edl.created_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground text-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>Aucun historique d'état des lieux</p>
        </div>
      )}
    </div>
  )
}
