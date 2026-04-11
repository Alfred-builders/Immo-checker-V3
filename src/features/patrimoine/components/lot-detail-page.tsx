import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Archive, ArrowCounterClockwise, User, BuildingOffice, House, CaretRight, CaretUp, CaretDown, PencilSimple, Warning, Plus, X, MagnifyingGlass, UsersThree, ClipboardText } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ConfirmDialog } from '../../../components/shared/confirm-dialog'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { useLotDetail, useUpdateLot, useSearchTiers, useLinkProprietaire, useUnlinkProprietaire } from '../api'
import { CreateTiersModal } from '../../tiers/components/create-tiers-modal'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre',
}

const typeBienOptions = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'parking', label: 'Parking' },
  { value: 'cave', label: 'Cave' },
  { value: 'autre', label: 'Autre' },
]

const dpeGesOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const ENERGY_TYPE_OPTIONS = [
  { value: 'electrique', label: 'Électrique' },
  { value: 'gaz', label: 'Gaz' },
  { value: 'fioul', label: 'Fioul' },
  { value: 'bois', label: 'Bois' },
  { value: 'pompe_a_chaleur', label: 'Pompe à chaleur' },
  { value: 'autre', label: 'Autre' },
]

const ENERGY_MODE_OPTIONS = [
  { value: 'individuel', label: 'Individuel' },
  { value: 'collectif', label: 'Collectif' },
]

const energyLabels: Record<string, string> = {
  individuel: 'Individuel', collectif: 'Collectif',
  gaz: 'Gaz', electrique: 'Électrique', fioul: 'Fioul', bois: 'Bois',
  pompe_a_chaleur: 'Pompe à chaleur', autre: 'Autre',
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    energie: false,
    annexes: false,
  })

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const [formData, setFormData] = useState({
    designation: '', type_bien: '', etage: '', surface: '', nb_pieces: '',
    meuble: false, emplacement_palier: '', num_cave: '', num_parking: '',
    dpe_classe: '', ges_classe: '', commentaire: '', reference_interne: '',
    eau_chaude_type: '', eau_chaude_mode: '', chauffage_type: '', chauffage_mode: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lot) {
      setFormData({
        designation: lot.designation || '',
        type_bien: lot.type_bien || '',
        etage: lot.etage || '',
        surface: lot.surface?.toString() || '',
        nb_pieces: lot.nb_pieces || '',
        meuble: lot.meuble || false,
        emplacement_palier: lot.emplacement_palier || '',
        num_cave: lot.num_cave || '',
        num_parking: lot.num_parking || '',
        dpe_classe: lot.dpe_classe || '',
        ges_classe: lot.ges_classe || '',
        commentaire: lot.commentaire || '',
        reference_interne: lot.reference_interne || '',
        eau_chaude_type: lot.eau_chaude_type || '',
        eau_chaude_mode: lot.eau_chaude_mode || '',
        chauffage_type: lot.chauffage_type || '',
        chauffage_mode: lot.chauffage_mode || '',
      })
    }
  }, [lot, editing])

  if (isLoading) {
    return (
      <div className="px-8 py-6 space-y-5 ">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    )
  }

  if (!lot) return <div className="px-8 py-6"><p className="text-muted-foreground">Lot introuvable</p></div>

  const proprietaires = lot.proprietaires ?? []
  const mandataire = lot.mandataire

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !lot!.est_archive })
      toast.success(lot!.est_archive ? 'Lot restauré' : 'Lot archivé')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  function handleCancel() {
    if (lot) {
      setFormData({
        designation: lot.designation || '',
        type_bien: lot.type_bien || '',
        etage: lot.etage || '',
        surface: lot.surface?.toString() || '',
        nb_pieces: lot.nb_pieces || '',
        meuble: lot.meuble || false,
        emplacement_palier: lot.emplacement_palier || '',
        num_cave: lot.num_cave || '',
        num_parking: lot.num_parking || '',
        dpe_classe: lot.dpe_classe || '',
        ges_classe: lot.ges_classe || '',
        commentaire: lot.commentaire || '',
        reference_interne: lot.reference_interne || '',
        eau_chaude_type: lot.eau_chaude_type || '',
        eau_chaude_mode: lot.eau_chaude_mode || '',
        chauffage_type: lot.chauffage_type || '',
        chauffage_mode: lot.chauffage_mode || '',
      })
    }
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: lot!.id,
        designation: formData.designation,
        type_bien: formData.type_bien,
        etage: formData.etage || null,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        nb_pieces: formData.nb_pieces || null,
        meuble: formData.meuble,
        emplacement_palier: formData.emplacement_palier || null,
        num_cave: formData.num_cave || null,
        num_parking: formData.num_parking || null,
        dpe_classe: formData.dpe_classe || null,
        ges_classe: formData.ges_classe || null,
        commentaire: formData.commentaire || null,
        reference_interne: formData.reference_interne || null,
        eau_chaude_type: formData.eau_chaude_type || null,
        eau_chaude_mode: formData.eau_chaude_mode || null,
        chauffage_type: formData.chauffage_type || null,
        chauffage_mode: formData.chauffage_mode || null,
      })
      toast.success('Lot mis à jour')
      setTimeout(() => setEditing(false), 400)
    } catch {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-8 py-6 space-y-5 ">
      {/* Header — icon + name + badge + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{lot.designation}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
                {typeBienLabels[lot.type_bien] || lot.type_bien}
              </Badge>
              {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Meublé</Badge>}
              {lot.est_archive && <Badge variant="destructive" className="text-xs">Archivé</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!lot.est_archive && !editing && (
            <Button variant="outline" size="sm" className="gap-1.5 border-border/60 hover:border-foreground/20 hover:bg-accent" onClick={() => setEditing(true)}>
              <PencilSimple className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={lot.est_archive
              ? 'gap-1.5 border-border/60 hover:border-foreground/20 hover:bg-accent'
              : 'gap-1.5 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/50'}
            onClick={() => setShowArchiveConfirm(true)}
          >
            {lot.est_archive ? <ArrowCounterClockwise className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {lot.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {lot.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          <Warning className="h-3.5 w-3.5 shrink-0" />
          Ce lot est archivé. Les modifications sont désactivées.
        </div>
      )}

      {/* ── Section: Informations générales (open by default) ── */}
      <CollapsibleSection title="Informations générales" open={openSections.general} onToggle={() => toggleSection('general')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="Désignation" editing={editing} value={lot.designation}>
            <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Type de bien" editing={editing} value={lot.type_bien}>
            <Select value={formData.type_bien} onValueChange={(v) => setFormData(prev => ({ ...prev, type_bien: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {typeBienOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Réf. interne" editing={editing} value={lot.reference_interne || '--'}>
            <Input value={formData.reference_interne} onChange={(e) => setFormData(prev => ({ ...prev, reference_interne: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Nb pièces" editing={editing} value={lot.nb_pieces || '--'}>
            <Input value={formData.nb_pieces} onChange={(e) => setFormData(prev => ({ ...prev, nb_pieces: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Étage" editing={editing} value={lot.etage || '--'}>
            <Input value={formData.etage} onChange={(e) => setFormData(prev => ({ ...prev, etage: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Emplacement / palier" editing={editing} value={lot.emplacement_palier || '--'}>
            <Input value={formData.emplacement_palier} onChange={(e) => setFormData(prev => ({ ...prev, emplacement_palier: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Surface" editing={editing} value={lot.surface ? `${lot.surface} m²` : '--'}>
            <Input type="number" value={formData.surface} onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Meublé" editing={editing} value={lot.meuble ? 'Oui' : 'Non'}>
            <Switch checked={formData.meuble} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, meuble: checked }))} />
          </InfoRow>
          <InfoRow label="Commentaire" editing={editing} value={lot.commentaire || '--'}>
            <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} rows={2} className="text-sm w-72" placeholder="Ajouter un commentaire..." />
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* ── Section: Énergie ── */}
      <CollapsibleSection title="Énergie" open={openSections.energie} onToggle={() => toggleSection('energie')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="DPE" editing={editing} value={lot.dpe_classe || '--'}>
            <Select value={formData.dpe_classe || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, dpe_classe: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{dpeGesOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="GES" editing={editing} value={lot.ges_classe || '--'}>
            <Select value={formData.ges_classe || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, ges_classe: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{dpeGesOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Eau chaude type" editing={editing} value={lot.eau_chaude_type ? (energyLabels[lot.eau_chaude_type] || lot.eau_chaude_type) : '--'}>
            <Select value={formData.eau_chaude_type || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, eau_chaude_type: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{ENERGY_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Eau chaude mode" editing={editing} value={lot.eau_chaude_mode ? (energyLabels[lot.eau_chaude_mode] || lot.eau_chaude_mode) : '--'}>
            <Select value={formData.eau_chaude_mode || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, eau_chaude_mode: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{ENERGY_MODE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Chauffage type" editing={editing} value={lot.chauffage_type ? (energyLabels[lot.chauffage_type] || lot.chauffage_type) : '--'}>
            <Select value={formData.chauffage_type || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, chauffage_type: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{ENERGY_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Chauffage mode" editing={editing} value={lot.chauffage_mode ? (energyLabels[lot.chauffage_mode] || lot.chauffage_mode) : '--'}>
            <Select value={formData.chauffage_mode || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, chauffage_mode: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{ENERGY_MODE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* ── Section: Annexes ── */}
      <CollapsibleSection title="Annexes" open={openSections.annexes} onToggle={() => toggleSection('annexes')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="N° cave" editing={editing} value={lot.num_cave || '--'}>
            <Input value={formData.num_cave} onChange={(e) => setFormData(prev => ({ ...prev, num_cave: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="N° parking" editing={editing} value={lot.num_parking || '--'}>
            <Input value={formData.num_parking} onChange={(e) => setFormData(prev => ({ ...prev, num_parking: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* ── Tiers liés — flat table (not collapsible) ── */}
      <TiersTable lotId={lot.id} proprietaires={proprietaires} mandataire={mandataire} isArchived={lot.est_archive} />

      {/* Meta */}
      <p className="text-xs text-muted-foreground/50 px-1">
        Créé {formatDate(lot.created_at)} — Modifié {formatDate(lot.updated_at)}
      </p>

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={lot.est_archive ? 'Restaurer ce lot ?' : 'Archiver ce lot ?'}
        description={lot.est_archive
          ? 'Le lot redeviendra visible dans les listes et les recherches.'
          : 'Le lot sera masqué des listes, recherches et pickers. Les missions existantes restent consultables.'}
        confirmLabel={lot.est_archive ? 'Restaurer' : 'Archiver'}
        variant={lot.est_archive ? 'default' : 'destructive'}
        onConfirm={handleArchive}
      />
    </div>
  )
}

/* ── Collapsible Section ── */
function CollapsibleSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/50 transition-colors duration-200"
      >
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {open ? <CaretUp className="h-4 w-4 text-muted-foreground" /> : <CaretDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border/50">{children}</div>}
    </div>
  )
}

/* ── Info Row ── */
function InfoRow({ label, value, editing, children }: { label: string; value: React.ReactNode; editing: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      {editing ? <div>{children}</div> : <span className="text-sm font-medium text-foreground">{value}</span>}
    </div>
  )
}

/* ── Tiers Table (flat, below sections) ── */
function TiersTable({ lotId, proprietaires, mandataire, isArchived }: {
  lotId: string
  proprietaires: Array<{ id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null; tel?: string | null; est_principal?: boolean }>
  mandataire: { id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null } | null
  isArchived: boolean
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [showCreateTiers, setShowCreateTiers] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const { data: searchResults } = useSearchTiers(searchQ)
  const linkMutation = useLinkProprietaire()
  const unlinkMutation = useUnlinkProprietaire()

  const tiersCols = useResizableColumns({ nom: 250, role: 120, email: 180, tel: 140, actions: 40 })

  async function handleLink(tiersId: string) {
    await linkMutation.mutateAsync({ lotId, tiersId, estPrincipal: proprietaires.length === 0 })
    setShowAdd(false)
    setSearchQ('')
  }

  const allTiers = [
    ...proprietaires.map(p => ({ ...p, role: 'Propriétaire' as const })),
    ...(mandataire ? [{ ...mandataire, role: 'Mandataire' as const, est_principal: false, tel: null }] : []),
  ]

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Tiers liés ({allTiers.length})</h2>
        {!isArchived && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowCreateTiers(true)}>
              <Plus className="h-3 w-3 mr-1" /> Nouveau tiers
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? 'Fermer' : <><Plus className="h-3 w-3 mr-1" /> Ajouter propriétaire</>}
            </Button>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="mx-5 my-3 p-3 bg-primary/5 border border-primary/30 rounded-xl space-y-2">
          <div className="relative">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Rechercher un tiers..." className="pl-8 h-8 text-xs" autoFocus />
          </div>
          {searchResults && searchResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {searchResults.filter(t => !proprietaires.some(p => p.id === t.id)).map(t => (
                <button key={t.id} onClick={() => handleLink(t.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-primary/10 rounded transition-colors text-left">
                  <User className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground">{t.prenom ? `${t.prenom} ${t.nom}` : t.raison_sociale || t.nom}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table header */}
      <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 select-none">
        <div className="relative shrink-0" style={{ width: tiersCols.colWidths.nom, minWidth: 40 }}>
          Nom
          <ResizeHandle colId="nom" onResizeStart={tiersCols.onResizeStart} onResize={tiersCols.onResize} />
        </div>
        <div className="relative shrink-0" style={{ width: tiersCols.colWidths.role, minWidth: 40 }}>
          Rôle
          <ResizeHandle colId="role" onResizeStart={tiersCols.onResizeStart} onResize={tiersCols.onResize} />
        </div>
        <div className="relative shrink-0" style={{ width: tiersCols.colWidths.email, minWidth: 40 }}>
          Email
          <ResizeHandle colId="email" onResizeStart={tiersCols.onResizeStart} onResize={tiersCols.onResize} />
        </div>
        <div className="relative shrink-0" style={{ width: tiersCols.colWidths.tel, minWidth: 40 }}>
          Téléphone
          <ResizeHandle colId="tel" onResizeStart={tiersCols.onResizeStart} onResize={tiersCols.onResize} />
        </div>
        <div className="shrink-0" style={{ width: tiersCols.colWidths.actions }} />
      </div>

      {allTiers.length > 0 ? (
        <div className="divide-y divide-border/30">
          {allTiers.map((t) => {
            const displayName = t.prenom ? `${t.prenom} ${t.nom}` : (t as any).raison_sociale || t.nom
            return (
              <div key={t.id + t.role} className="flex items-center gap-3 px-5 py-4 group hover:bg-accent/50 transition-colors duration-200">
                <div className="shrink-0 text-sm font-medium text-foreground truncate" style={{ width: tiersCols.colWidths.nom }}>{displayName}</div>
                <div className="shrink-0" style={{ width: tiersCols.colWidths.role }}>
                  <Badge className={t.role === 'Mandataire' ? 'bg-blue-50 text-blue-700 border-blue-200 text-xs' : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'}>
                    {t.role}
                  </Badge>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground truncate" style={{ width: tiersCols.colWidths.email }}>{t.email || '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: tiersCols.colWidths.tel }}>{t.tel || '--'}</div>
                <div className="shrink-0" style={{ width: tiersCols.colWidths.actions }}>
                  {!isArchived && t.role === 'Propriétaire' && (
                    <button onClick={() => unlinkMutation.mutate({ lotId, tiersId: t.id })} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all" title="Retirer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground text-sm">Aucun tiers lié</div>
      )}

      <CreateTiersModal
        open={showCreateTiers}
        onOpenChange={setShowCreateTiers}
        onCreated={() => toast.success('Tiers créé — vous pouvez maintenant le lier au lot')}
      />
    </div>
  )
}
