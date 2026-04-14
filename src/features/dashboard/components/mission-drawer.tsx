import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar, Clock, User, MapPin, BuildingOffice, House,
  FileText, Key, Warning, CaretRight, UserPlus, ChatText,
  ArrowSquareOut, FilePdf, Globe, Scales, CheckCircle,
} from '@phosphor-icons/react'
import { Sheet, SheetContent } from 'src/components/ui/sheet'
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

// ── Labels ──

const statutEdlLabels: Record<string, string> = { brouillon: 'Brouillon', signe: 'Signé', infructueux: 'Infructueux' }
const statutEdlColors: Record<string, string> = {
  brouillon: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  signe: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  infructueux: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}
const typeBienLabels: Record<string, string> = { appartement: 'Appartement', maison: 'Maison', studio: 'Studio', local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre' }
const typeCleLabels: Record<string, string> = { cle_principale: 'Clé principale', badge: 'Badge', boite_aux_lettres: 'Boîte aux lettres', parking: 'Parking', cave: 'Cave', digicode: 'Digicode', autre: 'Autre' }
const statutCleLabels: Record<string, string> = { remise: 'Remise', a_deposer: 'À déposer', deposee: 'Déposée' }

// ── Shared UI ──

function Section({ icon: Icon, title, children, badge }: { icon: React.ElementType; title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" weight="duotone" />
          </div>
          <h3 className="text-[13px] font-semibold text-foreground tracking-tight">{title}</h3>
        </div>
        {badge}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{children}</span>
    </div>
  )
}

function PersonChip({ name, role, color, to }: { name: string; role: string; color: string; to: string }) {
  const colors: Record<string, string> = {
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  }
  return (
    <Link to={to} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors">
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${colors[color] || colors.sky}`}>
        {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">{role}</p>
      </div>
      <CaretRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
    </Link>
  )
}

// ── Skeleton ──

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <Skeleton className="h-14 rounded-2xl" />
      <div className="flex gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-6 w-24 rounded-full" /></div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  )
}

// ── Main Component ──

export function MissionDrawer({ missionId, open, onClose }: { missionId: string | null; open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { data: mission, isLoading } = useMissionDetail(missionId || undefined)
  const updateMission = useUpdateMission()
  const assignTech = useAssignTechnician()
  const updateInvitation = useUpdateInvitation()
  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  const [datePlanifiee, setDatePlanifiee] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [statutRdv, setStatutRdv] = useState<string>('')
  const [commentaire, setCommentaire] = useState('')
  const [planningDirty, setPlanningDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRevalidation, setShowRevalidation] = useState(false)
  const [selectedTechId, setSelectedTechId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (mission) {
      setDatePlanifiee((mission.date_planifiee || '').slice(0, 10))
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

  function handlePlanningChange(field: string, value: string) {
    if (field === 'date_planifiee') setDatePlanifiee(value)
    if (field === 'heure_debut') setHeureDebut(value)
    if (field === 'heure_fin') setHeureFin(value)
    if (field === 'statut_rdv') setStatutRdv(value)
    setPlanningDirty(true)
  }

  const planningDateChanged = mission && (
    datePlanifiee !== (mission.date_planifiee || '').slice(0, 10) ||
    heureDebut !== (mission.heure_debut || '') ||
    heureFin !== (mission.heure_fin || '')
  )
  const techAccepted = mission?.technicien?.statut_invitation === 'accepte'

  async function doSavePlanning(revalidate: boolean) {
    if (!mission) return
    setSaving(true)
    try {
      await updateMission.mutateAsync({ id: mission.id, date_planifiee: datePlanifiee, heure_debut: heureDebut || undefined, heure_fin: heureFin || undefined, statut_rdv: statutRdv as StatutRdv })
      if (revalidate && mission.technicien) await updateInvitation.mutateAsync({ missionId: mission.id, statut_invitation: 'en_attente' })
      setPlanningDirty(false); setShowRevalidation(false); toast.success('Planning mis à jour')
    } catch { toast.error('Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  function handleSavePlanning() {
    if (planningDateChanged && techAccepted) { setShowRevalidation(true); return }
    doSavePlanning(false)
  }

  async function handleSaveComment() {
    if (!mission) return
    setSaving(true)
    try { await updateMission.mutateAsync({ id: mission.id, commentaire }); toast.success('Commentaire enregistré') }
    catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  async function handleAssignTechnician() {
    if (!mission || !selectedTechId) return
    setAssigning(true)
    try { await assignTech.mutateAsync({ missionId: mission.id, user_id: selectedTechId }); setSelectedTechId(''); toast.success('Technicien assigné') }
    catch { toast.error("Erreur lors de l'assignation") }
    finally { setAssigning(false) }
  }

  function formatAddress(adresse: { rue: string; ville: string; code_postal: string } | null) {
    if (!adresse) return null
    return `${adresse.rue}, ${adresse.code_postal} ${adresse.ville}`
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent className="sm:max-w-[480px] p-0 overflow-y-auto border-0" side="right">
        {isLoading || !mission ? <DrawerSkeleton /> : (
          <div className="flex flex-col">

            {/* ═══ HERO HEADER ═══ */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mission</p>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{mission.reference}</h2>
                </div>
                <Badge className={`${missionStatutColors[mission.statut]} text-[11px] px-3 py-1`}>
                  {missionStatutLabels[mission.statut]}
                </Badge>
              </div>

              {/* Quick info row */}
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-2.5 py-1">
                  <Calendar className="h-3.5 w-3.5" weight="duotone" />
                  {formatDate(mission.date_planifiee)}
                </span>
                {mission.heure_debut && (
                  <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-2.5 py-1">
                    <Clock className="h-3.5 w-3.5" weight="duotone" />
                    {formatTime(mission.heure_debut)}{mission.heure_fin && ` — ${formatTime(mission.heure_fin)}`}
                  </span>
                )}
                {mission.technicien && (
                  <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-2.5 py-1">
                    <User className="h-3.5 w-3.5" weight="duotone" />
                    {mission.technicien.prenom} {mission.technicien.nom}
                  </span>
                )}
              </div>

              {/* Status banners */}
              {isTerminated && (
                <div className="flex items-center gap-2 mt-3 rounded-xl bg-amber-50 border border-amber-200/60 px-3 py-2 text-[12px] text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-300">
                  <Warning className="h-3.5 w-3.5 shrink-0" weight="fill" />
                  Mission terminée — édition limitée
                </div>
              )}
              {isCancelled && (
                <div className="flex items-center gap-2 mt-3 rounded-xl bg-red-50 border border-red-200/60 px-3 py-2 text-[12px] text-red-800 dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-300">
                  <Warning className="h-3.5 w-3.5 shrink-0" weight="fill" />
                  Annulée{mission.motif_annulation && ` — ${mission.motif_annulation}`}
                </div>
              )}
            </div>

            {/* ═══ CONTENT ═══ */}
            <div className="flex flex-col gap-6 px-6 py-5">

              {/* ── Pending actions ── */}
              {pendingActions.length > 0 && (
                <div className="space-y-2">
                  {pendingActions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200/50 px-3.5 py-2.5 dark:bg-amber-950/20 dark:border-amber-800/30">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                      <span className="text-[12px] font-medium text-amber-800 dark:text-amber-300">{action}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Planning ── */}
              <Section icon={Calendar} title="Planning">
                <div className="bg-muted/20 rounded-xl p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Date</Label>
                    <Input type="date" value={datePlanifiee} onChange={(e) => handlePlanningChange('date_planifiee', e.target.value)} disabled={isLocked} className="h-9" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Début</Label>
                      <Input type="time" value={heureDebut} onChange={(e) => handlePlanningChange('heure_debut', e.target.value)} disabled={isLocked} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Fin</Label>
                      <Input type="time" value={heureFin} onChange={(e) => handlePlanningChange('heure_fin', e.target.value)} disabled={isLocked} className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Statut RDV</Label>
                    <Select value={statutRdv} onValueChange={(v) => handlePlanningChange('statut_rdv', v)} disabled={isLocked}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Statut du RDV" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a_confirmer">À confirmer</SelectItem>
                        <SelectItem value="confirme">Confirmé</SelectItem>
                        <SelectItem value="reporte">Reporté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {planningDirty && !isLocked && !showRevalidation && (
                    <Button size="sm" onClick={handleSavePlanning} disabled={saving} className="w-full h-9">
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  )}

                  {showRevalidation && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 dark:bg-amber-950/30 space-y-2.5">
                      <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Le technicien a accepté. Que faire ?</p>
                      <div className="flex gap-2">
                        <Button size="xs" variant="outline" onClick={() => doSavePlanning(true)} disabled={saving}>Revalidation</Button>
                        <Button size="xs" onClick={() => doSavePlanning(false)} disabled={saving}>Confirmer</Button>
                        <Button size="xs" variant="ghost" onClick={() => setShowRevalidation(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Technicien ── */}
              <Section icon={User} title="Technicien">
                {mission.technicien ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                      {mission.technicien.prenom?.[0]}{mission.technicien.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{mission.technicien.prenom} {mission.technicien.nom}</p>
                      {mission.technicien.email && <p className="text-[11px] text-muted-foreground truncate">{mission.technicien.email}</p>}
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${
                      mission.technicien.statut_invitation === 'accepte' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
                        : mission.technicien.statut_invitation === 'refuse' ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}>
                      {statutInvitationLabels[mission.technicien.statut_invitation]}
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                      <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center"><UserPlus className="h-4 w-4 text-muted-foreground/40" /></div>
                      <p className="text-[13px] text-muted-foreground/50 italic">Aucun technicien</p>
                    </div>
                    {!isLocked && (
                      <div className="flex gap-2">
                        <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                          <SelectTrigger className="flex-1 h-9"><SelectValue placeholder="Assigner..." /></SelectTrigger>
                          <SelectContent>
                            {technicians.map((t) => <SelectItem key={t.id} value={t.id}>{t.prenom} {t.nom}</SelectItem>)}
                            {technicians.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">Aucun disponible</div>}
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="outline" onClick={handleAssignTechnician} disabled={!selectedTechId || assigning} className="h-9 w-9 shrink-0">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* ── Documents EDL ── */}
              <Section icon={FileText} title="Documents EDL" badge={
                mission.edls.length > 0 ? <span className="text-[11px] text-muted-foreground">{mission.edls.length} doc{mission.edls.length > 1 ? 's' : ''}</span> : undefined
              }>
                {mission.edls.length === 0 ? (
                  <div className="flex flex-col items-center py-6 rounded-xl bg-muted/20">
                    <FileText className="h-8 w-8 text-muted-foreground/20 mb-2" />
                    <p className="text-[12px] text-muted-foreground/40 italic">Aucun EDL associé</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {mission.edls.map((edl) => (
                      <div key={edl.id} className={`rounded-xl border overflow-hidden ${edl.statut === 'signe' ? 'bg-green-50/40 border-green-200/50 dark:bg-green-950/10 dark:border-green-800/30' : 'bg-muted/20 border-border/30'}`}>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Badge className={`${sensColors[edl.sens]} text-[10px]`}>{sensLabels[edl.sens]}</Badge>
                            <span className="text-[13px] font-semibold capitalize">{edl.type === 'inventaire' ? 'Inventaire' : 'EDL'}</span>
                          </div>
                          <Badge className={`${statutEdlColors[edl.statut] || ''} text-[10px]`}>{statutEdlLabels[edl.statut] || edl.statut}</Badge>
                        </div>

                        {edl.locataires.length > 0 && (
                          <div className="px-4 pb-2 flex flex-wrap gap-1">
                            {edl.locataires.map((l) => (
                              <span key={l.tiers_id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${l.role_locataire === 'entrant' ? 'bg-green-100/80 text-green-700' : 'bg-orange-100/80 text-orange-700'}`}>
                                {l.prenom ? `${l.prenom} ${l.nom}` : l.nom}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Document links */}
                        <div className="border-t border-border/20 px-4 py-2.5 flex flex-wrap gap-1.5">
                          {[
                            { url: edl.url_pdf, icon: FilePdf, label: 'PDF', color: 'text-red-500' },
                            { url: edl.url_web, icon: Globe, label: 'Web', color: 'text-blue-500' },
                            { url: edl.url_pdf_legal, icon: Scales, label: 'PDF légal', color: 'text-violet-500' },
                            { url: edl.url_web_legal, icon: Globe, label: 'Web légal', color: 'text-violet-500' },
                          ].map(({ url, icon: LIcon, label, color }) => url ? (
                            <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-card border border-border/40 text-foreground/70 hover:text-foreground hover:border-border transition-colors">
                              <LIcon className={`h-3.5 w-3.5 ${color}`} />{label}
                            </a>
                          ) : (
                            <span key={label} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted/30 border border-border/15 text-muted-foreground/30 cursor-not-allowed" title={edl.statut === 'signe' ? 'En attente de génération' : 'Disponible après signature'}>
                              <LIcon className="h-3.5 w-3.5" />{label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── Clés ── */}
              {mission.cles.length > 0 && (
                <Section icon={Key} title="Clés">
                  <div className="space-y-2">
                    {mission.cles.map((cle) => (
                      <div key={cle.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center">
                            <Key className="h-3.5 w-3.5 text-muted-foreground" weight="duotone" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium">{typeCleLabels[cle.type_cle] || cle.type_cle}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {cle.quantite > 1 && `x${cle.quantite}`}
                              {cle.lieu_depot && ` · ${cle.lieu_depot}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{statutCleLabels[cle.statut] || cle.statut}</Badge>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* ── Lot & Bâtiment ── */}
              <Section icon={House} title="Lot & Bâtiment">
                <div className="space-y-2">
                  <Link to={`/app/patrimoine/lots/${mission.lot.id}`} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-accent/50 transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 dark:bg-blue-950">
                      <House className="h-4 w-4 text-blue-600 dark:text-blue-400" weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">{mission.lot.designation}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{typeBienLabels[mission.lot.type_bien] || mission.lot.type_bien}</span>
                        {mission.lot.etage && <><span className="text-muted-foreground/30">·</span><span>Étage {mission.lot.etage}</span></>}
                        {mission.lot.surface && <><span className="text-muted-foreground/30">·</span><span>{mission.lot.surface} m²</span></>}
                      </div>
                    </div>
                    <ArrowSquareOut className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                  </Link>

                  <Link to={`/app/patrimoine/batiments/${mission.lot.batiment.id}`} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-accent/50 transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 dark:bg-violet-950">
                      <BuildingOffice className="h-4 w-4 text-violet-600 dark:text-violet-400" weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">{mission.lot.batiment.designation}</p>
                      {mission.lot.adresse && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" weight="duotone" />
                          {formatAddress(mission.lot.adresse)}
                        </p>
                      )}
                    </div>
                    <ArrowSquareOut className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                </div>
              </Section>

              {/* ── Parties ── */}
              <Section icon={User} title="Parties">
                <div className="rounded-xl bg-muted/20 overflow-hidden divide-y divide-border/20">
                  {mission.proprietaires.map((p) => (
                    <PersonChip key={p.id} name={p.prenom ? `${p.prenom} ${p.nom}` : p.nom} role="Propriétaire" color="sky" to={`/app/tiers/${p.id}`} />
                  ))}
                  {mission.edls.flatMap(edl => edl.locataires.map((l) => (
                    <PersonChip key={`${edl.id}-${l.tiers_id}`} name={l.prenom ? `${l.prenom} ${l.nom}` : l.nom} role={l.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'} color={l.role_locataire === 'entrant' ? 'green' : 'orange'} to={`/app/tiers/${l.tiers_id}`} />
                  )))}
                  {mission.mandataire && (
                    <PersonChip name={mission.mandataire.raison_sociale || mission.mandataire.nom} role="Mandataire" color="violet" to={`/app/tiers/${mission.mandataire.id}`} />
                  )}
                  {mission.proprietaires.length === 0 && !mission.mandataire && mission.edls.every(e => e.locataires.length === 0) && (
                    <div className="py-4 text-center">
                      <p className="text-[12px] text-muted-foreground/40 italic">Aucun tiers lié</p>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Commentaire ── */}
              <Section icon={ChatText} title="Commentaire">
                <div className="space-y-2.5">
                  <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ajouter un commentaire..." rows={3} className="resize-none" />
                  {commentaire !== (mission.commentaire || '') && (
                    <Button size="sm" variant="outline" onClick={handleSaveComment} disabled={saving} className="w-full h-9">
                      {saving ? 'Enregistrement...' : 'Enregistrer le commentaire'}
                    </Button>
                  )}
                </div>
              </Section>

              {/* ── Footer ── */}
              <div className="pt-2 pb-4">
                <Button
                  variant="outline"
                  className="w-full h-11 justify-between text-[13px] font-semibold rounded-xl"
                  onClick={() => { onClose(); navigate(`/app/missions/${mission.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference || 'Mission' }] } }) }}
                >
                  Ouvrir la fiche complète
                  <ArrowSquareOut className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
