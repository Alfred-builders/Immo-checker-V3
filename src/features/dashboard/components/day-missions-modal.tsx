import { useNavigate } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { useMissions } from '../../missions/api'
import {
  missionStatutLabels,
  missionStatutColors,
  sensLabels,
  sensColors,
  getPendingActions,
} from '../../missions/types'
import { formatDate } from 'src/lib/formatters'

interface DayMissionsModalProps {
  date: string
  onClose: () => void
  onMissionClick: (id: string) => void
}

export function DayMissionsModal({ date, onClose, onMissionClick }: DayMissionsModalProps) {
  const navigate = useNavigate()

  const { data: missionsData, isLoading } = useMissions({
    date_from: date,
    date_to: date,
    limit: 50,
  })
  const missions = missionsData?.data ?? []

  function handleMissionClick(id: string) {
    onMissionClick(id)
    onClose()
  }

  function handleViewAllMissions() {
    onClose()
    navigate(`/app/missions?date_from=${date}&date_to=${date}`)
  }

  return (
    <Dialog open={!!date} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Missions du {formatDate(date)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto -mx-2">
          {isLoading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          )}

          {!isLoading && missions.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aucune mission pour cette date
            </div>
          )}

          {missions.map((mission) => {
            const pendingActions = getPendingActions(mission)
            const techName = mission.technicien
              ? `${mission.technicien.prenom} ${mission.technicien.nom}`
              : null

            return (
              <button
                key={mission.id}
                onClick={() => handleMissionClick(mission.id)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-accent/50 transition-colors group"
              >
                {/* Left: reference + lot + tech */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {mission.reference}
                    </span>
                    {/* EDL type badges */}
                    <div className="flex gap-1">
                      {mission.edl_types?.map((t) => (
                        <span
                          key={t}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            t === 'entree' || t === 'sortie'
                              ? sensColors[t as 'entree' | 'sortie']
                              : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                          }`}
                        >
                          {t === 'entree' || t === 'sortie'
                            ? sensLabels[t as 'entree' | 'sortie']
                            : 'Inv.'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {mission.lot_designation}
                    {mission.adresse && ` — ${mission.adresse}`}
                  </div>
                  {techName && (
                    <div className="text-xs text-muted-foreground/70 mt-0.5">
                      {techName}
                    </div>
                  )}
                  {/* Pending action tags */}
                  {pendingActions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pendingActions.map((action, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-medium text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/50"
                        >
                          {action}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: status badge + chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium ${missionStatutColors[mission.statut]}`}
                  >
                    {missionStatutLabels[mission.statut]}
                  </span>
                  <CaretRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer link to missions page */}
        {!isLoading && missions.length > 0 && (
          <div className="flex justify-center pt-2 border-t border-border/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAllMissions}
              className="text-xs text-muted-foreground"
            >
              Voir toutes les missions du jour
              <CaretRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
