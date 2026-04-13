import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar, Clock, User, MapPin, BuildingOffice, House,
  FileText, Key, Warning, CaretRight, UserPlus,
} from '@phosphor-icons/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from 'src/components/ui/sheet'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select'
import { Skeleton } from 'src/components/ui/skeleton'
import {
  useMissionDetail, useUpdateMission, useAssignTechnician, useUpdateInvitation, useWorkspaceTechnicians,
} from '../../missions/api'
import {
  missionStatutLabels, missionStatutColors,
  sensLabels, sensColors,
  statutRdvLabels, statutInvitationLabels,
  getPendingActions,
} from '../../missions/types'
import type { StatutRdv } from '../../missions/types'
import { formatDate, formatTime } from 'src/lib/formatters'
import { toast } from 'sonner'

// ── EDL status helpers ──

const statutEdlLabels: Record<string, string> = {
  brouillon: 'Brouillon',
  signe: 'Signé',
  infructueux: 'Infructueux',
}

const statutEdlColors: Record<string, string> = {
  brouillon: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  signe: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  infructueux: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local commercial',
  parking: 'Parking',
  cave: 'Cave',
  autre: 'Autre',
}

const typeCleLabels: Record<string, string> = {
  cle_principale: 'Clé principale',
  badge: 'Badge',
  boite_aux_lettres: 'Boîte aux lettres',
  parking: 'Parking',
  cave: 'Cave',
  digicode: 'Digicode',
  autre: 'Autre',
}

const statutCleLabels: Record<string, string> = {
  remise: 'Remise',
  a_deposer: 'À déposer',
  deposee: 'Déposée',
}

// ── Separator ──

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-b border-border">
      <Icon className="h-4 w-4 text-muted-foreground" weight="duotone" />
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
    </div>
  )
}

// ── Loading state ──

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-9 w-1/2" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

// ── Main Component ──

export function MissionDrawer({
  missionId,
  open,
  onClose,
}: {
  missionId: string | null
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { data: mission, isLoading } = useMissionDetail(missionId || undefined)
  const updateMission = useUpdateMission()
  const assignTech = useAssignTechnician()
  const updateInvitation = useUpdateInvitation()
  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  // ── Planning form state ──
  const [datePlanifiee, setDatePlanifiee] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [statutRdv, setStatutRdv] = useState<string>('')
  const [commentaire, setCommentaire] = useState('')
  const [planningDirty, setPlanningDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRevalidation, setShowRevalidation] = useState(false)

  // ── Technician assignment ──
  const [selectedTechId, setSelectedTechId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  // Sync form with mission data
  useEffect(() => {
    if (mission) {
      setDatePlanifiee(mission.date_planifiee || '')
      setHeureDebut(mission.heure_debut || '')
      setHeureFin(mission.heure_fin || '')
      setStatutRdv(mission.statut_rdv || '')
      setCommentaire(mission.commentaire || '')
      setPlanningDirty(false)
      setSelectedTechId('')
    }
  }, [mission])

  const isTerminated = mission?.statut === 'terminee'
  const isCancelled = mission?.statut === 'annulee'
  const isLocked = isTerminated || isCancelled
  const pendingActions = mission ? getPendingActions(mission) : []

  // ── Handlers ──

  function handlePlanningChange(field: string, value: string) {
    if (field === 'date_planifiee') setDatePlanifiee(value)
    if (field === 'heure_debut') setHeureDebut(value)
    if (field === 'heure_fin') setHeureFin(value)
    if (field === 'statut_rdv') setStatutRdv(value)
    setPlanningDirty(true)
  }

  const planningDateChanged = mission && (
    datePlanifiee !== (mission.date_planifiee || '') ||
    heureDebut !== (mission.heure_debut || '') ||
    heureFin !== (mission.heure_fin || '')
  )
  const techAccepted = mission?.technicien?.statut_invitation === 'accepte'

  async function doSavePlanning(revalidate: boolean) {
    if (!mission) return
    setSaving(true)
    try {
      await updateMission.mutateAsync({
        id: mission.id,
        date_planifiee: datePlanifiee,
        heure_debut: heureDebut || undefined,
        heure_fin: heureFin || undefined,
        statut_rdv: statutRdv as StatutRdv,
      })
      if (revalidate && mission.technicien) {
        await updateInvitation.mutateAsync({ missionId: mission.id, statut_invitation: 'en_attente' })
      }
      setPlanningDirty(false)
      setShowRevalidation(false)
      toast.success('Planning mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  function handleSavePlanning() {
    if (planningDateChanged && techAccepted) {
      setShowRevalidation(true)
      return
    }
    doSavePlanning(false)
  }

  async function handleSaveComment() {
    if (!mission) return
    setSaving(true)
    try {
      await updateMission.mutateAsync({ id: mission.id, commentaire })
      toast.success('Commentaire enregistré')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleAssignTechnician() {
    if (!mission || !selectedTechId) return
    setAssigning(true)
    try {
      await assignTech.mutateAsync({ missionId: mission.id, user_id: selectedTechId })
      setSelectedTechId('')
      toast.success('Technicien assigné')
    } catch {
      toast.error('Erreur lors de l\'assignation')
    } finally {
      setAssigning(false)
    }
  }

  // ── Address helper ──
  function formatAddress(adresse: { rue: string; ville: string; code_postal: string } | null) {
    if (!adresse) return null
    return `${adresse.rue}, ${adresse.code_postal} ${adresse.ville}`
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent className="sm:max-w-lg overflow-y-auto" side="right">

        {isLoading || !mission ? (
          <>
            <SheetHeader>
              <SheetTitle>
                <Skeleton className="h-6 w-36" />
              </SheetTitle>
            </SheetHeader>
            <DrawerSkeleton />
          </>
        ) : (
          <>
            {/* ────────────────────────────────────────────
                SECTION 1 — EN-TETE
            ──────────────────────────────────────────── */}
            <SheetHeader className="pb-0">
              <SheetTitle className="text-xl font-bold">{mission.reference}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6">

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={missionStatutColors[mission.statut]}>
                  {missionStatutLabels[mission.statut]}
                </Badge>
                <Badge variant="outline">
                  {statutRdvLabels[mission.statut_rdv]}
                </Badge>
                {mission.technicien && (
                  <Badge variant="outline">
                    {statutInvitationLabels[mission.technicien.statut_invitation]}
                  </Badge>
                )}
              </div>

              {/* Date + time summary */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" weight="duotone" />
                  {formatDate(mission.date_planifiee)}
                </span>
                {mission.heure_debut && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" weight="duotone" />
                    {formatTime(mission.heure_debut)}
                    {mission.heure_fin && ` - ${formatTime(mission.heure_fin)}`}
                  </span>
                )}
                {mission.technicien && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" weight="duotone" />
                    {mission.technicien.prenom} {mission.technicien.nom}
                  </span>
                )}
              </div>

              {/* ── Status banners ── */}
              {isTerminated && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  <Warning className="h-4 w-4 shrink-0" weight="fill" />
                  Mission terminée — édition limitée
                </div>
              )}
              {isCancelled && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                  <Warning className="h-4 w-4 shrink-0" weight="fill" />
                  Mission annulée
                  {mission.motif_annulation && (
                    <span className="text-red-600 dark:text-red-400"> — {mission.motif_annulation}</span>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────
                  SECTION 2 — PLANNING
              ──────────────────────────────────────────── */}
              <SectionTitle icon={Calendar}>Planning</SectionTitle>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="drawer-date">Date</Label>
                  <Input
                    id="drawer-date"
                    type="date"
                    value={datePlanifiee}
                    onChange={(e) => handlePlanningChange('date_planifiee', e.target.value)}
                    disabled={isLocked}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-debut">Heure début</Label>
                    <Input
                      id="drawer-debut"
                      type="time"
                      value={heureDebut}
                      onChange={(e) => handlePlanningChange('heure_debut', e.target.value)}
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-fin">Heure fin</Label>
                    <Input
                      id="drawer-fin"
                      type="time"
                      value={heureFin}
                      onChange={(e) => handlePlanningChange('heure_fin', e.target.value)}
                      disabled={isLocked}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="drawer-rdv">Statut RDV</Label>
                  <Select
                    value={statutRdv}
                    onValueChange={(v) => handlePlanningChange('statut_rdv', v)}
                    disabled={isLocked}
                  >
                    <SelectTrigger id="drawer-rdv">
                      <SelectValue placeholder="Statut du RDV" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_confirmer">À confirmer</SelectItem>
                      <SelectItem value="confirme">Confirmé</SelectItem>
                      <SelectItem value="reporte">Reporté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {planningDirty && !isLocked && !showRevalidation && (
                  <Button
                    size="sm"
                    onClick={handleSavePlanning}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer le planning'}
                  </Button>
                )}

                {showRevalidation && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 dark:bg-amber-950/30 space-y-2">
                    <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Le technicien a déjà accepté. Que faire ?</p>
                    <div className="flex gap-2">
                      <Button size="xs" variant="outline" onClick={() => doSavePlanning(true)} disabled={saving}>Revalidation</Button>
                      <Button size="xs" onClick={() => doSavePlanning(false)} disabled={saving}>Confirmer d'office</Button>
                      <Button size="xs" variant="ghost" onClick={() => setShowRevalidation(false)} disabled={saving}>Annuler</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ────────────────────────────────────────────
                  SECTION 3 — TECHNICIEN
              ──────────────────────────────────────────── */}
              <SectionTitle icon={User}>Technicien</SectionTitle>

              {mission.technicien ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {mission.technicien.prenom?.[0]}{mission.technicien.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {mission.technicien.prenom} {mission.technicien.nom}
                      </p>
                      {mission.technicien.est_principal && (
                        <p className="text-[11px] text-muted-foreground">Principal</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      mission.technicien.statut_invitation === 'accepte'
                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
                        : mission.technicien.statut_invitation === 'refuse'
                          ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }
                  >
                    {statutInvitationLabels[mission.technicien.statut_invitation]}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground italic">Aucun technicien assigné</p>
                  {!isLocked && (
                    <div className="flex gap-2">
                      <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner un technicien..." />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.prenom} {t.nom}
                            </SelectItem>
                          ))}
                          {technicians.length === 0 && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              Aucun technicien disponible
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleAssignTechnician}
                        disabled={!selectedTechId || assigning}
                        title="Assigner"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────
                  SECTION 4 — ACTIONS EN ATTENTE (conditional)
              ──────────────────────────────────────────── */}
              {pendingActions.length > 0 && (
                <>
                  <SectionTitle icon={Warning}>Actions en attente</SectionTitle>
                  <ul className="space-y-2">
                    {pendingActions.map((action, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/50"
                      >
                        <Warning className="h-4 w-4 text-amber-600 shrink-0 dark:text-amber-400" weight="fill" />
                        <span className="text-amber-800 dark:text-amber-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* ────────────────────────────────────────────
                  SECTION 5 — DOCUMENTS EDL
              ──────────────────────────────────────────── */}
              <SectionTitle icon={FileText}>Documents EDL</SectionTitle>

              {mission.edls.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucun EDL associé</p>
              ) : (
                <div className="space-y-2">
                  {mission.edls.map((edl) => (
                    <div
                      key={edl.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2.5"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge className={sensColors[edl.sens]}>
                            {sensLabels[edl.sens]}
                          </Badge>
                          <span className="text-sm font-medium capitalize">
                            {edl.type === 'inventaire' ? 'Inventaire' : 'EDL'}
                          </span>
                        </div>
                        {edl.locataires.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {edl.locataires.map((l) => (
                              <span key={l.tiers_id} className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${l.role_locataire === 'entrant' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'}`}>
                                {l.prenom ? `${l.prenom} ${l.nom}` : l.nom} ({l.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge className={statutEdlColors[edl.statut] || ''}>
                        {statutEdlLabels[edl.statut] || edl.statut}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Clés (if any) ── */}
              {mission.cles.length > 0 && (
                <>
                  <SectionTitle icon={Key}>Clés</SectionTitle>
                  <div className="space-y-2">
                    {mission.cles.map((cle) => (
                      <div
                        key={cle.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <Key className="h-3.5 w-3.5 text-muted-foreground" weight="duotone" />
                          <span>{typeCleLabels[cle.type_cle] || cle.type_cle}</span>
                          {cle.quantite > 1 && (
                            <span className="text-muted-foreground">x{cle.quantite}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {cle.lieu_depot && (
                            <span className="text-xs text-muted-foreground">{cle.lieu_depot}</span>
                          )}
                          <Badge variant="outline" className="text-[11px]">
                            {statutCleLabels[cle.statut] || cle.statut}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ────────────────────────────────────────────
                  SECTION 6 — LOT & BATIMENT
              ──────────────────────────────────────────── */}
              <SectionTitle icon={House}>Lot & Bâtiment</SectionTitle>

              <div className="space-y-3">
                {/* Lot */}
                <Link
                  to={`/app/patrimoine/lots/${mission.lot.id}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2.5">
                    <House className="h-4 w-4 text-muted-foreground" weight="duotone" />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {mission.lot.designation}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{typeBienLabels[mission.lot.type_bien] || mission.lot.type_bien}</span>
                        {mission.lot.etage && <span>Étage {mission.lot.etage}</span>}
                        {mission.lot.surface && <span>{mission.lot.surface} m²</span>}
                      </div>
                    </div>
                  </div>
                  <CaretRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>

                {/* Batiment */}
                <Link
                  to={`/app/patrimoine/batiments/${mission.lot.batiment.id}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2.5">
                    <BuildingOffice className="h-4 w-4 text-muted-foreground" weight="duotone" />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {mission.lot.batiment.designation}
                      </p>
                      {mission.lot.adresse && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" weight="duotone" />
                          {formatAddress(mission.lot.adresse)}
                        </p>
                      )}
                    </div>
                  </div>
                  <CaretRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>

              {/* ────────────────────────────────────────────
                  SECTION 7 — PARTIES (Proprietaires & Mandataire)
              ──────────────────────────────────────────── */}
              <SectionTitle icon={User}>Parties</SectionTitle>

              <div className="space-y-3">
                {/* Propriétaires */}
                {mission.proprietaires.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Propriétaire{mission.proprietaires.length > 1 ? 's' : ''}
                    </p>
                    {mission.proprietaires.map((p) => (
                      <Link
                        key={p.id}
                        to={`/app/tiers/${p.id}`}
                        className="group flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                            {p.prenom?.[0] || p.nom[0]}{p.nom[0]}
                          </div>
                          <span className="text-sm group-hover:text-primary transition-colors">
                            {p.prenom ? `${p.prenom} ${p.nom}` : p.nom}
                          </span>
                        </div>
                        <CaretRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Aucun propriétaire associé</p>
                )}

                {/* Mandataire */}
                {mission.mandataire && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Mandataire
                    </p>
                    <Link
                      to={`/app/tiers/${mission.mandataire.id}`}
                      className="group flex items-center justify-between rounded-lg border border-border bg-surface-sunken px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {(mission.mandataire.raison_sociale || mission.mandataire.nom)[0]}
                        </div>
                        <span className="text-sm group-hover:text-primary transition-colors">
                          {mission.mandataire.raison_sociale || mission.mandataire.nom}
                        </span>
                      </div>
                      <CaretRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </div>
                )}
              </div>

              {/* ── Commentaire (always editable) ── */}
              <div className="space-y-2">
                <Label htmlFor="drawer-comment" className="text-sm font-medium">
                  Commentaire
                </Label>
                <Textarea
                  id="drawer-comment"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                  className="resize-none"
                />
                {commentaire !== (mission.commentaire || '') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveComment}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer le commentaire'}
                  </Button>
                )}
              </div>

              {/* ────────────────────────────────────────────
                  FOOTER — Link to full page
              ──────────────────────────────────────────── */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sm font-medium text-primary hover:text-primary"
                  onClick={() => {
                    onClose()
                    navigate(`/app/missions/${mission.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference || 'Mission' }] } })
                  }}
                >
                  Ouvrir la fiche complète
                  <CaretRight className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </>
        )}

      </SheetContent>
    </Sheet>
  )
}
