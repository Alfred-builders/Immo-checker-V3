import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BuildingOffice, Door, UsersThree, ClipboardText,
  MagnifyingGlass, ArrowRight, SpinnerGap,
} from '@phosphor-icons/react'
import { Command as CommandPrimitive } from 'cmdk'
import { Popover, PopoverAnchor, PopoverContent } from 'src/components/ui/popover'
import {
  Command, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from 'src/components/ui/command'
import { formatDate } from 'src/lib/formatters'
import { useDebounce } from 'src/hooks/use-debounce'
import { useGlobalSearch } from '../api'
import type {
  SearchBatimentResult, SearchLotResult, SearchTiersResult, SearchMissionResult,
} from '../types'

const TYPE_BIEN_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local',
  parking: 'Parking',
  cave: 'Cave',
  autre: 'Autre',
}

const STATUT_COLORS: Record<string, string> = {
  planifiee: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiée',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

export function GlobalSearchBar() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [mac, setMac] = useState(false)
  const debounced = useDebounce(query, 300)
  const { data, isFetching } = useGlobalSearch(debounced)

  useEffect(() => { setMac(isMac()) }, [])

  // Global Cmd/Ctrl+K — focus the input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function go(path: string) {
    setQuery('')
    inputRef.current?.blur()
    navigate(path)
  }

  const trimmed = query.trim()
  const showResults = trimmed.length > 0
  const hasQuery = trimmed.length >= 1
  const results = data?.results
  const hasMore = data?.meta.has_more
  const isEmpty = hasQuery && !!results &&
    results.batiments.length === 0 &&
    results.lots.length === 0 &&
    results.tiers.length === 0 &&
    results.missions.length === 0

  return (
    <Command
      shouldFilter={false}
      className="bg-transparent overflow-visible [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5"
    >
      <Popover
        open={showResults}
        onOpenChange={(v) => {
          if (!v) { setQuery(''); inputRef.current?.blur() }
        }}
      >
        <PopoverAnchor asChild>
          <div
            onClick={() => inputRef.current?.focus()}
            style={{ width: showResults ? 480 : 300 }}
            className="flex items-center gap-2 h-8 px-2.5 rounded-lg bg-card border border-border/60 hover:border-border/80 transition-[width,border-color,box-shadow] duration-200 ease-out cursor-text focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 max-w-[calc(100vw-8rem)]"
          >
            <MagnifyingGlass className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            <CommandPrimitive.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Rechercher..."
              className="flex-1 min-w-0 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/60 outline-none border-0 h-full"
            />
            {isFetching && hasQuery ? (
              <SpinnerGap className="h-3.5 w-3.5 text-muted-foreground/50 animate-spin shrink-0" />
            ) : (
              <kbd className="inline-flex items-center gap-0.5 px-1.5 h-5 rounded bg-muted/60 border border-border/40 text-[10px] font-semibold text-muted-foreground/70 shrink-0">
                {mac ? '⌘' : 'Ctrl'}<span>K</span>
              </kbd>
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="end"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement | null
            if (target?.closest('[data-slot="popover-anchor"]')) e.preventDefault()
          }}
          className="p-0 w-[480px] max-w-[calc(100vw-2rem)]"
        >
          <CommandList className="max-h-[420px]">
            {hasQuery && isEmpty && (
              <CommandEmpty>Aucun résultat pour "{debounced}"</CommandEmpty>
            )}

            {results && results.batiments.length > 0 && (
              <CommandGroup heading="Bâtiments">
                {results.batiments.map((b) => (
                  <BatimentRow key={b.id} item={b} onSelect={() => go(`/app/patrimoine/batiments/${b.id}`)} />
                ))}
                {hasMore?.batiments && (
                  <SeeAllRow label="Voir tous les bâtiments" onSelect={() => go(`/app/patrimoine?search=${encodeURIComponent(debounced)}`)} />
                )}
              </CommandGroup>
            )}

            {results && results.lots.length > 0 && (
              <CommandGroup heading="Lots">
                {results.lots.map((l) => (
                  <LotRow key={l.id} item={l} onSelect={() => go(`/app/patrimoine/lots/${l.id}`)} />
                ))}
                {hasMore?.lots && (
                  <SeeAllRow label="Voir tous les lots" onSelect={() => go(`/app/patrimoine?search=${encodeURIComponent(debounced)}`)} />
                )}
              </CommandGroup>
            )}

            {results && results.tiers.length > 0 && (
              <CommandGroup heading="Tiers">
                {results.tiers.map((t) => (
                  <TiersRow key={t.id} item={t} onSelect={() => go(`/app/tiers/${t.id}`)} />
                ))}
                {hasMore?.tiers && (
                  <SeeAllRow label="Voir tous les tiers" onSelect={() => go(`/app/tiers?search=${encodeURIComponent(debounced)}`)} />
                )}
              </CommandGroup>
            )}

            {results && results.missions.length > 0 && (
              <CommandGroup heading="Missions">
                {results.missions.map((m) => (
                  <MissionRow key={m.id} item={m} onSelect={() => go(`/app/missions/${m.id}`)} />
                ))}
                {hasMore?.missions && (
                  <SeeAllRow label="Voir toutes les missions" onSelect={() => go(`/app/missions?search=${encodeURIComponent(debounced)}`)} />
                )}
              </CommandGroup>
            )}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  )
}

/* ── Row components ── */

function BatimentRow({ item, onSelect }: { item: SearchBatimentResult; onSelect: () => void }) {
  return (
    <CommandItem value={`batiment-${item.id}`} onSelect={onSelect} className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
        <BuildingOffice className="h-4 w-4 text-slate-500 dark:text-slate-400" weight="duotone" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{item.designation}</p>
        {item.adresse && <p className="text-[11px] text-muted-foreground truncate">{item.adresse}</p>}
      </div>
      <span className="text-[10px] text-muted-foreground/60 font-medium shrink-0">{item.nb_lots} lot{item.nb_lots > 1 ? 's' : ''}</span>
    </CommandItem>
  )
}

function LotRow({ item, onSelect }: { item: SearchLotResult; onSelect: () => void }) {
  const typeLabel = TYPE_BIEN_LABELS[item.type_bien] || item.type_bien
  return (
    <CommandItem value={`lot-${item.id}`} onSelect={onSelect} className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
        <Door className="h-4 w-4 text-blue-600 dark:text-blue-400" weight="duotone" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{item.designation}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {item.batiment_designation}{item.etage ? ` · ${item.etage}` : ''}
        </p>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium shrink-0">{typeLabel}</span>
    </CommandItem>
  )
}

function TiersRow({ item, onSelect }: { item: SearchTiersResult; onSelect: () => void }) {
  const displayName = item.type_personne === 'morale'
    ? (item.raison_sociale || item.nom)
    : (item.prenom ? `${item.prenom} ${item.nom}` : item.nom)
  return (
    <CommandItem value={`tiers-${item.id}`} onSelect={onSelect} className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center shrink-0">
        <UsersThree className="h-4 w-4 text-violet-600 dark:text-violet-400" weight="duotone" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{displayName}</p>
        {item.email && <p className="text-[11px] text-muted-foreground truncate">{item.email}</p>}
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium shrink-0">
        {item.type_personne === 'morale' ? 'PM' : 'PP'}
      </span>
    </CommandItem>
  )
}

function MissionRow({ item, onSelect }: { item: SearchMissionResult; onSelect: () => void }) {
  const statutColor = STATUT_COLORS[item.statut] || 'bg-muted/60 text-muted-foreground'
  const statutLabel = STATUT_LABELS[item.statut] || item.statut
  return (
    <CommandItem value={`mission-${item.id}`} onSelect={onSelect} className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
        <ClipboardText className="h-4 w-4 text-amber-600 dark:text-amber-400" weight="duotone" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground font-mono truncate">{item.reference}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {item.lot_designation}{item.date_planifiee ? ` · ${formatDate(item.date_planifiee)}` : ''}
        </p>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${statutColor}`}>{statutLabel}</span>
    </CommandItem>
  )
}

function SeeAllRow({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <CommandItem value={`see-all-${label}`} onSelect={onSelect} className="flex items-center gap-2 text-primary">
      <ArrowRight className="h-3.5 w-3.5" />
      <span className="text-[12px] font-medium">{label}</span>
    </CommandItem>
  )
}
