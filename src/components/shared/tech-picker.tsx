import { useState } from 'react'
import { Check, MagnifyingGlass, UserPlus, User, WarningCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command'
import { Button } from 'src/components/ui/button'
import { api } from 'src/lib/api-client'
import type { TechnicianConflicts } from 'src/features/missions/types'

interface Technician {
  id: string
  nom: string
  prenom: string
  email?: string
}

interface Props {
  technicians: Technician[]
  value?: string
  onSelect: (id: string) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'default'
  /** If provided, surfaces US-827 conflict hints (mission/indispo) for that date. */
  date?: string
  /** Créneau de la mission en cours de création/édition — sert à calculer si
   * le technicien est libre sur le créneau précis (voyant dispo). */
  heureDebut?: string
  heureFin?: string
  /** Mission being reassigned — its own technician assignment does not count as a conflict. */
  excludeMissionId?: string
}

const TYPE_BIEN_SHORT: Record<string, string> = {
  appartement: 'Appart.',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local',
  parking: 'Parking',
  cave: 'Cave',
  autre: 'Lot',
}

function toMin(t: string | null | undefined): number | null {
  if (!t) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(t)
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

function getAvatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type TechAvailability = {
  /**
   * indispo : marqué indisponible ce jour
   * busy    : a une mission qui chevauche le créneau saisi
   * mission : a au moins 1 mission le jour mais pas de chevauchement (ou créneau pas saisi)
   * free    : libre toute la journée
   * unknown : data pas encore chargée / pas de date fournie
   */
  variant: 'indispo' | 'busy' | 'mission' | 'free' | 'unknown'
  /** Nombre de missions du tech à la date considérée (excluant excludeMissionId). */
  missionsCount: number
  /** Détails des missions à afficher au survol / dans le détail. */
  missions: TechnicianConflicts['missions']
  /** Libellé court pour la pill (ex : "2 missions", "Indisponible", "Libre"). */
  label: string
}

/** US-827: fan-out conflict check for all technicians on a given date. */
function useAllTechConflicts(
  technicians: Technician[],
  date: string | undefined,
  excludeMissionId: string | undefined,
  heureDebut: string | undefined,
  heureFin: string | undefined,
) {
  const results = useQueries({
    queries: technicians.map(t => ({
      queryKey: ['tech-conflicts', t.id, date],
      queryFn: () => api<TechnicianConflicts>(`/technicians/${t.id}/conflicts?date=${date}`),
      enabled: !!date,
      staleTime: 30_000,
    })),
  })

  const slotStart = toMin(heureDebut)
  const slotEnd = toMin(heureFin) ?? (slotStart !== null ? slotStart + 60 : null) // défaut 1 h si fin pas fournie

  const map = new Map<string, TechAvailability>()
  technicians.forEach((t, i) => {
    const c = results[i]?.data
    if (!c) { map.set(t.id, { variant: 'unknown', missionsCount: 0, missions: [], label: '' }); return }
    if (c.indisponibilites.length > 0) {
      map.set(t.id, { variant: 'indispo', missionsCount: 0, missions: [], label: 'Indisponible' })
      return
    }
    const missions = excludeMissionId
      ? c.missions.filter(m => m.id !== excludeMissionId)
      : c.missions
    if (missions.length === 0) {
      map.set(t.id, { variant: 'free', missionsCount: 0, missions, label: 'Libre' })
      return
    }
    // Voyant créneau : si slot connu et qu'il chevauche au moins une mission → 'busy'
    let slotConflict = false
    if (slotStart !== null && slotEnd !== null) {
      slotConflict = missions.some(m => {
        const s = toMin(m.heure_debut)
        const e = toMin(m.heure_fin) ?? (s !== null ? s + 60 : null)
        if (s === null || e === null) return false
        return overlaps(slotStart, slotEnd, s, e)
      })
    }
    map.set(t.id, {
      variant: slotConflict ? 'busy' : 'mission',
      missionsCount: missions.length,
      missions,
      label: `${missions.length} mission${missions.length > 1 ? 's' : ''}`,
    } as TechAvailability)
  })
  return map
}

export function TechPicker({
  technicians, value, onSelect, placeholder = 'Technicien...', className, size = 'default',
  date, heureDebut, heureFin, excludeMissionId,
}: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const selected = technicians.find(t => t.id === value)
  const displayName = selected ? `${selected.prenom} ${selected.nom}` : null
  const conflicts = useAllTechConflicts(technicians, date, excludeMissionId, heureDebut, heureFin)

  return (
    // modal={true} : nécessaire quand le picker est utilisé à l'intérieur d'un Sheet/Dialog
    // Radix (drawer mission). Sinon le pointer-events: none posé par le Dialog bloque
    // les clics et le focus sur le contenu du Popover, et la recherche ne fonctionne pas.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between font-normal ${size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'} ${className || ''}`}
        >
          {displayName ? (
            <span className="flex items-center gap-2 truncate">
              <div className={`h-5 w-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${getAvatarColor(selected!.id)}`}>
                {selected!.prenom[0]}{selected!.nom[0]}
              </div>
              {displayName}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <MagnifyingGlass className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 shadow-elevation-overlay z-[60]" align="start">
        <Command className="bg-transparent">
          <div className="px-2 pt-2 pb-1">
            <CommandInput placeholder="Rechercher..." className="h-8 text-sm rounded-lg" />
          </div>
          <CommandList className="max-h-[240px]">
            <CommandEmpty className="py-6 text-center">
              <User className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
              <span className="text-xs text-muted-foreground/50">Aucun technicien trouvé</span>
            </CommandEmpty>
            <CommandGroup className="px-1 pb-1">
              {technicians.map(t => {
                const isSelected = value === t.id
                const initials = `${t.prenom[0]}${t.nom[0]}`.toUpperCase()
                const colorClass = getAvatarColor(t.id)
                const av = conflicts.get(t.id)
                const dimmed = av?.variant === 'indispo'
                // Voyant : couleur du dot selon dispo
                const dotClass =
                  av?.variant === 'indispo' ? 'bg-muted-foreground/40' :
                  av?.variant === 'busy'    ? 'bg-rose-500' :
                  av?.variant === 'mission' ? 'bg-amber-500' :
                  av?.variant === 'free'    ? 'bg-emerald-500' : 'bg-transparent'
                const pillClass =
                  av?.variant === 'indispo' ? 'bg-muted/60 text-muted-foreground' :
                  av?.variant === 'busy'    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  av?.variant === 'mission' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  av?.variant === 'free'    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : ''
                return (
                  <CommandItem
                    key={t.id}
                    value={`${t.prenom} ${t.nom} ${t.email || ''}`}
                    onSelect={() => { onSelect(t.id); setOpen(false) }}
                    className={`flex flex-col items-stretch gap-1 px-2 py-2 rounded-lg cursor-pointer ${isSelected ? 'bg-primary/5' : ''} ${dimmed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="relative shrink-0">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${colorClass}`}>
                          {initials}
                        </div>
                        {av && av.variant !== 'unknown' && (
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-popover ${dotClass}`} aria-hidden />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{t.prenom} {t.nom}</div>
                        {t.email && <div className="text-[11px] text-muted-foreground/50 truncate">{t.email}</div>}
                      </div>
                      {av && av.variant !== 'unknown' && (
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold shrink-0 flex items-center gap-0.5 ${pillClass}`}>
                          {av.variant === 'busy' && <WarningCircle className="h-2.5 w-2.5" weight="fill" />}
                          {av.label}
                        </span>
                      )}
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" weight="bold" />}
                    </div>
                    {/* Détails missions du jour — uniquement si on a des missions à montrer */}
                    {av && av.missions.length > 0 && (
                      <ul className="pl-9 pr-1 space-y-0.5">
                        {av.missions.map(m => {
                          const creneau = m.heure_debut
                            ? `${m.heure_debut.slice(0, 5)}${m.heure_fin ? `–${m.heure_fin.slice(0, 5)}` : ''}`
                            : '—'
                          const typeShort = m.lot?.type_bien ? (TYPE_BIEN_SHORT[m.lot.type_bien] ?? m.lot.type_bien) : null
                          const lotMeta = [
                            typeShort,
                            m.lot?.nb_pieces,
                            m.lot?.meuble === true ? 'meublé' : m.lot?.meuble === false ? 'vide' : null,
                          ].filter(Boolean).join(' · ')
                          return (
                            <li key={m.id} className="text-[11px] text-muted-foreground/80 flex items-baseline gap-1.5 leading-tight">
                              <span className="font-mono font-semibold tabular-nums shrink-0">{creneau}</span>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="truncate">{lotMeta || m.lot?.designation || m.reference}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          <div className="border-t border-border/30 p-1">
            <CommandItem
              value="__invite__"
              onSelect={() => { setOpen(false); navigate('/app/parametres?tab=users') }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer text-primary"
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[13px] font-medium">Inviter un technicien</span>
            </CommandItem>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
