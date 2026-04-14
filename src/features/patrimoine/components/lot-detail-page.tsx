import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Archive, ArrowCounterClockwise, User, BuildingOffice, House,
  CaretUp, CaretDown, PencilSimple, Warning, Plus, X, MagnifyingGlass,
  UsersThree, IdentificationCard, Ruler, Lightning, ArrowSquareOut,
  ChatText, ClipboardText, FilePdf,
  BuildingApartment, Storefront, Garage, DoorOpen,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ConfirmDialog } from '../../../components/shared/confirm-dialog'
import { useLotDetail, useUpdateLot, useSearchTiers, useLinkProprietaire, useUnlinkProprietaire } from '../api'
import { useMissions } from '../../missions/api'
import { missionStatutLabels, missionStatutColors, sensLabels, sensColors } from '../../missions/types'
import { CreateMissionModal } from '../../missions/components/create-mission-modal'
import { CreateTiersModal } from '../../tiers/components/create-tiers-modal'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre',
}
const typeBienIconMap: Record<string, React.ElementType> = {
  appartement: BuildingApartment,
  maison: House,
  studio: DoorOpen,
  local_commercial: Storefront,
  parking: Garage,
  cave: Archive,
  autre: BuildingApartment,
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
const dpeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-700', B: 'bg-lime-100 text-lime-700', C: 'bg-emerald-100 text-emerald-700',
  D: 'bg-amber-100 text-amber-700', E: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-600', G: 'bg-red-200 text-red-700',
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [editing, setEditing] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)

  // Auto-set breadcrumbs when data loads (survives page refresh)
  useEffect(() => {
    if (lot?.designation && !(location.state as any)?.breadcrumbs) {
      const crumbs: { label: string; href?: string }[] = [{ label: 'Parc immobilier', href: '/app/patrimoine' }]
      if (lot.batiment_id && lot.batiment?.designation) {
        crumbs.push({ label: lot.batiment.designation, href: `/app/patrimoine/batiments/${lot.batiment_id}` })
      }
      crumbs.push({ label: lot.designation })
      navigate(location.pathname, { replace: true, state: { breadcrumbs: crumbs } })
    }
  }, [lot?.designation])
  const updateMutation = useUpdateLot()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

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
        designation: lot.designation || '', type_bien: lot.type_bien || '',
        etage: lot.etage || '', surface: lot.surface?.toString() || '',
        nb_pieces: lot.nb_pieces || '', meuble: lot.meuble || false,
        emplacement_palier: lot.emplacement_palier || '',
        num_cave: lot.num_cave || '', num_parking: lot.num_parking || '',
        dpe_classe: lot.dpe_classe || '', ges_classe: lot.ges_classe || '',
        commentaire: lot.commentaire || '', reference_interne: lot.reference_interne || '',
        eau_chaude_type: lot.eau_chaude_type || '', eau_chaude_mode: lot.eau_chaude_mode || '',
        chauffage_type: lot.chauffage_type || '', chauffage_mode: lot.chauffage_mode || '',
      })
    }
  }, [lot, editing])

  if (isLoading) return (
    <div className="px-8 py-6 max-w-[1180px] mx-auto space-y-5">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4"><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-52 rounded-2xl" /></div>
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div>
    </div>
  )

  if (!lot) return <div className="px-8 py-6"><p className="text-muted-foreground">Lot introuvable</p></div>

  const proprietaires = lot.proprietaires ?? []
  const mandataire = lot.mandataire

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !lot!.est_archive })
      toast.success(lot!.est_archive ? 'Lot restauré' : 'Lot archivé')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  function handleCancel() {
    if (lot) setFormData({
      designation: lot.designation || '', type_bien: lot.type_bien || '',
      etage: lot.etage || '', surface: lot.surface?.toString() || '',
      nb_pieces: lot.nb_pieces || '', meuble: lot.meuble || false,
      emplacement_palier: lot.emplacement_palier || '',
      num_cave: lot.num_cave || '', num_parking: lot.num_parking || '',
      dpe_classe: lot.dpe_classe || '', ges_classe: lot.ges_classe || '',
      commentaire: lot.commentaire || '', reference_interne: lot.reference_interne || '',
      eau_chaude_type: lot.eau_chaude_type || '', eau_chaude_mode: lot.eau_chaude_mode || '',
      chauffage_type: lot.chauffage_type || '', chauffage_mode: lot.chauffage_mode || '',
    })
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: lot!.id, designation: formData.designation, type_bien: formData.type_bien,
        etage: formData.etage || null, surface: formData.surface ? parseFloat(formData.surface) : null,
        nb_pieces: formData.nb_pieces || null, meuble: formData.meuble,
        emplacement_palier: formData.emplacement_palier || null,
        num_cave: formData.num_cave || null, num_parking: formData.num_parking || null,
        dpe_classe: formData.dpe_classe || null, ges_classe: formData.ges_classe || null,
        commentaire: formData.commentaire || null, reference_interne: formData.reference_interne || null,
        eau_chaude_type: formData.eau_chaude_type || null, eau_chaude_mode: formData.eau_chaude_mode || null,
        chauffage_type: formData.chauffage_type || null, chauffage_mode: formData.chauffage_mode || null,
      })
      toast.success('Lot mis à jour')
      setTimeout(() => setEditing(false), 400)
    } catch (err: any) { toast.error(err.message || 'Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  return (
    <div className="px-8 py-6 max-w-[1180px] mx-auto space-y-4">

      {/* ═══ HERO HEADER ═══ */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <div className="px-7 py-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-center">
              {(() => { const LotIcon = typeBienIconMap[lot.type_bien] ?? BuildingApartment; return (
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <LotIcon className="h-6 w-6 text-primary" />
                </div>
              )})()}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{lot.designation}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  {lot.meuble && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">Meublé</span>}
                  {lot.est_archive && <Badge variant="destructive" className="text-xs">Archivé</Badge>}
                </div>
                <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
                  {lot.batiment && <span className="inline-flex items-center gap-1.5"><BuildingOffice className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{lot.batiment.designation}</span>}
                  {lot.batiment?.adresse && <span className="inline-flex items-center gap-1.5">{lot.batiment.adresse.rue}, {lot.batiment.adresse.ville}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!lot.est_archive && !editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}><PencilSimple className="h-3.5 w-3.5" /> Modifier</Button>
              )}
              <Button variant="outline" size="sm" className={lot.est_archive ? '' : 'text-destructive hover:text-destructive'} onClick={() => setShowArchiveConfirm(true)}>
                {lot.est_archive ? <><ArrowCounterClockwise className="h-3.5 w-3.5" /> Restaurer</> : <><Archive className="h-3.5 w-3.5" /> Archiver</>}
              </Button>
            </div>
          </div>
        </div>
        {lot.est_archive && (
          <div className="border-t border-red-200 bg-red-50/60 px-7 py-3 flex items-center gap-3">
            <Warning className="h-4 w-4 text-red-600 shrink-0" />
            <p className="text-xs text-red-800">Ce lot est archivé. Les modifications sont désactivées.</p>
          </div>
        )}
      </div>

      {/* ═══ ROW 1: 3-col grid — Identification | Caractéristiques | Énergie & Annexes ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Identification */}
        <CardBlock title="Identification" icon={IdentificationCard}>
          <FieldRow label="Désignation" editing={editing} value={lot.designation}>
            <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Référence" editing={editing} value={lot.reference_interne || '—'} mono>
            <Input value={formData.reference_interne} onChange={(e) => setFormData(prev => ({ ...prev, reference_interne: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Type" editing={editing} value={typeBienLabels[lot.type_bien] || lot.type_bien}>
            <Select value={formData.type_bien} onValueChange={(v) => setFormData(prev => ({ ...prev, type_bien: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{typeBienOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Meublé" editing={editing} value={lot.meuble ? 'Oui' : 'Non'} last>
            <Switch checked={formData.meuble} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, meuble: checked }))} />
          </FieldRow>
        </CardBlock>

        {/* Caractéristiques */}
        <CardBlock title="Caractéristiques" icon={Ruler}>
          <FieldRow label="Surface" editing={editing} value={lot.surface ? `${lot.surface} m²` : '—'}>
            <Input type="number" value={formData.surface} onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Pièces" editing={editing} value={lot.nb_pieces || '—'}>
            <Input value={formData.nb_pieces} onChange={(e) => setFormData(prev => ({ ...prev, nb_pieces: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Étage" editing={editing} value={lot.etage || '—'}>
            <Input value={formData.etage} onChange={(e) => setFormData(prev => ({ ...prev, etage: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Emplacement" editing={editing} value={lot.emplacement_palier || '—'} last>
            <Input value={formData.emplacement_palier} onChange={(e) => setFormData(prev => ({ ...prev, emplacement_palier: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
        </CardBlock>

        {/* Énergie & Annexes */}
        <CardBlock title="Énergie & Annexes" icon={Lightning}>
          <FieldRow label="DPE" editing={editing} value={lot.dpe_classe ? <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-[14px] ${dpeColors[lot.dpe_classe] || 'bg-muted text-muted-foreground'}`}>{lot.dpe_classe}</span> : '—'}>
            <Select value={formData.dpe_classe || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, dpe_classe: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{dpeGesOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="GES" editing={editing} value={lot.ges_classe ? <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-[14px] ${dpeColors[lot.ges_classe] || 'bg-muted text-muted-foreground'}`}>{lot.ges_classe}</span> : '—'}>
            <Select value={formData.ges_classe || undefined} onValueChange={(v) => setFormData(prev => ({ ...prev, ges_classe: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{dpeGesOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="N° Cave" editing={editing} value={lot.num_cave || '—'}>
            <Input value={formData.num_cave} onChange={(e) => setFormData(prev => ({ ...prev, num_cave: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="N° Parking" editing={editing} value={lot.num_parking || '—'} last>
            <Input value={formData.num_parking} onChange={(e) => setFormData(prev => ({ ...prev, num_parking: e.target.value }))} className="h-9 text-sm" />
          </FieldRow>
        </CardBlock>
      </div>

      {/* ═══ ROW 2: Bâtiment+Commentaire | Tiers ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Bâtiment parent */}
          <CardBlock title="Bâtiment parent" icon={BuildingOffice}>
            {lot.batiment ? (
              <Link to={`/app/patrimoine/batiments/${lot.batiment.id}`} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="h-11 w-11 rounded-[10px] bg-slate-100 flex items-center justify-center shrink-0"><BuildingOffice className="h-5 w-5 text-slate-500" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-foreground truncate">{lot.batiment.designation}</div>
                  {lot.batiment.adresse && <div className="text-[12px] text-muted-foreground truncate">{lot.batiment.adresse.rue}, {lot.batiment.adresse.code_postal} {lot.batiment.adresse.ville}</div>}
                </div>
                <ArrowSquareOut className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground/40 italic">Aucun bâtiment lié</p>
            )}
          </CardBlock>

          {/* Commentaire */}
          <CardBlock title="Commentaire" icon={ChatText}>
            {editing ? (
              <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} placeholder="Ajouter un commentaire..." rows={3} className="text-sm" />
            ) : lot.commentaire ? (
              <div className="rounded-xl bg-muted/20 p-4 text-[14px] text-foreground/80 whitespace-pre-wrap leading-relaxed">{lot.commentaire}</div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 p-4 text-[14px] text-muted-foreground/30 italic">Aucun commentaire</div>
            )}
          </CardBlock>
        </div>

        {/* Tiers liés */}
        <TiersCard lotId={lot.id} proprietaires={proprietaires} mandataire={mandataire} dernierLocataire={lot.dernier_locataire} isArchived={lot.est_archive} />
      </div>

      {/* ═══ ROW 3: Missions liées (full width) ═══ */}
      <MissionsTable lotId={lot.id} isArchived={lot.est_archive} />

      {/* Meta */}
      <p className="text-xs text-muted-foreground/40 px-1">Créé {formatDate(lot.created_at)} — Modifié {formatDate(lot.updated_at)}</p>

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      <ConfirmDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}
        title={lot.est_archive ? 'Restaurer ce lot ?' : 'Archiver ce lot ?'}
        description={lot.est_archive ? 'Le lot redeviendra visible dans les listes et les recherches.' : 'Le lot sera masqué des listes, recherches et pickers. Les missions existantes restent consultables.'}
        confirmLabel={lot.est_archive ? 'Restaurer' : 'Archiver'}
        variant={lot.est_archive ? 'default' : 'destructive'}
        onConfirm={handleArchive}
      />
    </div>
  )
}

/* ═══ Collapsible Card Block ═══ */
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

/* ═══ Field Row ═══ */
function FieldRow({ label, value, editing, mono, last, children }: { label: string; value: React.ReactNode; editing: boolean; mono?: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? '' : 'border-b border-border/30'}`}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {editing ? <div className="w-48">{children}</div> : <span className={`text-[14px] font-semibold text-foreground ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</span>}
    </div>
  )
}

/* ═══ Tiers Card ═══ */
function TiersCard({ lotId, proprietaires, mandataire, dernierLocataire, isArchived }: {
  lotId: string
  proprietaires: Array<{ id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null; tel?: string | null; est_principal?: boolean }>
  mandataire: { id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null } | null
  dernierLocataire?: { id: string; nom: string; prenom?: string; tel?: string; date_entree?: string } | null
  isArchived: boolean
}) {
  const [open, setOpen] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showCreateTiers, setShowCreateTiers] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [showMandataireSearch, setShowMandataireSearch] = useState(false)
  const [mandataireSearchQ, setMandataireSearchQ] = useState('')
  const [showCreateMandataire, setShowCreateMandataire] = useState(false)
  const { data: searchResults } = useSearchTiers(searchQ)
  const { data: mandataireResults } = useSearchTiers(mandataireSearchQ)
  const linkMutation = useLinkProprietaire()
  const unlinkMutation = useUnlinkProprietaire()
  const updateLot = useUpdateLot()

  async function handleSetMandataire(tiersId: string | null) {
    try {
      await updateLot.mutateAsync({ id: lotId, mandataire_id: tiersId })
      toast.success(tiersId ? 'Mandataire assigné' : 'Mandataire retiré')
      setShowMandataireSearch(false); setMandataireSearchQ('')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleLink(tiersId: string) {
    try {
      await linkMutation.mutateAsync({ lotId, tiersId, estPrincipal: proprietaires.length === 0 })
      toast.success('Propriétaire lié au lot')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
    setShowAdd(false); setSearchQ('')
  }

  async function handleCreatedTiers(tiersId: string) {
    try {
      await linkMutation.mutateAsync({ lotId, tiersId, estPrincipal: proprietaires.length === 0 })
      toast.success('Tiers créé et lié au lot')
    } catch (err: any) { toast.error(err.message || 'Erreur lors du lien') }
  }

  async function confirmUnlink() {
    if (!unlinkTarget) return
    try {
      await unlinkMutation.mutateAsync({ lotId, tiersId: unlinkTarget.id })
      toast.success('Propriétaire retiré')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
    setUnlinkTarget(null)
  }

  const avatarColors: Record<string, string> = {
    sky: 'bg-sky-100 text-sky-700', green: 'bg-green-100 text-green-700',
    violet: 'bg-violet-100 text-violet-700', amber: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer">
        <UsersThree className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-[13px] font-bold text-foreground">Tiers liés</span>
        {!isArchived && (
          <div className="ml-3" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary px-2" onClick={() => { setShowAdd(!showAdd); setOpen(true) }}>
              <Plus className="h-3 w-3 mr-1" /> Ajouter
            </Button>
          </div>
        )}
        <div className="ml-auto">{open ? <CaretUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <CaretDown className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
      </button>

      {open && (
        <div className="px-6 pb-5">
          {showAdd && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Rechercher un tiers..." className="pl-8 h-9 text-sm" autoFocus />
              </div>
              {searchResults && searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {searchResults.filter(t => !proprietaires.some(p => p.id === t.id)).map(t => (
                    <button key={t.id} onClick={() => handleLink(t.id)} className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors text-left">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{t.prenom ? `${t.prenom} ${t.nom}` : t.raison_sociale || t.nom}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowCreateTiers(true); setShowAdd(false) }}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors border-t border-border/30 mt-1 pt-2.5"
              >
                <Plus className="h-3.5 w-3.5" /> Créer un nouveau tiers
              </button>
            </div>
          )}

          {/* Propriétaires */}
          {proprietaires.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-2">Propriétaire(s)</p>
              <div className="space-y-0 divide-y divide-border/30">
                {proprietaires.map((p) => {
                  const displayName = p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom
                  const initial = (p.prenom?.[0] || p.nom[0]).toUpperCase()
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-3 group">
                      <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarColors.sky}`}>{initial}</div>
                      <Link to={`/app/tiers/${p.id}`} className="text-[14px] text-primary hover:underline font-medium flex-1 truncate">{displayName}</Link>
                      {p.est_principal && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700">Principal</span>}
                      {p.tel && <span className="text-[12px] text-muted-foreground">{p.tel}</span>}
                      {!isArchived && (
                        <button onClick={() => setUnlinkTarget({ id: p.id, name: displayName })} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"><X className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mandataire */}
          <div className="mb-3 border-t border-border/30 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Mandataire</p>
              {!isArchived && !showMandataireSearch && (
                <button onClick={() => setShowMandataireSearch(true)} className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors">
                  {mandataire ? 'Modifier' : '+ Assigner'}
                </button>
              )}
            </div>
            {showMandataireSearch && (
              <div className="mb-3 p-3 bg-violet-50/50 border border-violet-200/40 rounded-xl space-y-2 dark:bg-violet-950/20 dark:border-violet-800/30">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={mandataireSearchQ} onChange={(e) => setMandataireSearchQ(e.target.value)} placeholder="Rechercher un mandataire..." className="pl-8 h-9 text-sm" autoFocus />
                </div>
                {mandataireResults && mandataireResults.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {mandataireResults.map(t => (
                      <button key={t.id} onClick={() => handleSetMandataire(t.id)} className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-violet-100/60 rounded-lg transition-colors text-left dark:hover:bg-violet-950/40">
                        <BuildingOffice className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span className="font-medium text-foreground">{t.raison_sociale || (t.prenom ? `${t.prenom} ${t.nom}` : t.nom)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setShowCreateMandataire(true)} className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-violet-600 hover:bg-violet-100/60 rounded-lg transition-colors border-t border-border/30 mt-1 pt-2 dark:text-violet-400 dark:hover:bg-violet-950/40">
                  <Plus className="h-3.5 w-3.5" /> Créer un nouveau tiers
                </button>
                <div className="flex justify-between">
                  <button onClick={() => { setShowMandataireSearch(false); setMandataireSearchQ('') }} className="text-[11px] text-muted-foreground hover:text-foreground">Annuler</button>
                  {mandataire && <button onClick={() => handleSetMandataire(null)} className="text-[11px] text-red-500 hover:text-red-600">Retirer le mandataire</button>}
                </div>
              </div>
            )}
            {mandataire ? (
              <div className="flex items-center gap-3 py-2">
                <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarColors.violet}`}>{(mandataire.raison_sociale?.[0] || mandataire.nom[0]).toUpperCase()}</div>
                <Link to={`/app/tiers/${mandataire.id}`} className="text-[14px] text-primary hover:underline font-medium flex-1 truncate">{mandataire.raison_sociale || (mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.nom)}</Link>
                <ArrowSquareOut className="h-3.5 w-3.5 text-muted-foreground/30" />
              </div>
            ) : !showMandataireSearch && (
              <p className="text-sm text-muted-foreground/40 italic py-2">Aucun mandataire</p>
            )}
          </div>

          {/* Dernier locataire (read-only) */}
          {dernierLocataire && (
            <div className="border-t border-border/30 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-2">Dernier locataire</p>
              <div className="flex items-center gap-3 py-2">
                <div className="h-9 w-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold shrink-0 bg-green-100 text-green-700">{(dernierLocataire.prenom?.[0] || dernierLocataire.nom[0]).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <Link to={`/app/tiers/${dernierLocataire.id}`} className="text-[14px] text-primary hover:underline font-medium truncate block">{dernierLocataire.prenom ? `${dernierLocataire.prenom} ${dernierLocataire.nom}` : dernierLocataire.nom}</Link>
                  <span className="text-[12px] text-muted-foreground">{dernierLocataire.date_entree ? `Entrée ${formatDate(dernierLocataire.date_entree)}` : ''}{dernierLocataire.tel ? ` · ${dernierLocataire.tel}` : ''}</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-green-50 text-green-600 border border-green-200">Informatif</span>
              </div>
            </div>
          )}

          {proprietaires.length === 0 && !mandataire && !dernierLocataire && (
            <p className="text-sm text-muted-foreground/40 italic py-2">Aucun tiers lié</p>
          )}
        </div>
      )}

      <CreateTiersModal open={showCreateTiers} onOpenChange={setShowCreateTiers} onCreated={handleCreatedTiers} />
      <CreateTiersModal open={showCreateMandataire} onOpenChange={setShowCreateMandataire} onCreated={async (tiersId) => {
        await handleSetMandataire(tiersId)
        setShowCreateMandataire(false)
      }} />
      <ConfirmDialog
        open={!!unlinkTarget}
        onOpenChange={(v) => { if (!v) setUnlinkTarget(null) }}
        title="Retirer ce propriétaire ?"
        description={`${unlinkTarget?.name} ne sera plus lié à ce lot. Cette action est réversible.`}
        confirmLabel="Retirer"
        variant="destructive"
        onConfirm={confirmUnlink}
      />
    </div>
  )
}

/* ═══ Missions Table ═══ */
function MissionsTable({ lotId, isArchived }: { lotId: string; isArchived: boolean }) {
  const [open, setOpen] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const { data } = useMissions({ lot_id: lotId, limit: 20 })
  const missions = data?.data ?? []

  return (
    <>
    <CreateMissionModal open={showCreate} onOpenChange={setShowCreate} preselectedLotId={lotId} />
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer">
        <ClipboardText className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-[13px] font-bold text-foreground">Missions liées</span>
        {missions.length > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">{missions.length}</span>}
        {!isArchived && (
          <div className="ml-3" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary px-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-3 w-3 mr-1" /> Créer une mission
            </Button>
          </div>
        )}
        <div className="ml-auto">{open ? <CaretUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <CaretDown className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
      </button>

      {open && (
        <div className="px-2 pb-2">
          {missions.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/40 italic">Aucune mission réalisée pour ce lot</p>
              {!isArchived && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
                  <Plus className="h-3.5 w-3.5" /> Créer une mission
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Référence</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Type(s)</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Technicien</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => (
                  <tr key={m.id} className="border-b border-border/20 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => navigate(`/app/missions/${m.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: m.reference || 'Mission' }] } })}>
                    <td className="px-4 py-3 font-mono font-semibold text-[12px]">{m.reference}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(m.date_planifiee)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {m.edl_types?.map((type: string) => (
                          <span key={type} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${type === 'entree' || type === 'sortie' ? sensColors[type as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700'}`}>
                            {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inventaire'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.technicien_nom || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${missionStatutColors[m.statut]}`}>{missionStatutLabels[m.statut]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
    </>
  )
}
