import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  PencilSimple, Prohibit, CaretDown, CaretUp,
  BuildingOffice, UsersThree, Calendar, User, FileText, Key,
  ChatText, Warning, ArrowSquareOut, Lock, MapPin, Clock, House,
  FlowArrow, FilePdf, Globe, Scales, UserPlus, CheckCircle, Plus, Trash,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { TechPicker } from 'src/components/shared/tech-picker'
import { useMissionDetail, useUpdateMission, useAssignTechnician, useUpdateCle, useDeleteCle, useAddCle, useUpdateInvitation, useWorkspaceTechnicians, useAddEDLToMission } from '../api'
import { FloatingSaveBar } from 'src/components/shared/floating-save-bar'
import { CancelMissionModal } from './cancel-mission-modal'
import { formatDate, formatTime } from 'src/lib/formatters'
import { toast } from 'sonner'
import type { MissionDetail, CleMission, StatutRdv, StatutCle, SensEDL, TypeEDL } from '../types'
import {
  statutAffichageLabels, statutAffichageColors,
  statutRdvLabels, statutInvitationLabels,
  sensLabels, sensColors,
  typeCleLabels, statutCleLabels, statutCleColors,
  getStatutAffichage, getPendingActions,
} from '../types'

/* ── Revalidation Dialog ── */
function RevalidationDialog({ open, onOpenChange, onRevalidate, onConfirmDirectly, saving }: {
  open: boolean; onOpenChange: (open: boolean) => void; onRevalidate: () => void; onConfirmDirectly: () => void; saving: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Warning className="h-5 w-5 text-amber-600" />
            Revalidation du technicien
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Le technicien a déjà accepté cette mission. Que souhaitez-vous faire ?</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={onRevalidate} disabled={saving} className="justify-start">Demander revalidation</Button>
            <p className="text-[10px] text-muted-foreground/60 ml-1 -mt-1">Le technicien devra re-accepter la mission avec les nouvelles dates.</p>
            <Button onClick={onConfirmDirectly} disabled={saving} className="justify-start">Confirmer d'office</Button>
            <p className="text-[10px] text-muted-foreground/60 ml-1 -mt-1">Les modifications seront enregistrées sans demander revalidation.</p>
          </div>
          <div className="flex justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MissionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: mission, isLoading } = useMissionDetail(id)

  // Auto-set breadcrumbs when data loads (survives page refresh)
  useEffect(() => {
    if (mission?.reference && !(location.state as any)?.breadcrumbs) {
      navigate(location.pathname, { replace: true, state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference }] } })
    }
  }, [mission?.reference])
  const updateMission = useUpdateMission()
  const assignTech = useAssignTechnician()
  const updateCle = useUpdateCle()
  const deleteCle = useDeleteCle()
  const addCle = useAddCle()
  const updateInvitation = useUpdateInvitation()
  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  const addEdl = useAddEDLToMission()
  const [showCancel, setShowCancel] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRevalidation, setShowRevalidation] = useState(false)
  const [showAddEdl, setShowAddEdl] = useState(false)
  const [addEdlSens, setAddEdlSens] = useState<SensEDL>('entree')
  const [addEdlType, setAddEdlType] = useState<TypeEDL>('edl')
  const [addEdlSaving, setAddEdlSaving] = useState(false)
  const [showAddCle, setShowAddCle] = useState(false)
  const [addCleEdlId, setAddCleEdlId] = useState('')
  const [addCleType, setAddCleType] = useState<string>('cle_principale')
  const [addCleQty, setAddCleQty] = useState('1')
  const [addCleStatut, setAddCleStatut] = useState<string>('remise')
  const [addCleLieu, setAddCleLieu] = useState('')
  const [addCleSaving, setAddCleSaving] = useState(false)

  const [formData, setFormData] = useState({ date_planifiee: '', heure_debut: '', heure_fin: '', statut_rdv: '' as string })
  const [commentaireLocal, setCommentaireLocal] = useState('')
  const [commentaireDirty, setCommentaireDirty] = useState(false)
  const [savingComment, setSavingComment] = useState(false)

  // Sticky header — détection via IntersectionObserver sur un sentinel placé juste au-dessus.
  const heroSentinelRef = useRef<HTMLDivElement>(null)
  const [heroStuck, setHeroStuck] = useState(false)
  useEffect(() => {
    const el = heroSentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setHeroStuck(!entry.isIntersecting),
      { rootMargin: '-57px 0px 0px 0px', threshold: 0 } // 56px = topbar h-14
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const missionId = mission?.id
  useEffect(() => {
    if (mission && !editing) setFormData({ date_planifiee: (mission.date_planifiee || '').slice(0, 10), heure_debut: mission.heure_debut || '', heure_fin: mission.heure_fin || '', statut_rdv: mission.statut_rdv || '' })
  }, [missionId, editing])

  useEffect(() => {
    if (mission) { setCommentaireLocal(mission.commentaire || ''); setCommentaireDirty(false) }
  }, [missionId])

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
      await updateMission.mutateAsync({ id: mission.id, date_planifiee: formData.date_planifiee, heure_debut: formData.heure_debut || undefined, heure_fin: formData.heure_fin || undefined, statut_rdv: formData.statut_rdv as StatutRdv })
      if (revalidate && mission.technicien) await updateInvitation.mutateAsync({ missionId: mission.id, statut_invitation: 'en_attente' })
      toast.success('Planning mis à jour'); setEditing(false); setShowRevalidation(false)
    } catch (err: any) { toast.error(err.message || 'Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  async function handleSaveComment() {
    if (!mission) return
    setSavingComment(true)
    try {
      await updateMission.mutateAsync({ id: mission.id, commentaire: commentaireLocal })
      setCommentaireDirty(false); toast.success('Commentaire enregistré')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
    finally { setSavingComment(false) }
  }

  async function handleSave() {
    if (!mission) return
    if (planningChanged && techAccepted && !isTerminated) { setShowRevalidation(true); return }
    await doSave(false)
  }

  async function handleAssignTechnician(userId: string) {
    if (!mission) return
    try { await assignTech.mutateAsync({ missionId: mission.id, user_id: userId }); toast.success('Technicien assigné') }
    catch (err: any) { toast.error(err.message || 'Erreur lors de l\'assignation') }
  }

  async function handleManualInvitation(statut: 'accepte' | 'refuse') {
    if (!mission) return
    try {
      await updateInvitation.mutateAsync({ missionId: mission.id, statut_invitation: statut })
      toast.success(statut === 'accepte' ? 'Invitation confirmée manuellement' : 'Invitation marquée comme refusée')
    } catch (err: any) { toast.error(err.message || 'Erreur lors de la mise à jour') }
  }

  async function handleUpdateCleStatut(cle: CleMission, newStatut: StatutCle) {
    try { await updateCle.mutateAsync({ edlId: cle.edl_id, cleId: cle.id, statut: newStatut }); toast.success('Statut de la clé mis à jour') }
    catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleUpdateCleLieuDepot(cle: CleMission, lieu: string) {
    try { await updateCle.mutateAsync({ edlId: cle.edl_id, cleId: cle.id, lieu_depot: lieu }) } catch {}
  }

  async function handleAddEdl() {
    if (!mission) return
    setAddEdlSaving(true)
    try {
      await addEdl.mutateAsync({ missionId: mission.id, type: addEdlType, sens: addEdlSens })
      toast.success('EDL ajouté')
      setShowAddEdl(false)
      setAddEdlSens('entree')
      setAddEdlType('edl')
    } catch (err: any) { toast.error(err.message || 'Erreur lors de l\'ajout') }
    finally { setAddEdlSaving(false) }
  }

  async function handleAddCle() {
    if (!addCleEdlId) return
    setAddCleSaving(true)
    try {
      await addCle.mutateAsync({ edlId: addCleEdlId, type_cle: addCleType as any, quantite: parseInt(addCleQty) || 1, statut: addCleStatut as any, lieu_depot: addCleLieu || undefined })
      toast.success('Clé ajoutée')
      setShowAddCle(false)
      setAddCleType('cle_principale'); setAddCleQty('1'); setAddCleStatut('remise'); setAddCleLieu('')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
    finally { setAddCleSaving(false) }
  }

  async function handleDeleteCle(cle: CleMission) {
    try {
      await deleteCle.mutateAsync({ edlId: cle.edl_id, cleId: cle.id })
      toast.success('Clé supprimée')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  const edlBrouillonCount = mission?.edls.filter(e => e.statut === 'brouillon').length ?? 0

  const hasEdits = mission && (formData.date_planifiee !== (mission.date_planifiee || '') || formData.heure_debut !== (mission.heure_debut || '') || formData.heure_fin !== (mission.heure_fin || '') || formData.statut_rdv !== (mission.statut_rdv || ''))

  useEffect(() => {
    if (!editing || !hasEdits) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [editing, hasEdits])

  if (isLoading) return (
    <div className="px-8 py-6 max-w-[1180px] mx-auto space-y-5">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-44 rounded-2xl" /></div>
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
    </div>
  )

  if (!mission) return (
    <div className="px-8 py-6 max-w-[1180px] mx-auto">
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
    <div className="px-8 py-6 max-w-[1180px] mx-auto space-y-4">
      {showCancel && <CancelMissionModal open={showCancel} onOpenChange={setShowCancel} missionId={mission.id} missionStatut={mission.statut} edlBrouillonCount={edlBrouillonCount} />}
      <RevalidationDialog open={showRevalidation} onOpenChange={setShowRevalidation} onRevalidate={() => doSave(true)} onConfirmDirectly={() => doSave(false)} saving={saving} />

      {/* Terminated mission banner (US-811) */}
      {isTerminated && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            Mission terminée — Édition limitée au commentaire et statut des clés
          </p>
        </div>
      )}

      {/* ═══ HERO HEADER — sticky ═══ */}
      {/* Sentinel pour détecter le "stuck" via IntersectionObserver (ratio < 1 = collé) */}
      <div ref={heroSentinelRef} className="h-0 -mb-4" aria-hidden="true" />
      <div
        className={`sticky top-14 z-10 bg-card rounded-2xl border border-border/40 overflow-hidden transition-shadow duration-300 ease-out ${heroStuck ? 'shadow-elevation-floating bg-card/95 backdrop-blur-md' : 'shadow-elevation-raised'}`}
      >
        <div className="px-7 py-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{mission.reference}</h1>
                {(() => { const a = getStatutAffichage(mission); return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${statutAffichageColors[a]}`}>{statutAffichageLabels[a]}</span> })()}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${mission.statut_rdv === 'confirme' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : mission.statut_rdv === 'reporte' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>RDV: {statutRdvLabels[mission.statut_rdv]}</span>
                {mission.edl_types.map((type) => (
                  <span key={type} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${type === 'entree' || type === 'sortie' ? sensColors[type as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>
                    {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inventaire'}
                  </span>
                ))}
              </div>
              <p className="text-sm font-medium">
                <Link
                  to={`/app/patrimoine/lots/${mission.lot.id}`}
                  className="text-foreground hover:text-primary hover:underline transition-colors"
                >
                  {mission.lot_designation}
                </Link>
                <span className="text-muted-foreground font-normal"> — </span>
                <Link
                  to={`/app/patrimoine/batiments/${mission.lot.batiment.id}`}
                  className="text-muted-foreground font-normal hover:text-primary hover:underline transition-colors"
                >
                  {mission.lot.batiment.designation}
                </Link>
              </p>
              <div className="flex items-center gap-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{formatDate(mission.date_planifiee)}</span>
                {mission.heure_debut && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{formatTime(mission.heure_debut)}{mission.heure_fin ? ` - ${formatTime(mission.heure_fin)}` : ''}</span>}
                {techName && <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{techName}</span>}
                {mission.lot.adresse && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground/40" weight="duotone" />{mission.lot.adresse.rue}, {mission.lot.adresse.ville}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isCancelled && !isTerminated && !editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}><PencilSimple className="h-3.5 w-3.5" /> Modifier</Button>}
              {!isLocked && !editing && <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowCancel(true)}><Prohibit className="h-3.5 w-3.5" /> Annuler</Button>}
            </div>
          </div>
        </div>
        {isTerminated && (
          <div className="border-t border-amber-200 bg-amber-50/60 px-7 py-3 flex items-center gap-3 dark:bg-amber-950/40 dark:border-amber-800">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300">Mission terminée — édition limitée. Seuls le commentaire et les clés sont modifiables.</p>
          </div>
        )}
        {isCancelled && mission.motif_annulation && (
          <div className="border-t border-red-200 bg-red-50/60 px-7 py-3 flex items-center gap-3 dark:bg-red-950/40 dark:border-red-800">
            <Prohibit className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <div><p className="text-xs font-semibold text-red-800 dark:text-red-300">Mission annulée</p><p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">{mission.motif_annulation}</p></div>
          </div>
        )}
        {pendingActions.length > 0 && (
          <div className="border-t border-orange-200 bg-orange-50/60 px-7 py-3 flex items-center gap-3 dark:bg-orange-950/40 dark:border-orange-800">
            <Warning className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="flex items-center gap-3 text-xs text-orange-800 dark:text-orange-300">
              {pendingActions.map((action, i) => (<span key={i} className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />{action}</span>))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ ROW 1: Planning | Chronologie ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Planning */}
        <CardBlock title="Planning" icon={Calendar} locked={isLocked}>
          {editing && !isTerminated ? (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">Date</Label><Input type="date" value={formData.date_planifiee} onChange={(e) => setFormData(prev => ({ ...prev, date_planifiee: e.target.value }))} onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} className="h-10 cursor-pointer" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">Heure début</Label><Input type="time" value={formData.heure_debut} onChange={(e) => setFormData(prev => ({ ...prev, heure_debut: e.target.value }))} onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} className="h-10 cursor-pointer" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">Heure fin</Label><Input type="time" value={formData.heure_fin} onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))} onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} className="h-10 cursor-pointer" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">Statut RDV</Label><Select value={formData.statut_rdv} onValueChange={(v) => setFormData(prev => ({ ...prev, statut_rdv: v }))}><SelectTrigger className="h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a_confirmer">À confirmer</SelectItem><SelectItem value="confirme">Confirmé</SelectItem><SelectItem value="reporte">Reporté</SelectItem></SelectContent></Select></div>
            </div>
          ) : (
            <div className="space-y-3">
              <FieldRow label="Référence"><span className="text-[14px] font-semibold text-foreground font-mono">{mission.reference}</span></FieldRow>
              <FieldRow label="Date"><span className="text-[14px] font-semibold text-foreground">{formatDate(mission.date_planifiee)}</span></FieldRow>
              {mission.heure_debut && <FieldRow label="Horaire"><span className="text-[14px] font-medium text-foreground">{formatTime(mission.heure_debut)}{mission.heure_fin ? ` — ${formatTime(mission.heure_fin)}` : ''}</span></FieldRow>}
              <FieldRow label="Statut RDV"><span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${mission.statut_rdv === 'confirme' ? 'bg-green-100 text-green-700' : mission.statut_rdv === 'reporte' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{statutRdvLabels[mission.statut_rdv]}</span></FieldRow>
              {mission.avec_inventaire && <FieldRow label="Inventaire"><span className="text-[13px] text-foreground">Oui</span></FieldRow>}
              {mission.type_bail && mission.type_bail !== 'individuel' && <FieldRow label="Type bail"><span className="text-[13px] text-foreground capitalize">{mission.type_bail}</span></FieldRow>}
              <FieldRow label="Créée le"><span className="text-[13px] text-muted-foreground">{formatDate(mission.created_at)}</span></FieldRow>
            </div>
          )}
        </CardBlock>

        {/* Chronologie */}
        <CardBlock title="Chronologie de la mission" icon={FlowArrow}>
            <div className="relative pl-7">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border/60 rounded-full" />
              <TimelineEvent
                color="bg-primary"
                title="Mission créée"
                desc={`par ${mission.created_by_nom || 'Admin'}`}
                timestamp={mission.created_at}
              />
              {/* Group EDLs by locataire+sens (pour éviter les doublons edl+inventaire d'un même locataire) */}
              {(() => {
                const groups = new Map<string, { sens: string; types: string[]; locNames: string[]; earliest?: string | null }>()
                for (const edl of mission.edls) {
                  const locKey = edl.locataires.length > 0
                    ? edl.locataires.map(l => l.tiers_id).sort().join(',')
                    : '_none_'
                  const key = `${edl.sens}-${locKey}`
                  const existing = groups.get(key)
                  if (existing) {
                    if (!existing.types.includes(edl.type)) existing.types.push(edl.type)
                    // Garde le created_at le plus ancien pour dater le groupe
                    if (edl.created_at && (!existing.earliest || edl.created_at < existing.earliest)) {
                      existing.earliest = edl.created_at
                    }
                  } else {
                    groups.set(key, {
                      sens: edl.sens,
                      types: [edl.type],
                      locNames: edl.locataires.map(l => l.prenom ? `${l.prenom} ${l.nom}` : l.nom),
                      earliest: edl.created_at ?? null,
                    })
                  }
                }
                return Array.from(groups.entries()).map(([key, g]) => {
                  const typeLabel = g.types.map(t => t === 'inventaire' ? 'Inventaire' : 'EDL').join(' + ')
                  return (
                    <TimelineEvent
                      key={key}
                      color={g.sens === 'entree' ? 'bg-blue-500' : 'bg-orange-400'}
                      title={`${typeLabel} ${sensLabels[g.sens as 'entree' | 'sortie']} ajouté`}
                      desc={g.locNames.length > 0 ? `Locataire : ${g.locNames.join(', ')}` : undefined}
                      timestamp={g.earliest}
                    />
                  )
                })
              })()}
              {mission.technicien ? (
                <TimelineEvent
                  color={mission.technicien.statut_invitation === 'accepte' ? 'bg-green-500' : mission.technicien.statut_invitation === 'refuse' ? 'bg-red-400' : 'bg-amber-400'}
                  title={`Technicien : ${techName}`}
                  desc={`Invitation ${statutInvitationLabels[mission.technicien.statut_invitation].toLowerCase()}`}
                  timestamp={mission.technicien.invitation_updated_at || mission.technicien.assigned_at}
                />
              ) : (
                <TimelineEvent color="bg-muted-foreground/20" title="En attente d'assignation" desc="Aucun technicien assigné" muted />
              )}
              <TimelineEvent
                color={mission.statut_rdv === 'confirme' ? 'bg-green-500' : mission.statut_rdv === 'reporte' ? 'bg-red-400' : 'bg-muted-foreground/20'}
                title={`RDV ${statutRdvLabels[mission.statut_rdv].toLowerCase()}`}
                desc={`Date : ${formatDate(mission.date_planifiee)}${mission.heure_debut ? ` à ${formatTime(mission.heure_debut)}` : ''}`}
                muted={mission.statut_rdv === 'a_confirmer'}
              />
              {mission.edls.filter(e => e.statut === 'signe').map((edl) => (
                <TimelineEvent
                  key={`signed-${edl.id}`}
                  color="bg-green-500"
                  title={`${edl.type === 'inventaire' ? 'Inventaire' : 'EDL'} ${sensLabels[edl.sens]} signé`}
                  desc="Document légal finalisé"
                  timestamp={edl.date_signature}
                />
              ))}
              {isTerminated && <TimelineEvent color="bg-green-500" title="Mission terminée" desc="Tous les EDL signés — auto-terminaison" last />}
              {isCancelled && <TimelineEvent color="bg-red-500" title="Mission annulée" desc={mission.motif_annulation || 'Motif non renseigné'} last />}
            </div>
          </CardBlock>
      </div>

      {/* ═══ ROW 2: Technicien | Parties ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CardBlock title="Technicien" icon={User} locked={isLocked}>
          {mission.technicien ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{techInitials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground">{techName}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{mission.technicien.statut_invitation === 'accepte' ? mission.technicien.email || '' : ''}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${mission.technicien.statut_invitation === 'accepte' ? 'bg-green-100 text-green-700' : mission.technicien.statut_invitation === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{statutInvitationLabels[mission.technicien.statut_invitation]}</span>
              </div>
              {mission.technicien.statut_invitation === 'en_attente' && !isLocked && (
                <div className="flex items-center gap-2 flex-wrap pl-[58px]">
                  <span className="text-[11px] text-muted-foreground/70 italic">
                    Confirmation orale reçue (tél, WhatsApp…) ?
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={updateInvitation.isPending}
                      onClick={() => handleManualInvitation('accepte')}
                      className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    >
                      ✓ Confirmer
                    </button>
                    <button
                      type="button"
                      disabled={updateInvitation.isPending}
                      onClick={() => handleManualInvitation('refuse')}
                      className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 transition-colors disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              )}
              {/* Picker de changement visible uniquement en mode édition */}
              {!isLocked && editing && (
                <TechPicker
                  technicians={technicians}
                  onSelect={handleAssignTechnician}
                  placeholder="Changer de technicien…"
                  className="w-full"
                  date={formData.date_planifiee || (mission.date_planifiee || '').slice(0, 10)}
                  excludeMissionId={mission.id}
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 py-1">
                <div className="h-11 w-11 rounded-xl bg-muted/50 flex items-center justify-center"><UserPlus className="h-5 w-5 text-muted-foreground/40" /></div>
                <p className="text-[14px] text-muted-foreground/50 italic">Aucun technicien assigné</p>
              </div>
              {/* Picker d'assignation visible uniquement en mode édition */}
              {!isLocked && editing && (
                <TechPicker
                  technicians={technicians}
                  onSelect={handleAssignTechnician}
                  placeholder="Assigner un technicien..."
                  className="w-full"
                  date={formData.date_planifiee || (mission.date_planifiee || '').slice(0, 10)}
                  excludeMissionId={mission.id}
                />
              )}
            </div>
          )}
        </CardBlock>

        <CardBlock title="Parties" icon={UsersThree}>
          <div className="space-y-0 divide-y divide-border/30">
            {mission.proprietaires.map((p) => (
              <PersonRow
                key={p.id}
                id={p.id}
                nom={p.type_personne === 'morale' && (p as any).raison_sociale ? (p as any).raison_sociale : p.nom}
                prenom={p.type_personne === 'morale' ? undefined : p.prenom}
                color="sky"
                role="Propriétaire"
                subtitle={p.type_personne === 'morale' ? 'Personne morale' : 'Personne physique'}
              />
            ))}
            {(() => {
              // Deduplicate locataires across EDLs (same person may be linked to edl + inventaire)
              const seen = new Set<string>()
              return mission.edls.flatMap(edl => edl.locataires.filter(loc => {
                const key = `${loc.tiers_id}-${loc.role_locataire}`
                if (seen.has(key)) return false
                seen.add(key)
                return true
              }).map(loc => (
                <PersonRow
                  key={`${loc.tiers_id}-${loc.role_locataire}`}
                  id={loc.tiers_id}
                  nom={loc.type_personne === 'morale' && loc.raison_sociale ? loc.raison_sociale : loc.nom}
                  prenom={loc.type_personne === 'morale' ? undefined : loc.prenom}
                  color={loc.role_locataire === 'entrant' ? 'green' : 'orange'}
                  role={loc.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'}
                  subtitle={loc.type_personne === 'morale' ? 'Personne morale' : 'Personne physique'}
                />
              )))
            })()}
            {mission.mandataire && (
              <PersonRow
                id={mission.mandataire.id}
                nom={mission.mandataire.raison_sociale || mission.mandataire.nom}
                prenom={mission.mandataire.raison_sociale ? undefined : mission.mandataire.prenom}
                color="violet"
                role="Mandataire"
                subtitle={mission.mandataire.raison_sociale ? 'Personne morale' : 'Personne physique'}
              />
            )}
            {mission.proprietaires.length === 0 && !mission.mandataire && mission.edls.every(e => e.locataires.length === 0) && (
              <p className="text-sm text-muted-foreground/40 italic py-2">Aucun tiers lié</p>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/50 mt-3 pt-3 border-t border-border/30">
            Pour modifier le propriétaire ou le mandataire, éditer le <Link to={`/app/patrimoine/lots/${mission.lot.id}`} className="text-primary hover:underline">lot</Link>. Les locataires sont gérés depuis les EDL.
          </p>
        </CardBlock>
      </div>

      {/* ═══ ROW 3: Bien+Commentaire | EDL+Clés ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <CardBlock title="Bien & Bâtiment" icon={House}>
            <div className="space-y-2.5">
              <Link to={`/app/patrimoine/lots/${mission.lot.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="h-10 w-10 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0 dark:bg-blue-950"><House className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">{mission.lot.designation}</div>
                  <div className="text-[11px] text-muted-foreground capitalize">{mission.lot.type_bien}{mission.lot.etage ? ` · ${mission.lot.etage}` : ''}{mission.lot.surface ? ` · ${mission.lot.surface} m²` : ''}</div>
                </div>
                <ArrowSquareOut className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
              </Link>
              <Link to={`/app/patrimoine/batiments/${mission.lot.batiment.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="h-10 w-10 rounded-[10px] bg-slate-100 flex items-center justify-center shrink-0 dark:bg-slate-900"><BuildingOffice className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">{mission.lot.batiment.designation}</div>
                  {mission.lot.adresse && <div className="text-[11px] text-muted-foreground truncate">{mission.lot.adresse.rue}, {mission.lot.adresse.code_postal} {mission.lot.adresse.ville}</div>}
                </div>
                <ArrowSquareOut className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
              </Link>
            </div>
          </CardBlock>

          <CardBlock title="Commentaire" icon={ChatText} subtitle="(toujours éditable)">
            <div className="space-y-2.5">
              <Textarea
                value={commentaireLocal}
                onChange={(e) => { setCommentaireLocal(e.target.value); setCommentaireDirty(true) }}
                placeholder="Notes, instructions..."
                rows={3}
                className="text-sm resize-none"
              />
              {commentaireDirty && (
                <Button size="sm" variant="outline" onClick={handleSaveComment} disabled={savingComment} className="w-full h-9 text-[12px]">
                  {savingComment ? 'Enregistrement…' : 'Enregistrer le commentaire'}
                </Button>
              )}
            </div>
          </CardBlock>
        </div>

        <div className="space-y-4">
          {/* Documents EDL */}
          <CardBlock title="Documents EDL" icon={FileText}>
            {!isLocked && (
              <div className="mb-3">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => setShowAddEdl(true)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter un EDL
                </Button>
              </div>
            )}
            {mission.edls.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/40 italic">Aucun EDL associé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mission.edls.map((edl) => (
                  <div key={edl.id} className={`p-4 rounded-xl border ${edl.statut === 'signe' ? 'bg-green-50/50 border-green-200/60 dark:bg-green-950/20 dark:border-green-800/40' : 'bg-muted/20 border-border/30'}`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${sensColors[edl.sens]}`}>{sensLabels[edl.sens]}</span>
                        <span className="text-[14px] font-bold text-foreground capitalize">{edl.type}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${edl.statut === 'signe' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : edl.statut === 'infructueux' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
                        {edl.statut === 'signe' ? 'Signé' : edl.statut === 'infructueux' ? 'Infructueux' : 'Brouillon'}
                      </span>
                    </div>
                    {edl.locataires.length > 0 && (
                      <div className="flex items-center gap-2 mb-2.5 text-[12px] text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        {edl.locataires.map(l => (
                          <span key={l.tiers_id} className="inline-flex items-center gap-1.5">
                            {l.prenom ? `${l.prenom} ${l.nom}` : l.nom}
                            <span className={`inline-flex px-2 py-px rounded-full text-[9px] font-semibold ${l.role_locataire === 'entrant' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{l.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const isSigned = edl.statut === 'signe'
                      const activeClass = "inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg bg-card border border-border/40 text-foreground/70 hover:text-foreground hover:border-border transition-colors cursor-pointer"
                      const disabledClass = "inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg bg-muted/30 border border-border/20 text-muted-foreground/40 cursor-not-allowed"
                      const links = [
                        { url: edl.url_pdf, icon: <FilePdf className={`h-4 w-4 ${isSigned ? 'text-red-500' : ''}`} />, label: 'PDF' },
                        { url: edl.url_web, icon: <Globe className={`h-4 w-4 ${isSigned ? 'text-blue-500' : ''}`} />, label: 'Web' },
                        { url: edl.url_pdf_legal, icon: <Scales className={`h-4 w-4 ${isSigned ? 'text-violet-500' : ''}`} />, label: 'PDF légal' },
                        { url: edl.url_web_legal, icon: <Globe className={`h-4 w-4 ${isSigned ? 'text-violet-500' : ''}`} />, label: 'Web légal' },
                      ]
                      return (
                        <div className="border-t border-border/30 pt-3 mt-2 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {links.map((l) => l.url ? (
                              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className={activeClass}>{l.icon}{l.label}</a>
                            ) : (
                              <span key={l.label} className={isSigned ? activeClass.replace('cursor-pointer', 'cursor-not-allowed opacity-50') : disabledClass} title={isSigned ? 'Document en cours de génération' : 'Disponible après signature'}>{l.icon}{l.label}</span>
                            ))}
                          </div>
                          {!isSigned && <p className="text-[11px] text-muted-foreground/40 italic">Disponible après signature de l'EDL</p>}
                          {isSigned && !edl.url_pdf && <p className="text-[11px] text-muted-foreground/50 italic">Documents en attente de génération (app tablette)</p>}
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            )}
          </CardBlock>

          {/* Clés */}
          <CardBlock title="Clés" icon={Key} subtitle={isTerminated ? '(modifiable après terminaison)' : undefined}>
            {/* Add key button */}
            {!isCancelled && mission.edls.length > 0 && (
              <button
                onClick={() => { setAddCleEdlId(mission.edls[0].id); setShowAddCle(true) }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 mb-3 rounded-xl border border-dashed border-border/50 text-[12px] font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter une clé
              </button>
            )}
            {mission.cles.length === 0 && (
              <p className="text-sm text-muted-foreground/40 italic text-center py-2">Aucune clé enregistrée</p>
            )}
            {mission.cles.length > 0 && (
              <div className="space-y-3">
                {mission.edls.map((edl) => {
                  const edlCles = mission.cles.filter(c => c.edl_id === edl.id)
                  if (edlCles.length === 0) return null
                  return (
                    <div key={edl.id}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-2 flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${sensColors[edl.sens]}`}>{sensLabels[edl.sens]}</span>
                        {edl.locataires.map(l => l.prenom ? `${l.prenom} ${l.nom}` : l.nom).join(', ') || 'EDL'}
                      </p>
                      <div className="space-y-2">
                        {edlCles.map((cle) => (
                          <CleRow key={cle.id} cle={cle} isExit={edl.sens === 'sortie'} onStatutChange={(s) => handleUpdateCleStatut(cle, s)} onLieuChange={(l) => handleUpdateCleLieuDepot(cle, l)} onDelete={() => handleDeleteCle(cle)} isReadOnly={isCancelled} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBlock>
        </div>
      </div>

      {/* Add EDL Dialog */}
      <Dialog open={showAddEdl} onOpenChange={setShowAddEdl}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Ajouter un EDL
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Sens</Label>
              <Select value={addEdlSens} onValueChange={(v) => setAddEdlSens(v as SensEDL)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entree">Entrée</SelectItem>
                  <SelectItem value="sortie">Sortie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Type</Label>
              <Select value={addEdlType} onValueChange={(v) => setAddEdlType(v as TypeEDL)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="edl">État des lieux</SelectItem>
                  <SelectItem value="inventaire">Inventaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAddEdl(false)} disabled={addEdlSaving}>Annuler</Button>
              <Button onClick={handleAddEdl} disabled={addEdlSaving}>{addEdlSaving ? 'Ajout...' : 'Ajouter'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Clé Dialog */}
      <Dialog open={showAddCle} onOpenChange={setShowAddCle}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Ajouter une clé
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {mission && mission.edls.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">EDL associé</Label>
                <Select value={addCleEdlId} onValueChange={setAddCleEdlId}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {mission.edls.map(edl => (
                      <SelectItem key={edl.id} value={edl.id}>
                        {sensLabels[edl.sens]} — {edl.type === 'inventaire' ? 'Inventaire' : 'EDL'} {edl.locataires.map(l => l.prenom ? `${l.prenom} ${l.nom}` : l.nom).join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Type de clé *</Label>
              <Select value={addCleType} onValueChange={setAddCleType}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cle_principale">Clé principale</SelectItem>
                  <SelectItem value="badge">Badge</SelectItem>
                  <SelectItem value="boite_aux_lettres">Boîte aux lettres</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="cave">Cave</SelectItem>
                  <SelectItem value="digicode">Digicode</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Quantité</Label>
                <Input type="number" min="1" value={addCleQty} onChange={(e) => setAddCleQty(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Statut</Label>
                <Select value={addCleStatut} onValueChange={setAddCleStatut}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remise">Remise</SelectItem>
                    <SelectItem value="a_deposer">À déposer</SelectItem>
                    <SelectItem value="deposee">Déposée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Lieu de dépôt</Label>
              <Input value={addCleLieu} onChange={(e) => setAddCleLieu(e.target.value)} placeholder="Agence, gardien, loge..." className="h-10" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAddCle(false)} disabled={addCleSaving}>Annuler</Button>
              <Button onClick={handleAddCle} disabled={addCleSaving || !addCleEdlId}>{addCleSaving ? 'Ajout...' : 'Ajouter'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={() => { setEditing(false); if (mission) setFormData({ date_planifiee: (mission.date_planifiee || '').slice(0, 10), heure_debut: mission.heure_debut || '', heure_fin: mission.heure_fin || '', statut_rdv: mission.statut_rdv || '' }) }} saving={saving} />
    </div>
  )
}

/* ═══ Card Block (collapsible) ═══ */
function CardBlock({ title, icon: Icon, locked, subtitle, children, defaultOpen = true }: { title: string; icon: React.ElementType; locked?: boolean; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer">
        <Icon className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-[13px] font-bold text-foreground">{title}</span>
        {locked && <Lock className="h-3.5 w-3.5 text-amber-500" />}
        {subtitle && <span className="text-[11px] text-amber-600 font-medium">{subtitle}</span>}
        <div className="ml-auto">
          {open ? <CaretUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <CaretDown className="h-3.5 w-3.5 text-muted-foreground/30" />}
        </div>
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  )
}

/* ═══ Field Row ═══ */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

/* ═══ Timeline Event ═══ */
// Formate un timestamp ISO en "12 avr. 2026 à 14h30" (fr-FR).
function formatTimelineStamp(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return `${date} à ${time}`
  } catch { return '' }
}
function TimelineEvent({ color, title, desc, timestamp, muted, last }: {
  color: string; ring?: string; title: string; desc?: string
  timestamp?: string | null; muted?: boolean; last?: boolean
}) {
  const stamp = timestamp ? formatTimelineStamp(timestamp) : null
  return (
    <div className={`relative ${last ? 'pb-0' : 'pb-6'}`}>
      <div className={`absolute -left-[20px] top-[4px] w-3.5 h-3.5 rounded-full ${color} ring-[2.5px] ring-card shadow-sm`} style={{ boxShadow: `0 0 0 3px var(--card)` }} />
      <div className={muted ? 'opacity-35' : ''}>
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
        {stamp && <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono">{stamp}</p>}
        {desc && <p className="text-[12px] text-muted-foreground mt-1">{desc}</p>}
      </div>
    </div>
  )
}

/* ═══ Person Row ═══ */
const avatarColors: Record<string, string> = {
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

function PersonRow({ id, nom, prenom, color, role, subtitle }: { id: string; nom: string; prenom?: string; color: string; role: string; subtitle?: string | null }) {
  const initial = (prenom?.[0] || nom[0]).toUpperCase()
  const displayName = prenom ? `${prenom} ${nom}` : nom
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarColors[color]}`}>{initial}</div>
      <div className="flex-1 min-w-0">
        <Link to={`/app/tiers/${id}`} className="text-[14px] text-primary hover:underline font-medium block truncate">{displayName}</Link>
        {subtitle && <p className="text-[11px] text-muted-foreground/70 truncate">{subtitle}</p>}
      </div>
      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${avatarColors[color]}`}>{role}</span>
    </div>
  )
}

/* ═══ Clé Row ═══ */
function CleRow({ cle, isExit, onStatutChange, onLieuChange, onDelete, isReadOnly = false }: { cle: CleMission; isExit: boolean; onStatutChange: (s: StatutCle) => void; onLieuChange: (l: string) => void; onDelete?: () => void; isReadOnly?: boolean }) {
  const [lieuLocal, setLieuLocal] = useState(cle.lieu_depot || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLieuChange(val: string) {
    if (isReadOnly) return
    setLieuLocal(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onLieuChange(val), 800)
  }

  const isADeposer = cle.statut === 'a_deposer'

  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl ${isADeposer ? 'bg-amber-50/80 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40' : 'bg-muted/20'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Key className={`h-4 w-4 shrink-0 ${isADeposer ? 'text-amber-500' : 'text-muted-foreground/40'}`} />
        <span className="text-[13px] font-bold text-foreground truncate">{typeCleLabels[cle.type_cle]}</span>
        {cle.quantite > 1 && <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-semibold shrink-0">×{cle.quantite}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {(isExit || isADeposer) && lieuLocal && <span className="text-[12px] text-muted-foreground">Lieu: <strong className="text-foreground/70">{lieuLocal}</strong></span>}
        {(isExit || isADeposer) && !lieuLocal && !isReadOnly && <Input placeholder="Lieu de dépôt..." value={lieuLocal} onChange={(e) => handleLieuChange(e.target.value)} className="h-8 text-xs w-28" />}
        <Select value={cle.statut} onValueChange={isReadOnly ? undefined : (v) => onStatutChange(v as StatutCle)} disabled={isReadOnly}>
          <SelectTrigger className={`h-8 w-auto text-[11px] px-3 rounded-full border-0 font-semibold ${cle.statut === 'remise' ? 'bg-green-100 text-green-700' : cle.statut === 'a_deposer' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="remise">Remise</SelectItem>
            <SelectItem value="a_deposer">À déposer</SelectItem>
            <SelectItem value="deposee">Déposée</SelectItem>
          </SelectContent>
        </Select>
        {onDelete && !isReadOnly && (
          <button onClick={() => { if (confirm('Supprimer cette clé ?')) onDelete() }} className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
