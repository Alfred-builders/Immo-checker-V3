import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Warning, UsersThree } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { RecordPicker } from 'src/components/shared/record-picker'
import { CreateLotModal } from 'src/features/patrimoine/components/create-lot-modal'
import { CreateTiersModal } from 'src/features/tiers/components/create-tiers-modal'
import { useCreateMission, useWorkspaceTechnicians, useTechnicianConflicts } from '../api'
import { toast } from 'sonner'
import type { SensEDL, TechnicianConflicts } from '../types'

// We'll use a simple lot search hook from patrimoine
// In real app, this would come from a shared API
import { api } from 'src/lib/api-client'
import { useQuery, useQueries } from '@tanstack/react-query'

type LotRow = { id: string; designation: string; type_bien: string; batiment_designation: string; adresse: string | null; proprietaire_nom: string | null; etage: string | null }

function useLotSearch(search: string) {
  return useQuery({
    queryKey: ['lots-search', search],
    queryFn: () => api<{ data: LotRow[] }>(`/lots?search=${encodeURIComponent(search)}&limit=20`),
    enabled: search.length > 0,
  })
}

function useRecentLots(enabled: boolean) {
  return useQuery({
    queryKey: ['lots-recent'],
    queryFn: () => api<{ data: LotRow[] }>(`/lots?sort=recent&limit=3`),
    enabled,
    staleTime: 30_000,
  })
}

type TiersRow = { id: string; nom: string; prenom?: string; raison_sociale?: string; type: string; email?: string }

function useTiersSearch(search: string) {
  return useQuery({
    queryKey: ['tiers-search', search, 'locataire'],
    queryFn: () => api<{ data: TiersRow[] }>(`/tiers?search=${encodeURIComponent(search)}&role=locataire&limit=20`),
    enabled: search.length > 0,
  })
}

function useRecentTiers(enabled: boolean) {
  return useQuery({
    queryKey: ['tiers-recent', 'locataire'],
    queryFn: () => api<{ data: TiersRow[] }>(`/tiers?role=locataire&sort=recent&limit=3`),
    enabled,
    staleTime: 30_000,
  })
}

/** Fetch conflicts for all technicians on a given date */
function useAllTechConflicts(
  technicians: Array<{ id: string }>,
  date: string | undefined
) {
  const results = useQueries({
    queries: technicians.map((t) => ({
      queryKey: ['tech-conflicts', t.id, date],
      queryFn: () => api<TechnicianConflicts>(`/technicians/${t.id}/conflicts?date=${date}`),
      enabled: !!date,
      staleTime: 30_000,
    })),
  })

  const map = new Map<string, TechnicianConflicts>()
  technicians.forEach((t, i) => {
    if (results[i]?.data) {
      map.set(t.id, results[i].data!)
    }
  })
  return map
}

interface Locataire {
  tiers_id: string
  nom: string
  prenom?: string
  role_locataire: 'entrant' | 'sortant'
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedLotId?: string
  preselectedDate?: string
}

export function CreateMissionModal({ open, onOpenChange, preselectedLotId, preselectedDate }: Props) {
  const navigate = useNavigate()
  const createMission = useCreateMission()
  const { data: techData, isLoading: techLoading } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  // Form state
  const [lotId, setLotId] = useState(preselectedLotId || '')
  const [lotSearch, setLotSearch] = useState('')
  const [sens, setSens] = useState<'entree' | 'sortie' | 'entree_sortie'>('entree')
  const [avecInventaire, setAvecInventaire] = useState(false)
  const [datePlanifiée, setDatePlanifiée] = useState(preselectedDate || '')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [typeBail, setTypeBail] = useState<'individuel' | 'collectif'>('individuel')
  const [technicienId, setTechnicienId] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [tiersSearch, setTiersSearch] = useState('')
  const [showLocatairePicker, setShowLocatairePicker] = useState(false)
  const [locataireRole, setLocataireRole] = useState<'entrant' | 'sortant'>('entrant')
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [createdLotLabel, setCreatedLotLabel] = useState('')
  const [showCreateLocataire, setShowCreateLocataire] = useState(false)

  const { data: lotData } = useLotSearch(lotSearch)
  const { data: recentLotData } = useRecentLots(open && lotSearch.length === 0)
  const lots: LotRow[] = lotSearch.length > 0
    ? (lotData?.data ?? [])
    : (recentLotData?.data ?? [])

  const { data: tiersData } = useTiersSearch(tiersSearch)
  const { data: recentTiersData } = useRecentTiers(open && showLocatairePicker && tiersSearch.length === 0)
  const tiersOptions: TiersRow[] = tiersSearch.length > 0
    ? (tiersData?.data ?? [])
    : (recentTiersData?.data ?? [])
  const isShowingRecentTiers = tiersSearch.length === 0 && tiersOptions.length > 0

  // Conflict check for selected tech (existing -- used for the warning box)
  const { data: conflicts } = useTechnicianConflicts(
    technicienId || undefined,
    datePlanifiée || undefined
  )
  const hasConflicts = conflicts && (conflicts.missions.length > 0 || conflicts.indisponibilites.length > 0)

  // Conflict check for all techs (S3-8 -- used for dropdown labels)
  const allTechConflicts = useAllTechConflicts(technicians, datePlanifiée || undefined)

  function reset() {
    setLotId(preselectedLotId || '')
    setLotSearch('')
    setSens('entree')
    setAvecInventaire(false)
    setDatePlanifiée(preselectedDate || '')
    setHeureDebut('')
    setHeureFin('')
    setLocataires([])
    setTypeBail('individuel')
    setTechnicienId('')
    setCommentaire('')
    setTiersSearch('')
    setShowLocatairePicker(false)
    setCreatedLotLabel('')
    setShowCreateLocataire(false)
  }

  // Sync form with latest preselectedDate every time the modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) reset() }, [open])

  function addLocataire(tiers: { id: string; nom: string; prenom?: string }) {
    if (locataires.some(l => l.tiers_id === tiers.id)) return
    setLocataires(prev => [...prev, {
      tiers_id: tiers.id,
      nom: tiers.nom,
      prenom: tiers.prenom,
      role_locataire: locataireRole,
    }])
    setShowLocatairePicker(false)
    setTiersSearch('')
  }

  function removeLocataire(tiersId: string) {
    setLocataires(prev => prev.filter(l => l.tiers_id !== tiersId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!lotId) {
      toast.error('Veuillez sélectionner un lot')
      return
    }
    if (!datePlanifiée) {
      toast.error('Veuillez saisir une date')
      return
    }
    if (heureDebut && heureFin && heureFin <= heureDebut) {
      toast.error('L\'heure de fin doit être après l\'heure de début')
      return
    }
    if (locataires.length >= 2 && !typeBail) {
      toast.error('Veuillez choisir le type de bail (individuel ou collectif)')
      return
    }

    try {
      const result = await createMission.mutateAsync({
        lot_id: lotId,
        sens: sens as SensEDL | 'entree_sortie',
        avec_inventaire: avecInventaire,
        date_planifiee: datePlanifiée,
        heure_debut: heureDebut || undefined,
        heure_fin: heureFin || undefined,
        technicien_id: technicienId || undefined,
        commentaire: commentaire || undefined,
        locataires: locataires.map(l => ({
          tiers_id: l.tiers_id,
          role_locataire: l.role_locataire,
        })),
        type_bail: locataires.length >= 2 ? typeBail : undefined,
      })
      toast.success('Mission créée')
      reset()
      onOpenChange(false)
      navigate(`/app/missions/${result.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  const isShowingRecent = lotSearch.length === 0 && lots.length > 0
  const lotOptions = [
    // Include the just-created lot so the picker can display it
    ...(lotId && createdLotLabel && !lots.some(l => l.id === lotId) ? [{ id: lotId, label: createdLotLabel, sublabel: 'Lot créé', meta: '' }] : []),
    ...lots.map(l => ({
      id: l.id,
      label: l.designation,
      sublabel: l.adresse ? `${l.batiment_designation} - ${l.adresse}` : l.batiment_designation,
      meta: isShowingRecent ? 'Récent' : l.type_bien,
    })),
  ]

  /** Compute conflict label for a technician */
  function getTechConflictInfo(techId: string): { label: string; color: string } | null {
    if (!datePlanifiée) return null
    const c = allTechConflicts.get(techId)
    if (!c) return null
    if (c.indisponibilites.length > 0) {
      return { label: 'Indisponible', color: 'text-muted-foreground' }
    }
    if (c.missions.length > 0) {
      return { label: 'Deja en mission', color: 'text-orange-600 dark:text-orange-400' }
    }
    return null
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle mission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Lot picker */}
          <div className="space-y-1.5">
            <Label className="text-xs">Lot *</Label>
            <RecordPicker
              options={lotOptions}
              value={lotId || null}
              onChange={(id) => setLotId(id || '')}
              placeholder="Rechercher un lot..."
              searchPlaceholder="Désignation, adresse..."
              onSearch={setLotSearch}
              isLoading={lotSearch.length > 0 && !lotData}
              onCreateClick={() => setShowCreateLot(true)}
              createLabel="Créer un lot"
            />
          </div>

          {/* 2. Sens */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type d'intervention *</Label>
            <div className="flex gap-2">
              {(['entree', 'sortie', 'entree_sortie'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSens(s)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    sens === s
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card border-border/60 text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  {s === 'entree' ? 'Entrée' : s === 'sortie' ? 'Sortie' : 'Entrée + Sortie'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Avec inventaire */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-xs">Avec inventaire</Label>
            <Switch
              checked={avecInventaire}
              onCheckedChange={setAvecInventaire}
            />
          </div>

          {/* 4. Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">Date *</Label>
            <Input
              type="date"
              value={datePlanifiée}
              onChange={(e) => setDatePlanifiée(e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              required
              className="h-9 cursor-pointer"
            />
            {datePlanifiée && datePlanifiée < new Date().toISOString().split('T')[0] && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                <Warning className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" weight="fill" />
                <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                  Cette date est antérieure à aujourd'hui. Vérifie que c'est bien ce que tu souhaites.
                </p>
              </div>
            )}
          </div>

          {/* 5. Heures */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Heure début</Label>
              <Input
                type="time"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                className="h-9 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Heure fin</Label>
              <Input
                type="time"
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                className="h-9 cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Locataires */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground tracking-normal flex items-center gap-1.5">
                <UsersThree className="h-3.5 w-3.5" /> Locataires
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowLocatairePicker(true)}
              >
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            </div>

            {/* Locataire list */}
            {locataires.length > 0 && (
              <div className="space-y-1.5">
                {locataires.map((loc) => (
                  <div
                    key={loc.tiers_id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">
                        {loc.prenom ? `${loc.prenom} ${loc.nom}` : loc.nom}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        loc.role_locataire === 'entrant'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {loc.role_locataire === 'entrant' ? 'Entrant' : 'Sortant'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocataire(loc.tiers_id)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Locataire picker */}
            {showLocatairePicker && (
              <div className="space-y-2 p-3 rounded-lg border border-border/60 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Select value={locataireRole} onValueChange={(v) => setLocataireRole(v as 'entrant' | 'sortant')}>
                    <SelectTrigger className="h-8 w-[100px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrant">Entrant</SelectItem>
                      <SelectItem value="sortant">Sortant</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => { setShowLocatairePicker(false); setTiersSearch('') }}
                    className="text-muted-foreground/40 hover:text-foreground transition-colors ml-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <RecordPicker
                  options={tiersOptions.map(t => ({
                    id: t.id,
                    label: t.prenom ? `${t.prenom} ${t.nom}` : (t.raison_sociale || t.nom),
                    sublabel: t.email,
                    meta: isShowingRecentTiers ? 'Récent' : (t.type === 'physique' ? 'Personne physique' : 'Personne morale'),
                  }))}
                  value={null}
                  onChange={(id) => {
                    if (!id) return
                    const tiers = tiersOptions.find(t => t.id === id)
                    if (tiers) addLocataire({ id: tiers.id, nom: tiers.nom, prenom: tiers.prenom })
                  }}
                  placeholder="Rechercher un locataire..."
                  searchPlaceholder="Nom, email..."
                  onSearch={setTiersSearch}
                  isLoading={tiersSearch.length > 0 && !tiersData}
                  onCreateClick={() => setShowCreateLocataire(true)}
                  createLabel="Créer un locataire"
                />
              </div>
            )}

            {/* Type bail (visible when 2+ locataires) */}
            {locataires.length >= 2 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Type de bail</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTypeBail('individuel')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      typeBail === 'individuel'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Individuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeBail('collectif')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      typeBail === 'collectif'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Collectif
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                  {typeBail === 'individuel'
                    ? 'Chaque locataire aura son propre EDL'
                    : 'Un seul EDL signe par tous les locataires'}
                </p>
              </div>
            )}
          </div>

          {/* 7. Technicien */}
          <div className="border-t border-border/60 pt-4 space-y-1.5">
            <Label className="text-xs">Technicien</Label>
            <Select value={technicienId} onValueChange={setTechnicienId} disabled={techLoading}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={techLoading ? 'Chargement...' : 'Sélectionner un technicien...'} />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => {
                  const conflictInfo = getTechConflictInfo(t.id)
                  return (
                    <SelectItem key={t.id} value={t.id}>
                      <span className={`flex items-center gap-2 ${conflictInfo ? 'text-muted-foreground' : ''}`}>
                        <span className={conflictInfo ? 'text-muted-foreground' : ''}>
                          {t.prenom} {t.nom}
                        </span>
                        {conflictInfo && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            conflictInfo.color === 'text-muted-foreground'
                              ? 'bg-muted/30 text-muted-foreground'
                              : 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                          }`}>
                            {conflictInfo.label}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Conflict warning */}
            {hasConflicts && (
              <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                <Warning className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300 min-w-0 flex-1 space-y-1.5">
                  {conflicts!.missions.length > 0 && (
                    <div>
                      <p className="font-semibold">
                        {conflicts!.missions.length} mission{conflicts!.missions.length > 1 ? 's' : ''} déjà planifiée{conflicts!.missions.length > 1 ? 's' : ''} ce jour
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {conflicts!.missions.map(m => {
                          const creneau = m.heure_debut
                            ? `${m.heure_debut.slice(0, 5)}${m.heure_fin ? `–${m.heure_fin.slice(0, 5)}` : ''}`
                            : 'horaire non défini'
                          return (
                            <li key={m.id} className="flex items-baseline gap-1.5">
                              <span className="font-mono font-semibold shrink-0">{m.reference}</span>
                              <span className="text-amber-700 dark:text-amber-400 shrink-0">· {creneau}</span>
                              {m.adresse && (
                                <span className="text-amber-700/80 dark:text-amber-400/80 truncate" title={m.adresse}>
                                  · {m.adresse}
                                </span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {conflicts!.indisponibilites.length > 0 && (
                    <p className="font-semibold">Technicien marqué indisponible ce jour</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 8. Commentaire */}
          <div className="border-t border-border/60 pt-4 space-y-1.5">
            <Label className="text-xs">Commentaire</Label>
            <Textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Instructions, notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false) }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createMission.isPending}>
              {createMission.isPending ? 'Création...' : 'Créer la mission'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <CreateTiersModal
      open={showCreateLocataire}
      onOpenChange={setShowCreateLocataire}
      onCreated={async (tiersId) => {
        setShowCreateLocataire(false)
        try {
          const t = await api<any>(`/tiers/${tiersId}`)
          addLocataire({ id: t.id, nom: t.nom, prenom: t.prenom })
        } catch { /* locataire added without name display */ }
      }}
    />

    <CreateLotModal
      open={showCreateLot}
      onOpenChange={setShowCreateLot}
      onCreated={async (newLotId) => {
        setLotId(newLotId)
        setShowCreateLot(false)
        // Fetch lot name to display in picker
        try {
          const lot = await api<any>(`/lots/${newLotId}`)
          setCreatedLotLabel(lot.designation || 'Nouveau lot')
        } catch { setCreatedLotLabel('Nouveau lot') }
      }}
    />
    </>
  )
}
