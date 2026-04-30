import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar, Clock, User, Users, MapPin, BuildingOffice, House,
  FileText, Key, Warning, CaretRight, UserPlus, ChatText,
  ArrowSquareOut, FilePdf, Globe, Scales, Plus, Prohibit,
} from '@phosphor-icons/react'
import { Sheet, SheetContent } from 'src/components/ui/sheet'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { TimePicker } from 'src/components/ui/time-picker'
import { DurationPicker } from 'src/components/ui/duration-picker'
import { addMinutesToTime, diffMinutes } from 'src/lib/time'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select'
import { Skeleton } from 'src/components/ui/skeleton'
import { TechPicker } from 'src/components/shared/tech-picker'
import { DatePicker } from 'src/components/shared/date-picker'
import { CancelMissionModal } from '../../missions/components/cancel-mission-modal'
import {
  useMissionDetail, useUpdateMission, useAssignTechnician, useUpdateInvitation, useWorkspaceTechnicians,
} from '../../missions/api'
import {
  sensLabels, sensColors,
  statutInvitationLabels,
  getPendingActions,
} from '../../missions/types'
import { MissionStatusBadge } from '../../missions/components/mission-status-badge'
import { formatDate, formatTime } from 'src/lib/formatters'
import { formatLotLabel } from 'src/features/patrimoine/labels'
import { cn } from 'src/lib/cn'
import { toast } from 'sonner'

// ── Labels ──

const statutEdlLabels: Record<string, string> = { brouillon: 'Brouillon', signe: 'Signé', infructueux: 'Infructueux' }
const typeBienLabels: Record<string, string> = { appartement: 'Appartement', maison: 'Maison', studio: 'Studio', local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre' }
const typeCleLabels: Record<string, string> = { cle_principale: 'Clé principale', badge: 'Badge', boite_aux_lettres: 'BAL', parking: 'Parking', cave: 'Cave', digicode: 'Digicode', autre: 'Autre' }
const statutCleLabels: Record<string, string> = { remise: 'Remise', a_deposer: 'À déposer', deposee: 'Déposée' }

// Wording explicite pour le badge invitation à côté du tech (Tony §3.5 retours avril 2026
// — "indiquer explicitement qu'il s'agit du technicien")
const INVITATION_BADGE_LABELS: Record<string, string> = {
  en_attente: 'Invitation technicien en attente',
  accepte: 'Invitation technicien acceptée',
  refuse: 'Invitation technicien refusée',
}

// ── Input style ── (aligné avec DatePicker / SelectTrigger : rounded-xl, bg-card)

const ghost = cn(
  'bg-card border border-border/60 rounded-xl shadow-xs',
  'hover:border-border/90',
  'focus:border-primary/60 focus:ring-2 focus:ring-primary/10',
  'transition-colors text-[13px] h-9',
)

// ── Tabs (no Note) ──

type SectionId = 'planning' | 'equipe' | 'documents' | 'bien'

const SECTIONS: { id: SectionId; label: string; Icon: React.ElementType }[] = [
  { id: 'planning',  label: 'Planning',  Icon: Calendar  },
  { id: 'equipe',    label: 'Acteurs',   Icon: Users     },
  { id: 'bien',      label: 'Bien',      Icon: House     },
  { id: 'documents', label: 'Docs',      Icon: FileText  },
]

// ── Skeleton ──

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-6 pt-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-7 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-3 pt-1">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ── Section heading ──

function SectionHeading({ children, Icon }: { children: React.ReactNode; Icon?: React.ElementType }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/45 mb-3">
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </p>
  )
}

// ── Unified person row (Technicien + Parties) ──

function PersonRow({ initials, name, subtitle, badge, badgeClass, avatarClass, dot, to }: {
  initials: string; name: string; subtitle?: string
  badge?: string; badgeClass?: string
  avatarClass?: string; dot?: string; to?: string
}) {
  const inner = (
    <div className={cn('flex items-center gap-3 py-2.5', to && 'group')}>
      <div className="relative shrink-0">
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold', avatarClass || 'bg-primary/10 text-primary')}>
          {initials}
        </div>
        {dot && <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#fafafa]', dot)} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-tight truncate">{name}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {badge && <span className={cn('shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full', badgeClass)}>{badge}</span>}
      {to && <CaretRight className="h-3.5 w-3.5 text-muted-foreground/25 group-hover:text-primary transition-colors shrink-0" />}
    </div>
  )
  return to
    ? <Link to={to} className="hover:opacity-75 transition-opacity block">{inner}</Link>
    : <>{inner}</>
}

// ── Helper pills ──

function invitPillClass(statut: string) {
  if (statut === 'accepte') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (statut === 'refuse')  return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
}

function ManualInvitationActions({ onAccept, onRefuse, busy }: {
  onAccept: () => void; onRefuse: () => void; busy: boolean
}) {
  return (
    <div className="mt-1 ml-11 pl-1 flex items-center gap-2 flex-wrap">
      <span className="text-[11px] text-muted-foreground/70 italic">
        Confirmation orale reçue (tél, WhatsApp…) ?
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={onAccept}
          className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
        >
          ✓ Confirmer
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onRefuse}
          className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 transition-colors disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
        >
          ✗ Refuser
        </button>
      </div>
    </div>
  )
}


// ── Main ──

export function MissionDrawer({ missionId, open, onClose }: { missionId: string | null; open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { data: mission, isLoading } = useMissionDetail(missionId || undefined)
  const updateMission    = useUpdateMission()
  const assignTech       = useAssignTechnician()
  const updateInvitation = useUpdateInvitation()
  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  // Scroll & active section
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    planning: null, equipe: null, documents: null, bien: null,
  })
  const [activeSection, setActiveSection] = useState<SectionId>('planning')
  const scrollingTo = useRef(false)

  // Form state
  const [datePlanifiee,    setDatePlanifiee]    = useState('')
  const [heureDebut,       setHeureDebut]       = useState('')
  const [dureeMin,         setDureeMin]         = useState<number | null>(null)
  const [commentaire,      setCommentaire]      = useState('')
  const [planningDirty,    setPlanningDirty]    = useState(false)
  const [saving,           setSaving]           = useState(false)
  const [assigning,        setAssigning]        = useState(false)
  const [showTechPicker,   setShowTechPicker]   = useState(false)
  const [showCancelModal,  setShowCancelModal]  = useState(false)

  useEffect(() => {
    if (mission) {
      const debut = mission.heure_debut || ''
      const fin = mission.heure_fin || ''
      const duree = debut && fin ? diffMinutes(debut, fin) : null
      setDatePlanifiee((mission.date_planifiee || '').slice(0, 10))
      setHeureDebut(debut)
      setDureeMin(duree && duree > 0 ? duree : null)
      setCommentaire(mission.commentaire || '')
      setPlanningDirty(false)
    }
  }, [mission])

  // Reset on new mission
  useEffect(() => { setActiveSection('planning'); setShowTechPicker(false) }, [missionId])

  // IntersectionObserver — highlight nav tab based on scroll
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !mission) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingTo.current) return
        // pick the first section that crossed into view from the top
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-section') as SectionId)
          }
        })
      },
      {
        root: container,
        rootMargin: '0px 0px -72% 0px',
        threshold: 0,
      },
    )

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id]
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [mission?.id])

  const scrollToSection = useCallback((id: SectionId) => {
    const el = sectionRefs.current[id]
    const container = scrollRef.current
    if (!el || !container) return
    scrollingTo.current = true
    setActiveSection(id)
    // offsetTop is relative to offsetParent, not the scroll container —
    // use getBoundingClientRect delta to get the correct absolute scroll target
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const target = container.scrollTop + (elRect.top - containerRect.top) - 12
    container.scrollTo({ top: target, behavior: 'smooth' })
    setTimeout(() => { scrollingTo.current = false }, 700)
  }, [])

  const isTerminated = mission?.statut === 'terminee'
  const isCancelled  = mission?.statut === 'annulee'
  const isLocked     = isTerminated || isCancelled
  const pendingActions = mission ? getPendingActions(mission) : []

  function handlePlanningChange(field: string, value: string) {
    if (field === 'date_planifiee') setDatePlanifiee(value)
    if (field === 'heure_debut')    setHeureDebut(value)
    setPlanningDirty(true)
  }

  function handleDureeChange(v: number | null) {
    setDureeMin(v)
    setPlanningDirty(true)
  }

  const computedHeureFin = heureDebut && dureeMin
    ? (addMinutesToTime(heureDebut, dureeMin) ?? '')
    : ''

  async function handleSavePlanning() {
    if (!mission) return
    setSaving(true)
    try {
      await updateMission.mutateAsync({ id: mission.id, date_planifiee: datePlanifiee, heure_debut: heureDebut || undefined, heure_fin: computedHeureFin || undefined })
      // Auto-réinvitation côté serveur — décision Cadrage FC 28/04/2026.
      setPlanningDirty(false); toast.success('Planning mis à jour')
    } catch { toast.error('Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  async function handleSaveComment() {
    if (!mission) return
    setSaving(true)
    try { await updateMission.mutateAsync({ id: mission.id, commentaire }); toast.success('Commentaire enregistré') }
    catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  async function handleManualInvitation(statut: 'accepte' | 'refuse') {
    if (!mission) return
    try {
      await updateInvitation.mutateAsync({ missionId: mission.id, statut_invitation: statut })
      toast.success(statut === 'accepte' ? 'Invitation confirmée manuellement' : 'Invitation marquée comme refusée')
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  async function handleAssignTechnician(userId: string) {
    if (!mission || !userId) return
    setAssigning(true)
    try { await assignTech.mutateAsync({ missionId: mission.id, user_id: userId }); setShowTechPicker(false); toast.success('Technicien assigné') }
    catch { toast.error("Erreur lors de l'assignation") }
    finally { setAssigning(false) }
  }

  function formatAddress(adresse: { rue: string; ville: string; code_postal: string } | null) {
    if (!adresse) return null
    return `${adresse.rue}, ${adresse.code_postal} ${adresse.ville}`
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-[520px] p-0 flex flex-col overflow-hidden border-l border-border/30 bg-card"
        side="right"
      >
        {isLoading || !mission ? <DrawerSkeleton /> : (
          <>
            {/* ═══ HEADER ═══ */}
            <div className="shrink-0 border-b border-border/40">
              <div className="px-6 pt-5 pb-4">
                {/* Reference + status + actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/40 mb-1.5">Mission</p>
                    <h2 className="text-[22px] font-bold tracking-tight leading-none">{mission.reference}</h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <MissionStatusBadge mission={mission} />
                    {(() => {
                      // Tony §3 : Annuler désactivé pour missions déjà annulées ou passées + terminées (EDL signés = légal).
                      const today = new Date().toISOString().slice(0, 10)
                      const datePlanifSlice = (mission.date_planifiee || '').slice(0, 10)
                      const isPast = !!datePlanifSlice && datePlanifSlice < today
                      const cancelDisabled = isCancelled || (isPast && isTerminated)
                      if (cancelDisabled) return null
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCancelModal(true)}
                          className="h-8 px-2.5 rounded-full text-[12px] font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          title="Annuler la mission"
                        >
                          <Prohibit className="h-3.5 w-3.5 mr-1" />
                          Annuler
                        </Button>
                      )
                    })()}
                  </div>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium rounded-md px-2.5 py-1 ${mission.date_planifiee ? 'text-muted-foreground bg-muted/40' : 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/40'}`}>
                    <Calendar className="h-3 w-3 shrink-0" />
                    {mission.date_planifiee ? formatDate(mission.date_planifiee) : 'À planifier'}
                  </span>
                  {(mission.heure_debut || mission.heure_fin) && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/40 rounded-md px-2.5 py-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {mission.heure_debut ? formatTime(mission.heure_debut) : '—'}
                      {mission.heure_fin && <> – {formatTime(mission.heure_fin)}</>}
                    </span>
                  )}
                  {mission.technicien && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/40 rounded-md px-2.5 py-1">
                      <User className="h-3 w-3 shrink-0" />
                      {mission.technicien.prenom} {mission.technicien.nom}
                    </span>
                  )}
                </div>

                {/* Pending actions */}
                {pendingActions.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                    {pendingActions.map((action, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        {action}
                      </span>
                    ))}
                  </div>
                )}

                {/* Lock banners */}
                {isTerminated && (
                  <div className="flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200/50 rounded-lg px-3 py-2 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/30 dark:text-amber-300">
                    <Warning className="h-3.5 w-3.5 shrink-0" weight="fill" />
                    Mission terminée — édition limitée
                  </div>
                )}
                {isCancelled && (
                  <div className="flex items-center gap-2 mt-3 bg-red-50 border border-red-200/50 rounded-lg px-3 py-2 text-[11px] text-red-800 dark:bg-red-950/30 dark:border-red-800/30 dark:text-red-300">
                    <Warning className="h-3.5 w-3.5 shrink-0" weight="fill" />
                    Annulée{mission.motif_annulation && ` — ${mission.motif_annulation}`}
                  </div>
                )}
              </div>

              {/* ── Segmented nav ── */}
              <div className="px-5 pb-3">
                <div className="flex items-center gap-0.5 bg-muted/40 rounded-xl p-1">
                  {SECTIONS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150',
                        activeSection === id
                          ? 'bg-card text-primary shadow-sm'
                          : 'text-muted-foreground/60 hover:text-muted-foreground',
                      )}
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        weight={activeSection === id ? 'fill' : 'regular'}
                      />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ SCROLLABLE ONE-PAGER ═══ */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
              <div className="px-6 py-2 divide-y divide-border/40 [&>*]:py-6 [&>*:first-child]:pt-4 [&>*:last-child]:pb-4">

                {/* ── Planning ── */}
                <div
                  ref={(el) => { sectionRefs.current.planning = el }}
                  data-section="planning"
                >
                  <SectionHeading Icon={Calendar}>Planning</SectionHeading>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-muted-foreground/55">Date</Label>
                      <DatePicker
                        value={datePlanifiee}
                        onChange={(v) => handlePlanningChange('date_planifiee', v)}
                        disabled={isLocked}
                        className={ghost}
                        modal
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold text-muted-foreground/55">Début</Label>
                          <TimePicker
                            value={heureDebut}
                            onChange={(v) => handlePlanningChange('heure_debut', v)}
                            disabled={isLocked}
                            modal
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold text-muted-foreground/55">Durée</Label>
                          <DurationPicker
                            value={dureeMin}
                            onChange={handleDureeChange}
                            disabled={isLocked}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/70">
                        {heureDebut && dureeMin
                          ? <>Heure de fin : <span className="font-semibold text-foreground/80">{computedHeureFin}</span></>
                          : 'Renseigne l\'heure de début et la durée pour calculer l\'heure de fin.'}
                      </p>
                    </div>
                    {planningDirty && !isLocked && (
                      <Button size="sm" onClick={handleSavePlanning} disabled={saving} className="w-full h-9">
                        {saving ? 'Enregistrement…' : 'Enregistrer le planning'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* ── Équipe ── */}
                <div
                  ref={(el) => { sectionRefs.current.equipe = el }}
                  data-section="equipe"
                  className="space-y-5"
                >
                  {/* Technicien */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/45">
                          <User className="h-3 w-3 shrink-0" />
                          Technicien
                        </p>
                      {!mission.technicien && !isLocked && (
                        <button
                          onClick={() => setShowTechPicker(v => !v)}
                          title="Assigner un technicien"
                          className={cn(
                            'h-6 w-6 rounded-md flex items-center justify-center transition-colors',
                            showTechPicker ? 'bg-primary text-primary-foreground' : 'bg-primary/10 hover:bg-primary/20 text-primary',
                          )}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {mission.technicien ? (
                      <>
                        <PersonRow
                          initials={`${mission.technicien.prenom?.[0] ?? ''}${mission.technicien.nom?.[0] ?? ''}`}
                          name={`${mission.technicien.prenom} ${mission.technicien.nom}`}
                          subtitle={mission.technicien.email}
                          avatarClass="bg-primary/10 text-primary"
                          dot={
                            mission.technicien.statut_invitation === 'accepte' ? 'bg-emerald-500' :
                            mission.technicien.statut_invitation === 'refuse'  ? 'bg-red-500' : 'bg-amber-400'
                          }
                          badge={INVITATION_BADGE_LABELS[mission.technicien.statut_invitation]}
                          badgeClass={invitPillClass(mission.technicien.statut_invitation)}
                        />
                        {mission.technicien.statut_invitation === 'en_attente' && !isLocked && (
                          <ManualInvitationActions
                            onAccept={() => handleManualInvitation('accepte')}
                            onRefuse={() => handleManualInvitation('refuse')}
                            busy={updateInvitation.isPending}
                          />
                        )}
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 py-2.5">
                          <div className="h-8 w-8 rounded-full bg-muted/20 border border-dashed border-border/40 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-muted-foreground/30" />
                          </div>
                          <p className="text-[12px] text-muted-foreground/40 italic">Non assigné</p>
                        </div>
                        {showTechPicker && (
                          <div className="rounded-xl border border-border/25 bg-card px-2 py-2">
                            <TechPicker
                              technicians={technicians}
                              onSelect={handleAssignTechnician}
                              placeholder={assigning ? 'Assignation…' : 'Rechercher un technicien…'}
                              className="w-full"
                              date={datePlanifiee}
                              excludeMissionId={mission.id}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Parties — lecture seule (spec US-811).
                    * Propriétaire/Mandataire vivent sur le Lot, Locataires sur les EDL.
                    * Pour modifier : aller sur la fiche Lot (proprio/mandataire) ou l'EDL tablette (locataires).
                    */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/45">
                          <Users className="h-3 w-3 shrink-0" />
                          Parties
                        </p>
                    </div>

                    {(mission.proprietaires.length === 0 && !mission.mandataire && !mission.edls.some(e => e.locataires.length > 0)) ? (
                      <div className="flex items-center gap-3 py-2.5">
                        <div className="h-8 w-8 rounded-full bg-muted/20 border border-dashed border-border/40 flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-muted-foreground/30" />
                        </div>
                        <p className="text-[12px] text-muted-foreground/40 italic">Aucune partie renseignée</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/20">
                        {mission.proprietaires.map((p) => (
                          <PersonRow
                            key={p.id}
                            initials={`${p.prenom ? p.prenom[0] : ''}${p.nom[0]}`.toUpperCase()}
                            name={p.prenom ? `${p.prenom} ${p.nom}` : p.nom}
                            subtitle="Propriétaire"
                            avatarClass="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                            to={`/app/tiers/${p.id}`}
                          />
                        ))}
                        {(() => {
                          const seen = new Set<string>()
                          return mission.edls.flatMap(edl => edl.locataires.filter(l => {
                            const key = `${l.tiers_id}-${l.role_locataire}`
                            if (seen.has(key)) return false
                            seen.add(key); return true
                          }).map(l => (
                            <PersonRow
                              key={`${l.tiers_id}-${l.role_locataire}`}
                              initials={`${l.prenom ? l.prenom[0] : ''}${l.nom[0]}`.toUpperCase()}
                              name={l.prenom ? `${l.prenom} ${l.nom}` : l.nom}
                              subtitle={l.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'}
                              avatarClass={l.role_locataire === 'entrant'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'}
                              to={`/app/tiers/${l.tiers_id}`}
                            />
                          )))
                        })()}
                        {mission.mandataire && (
                          <PersonRow
                            initials={(mission.mandataire.raison_sociale || mission.mandataire.nom).slice(0, 2).toUpperCase()}
                            name={mission.mandataire.raison_sociale || mission.mandataire.nom}
                            subtitle="Mandataire"
                            avatarClass="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                            to={`/app/tiers/${mission.mandataire.id}`}
                          />
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground/50 mt-3 leading-relaxed">
                      Propriétaire/mandataire se modifient sur la <Link to={`/app/patrimoine/lots/${mission.lot.id}`} onClick={onClose} className="text-primary hover:underline">fiche lot</Link>. Locataires gérés via les EDL.
                    </p>
                  </div>
                </div>

                {/* ── Bien ── */}
                <div
                  ref={(el) => { sectionRefs.current.bien = el }}
                  data-section="bien"
                >
                  <SectionHeading Icon={House}>Lot &amp; Bâtiment</SectionHeading>
                  <div className="space-y-1">
                    <Link to={`/app/patrimoine/lots/${mission.lot.id}`}
                      className="group flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-accent/40 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                        <House className="h-4 w-4 text-blue-500 dark:text-blue-400" weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{formatLotLabel(mission.lot)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {typeBienLabels[mission.lot.type_bien] || mission.lot.type_bien}
                          {mission.lot.etage   && ` · Étage ${mission.lot.etage}`}
                          {mission.lot.surface && ` · ${mission.lot.surface} m²`}
                        </p>
                      </div>
                      <CaretRight className="h-3.5 w-3.5 text-muted-foreground/25 group-hover:text-primary transition-colors shrink-0" />
                    </Link>

                    <Link to={`/app/patrimoine/batiments/${mission.lot.batiment.id}`}
                      className="group flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-accent/40 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                        <BuildingOffice className="h-4 w-4 text-violet-500 dark:text-violet-400" weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{mission.lot.batiment.designation}</p>
                        {mission.lot.adresse && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" weight="duotone" />
                            {formatAddress(mission.lot.adresse)}
                          </p>
                        )}
                      </div>
                      <CaretRight className="h-3.5 w-3.5 text-muted-foreground/25 group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  </div>
                </div>

                {/* ── Documents ── */}
                <div
                  ref={(el) => { sectionRefs.current.documents = el }}
                  data-section="documents"
                  className="space-y-5"
                >
                  {/* EDL */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <SectionHeading Icon={FileText}>Documents EDL</SectionHeading>
                      {mission.edls.length > 0 && (
                        <span className="text-[11px] text-muted-foreground -mt-3">
                          {mission.edls.length} doc{mission.edls.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {mission.edls.length === 0 ? (
                      <div className="flex items-center gap-2.5 py-2 text-muted-foreground/35">
                        <FileText className="h-4 w-4 shrink-0" />
                        <p className="text-[12px] italic">Aucun EDL associé</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {mission.edls.map((edl) => {
                          const isSigne       = edl.statut === 'signe'
                          const isInfructueux = edl.statut === 'infructueux'
                          const accent = isSigne
                            ? { text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' }
                            : isInfructueux
                              ? { text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' }
                              : { text: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' }
                          return (
                            <div
                              key={edl.id}
                              className="rounded-2xl border border-border/40 bg-card px-3 py-3 shadow-xs transition-shadow hover:shadow-elevation-raised"
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0', sensColors[edl.sens])}>
                                    {sensLabels[edl.sens]}
                                  </span>
                                  <span className="text-[13px] font-semibold text-foreground truncate">
                                    {edl.type === 'inventaire' ? 'Inventaire' : 'État des lieux'}
                                  </span>
                                </div>
                                <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold shrink-0', accent.text)}>
                                  <span className={cn('h-1.5 w-1.5 rounded-full', accent.dot)} />
                                  {statutEdlLabels[edl.statut] || edl.statut}
                                </div>
                              </div>

                              {/* Locataires */}
                              {edl.locataires.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {edl.locataires.map((l) => (
                                    <span key={l.tiers_id} className={cn(
                                      'text-[11px] font-medium px-2 py-0.5 rounded-full',
                                      l.role_locataire === 'entrant'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        : 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
                                    )}>
                                      {l.prenom ? `${l.prenom} ${l.nom}` : l.nom}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Document links */}
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {([
                                  { url: edl.url_pdf,       Icon: FilePdf, label: 'PDF',       color: 'text-red-500'    },
                                  { url: edl.url_web,       Icon: Globe,   label: 'Web',       color: 'text-blue-500'   },
                                  { url: edl.url_pdf_legal, Icon: Scales,  label: 'PDF légal', color: 'text-violet-500' },
                                  { url: edl.url_web_legal, Icon: Globe,   label: 'Web légal', color: 'text-violet-500' },
                                ] as const).map(({ url, Icon: LIcon, label, color }) => url ? (
                                  <a
                                    key={label}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/40 hover:bg-muted/70 border border-transparent hover:border-border/60 transition-colors"
                                  >
                                    <LIcon className={cn('h-3.5 w-3.5 shrink-0', color)} weight="duotone" />
                                    <span className="text-foreground/80">{label}</span>
                                  </a>
                                ) : (
                                  <span key={label} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full text-muted-foreground/30 cursor-not-allowed select-none">
                                    <LIcon className="h-3.5 w-3.5 shrink-0" />{label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ajouter un EDL — fonctionnalité MASQUÉE en attendant complétion (Tony §3) :
                    * la version actuelle ne permet ni d'assigner un locataire à l'EDL créé,
                    * ni de modifier/supprimer un EDL fraîchement créé. Réactiver quand le
                    * scope sera complété (picker locataire + edit/delete inline). State et
                    * handler conservés (handleAddEdl, addEdl mutation) pour le moment. */}

                  {/* Clés */}
                  {mission.cles.length > 0 && (
                    <div>
                      <SectionHeading Icon={Key}>Clés</SectionHeading>
                      <div className="divide-y divide-border/20">
                        {mission.cles.map((cle) => (
                          <div key={cle.id} className="flex items-center justify-between py-2.5">
                            <div className="flex items-center gap-2.5">
                              <Key className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" weight="duotone" />
                              <span className="text-[13px] font-medium">{typeCleLabels[cle.type_cle] || cle.type_cle}</span>
                              {cle.quantite > 1 && <span className="text-[11px] text-muted-foreground">×{cle.quantite}</span>}
                              {cle.lieu_depot && <span className="text-[11px] text-muted-foreground">· {cle.lieu_depot}</span>}
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                              {statutCleLabels[cle.statut] || cle.statut}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Commentaire (no tab, always at bottom) ── */}
                <div>
                  <SectionHeading Icon={ChatText}>Commentaire</SectionHeading>
                  <div className="space-y-2.5">
                    <Textarea
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      placeholder="Ajouter un commentaire…"
                      rows={4}
                      className={cn(
                        'resize-none text-[13px] w-full rounded-xl shadow-xs',
                        'bg-card border border-border/60',
                        'hover:border-border/90',
                        'focus:border-primary/60 focus:ring-2 focus:ring-primary/10',
                        'transition-colors',
                      )}
                    />
                    {commentaire !== (mission.commentaire || '') && (
                      <Button size="sm" variant="outline" onClick={handleSaveComment} disabled={saving} className="w-full h-9 text-[12px]">
                        {saving ? 'Enregistrement…' : 'Enregistrer la note'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bottom padding */}
                <div className="h-2" />
              </div>
            </div>

            {/* ═══ STICKY FOOTER ═══ */}
            <div className="shrink-0 border-t border-border/40 px-6 py-4">
              <Button
                variant="outline"
                className="w-full h-10 justify-between text-[13px] font-semibold rounded-xl"
                onClick={() => {
                  onClose()
                  navigate(`/app/missions/${mission.id}`, {
                    state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference || 'Mission' }] }
                  })
                }}
              >
                Ouvrir la fiche complète
                <ArrowSquareOut className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>

      {/* Cancel mission modal */}
      {mission && showCancelModal && (
        <CancelMissionModal
          open={showCancelModal}
          onOpenChange={setShowCancelModal}
          missionId={mission.id}
          missionStatut={mission.statut}
          edlBrouillonCount={mission.edls?.filter(e => e.statut === 'brouillon').length ?? 0}
        />
      )}

    </Sheet>
  )
}
