import { cn } from 'src/lib/cn'
import {
  getStatutMission,
  statutMissionColors,
  statutMissionDotColors,
  statutMissionLabels,
  type Mission,
} from '../types'

type Variant = 'default' | 'compact'

interface Props {
  mission: Pick<Mission, 'statut' | 'date_planifiee'>
  variant?: Variant
  className?: string
}

export function MissionStatusBadge({ mission, variant = 'default', className }: Props) {
  const s = getStatutMission(mission)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full text-[11px] font-semibold border',
        variant === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1.5',
        statutMissionColors[s],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statutMissionDotColors[s])} />
      {statutMissionLabels[s]}
    </span>
  )
}
