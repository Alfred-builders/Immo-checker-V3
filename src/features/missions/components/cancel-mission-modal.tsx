import { useState } from 'react'
import { Warning, Prohibit, Lock } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Textarea } from 'src/components/ui/textarea'
import { Label } from 'src/components/ui/label'
import { useCancelMission } from '../api'
import { toast } from 'sonner'
import type { MissionStatut } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  missionId: string
  missionStatut: MissionStatut
  edlBrouillonCount?: number
}

export function CancelMissionModal({ open, onOpenChange, missionId, missionStatut, edlBrouillonCount = 0 }: Props) {
  const [motif, setMotif] = useState('')
  const cancelMission = useCancelMission()

  const isTerminated = missionStatut === 'terminee'

  async function handleConfirm() {
    if (!motif.trim()) {
      toast.error('Le motif d\'annulation est obligatoire')
      return
    }

    try {
      await cancelMission.mutateAsync({ id: missionId, motif: motif.trim() })
      toast.success('Mission annulée')
      setMotif('')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'annulation')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Prohibit className="h-5 w-5 text-destructive" />
            Annuler la mission
          </DialogTitle>
        </DialogHeader>

        {/* Terminated: cannot cancel */}
        {isTerminated ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Impossible d'annuler cette mission
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Les EDL signés sont des documents légaux immuables. Une mission terminée ne peut pas être annulée.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <Warning className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Cette action est irréversible
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  La mission sera annulée et le technicien assigné sera notifié.
                </p>
                {edlBrouillonCount > 0 && (
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-1">
                    {edlBrouillonCount} EDL en brouillon {edlBrouillonCount > 1 ? 'seront marqués' : 'sera marqué'} comme infructueux.
                  </p>
                )}
              </div>
            </div>

            {/* Motif (mandatory) */}
            <div className="space-y-1.5">
              <Label className="text-xs">Motif d'annulation *</Label>
              <Textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Indiquez la raison de l'annulation..."
                rows={3}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground/60">
                Le motif est obligatoire et sera conservé dans l'historique.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => { setMotif(''); onOpenChange(false) }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={cancelMission.isPending || !motif.trim()}
              >
                {cancelMission.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
