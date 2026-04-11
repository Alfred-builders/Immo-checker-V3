import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  CaretDown, CaretUp, PencilSimple, Prohibit,
  BuildingOffice, UsersThree, Calendar, User, FileText, Key,
  ChatText, Warning, ArrowSquareOut, Lock, MapPin, Clock, House,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { useMissionDetail, useUpdateMission, useAssignTechnician, useUpdateCle, useUpdateInvitation, useWorkspaceTechnicians } from '../api'
import { FloatingSaveBar } from 'src/components/shared/floating-save-bar'
import { CancelMissionModal } from './cancel-mission-modal'
import { formatDate, formatTime } from 'src/lib/formatters'
import { toast } from 'sonner'
import type { MissionDetail, CleMission, StatutRdv, StatutCle } from '../types'
import {
  missionStatutLabels, missionStatutColors,
  statutRdvLabels, statutInvitationLabels,
  sensLabels, sensColors,
  typeCleLabels, statutCleLabels, statutCleColors,
  getStatutDerive, getPendingActions,
} from '../types'

/* ---- Revalidation Dialog (S3-3) ---- */
function RevalidationDialog({ open, onOpenChange, onRevalidate, onConfirmDirectly, saving }: {
  open: boolean; onOpenChange: (open: boolean) => void; onRevalidate: () => void; onConfirmDirectly: () => void; saving: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Warning className="h-5 w-5 text-amber-600" />
            Revalidation technicien
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Le technicien a deja accepte cette mission. Que souhaitez-vous faire ?</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={onRevalidate} disabled={saving} className="justify-start">Demander revalidation</Button>
            <p className="text-[10px] text-muted-foreground/60 ml-1 -mt-1">Le technicien devra re-accepter la mission avec les nouvelles dates.</p>
            <Button onClick={onConfirmDirectly} disabled={saving} className="justify-start">Confirmer d'office</Button>
            <p className="text-[10px] text-muted-foreground/60 ml-1 -mt-1">Les modifications seront enregistrees sans demander revalidation.</p>
          </div>
          <div className="flex justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const statutDotColors: Record<string, string> = {
  planifiee: 'bg-sky-500',
  assignee: 'bg-amber-500',
  terminee: 'bg-green-500',
  annulee: 'bg-red-400',
}

export function MissionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: mission, isLoading } = useMissionDetail(id)
  const updateMission = useUpdateMission()
  const assignTech = useAssignTechnician()
  const updateCle = useUpdateCle()
  const updateInvitation = useUpdateInvitation()
  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  const [showCancel, setShowCancel] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRevalidation, setShowRevalidation] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    lot: true, parties: true, planning: true, technicien: true, documents: true, cles: true, commentaire: true,
  })

  function toggleSection(key: string) { setOpenSections(prev => ({ ...prev, [key]: !prev[key] })) }

  const [formData, setFormData] = useState({ date_planifiee: '', heure_debut: '', heure_fin: '', statut_rdv: '' as string, commentaire: '' })

  useEffect(() => {
    if (mission) setFormData({ date_planifiee: mission.date_planifiee || '', heure_debut: mission.heure_debut || '', heure_fin: mission.heure_fin || '', statut_rdv: mission.statut_rdv || '', commentaire: mission.commentaire || '' })
  }, [mission, editing])

  const isTerminated = mission?.statut === 'terminee'
  const isCancelled = mission?.statut === 'annulee'
  const isLocked = isTerminated || isCancelled
  const pendingActions = mission ? getPendingActions(mission) : []
  const planningChanged = mission && (formData.date_planifiee !== (mission.date_planifiee || '') || formData.heure_debut !== (mission.heure_debut || '') || formData.heure_fin !== (mission.heure_fin || ''))
  const techAccepted = mission?.technicien?.statut_invitation === 'accepte'

  async function doSave(revalidate: boolean) {
    if (!mission) return
    setSaving(true)
    try {
      await updateMission.mutateAsync({ id: mission.id, ...(isTerminated ? {} : { date_planifiee: formData.date_planifiee, heure_debut: formData.heure_debut || undefined, heure_fin: formData.heure_fin || undefined, statut_rdv: formData.statut_rdv as StatutRdv }), commentaire: formData.commentaire })
      if (revalidate && mission.technicien) await updateInvitation.mutateAsync({ missionId: mission.id, statut_invitation: 'en_attente' })
      toast.success('Mission mise à jour'); setEditing(false); setShowRevalidation(false)
    } catch (err: any) { toast.error(err.message || 'Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  async function handleSave() {
    if (!mission) return
    if (planningChanged && techAccepted && !isTerminated) { setShowRevalidation(true); return }
    await doSave(false)
  }

  async function handleAssignTechnician(userId: string) {
    if (!mission) return
    try { await assignTech.mutateAsync({ missionId: mission.id, user_id: userId }); toast.success('Technicien assigne') }
    catch (err: any) { toast.error(err.message || 'Erreur lors de l\'assignation') }
  }

  async function handleUpdateCleStatut(cle: CleMission, newStatut: StatutCle) {
    try { await updateCle.mutateAsync({ edlId: cle.edl_id, cleId: cle.id, statut: newStatut }); toast.success('Statut de la cle mis a jour') }
    catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleUpdateCleLieuDepot(cle: CleMission, lieu: string) {
    try { await updateCle.mutateAsync({ edlId: cle.edl_id, cleId: cle.id, lieu_depot: lieu }) } catch {}
  }

  const hasEdits = mission && (formData.date_planifiee !== (mission.date_planifiee || '') || formData.heure_debut !== (mission.heure_debut || '') || formData.heure_fin !== (mission.heure_fin || '') || formData.statut_rdv !== (mission.statut_rdv || '') || formData.commentaire !== (mission.commentaire || ''))

  if (isLoading) return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto space-y-6">
      <Skeleton className="h-8 w-48 rounded-full" />
      <Skeleton className="h-5 w-96 rounded-full" />
      <div className="grid grid-cols-3 gap-4"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>
      <div className="grid grid-cols-2 gap-6"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
    </div>
  )

  if (!mission) return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto">
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4"><FileText className="h-6 w-6 text-muted-foreground/50" /></div>
        <p className="text-sm font-semibold text-muted-foreground">Mission introuvable</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/app/missions')}>Retour aux missions</Button>
      </div>
    </div>
  )

  const techName = mission.technicien ? `${mission.technicien.prenom} ${mission.technicien.nom}` : null
  const techInitials = mission.technicien ? `${mission.technicien.prenom[0]}${mission.technicien.nom[0]}`.toUpperCase() : null

  return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto space-y-6">
      {showCancel && <CancelMissionModal open={showCancel} onOpenChange={setShowCancel} missionId={mission.id} missionStatut={mission.statut} />}
      <RevalidationDialog open={showRevalidation} onOpenChange={setShowRevalidation} onRevalidate={() => doSave(true)} onConfirmDirectly={() => doSave(false)} saving={saving} />

      {/* ── Hero header ── */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
        <div className="px-7 py-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              {/* Reference + pills */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{mission.reference}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${missionStatutColors[mission.statut]}`}>
                  {missionStatutLabels[mission.statut]}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  mission.statut_rdv === 'confirme' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : mission.statut_rdv === 'reporte' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  RDV: {statutRdvLabels[mission.statut_rdv]}
                </span>
                {mission.edl_types.map((type) => (
                  <span key={type} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    type === 'entree' || type === 'sortie' ? sensColors[type as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                  }`}>
                    {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inventaire'}
                  </span>
                ))}
              </div>

              {/* Lot + address */}
              <p className="text-sm text-foreground font-medium">
                {mission.lot_designation}
                <span className="text-muted-foreground font-normal"> — {mission.lot.batiment.designation}</span>
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{formatDate(mission.date_planifiee)}</span>
                {mission.heure_debut && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{formatTime(mission.heure_debut)}{mission.heure_fin ? ` - ${formatTime(mission.heure_fin)}` : ''}</span>}
                {techName && <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{techName}</span>}
                {mission.lot.adresse && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{mission.lot.adresse.rue}, {mission.lot.adresse.ville}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!isCancelled && (
                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                  <PencilSimple className="h-3.5 w-3.5" /> Modifier
                </Button>
              )}
              {!isLocked && (
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowCancel(true)}>
                  <Prohibit className="h-3.5 w-3.5" /> Annuler
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alert banners */}
        {isTerminated && (
          <div className="border-t border-amber-200 bg-amber-50/60 px-7 py-3 flex items-center gap-3 dark:bg-amber-950/40 dark:border-amber-800">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300">Mission terminee — edition limitee. Seuls le commentaire et les cles sont modifiables.</p>
          </div>
        )}
        {isCancelled && mission.motif_annulation && (
          <div className="border-t border-red-200 bg-red-50/60 px-7 py-3 flex items-center gap-3 dark:bg-red-950/40 dark:border-red-800">
            <Prohibit className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <div><p className="text-xs font-semibold text-red-800 dark:text-red-300">Mission annulee</p><p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">{mission.motif_annulation}</p></div>
          </div>
        )}
        {pendingActions.length > 0 && (
          <div className="border-t border-orange-200 bg-orange-50/60 px-7 py-3 flex items-center gap-3 dark:bg-orange-950/40 dark:border-orange-800">
            <Warning className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="flex items-center gap-3 text-xs text-orange-800 dark:text-orange-300">
              {pendingActions.map((action, i) => (
                <span key={i} className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />{action}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Content — balanced rows ── */}

      {/* Row 1: Bien = Planning + Technicien */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Bien" icon={House} open={openSections.lot} onToggle={() => toggleSection('lot')}>
          <div className="space-y-0 divide-y divide-border/30">
            <InfoRow label="Designation"><Link to={`/app/patrimoine/lots/${mission.lot.id}`} className="text-primary hover:underline font-medium">{mission.lot.designation}</Link></InfoRow>
            <InfoRow label="Type"><span className="capitalize">{mission.lot.type_bien}</span></InfoRow>
            <InfoRow label="Batiment"><Link to={`/app/patrimoine/batiments/${mission.lot.batiment.id}`} className="text-primary hover:underline">{mission.lot.batiment.designation}</Link></InfoRow>
            {mission.lot.adresse && <InfoRow label="Adresse">{mission.lot.adresse.rue}, {mission.lot.adresse.code_postal} {mission.lot.adresse.ville}</InfoRow>}
            {mission.lot.etage && <InfoRow label="Etage">{mission.lot.etage}</InfoRow>}
            {mission.lot.surface && <InfoRow label="Surface">{mission.lot.surface} m²</InfoRow>}
          </div>
        </Section>

        <div className="space-y-5">
          {/* Planning */}
          <Section title="Planning" icon={Calendar} open={openSections.planning} onToggle={() => toggleSection('planning')}>
            {editing && !isTerminated ? (
              <div className="space-y-3">
                <div className="space-y-1.5"><Label className="text-xs">Date</Label><Input type="date" value={formData.date_planifiee} onChange={(e) => setFormData(prev => ({ ...prev, date_planifiee: e.target.value }))} className="h-9" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Heure debut</Label><Input type="time" value={formData.heure_debut} onChange={(e) => setFormData(prev => ({ ...prev, heure_debut: e.target.value }))} className="h-9" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Heure fin</Label><Input type="time" value={formData.heure_fin} onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))} className="h-9" /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Statut RDV</Label><Select value={formData.statut_rdv} onValueChange={(v) => setFormData(prev => ({ ...prev, statut_rdv: v }))}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a_confirmer">A confirmer</SelectItem><SelectItem value="confirme">Confirme</SelectItem><SelectItem value="reporte">Reporte</SelectItem></SelectContent></Select></div>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border/30">
                <InfoRow label="Date">{formatDate(mission.date_planifiee)}</InfoRow>
                {mission.heure_debut && <InfoRow label="Horaire">{formatTime(mission.heure_debut)}{mission.heure_fin ? ` - ${formatTime(mission.heure_fin)}` : ''}</InfoRow>}
                <InfoRow label="Statut RDV">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    mission.statut_rdv === 'confirme' ? 'bg-green-100 text-green-700' : mission.statut_rdv === 'reporte' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{statutRdvLabels[mission.statut_rdv]}</span>
                </InfoRow>
                {isTerminated && <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 pt-2"><Lock className="h-3 w-3" /> Lecture seule</div>}
              </div>
            )}
          </Section>

          {/* Technicien */}
          <Section title="Technicien" icon={User} open={openSections.technicien} onToggle={() => toggleSection('technicien')}>
            {mission.technicien ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{techInitials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{techName}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                    mission.technicien.statut_invitation === 'accepte' ? 'bg-green-100 text-green-700' : mission.technicien.statut_invitation === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{statutInvitationLabels[mission.technicien.statut_invitation]}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground/50 italic">Aucun technicien assigne</p>
                {!isLocked && <Select onValueChange={handleAssignTechnician}><SelectTrigger className="h-9"><SelectValue placeholder="Assigner un technicien..." /></SelectTrigger><SelectContent>{technicians.map((t) => <SelectItem key={t.id} value={t.id}>{t.prenom} {t.nom}</SelectItem>)}</SelectContent></Select>}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Row 2: Parties + Commentaire = Documents EDL + Cles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          {/* Parties */}
          <Section title="Parties" icon={UsersThree} open={openSections.parties} onToggle={() => toggleSection('parties')}>
            <div className="space-y-4">
              {mission.proprietaires.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2">Proprietaire(s)</p>
                  <div className="space-y-1.5">
                    {mission.proprietaires.map((p) => (
                      <PersonRow key={p.id} id={p.id} nom={p.nom} prenom={p.prenom} color="sky" role="Proprietaire" />
                    ))}
                  </div>
                </div>
              )}
              {mission.edls.some(edl => edl.locataires.length > 0) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2">Locataire(s)</p>
                  <div className="space-y-1.5">
                    {mission.edls.flatMap(edl => edl.locataires.map((loc) => (
                      <PersonRow key={`${edl.id}-${loc.tiers_id}`} id={loc.tiers_id} nom={loc.nom} prenom={loc.prenom} color={loc.role_locataire === 'entrant' ? 'green' : 'orange'} role={loc.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'} />
                    )))}
                  </div>
                </div>
              )}
              {mission.mandataire && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2">Mandataire</p>
                  <PersonRow id={mission.mandataire.id} nom={mission.mandataire.raison_sociale || mission.mandataire.nom} color="violet" role="Mandataire" />
                </div>
              )}
            </div>
          </Section>

          {/* Commentaire */}
          <Section title="Commentaire" icon={ChatText} open={openSections.commentaire} onToggle={() => toggleSection('commentaire')}>
            {editing ? (
              <div className="space-y-1.5">
                <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} placeholder="Notes, instructions..." rows={3} className="rounded-xl" />
                {isTerminated && <p className="text-[10px] text-muted-foreground/50">Le commentaire reste modifiable apres terminaison</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{mission.commentaire || <span className="text-muted-foreground/30 italic">Aucun commentaire</span>}</p>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          {/* Documents EDL */}
          <Section title="Documents EDL" icon={FileText} open={openSections.documents} onToggle={() => toggleSection('documents')}>
            {mission.edls.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">Aucun EDL associe</p>
            ) : (
              <div className="space-y-2">
                {mission.edls.map((edl) => (
                  <div key={edl.id} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${sensColors[edl.sens]}`}>{sensLabels[edl.sens]}</span>
                      <span className="text-[13px] text-foreground capitalize">{edl.type}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        edl.statut === 'signe' ? 'bg-green-100 text-green-700' : edl.statut === 'infructueux' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
                      }`}>{edl.statut === 'signe' ? 'Signe' : edl.statut === 'infructueux' ? 'Infructueux' : 'Brouillon'}</span>
                    </div>
                    {edl.statut === 'signe' && (
                      <div className="flex items-center gap-2">
                        {edl.url_pdf && <a href={edl.url_pdf} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">PDF <ArrowSquareOut className="h-3 w-3" /></a>}
                        {edl.url_web && <a href={edl.url_web} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">Web <ArrowSquareOut className="h-3 w-3" /></a>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Cles */}
          <Section title="Cles" icon={Key} open={openSections.cles} onToggle={() => toggleSection('cles')}>
            {mission.cles.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">Aucune cle enregistree</p>
            ) : (
              <div className="space-y-4">
                {mission.edls.map((edl) => {
                  const edlCles = mission.cles.filter(c => c.edl_id === edl.id)
                  if (edlCles.length === 0) return null
                  return (
                    <div key={edl.id}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2 flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${sensColors[edl.sens]}`}>{sensLabels[edl.sens]}</span>
                        {edl.locataires.map(l => l.prenom ? `${l.prenom} ${l.nom}` : l.nom).join(', ') || 'EDL'}
                      </p>
                      <div className="space-y-2">
                        {edlCles.map((cle) => (
                          <CleRow key={cle.id} cle={cle} isExit={edl.sens === 'sortie'} onStatutChange={(s) => handleUpdateCleStatut(cle, s)} onLieuChange={(l) => handleUpdateCleLieuDepot(cle, l)} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Section>
        </div>
      </div>

      <FloatingSaveBar visible={editing && !!hasEdits} onSave={handleSave} onCancel={() => { setEditing(false); if (mission) setFormData({ date_planifiee: mission.date_planifiee || '', heure_debut: mission.heure_debut || '', heure_fin: mission.heure_fin || '', statut_rdv: mission.statut_rdv || '', commentaire: mission.commentaire || '' }) }} saving={saving} />
    </div>
  )
}

/* ── Section Card ── */
function Section({ title, icon: Icon, open, onToggle, children }: { title: string; icon: React.ElementType; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-muted/40 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-muted-foreground/60" weight="duotone" /></div>
          <span className="text-[13px] font-semibold text-foreground">{title}</span>
        </div>
        {open ? <CaretUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <CaretDown className="h-3.5 w-3.5 text-muted-foreground/30" />}
      </button>
      {open && <div className="px-5 pb-5 pt-0.5">{children}</div>}
    </div>
  )
}

/* ── Info Row ── */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-muted-foreground text-[13px] shrink-0">{label}</span>
      <span className="text-[13px] text-foreground font-medium text-right">{children}</span>
    </div>
  )
}

/* ── Person Row ── */
const avatarColors: Record<string, string> = {
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

function PersonRow({ id, nom, prenom, color, role }: { id: string; nom: string; prenom?: string; color: string; role: string }) {
  const initial = (prenom?.[0] || nom[0]).toUpperCase()
  const displayName = prenom ? `${prenom} ${nom}` : nom
  return (
    <div className="flex items-center gap-2.5 py-1">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColors[color]}`}>{initial}</div>
      <Link to={`/app/tiers/${id}`} className="text-[13px] text-primary hover:underline font-medium flex-1 truncate">{displayName}</Link>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${avatarColors[color]}`}>{role}</span>
    </div>
  )
}

/* ── Cle Row ── */
function CleRow({ cle, isExit, onStatutChange, onLieuChange }: { cle: CleMission; isExit: boolean; onStatutChange: (s: StatutCle) => void; onLieuChange: (l: string) => void }) {
  const [lieuLocal, setLieuLocal] = useState(cle.lieu_depot || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLieuChange(val: string) {
    setLieuLocal(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onLieuChange(val), 800)
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-muted/20 border border-border/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">{typeCleLabels[cle.type_cle]}</span>
          {cle.quantite > 1 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">x{cle.quantite}</span>}
        </div>
        {(isExit || cle.statut === 'a_deposer') && (
          <Input placeholder="Lieu de depot..." value={lieuLocal} onChange={(e) => handleLieuChange(e.target.value)} className="mt-2 h-7 text-xs" />
        )}
      </div>
      <Select value={cle.statut} onValueChange={(v) => onStatutChange(v as StatutCle)}>
        <SelectTrigger className="h-7 w-auto text-[11px] px-2.5"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="remise">Remise</SelectItem>
          <SelectItem value="a_deposer">A deposer</SelectItem>
          <SelectItem value="deposee">Deposee</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
