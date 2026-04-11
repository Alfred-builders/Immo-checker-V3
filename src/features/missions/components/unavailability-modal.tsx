import { useState, useEffect } from 'react'
import { CalendarX, Trash, Repeat, SpinnerGap } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import {
  useIndisponibilites,
  useCreateIndisponibilite,
  useUpdateIndisponibilite,
  useDeleteIndisponibilite,
  useWorkspaceTechnicians,
} from '../api'
import { toast } from 'sonner'
import type { RecurrenceConfig, IndisponibiliteTechnicien } from '../types'

const FREQ_LABELS: Record<string, string> = {
  daily: 'Quotidienne',
  weekly: 'Hebdomadaire',
  biweekly: 'Bi-hebdomadaire',
  monthly: 'Mensuelle',
}

const DAY_OPTIONS = [
  { value: 'MO', label: 'Lun' },
  { value: 'TU', label: 'Mar' },
  { value: 'WE', label: 'Mer' },
  { value: 'TH', label: 'Jeu' },
  { value: 'FR', label: 'Ven' },
  { value: 'SA', label: 'Sam' },
  { value: 'SU', label: 'Dim' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string
  preselectedUserId?: string
  preselectedDate?: string
}

export function UnavailabilityModal({ open, onOpenChange, editId, preselectedUserId, preselectedDate }: Props) {
  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  const createMutation = useCreateIndisponibilite()
  const updateMutation = useUpdateIndisponibilite()
  const deleteMutation = useDeleteIndisponibilite()

  // Fetch existing data if editing
  const { data: allIndispos } = useIndisponibilites()
  const existingData = editId ? allIndispos?.find(i => i.id === editId) : undefined

  // Form state
  const [userId, setUserId] = useState(preselectedUserId || '')
  const [journeeEntiere, setJourneeEntiere] = useState(true)
  const [dateDebut, setDateDebut] = useState(preselectedDate || '')
  const [dateFin, setDateFin] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [estRecurrent, setEstRecurrent] = useState(false)
  const [recurrenceFreq, setRecurrenceFreq] = useState<string>('weekly')
  const [recurrenceByday, setRecurrenceByday] = useState<string[]>([])
  const [recurrenceEnd, setRecurrenceEnd] = useState<'count' | 'until' | 'never'>('never')
  const [recurrenceCount, setRecurrenceCount] = useState('10')
  const [recurrenceUntil, setRecurrenceUntil] = useState('')
  const [motif, setMotif] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEdit = !!editId

  // Populate form when editing
  useEffect(() => {
    if (existingData) {
      setUserId(existingData.user_id)
      setJourneeEntiere(existingData.est_journee_entiere)
      setDateDebut(existingData.date_debut.split('T')[0])
      setDateFin(existingData.date_fin.split('T')[0])
      setHeureDebut(existingData.est_journee_entiere ? '' : existingData.date_debut.split('T')[1]?.slice(0, 5) || '')
      setHeureFin(existingData.est_journee_entiere ? '' : existingData.date_fin.split('T')[1]?.slice(0, 5) || '')
      setEstRecurrent(existingData.est_recurrent)
      setMotif(existingData.motif || '')

      if (existingData.recurrence_config) {
        const rc = existingData.recurrence_config
        setRecurrenceFreq(rc.freq)
        setRecurrenceByday(rc.byday || [])
        if (rc.count) {
          setRecurrenceEnd('count')
          setRecurrenceCount(String(rc.count))
        } else if (rc.until) {
          setRecurrenceEnd('until')
          setRecurrenceUntil(rc.until)
        } else {
          setRecurrenceEnd('never')
        }
      }
    } else if (!editId) {
      // Reset form for create mode
      setUserId(preselectedUserId || '')
      setJourneeEntiere(true)
      setDateDebut('')
      setDateFin('')
      setHeureDebut('')
      setHeureFin('')
      setEstRecurrent(false)
      setRecurrenceFreq('weekly')
      setRecurrenceByday([])
      setRecurrenceEnd('never')
      setRecurrenceCount('10')
      setRecurrenceUntil('')
      setMotif('')
    }
  }, [existingData, editId, preselectedUserId, open])

  function toggleDay(day: string) {
    setRecurrenceByday(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function buildRecurrenceConfig(): RecurrenceConfig | undefined {
    if (!estRecurrent) return undefined

    const config: RecurrenceConfig = {
      freq: recurrenceFreq as RecurrenceConfig['freq'],
    }
    if (recurrenceByday.length > 0 && (recurrenceFreq === 'weekly' || recurrenceFreq === 'biweekly')) {
      config.byday = recurrenceByday
    }
    if (recurrenceEnd === 'count' && recurrenceCount) {
      config.count = parseInt(recurrenceCount)
    } else if (recurrenceEnd === 'until' && recurrenceUntil) {
      config.until = recurrenceUntil
    }
    return config
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!userId) {
      toast.error('Veuillez selectionner un technicien')
      return
    }
    if (!dateDebut) {
      toast.error('Veuillez saisir une date de debut')
      return
    }

    const effectiveDateFin = dateFin || dateDebut

    // Build date strings with optional time
    const date_debut = journeeEntiere
      ? `${dateDebut}T00:00:00`
      : `${dateDebut}T${heureDebut || '00:00'}:00`
    const date_fin = journeeEntiere
      ? `${effectiveDateFin}T23:59:59`
      : `${effectiveDateFin}T${heureFin || '23:59'}:00`

    const payload = {
      user_id: userId,
      date_debut,
      date_fin,
      est_journee_entiere: journeeEntiere,
      est_recurrent: estRecurrent,
      recurrence_config: buildRecurrenceConfig(),
      motif: motif || undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editId!, ...payload })
        toast.success('Indisponibilite mise à jour')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Indisponibilite creee')
      }
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  async function handleDelete() {
    if (!editId) return
    try {
      await deleteMutation.mutateAsync(editId)
      toast.success('Indisponibilite supprimee')
      setShowDeleteConfirm(false)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5 text-muted-foreground" />
            {isEdit ? 'Modifier l\'indisponibilite' : 'Nouvelle indisponibilite'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Technicien */}
          <div className="space-y-1.5">
            <Label className="text-xs">Technicien *</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sélectionner un technicien..." />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.prenom} {t.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Journee entiere toggle */}
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">Journee entiere</Label>
            <Switch
              checked={journeeEntiere}
              onCheckedChange={setJourneeEntiere}
            />
          </div>

          {/* Date debut / fin */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date debut *</Label>
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date fin</Label>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="h-9"
                min={dateDebut}
              />
            </div>
          </div>

          {/* Heures (conditional) */}
          {!journeeEntiere && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Heure debut</Label>
                <Input
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Heure fin</Label>
                <Input
                  type="time"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* Recurrence toggle */}
          <div className="border-t border-border/60 pt-4">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                Recurrence
              </Label>
              <Switch
                checked={estRecurrent}
                onCheckedChange={setEstRecurrent}
              />
            </div>
          </div>

          {/* Recurrence config */}
          {estRecurrent && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30">
              {/* Frequence */}
              <div className="space-y-1.5">
                <Label className="text-xs">Frequence</Label>
                <Select value={recurrenceFreq} onValueChange={setRecurrenceFreq}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jours (for weekly/biweekly) */}
              {(recurrenceFreq === 'weekly' || recurrenceFreq === 'biweekly') && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Jours</Label>
                  <div className="flex gap-1">
                    {DAY_OPTIONS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`h-8 w-10 rounded-lg text-[11px] font-medium transition-all ${
                          recurrenceByday.includes(day.value)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* End condition */}
              <div className="space-y-1.5">
                <Label className="text-xs">Fin</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rec_end"
                      checked={recurrenceEnd === 'never'}
                      onChange={() => setRecurrenceEnd('never')}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span className="text-xs text-foreground">Jamais</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rec_end"
                      checked={recurrenceEnd === 'count'}
                      onChange={() => setRecurrenceEnd('count')}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span className="text-xs text-foreground">Apres</span>
                    {recurrenceEnd === 'count' && (
                      <Input
                        type="number"
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(e.target.value)}
                        className="h-7 w-16 text-xs"
                        min="1"
                        max="100"
                      />
                    )}
                    {recurrenceEnd === 'count' && (
                      <span className="text-xs text-muted-foreground">occurrences</span>
                    )}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rec_end"
                      checked={recurrenceEnd === 'until'}
                      onChange={() => setRecurrenceEnd('until')}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span className="text-xs text-foreground">Jusqu'au</span>
                    {recurrenceEnd === 'until' && (
                      <Input
                        type="date"
                        value={recurrenceUntil}
                        onChange={(e) => setRecurrenceUntil(e.target.value)}
                        className="h-7 text-xs"
                        min={dateDebut}
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Motif */}
          <div className="space-y-1.5">
            <Label className="text-xs">Motif</Label>
            <Textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Conge, formation, rendez-vous personnel..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {/* Delete button (edit mode only) */}
            <div>
              {isEdit && !showDeleteConfirm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash className="h-3.5 w-3.5" /> Supprimer
                </Button>
              )}
              {isEdit && showDeleteConfirm && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Confirmer ?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Oui, supprimer'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Non
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
