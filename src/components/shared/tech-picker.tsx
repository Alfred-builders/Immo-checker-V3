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
  /** Mission being reassigned — its own technician assignment does not count as a conflict. */
  excludeMissionId?: string
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

/** US-827: fan-out conflict check for all technicians on a given date. */
function useAllTechConflicts(
  technicians: Technician[],
  date: string | undefined,
  excludeMissionId: string | undefined
) {
  const results = useQueries({
    queries: technicians.map(t => ({
      queryKey: ['tech-conflicts', t.id, date],
      queryFn: () => api<TechnicianConflicts>(`/technicians/${t.id}/conflicts?date=${date}`),
      enabled: !!date,
      staleTime: 30_000,
    })),
  })

  const map = new Map<string, { label: string; variant: 'indispo' | 'mission' } | null>()
  technicians.forEach((t, i) => {
    const c = results[i]?.data
    if (!c) { map.set(t.id, null); return }
    if (c.indisponibilites.length > 0) {
      map.set(t.id, { label: 'Indisponible', variant: 'indispo' })
      return
    }
    // Exclude the current mission from the conflict count when reassigning
    const missions = excludeMissionId
      ? c.missions.filter(m => m.id !== excludeMissionId)
      : c.missions
    if (missions.length > 0) {
      map.set(t.id, { label: 'Déjà en mission', variant: 'mission' })
      return
    }
    map.set(t.id, null)
  })
  return map
}

export function TechPicker({
  technicians, value, onSelect, placeholder = 'Technicien...', className, size = 'default',
  date, excludeMissionId,
}: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const selected = technicians.find(t => t.id === value)
  const displayName = selected ? `${selected.prenom} ${selected.nom}` : null
  const conflicts = useAllTechConflicts(technicians, date, excludeMissionId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between font-normal ${size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'} ${className || ''}`}
        >
          {displayName ? (
            <span className="flex items-center gap-2 truncate">
              <div className={`h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${getAvatarColor(selected!.id)}`}>
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
      <PopoverContent className="w-[280px] p-0 shadow-elevation-overlay" align="start">
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
                const conflict = conflicts.get(t.id)
                const dimmed = conflict?.variant === 'indispo'
                return (
                  <CommandItem
                    key={t.id}
                    value={`${t.prenom} ${t.nom} ${t.email || ''}`}
                    onSelect={() => { onSelect(t.id); setOpen(false) }}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isSelected ? 'bg-primary/5' : ''} ${dimmed ? 'opacity-60' : ''}`}
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{t.prenom} {t.nom}</div>
                      {t.email && <div className="text-[10px] text-muted-foreground/50 truncate">{t.email}</div>}
                    </div>
                    {conflict && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 flex items-center gap-0.5 ${
                        conflict.variant === 'mission'
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-muted/60 text-muted-foreground'
                      }`}>
                        {conflict.variant === 'mission' && <WarningCircle className="h-2.5 w-2.5" weight="fill" />}
                        {conflict.label}
                      </span>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" weight="bold" />}
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
