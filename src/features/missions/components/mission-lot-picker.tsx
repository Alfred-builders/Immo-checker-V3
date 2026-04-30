import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Buildings, MagnifyingGlass, Plus, ArrowsClockwise,
  MapPin, House, Door, SpinnerGap,
} from '@phosphor-icons/react'
import { useBatiments, useBatimentLots, useBatimentDetail, useLotDetail } from 'src/features/patrimoine/api'
import { formatBatimentLabel, formatLotLabel, formatAddressShort } from 'src/features/patrimoine/labels'
import { CreateBuildingModal } from 'src/features/patrimoine/components/create-building-modal'
import { CreateLotModal } from 'src/features/patrimoine/components/create-lot-modal'
import { cn } from 'src/lib/cn'
import type { Batiment, Lot } from 'src/features/patrimoine/types'

interface Props {
  /** Selected lot id (controlled). */
  value: string | null
  onChange: (lotId: string | null) => void
  /** Pre-fill the picker with a known lot — fetches its bâtiment and renders
   * the compact summary as if the user had picked it manually. */
  preselectedLotId?: string
  className?: string
}

/**
 * Picker en 2 étapes pour le formulaire de mission :
 *   1. recherche du bâtiment (par adresse OU nom)
 *   2. choix du lot dans le bâtiment sélectionné
 * Une fois le lot choisi, la zone se réduit à une carte compacte.
 *
 * Les CTA "+ Créer un bâtiment" et "+ Créer un lot" ouvrent les modales
 * dédiées (CreateBuildingModal / CreateLotModal) par-dessus la modale mission.
 */
export function MissionLotPicker({ value, onChange, preselectedLotId, className }: Props) {
  // ── State ──
  const [batimentId, setBatimentId] = useState<string | null>(null)
  const [batimentSnapshot, setBatimentSnapshot] = useState<Batiment | null>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showCreateBatiment, setShowCreateBatiment] = useState(false)
  const [showCreateLot, setShowCreateLot] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Data ──
  const { data: lotDetail } = useLotDetail(value ?? undefined)
  const { data: batimentDetail } = useBatimentDetail(
    batimentId && !batimentSnapshot ? batimentId : undefined,
  )
  const trimmedQuery = query.trim()
  // Recherche serveur quand l'utilisateur tape, sinon les 3 bâtiments les plus
  // récemment créés sont proposés par défaut.
  const { data: batimentsSearchData, isFetching: batimentsLoading } = useBatiments(
    trimmedQuery !== '' ? { search: trimmedQuery } : { limit: 3, sort: 'recent' },
  )
  const batiments: Batiment[] = batimentsSearchData?.data ?? []
  const { data: lots, isFetching: lotsLoading } = useBatimentLots(batimentId ?? undefined)

  const filteredLots = useMemo(() => {
    if (!lots) return []
    const q = query.trim().toLowerCase()
    if (!q) return lots
    return lots.filter((l) => {
      const hay = `${l.designation ?? ''} ${l.type_bien ?? ''} ${l.etage ?? ''} ${l.emplacement_palier ?? ''} ${l.reference_interne ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [lots, query])

  // ── Hydratation depuis preselectedLotId ──
  useEffect(() => {
    if (preselectedLotId && !value) onChange(preselectedLotId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedLotId])

  useEffect(() => {
    if (lotDetail && !batimentId) setBatimentId(lotDetail.batiment_id)
  }, [lotDetail, batimentId])

  // Close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // ── Handlers ──
  function pickBatiment(b: Batiment) {
    setBatimentId(b.id)
    setBatimentSnapshot(b)
    setQuery('')
    setOpen(true)
  }

  function pickLot(l: Lot) {
    onChange(l.id)
    setQuery('')
    setOpen(false)
  }

  function changeBatiment() {
    setBatimentId(null)
    setBatimentSnapshot(null)
    setQuery('')
    setOpen(true)
    onChange(null)
  }

  // ── Derived ──
  const hasLot = !!value && !!lotDetail
  const displayAdresse =
    batimentSnapshot?.adresse_principale ??
    batimentDetail?.adresses?.find((a) => a.type === 'principale') ??
    lotDetail?.batiment?.adresse ??
    null
  const displayBatLabel = batimentSnapshot
    ? formatBatimentLabel(batimentSnapshot)
    : batimentDetail
    ? formatBatimentLabel(batimentDetail)
    : lotDetail?.batiment
    ? formatBatimentLabel(lotDetail.batiment)
    : '—'

  // ─────────────────────────────────────────────
  //  STATE 3 — Lot sélectionné : carte compacte
  // ─────────────────────────────────────────────
  if (hasLot && lotDetail) {
    return (
      <>
        <div
          className={cn(
            'rounded-lg border border-primary/30 bg-primary/[0.04]',
            className,
          )}
        >
          <div className="flex items-start gap-2.5 px-3 py-2.5">
            <Door className="h-4 w-4 text-primary shrink-0 mt-0.5" weight="duotone" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate">
                <span>{formatLotLabel(lotDetail)}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="text-muted-foreground/80">{displayBatLabel}</span>
              </div>
              <div
                className="text-[11px] text-muted-foreground mt-0.5 truncate"
                title={displayAdresse ? `${displayAdresse.rue}, ${displayAdresse.code_postal} ${displayAdresse.ville}` : undefined}
              >
                {[
                  formatAddressShort(displayAdresse, 40),
                  lotDetail.nb_pieces,
                  lotDetail.surface ? `${lotDetail.surface} m²` : null,
                  lotDetail.etage ? `étage ${lotDetail.etage}` : null,
                  lotDetail.meuble ? 'meublé' : null,
                ].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button
              type="button"
              onClick={changeBatiment}
              className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Changer
            </button>
          </div>
        </div>
      </>
    )
  }

  // ─────────────────────────────────────────────
  //  STATES 1 & 2 — recherche bâtiment / lot
  // ─────────────────────────────────────────────
  const isStep2 = !!batimentId

  return (
    <>
      <div ref={containerRef} className={cn('relative', className)}>
        <div
          className={cn(
            'flex items-center gap-2 h-10 rounded-md border border-input bg-card pl-3 pr-2',
            'hover:border-input hover:bg-card', // neutralise tout effet de survol
            open && 'ring-2 ring-primary/15 border-primary/60',
          )}
          onClick={() => setOpen(true)}
        >
          {!isStep2 ? (
            <MagnifyingGlass className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[12px] font-semibold shrink-0">
              <Buildings className="h-3.5 w-3.5" />
              {displayBatLabel}
              {displayAdresse && (
                <span className="text-primary/70 font-normal hidden md:inline">
                  · {displayAdresse.rue}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); changeBatiment() }}
                className="ml-0.5 -mr-0.5 hover:bg-primary/20 rounded p-0.5"
                aria-label="Changer de bâtiment"
              >
                <ArrowsClockwise className="h-3 w-3" />
              </button>
            </span>
          )}
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={
              isStep2
                ? 'Filtrer les lots de ce bâtiment…'
                : 'Tape pour rechercher un bâtiment'
            }
            className="h-9 flex-1 min-w-0 bg-transparent border-0 outline-none px-1 text-sm placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Helper text — guide l'enchaînement bâtiment → lot */}
        <p className="text-[11px] text-muted-foreground mt-1.5 px-0.5">
          {isStep2
            ? 'Étape 2 — choisis un lot dans ce bâtiment (ou crée-en un).'
            : 'Étape 1 — choisis d\'abord un bâtiment, puis un lot.'}
        </p>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-border/40 bg-popover shadow-elevation-overlay overflow-hidden">
            {!isStep2 ? (
              /* ─── search-bat ─── */
              <div className="max-h-[320px] overflow-y-auto">
                <div className="px-3 py-2 flex items-center justify-between bg-sunken/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {trimmedQuery === ''
                      ? `${batiments.length} bâtiment${batiments.length > 1 ? 's' : ''} récent${batiments.length > 1 ? 's' : ''}`
                      : batimentsLoading
                      ? 'Recherche…'
                      : `${batiments.length} bâtiment${batiments.length > 1 ? 's' : ''} trouvé${batiments.length > 1 ? 's' : ''}`}
                  </span>
                  {batimentsLoading && <SpinnerGap className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </div>

                {batiments.length > 0 && (
                  <ul className="divide-y divide-border/30">
                    {batiments.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => pickBatiment(b)}
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                        >
                          {b.type === 'maison' ? (
                            <House className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                          ) : (
                            <Buildings className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-foreground truncate">
                              {formatBatimentLabel(b)}
                            </div>
                            <div
                              className="text-[11px] text-muted-foreground truncate flex items-center gap-1"
                              title={b.adresse_principale ? `${b.adresse_principale.rue}, ${b.adresse_principale.code_postal} ${b.adresse_principale.ville}` : undefined}
                            >
                              <MapPin className="h-3 w-3 inline shrink-0" />
                              {formatAddressShort(b.adresse_principale, 45) ?? 'Sans adresse'}
                              <span className="text-muted-foreground/40">·</span>
                              <span>{b.nb_lots} lot{b.nb_lots > 1 ? 's' : ''}</span>
                              {b.missions_a_venir > 0 && (
                                <>
                                  <span className="text-muted-foreground/40">·</span>
                                  <span>{b.missions_a_venir} mission{b.missions_a_venir > 1 ? 's' : ''} à venir</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {!batimentsLoading && batiments.length === 0 && (
                  <div className="px-3 py-4 text-[12px] text-muted-foreground text-center">
                    {trimmedQuery !== ''
                      ? <>Aucun bâtiment trouvé pour « {trimmedQuery} ».</>
                      : 'Aucun bâtiment encore créé.'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowCreateBatiment(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-dashed border-border/60 bg-surface-sunken/30 hover:bg-accent text-left transition-colors"
                >
                  <Plus className="h-4 w-4 text-primary" weight="bold" />
                  <span className="text-[12.5px] font-semibold text-primary">
                    Créer un nouveau bâtiment{trimmedQuery ? ` (${trimmedQuery})` : ''}
                  </span>
                </button>
              </div>
            ) : (
              /* ─── search-lot ─── */
              <div className="max-h-[320px] overflow-y-auto">
                <div className="px-3 py-2 flex items-center justify-between bg-sunken/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {lotsLoading
                      ? 'Chargement des lots…'
                      : `${filteredLots.length} lot${filteredLots.length > 1 ? 's' : ''} dans ${displayBatLabel}`}
                  </span>
                  {lotsLoading && <SpinnerGap className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </div>

                {!lotsLoading && filteredLots.length > 0 && (
                  <ul className="divide-y divide-border/30">
                    {filteredLots.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => pickLot(l)}
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                        >
                          <Door className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-foreground truncate">
                              {formatLotLabel(l)}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {[
                                l.nb_pieces,
                                l.surface ? `${l.surface} m²` : null,
                                l.etage ? `étage ${l.etage}` : null,
                                l.meuble ? 'meublé' : null,
                              ].filter(Boolean).join(' · ') || 'Aucun détail'}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {!lotsLoading && filteredLots.length === 0 && (
                  <div className="px-3 py-4 text-[12px] text-muted-foreground text-center">
                    {lots && lots.length > 0
                      ? `Aucun lot ne correspond à « ${query.trim()} ».`
                      : 'Ce bâtiment n\'a pas encore de lot.'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowCreateLot(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-dashed border-border/60 bg-surface-sunken/30 hover:bg-accent text-left transition-colors"
                >
                  <Plus className="h-4 w-4 text-primary" weight="bold" />
                  <span className="text-[12.5px] font-semibold text-primary">
                    Créer un lot dans {displayBatLabel}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sous-modale : création bâtiment */}
      <CreateBuildingModal
        open={showCreateBatiment}
        onOpenChange={setShowCreateBatiment}
        initialQuery={query.trim() || undefined}
        onCreated={(id) => {
          setShowCreateBatiment(false)
          setBatimentId(id)
          setBatimentSnapshot(null) // batimentDetail prendra le relais
          setQuery('')
          setOpen(true)
        }}
        onMaisonCreated={(id) => {
          setShowCreateBatiment(false)
          setBatimentId(id)
          setBatimentSnapshot(null)
          setQuery('')
          setOpen(true)
        }}
      />

      {/* Sous-modale : création lot dans le bâtiment courant */}
      {batimentId && (
        <CreateLotModal
          open={showCreateLot}
          onOpenChange={setShowCreateLot}
          preselectedBatimentId={batimentId}
          onCreated={(lotId) => {
            setShowCreateLot(false)
            onChange(lotId)
            setOpen(false)
          }}
        />
      )}
    </>
  )
}
