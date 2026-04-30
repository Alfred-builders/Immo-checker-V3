import type { Icon } from '@phosphor-icons/react'
import {
  CalendarBlank,
  CheckCircle,
  ChartBar,
  Clock,
  FileText,
  Key,
  ListChecks,
  UsersThree,
  Warning,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react'
import type { DashboardStats } from './api'

export type MetricColor = 'default' | 'amber' | 'sky' | 'emerald' | 'red' | 'violet'

export interface MetricDef {
  id: string
  label: string
  description: string
  icon: Icon
  color: MetricColor
  group: 'missions' | 'edl' | 'operations'
  /**
   * Reads the displayable value from the stats payload.
   * Returns string for percentages (e.g. "72 %"), number otherwise.
   */
  getValue: (s: DashboardStats | undefined) => number | string
  footerText: string
  tag: string
  /** True when clicking opens an existing detail sheet on the dashboard. */
  hasSheet?: boolean
}

export const METRIC_CATALOG: MetricDef[] = [
  // ── Missions
  {
    id: 'edl_month',
    label: 'EDL du mois',
    description: 'Nombre d\'EDL et inventaires créés ce mois.',
    icon: FileText,
    color: 'default',
    group: 'edl',
    getValue: (s) => s?.edl_month ?? 0,
    footerText: 'Entrées + sorties',
    tag: 'ce mois',
    hasSheet: true,
  },
  {
    id: 'pending_actions',
    label: 'Actions en attente',
    description: 'Missions sans date confirmée, sans technicien ou en attente d\'acceptation.',
    icon: WarningCircle,
    color: 'amber',
    group: 'missions',
    getValue: (s) => s?.pending_actions ?? 0,
    footerText: 'À traiter',
    tag: 'urgent',
    hasSheet: true,
  },
  {
    id: 'upcoming_7d',
    label: 'À venir (7 jours)',
    description: 'Missions planifiées dans les 7 prochains jours.',
    icon: CalendarBlank,
    color: 'sky',
    group: 'missions',
    getValue: (s) => s?.upcoming_7d ?? 0,
    footerText: 'Planifiées',
    tag: 'cette semaine',
    hasSheet: true,
  },
  {
    id: 'today',
    label: 'Missions aujourd\'hui',
    description: 'Missions planifiées sur la journée en cours.',
    icon: Clock,
    color: 'sky',
    group: 'missions',
    getValue: (s) => s?.today ?? 0,
    footerText: 'Du jour',
    tag: 'aujourd\'hui',
  },
  {
    id: 'completed_month',
    label: 'Terminées ce mois',
    description: 'Missions clôturées (tous EDL signés) ce mois.',
    icon: CheckCircle,
    color: 'emerald',
    group: 'missions',
    getValue: (s) => s?.completed_month ?? 0,
    footerText: 'Clôturées',
    tag: 'ce mois',
  },
  {
    id: 'total_month',
    label: 'Total missions ce mois',
    description: 'Missions planifiées ou terminées ce mois (hors annulées).',
    icon: ListChecks,
    color: 'default',
    group: 'missions',
    getValue: (s) => s?.total_month ?? 0,
    footerText: 'Volume mensuel',
    tag: 'ce mois',
  },
  {
    id: 'overdue',
    label: 'Missions en retard',
    description: 'Missions encore planifiées dont la date est passée.',
    icon: Warning,
    color: 'red',
    group: 'missions',
    getValue: (s) => s?.overdue ?? 0,
    footerText: 'À replanifier',
    tag: 'en retard',
  },
  {
    id: 'cancelled_month',
    label: 'Annulées ce mois',
    description: 'Missions annulées ce mois (toutes raisons confondues).',
    icon: XCircle,
    color: 'red',
    group: 'missions',
    getValue: (s) => s?.cancelled_month ?? 0,
    footerText: 'Annulées',
    tag: 'ce mois',
  },
  // ── EDL
  {
    id: 'edl_signed_month',
    label: 'EDL signés ce mois',
    description: 'Documents légaux signés par les parties ce mois.',
    icon: ChartBar,
    color: 'emerald',
    group: 'edl',
    getValue: (s) => s?.edl_signed_month ?? 0,
    footerText: 'Documents légaux',
    tag: 'ce mois',
  },
  // ── Opérations
  {
    id: 'keys_pending',
    label: 'Clés à récupérer',
    description: 'Clés laissées en dépôt et pas encore récupérées.',
    icon: Key,
    color: 'amber',
    group: 'operations',
    getValue: (s) => s?.keys_pending ?? 0,
    footerText: 'En dépôt',
    tag: 'à traiter',
  },
  {
    id: 'active_technicians',
    label: 'Techniciens actifs (7 j)',
    description: 'Techniciens ayant accepté une mission cette semaine.',
    icon: UsersThree,
    color: 'sky',
    group: 'operations',
    getValue: (s) => s?.active_technicians ?? 0,
    footerText: 'Cette semaine',
    tag: 'équipe',
  },
]

export const METRIC_BY_ID: Record<string, MetricDef> = Object.fromEntries(
  METRIC_CATALOG.map((m) => [m.id, m]),
)

export const DEFAULT_METRICS: string[] = ['edl_month', 'pending_actions', 'upcoming_7d']

export const MAX_METRICS = 6

export const METRIC_GROUPS: { id: MetricDef['group']; label: string }[] = [
  { id: 'missions', label: 'Missions' },
  { id: 'edl', label: 'EDL & inventaires' },
  { id: 'operations', label: 'Opérations' },
]
